import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { img, rupee } from '../data.js'
import { useStore } from '../context/Store.jsx'

export default function Cart() {
  const { lines, subtotal, deliveryFee, total, config, add, remove, drop, clear } = useStore()
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [placed, setPlaced] = useState(null)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErrors({}); setFormError('')
    try {
      const order = await api.placeOrder({ ...form, items: lines.map((l) => ({ id: l.item.id, qty: l.qty })) })
      setPlaced(order)
      clear()
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (placed) {
    return (
      <>
        <section className="phead"><div className="wrap"><h1>Order placed</h1><p>Thank you. Your waffles are on their way to the iron.</p></div></section>
        <section className="sec">
          <div className="wrap narrow">
            <div className="card center">
              <p className="muted">Your order ID</p>
              <p className="bigid">{placed.id}</p>
              <p>Total to pay on delivery: <b>{rupee(placed.total)}</b></p>
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
                  {deliveryFee > 0 && <p className="hint">Add {rupee(config.freeDeliveryAbove - subtotal)} more for free delivery.</p>}
                  <div className="grand"><dt>Total</dt><dd>{rupee(total)}</dd></div>
                </dl>
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
                {formError && <p className="ferr" role="alert">{formError}</p>}
                <button className="btn gold block" type="submit" disabled={busy}>{busy ? 'Placing order...' : `Place order · ${rupee(total)}`}</button>
                <p className="hint">Pay in cash or UPI when your order arrives.</p>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
