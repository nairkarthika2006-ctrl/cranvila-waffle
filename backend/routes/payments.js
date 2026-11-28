import { Router } from 'express'
import { getDb, save, logPayment, normPhone } from '../store.js'
import { markPaid } from '../orderLogic.js'
import { publicView } from './orders.js'
import * as rzp from '../razorpay.js'

const r = Router()
const find = (id) => getDb().orders.find((x) => x.id === String(id || '').trim().toUpperCase())
// Order ID alone is guessable (CW1001, CW1002...), so every payment call also needs the order's phone number.
const own = (req, res) => {
  const o = find(req.body?.orderId)
  if (!o || normPhone(req.body?.phone) !== normPhone(o.phone)) { res.status(404).json({ error: 'Order not found.' }); return null }
  if (o.paymentMethod !== 'online' || o.status !== 'pending_payment') { res.status(409).json({ error: 'This order is not waiting for payment.' }); return null }
  return o
}

r.post('/create', async (req, res) => {
  const o = own(req, res); if (!o) return
  if (!rzp.live) {
    logPayment({ orderId: o.id, event: 'checkout_started', provider: 'demo', method: 'upi', app: o.payApp, amount: o.total, status: 'pending' })
    return res.json({ mode: 'demo', amount: o.total })
  }
  try {
    if (!o.rzpOrderId) { o.rzpOrderId = (await rzp.createOrder(Math.round(o.total * 100), o.id)).id; save() }
    o.paymentStatus = 'pending'
    logPayment({ orderId: o.id, event: 'checkout_started', provider: 'razorpay', providerOrderId: o.rzpOrderId, method: 'upi', app: o.payApp, amount: o.total, status: 'pending' })
    res.json({ mode: 'razorpay', keyId: rzp.keyId, rzpOrderId: o.rzpOrderId, amount: Math.round(o.total * 100), name: o.name, phone: o.phone })
  } catch (e) {
    logPayment({ orderId: o.id, event: 'gateway_error', provider: 'razorpay', amount: o.total, status: 'error', detail: e.message })
    res.status(502).json({ error: 'The payment service is not reachable right now. Please try again in a moment.' })
  }
})

r.post('/verify', async (req, res) => {
  const o = own(req, res); if (!o) return
  const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = req.body
  if (!o.rzpOrderId || oid !== o.rzpOrderId || !rzp.verifySignature(oid, pid, sig)) {
    logPayment({ orderId: o.id, event: 'verification_failed', provider: 'razorpay', providerPaymentId: pid, amount: o.total, status: 'failed' })
    return res.status(400).json({ error: 'We could not verify this payment. If money was deducted, it will be refunded automatically. Please contact us.' })
  }
  await markPaid(o, pid, 'checkout')
  res.json(publicView(o))
})

// Customer closed the payment window or the gateway reported a failure. The order stays open so they can retry.
r.post('/event', (req, res) => {
  const o = own(req, res); if (!o) return
  const event = req.body.event === 'payment_failed' ? 'payment_failed' : 'checkout_closed'
  o.paymentStatus = 'failed'
  logPayment({ orderId: o.id, event, provider: rzp.live ? 'razorpay' : 'demo', method: 'upi', app: o.payApp, amount: o.total, status: 'failed', code: String(req.body.code || '').slice(0, 60), detail: String(req.body.description || '').slice(0, 200) })
  res.json({ ok: true })
})

// Demo mode only (no Razorpay keys, not production): lets you test the whole flow without real money.
r.post('/demo', async (req, res) => {
  if (rzp.live || (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_PAYMENTS !== 'true')) return res.status(404).json({ error: 'Not found' })
  const o = own(req, res); if (!o) return
  if (req.body.outcome === 'success') { await markPaid(o, `demo_${Date.now().toString(36)}`, 'demo'); return res.json(publicView(o)) }
  o.paymentStatus = 'failed'
  logPayment({ orderId: o.id, event: 'payment_failed', provider: 'demo', method: 'upi', app: o.payApp, amount: o.total, status: 'failed', detail: 'Simulated failure' })
  res.status(402).json({ error: 'Payment failed (simulated). You can try again.' })
})

// Razorpay webhook: confirms payments even if the customer closes the browser after paying.
export async function webhook(req, res) {
  if (!rzp.verifyWebhook(req.body, req.get('x-razorpay-signature'))) return res.status(400).end()
  try {
    const ev = JSON.parse(req.body.toString('utf8'))
    const p = ev?.payload?.payment?.entity
    const o = p && getDb().orders.find((x) => x.rzpOrderId === p.order_id)
    if (o && (ev.event === 'payment.captured' || ev.event === 'order.paid')) await markPaid(o, p.id, 'webhook')
    else if (o && ev.event === 'payment.failed') logPayment({ orderId: o.id, event: 'payment_failed', provider: 'razorpay', method: p.method, providerPaymentId: p.id, amount: o.total, status: 'failed', source: 'webhook', detail: p.error_description })
  } catch { /* ignore malformed body */ }
  res.json({ ok: true })
}
export default r
