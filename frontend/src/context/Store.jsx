import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'
import { items as fallback, DELIVERY_FEE, FREE_DELIVERY_ABOVE, DELIVERY_GST, ITEM_GST } from '../data.js'

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [menu, setMenu] = useState(fallback)
  const [config, setConfig] = useState({ deliveryFee: DELIVERY_FEE, freeDeliveryAbove: FREE_DELIVERY_ABOVE, deliveryGst: DELIVERY_GST })
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cw-cart')) || {} } catch { return {} }
  })
  const [customById, setCustomById] = useState({})
  const [coupon, setCoupon] = useState('')

  useEffect(() => {
    api.menu()
      .then((d) => { setMenu(d.items); setConfig({ deliveryFee: d.deliveryFee, freeDeliveryAbove: d.freeDeliveryAbove, deliveryGst: d.deliveryGst ?? DELIVERY_GST }) })
      .catch(() => {}) // keep the fallback menu
  }, [])
  useEffect(() => {
    try { localStorage.setItem('cw-cart', JSON.stringify(cart)) } catch { /* storage unavailable */ }
  }, [cart])

  const add = (id, customizations = null) => {
    setCart((c) => ({ ...c, [id]: Math.min(20, (c[id] || 0) + 1) }))
    if (customizations) setCustomById((c) => ({ ...c, [id]: customizations }))
  }
  const remove = (id) => setCart((c) => {
    const { [id]: q = 0, ...rest } = c
    return q > 1 ? { ...rest, [id]: q - 1 } : rest
  })
  const drop = (id) => setCart((c) => { const { [id]: _x, ...rest } = c; return rest })
  const clear = () => { setCart({}); setCustomById({}); setCoupon('') }
  const applyCoupon = (code) => setCoupon(String(code || '').trim().toUpperCase())

  const value = useMemo(() => {
    const lines = Object.entries(cart)
      .map(([id, qty]) => ({ item: menu.find((m) => m.id === id), qty, customizations: customById[id] || [] }))
      .filter((l) => l.item)
    const count = lines.reduce((s, l) => s + l.qty, 0)
    const subtotal = lines.reduce((s, l) => s + l.qty * (l.item.price + l.customizations.reduce((a, x) => a + Number(x.price || 0), 0)), 0)
    const discount = coupon.trim().toUpperCase() === 'WELCOME10' ? r2(subtotal * 0.10) : 0
    const discountedSubtotal = r2(subtotal - discount)
    const deliveryFee = subtotal === 0 || discountedSubtotal >= config.freeDeliveryAbove ? 0 : config.deliveryFee
    // Preview of the bill. The server recalculates the same way when the order is placed.
    const itemGst = r2(lines.reduce((s, l) => {
      const unit = l.item.price + l.customizations.reduce((a, x) => a + Number(x.price || 0), 0)
      return s + (l.qty * unit * (l.item.gst ?? ITEM_GST)) / 100
    }, 0) * (discount ? discountedSubtotal / subtotal : 1))
    const deliveryGst = r2((deliveryFee * config.deliveryGst) / 100)
    const gstTotal = r2(itemGst + deliveryGst)
    const cgst = r2(gstTotal / 2)
    const gst = { cgst, sgst: r2(gstTotal - cgst), total: gstTotal }
    return { menu, config, cart, customById, coupon, discount, discountedSubtotal, lines, count, subtotal, deliveryFee, deliveryGst, gst, total: r2(discountedSubtotal + deliveryFee + gstTotal), applyCoupon, add, remove, drop, clear }
  }, [menu, config, cart, customById, coupon])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
