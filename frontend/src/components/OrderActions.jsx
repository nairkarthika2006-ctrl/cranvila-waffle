import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

const REASONS = ['Ordered by mistake', 'Want to change my order', 'Taking too long', 'Found another option', 'Other']

// Confirm (COD) and cancel (two confirmations) controls for one order. Phone number proves it is the customer's order.
export default function OrderActions({ order, phone: known = '', onChange }) {
  const [phone, setPhone] = useState(known)
  const [stage, setStage] = useState(0) // 0 idle, 1 first confirmation, 2 final confirmation
  const [token, setToken] = useState('')
  const [reason, setReason] = useState(REASONS[0])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const needConfirm = order.state === 'pending_confirmation'
  if (!needConfirm && !order.canCancel) return null

  const run = async (fn) => { setBusy(true); setErr(''); try { await fn() } catch (e) { setErr(e.message) } finally { setBusy(false) } }
  const confirm = () => run(async () => onChange(await api.confirmOrder(order.id, { phone })))
  const first = () => run(async () => { const r = await api.cancelOrder(order.id, { phone, stage: 1 }); setToken(r.token); setStage(2) })
  const final = () => run(async () => { const o = await api.cancelOrder(order.id, { phone, stage: 2, token, reason }); setStage(0); onChange(o) })

  return (
    <div className="actions">
      {!known && (needConfirm || stage === 1) && (
        <>
          <label htmlFor="ap">Phone number used for this order</label>
          <input id="ap" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
        </>
      )}

      {stage === 0 && (
        <div className="btns">
          {needConfirm && <button className="btn gold" onClick={confirm} disabled={busy}>{busy ? 'Confirming...' : 'Confirm order'}</button>}
          {order.canCancel && <button className="btn outline" onClick={() => { setErr(''); setStage(1) }} disabled={busy}>Cancel order</button>}
        </div>
      )}

      {stage === 1 && (
        <div className="confirmbox" role="alertdialog" aria-label="Cancel order, step 1 of 2">
          <p className="step">Step 1 of 2</p>
          <p><b>Do you want to cancel order {order.id}?</b></p>
          <div className="btns">
            <button className="btn gold sm" onClick={() => setStage(0)}>No, keep my order</button>
            <button className="btn outline sm" onClick={first} disabled={busy}>{busy ? 'Checking...' : 'Yes, I want to cancel'}</button>
          </div>
        </div>
      )}

      {stage === 2 && (
        <div className="confirmbox danger" role="alertdialog" aria-label="Cancel order, step 2 of 2">
          <p className="step">Step 2 of 2: final confirmation</p>
          <p><b>Are you really sure?</b> Cancelling order {order.id} cannot be undone.{order.paymentStatus === 'paid' && ' Your payment will be refunded.'}</p>
          <label htmlFor="rs">Reason</label>
          <select id="rs" value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
          <div className="btns">
            <button className="btn gold sm" onClick={() => setStage(0)}>No, keep my order</button>
            <button className="btn dark sm" onClick={final} disabled={busy}>{busy ? 'Cancelling...' : 'Yes, cancel my order'}</button>
          </div>
        </div>
      )}

      {err && <p className="ferr" role="alert">{err}</p>}
      <p className="hint">Read our <Link to="/cancellation-policy">cancellation policy</Link>.</p>
    </div>
  )
}
