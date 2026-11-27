import { useCallback, useEffect, useState } from 'react'
import { admin } from '../api.js'
import { money } from '../data.js'

const when = (iso) => new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// Staff page at /#/admin. Not linked from the site. The key is the ADMIN_KEY set on the server.
export default function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem('cw-admin') || '')
  const [input, setInput] = useState('')
  const [tab, setTab] = useState('orders')
  const [data, setData] = useState({ orders: [], customers: [], messages: [] })
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    if (!key) return
    try {
      const [orders, customers, messages] = await Promise.all([admin.orders(key), admin.customers(key), admin.messages(key)])
      setData({ orders, customers, messages }); setErr('')
    } catch (e) {
      setErr(e.status === 401 ? 'Wrong admin key.' : e.message)
      if (e.status === 401) { sessionStorage.removeItem('cw-admin'); setKey('') }
    }
  }, [key])
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t) }, [load])

  const act = async (fn) => { try { await fn(); await load() } catch (e) { alert(e.message) } }

  if (!key) {
    return (
      <section className="sec"><div className="wrap narrow">
        <form className="card" onSubmit={(e) => { e.preventDefault(); sessionStorage.setItem('cw-admin', input); setKey(input) }}>
          <h3>Staff sign in</h3><label htmlFor="ak">Admin key</label>
          <input id="ak" type="password" value={input} onChange={(e) => setInput(e.target.value)} autoComplete="off" />
          {err && <p className="ferr">{err}</p>}
          <button className="btn gold" type="submit">Open dashboard</button>
        </form>
      </div></section>
    )
  }

  return (
    <>
      <section className="phead"><div className="wrap"><h1>Dashboard</h1><p>{data.orders.length} orders · {data.customers.length} customers · {data.messages.length} messages</p></div></section>
      <section className="sec"><div className="wrap">
        <div className="filters">
          {['orders', 'customers', 'messages'].map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}
          <button onClick={load}>Refresh</button>
          <button onClick={() => { sessionStorage.removeItem('cw-admin'); setKey('') }}>Sign out</button>
        </div>
        {err && <p className="ferr">{err}</p>}

        {tab === 'orders' && data.orders.map((o) => (
          <article className="card ord" key={o.id}>
            <div className="rhead">
              <div><h3>{o.id} · {money(o.total)}</h3><p>{when(o.createdAt)} · {o.name} · <a href={`tel:${o.phone}`}>{o.phone}</a></p></div>
              <span className={`eta${o.cancelled ? ' bad' : ''}`}>{o.status}</span>
            </div>
            <p>{o.address}{o.note ? ` · Note: ${o.note}` : ''}</p>
            <p className="muted">{o.items.map((l) => `${l.qty} × ${l.name}`).join(', ')} · GST {money(o.gst)}</p>
            <p><b>{o.paymentMethod.toUpperCase()}</b> · {o.paymentStatus}{o.paymentRef ? ` · ID ${o.paymentRef}` : ''}{o.cancelled ? ` · Cancelled by ${o.cancelled.by}: ${o.cancelled.reason}` : ''}</p>
            {o.notRespondingLog.length > 0 && <p className="muted">Calls not answered: {o.notRespondingLog.length}{o.notResponding ? `, auto-cancel at ${when(o.notResponding.deadline)}` : ' (customer responded)'}</p>}
            {!o.cancelled && o.step < 3 && (
              <div className="btns left small">
                <button className="btn outline sm" onClick={() => act(() => admin.step(key, o.id, 1))}>Preparing</button>
                <button className="btn outline sm" onClick={() => act(() => admin.step(key, o.id, 2))}>Out for delivery</button>
                <button className="btn outline sm" onClick={() => act(() => admin.step(key, o.id, 3))}>Delivered</button>
                <button className="btn outline sm" onClick={() => act(() => admin.step(key, o.id, null))}>Auto</button>
                {['pending', 'verifying'].includes(o.paymentStatus) && <button className="btn gold sm" onClick={() => act(() => admin.payment(key, o.id, 'paid'))}>Mark paid</button>}
                {o.paymentStatus === 'verifying' && <button className="btn outline sm" onClick={() => confirm('Payment not received? This cancels the order.') && act(() => admin.payment(key, o.id, 'failed'))}>Payment failed</button>}
                <button className="btn outline sm" onClick={() => act(() => admin.notResponding(key, o.id, prompt('Note (optional)') || ''))}>Customer not responding</button>
                <button className="btn danger sm" onClick={() => { const r = prompt('Reason for cancelling?'); if (r) act(() => admin.cancel(key, o.id, r)) }}>Cancel order</button>
              </div>
            )}
            {o.cancelled && o.paymentStatus === 'refund_pending' && <button className="btn gold sm" onClick={() => act(() => admin.payment(key, o.id, 'refunded'))}>Mark refund done</button>}
          </article>
        ))}

        {tab === 'customers' && (
          <div className="card"><div className="tablewrap"><table><thead><tr><th>Name</th><th>Phone</th><th>Orders</th><th>Cancelled</th><th>Missed calls</th><th>Last seen</th><th>Address</th></tr></thead>
            <tbody>{data.customers.map((c) => <tr key={c.phone}><td>{c.name}</td><td><a href={`tel:${c.phone}`}>{c.phone}</a></td><td>{c.orderCount}</td><td>{c.cancelCount}</td><td>{c.noResponseCount}</td><td>{when(c.lastSeen)}</td><td>{c.addresses[0] || ''}</td></tr>)}</tbody></table></div></div>
        )}

        {tab === 'messages' && data.messages.map((m) => (
          <article className="card" key={m.id}><h3>{m.name} · <a href={`tel:${m.phone}`}>{m.phone}</a></h3><p className="muted">{when(m.createdAt)}</p><p>{m.message}</p></article>
        ))}
      </div></section>
    </>
  )
}
