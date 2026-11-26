import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'
import { items as fallback, DELIVERY_FEE, FREE_DELIVERY_ABOVE } from '../data.js'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [menu, setMenu] = useState(fallback)
  const [config, setConfig] = useState({ deliveryFee: DELIVERY_FEE, freeDeliveryAbove: FREE_DELIVERY_ABOVE })
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cw-cart')) || {} } catch { return {} }
  })

  useEffect(() => {
    api.menu()
      .then((d) => { setMenu(d.items); setConfig({ deliveryFee: d.deliveryFee, freeDeliveryAbove: d.freeDeliveryAbove }) })
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
    return { menu, config, cart, lines, count, subtotal, deliveryFee, total: subtotal + deliveryFee, add, remove, drop, clear }
  }, [menu, config, cart])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
