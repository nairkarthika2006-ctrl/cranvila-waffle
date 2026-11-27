import crypto from 'crypto'
import { Router } from 'express'
import { menu } from '../menuData.js'
import { totals } from '../pricing.js'
import { getDb, save, logPayment, normPhone, upsertCustomer, customerOf } from '../store.js'
import { cancelOrder, sweep, inMin, CONFIRM_MINUTES, PAY_MINUTES, NO_RESPONSE_LIMIT } from '../orderLogic.js'

const r = Router()
const TOTAL_MINUTES = 30 // confirmed -> delivered
const LABELS = ['Order placed', 'Preparing', 'Out for delivery', 'Delivered']
const MESSAGES = [
  'We have your order and the kitchen is getting ready.',
  'Your waffles are on the iron.',
  'Your rider is on the way.',
  'Delivered. Enjoy every bite.',
]

// Delivery status moves forward with time once the order is confirmed, unless an admin pinned it with manualStep.
export function stepOf(o) {
  if (o.status === 'cancelled') return -1
  if (o.status !== 'confirmed') return 0
  if (o.manualStep !== null && o.manualStep !== undefined) return o.manualStep
  const min = (Date.now() - new Date(o.confirmedAt || o.createdAt).getTime()) / 60000
  return min >= TOTAL_MINUTES ? 3 : min >= 12 ? 2 : min >= 1 ? 1 : 0
}
function etaOf(o, step) {
  if (step === 3) return 'Delivered'
  if (step === -1) return 'Cancelled'
  if (o.status === 'pending_confirmation') return 'Waiting for your confirmation'
  if (o.status === 'pending_payment') return 'Waiting for payment'
  const left = o.manualStep != null
    ? [30, 20, 8][step]
    : Math.max(1, Math.ceil(TOTAL_MINUTES - (Date.now() - new Date(o.confirmedAt || o.createdAt).getTime()) / 60000))
  return `Arrives in about ${left} min`
}
function messageOf(o, step) {
  if (o.status === 'cancelled') return `This order was cancelled. ${o.paymentStatus === 'refund_pending' ? 'Your refund is being processed.' : o.paymentStatus === 'refunded' ? 'Your payment has been refunded.' : ''}`.trim()
  if (o.status === 'pending_confirmation') return `Please confirm this order within ${CONFIRM_MINUTES} minutes, or it will be cancelled automatically.`
  if (o.status === 'pending_payment') return 'Complete the payment to confirm your order.'
  return MESSAGES[step]
}
export const publicView = (o) => {
  const step = stepOf(o)
  return {
    id: o.id, state: o.status, step, status: step === -1 ? 'Cancelled' : LABELS[step], message: messageOf(o, step), eta: etaOf(o, step), createdAt: o.createdAt,
    items: o.items, subtotal: o.subtotal, deliveryFee: o.deliveryFee, deliveryGst: o.deliveryGst, gst: o.gst, total: o.total,
    paymentMethod: o.paymentMethod, payApp: o.payApp, paymentStatus: o.paymentStatus,
    confirmBy: o.status === 'pending_confirmation' ? o.confirmBy : null, payBy: o.status === 'pending_payment' ? o.payBy : null,
    canRate: o.status === 'confirmed' && step === 3 && !o.rating, rating: o.rating || null,
    canCancel: o.status !== 'cancelled' && step < 2, cancellation: o.cancellation || null,
  }
}
export const adminView = (o) => ({
  ...publicView(o), name: o.name, phone: o.phone, address: o.address, note: o.note,
  confirmedAt: o.confirmedAt, confirmedBy: o.confirmedBy, providerPaymentId: o.providerPaymentId, paidAt: o.paidAt,
})

const find = (id) => getDb().orders.find((x) => x.id === String(id).trim().toUpperCase())
const phoneOk = (o, p) => normPhone(p).length === 10 && normPhone(p) === normPhone(o.phone)

