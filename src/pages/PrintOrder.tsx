import { Check, ChevronLeft, FileBox, Mail, MapPin, ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import OrderCustomerFields, { emptyCustomerDetails } from '../components/OrderCustomerFields'
import '../components/OrderCustomerFields.css'

type QuoteData = { fileName: string; price: number; material: string; color: string; infill: number; quality: number; estimatedVolume: number }
type OrderState = { modelFile?: File; quote?: QuoteData }

export default function PrintOrder() {
  const { state } = useLocation()
  const [searchParams] = useSearchParams()
  const order = state as OrderState | null
  const quote = order?.quote
  const [destination, setDestination] = useState('north')
  const [rural, setRural] = useState(false)
  const [customer, setCustomer] = useState(emptyCustomerDetails)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string>()
  const [confirmation, setConfirmation] = useState<'sending' | 'sent' | 'error'>()
  const pickup = destination === 'pickup'
  const shipping = ({ pickup: 0, north: 15, south: 15, australia: 30 } as Record<string, number>)[destination] + (!pickup && destination !== 'australia' && rural ? 6 : 0)
  const total = (quote?.price || 0) + shipping

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (searchParams.get('payment') !== 'success' || !sessionId) return
    setConfirmation('sending')
    fetch('/api/stripe-checkout?action=confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) })
      .then(response => { if (!response.ok) throw new Error(); setConfirmation('sent') })
      .catch(() => setConfirmation('error'))
  }, [searchParams])

  async function checkout(event: FormEvent) {
    event.preventDefault()
    if (!quote || !order?.modelFile || working) return
    setWorking(true); setError(undefined)
    try {
      const data = new FormData()
      data.set('destination', destination); data.set('rural', String(rural)); data.set('customer', JSON.stringify(customer)); data.set('quote', JSON.stringify(quote)); data.set('model', order.modelFile)
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
      <Link to="/quote" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-gold"><ChevronLeft size={17}/> Back to your quote</Link>
      <header className="mt-7 mb-9 max-w-2xl"><span className="text-xs font-bold tracking-[.18em] text-gold uppercase">Secure KiwiKoru checkout</span><h1 className="mt-3 text-4xl md:text-5xl font-semibold text-forest-dark">Complete your 3D print order</h1><p className="mt-4 text-forest/70">Confirm the design details, delivery address and final total. For design changes or a more complex project, use our contact form before paying.</p><Link to="/contact" className="inline-flex mt-3 font-semibold text-forest underline">Discuss the design first</Link></header>
      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        <form id="print-order-form" onSubmit={checkout} className="bg-white rounded-3xl border border-gray-200 p-6 md:p-9 shadow-sm">
          <div className="flex gap-4 items-start pb-6 border-b"><FileBox className="text-gold"/><div><h2 className="text-xl font-semibold text-forest-dark">{quote?.fileName || 'Your 3D model'}</h2>{quote ? <p className="text-sm text-forest/60 mt-1">{quote.material} · {quote.color} · {quote.infill}% infill · {quote.quality} mm layers</p> : <p className="text-sm text-red-700 mt-1">Return to the quote page and upload your STL model to continue.</p>}</div></div>
          <OrderCustomerFields value={customer} onChange={setCustomer} pickup={pickup} />
          <label className="block text-xs font-bold text-forest-dark mb-2">Delivery destination</label>
          <button type="button" onClick={() => { setDestination(pickup ? 'north' : 'pickup'); setRural(false) }} className={`mb-3 flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${pickup ? 'border-forest bg-forest/5' : 'border-gray-200 bg-white hover:border-forest/50'}`}><MapPin className="text-forest" size={22}/><span className="flex-1"><strong className="block text-sm text-forest-dark">Pick up in person</strong><small className="text-forest/60">Morningside, Whangārei — no delivery charge</small></span><b className="text-sm text-forest">{pickup ? 'Selected' : 'Free'}</b></button>
          <select className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-forest-dark" value={destination} onChange={e => setDestination(e.target.value)}><option value="pickup">Pick up in person — Morningside, Whangārei (Free)</option><option value="north">New Zealand — North Island</option><option value="south">New Zealand — South Island</option><option value="australia">Australia</option></select>
          {!pickup && destination !== 'australia' && <label className="mt-3 flex items-center gap-3 rounded-xl bg-off-white p-3 text-sm text-forest-dark"><input type="checkbox" className="accent-forest" checked={rural} onChange={e => setRural(e.target.checked)}/><span className="flex-1">Rural delivery</span><strong>+ NZ$6.00</strong></label>}
          <button disabled={!quote || !order?.modelFile || working} className="mt-7 w-full rounded-xl bg-gold py-4 font-bold text-forest-dark shadow-md transition hover:bg-gold-light hover:-translate-y-0.5 disabled:opacity-40">{working ? 'Opening secure checkout…' : `Pay NZ$${total.toFixed(2)} securely`}</button>
          {error && <p role="alert" className="mt-3 text-center text-sm font-semibold text-red-700">{error}</p>}
          <p className="mt-3 text-center text-xs text-forest/50"><ShieldCheck size={14} className="inline mr-1"/>Secure payment powered by Stripe.</p>
        </form>
        <aside className="bg-forest-dark text-white rounded-3xl p-7 shadow-xl lg:sticky lg:top-24"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><FileBox className="text-gold" size={22}/></span><div><small className="text-gold-light font-bold tracking-wider">YOUR ORDER</small><h2 className="text-2xl font-semibold">Order summary</h2></div></div><div className="mt-7 space-y-4 text-sm"><div className="flex justify-between gap-4"><span className="text-white/65">3D print</span><strong>NZ${(quote?.price || 0).toFixed(2)}</strong></div><div className="flex justify-between gap-4"><span className="text-white/65">{pickup ? 'Pick up' : 'Delivery'}</span><strong>{pickup ? 'Free' : `NZ$${shipping.toFixed(2)}`}</strong></div><div className="flex justify-between border-t border-white/15 pt-5 text-xl"><span>Total</span><strong className="text-gold-light">NZ${total.toFixed(2)}</strong></div></div><button type="submit" form="print-order-form" disabled={!quote || !order?.modelFile || working} className="mt-6 w-full rounded-xl bg-gold py-3.5 font-bold text-forest-dark shadow-md transition hover:bg-gold-light hover:-translate-y-0.5 disabled:opacity-40">{working ? 'Opening checkout…' : 'Proceed to secure payment'}</button><div className="mt-7 space-y-4 text-xs text-white/65"><p className="flex gap-3"><Truck size={18} className="shrink-0 text-gold-light"/>Pick up in Morningside is free. Delivery: NZ North or South Island NZ$15, Australia NZ$30, rural NZ surcharge NZ$6.</p><p className="flex gap-3"><Mail size={18} className="shrink-0 text-gold-light"/>You’ll receive confirmation after payment and another email when your order is ready to dispatch or collect.</p><p className="flex gap-3"><MapPin size={18} className="shrink-0 text-gold-light"/>{pickup ? 'We’ll provide collection details when your order is ready.' : 'Your address and contact details travel securely with the paid order.'}</p></div><p className="mt-6 border-t border-white/10 pt-4 text-center text-[11px] text-white/45"><ShieldCheck size={13} className="inline mr-1"/>Payment protected by Stripe</p></aside>
      </div>
    </div>
  </main>
}
