import { img, rupee } from '../data.js'
import { Stars } from './Stars.jsx'
import { useStore } from '../context/Store.jsx'
import { useI18n } from '../context/I18n.jsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function WaffleCard({ item }) {
  const { cart, add, remove } = useStore()
  const { t, localizeItem } = useI18n()
  const displayItem = localizeItem(item)
  const [open, setOpen] = useState(false)
  const [extra, setExtra] = useState([])
  const [noNuts, setNoNuts] = useState(false)
  const qty = cart[item.id] || 0
  const soldOut = item.inStock === false
  const canCustomize = !['drinks', 'brownies'].includes(item.cat)
  const customizations = [
    ...extra.map((name) => ({ name, price: name === 'Extra syrup' ? 20 : 35 })),
    ...(noNuts ? [{ name: 'No nuts', price: 0 }] : []),
  ]
  const toggleExtra = (name) => setExtra((v) => v.includes(name) ? v.filter((x) => x !== name) : [...v, name])
  return (
    <article className="item">
      <Link className="item-image-link" to={`/menu/${item.id}`} aria-label={t('View {name} details', { name: displayItem.name })}>
        <img src={img(item.photo)} alt={displayItem.name} loading="lazy" style={item.pos ? { objectPosition: item.pos } : undefined} />
      </Link>
      <div className="ib">
        <div className="row"><h3><Link className="item-title-link" to={`/menu/${item.id}`}>{displayItem.name}</Link></h3><span className="price">{rupee(item.price)}</span></div>
        <div className="item-tags">
          <span className="veg-tag">{t(item.diet === 'egg' ? 'Egg' : 'Veg')}</span>
          {(item.allergens || []).slice(0, 3).map((a) => <span key={a}>{t(a)}</span>)}
        </div>
        {item.rating?.count > 0 && <p className="rated"><Stars value={item.rating.avg} /> <b>{item.rating.avg}</b> <span>({item.rating.count} {t(item.rating.count === 1 ? 'rating' : 'ratings')})</span></p>}
        <p>{displayItem.desc}</p>
        <Link className="view-details" to={`/menu/${item.id}`}>{t('View full details')} <span aria-hidden="true">→</span></Link>
        {!soldOut && canCustomize && (
          <button className="customize-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
            {t(open ? 'Close customizations' : 'Customize this waffle')}
          </button>
        )}
        {open && !soldOut && canCustomize && (
          <div className="customize-panel">
            {['Extra syrup', 'Chocolate drizzle', 'Extra berries'].map((name) => (
              <label key={name}>
                <input type="checkbox" checked={extra.includes(name)} onChange={() => toggleExtra(name)} />
                <span>{t(name)}</span><small>{name === 'Extra syrup' ? '+₹20' : '+₹35'}</small>
              </label>
            ))}
            <label><input type="checkbox" checked={noNuts} onChange={(e) => setNoNuts(e.target.checked)} /><span>{t('No nuts')}</span><small>{t('Note only')}</small></label>
          </div>
        )}
        {soldOut ? (
          <button className="btn outline sm" disabled>{t('Currently sold out')}</button>
        ) : qty === 0 ? (
          <button className="btn dark sm" onClick={() => add(item.id, customizations)}>{t('Add to order')}</button>
        ) : (
          <div className="qty" role="group" aria-label={t('Quantity of {name}', { name: displayItem.name })}>
            <button onClick={() => remove(item.id)} aria-label={t('Remove one')}>−</button>
            <span>{qty}</span>
            <button onClick={() => add(item.id)} aria-label={t('Add one')}>+</button>
          </div>
        )}
      </div>
    </article>
  )
}
