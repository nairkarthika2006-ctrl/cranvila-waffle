import { Link } from 'react-router-dom'
import { PHONE, PHONE_LINK, EMAIL, ADDRESS } from '../data.js'
import { useI18n } from '../context/I18n.jsx'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-cta">
          <div>
            <p className="footer-kicker">{t('footerKicker')}</p>
            <h2>One more reason to<br />stay for dessert.</h2>
          </div>
          <Link className="footer-order" to="/menu">
            {t('explore')}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="fgrid">
          <div className="footer-brand">
            <Link className="brand" to="/"><span>Cranvila Waffle</span></Link>
            <p>Cranberry, vanilla and a very hot iron.<br />Made fresh, served warm.</p>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <h4>Explore</h4>
            <Link to="/menu">Menu</Link>
            <Link to="/tracking">Order tracking</Link>
            <Link to="/about">About us</Link>
            <Link to="/cancellation-policy">Cancellation policy</Link>
            <Link to="/contact">Party & bulk orders</Link>
            <Link to="/tracking">Reorder by phone</Link>
            <Link to="/admin">Staff dashboard</Link>
          </nav>

          <div className="footer-contact">
            <h4>Visit</h4>
            <p>
              <span className="contact-icon" aria-hidden="true">⌖</span>
              <span>{ADDRESS[0]}<br />{ADDRESS[1]}</span>
            </p>
            <p className="footer-hours">Daily · 11 am to 11 pm</p>
          </div>

          <div className="footer-contact">
            <h4>Talk to us</h4>
            <a href={PHONE_LINK}>
              <span className="contact-icon" aria-hidden="true">☎</span>
              <span>{PHONE}</span>
            </a>
            <a href={`mailto:${EMAIL}`}>
              <span className="contact-icon" aria-hidden="true">✉</span>
              <span>{EMAIL}</span>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Cranvila Waffle</p>
          <p>Made by Nair Karthika</p>
        </div>
      </div>
    </footer>
  )
}
