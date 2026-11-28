import { Link } from 'react-router-dom'
import WaffleCard from '../components/WaffleCard.jsx'
import Reveal from '../components/Reveal.jsx'
import CountUp from '../components/CountUp.jsx'
import { img, PHONE, PHONE_LINK, rupee } from '../data.js'
import { useStore } from '../context/Store.jsx'
import { useI18n } from '../context/I18n.jsx'

const process = [
  ['Rest', 'The yeast batter rests overnight, which builds flavour and a light, airy crumb.'],
  ['Press', 'Each waffle is poured and pressed on a hot iron only after you order.'],
  ['Top', 'Fruit is cut by hand, sauces are made in small pots and chocolate is melted fresh.'],
  ['Pack', 'Vented boxes let steam escape, so the crust is still crisp at your door.'],
]

const quotes = [
  ['The crust stays crisp even after the ride home. The fudge stack is dangerous.', 'Riya, Adajan'],
  ['Fresh berries, real maple, and it arrived warm. We now order every Friday.', 'Karan, Vesu'],
  ['Booked 20 waffles for a birthday and every plate looked exactly like the menu.', 'Meera, Piplod'],
]

const faqs = [
  ['How long does delivery take?', 'Most orders arrive in about 30 minutes. You can follow the status live on the Order tracking page.'],
  ['What does delivery cost?', 'Delivery is ₹30, and free when your order is ₹499 or more.'],
  ['Can I order for a party?', 'Yes. Call us on the number above at least a day ahead and we will plan the batter and toppings for your group.'],
  ['Do you use nuts or eggs?', 'Our waffles contain wheat, milk and eggs, and some toppings contain nuts. Tell us about any allergy when you order.'],
]

const gallery = [
  ['butter-berry.jpg', 'big'], ['choco-chip.jpg'], ['fudge-stack.jpg'], ['caramel-crown.jpg'], ['berry-maple.jpg'], ['cocoa-strawberry.jpg'],
]

export default function Home() {
  const { menu, add } = useStore()
  const { t, localizeItem } = useI18n()
  const signature = menu.find((m) => m.id === 'choco-almond')
  const featured = signature ? localizeItem(signature) : null

  return (
    <>
      <section className="hero">
        <div className="wrap hgrid">
          <div className="htxt">
            <h1>{t('Get the Ultimate Waffle Experience')}</h1>
            <p>
              {t('Freshly baked Belgian waffles, crisp at the edge and soft inside. Topped with fresh berries, melted chocolate or warm maple, and cooked only when you order.')}
            </p>
            <div className="btns">
              <Link className="btn white" to="/menu">{t('Order now')}</Link>
              <a className="btn ghost" href={PHONE_LINK}>{t('Call {phone}', { phone: PHONE })}</a>
            </div>
            <ul className="facts">
              <li><b>{t('11 am to 11 pm')}</b>{t('Open every day')}</li>
              <li><b>{t('About 30 min')}</b>{t('Average delivery')}</li>
              <li><b>{t('Free above ₹499')}</b>{t('Delivery')}</li>
            </ul>
          </div>
          <div className="himg">
            <img src={img('hero.jpg')} alt={t('Golden waffle with butter, strawberries and blackberries on a plate')} />
          </div>
        </div>
      </section>

      {featured && (
        <section className="sec">
          <div className="wrap split">
            <Reveal><img className="round wide" src={img(featured.photo)} alt={featured.name} loading="lazy" /></Reveal>
            <Reveal className="prose" delay={120}>
              <h2>{t('The house favourite')}</h2>
              <h3 className="sub">{featured.name}</h3>
              <p>{t('A deep cocoa waffle, cut into a wedge, filled with melted milk chocolate and rolled in roasted almonds. Dusted with sugar and served warm.')}</p>
              <ul className="ticks">
                <li>{t('Cocoa batter, rested overnight')}</li>
                <li>{t('Melted chocolate, never sauce from a bottle')}</li>
                <li>{t('Roasted almonds, crushed in house')}</li>
              </ul>
              <div className="btns left">
                <button className="btn dark" onClick={() => add(signature.id)}>{t('Add for {amount}', { amount: rupee(signature.price) })}</button>
                <Link className="btn outline" to="/menu">{t('See the full menu')}</Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="sec alt">
        <div className="wrap">
          <Reveal className="head"><h2>{t('From batter to doorstep')}</h2><p>{t('Four steps, none of them rushed.')}</p></Reveal>
          <ol className="process">
            {process.map(([title, description], i) => (
              <Reveal as="li" key={title} delay={i * 90}><span className="num">{i + 1}</span><h3>{t(title)}</h3><p>{t(description)}</p></Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal className="head"><h2>{t('Favourites')}</h2><p>{t('The three most ordered on our menu.')}</p></Reveal>
          <div className="grid3">{menu.slice(0, 3).map((i) => <Reveal key={i.id}><WaffleCard item={i} /></Reveal>)}</div>
          <p className="more"><Link className="btn dark" to="/menu">{t('Full menu')}</Link></p>
        </div>
      </section>

      <section className="band">
        <div className="wrap stats">
          <Reveal><b><CountUp to={40000} suffix="+" /></b><span>{t('Waffles served')}</span></Reveal>
          <Reveal delay={90}><b><CountUp to={8} /></b><span>{t('Recipes, kept small')}</span></Reveal>
          <Reveal delay={180}><b><CountUp to={30} suffix=" min" /></b><span>{t('Average delivery')}</span></Reveal>
          <Reveal delay={270}><b><CountUp to={5} suffix=" years" /></b><span>{t('In Surat')}</span></Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal className="head"><h2>{t('A look at the kitchen’s work')}</h2></Reveal>
          <div className="gal">
            {gallery.map(([f, cls], i) => (
              <Reveal key={f} className={`tile ${cls || ''}`} delay={i * 60}><img src={img(f)} alt="" loading="lazy" /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <Reveal className="head"><h2>{t('What our guests say')}</h2></Reveal>
          <div className="quotes">
            {quotes.map(([q, who], i) => (
              <Reveal as="figure" key={who} delay={i * 100}><blockquote>{t(q)}</blockquote><figcaption>{who}</figcaption></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap narrow">
          <Reveal className="head"><h2>{t('Good to know')}</h2></Reveal>
          <Reveal className="faq">
            {faqs.map(([q, a]) => (
              <details key={q}><summary>{t(q)}</summary><p>{t(a)}</p></details>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="cta">
        <Reveal className="wrap">
          <h2>{t('Hungry? We are already heating the iron.')}</h2>
          <p>{t('Order online or call us. Open every day, 11 am to 11 pm.')}</p>
          <div className="btns">
            <Link className="btn white" to="/menu">{t('Order online')}</Link>
            <a className="btn ghost" href={PHONE_LINK}>{t('Call {phone}', { phone: PHONE })}</a>
          </div>
        </Reveal>
      </section>
    </>
  )
}
