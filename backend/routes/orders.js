import { Router } from 'express'
import { menu, DELIVERY_FEE, FREE_DELIVERY_ABOVE } from '../menuData.js'
import { getDb, save } from '../store.js'

const r = Router()
const TOTAL_MINUTES = 30 // placed -> delivered
const LABELS = ['Order placed', 'Preparing', 'Out for delivery', 'Delivered']
const MESSAGES = [
  'We have your order and the kitchen is getting ready.',
  'Your waffles are on the iron.',
  'Your rider is on the way.',
  'Delivered. Enjoy every bite.',
]

// Status moves forward automatically with time unless an admin pinned it with manualStep.
function stepOf(o) {
  if (o.manualStep !== null && o.manualStep !== undefined) return o.manualStep
  const min = (Date.now() - new Date(o.createdAt).getTime()) / 60000
  return min >= TOTAL_MINUTES ? 3 : min >= 12 ? 2 : min >= 1 ? 1 : 0   
}
function etaOf(o, step) {
  if (step === 3) return 'Delivered'
  const left = o.manualStep != null
    ? [30, 20, 8][step]
    : Math.max(1, Math.ceil(TOTAL_MINUTES - (Date.now() - new Date(o.createdAt).getTime()) / 60000))
  return `Arrives in about ${left} min`
}
export const publicView = (o) => {
  const step = stepOf(o)
  return {
    id: o.id, step, status: LABELS[step], message: MESSAGES[step], eta: etaOf(o, step), createdAt: o.createdAt,
    items: o.items, subtotal: o.subtotal, deliveryFee: o.deliveryFee, total: o.total,
  }
}
export const adminView = (o) => ({ ...publicView(o), name: o.name, phone: o.phone, address: o.address, note: o.note })

r.post('/', (req, res) => {
  const { name, phone, address, note = '', items } = req.body || {}
  const fields = {}
  const cleanName = String(name || '').trim()
  const cleanPhone = String(phone || '').replace(/[\s-]/g, '')
  const cleanAddr = String(address || '').trim()
  if (cleanName.length < 2 || cleanName.length > 60) fields.name = 'Enter your name.'
  if (!/^\+?\d{10,13}$/.test(cleanPhone)) fields.phone = 'Enter a valid phone number.'
  if (cleanAddr.length < 8 || cleanAddr.length > 200) fields.address = 'Enter your full delivery address.'
  if (String(note).length > 300) fields.note = 'Keep the note under 300 characters.'

  const lines = []
  if (!Array.isArray(items) || items.length < 1 || items.length > 30) fields.items = 'Your cart is empty.'
  else {
    const seen = new Set()
    for (const it of items) {
      const m = menu.find((x) => x.id === it?.id)
      const qty = Number(it?.qty)
      if (!m || seen.has(m.id) || !Number.isInteger(qty) || qty < 1 || qty > 20) { fields.items = 'One of the items in your cart is not valid.'; break }
      seen.add(m.id)
      lines.push({ id: m.id, name: m.name, price: m.price, qty })
    }
  }
  if (Object.keys(fields).length) return res.status(400).json({ error: 'Please fix the highlighted fields.', fields })

  const db = getDb()
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
  const order = {
    id: `CW${db.nextOrder++}`, createdAt: new Date().toISOString(), manualStep: null,
    name: cleanName, phone: cleanPhone, address: cleanAddr, note: String(note).trim(),
    items: lines, subtotal, deliveryFee, total: subtotal + deliveryFee,
  }
  db.orders.push(order)
  save()
  res.status(201).json(publicView(order))
})

r.get('/:id', (req, res) => {
  const o = getDb().orders.find((x) => x.id === String(req.params.id).trim().toUpperCase())
  if (!o) return res.status(404).json({ error: 'We could not find that order ID.' })
  res.json(publicView(o))
})
export default r
