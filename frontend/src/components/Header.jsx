import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { PHONE, PHONE_LINK } from '../data.js'
import { useStore } from '../context/Store.jsx'

const links = [
  ['/', 'Home'], ['/about', 'About us'], ['/menu', 'Menu'], ['/tracking', 'Order tracking'], ['/contact', 'Contact'],
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const { count } = useStore()

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
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? 'on' : '')}>{label}</NavLink>
        ))}
        <NavLink to="/cart" className={({ isActive }) => `cartlink${isActive ? ' on' : ''}`}>
          Your order{count > 0 && <b className="badge">{count}</b>}
        </NavLink>
        <a className="call" href={PHONE_LINK}>{PHONE}</a>
      </nav>
    </header>
  )
}
