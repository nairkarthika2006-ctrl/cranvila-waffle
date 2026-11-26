import { Router } from 'express'
import { getDb, save } from '../store.js'

const r = Router()
r.post('/', (req, res) => {
  const { name, phone, message } = req.body || {}
  const fields = {}
  const n = String(name || '').trim(), p = String(phone || '').replace(/[\s-]/g, ''), m = String(message || '').trim()
  if (n.length < 2 || n.length > 60) fields.name = 'Enter your name.'
  if (!/^\+?\d{10,13}$/.test(p)) fields.phone = 'Enter a valid phone number.'
  if (m.length < 5 || m.length > 1000) fields.message = 'Write a message between 5 and 1000 characters.'
  if (Object.keys(fields).length) return res.status(400).json({ error: 'Please fix the highlighted fields.', fields })
  const db = getDb()
  db.messages.push({ id: Date.now().toString(36), createdAt: new Date().toISOString(), name: n, phone: p, message: m })
  save()
  res.status(201).json({ ok: true })
})
export default r
