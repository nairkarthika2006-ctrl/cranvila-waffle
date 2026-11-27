import { useState } from 'react'
import { img } from '../data.js'

// Shows /images/payments/<id>.svg if you add the official logo file there; otherwise a simple branded badge.
const badges = {
  gpay: <span className="pl pl-gpay"><b style={{ color: '#4285F4' }}>G</b> Pay</span>,
  phonepe: <span className="pl pl-phonepe">PhonePe</span>,
  paytm: <span className="pl pl-paytm"><b style={{ color: '#002970' }}>Pay</b><b style={{ color: '#00BAF2' }}>tm</b></span>,
  upi: <span className="pl pl-upi"><b style={{ color: '#E8731F' }}>U</b><b style={{ color: '#1F9D55' }}>P</b><b style={{ color: '#E8731F' }}>I</b></span>,
  cod: <span className="pl pl-cod">₹ Cash</span>,
}

export default function PaymentLogo({ id }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <span className="plwrap" aria-hidden="true">
      <img className="plimg" src={img(`payments/${id}.svg`)} alt="" onLoad={() => setLoaded(true)} style={loaded ? undefined : { display: 'none' }} />
      {!loaded && (badges[id] || badges.upi)}
    </span>
  )
}
