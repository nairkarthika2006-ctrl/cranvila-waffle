import { useState } from 'react'
import { Link } from 'react-router-dom'
import WaffleCard from '../components/WaffleCard.jsx'
import { filters, rupee } from '../data.js'
import { useStore } from '../context/Store.jsx'
import { useI18n } from '../context/I18n.jsx'

export default function Menu() {
  const [active, setActive] = useState('all')
  const { menu, count, total } = useStore()
  const { t } = useI18n()
  const shown = menu.filter((i) => active === 'all' || i.cat === active)

  return (
    <>
      <section className="phead"><div className="wrap"><h1>{t('Menu')}</h1><p>{t('Every waffle is made to order.')}</p></div></section>
      <section className="sec">
        <div className="wrap">
          <div className="filters">
            {filters.map((f) => (
              <button key={f.key} className={active === f.key ? 'on' : ''} onClick={() => setActive(f.key)}>{t(f.label)}</button>
            ))}
          </div>
          <div className="grid3">{shown.map((i) => <WaffleCard key={i.id} item={i} />)}</div>
        </div>
      </section>
      {count > 0 && (
        <div className="cartbar">
          <span>{count} {t(count === 1 ? 'waffle' : 'waffles')} · {rupee(total)}</span>
          <Link className="btn gold sm" to="/cart">{t('Review order')}</Link>
        </div>
      )}
    </>
  )
}
