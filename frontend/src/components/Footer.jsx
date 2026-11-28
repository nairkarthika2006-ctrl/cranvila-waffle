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
            <h2>{t('One more reason to stay for dessert.')}</h2>
          </div>
          <Link className="footer-order" to="/menu">
            {t('explore')}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="fgrid">
          <div className="footer-brand">
            <Link className="brand" to="/"><span>Cranvila Waffle</span></Link>
            <p>{t('Cranberry, vanilla and a very hot iron.')}<br />{t('Made fresh, served warm.')}</p>
          </div>

          <nav className="footer-links" aria-label={t('Footer navigation')}>
            <h4>{t('Explore')}</h4>
            <Link to="/menu">{t('Menu')}</Link>
            <Link to="/tracking">{t('Order tracking')}</Link>
            <Link to="/about">{t('About us')}</Link>
            <Link to="/cancellation-policy">{t('Cancellation policy')}</Link>
            <Link to="/contact">{t('Party & bulk orders')}</Link>
            <Link to="/tracking">{t('Reorder by phone')}</Link>
            <Link to="/admin">{t('Staff dashboard')}</Link>
          </nav>

          <div className="footer-contact">
            <h4>{t('Visit')}</h4>
            <p>
              <span className="contact-icon" aria-hidden="true">⌖</span>
              <span>{ADDRESS[0]}<br />{ADDRESS[1]}</span>
            </p>
            <p className="footer-hours">{t('Daily · 11 am to 11 pm')}</p>
          </div>

          <div className="footer-contact">
            <h4>{t('Talk to us')}</h4>
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
          <p>{t('Made by Nair Karthika')}</p>
        </div>
      </div>
    </footer>
  )
}
