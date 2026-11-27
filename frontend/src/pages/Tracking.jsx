import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { steps, rupee, PAY_LABEL } from '../data.js'
import OrderActions from '../components/OrderActions.jsx'
import RateOrder from '../components/RateOrder.jsx'

export default function Tracking() {
  const [params, setParams] = useSearchParams()
  const id = (params.get('id') || '').toUpperCase()
  const [value, setValue] = useState(id)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Load the order whenever the ID in the address changes, then refresh every 15 s until delivered.
  useEffect(() => {
    if (!id) { setOrder(null); return }
    let stop = false, timer
    const load = async (first) => {
      if (first) setLoading(true)
      try {
        const o = await api.track(id)
        if (stop) return
        setOrder(o); setError('')
        if (o.step < 3 && o.state !== 'cancelled') timer = setTimeout(() => load(false), 15000)
      } catch (err) {
        if (stop) return
        if (first) { setOrder(null); setError(err.message) }
        else timer = setTimeout(() => load(false), 15000)
      } finally {
        if (first && !stop) setLoading(false)
      }
    }
    load(true)
    return () => { stop = true; clearTimeout(timer) }
  }, [id])

  const submit = (e) => {
    e.preventDefault()
    const v = value.trim().toUpperCase()
    if (v) setParams({ id: v })
  }
  const state = (i) => order.step < 0 ? '' : (order.step === 3 || i < order.step ? 'done' : i === order.step ? 'now' : '')

  return (
    <>
      <section className="phead"><div className="wrap"><h1>Order tracking</h1><p>Enter your order ID to see where your waffles are.</p></div></section>
      <section className="sec">
        <div className="wrap narrow">
          <form className="card" onSubmit={submit}>
            <label htmlFor="oid">Order ID</label>
            <div className="inline">
              <input id="oid" placeholder="e.g. CW1002" autoComplete="off" required value={value} onChange={(e) => setValue(e.target.value)} />
              <button className="btn gold" type="submit">Track order</button>
            </div>
            <p className="hint">Demo IDs to try: CW1001, CW1002, CW1003 (CW1003 is delivered, demo phone 9876543210)</p>
          </form>

          {loading && <p className="hint">Looking up your order...</p>}

          {order && (
            <div className="card">
              <div className="rhead">
                <div><h3>Order {order.id}</h3><p>{order.message}</p></div>
                <span className="eta">{order.eta}</span>
              </div>
              {order.state === 'cancelled' ? (
                <div className="notice cancelled">
                  <b>Cancelled{order.cancellation?.by === 'system' ? ' automatically' : order.cancellation?.by === 'customer' ? ' by you' : ' by the shop'}.</b>
                  {order.cancellation?.reason && <span> {order.cancellation.reason}.</span>}
                  {order.paymentStatus === 'refund_pending' && <span> Refund in progress.</span>}
                  {order.paymentStatus === 'refunded' && <span> Refund issued to your account (5 to 7 working days).</span>}
                </div>
              ) : (
                <ol className="tsteps">
                  {steps.map((s, i) => <li key={s} className={state(i)}><i></i>{s}</li>)}
                </ol>
              )}
              <ul className="osum">
                {order.items.map((l) => <li key={l.id}><span>{l.qty} × {l.name}</span><span>{rupee(l.price * l.qty)}</span></li>)}
                <li><span>Delivery</span><span>{order.deliveryFee === 0 ? 'Free' : rupee(order.deliveryFee)}</span></li>
                {order.gst?.total > 0 && <li><span>CGST</span><span>{rupee(order.gst.cgst)}</span></li>}
                {order.gst?.total > 0 && <li><span>SGST</span><span>{rupee(order.gst.sgst)}</span></li>}
                <li className="grand"><span>Total</span><span>{rupee(order.total)}</span></li>
                <li><span>Payment</span><span>{order.paymentMethod === 'cod' ? 'Cash on delivery' : PAY_LABEL[order.payApp] || 'UPI'} · {{ paid: 'Paid', cod_due: 'Pay on delivery', pending: 'Pending', failed: 'Failed', not_paid: 'Not paid', refund_pending: 'Refund in progress', refunded: 'Refunded', refund_failed: 'Refund delayed' }[order.paymentStatus] || order.paymentStatus}</span></li>
              </ul>
              <OrderActions key={order.state} order={order} onChange={setOrder} />
              <RateOrder order={order} onChange={setOrder} />
            </div>
          )}

          {error && <p className="err" role="alert">{error} Check the ID in your confirmation and try again.</p>}
        </div>
      </section>
    </>
  )
}
