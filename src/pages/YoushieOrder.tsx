import { ArrowLeft, Check, Clock3, Home, PackageCheck, Palette, Sparkles } from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import OrderCustomerFields, { emptyCustomerDetails } from '../components/OrderCustomerFields'
import '../components/OrderCustomerFields.css'
import './YoushieMe.css'
import './YoushieOrder.css'

type OrderState = { generatedPhoto?: string }

export default function YoushieOrder() {
  const { state } = useLocation()
  const [searchParams] = useSearchParams()
  const generatedPhoto = (state as OrderState | null)?.generatedPhoto || sessionStorage.getItem('youshie-order-image') || undefined
  const [destination, setDestination] = useState('north')
  const [rural, setRural] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string>()
  const [customer, setCustomer] = useState(emptyCustomerDetails)
  const [confirmation, setConfirmation] = useState<'sending' | 'sent' | 'error'>()
  const productPrice = 30
  const shippingPrices: Record<string, number> = { north: 15, south: 15, australia: 30 }
  const shipping = shippingPrices[destination] + (destination !== 'australia' && rural ? 6 : 0)
  const total = productPrice + shipping

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (searchParams.get('payment') !== 'success' || !sessionId) return
    setConfirmation('sending')
    fetch('/api/stripe-checkout?action=confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) })
      .then(response => { if (!response.ok) throw new Error(); setConfirmation('sent') })
      .catch(() => setConfirmation('error'))
  }, [searchParams])

  async function startCheckout(event: React.FormEvent) {
    event.preventDefault()
    if (!generatedPhoto || checkingOut) return
    setCheckingOut(true)
    setCheckoutError(undefined)

    try {
      const response = await fetch('/api/stripe-checkout?action=youshie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, rural, generatedPhoto, customer }),
      })
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        throw new Error('Secure checkout is temporarily unavailable. Please try again shortly.')
      }
      const result = await response.json() as { url?: string; error?: string }
      if (!response.ok || !result.url) throw new Error(result.error || 'Unable to start secure checkout.')
      window.location.assign(result.url)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to start secure checkout.')
      setCheckingOut(false)
    }
  }

  return <div className="youshie-page order-page">
    <header className="youshie-header">
      <Link to="/youshie-me" className="back-link"><ArrowLeft size={18} /> Your Youshie</Link>
      <img className="youshie-logo-img" src="/youshies-logo-transparent.png" alt="Youshies" />
      <span className="limited-pill">Made in New Zealand</span>
    </header>

    <main className="order-main">
      {searchParams.get('payment') === 'success' && <div className="checkout-status success"><Check size={20} /><span><strong>Payment received!</strong> Your Youshie order is safely with KiwiKoru 3D. {confirmation === 'sent' ? 'A confirmation has been emailed to you.' : confirmation === 'sending' ? 'We’re preparing your email confirmation…' : confirmation === 'error' ? 'Keep your Stripe receipt; we’ll contact you shortly.' : ''}</span></div>}
      {searchParams.get('payment') === 'cancelled' && <div className="checkout-status cancelled"><span>No worries — your order wasn’t charged. Your Youshie is still here when you’re ready.</span></div>}
      <section className="order-heading">
        <div className="eyebrow"><Sparkles size={16} /> From magical picture to real figure</div>
        <h1>Bring your little<br /><em>Youshie home.</em></h1>
        <p>Your personalised collectible is made especially for you by KiwiKoru 3D.</p>
      </section>

      <section className="order-card">
        <div className="order-visual">
          {generatedPhoto ? <img src={generatedPhoto} alt="Your personalised Youshie" /> : <div className="figure-measure" aria-label="Youshie silhouette, 10 centimetres high"><span className="measure-line"><b>10 cm</b></span><div className="figure-head"><i /><i /></div><div className="figure-body"><i /><i /></div></div>}
          <span className="actual-note"><small>APPROXIMATE HEIGHT</small><strong>10 cm</strong><b>tall</b></span>
        </div>

        <form className="order-details" onSubmit={startCheckout}>
          <small className="order-kicker">YOUR REAL COLLECTIBLE</small>
          <h2>One tiny version of you</h2>
          <ul className="product-points">
            <li><Clock3 /><span><strong>Production time: 3 days</strong><small>Your personalised Youshie is prepared especially for you before dispatch</small></span></li>
            <li><Home /><span><strong>Printed by KiwiKoru 3D</strong><small>Made locally in Whangārei</small></span></li>
            <li><Palette /><span><strong>Four filament colours</strong><small>Selected to preserve your most recognisable features</small></span></li>
            <li><Sparkles /><span><strong>Hand-finished when needed</strong><small>A fifth or sixth small detail may be carefully painted by hand</small></span></li>
            <li><PackageCheck /><span><strong>Ready for your desk or shelf</strong><small>Sturdy, charming and made just for you</small></span></li>
          </ul>

          <div className="price-box"><span>Youshie figure</span><strong>NZ${productPrice.toFixed(2)}</strong></div>
          <label className="shipping-label" htmlFor="shipping">Where should your Youshie travel?</label>
          <select id="shipping" value={destination} onChange={event => setDestination(event.target.value)}>
            <option value="north">New Zealand — North Island</option>
            <option value="south">New Zealand — South Island</option>
            <option value="australia">Australia</option>
          </select>
          {destination !== 'australia' && <label className="rural-option"><input type="checkbox" checked={rural} onChange={event => setRural(event.target.checked)} /><span><strong>Rural delivery</strong><small>NZ Post rural surcharge</small></span><b>+ NZ$6.00</b></label>}
          <OrderCustomerFields value={customer} onChange={setCustomer} theme="youshie" />
          <div className="shipping-quote"><span>Estimated delivery</span><strong>NZ${shipping.toFixed(2)}</strong></div>
          <div className="order-total"><span>Figure + delivery</span><strong>NZ${total.toFixed(2)}</strong></div>
          <button type="submit" className="checkout-placeholder" disabled={!generatedPhoto || checkingOut}>
            <Check size={20} /> {checkingOut ? 'Opening secure checkout…' : `Pay NZ$${total.toFixed(2)} securely`}
          </button>
          {!generatedPhoto && <p className="checkout-error">Create your Youshie first so we can attach the correct figure to your order.</p>}
          {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
          <p className="checkout-note">Secure payment powered by Stripe. Your payment details are never stored by KiwiKoru.</p>
        </form>
      </section>
    </main>
  </div>
}
