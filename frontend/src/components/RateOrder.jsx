import { useState } from 'react'
import { api } from '../api.js'
import { Stars, StarInput } from './Stars.jsx'
import { useI18n } from '../context/I18n.jsx'

// Shown on a delivered order: rate every waffle with stars and an optional comment (once per order).
export default function RateOrder({ order, phone: known = '', onChange }) {
  const { t, itemName } = useI18n()
  const [phone, setPhone] = useState(known)
  const [vals, setVals] = useState({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  if (order.rating) {
    return (
      <div className="rate done">
        <h4>{t('Thanks for rating')}</h4>
        <ul>{order.rating.items.map((r) => <li key={r.id}><span>{itemName(r.id, r.name)}</span><Stars value={r.stars} /></li>)}</ul>
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
    } catch (x) { setErr(t(x.message)) } finally { setBusy(false) }
  }

  return (
    <form className="rate" onSubmit={submit} noValidate>
      <h4>{t('Your waffles are delivered. How were they?')}</h4>
      {order.items.map((i) => (
        <div className="ritem" key={i.id}>
          <b>{itemName(i.id, i.name)}</b>
          <StarInput label={t('Rate {name}', { name: itemName(i.id, i.name) })} value={vals[i.id]?.stars || 0} onChange={(n) => set(i.id, 'stars', n)} />
          <input placeholder={t('Say something about it (optional)')} maxLength={300} value={vals[i.id]?.comment || ''} onChange={(e) => set(i.id, 'comment', e.target.value)} aria-label={t('Comment on {name}', { name: itemName(i.id, i.name) })} />
        </div>
      ))}
      {!known && (
        <>
          <label htmlFor="rp">{t('Phone number used for this order')}</label>
          <input id="rp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
        </>
      )}
      {err && <p className="ferr" role="alert">{err}</p>}
      <button className="btn gold" type="submit" disabled={busy}>{busy ? t('Sending...') : t('Submit rating')}</button>
    </form>
  )
}
