import crypto from 'crypto'
import { Router } from 'express'
import { getDb, save, logPayment, normPhone } from '../store.js'
import { adminView, stepOf } from './orders.js'
import { cancelOrder, sweep } from '../orderLogic.js'

const r = Router()
const KEY = process.env.ADMIN_KEY || (process.env.NODE_ENV === 'production' ? '' : 'change-me')
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y) }

r.use((req, res, next) => {
  if (!KEY) return res.status(503).json({ error: 'Admin is disabled: set ADMIN_KEY on the server.' })
  if (!same(req.get('x-admin-key') || '', KEY)) return res.status(401).json({ error: 'Unauthorized' })
  sweep()
  next()
})
r.get('/orders', (req, res) => res.json(getDb().orders.slice().reverse().map(adminView)))
r.get('/messages', (req, res) => res.json(getDb().messages.slice().reverse()))
// Full payment log. Optional ?orderId=CW1005
r.get('/payments', (req, res) => {
  const id = String(req.query.orderId || '').toUpperCase()
  res.json(getDb().payments.filter((p) => !id || p.orderId === id).reverse())
})
// All ratings and comments. Optional ?itemId=berry-maple
r.get('/ratings', (req, res) => {
  const id = String(req.query.itemId || '')
  res.json(getDb().ratings.filter((x) => !id || x.itemId === id).reverse())
})
// Customer records with order history totals.
r.get('/customers', (req, res) => {
  const db = getDb()
  res.json(db.customers.map((c) => {
    const mine = db.orders.filter((o) => normPhone(o.phone) === c.phone)
    return {
      ...c, orders: mine.length, delivered: mine.filter((o) => stepOf(o) === 3).length,
      spent: Math.round(mine.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0) * 100) / 100,
      orderIds: mine.map((o) => o.id),
    }
  }).sort((a, b) => (b.lastOrderAt || '').localeCompare(a.lastOrderAt || '')))
})
// Body: { "step": 0..3 } pins the status, { "step": null } returns to automatic.
// Or { "action": "confirm" | "cancel" | "no_response" | "cod_collected", "reason": "..." }
r.patch('/orders/:id', (req, res) => {
  const o = getDb().orders.find((x) => x.id === req.params.id.toUpperCase())
  if (!o) return res.status(404).json({ error: 'Order not found' })
  const { action, step, reason } = req.body || {}
  if (action === 'confirm') {
    if (o.status !== 'pending_confirmation') return res.status(409).json({ error: 'Order is not waiting for confirmation' })
    o.status = 'confirmed'; o.confirmedAt = new Date().toISOString(); o.confirmedBy = 'admin'
  } else if (action === 'cancel' || action === 'no_response') {
    cancelOrder(o, 'admin', action === 'no_response' ? 'No response: customer did not answer our call' : String(reason || 'Cancelled by shop').slice(0, 120), { noResponse: action === 'no_response' })
  } else if (action === 'cod_collected') {
    if (o.paymentMethod !== 'cod' || o.status === 'cancelled') return res.status(409).json({ error: 'Not a COD order in progress' })
    o.paymentStatus = 'paid'; o.paidAt = new Date().toISOString()
    logPayment({ orderId: o.id, event: 'cod_collected', method: 'cod', amount: o.total, status: 'paid' })
  } else if (action === 'paid') {
    o.paymentStatus = 'paid'; o.paidAt = new Date().toISOString()
    logPayment({ orderId: o.id, event: 'marked_paid_by_admin', method: o.paymentMethod, amount: o.total, status: 'paid' })
  } else if (action === 'failed') {
    o.paymentStatus = 'failed'
    cancelOrder(o, 'admin', 'Online payment failed')
  } else if (action === 'refunded') {
    o.paymentStatus = 'refunded'; o.refundedAt = new Date().toISOString()
    logPayment({ orderId: o.id, event: 'refund_completed', method: o.paymentMethod, amount: o.total, status: 'refunded' })
  } else {
    if (step !== null && !(Number.isInteger(step) && step >= 0 && step <= 3)) return res.status(400).json({ error: 'step must be 0-3 or null' })
    o.manualStep = step
  }
  save()
  res.json(adminView(o))
})
export default r
