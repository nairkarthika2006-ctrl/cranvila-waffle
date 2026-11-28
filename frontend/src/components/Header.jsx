import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { PHONE, PHONE_LINK } from '../data.js'
import { useStore } from '../context/Store.jsx'
import { useI18n } from '../context/I18n.jsx'

const links = [
  ['/', 'home'], ['/about', 'about'], ['/menu', 'menu'], ['/tracking', 'tracking'], ['/contact', 'contact'],
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const { count } = useStore()
  const { lang, setLang, t } = useI18n()

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`top${scrolled ? ' scrolled' : ''}`}>
      <Link className="brand" to="/"><span>Cranvila Waffle</span></Link>
      <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span></span><span></span>
      </button>
      <nav className={open ? 'open' : ''}>
        {links.map(([to, key]) => (
          <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? 'on' : '')}>{t(key)}</NavLink>
        ))}
        <NavLink to="/cart" className={({ isActive }) => `cartlink${isActive ? ' on' : ''}`}>
          {t('cart')}{count > 0 && <b className="badge">{count}</b>}
        </NavLink>
        <a className="call" href={PHONE_LINK}>{PHONE}</a>
        <select className="lang-toggle" aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">EN</option><option value="hi">हिं</option><option value="gu">ગુ</option>
        </select>
      </nav>
    </header>
  )
}
