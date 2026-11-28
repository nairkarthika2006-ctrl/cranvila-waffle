import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { money } from '../data.js'
import { useStore } from '../context/Store.jsx'
import PaymentLogo from './PaymentLogo.jsx'
import { useI18n } from '../context/I18n.jsx'

const schemes = { gpay: 'tez://upi/pay?', phonepe: 'phonepe://pay?', paytm: 'paytmmp://pay?', upi: 'upi://pay?' }

// Step shown while an online order is waiting for payment.
export default function PayPanel({ order, onUpdated }) {
  const { config, customer } = useStore()
  const { t } = useI18n()
  const method = config.paymentMethods.find((p) => p.id === order.paymentMethod)
  const [phone, setPhone] = useState(customer.phone || '')
  const [ref, setRef] = useState('')
  const [qr, setQr] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const query = `pa=${encodeURIComponent(config.upi.vpa)}&pn=${encodeURIComponent(config.upi.name)}&am=${order.total.toFixed(2)}&cu=INR&tn=${order.id}`

  useEffect(() => { QRCode.toDataURL(`upi://pay?${query}`, { width: 220, margin: 1 }).then(setQr).catch(() => {}) }, [query])

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    try { onUpdated(await api.pay(order.id, phone, ref.trim())) }
    catch (x) { setErr(t(x.message)) }
    finally { setBusy(false) }
  }
  const by = order.paymentDeadline && new Date(order.paymentDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="card paybox">
      <h3>{t('Pay {amount}', { amount: money(order.total) })}</h3>
      <p className="muted">{t('Pay with')} <b>{t(method?.name || '')}</b> {t('before {time}. After that the order is cancelled automatically.', { time: by })}</p>
      <div className="paygrid">
        <div>
          <a className="btn gold block" href={`${schemes[order.paymentMethod] || schemes.upi}${query}`}>
            <PaymentLogo id={order.paymentMethod} /> {t('Open {method}', { method: t(method?.name || '') })}
          </a>
          <p className="hint">{t('On a phone this opens the app with the amount filled in. On a computer, scan the code with any UPI app.')}</p>
          <p className="upiid">{t('UPI ID:')} <b>{config.upi.vpa}</b></p>
        </div>
        {qr && <img className="qr" src={qr} alt={t('UPI QR code to pay {amount}', { amount: money(order.total) })} width="170" height="170" />}
      </div>
      <form onSubmit={submit} noValidate>
        <label htmlFor="utr">{t('UPI transaction ID')}</label>
        <input id="utr" value={ref} onChange={(e) => setRef(e.target.value)} placeholder={t('12 digit number from your payment app')} autoComplete="off" />
        {!customer.phone && (<><label htmlFor="pph">{t('Phone number used for this order')}</label><input id="pph" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></>)}
        {err && <p className="ferr" role="alert">{err}</p>}
        <button className="btn dark block" type="submit" disabled={busy}>{busy ? t('Saving...') : t('I have paid')}</button>
      </form>
    </div>
  )
}
