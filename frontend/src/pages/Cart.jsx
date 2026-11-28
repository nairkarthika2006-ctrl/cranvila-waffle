import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { img, rupee, PAY_OPTIONS, PAY_LABEL } from '../data.js'
import { useStore } from '../context/Store.jsx'
import OrderActions from '../components/OrderActions.jsx'
import { useI18n } from '../context/I18n.jsx'

const loadCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve()
  const s = document.createElement('script')
  s.src = 'https://checkout.razorpay.com/v1/checkout.js'
  s.onload = resolve
  s.onerror = () => reject(new Error('Could not load the payment window. Check your connection and try again.'))
  document.body.appendChild(s)
})

export default function Cart() {
  const { lines, subtotal, discount, coupon, discountedSubtotal, deliveryFee, gst, total, config, add, remove, drop, clear, applyCoupon } = useStore()
  const { t, itemName } = useI18n()
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '', scheduledAt: '' })
  const [couponInput, setCouponInput] = useState(coupon)
  const [pay, setPay] = useState('cod')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [placed, setPlaced] = useState(null)
  const [demo, setDemo] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const opt = PAY_OPTIONS.find((o) => o.key === pay)

  // Opens the payment window (Razorpay) or the demo payment box when no gateway keys are set.
  const startPayment = async (order) => {
    setBusy(true); setFormError('')
    try {
      const p = await api.payCreate({ orderId: order.id, phone: form.phone })
      if (p.mode === 'demo') { setDemo(true); return }
      await loadCheckout()
      const rz = new window.Razorpay({
        key: p.keyId, amount: p.amount, currency: 'INR', order_id: p.rzpOrderId, name: 'Cranvila Waffle', description: `Order ${order.id}`,
        prefill: { name: p.name, contact: p.phone, method: 'upi' },
        theme: { color: '#8E1F3D' },
        handler: async (r) => {
          try { setPlaced(await api.payVerify({ orderId: order.id, phone: form.phone, ...r })) } catch (e) { setFormError(t(e.message)) }
        },
        modal: { ondismiss: () => { api.payEvent({ orderId: order.id, phone: form.phone, event: 'checkout_closed' }); setFormError(t('Payment was not completed. You can try again.')) } },
      })
      rz.on('payment.failed', (r) => api.payEvent({ orderId: order.id, phone: form.phone, event: 'payment_failed', code: r.error?.code, description: r.error?.description }))
      rz.open()
    } catch (e) { setFormError(t(e.message)) } finally { setBusy(false) }
  }
  const demoPay = async (outcome) => {
    setBusy(true); setFormError('')
    try { setPlaced(await api.payDemo({ orderId: placed.id, phone: form.phone, outcome })); setDemo(false) } catch (e) { setFormError(t(e.message)) } finally { setBusy(false) }
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErrors({}); setFormError('')
    try {
      const order = await api.placeOrder({
        ...form,
        paymentMethod: opt.method,
        payApp: opt.app,
        couponCode: coupon,
        items: lines.map((l) => ({ id: l.item.id, qty: l.qty, customizations: l.customizations })),
      })
      setPlaced(order)
      clear()
      if (order.state === 'pending_payment') { setBusy(false); await startPayment(order) }
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(t(err.message))
    } finally {
      setBusy(false)
    }
  }

  const [, tick] = useState(0)
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(t) }, [])

  if (placed) {
    const deadline = placed.confirmBy || placed.payBy
    const mins = deadline ? Math.max(0, Math.ceil((new Date(deadline) - Date.now()) / 60000)) : 0
    const heads = { pending_confirmation: 'Confirm your order', pending_payment: 'Complete your payment', confirmed: 'Order confirmed', cancelled: 'Order cancelled' }
    return (
      <>
        <section className="phead"><div className="wrap"><h1>{t(heads[placed.state])}</h1><p>{t(placed.message)}</p></div></section>
        <section className="sec">
          <div className="wrap narrow">
            <div className="card center">
              <p className="muted">{t('Your order ID')}</p>
              <p className="bigid">{placed.id}</p>
              <p>{placed.paymentMethod === 'cod' ? t('To pay on delivery') : t('Online payment ({method})', { method: PAY_LABEL[placed.payApp] || 'UPI' })}: <b>{rupee(placed.total)}</b></p>
              {placed.paymentStatus === 'paid' && <p className="ok">{t('Payment received. Thank you.')}</p>}

              {placed.state === 'pending_confirmation' && <p className="notice">{t('Tap Confirm order within {minutes} min. If we do not hear from you, this order is cancelled automatically.', { minutes: mins })}</p>}
              {placed.state === 'pending_payment' && !demo && (
                <>
                  <p className="notice">{t('Pay within {minutes} min or the order will be cancelled.', { minutes: mins })}</p>
                  <button className="btn gold" onClick={() => startPayment(placed)} disabled={busy}>{busy ? t('Opening payment...') : t('Pay {amount}', { amount: rupee(placed.total) })}</button>
                </>
              )}
              {placed.state === 'pending_payment' && demo && (
                <div className="confirmbox">
                  <p className="step">{t('Demo mode: no real money moves')}</p>
                  <p>{t('No payment gateway keys are set yet, so this is a simulated {method} payment of {amount}.', { method: PAY_LABEL[placed.payApp] || 'UPI', amount: rupee(placed.total) })}</p>
                  <div className="btns">
                    <button className="btn gold sm" onClick={() => demoPay('success')} disabled={busy}>{t('Simulate successful payment')}</button>
                    <button className="btn outline sm" onClick={() => demoPay('fail')} disabled={busy}>{t('Simulate failure')}</button>
                  </div>
                </div>
              )}
              {formError && <p className="ferr" role="alert">{formError}</p>}

              <OrderActions order={placed} phone={form.phone} onChange={setPlaced} />
              <div className="btns"><Link className="btn gold" to={`/tracking?id=${placed.id}`}>{t('Track this order')}</Link><Link className="btn outline" to="/menu">{t('Order more')}</Link></div>
              <p className="hint">{t('Save this ID. You can use it any time on the Order tracking page.')}</p>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <section className="phead"><div className="wrap"><h1>{t('Your order')}</h1><p>{t('Check your waffles and tell us where to send them.')}</p></div></section>
      <section className="sec">
        <div className="wrap">
          {lines.length === 0 ? (
            <div className="card center">
              <h3>{t('Your order is empty')}</h3>
              <p>{t('Pick a waffle from the menu and it will appear here.')}</p>
              <div className="btns"><Link className="btn gold" to="/menu">{t('Browse the menu')}</Link></div>
            </div>
          ) : (
            <div className="cartgrid">
              <div className="card">
                <h3>{t('Items')}</h3>
                <ul className="lines">
                  {lines.map((line) => {
                    const { item, qty } = line
                    return (
                    <li key={item.id}>
                      <img src={img(item.photo)} alt="" style={item.pos ? { objectPosition: item.pos } : undefined} />
                      <div className="lname"><b>{itemName(item.id, item.name)}</b><span>{rupee(item.price + line.customizations.reduce((a, x) => a + Number(x.price || 0), 0))} {t('each')}</span>
                        {line.customizations.length > 0 && <small>{line.customizations.map((x) => t(x.name)).join(' · ')}</small>}
                        <button className="link" onClick={() => drop(item.id)}>{t('Remove')}</button></div>
                      <div className="qty" role="group" aria-label={t('Quantity of {name}', { name: itemName(item.id, item.name) })}>
                        <button onClick={() => remove(item.id)} aria-label={t('Remove one')}>−</button><span>{qty}</span><button onClick={() => add(item.id)} aria-label={t('Add one')}>+</button>
                      </div>
                      <b className="ltotal">{rupee((item.price + line.customizations.reduce((a, x) => a + Number(x.price || 0), 0)) * qty)}</b>
                    </li>
                    )
                  })}
                </ul>
                <dl className="sum">
                  <div><dt>{t('Subtotal')}</dt><dd>{rupee(subtotal)}</dd></div>
                  {discount > 0 && <div><dt>WELCOME10</dt><dd>−{rupee(discount)}</dd></div>}
                  <div><dt>{t('Delivery')}</dt><dd>{deliveryFee === 0 ? t('Free') : rupee(deliveryFee)}</dd></div>
                  <div><dt>{t('CGST')}</dt><dd>{rupee(gst.cgst)}</dd></div>
                  <div><dt>{t('SGST')}</dt><dd>{rupee(gst.sgst)}</dd></div>
                  {deliveryFee > 0 && <p className="hint">{t('Add {amount} more for free delivery.', { amount: rupee(config.freeDeliveryAbove - subtotal) })}</p>}
                  <div className="grand"><dt>{t('Total')}</dt><dd>{rupee(total)}</dd></div>
                </dl>
                <div className="coupon-box">
                  <input aria-label={t('Coupon code')} value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder={t('Coupon code')} />
                  <button type="button" className="btn outline sm" onClick={() => applyCoupon(couponInput)}>{t('Apply')}</button>
                </div>
                {coupon && <p className="ok">{t('WELCOME10 applied: 10% off.')}</p>}
                {discount === 0 && couponInput.trim().toUpperCase() === 'WELCOME10' && coupon !== 'WELCOME10' && <p className="hint">{t('Tap Apply to use WELCOME10.')}</p>}
                <p className="hint">{t('GST included in the total: {amount} (items 5%{delivery}).', { amount: rupee(gst.total), delivery: deliveryFee > 0 ? `, delivery ${config.deliveryGst}%` : '' })}</p>
              </div>

              <form className="card" onSubmit={submit} noValidate>
                <h3>{t('Delivery details')}</h3>
                <label htmlFor="cn">{t('Name')}</label>
                <input id="cn" value={form.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} />
                {errors.name && <p className="ferr">{t(errors.name)}</p>}
                <label htmlFor="cp">{t('Phone')}</label>
                <input id="cp" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" aria-invalid={!!errors.phone} />
                {errors.phone && <p className="ferr">{t(errors.phone)}</p>}
                <label htmlFor="ca">{t('Delivery address')}</label>
                <textarea id="ca" rows="3" value={form.address} onChange={set('address')} autoComplete="street-address" aria-invalid={!!errors.address} />
                {errors.address && <p className="ferr">{t(errors.address)}</p>}
                <label htmlFor="cd">{t('Note for the kitchen (optional)')}</label>
                <input id="cd" value={form.note} onChange={set('note')} />
                <label htmlFor="scheduled">{t('Schedule order (optional)')}</label>
                <input id="scheduled" type="datetime-local" value={form.scheduledAt} onChange={set('scheduledAt')} />

                <h3>{t('Payment method')}</h3>
                <div className="pays" role="radiogroup" aria-label={t('Payment method')}>
                  {PAY_OPTIONS.map((o) => (
                    <label key={o.key} className={`pay${pay === o.key ? ' on' : ''}`}>
                      <input type="radio" name="pay" checked={pay === o.key} onChange={() => setPay(o.key)} />
                      <span><b>{t(o.label)}</b><small>{t(o.hint)}</small></span>
                    </label>
                  ))}
                </div>
                {errors.paymentMethod && <p className="ferr">{t(errors.paymentMethod)}</p>}

                {formError && <p className="ferr" role="alert">{formError}</p>}
                <button className="btn gold block" type="submit" disabled={busy}>{busy ? t('Please wait...') : opt.method === 'cod' ? t('Place order · {amount}', { amount: rupee(total) }) : t('Place order and pay · {amount}', { amount: rupee(total) })}</button>
                <p className="hint">{t('You can cancel before the rider leaves. See the')} <Link to="/cancellation-policy">{t('cancellation policy')}</Link>.</p>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
