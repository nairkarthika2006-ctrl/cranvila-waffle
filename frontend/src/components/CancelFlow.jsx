import { useState } from 'react'
import { api } from '../api.js'
import { useStore } from '../context/Store.jsx'
import { useI18n } from '../context/I18n.jsx'

const reasons = ['Ordered by mistake', 'Want to change my order', 'Taking too long', 'Found another option', 'Other']

// Two confirmations: (1) confirm you want to cancel and prove the phone number, (2) final confirmation with a reason.
export default function CancelFlow({ order, onUpdated }) {
  const { customer, config } = useStore()
  const { t } = useI18n()
  const [stage, setStage] = useState(0)
  const [phone, setPhone] = useState(customer.phone || '')
  const [token, setToken] = useState('')
  const [reason, setReason] = useState(reasons[0])
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const reset = () => { setStage(0); setErr(''); setToken('') }
  const first = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    try { const r = await api.cancelStart(order.id, phone); setToken(r.token); setStage(2) }
    catch (x) { setErr(t(x.message)) } finally { setBusy(false) }
  }
  const second = async () => {
    setBusy(true); setErr('')
    try { onUpdated(await api.cancelConfirm(order.id, token, reason)) }
    catch (x) { setErr(t(x.message)); if (x.status === 409) setStage(1) } finally { setBusy(false) }
  }

  if (stage === 0) return <p className="more left"><button className="btn outline" onClick={() => setStage(1)}>{t('Cancel this order')}</button></p>

  return (
    <div className="card cancelbox" role="group" aria-label={t('Cancel order')}>
      {stage === 1 && (
        <form onSubmit={first} noValidate>
          <h3>{t('Cancel order {id}?', { id: order.id })} <span className="step">{t('Confirmation 1 of 2')}</span></h3>
          <ul className="policy">{config.cancelPolicy.map((p) => <li key={p}>{t(p)}</li>)}</ul>
          <label htmlFor="cph">{t('Enter the phone number used for this order')}</label>
          <input id="cph" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          {err && <p className="ferr" role="alert">{err}</p>}
          <div className="btns left"><button type="button" className="btn dark" onClick={reset}>{t('Keep my order')}</button><button className="btn outline" type="submit" disabled={busy}>{busy ? t('Checking...') : t('Yes, continue')}</button></div>
        </form>
      )}
      {stage === 2 && (
        <div>
          <h3>{t('Are you really sure?')} <span className="step">{t('Confirmation 2 of 2')}</span></h3>
          <p>{t('This cannot be undone. Your waffles will not be made.')}</p>
          <label htmlFor="crs">{t('Reason')}</label>
          <select id="crs" value={reason} onChange={(e) => setReason(e.target.value)}>{reasons.map((r) => <option key={r} value={r}>{t(r)}</option>)}</select>
          {err && <p className="ferr" role="alert">{err}</p>}
          <div className="btns left"><button className="btn dark" onClick={reset}>{t('No, keep my order')}</button><button className="btn danger" onClick={second} disabled={busy}>{busy ? t('Cancelling...') : t('Yes, cancel my order')}</button></div>
        </div>
      )}
    </div>
  )
}
