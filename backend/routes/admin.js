import { Router } from 'express'
import { getDb, save } from '../store.js'
import { adminView } from './orders.js'

const r = Router()
const KEY = process.env.ADMIN_KEY || 'change-me'

r.use((req, res, next) => {
  if (req.get('x-admin-key') !== KEY) return res.status(401).json({ error: 'Unauthorized' })
  next()
})
r.get('/orders', (req, res) => res.json(getDb().orders.slice().reverse().map(adminView)))
r.get('/messages', (req, res) => res.json(getDb().messages.slice().reverse()))
// Body: { "step": 0..3 } pins the status, { "step": null } returns to automatic.
r.patch('/orders/:id', (req, res) => {
  const o = getDb().orders.find((x) => x.id === req.params.id.toUpperCase())
  if (!o) return res.status(404).json({ error: 'Order not found' })
  const s = req.body?.step
  if (s !== null && !(Number.isInteger(s) && s >= 0 && s <= 3)) return res.status(400).json({ error: 'step must be 0-3 or null' })
  o.manualStep = s
  save()
  res.json(adminView(o))
})
export default r
