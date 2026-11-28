import { Link } from 'react-router-dom'
import { PHONE, PHONE_LINK, EMAIL, ADDRESS } from '../data.js'

export default function Footer() {
  return (
    <footer>
      <div className="wrap fgrid">
        <div>
          <div className="brand"><span>Cranvila Waffle</span></div>
          <p>Cranberry, vanilla and a very hot iron. Made fresh, served warm.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <p><Link to="/menu">Menu</Link><br /><Link to="/tracking">Order tracking</Link><br /><Link to="/about">About us</Link><br /><Link to="/cancellation-policy">Cancellation policy</Link></p>
        </div>
        <div>
          <h4>Visit</h4>
          <p>{ADDRESS[0]}<br />{ADDRESS[1]}<br />Daily 11 am to 11 pm</p>
        </div>
        <div>
          <h4>Talk to us</h4>
          <p><a href={PHONE_LINK}>{PHONE}</a><br /><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
        </div>
      </div>
      <p className="copy">© 2026 Cranvila Waffle Made by Nair Karthika </p>
    </footer>
  )
}