r.post('/', (req, res) => {
  const { name, phone, address, note = '', items, paymentMethod = 'cod', payApp = null } = req.body || {}
  const fields = {}
  const cleanName = String(name || '').trim()
  const cleanPhone = String(phone || '').replace(/[\s-]/g, '')
  const cleanAddr = String(address || '').trim()
  if (cleanName.length < 2 || cleanName.length > 60) fields.name = 'Enter your name.'
  if (!/^\+?\d{10,13}$/.test(cleanPhone)) fields.phone = 'Enter a valid phone number.'
  if (cleanAddr.length < 8 || cleanAddr.length > 200) fields.address = 'Enter your full delivery address.'
  if (String(note).length > 300) fields.note = 'Keep the note under 300 characters.'
  if (!['cod', 'online'].includes(paymentMethod)) fields.paymentMethod = 'Choose a payment method.'
  if (payApp !== null && !['gpay', 'phonepe', 'upi'].includes(payApp)) fields.paymentMethod = 'Choose a payment method.'

  const lines = []
  if (!Array.isArray(items) || items.length < 1 || items.length > 30) fields.items = 'Your cart is empty.'
  else {
    const seen = new Set()
    for (const it of items) {
      const m = menu.find((x) => x.id === it?.id)
      const qty = Number(it?.qty)
      if (!m || seen.has(m.id) || !Number.isInteger(qty) || qty < 1 || qty > 20) { fields.items = 'One of the items in your cart is not valid.'; break }
      seen.add(m.id)
      lines.push({ id: m.id, name: m.name, price: m.price, qty, gst: m.gst })
    }
  }
  const known = customerOf({ phone: cleanPhone })
  if (paymentMethod === 'cod' && (known?.noResponseCount || 0) >= NO_RESPONSE_LIMIT) {
    fields.paymentMethod = 'Cash on delivery is not available for this number because earlier orders were not confirmed. Please pay online.'
  }
  if (Object.keys(fields).length) return res.status(400).json({ error: 'Please fix the highlighted fields.', fields })

  const db = getDb()
  const t = totals(lines)
  const cod = paymentMethod === 'cod'
  const order = {
    id: `CW${db.nextOrder++}`, createdAt: new Date().toISOString(), manualStep: null,
    status: cod ? 'pending_confirmation' : 'pending_payment',
    confirmBy: cod ? inMin(CONFIRM_MINUTES) : null, payBy: cod ? null : inMin(PAY_MINUTES),
    name: cleanName, phone: cleanPhone, address: cleanAddr, note: String(note).trim(),
    paymentMethod, payApp: cod ? null : payApp || 'upi', paymentStatus: cod ? 'cod_due' : 'pending',
    items: lines.map(({ gst, ...l }) => ({ ...l, gstRate: gst })), ...t, cancellation: null,
  }
  db.orders.push(order)
  upsertCustomer({ name: cleanName, phone: cleanPhone, address: cleanAddr })
  logPayment({ orderId: order.id, event: cod ? 'cod_selected' : 'online_selected', method: cod ? 'cod' : 'upi', app: order.payApp, amount: order.total, status: order.paymentStatus })
  res.status(201).json(publicView(order))
})

r.get('/:id', (req, res) => {
  sweep()
  const o = find(req.params.id)
  if (!o) return res.status(404).json({ error: 'We could not find that order ID.' })
  res.json(publicView(o))
})

// After delivery the customer rates every item in the order (1-5 stars, optional comment), once per order.
r.post('/:id/rate', (req, res) => {
  sweep()
  const o = find(req.params.id)
  if (!o) return res.status(404).json({ error: 'We could not find that order ID.' })
  if (!phoneOk(o, req.body?.phone)) return res.status(403).json({ error: 'That phone number does not match this order.' })
  if (!publicView(o).canRate) return res.status(409).json({ error: o.rating ? 'You have already rated this order.' : 'You can rate an order after it is delivered.' })
  const list = Array.isArray(req.body?.ratings) ? req.body.ratings : []
  const out = []
  for (const x of list) {
    const it = o.items.find((i) => i.id === x?.id)
    const stars = Number(x?.stars)
    if (!it || out.some((y) => y.id === it.id) || !Number.isInteger(stars) || stars < 1 || stars > 5) return res.status(400).json({ error: 'Please give every item 1 to 5 stars.' })
    out.push({ id: it.id, name: it.name, stars, comment: String(x.comment || '').trim().slice(0, 300) })
  }
  if (out.length !== o.items.length) return res.status(400).json({ error: 'Please rate every item in your order.' })
  const db = getDb(), at = new Date().toISOString()
  for (const x of out) db.ratings.push({ id: `RT${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, orderId: o.id, itemId: x.id, itemName: x.name, stars: x.stars, comment: x.comment, customer: o.name.split(' ')[0], phone: normPhone(o.phone), at })
  o.rating = { at, items: out }
  save()
  res.json(publicView(o))
})

// COD: the customer confirms the order. No confirmation in time = automatic "not responding" cancellation.
r.post('/:id/confirm', (req, res) => {
  sweep()
  const o = find(req.params.id)
  if (!o) return res.status(404).json({ error: 'We could not find that order ID.' })
  if (!phoneOk(o, req.body?.phone)) return res.status(403).json({ error: 'That phone number does not match this order.' })
  if (o.status !== 'pending_confirmation') return res.status(409).json({ error: o.status === 'cancelled' ? 'This order was already cancelled.' : 'This order does not need confirmation.' })
  o.status = 'confirmed'; o.confirmedAt = new Date().toISOString(); o.confirmedBy = 'customer'
  save()
  res.json(publicView(o))
})

// Cancellation needs two confirmations, enforced here as well as in the page:
// stage 1 returns a short-lived token, stage 2 must present it to actually cancel.
const tokens = new Map()
r.post('/:id/cancel', (req, res) => {
  sweep()
  const o = find(req.params.id)
  if (!o) return res.status(404).json({ error: 'We could not find that order ID.' })
  const { stage, token, reason } = req.body || {}
  if (!phoneOk(o, req.body?.phone)) return res.status(403).json({ error: 'That phone number does not match this order.' })
  if (o.status === 'cancelled') return res.status(409).json({ error: 'This order is already cancelled.' })
  if (!publicView(o).canCancel) return res.status(409).json({ error: 'This order is already out for delivery or delivered, so it can no longer be cancelled online. Please call us.' })
  if (stage === 1) {
    const t = crypto.randomUUID()
    tokens.set(t, { id: o.id, exp: Date.now() + 5 * 60000 })
    return res.json({ stage: 1, token: t })
  }
  const rec = tokens.get(token)
  if (stage !== 2 || !rec || rec.id !== o.id || rec.exp < Date.now()) return res.status(400).json({ error: 'Please start the cancellation again.' })
  tokens.delete(token)
  cancelOrder(o, 'customer', String(reason || 'Cancelled by customer').slice(0, 120), { confirmations: 2 })
  save()
  res.json(publicView(o))
})
export default r
