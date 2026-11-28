import { useCallback, useEffect, useState } from 'react'
import { admin } from '../api.js'
import { money } from '../data.js'
import { useI18n } from '../context/I18n.jsx'

const when = (iso, lang) => new Date(iso).toLocaleString({ en: 'en-IN', hi: 'hi-IN', gu: 'gu-IN' }[lang], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// Staff page at /#/admin. Not linked from the site. The key is the ADMIN_KEY set on the server.
export default function Admin() {
  const { t, lang, itemName } = useI18n()
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
      setErr(t(e.status === 401 ? 'Wrong admin key.' : e.message))
      if (e.status === 401) { sessionStorage.removeItem('cw-admin'); setKey('') }
    }
  }, [key, t])
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t) }, [load])

  const act = async (fn) => { try { await fn(); await load() } catch (e) { alert(t(e.message)) } }

  if (!key) {
    return (
      <section className="sec"><div className="wrap narrow">
        <form className="card" onSubmit={(e) => { e.preventDefault(); sessionStorage.setItem('cw-admin', input); setKey(input) }}>
          <h3>{t('Staff sign in')}</h3><label htmlFor="ak">{t('Admin key')}</label>
          <input id="ak" type="password" value={input} onChange={(e) => setInput(e.target.value)} autoComplete="off" />
          {err && <p className="ferr">{err}</p>}
          <button className="btn gold" type="submit">{t('Open dashboard')}</button>
        </form>
      </div></section>
    )
  }

  return (
    <>
      <section className="phead"><div className="wrap"><h1>{t('Dashboard')}</h1><p>{t('{orders} orders · {customers} customers · {messages} messages', { orders: data.orders.length, customers: data.customers.length, messages: data.messages.length })}</p></div></section>
      <section className="sec"><div className="wrap">
        <div className="filters">
          {['orders', 'customers', 'messages'].map((name) => <button key={name} className={tab === name ? 'on' : ''} onClick={() => setTab(name)}>{t(name[0].toUpperCase() + name.slice(1))}</button>)}
          <button onClick={load}>{t('Refresh')}</button>
          <button onClick={() => { sessionStorage.removeItem('cw-admin'); setKey('') }}>{t('Sign out')}</button>
        </div>
        {err && <p className="ferr">{err}</p>}

        {tab === 'orders' && data.orders.map((o) => (
          <article className="card ord" key={o.id}>
            <div className="rhead">
              <div><h3>{o.id} · {money(o.total)}</h3><p>{when(o.createdAt, lang)} · {o.name} · <a href={`tel:${o.phone}`}>{o.phone}</a></p></div>
              <span className={`eta${o.cancellation ? ' bad' : ''}`}>{t(o.status)}</span>
            </div>
            <p>{o.address || ''}{o.note ? ` · ${t('Note')}: ${o.note}` : ''}</p>
            <p className="muted">{o.items.map((l) => `${l.qty} × ${itemName(l.id, l.name)}`).join(', ')} · {t('GST')} {money(o.gst)}</p>
            <p><b>{t(o.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment')}</b> · {t(o.paymentStatus)}{o.providerPaymentId ? ` · ID ${o.providerPaymentId}` : ''}{o.cancellation ? ` · ${t('Cancelled by {name}: {reason}', { name: t(o.cancellation.by), reason: t(o.cancellation.reason) })}` : ''}</p>
            {!o.cancellation && o.step < 3 && (
              <div className="btns left small">
                <button className="btn outline sm" onClick={() => act(() => admin.step(key, o.id, 1))}>{t('Preparing')}</button>
                <button className="btn outline sm" onClick={() => act(() => admin.step(key, o.id, 2))}>{t('Out for delivery')}</button>
                <button className="btn outline sm" onClick={() => act(() => admin.step(key, o.id, 3))}>{t('Delivered')}</button>
                <button className="btn outline sm" onClick={() => act(() => admin.step(key, o.id, null))}>{t('Auto')}</button>
                {['pending', 'verifying'].includes(o.paymentStatus) && <button className="btn gold sm" onClick={() => act(() => admin.payment(key, o.id, 'paid'))}>{t('Mark paid')}</button>}
                {o.paymentStatus === 'verifying' && <button className="btn outline sm" onClick={() => confirm(t('Payment not received? This cancels the order.')) && act(() => admin.payment(key, o.id, 'failed'))}>{t('Payment failed')}</button>}
                <button className="btn outline sm" onClick={() => act(() => admin.notResponding(key, o.id, prompt(t('Note (optional)')) || ''))}>{t('Customer not responding')}</button>
                <button className="btn danger sm" onClick={() => { const r = prompt(t('Reason for cancelling?')); if (r) act(() => admin.cancel(key, o.id, r)) }}>{t('Cancel order')}</button>
              </div>
            )}
            {o.cancellation && o.paymentStatus === 'refund_pending' && <button className="btn gold sm" onClick={() => act(() => admin.payment(key, o.id, 'refunded'))}>{t('Mark refund done')}</button>}
          </article>
        ))}

        {tab === 'customers' && (
          <div className="card"><div className="tablewrap"><table><thead><tr><th>{t('Name')}</th><th>{t('Phone')}</th><th>{t('Orders')}</th><th>{t('Cancelled')}</th><th>{t('Missed calls')}</th><th>{t('Last seen')}</th><th>{t('Address')}</th></tr></thead>
            <tbody>{data.customers.map((c) => <tr key={c.phone}><td>{c.name}</td><td><a href={`tel:${c.phone}`}>{c.phone}</a></td><td>{c.orders ?? c.orderCount ?? 0}</td><td>{c.cancelled ?? c.cancelCount ?? 0}</td><td>{c.noResponseCount ?? 0}</td><td>{c.lastSeen ? when(c.lastSeen, lang) : c.lastOrderAt ? when(c.lastOrderAt, lang) : ''}</td><td>{c.addresses?.[0] || ''}</td></tr>)}</tbody></table></div></div>
        )}

        {tab === 'messages' && data.messages.map((m) => (
          <article className="card" key={m.id}><h3>{m.name} · <a href={`tel:${m.phone}`}>{m.phone}</a></h3><p className="muted">{when(m.createdAt, lang)}</p><p>{m.message}</p></article>
        ))}
      </div></section>
    </>
  )
}
