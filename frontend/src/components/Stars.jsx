import { useState } from 'react'
import { useI18n } from '../context/I18n.jsx'

// Read-only stars. value can be fractional (4.3 fills 4.3 of 5 stars).
export function Stars({ value = 0 }) {
  const { t } = useI18n()
  return <span className="stars" style={{ '--v': value }} role="img" aria-label={t('{value} out of 5 stars', { value })}>★★★★★</span>
}

// Tap-to-rate stars.
export function StarInput({ value, onChange, label }) {
  const { t } = useI18n()
  const [hover, setHover] = useState(0)
  const shown = hover || value
  const words = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']
  return (
    <div className="starinput" role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={t('{count} stars', { count: n })}
          className={n <= shown ? 'on' : ''} onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}>★</button>
      ))}
      <span className="starword">{t(words[shown])}</span>
    </div>
  )
}
