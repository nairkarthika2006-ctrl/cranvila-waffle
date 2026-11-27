import { img, rupee } from '../data.js'
import { Stars } from './Stars.jsx'
import { useStore } from '../context/Store.jsx'

export default function WaffleCard({ item }) {
  const { cart, add, remove } = useStore()
  const qty = cart[item.id] || 0
  return (
    <article className="item">
      <img src={img(item.photo)} alt={`${item.name} waffle`} loading="lazy" style={item.pos ? { objectPosition: item.pos } : undefined} />
      <div className="ib">
        <div className="row"><h3>{item.name}</h3><span className="price">{rupee(item.price)}</span></div>
        {item.rating?.count > 0 && <p className="rated"><Stars value={item.rating.avg} /> <b>{item.rating.avg}</b> <span>({item.rating.count} {item.rating.count === 1 ? 'rating' : 'ratings'})</span></p>}
        <p>{item.desc}</p>
        {qty === 0 ? (
          <button className="btn dark sm" onClick={() => add(item.id)}>Add to order</button>
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
