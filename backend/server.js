import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import menuRoutes from './routes/menu.js'
import orderRoutes from './routes/orders.js'
import contactRoutes from './routes/contact.js'
import adminRoutes from './routes/admin.js'
import paymentRoutes, { webhook } from './routes/payments.js'
import { sweep } from './orderLogic.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, 'dist') // built frontend lives in backend/dist

const app = express()
const PORT = process.env.PORT || 6000

// Render puts a proxy in front of the app. Without this every visitor shares the proxy's IP,
// so the rate limiter below would block real customers together.
app.set('trust proxy', 1)

const origins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean)
app.use(cors({ origin: origins.length ? origins : true }))

// The webhook needs the raw body to check Razorpay's signature, so it is registered before express.json().
app.post('/api/payments/webhook', express.raw({ type: '*/*', limit: '100kb' }), webhook)
app.use(express.json({ limit: '50kb' }))

// Very small in-memory rate limiter for write endpoints (per IP).
const hits = new Map()
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of hits) if (!v.some((t) => now - t < 120_000)) hits.delete(k)
}, 5 * 60_000).unref()

const limit = (max, windowMs) => (req, res, next) => {
  const key = `${req.ip}:${req.baseUrl}`
  const now = Date.now()
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs)
  if (recent.length >= max) return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' })
  recent.push(now)
  hits.set(key, recent)
  next()
}
const writeLimit = (req, res, next) => (req.method === 'POST' ? limit(15, 60_000)(req, res, next) : next())

app.get('/api/health', (req, res) => res.json({ ok: true, uptime: Math.round(process.uptime()) }))
app.use('/api/menu', menuRoutes)
app.use('/api/orders', writeLimit, orderRoutes)
app.use('/api/payments', writeLimit, paymentRoutes)
app.use('/api/contact', writeLimit, contactRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// Serve the built React app from the same server.
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')))
} else {
  console.warn(`Warning: ${dist} not found. Build the frontend so the website is served.`)
}

// Bad JSON / oversized body -> 4xx. Anything else is a real bug -> 500 (and it is logged).
app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status >= 400 && err.status < 500 ? err.status : 500
  res.status(status).json({ error: status === 500 ? 'Something went wrong on our side. Please try again.' : 'Invalid request.' })
})

// A failed background job or promise must never take the whole server down.
process.on('unhandledRejection', (e) => console.error('Unhandled rejection:', e))
process.on('uncaughtException', (e) => console.error('Uncaught exception:', e))

const safeSweep = () => { try { sweep() } catch (e) { console.error('sweep failed:', e) } }
setInterval(safeSweep, 60_000) // auto-cancel unconfirmed / unpaid orders
safeSweep()

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cranvila Waffle API running on port ${PORT}`)
  if (!process.env.ADMIN_KEY) {
    console.warn(
      process.env.NODE_ENV === 'production'
        ? 'Warning: ADMIN_KEY is not set, so the admin API is DISABLED. Set it in the Render Environment tab.'
        : 'Warning: ADMIN_KEY is not set. Using the default "change-me" (development only).'
    )
  }
})