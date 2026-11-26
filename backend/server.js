import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import menuRoutes from './routes/menu.js'
import orderRoutes from './routes/orders.js'
import contactRoutes from './routes/contact.js'
import adminRoutes from './routes/admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5000

const origins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean)
app.use(cors({ origin: origins.length ? origins : true }))
app.use(express.json({ limit: '50kb' }))

// Very small in-memory rate limiter for write endpoints (per IP).
const hits = new Map()
const limit = (max, windowMs) => (req, res, next) => {
  const key = `${req.ip}:${req.baseUrl}`
  const now = Date.now()
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs)
  if (recent.length >= max) return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' })
  recent.push(now); hits.set(key, recent)
  next()
}
const writeLimit = (req, res, next) => (req.method === 'POST' ? limit(15, 60_000)(req, res, next) : next())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/menu', menuRoutes)
app.use('/api/orders', writeLimit, orderRoutes)
app.use('/api/contact', writeLimit, contactRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// In production, serve the built React app from the same server.
const dist = path.join(__dirname, '../frontend/dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.use((err, req, res, next) => {
  console.error(err)
  res.status(400).json({ error: 'Invalid request.' })
})

app.listen(PORT, () => {
  console.log(`Cranvila Waffle API running on http://localhost:${PORT}`)
  if (!process.env.ADMIN_KEY) console.warn('Warning: ADMIN_KEY is not set. Using the default "change-me". Set it before going live.')
})
