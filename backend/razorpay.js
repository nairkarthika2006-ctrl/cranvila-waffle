// Razorpay handles Google Pay, PhonePe and every other UPI app. Without keys the site runs in demo mode.
import crypto from 'crypto'
const KEY = process.env.RAZORPAY_KEY_ID, SECRET = process.env.RAZORPAY_KEY_SECRET, HOOK = process.env.RAZORPAY_WEBHOOK_SECRET
export const live = Boolean(KEY && SECRET)
export const keyId = KEY

async function call(method, path, body) {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + Buffer.from(`${KEY}:${SECRET}`).toString('base64') },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error?.description || 'Razorpay request failed')
  return data
}
export const createOrder = (paise, receipt) => call('POST', '/orders', { amount: paise, currency: 'INR', receipt })
export const fetchPayment = (id) => call('GET', `/payments/${id}`)
export const refund = (paymentId, paise) => call('POST', `/payments/${paymentId}/refund`, { amount: paise })

const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y) }
const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex')
export const verifySignature = (orderId, paymentId, sig) => live && same(hmac(SECRET, `${orderId}|${paymentId}`), sig || '')
export const verifyWebhook = (raw, sig) => Boolean(HOOK) && same(hmac(HOOK, raw), sig || '')
