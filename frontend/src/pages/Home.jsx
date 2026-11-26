import { Link } from 'react-router-dom'
import WaffleCard from '../components/WaffleCard.jsx'
import Reveal from '../components/Reveal.jsx'
import CountUp from '../components/CountUp.jsx'
import { img, PHONE, PHONE_LINK, rupee } from '../data.js'
import { useStore } from '../context/Store.jsx'

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
  const signature = menu.find((m) => m.id === 'choco-almond')

  return (
    <>
      <section className="hero">
        <div className="wrap hgrid">
          <div className="htxt">
            <h1>Get the Ultimate<br />Waffle Experience</h1>
            <p>
              Freshly baked Belgian waffles, crisp at the edge and soft inside. Topped with fresh berries,
              melted chocolate or warm maple, and cooked only when you order.
            </p>
            <div className="btns">
              <Link className="btn white" to="/menu">Order now</Link>
              <a className="btn ghost" href={PHONE_LINK}>Call {PHONE}</a>
            </div>
            <ul className="facts">
              <li><b>11 am to 11 pm</b>Open every day</li>
              <li><b>About 30 min</b>Average delivery</li>
              <li><b>Free above ₹499</b>Delivery</li>
            </ul>
          </div>
          <div className="himg">
            <img src={img('hero.jpg')} alt="Golden waffle with butter, strawberries and blackberries on a plate" />
          </div>
        </div>
      </section>

      {signature && (
        <section className="sec">
          <div className="wrap split">
            <Reveal><img className="round wide" src={img(signature.photo)} alt={signature.name} loading="lazy" /></Reveal>
            <Reveal className="prose" delay={120}>
              <h2>The house favourite</h2>
              <h3 className="sub">{signature.name}</h3>
              <p>A deep cocoa waffle, cut into a wedge, filled with melted milk chocolate and rolled in roasted almonds. Dusted with sugar and served warm.</p>
              <ul className="ticks">
                <li>Cocoa batter, rested overnight</li>
                <li>Melted chocolate, never sauce from a bottle</li>
                <li>Roasted almonds, crushed in house</li>
              </ul>
              <div className="btns left">
                <button className="btn dark" onClick={() => add(signature.id)}>Add for {rupee(signature.price)}</button>
                <Link className="btn outline" to="/menu">See the full menu</Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="sec alt">
        <div className="wrap">
          <Reveal className="head"><h2>From batter to doorstep</h2><p>Four steps, none of them rushed.</p></Reveal>
          <ol className="process">
            {process.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 90}><span className="num">{i + 1}</span><h3>{t}</h3><p>{d}</p></Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal className="head"><h2>Favourites</h2><p>The three most ordered on our menu.</p></Reveal>
          <div className="grid3">{menu.slice(0, 3).map((i) => <Reveal key={i.id}><WaffleCard item={i} /></Reveal>)}</div>
          <p className="more"><Link className="btn dark" to="/menu">Full menu</Link></p>
        </div>
      </section>

      <section className="band">
        <div className="wrap stats">
          <Reveal><b><CountUp to={40000} suffix="+" /></b><span>Waffles served</span></Reveal>
          <Reveal delay={90}><b><CountUp to={8} /></b><span>Recipes, kept small</span></Reveal>
          <Reveal delay={180}><b><CountUp to={30} suffix=" min" /></b><span>Average delivery</span></Reveal>
          <Reveal delay={270}><b><CountUp to={5} suffix=" years" /></b><span>In Surat</span></Reveal>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <Reveal className="head"><h2>A look at the kitchen&apos;s work</h2></Reveal>
          <div className="gal">
            {gallery.map(([f, cls], i) => (
              <Reveal key={f} className={`tile ${cls || ''}`} delay={i * 60}><img src={img(f)} alt="" loading="lazy" /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap">
          <Reveal className="head"><h2>What our guests say</h2></Reveal>
          <div className="quotes">
            {quotes.map(([q, who], i) => (
              <Reveal as="figure" key={who} delay={i * 100}><blockquote>{q}</blockquote><figcaption>{who}</figcaption></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap narrow">
          <Reveal className="head"><h2>Good to know</h2></Reveal>
          <Reveal className="faq">
            {faqs.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="cta">
        <Reveal className="wrap">
          <h2>Hungry? We are already heating the iron.</h2>
          <p>Order online or call us. Open every day, 11 am to 11 pm.</p>
          <div className="btns">
            <Link className="btn white" to="/menu">Order online</Link>
            <a className="btn ghost" href={PHONE_LINK}>Call {PHONE}</a>
          </div>
        </Reveal>
      </section>
    </>
  )
}
