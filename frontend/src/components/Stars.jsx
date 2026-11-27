import { useState } from 'react'

// Read-only stars. value can be fractional (4.3 fills 4.3 of 5 stars).
export function Stars({ value = 0 }) {
  return <span className="stars" style={{ '--v': value }} role="img" aria-label={`${value} out of 5 stars`}>★★★★★</span>
}

// Tap-to-rate stars.
export function StarInput({ value, onChange, label }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className="starinput" role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={n <= shown ? 'on' : ''} onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}>★</button>
      ))}
      <span className="starword">{['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][shown]}</span>
    </div>
  )
}
