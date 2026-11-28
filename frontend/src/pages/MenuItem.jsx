import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { img, rupee } from '../data.js'
import { useStore } from '../context/Store.jsx'
import { Stars } from '../components/Stars.jsx'
import { useI18n } from '../context/I18n.jsx'

export default function MenuItem() {
  const { id } = useParams()
  const { menu, add } = useStore()
  const { t, localizeItem } = useI18n()
  const item = menu.find((entry) => entry.id === id)
  const displayItem = item ? localizeItem(item) : null
  const categories = { classic: 'Classic', fruit: 'Fruit', chocolate: 'Chocolate', icecream: 'Ice cream', drinks: 'Drinks', brownies: 'Brownies' }
  const [chocolate, setChocolate] = useState('Milk chocolate')
  const [syrup, setSyrup] = useState(false)
  const [extraTopping, setExtraTopping] = useState(false)
  const [noNuts, setNoNuts] = useState(false)

  useEffect(() => {
    setChocolate('Milk chocolate')
    setSyrup(false)
    setExtraTopping(false)
    setNoNuts(false)
  }, [id])

  if (!item) {
    return (
      <>
        <section className="phead"><div className="wrap"><h1>{t('Menu item')}</h1><p>{t('We could not find that item.')}</p></div></section>
        <section className="sec"><div className="wrap narrow card center"><Link className="btn dark" to="/menu">{t('Back to menu')}</Link></div></section>
      </>
    )
  }

  const canCustomize = !['drinks', 'brownies'].includes(item.cat)
  const customizations = [
    ...(canCustomize ? [{ name: `Chocolate: ${chocolate}`, price: 0 }] : []),
    ...(syrup ? [{ name: 'Extra syrup', price: 20 }] : []),
    ...(extraTopping ? [{ name: 'Extra topping', price: 35 }] : []),
    ...(noNuts ? [{ name: 'No nuts', price: 0 }] : []),
  ]
  const total = item.price + customizations.reduce((sum, option) => sum + option.price, 0)

  return (
    <>
      <section className="phead">
        <div className="wrap">
          <p><Link to="/menu">{t('Menu')}</Link> / {displayItem.name}</p>
          <h1>{displayItem.name}</h1>
          <p>{t(item.cat === 'brownies' ? 'Freshly baked chocolate indulgence.' : item.cat === 'drinks' ? 'A little something lovely to sip.' : 'Made fresh, just for you.')}</p>
        </div>
      </section>
      <section className="sec">
        <div className="wrap item-detail">
          <img className="detail-photo" src={img(item.photo)} alt={displayItem.name} style={item.pos ? { objectPosition: item.pos } : undefined} />
          <div className="detail-copy">
            <p className="detail-category">{t(categories[item.cat] || item.cat)}</p>
            <h2>{displayItem.name}</h2>
            <p className="detail-price">{rupee(item.price)}</p>
            {item.rating?.count > 0 && <p className="rated"><Stars value={item.rating.avg} /> <b>{item.rating.avg}</b> <span>({item.rating.count} {t('ratings')})</span></p>}
            <p className="detail-description">{displayItem.desc}</p>
            <div className="item-tags">
              <span className="veg-tag">{t(item.diet === 'egg' ? 'Contains egg' : 'Vegetarian')}</span>
              {(item.allergens || []).map((allergen) => <span key={allergen}>{t('Contains {allergen}', { allergen: t(allergen) })}</span>)}
            </div>

            {canCustomize && (
              <div className="detail-options">
                <h3>{t('Make it yours')}</h3>
                <label htmlFor="detail-chocolate">{t('Chocolate choice')}</label>
                <select id="detail-chocolate" value={chocolate} onChange={(e) => setChocolate(e.target.value)}>
                  <option value="Milk chocolate">{t('Milk chocolate')}</option><option value="Dark chocolate">{t('Dark chocolate')}</option><option value="White chocolate">{t('White chocolate')}</option>
                </select>
                <label className="detail-check"><input type="checkbox" checked={syrup} onChange={(e) => setSyrup(e.target.checked)} /> {t('Extra syrup')} <span>+₹20</span></label>
                <label className="detail-check"><input type="checkbox" checked={extraTopping} onChange={(e) => setExtraTopping(e.target.checked)} /> {t('Extra topping')} <span>+₹35</span></label>
                <label className="detail-check"><input type="checkbox" checked={noNuts} onChange={(e) => setNoNuts(e.target.checked)} /> {t('No nuts, please')} <span>{t('Note')}</span></label>
              </div>
            )}

            <p className="detail-total">{t('Your selection')} <strong>{rupee(total)}</strong></p>
            <div className="btns">
              <button className="btn dark" disabled={item.inStock === false} onClick={() => add(item.id, customizations)}>
                {t(item.inStock === false ? 'Currently sold out' : 'Add to order')}
              </button>
              <Link className="btn outline" to="/menu">{t('Back to menu')}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
