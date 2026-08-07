import { Check, ChevronLeft, FileBox, Mail, MapPin, ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import OrderCustomerFields, { emptyCustomerDetails } from '../components/OrderCustomerFields'
import '../components/OrderCustomerFields.css'
import { clearPrintCart } from '../lib/printCart'
import type { PrintCartItem } from '../lib/printCart'

type QuoteData = { fileName: string; price: number; material: string; color: string; infill: number; quality: number; estimatedVolume: number }
type OrderState = { modelFile?: File; quote?: QuoteData; cartItems?: PrintCartItem[] }

export default function PrintOrder() {
  const { state } = useLocation()
  const [searchParams] = useSearchParams()
  const order = state as OrderState | null
  const legacyItem = order?.quote && order.modelFile ? [{ ...order.quote, file: order.modelFile, quantity: 1 }] : []
  const items = order?.cartItems?.length ? order.cartItems : legacyItem
  const [destination, setDestination] = useState('north')
  const [rural, setRural] = useState(false)
  const [customer, setCustomer] = useState(emptyCustomerDetails)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string>()
  const [confirmation, setConfirmation] = useState<'sending' | 'sent' | 'error'>()
  const pickup = destination === 'pickup'
  const shipping = ({ pickup: 0, north: 15, south: 15, australia: 30 } as Record<string, number>)[destination] + (!pickup && destination !== 'australia' && rural ? 6 : 0)
  const printTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = printTotal + shipping

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (searchParams.get('payment') !== 'success' || !sessionId) return
    setConfirmation('sending')
    fetch('/api/stripe-checkout?action=confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) })
      .then(response => { if (!response.ok) throw new Error(); setConfirmation('sent'); return clearPrintCart() })
      .catch(() => setConfirmation('error'))
  }, [searchParams])

  async function checkout(event: FormEvent) {
    event.preventDefault()
    if (!items.length || working) return
    setWorking(true); setError(undefined)
    try {
      const data = new FormData()
      data.set('destination', destination); data.set('rural', String(rural)); data.set('customer', JSON.stringify(customer))
      data.set('items', JSON.stringify(items.map(item => ({ fileName: item.fileName, price: item.price, material: item.material, color: item.color, infill: item.infill, quality: item.quality, estimatedVolume: item.estimatedVolume, quantity: item.quantity }))))
      items.forEach(item => data.append('models', item.file))
      const response = await fetch('/api/stripe-checkout?action=print', { method: 'POST', body: data })
      const result = await response.json() as { url?: string; error?: string }
      if (!response.ok || !result.url) throw new Error(result.error || 'Unable to start secure checkout.')
      window.location.assign(result.url)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to start secure checkout.'); setWorking(false) }
  }

  return <main className="min-h-screen bg-off-white pt-28 pb-20">
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {searchParams.get('payment') === 'success' && <div className="mb-8 rounded-2xl border border-forest/20 bg-white p-6 text-center text-forest-dark"><Check className="inline mr-2 text-forest" /><strong>Payment received.</strong> Your order is now with KiwiKoru 3D. {confirmation === 'sent' ? 'We emailed your confirmation and will email again when it is ready to dispatch.' : confirmation === 'sending' ? 'Preparing your confirmation email…' : confirmation === 'error' ? 'Please keep your Stripe receipt; we’ll contact you shortly.' : ''}</div>}
      {searchParams.get('payment') === 'cancelled' && <div className="mb-8 rounded-2xl bg-white p-5 text-center text-forest-dark">Your order wasn’t charged. You can return to the quote and try again whenever you’re ready.</div>}
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-gold"><ChevronLeft size={17}/> Back to your cart</Link>
      <header className="mt-7 mb-9 max-w-2xl"><span className="text-xs font-bold tracking-[.18em] text-gold uppercase">Secure KiwiKoru checkout</span><h1 className="mt-3 text-4xl md:text-5xl font-semibold text-forest-dark">Complete your 3D print order</h1><p className="mt-4 text-forest/70">Confirm the design details, delivery address and final total. For design changes or a more complex project, use our contact form before paying.</p><Link to="/contact" className="inline-flex mt-3 font-semibold text-forest underline">Discuss the design first</Link></header>
      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <form id="print-order-form" onSubmit={checkout} className="bg-white rounded-3xl border border-gray-200 p-6 md:p-9 shadow-sm">
          <div className="pb-6 border-b"><div className="flex gap-3 items-center"><FileBox className="text-gold"/><h2 className="text-xl font-semibold text-forest-dark">{items.length ? `${items.length} configured ${items.length === 1 ? 'model' : 'models'}` : 'Your 3D models'}</h2></div>{items.length ? <div className="mt-4 grid gap-2">{items.map((item, index) => <div key={`${item.fileName}-${index}`} className="flex justify-between gap-4 rounded-xl bg-off-white p-3 text-sm"><span className="min-w-0 truncate text-forest-dark"><strong>{item.quantity}×</strong> {item.fileName}<small className="ml-2 text-forest/55">{item.material} · {item.color}</small></span><strong className="shrink-0 text-forest-dark">NZ${(item.price * item.quantity).toFixed(2)}</strong></div>)}</div> : <p className="text-sm text-red-700 mt-2">Return to the cart and add at least one model to continue.</p>}</div>
          <OrderCustomerFields value={customer} onChange={setCustomer} pickup={pickup} />
          <label className="block text-xs font-bold text-forest-dark mb-2">Delivery destination</label>
          <button type="button" onClick={() => { setDestination(pickup ? 'north' : 'pickup'); setRural(false) }} className={`mb-3 flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${pickup ? 'border-forest bg-forest/5' : 'border-gray-200 bg-white hover:border-forest/50'}`}><MapPin className="text-forest" size={22}/><span className="flex-1"><strong className="block text-sm text-forest-dark">Pick up in person</strong><small className="text-forest/60">Morningside, Whangārei — no delivery charge</small></span><b className="text-sm text-forest">{pickup ? 'Selected' : 'Free'}</b></button>
          <select className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-forest-dark" value={destination} onChange={e => setDestination(e.target.value)}><option value="pickup">Pick up in person — Morningside, Whangārei (Free)</option><option value="north">New Zealand — North Island</option><option value="south">New Zealand — South Island</option><option value="australia">Australia</option></select>
          {!pickup && destination !== 'australia' && <label className="mt-3 flex items-center gap-3 rounded-xl bg-off-white p-3 text-sm text-forest-dark"><input type="checkbox" className="accent-forest" checked={rural} onChange={e => setRural(e.target.checked)}/><span className="flex-1">Rural delivery</span><strong>+ NZ$6.00</strong></label>}
          <button disabled={!items.length || working} className="mt-7 w-full rounded-xl bg-gold py-4 font-bold text-forest-dark shadow-md transition hover:bg-gold-light hover:-translate-y-0.5 disabled:opacity-40">{working ? 'Opening secure checkout…' : `Pay NZ$${total.toFixed(2)} securely`}</button>
          {error && <p role="alert" className="mt-3 text-center text-sm font-semibold text-red-700">{error}</p>}
          <p className="mt-3 text-center text-xs text-forest/50"><ShieldCheck size={14} className="inline mr-1"/>Secure payment powered by Stripe.</p>
        </form>
        <aside className="bg-forest-dark text-white rounded-3xl p-7 shadow-xl lg:sticky lg:top-24"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><FileBox className="text-gold" size={22}/></span><div><small className="text-gold-light font-bold tracking-wider">YOUR ORDER</small><h2 className="text-2xl font-semibold">Order summary</h2></div></div><div className="mt-7 space-y-4 text-sm"><div className="flex justify-between gap-4"><span className="text-white/65">{items.reduce((sum, item) => sum + item.quantity, 0)} printed units</span><strong>NZ${printTotal.toFixed(2)}</strong></div><div className="flex justify-between gap-4"><span className="text-white/65">{pickup ? 'Pick up' : 'Delivery'}</span><strong>{pickup ? 'Free' : `NZ$${shipping.toFixed(2)}`}</strong></div><div className="flex justify-between border-t border-white/15 pt-5 text-xl"><span>Total</span><strong className="text-gold-light">NZ${total.toFixed(2)}</strong></div></div><button type="submit" form="print-order-form" disabled={!items.length || working} className="mt-6 w-full rounded-xl bg-gold py-3.5 font-bold text-forest-dark shadow-md transition hover:bg-gold-light hover:-translate-y-0.5 disabled:opacity-40">{working ? 'Opening checkout…' : 'Buy all securely'}</button><div className="mt-7 space-y-4 text-xs text-white/65"><p className="flex gap-3"><Truck size={18} className="shrink-0 text-gold-light"/>Pick up in Morningside is free. Delivery: NZ North or South Island NZ$15, Australia NZ$30, rural NZ surcharge NZ$6.</p><p className="flex gap-3"><Mail size={18} className="shrink-0 text-gold-light"/>You’ll receive confirmation after payment and another email when your order is ready to dispatch or collect.</p><p className="flex gap-3"><MapPin size={18} className="shrink-0 text-gold-light"/>{pickup ? 'We’ll provide collection details when your order is ready.' : 'Your address and contact details travel securely with the paid order.'}</p></div><p className="mt-6 border-t border-white/10 pt-4 text-center text-[11px] text-white/45"><ShieldCheck size={13} className="inline mr-1"/>Payment protected by Stripe</p></aside>
      </div>
    </div>
  </main>
}
