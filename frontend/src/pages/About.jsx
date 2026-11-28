import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import { img } from '../data.js'
import { useI18n } from '../context/I18n.jsx'

export default function About() {
  const { t } = useI18n()
  return (
    <>
      <section className="phead"><div className="wrap"><h1>{t('About us')}</h1><p>{t('A small kitchen with one obsession.')}</p></div></section>
      <section className="sec">
        <div className="wrap split">
          <Reveal><img className="round" src={img('berry-maple.jpg')} alt="Waffles with strawberries, blueberries and raspberries" /></Reveal>
          <Reveal className="prose" delay={100}>
            <h2>{t('Cranberry meets vanilla')}</h2>
            <p>{t('Cranvila started with a simple pairing: tart cranberry against soft, floral vanilla. It worked so well on a waffle that we built a kitchen around it.')}</p>
            <p>{t('We use a Belgian-style yeast batter that rests overnight, which gives a crisp shell and a light, airy centre. Fruit is cut by hand, sauces are made in small pots, and nothing is cooked until you order it.')}</p>
            <p>{t('Whether you stop by for one waffle or order for a party of twenty, it leaves the iron and reaches you warm.')}</p>
            <div className="btns left"><Link className="btn dark" to="/menu">{t('See the menu')}</Link></div>
          </Reveal>
        </div>
      </section>
      <section className="band">
        <div className="wrap three">
          <div><h3>2021</h3><p>{t('First pop-up in Surat.')}</p></div>
          <div><h3>40,000+</h3><p>{t('Waffles served so far.')}</p></div>
          <div><h3>{t('8 recipes')}</h3><p>{t('Kept small so each one is right.')}</p></div>
        </div>
      </section>
    </>
  )
}
