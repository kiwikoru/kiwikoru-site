import { ArrowLeft, Check, Home, PackageCheck, Palette, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import './YoushieMe.css'
import './YoushieOrder.css'

type OrderState = { generatedPhoto?: string }

export default function YoushieOrder() {
  const { state } = useLocation()
  const generatedPhoto = (state as OrderState | null)?.generatedPhoto || sessionStorage.getItem('youshie-order-image') || undefined
  const [destination, setDestination] = useState('north')
  const [rural, setRural] = useState(false)
  const productPrice = 30
  const shippingPrices: Record<string, number> = { north: 15, south: 15, australia: 30 }
  const shipping = shippingPrices[destination] + (destination !== 'australia' && rural ? 6 : 0)
  const total = productPrice + shipping

  return <div className="youshie-page order-page">
    <header className="youshie-header">
      <Link to="/youshie-me" className="back-link"><ArrowLeft size={18} /> Your Youshie</Link>
      <img className="youshie-logo-img" src="/youshies-logo-transparent.png" alt="Youshies" />
      <span className="limited-pill">Made in New Zealand</span>
    </header>

    <main className="order-main">
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

        <div className="order-details">
          <small className="order-kicker">YOUR REAL COLLECTIBLE</small>
          <h2>One tiny version of you</h2>
          <ul className="product-points">
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
          <div className="shipping-quote"><span>Estimated delivery</span><strong>NZ${shipping.toFixed(2)}</strong></div>
          <div className="order-total"><span>Figure + delivery</span><strong>NZ${total.toFixed(2)}</strong></div>
          <button className="checkout-placeholder" disabled><Check size={20} /> Secure ordering coming next</button>
          <p className="checkout-note">Secure payment will be activated after final checkout confirmation.</p>
        </div>
      </section>
    </main>
  </div>
}
