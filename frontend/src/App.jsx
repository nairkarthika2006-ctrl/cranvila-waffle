import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Menu from './pages/Menu.jsx'
import Tracking from './pages/Tracking.jsx'
import Contact from './pages/Contact.jsx'
import Cart from './pages/Cart.jsx'
import Policy from './pages/Policy.jsx'
import Admin from './pages/Admin.jsx'
import MenuItem from './pages/MenuItem.jsx'
import { useI18n } from './context/I18n.jsx'

const titles = { '/': 'home', '/about': 'about', '/menu': 'menu', '/tracking': 'tracking', '/contact': 'contact', '/cart': 'cart', '/cancellation-policy': 'Cancellation policy', '/admin': 'Staff dashboard' }

export default function App() {
  const { pathname } = useLocation()
  const { t } = useI18n()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `${t(pathname.startsWith('/menu/') ? 'Menu item' : titles[pathname] || 'Home')} | Cranvila Waffle`
  }, [pathname, t])

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:id" element={<MenuItem />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cancellation-policy" element={<Policy />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
