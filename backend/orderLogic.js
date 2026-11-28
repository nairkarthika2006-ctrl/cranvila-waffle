import { getDb, save, logPayment, customerOf } from './store.js'
import * as rzp from './razorpay.js'

export const CONFIRM_MINUTES = Number(process.env.CONFIRM_MINUTES || 20) // COD: customer must confirm within this time
export const PAY_MINUTES = Number(process.env.PAY_MINUTES || 15)         // online: payment must finish within this time
export const NO_RESPONSE_LIMIT = Number(process.env.NO_RESPONSE_LIMIT || 2) // COD is switched off after this many no-response cancellations
const inMin = (m) => new Date(Date.now() + m * 60000).toISOString()
export { inMin }

export async function startRefund(o) {
  logPayment({ orderId: o.id, event: 'refund_requested', method: 'online', amount: o.total, status: 'refund_pending', providerPaymentId: o.providerPaymentId })
  try {
    if (rzp.live && o.providerPaymentId) await rzp.refund(o.providerPaymentId, Math.round(o.total * 100))
    else if (rzp.live) return // no payment id: refund by hand from the Razorpay dashboard
    o.paymentStatus = 'refunded'
    logPayment({ orderId: o.id, event: 'refund_done', method: 'online', amount: o.total, status: 'refunded', provider: rzp.live ? 'razorpay' : 'demo' })
  } catch (e) {
    o.paymentStatus = 'refund_failed'
    logPayment({ orderId: o.id, event: 'refund_failed', method: 'online', amount: o.total, status: 'refund_failed', detail: e.message })
  }
  save()
}

// by: 'customer' | 'admin' | 'system'
export function cancelOrder(o, by, reason, { noResponse = false, confirmations = 0 } = {}) {
  if (o.status === 'cancelled') return
  o.status = 'cancelled'
  o.cancellation = { at: new Date().toISOString(), by, reason, confirmations, noResponse }
  const c = customerOf(o)
  if (c) { c.cancelledCount = (c.cancelledCount || 0) + 1; if (noResponse) c.noResponseCount = (c.noResponseCount || 0) + 1 }
  if (o.paymentMethod === 'online' && o.paymentStatus === 'paid') { o.paymentStatus = 'refund_pending'; startRefund(o) }
  else if (o.paymentStatus === 'pending' || o.paymentStatus === 'failed') o.paymentStatus = 'not_paid'
  else if (o.paymentMethod === 'cod') o.paymentStatus = 'not_paid'
}

export async function markPaid(o, paymentId, source) {
  if (o.paymentStatus === 'paid' || o.paymentStatus === 'refund_pending' || o.paymentStatus === 'refunded' || o._marking) return
  o._marking = true // the checkout callback and the webhook usually arrive together; only the first one may proceed
  try { await finishPaid(o, paymentId, source) } finally { delete o._marking }
}

async function finishPaid(o, paymentId, source) {
  let detail = {}
  if (rzp.live) { try { const p = await rzp.fetchPayment(paymentId); detail = { method: p.method, vpa: p.vpa || null, bank: p.bank || null, wallet: p.wallet || null } } catch { /* log below without detail */ } }
  o.paymentStatus = 'paid'; o.providerPaymentId = paymentId; o.paidAt = new Date().toISOString()
  logPayment({ orderId: o.id, event: 'payment_success', provider: rzp.live ? 'razorpay' : 'demo', method: detail.method || 'upi', app: o.payApp, providerPaymentId: paymentId, providerOrderId: o.rzpOrderId, amount: o.total, status: 'paid', source, ...detail })
  if (o.status === 'cancelled') { o.paymentStatus = 'refund_pending'; await startRefund(o) } // paid after cancellation (late webhook)
  else { o.status = 'confirmed'; o.confirmedAt = o.paidAt; o.confirmedBy = 'payment' }
  save()
}

// Auto-cancels COD orders nobody confirmed ("not responding") and online orders never paid.
export function sweep() {
  const now = Date.now()
  let changed = false
  for (const o of getDb().orders) {
    if (o.status === 'pending_confirmation' && now > new Date(o.confirmBy)) {
      cancelOrder(o, 'system', `No response: order was not confirmed within ${CONFIRM_MINUTES} minutes`, { noResponse: true }); changed = true
    } else if (o.status === 'pending_payment' && now > new Date(o.payBy)) {
      cancelOrder(o, 'system', `Payment was not completed within ${PAY_MINUTES} minutes`); changed = true
    }
  }
  if (changed) save()
}
