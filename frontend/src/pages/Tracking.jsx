import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { steps, rupee, PAY_LABEL } from '../data.js'
import OrderActions from '../components/OrderActions.jsx'
import RateOrder from '../components/RateOrder.jsx'
import { useStore } from '../context/Store.jsx'
import { useI18n } from '../context/I18n.jsx'

export default function Tracking() {
  const { add } = useStore()
  const { t, itemName } = useI18n()
  const [params, setParams] = useSearchParams()
  const id = (params.get('id') || '').toUpperCase()
  const [value, setValue] = useState(id)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [reorderPhone, setReorderPhone] = useState('')
  const [pastOrders, setPastOrders] = useState([])
  const [reorderError, setReorderError] = useState('')

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
        if (first) { setOrder(null); setError(t(err.message)) }
        else timer = setTimeout(() => load(false), 15000)
      } finally {
        if (first && !stop) setLoading(false)
      }
    }
    load(true)
    return () => { stop = true; clearTimeout(timer) }
  }, [id, t])

  const submit = (e) => {
    e.preventDefault()
    const v = value.trim().toUpperCase()
    if (v) setParams({ id: v })
  }
  const findPastOrders = async (e) => {
    e.preventDefault()
    setReorderError(''); setPastOrders([])
    try { setPastOrders(await api.reorder(reorderPhone)) }
    catch (err) { setReorderError(t(err.message)) }
  }
  const state = (i) => order.step < 0 ? '' : (order.step === 3 || i < order.step ? 'done' : i === order.step ? 'now' : '')

  return (
    <>
      <section className="phead"><div className="wrap"><h1>{t('Order tracking')}</h1><p>{t('Enter your order ID to see where your waffles are.')}</p></div></section>
      <section className="sec">
        <div className="wrap narrow">
          <form className="card" onSubmit={submit}>
            <label htmlFor="oid">{t('Order ID')}</label>
            <div className="inline">
              <input id="oid" placeholder={t('e.g. CW1002')} autoComplete="off" required value={value} onChange={(e) => setValue(e.target.value)} />
              <button className="btn gold" type="submit">{t('Track order')}</button>
            </div>
            <p className="hint">{t('Demo IDs to try: CW1001, CW1002, CW1003 (CW1003 is delivered, demo phone 9876543210)')}</p>
          </form>
          <form className="card" onSubmit={findPastOrders}>
            <h3>{t('Reorder a favourite')}</h3>
            <label htmlFor="rphone">{t('Phone number used for past orders')}</label>
            <div className="inline">
              <input id="rphone" type="tel" value={reorderPhone} onChange={(e) => setReorderPhone(e.target.value)} placeholder={t('10-digit phone number')} />
              <button className="btn outline" type="submit">{t('Find orders')}</button>
            </div>
            {reorderError && <p className="err">{reorderError}</p>}
            {pastOrders.map((old) => (
              <div className="reorder-row" key={old.id}>
                <div><b>{old.id}</b><span>{old.items.map((x) => `${x.qty} × ${itemName(x.id, x.name)}`).join(', ')}</span></div>
                <button type="button" className="btn gold sm" onClick={() => { old.items.forEach((x) => add(x.id, x.customizations || [])); setReorderPhone('') }}>{t('Add again')}</button>
              </div>
            ))}
          </form>

          {loading && <p className="hint">{t('Looking up your order...')}</p>}

          {order && (
            <div className="card">
              <div className="rhead">
                <div><h3>{t('Order')} {order.id}</h3><p>{t(order.message)}</p></div>
                <span className="eta">{t(order.eta)}</span>
              </div>
              {order.state === 'cancelled' ? (
                <div className="notice cancelled">
                  <b>{t('Cancelled')}{order.cancellation?.by === 'system' ? ` ${t('automatically')}` : order.cancellation?.by === 'customer' ? ` ${t('by you')}` : ` ${t('by the shop')}`}.</b>
                  {order.cancellation?.reason && <span> {t(order.cancellation.reason)}.</span>}
                  {order.paymentStatus === 'refund_pending' && <span> {t('Refund in progress.')}</span>}
                  {order.paymentStatus === 'refunded' && <span> {t('Refund issued to your account (5 to 7 working days).')}</span>}
                </div>
              ) : (
                <ol className="tsteps">
                  {steps.map((s, i) => <li key={s} className={state(i)}><i></i>{t(s)}</li>)}
                </ol>
              )}
              <ul className="osum">
                {order.items.map((l) => <li key={l.id}><span>{l.qty} × {itemName(l.id, l.name)}</span><span>{rupee(l.price * l.qty)}</span></li>)}
                <li><span>{t('Delivery')}</span><span>{order.deliveryFee === 0 ? t('Free') : rupee(order.deliveryFee)}</span></li>
                {order.gst?.total > 0 && <li><span>{t('CGST')}</span><span>{rupee(order.gst.cgst)}</span></li>}
                {order.gst?.total > 0 && <li><span>{t('SGST')}</span><span>{rupee(order.gst.sgst)}</span></li>}
                <li className="grand"><span>{t('Total')}</span><span>{rupee(order.total)}</span></li>
                <li><span>{t('Payment')}</span><span>{order.paymentMethod === 'cod' ? t('Cash on delivery') : t(PAY_LABEL[order.payApp] || 'UPI')} · {t(({ paid: 'Paid', cod_due: 'Pay on delivery', pending: 'Pending', failed: 'Failed', not_paid: 'Not paid', refund_pending: 'Refund in progress', refunded: 'Refunded', refund_failed: 'Refund delayed' })[order.paymentStatus] || order.paymentStatus)}</span></li>
              </ul>
              <OrderActions key={order.state} order={order} onChange={setOrder} />
              <RateOrder order={order} onChange={setOrder} />
            </div>
          )}

          {error && <p className="err" role="alert">{error} {t('Check the ID in your confirmation and try again.')}</p>}
        </div>
      </section>
    </>
  )
}
