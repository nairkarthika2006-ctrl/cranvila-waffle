import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import { img } from '../data.js'

export default function About() {
  return (
    <>
      <section className="phead"><div className="wrap"><h1>About us</h1><p>A small kitchen with one obsession.</p></div></section>
      <section className="sec">
        <div className="wrap split">
          <Reveal><img className="round" src={img('berry-maple.jpg')} alt="Waffles with strawberries, blueberries and raspberries" /></Reveal>
          <Reveal className="prose" delay={100}>
            <h2>Cranberry meets vanilla</h2>
            <p>Cranvila started with a simple pairing: tart cranberry against soft, floral vanilla. It worked so well on a waffle that we built a kitchen around it.</p>
            <p>We use a Belgian-style yeast batter that rests overnight, which gives a crisp shell and a light, airy centre. Fruit is cut by hand, sauces are made in small pots, and nothing is cooked until you order it.</p>
            <p>Whether you stop by for one waffle or order for a party of twenty, it leaves the iron and reaches you warm.</p>
            <div className="btns left"><Link className="btn dark" to="/menu">See the menu</Link></div>
          </Reveal>
        </div>
      </section>
      <section className="band">
        <div className="wrap three">
          <div><h3>2021</h3><p>First pop-up in Surat.</p></div>
          <div><h3>40,000+</h3><p>Waffles served so far.</p></div>
          <div><h3>8 recipes</h3><p>Kept small so each one is right.</p></div>
        </div>
      </section>
    </>
  )
}
