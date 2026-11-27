import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { img, rupee, PAY_OPTIONS, PAY_LABEL } from '../data.js'
import { useStore } from '../context/Store.jsx'
import OrderActions from '../components/OrderActions.jsx'

const loadCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve()
  const s = document.createElement('script')
  s.src = 'https://checkout.razorpay.com/v1/checkout.js'
  s.onload = resolve
  s.onerror = () => reject(new Error('Could not load the payment window. Check your connection and try again.'))
  document.body.appendChild(s)
})

export default function Cart() {
  const { lines, subtotal, deliveryFee, deliveryGst, gst, total, config, add, remove, drop, clear } = useStore()
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' })
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
          try { setPlaced(await api.payVerify({ orderId: order.id, phone: form.phone, ...r })) } catch (e) { setFormError(e.message) }
        },
        modal: { ondismiss: () => { api.payEvent({ orderId: order.id, phone: form.phone, event: 'checkout_closed' }); setFormError('Payment was not completed. You can try again.') } },
      })
      rz.on('payment.failed', (r) => api.payEvent({ orderId: order.id, phone: form.phone, event: 'payment_failed', code: r.error?.code, description: r.error?.description }))
      rz.open()
    } catch (e) { setFormError(e.message) } finally { setBusy(false) }
  }
  const demoPay = async (outcome) => {
    setBusy(true); setFormError('')
    try { setPlaced(await api.payDemo({ orderId: placed.id, phone: form.phone, outcome })); setDemo(false) } catch (e) { setFormError(e.message) } finally { setBusy(false) }
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErrors({}); setFormError('')
    try {
      const order = await api.placeOrder({ ...form, paymentMethod: opt.method, payApp: opt.app, items: lines.map((l) => ({ id: l.item.id, qty: l.qty })) })
      setPlaced(order)
      clear()
      if (order.state === 'pending_payment') { setBusy(false); await startPayment(order) }
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(err.message)
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
        <section className="phead"><div className="wrap"><h1>{heads[placed.state]}</h1><p>{placed.message}</p></div></section>
        <section className="sec">
          <div className="wrap narrow">
            <div className="card center">
              <p className="muted">Your order ID</p>
              <p className="bigid">{placed.id}</p>
              <p>{placed.paymentMethod === 'cod' ? 'To pay on delivery' : `Online payment (${PAY_LABEL[placed.payApp] || 'UPI'})`}: <b>{rupee(placed.total)}</b></p>
              {placed.paymentStatus === 'paid' && <p className="ok">Payment received. Thank you.</p>}

              {placed.state === 'pending_confirmation' && <p className="notice">Tap <b>Confirm order</b> within {mins} min. If we do not hear from you, this order is cancelled automatically.</p>}
              {placed.state === 'pending_payment' && !demo && (
                <>
                  <p className="notice">Pay within {mins} min or the order will be cancelled.</p>
                  <button className="btn gold" onClick={() => startPayment(placed)} disabled={busy}>{busy ? 'Opening payment...' : `Pay ${rupee(placed.total)}`}</button>
                </>
              )}
              {placed.state === 'pending_payment' && demo && (
                <div className="confirmbox">
                  <p className="step">Demo mode: no real money moves</p>
                  <p>No payment gateway keys are set yet, so this is a simulated {PAY_LABEL[placed.payApp] || 'UPI'} payment of {rupee(placed.total)}.</p>
                  <div className="btns">
                    <button className="btn gold sm" onClick={() => demoPay('success')} disabled={busy}>Simulate successful payment</button>
                    <button className="btn outline sm" onClick={() => demoPay('fail')} disabled={busy}>Simulate failure</button>
                  </div>
                </div>
              )}
              {formError && <p className="ferr" role="alert">{formError}</p>}

              <OrderActions order={placed} phone={form.phone} onChange={setPlaced} />
              <div className="btns"><Link className="btn gold" to={`/tracking?id=${placed.id}`}>Track this order</Link><Link className="btn outline" to="/menu">Order more</Link></div>
              <p className="hint">Save this ID. You can use it any time on the Order tracking page.</p>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <section className="phead"><div className="wrap"><h1>Your order</h1><p>Check your waffles and tell us where to send them.</p></div></section>
      <section className="sec">
        <div className="wrap">
          {lines.length === 0 ? (
            <div className="card center">
              <h3>Your order is empty</h3>
              <p>Pick a waffle from the menu and it will appear here.</p>
              <div className="btns"><Link className="btn gold" to="/menu">Browse the menu</Link></div>
            </div>
          ) : (
            <div className="cartgrid">
              <div className="card">
                <h3>Items</h3>
                <ul className="lines">
                  {lines.map(({ item, qty }) => (
                    <li key={item.id}>
                      <img src={img(item.photo)} alt="" style={item.pos ? { objectPosition: item.pos } : undefined} />
                      <div className="lname"><b>{item.name}</b><span>{rupee(item.price)} each</span>
                        <button className="link" onClick={() => drop(item.id)}>Remove</button></div>
                      <div className="qty" role="group" aria-label={`Quantity of ${item.name}`}>
                        <button onClick={() => remove(item.id)} aria-label="Remove one">−</button><span>{qty}</span><button onClick={() => add(item.id)} aria-label="Add one">+</button>
                      </div>
                      <b className="ltotal">{rupee(item.price * qty)}</b>
                    </li>
                  ))}
                </ul>
                <dl className="sum">
                  <div><dt>Subtotal</dt><dd>{rupee(subtotal)}</dd></div>
                  <div><dt>Delivery</dt><dd>{deliveryFee === 0 ? 'Free' : rupee(deliveryFee)}</dd></div>
                  <div><dt>CGST</dt><dd>{rupee(gst.cgst)}</dd></div>
                  <div><dt>SGST</dt><dd>{rupee(gst.sgst)}</dd></div>
                  {deliveryFee > 0 && <p className="hint">Add {rupee(config.freeDeliveryAbove - subtotal)} more for free delivery.</p>}
                  <div className="grand"><dt>Total</dt><dd>{rupee(total)}</dd></div>
                </dl>
                <p className="hint">GST included in the total: {rupee(gst.total)} (items 5%{deliveryFee > 0 ? `, delivery ${config.deliveryGst}%` : ''}).</p>
              </div>

              <form className="card" onSubmit={submit} noValidate>
                <h3>Delivery details</h3>
                <label htmlFor="cn">Name</label>
                <input id="cn" value={form.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} />
                {errors.name && <p className="ferr">{errors.name}</p>}
                <label htmlFor="cp">Phone</label>
                <input id="cp" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" aria-invalid={!!errors.phone} />
                {errors.phone && <p className="ferr">{errors.phone}</p>}
                <label htmlFor="ca">Delivery address</label>
                <textarea id="ca" rows="3" value={form.address} onChange={set('address')} autoComplete="street-address" aria-invalid={!!errors.address} />
                {errors.address && <p className="ferr">{errors.address}</p>}
                <label htmlFor="cd">Note for the kitchen (optional)</label>
                <input id="cd" value={form.note} onChange={set('note')} />

                <h3>Payment method</h3>
                <div className="pays" role="radiogroup" aria-label="Payment method">
                  {PAY_OPTIONS.map((o) => (
                    <label key={o.key} className={`pay${pay === o.key ? ' on' : ''}`}>
                      <input type="radio" name="pay" checked={pay === o.key} onChange={() => setPay(o.key)} />
                      <span><b>{o.label}</b><small>{o.hint}</small></span>
                    </label>
                  ))}
                </div>
                {errors.paymentMethod && <p className="ferr">{errors.paymentMethod}</p>}

                {formError && <p className="ferr" role="alert">{formError}</p>}
                <button className="btn gold block" type="submit" disabled={busy}>{busy ? 'Please wait...' : opt.method === 'cod' ? `Place order · ${rupee(total)}` : `Place order and pay · ${rupee(total)}`}</button>
                <p className="hint">You can cancel before the rider leaves. See the <Link to="/cancellation-policy">cancellation policy</Link>.</p>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
