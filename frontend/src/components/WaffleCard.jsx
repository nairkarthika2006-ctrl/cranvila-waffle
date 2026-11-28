import { img, rupee } from '../data.js'
import { Stars } from './Stars.jsx'
import { useStore } from '../context/Store.jsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function WaffleCard({ item }) {
  const { cart, add, remove } = useStore()
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
      <Link className="item-image-link" to={`/menu/${item.id}`} aria-label={`View ${item.name} details`}>
        <img src={img(item.photo)} alt={item.name} loading="lazy" style={item.pos ? { objectPosition: item.pos } : undefined} />
      </Link>
      <div className="ib">
        <div className="row"><h3><Link className="item-title-link" to={`/menu/${item.id}`}>{item.name}</Link></h3><span className="price">{rupee(item.price)}</span></div>
        <div className="item-tags">
          <span className="veg-tag">{item.diet === 'egg' ? 'Egg' : 'Veg'}</span>
          {(item.allergens || []).slice(0, 3).map((a) => <span key={a}>{a}</span>)}
        </div>
        {item.rating?.count > 0 && <p className="rated"><Stars value={item.rating.avg} /> <b>{item.rating.avg}</b> <span>({item.rating.count} {item.rating.count === 1 ? 'rating' : 'ratings'})</span></p>}
        <p>{item.desc}</p>
        <Link className="view-details" to={`/menu/${item.id}`}>View full details <span aria-hidden="true">→</span></Link>
        {!soldOut && canCustomize && (
          <button className="customize-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? 'Close customizations' : 'Customize this waffle'}
          </button>
        )}
        {open && !soldOut && canCustomize && (
          <div className="customize-panel">
            {['Extra syrup', 'Chocolate drizzle', 'Extra berries'].map((name) => (
              <label key={name}>
                <input type="checkbox" checked={extra.includes(name)} onChange={() => toggleExtra(name)} />
                <span>{name}</span><small>{name === 'Extra syrup' ? '+₹20' : '+₹35'}</small>
              </label>
            ))}
            <label><input type="checkbox" checked={noNuts} onChange={(e) => setNoNuts(e.target.checked)} /><span>No nuts</span><small>Note only</small></label>
          </div>
        )}
        {soldOut ? (
          <button className="btn outline sm" disabled>Currently sold out</button>
        ) : qty === 0 ? (
          <button className="btn dark sm" onClick={() => add(item.id, customizations)}>Add to order</button>
        ) : (
          <div className="qty" role="group" aria-label={`Quantity of ${item.name}`}>
            <button onClick={() => remove(item.id)} aria-label="Remove one">−</button>
            <span>{qty}</span>
            <button onClick={() => add(item.id)} aria-label="Add one">+</button>
          </div>
        )}
      </div>
    </article>
  )
}
