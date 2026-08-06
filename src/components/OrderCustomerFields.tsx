export type CustomerDetails = {
  name: string
  email: string
  phone: string
  address: string
  address2: string
  city: string
  region: string
  postalCode: string
}

export const emptyCustomerDetails: CustomerDetails = {
  name: '', email: '', phone: '', address: '', address2: '', city: '', region: '', postalCode: '',
}

type Props = {
  value: CustomerDetails
  onChange: (value: CustomerDetails) => void
  theme?: 'youshie' | 'kiwi'
  pickup?: boolean
}

export default function OrderCustomerFields({ value, onChange, theme = 'kiwi', pickup = false }: Props) {
  const set = (field: keyof CustomerDetails, next: string) => onChange({ ...value, [field]: next })
  const inputClass = theme === 'youshie' ? 'customer-input youshie-customer-input' : 'customer-input kiwi-customer-input'
  return <fieldset className={`customer-fields ${theme}`}>
    <legend>{pickup ? 'Contact details' : 'Delivery details'}</legend>
    <p>{pickup ? 'We’ll contact you when your order is ready to collect in Morningside, Whangārei.' : 'We’ll use these details for your order confirmation and dispatch.'}</p>
    <div className="customer-grid">
      <label className="wide"><span>Full name</span><input className={inputClass} required autoComplete="name" value={value.name} onChange={e => set('name', e.target.value)} /></label>
      <label><span>Email</span><input className={inputClass} required type="email" autoComplete="email" value={value.email} onChange={e => set('email', e.target.value)} /></label>
      <label><span>Phone</span><input className={inputClass} required type="tel" autoComplete="tel" value={value.phone} onChange={e => set('phone', e.target.value)} /></label>
      {!pickup && <>
        <label className="wide"><span>Street address</span><input className={inputClass} required autoComplete="street-address" value={value.address} onChange={e => set('address', e.target.value)} /></label>
        <label className="wide"><span>Apartment, unit or delivery notes <small>(optional)</small></span><input className={inputClass} autoComplete="address-line2" value={value.address2} onChange={e => set('address2', e.target.value)} /></label>
        <label><span>City / suburb</span><input className={inputClass} required autoComplete="address-level2" value={value.city} onChange={e => set('city', e.target.value)} /></label>
        <label><span>Region / state</span><input className={inputClass} required autoComplete="address-level1" value={value.region} onChange={e => set('region', e.target.value)} /></label>
        <label><span>Postcode</span><input className={inputClass} required autoComplete="postal-code" value={value.postalCode} onChange={e => set('postalCode', e.target.value)} /></label>
      </>}
    </div>
  </fieldset>
}
