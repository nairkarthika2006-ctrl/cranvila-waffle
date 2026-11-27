import { useState } from 'react'
import { api } from '../api.js'
import { Stars, StarInput } from './Stars.jsx'

// Shown on a delivered order: rate every waffle with stars and an optional comment (once per order).
export default function RateOrder({ order, phone: known = '', onChange }) {
  const [phone, setPhone] = useState(known)
  const [vals, setVals] = useState({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  if (order.rating) {
    return (
      <div className="rate done">
        <h4>Thanks for rating</h4>
        <ul>{order.rating.items.map((r) => <li key={r.id}><span>{r.name}</span><Stars value={r.stars} /></li>)}</ul>
      </div>
    )
  }
  if (!order.canRate) return null

  const set = (id, k, v) => setVals((s) => ({ ...s, [id]: { ...s[id], [k]: v } }))
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      onChange(await api.rateOrder(order.id, { phone, ratings: order.items.map((i) => ({ id: i.id, stars: vals[i.id]?.stars, comment: vals[i.id]?.comment })) }))
    } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }

  return (
    <form className="rate" onSubmit={submit} noValidate>
      <h4>Your waffles are delivered. How were they?</h4>
      {order.items.map((i) => (
        <div className="ritem" key={i.id}>
          <b>{i.name}</b>
          <StarInput label={`Rate ${i.name}`} value={vals[i.id]?.stars || 0} onChange={(n) => set(i.id, 'stars', n)} />
          <input placeholder="Say something about it (optional)" maxLength={300} value={vals[i.id]?.comment || ''} onChange={(e) => set(i.id, 'comment', e.target.value)} aria-label={`Comment on ${i.name}`} />
        </div>
      ))}
      {!known && (
        <>
          <label htmlFor="rp">Phone number used for this order</label>
          <input id="rp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
        </>
      )}
      {err && <p className="ferr" role="alert">{err}</p>}
      <button className="btn gold" type="submit" disabled={busy}>{busy ? 'Sending...' : 'Submit rating'}</button>
    </form>
  )
}
