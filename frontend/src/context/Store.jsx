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

  useEffect(() => {
    api.menu()
      .then((d) => { setMenu(d.items); setConfig({ deliveryFee: d.deliveryFee, freeDeliveryAbove: d.freeDeliveryAbove, deliveryGst: d.deliveryGst ?? DELIVERY_GST }) })
      .catch(() => {}) // keep the fallback menu
  }, [])
  useEffect(() => {
    try { localStorage.setItem('cw-cart', JSON.stringify(cart)) } catch { /* storage unavailable */ }
  }, [cart])

  const add = (id) => setCart((c) => ({ ...c, [id]: Math.min(20, (c[id] || 0) + 1) }))
  const remove = (id) => setCart((c) => {
    const { [id]: q = 0, ...rest } = c
    return q > 1 ? { ...rest, [id]: q - 1 } : rest
  })
  const drop = (id) => setCart((c) => { const { [id]: _x, ...rest } = c; return rest })
  const clear = () => setCart({})

  const value = useMemo(() => {
    const lines = Object.entries(cart)
      .map(([id, qty]) => ({ item: menu.find((m) => m.id === id), qty }))
      .filter((l) => l.item)
    const count = lines.reduce((s, l) => s + l.qty, 0)
    const subtotal = lines.reduce((s, l) => s + l.qty * l.item.price, 0)
    const deliveryFee = subtotal === 0 || subtotal >= config.freeDeliveryAbove ? 0 : config.deliveryFee
    // Preview of the bill. The server recalculates the same way when the order is placed.
    const itemGst = r2(lines.reduce((s, l) => s + (l.qty * l.item.price * (l.item.gst ?? ITEM_GST)) / 100, 0))
    const deliveryGst = r2((deliveryFee * config.deliveryGst) / 100)
    const gstTotal = r2(itemGst + deliveryGst)
    const cgst = r2(gstTotal / 2)
    const gst = { cgst, sgst: r2(gstTotal - cgst), total: gstTotal }
    return { menu, config, cart, lines, count, subtotal, deliveryFee, deliveryGst, gst, total: r2(subtotal + deliveryFee + gstTotal), add, remove, drop, clear }
  }, [menu, config, cart])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
