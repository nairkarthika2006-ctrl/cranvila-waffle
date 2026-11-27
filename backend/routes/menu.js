import { Router } from 'express'
import { menu, DELIVERY_FEE, FREE_DELIVERY_ABOVE, DELIVERY_GST } from '../menuData.js'
import { getDb } from '../store.js'

const r = Router()
// Each item carries its average rating and number of ratings from delivered orders.
r.get('/', (req, res) => {
  const all = getDb().ratings
  const items = menu.map((m) => {
    const mine = all.filter((x) => x.itemId === m.id)
    const avg = mine.length ? Math.round((mine.reduce((s, x) => s + x.stars, 0) / mine.length) * 10) / 10 : 0
    return { ...m, rating: { avg, count: mine.length } }
  })
  res.json({ items, deliveryFee: DELIVERY_FEE, freeDeliveryAbove: FREE_DELIVERY_ABOVE, deliveryGst: DELIVERY_GST })
})
export default r
