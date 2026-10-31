import { useStore } from '../store'

const STEPS = [
  { tag: 'Day 1', title: 'Two potatoes met', body: 'I saw Puja and forgot every word I knew. Absolute potato behaviour. Zero regrets.' },
  { tag: 'The talking stage', title: 'Something sprouted', body: 'Late-night texts, voice notes, “you sleep first” “no you”. Roots were quietly growing.' },
  { tag: 'The day it clicked', title: 'Harvest day', body: 'Up it popped: a little dusty, a little lumpy, completely perfect. Turns out it was love all along.' },
  { tag: 'Today', title: 'Us. Forever.', body: 'One potato, one Puja, zero chill. My favourite person on this whole planet, and the main character of my life.' },
]

export default function Origin() {
  const step = useStore((s) => s.originStep)
  return (
    <section id="origin" data-scene="origin" data-color="#2A1A10" className="origin">
      <div className="origin-sticky">
        <div className="sky" aria-hidden>
          <div className="sky-day" />
          <div className="sun" />
          <div className="cloud c1" />
          <div className="cloud c2" />
        </div>

        <div className="ground" aria-hidden>
          <svg className="ground-edge" viewBox="0 0 400 40" preserveAspectRatio="none">
            <path d="M0 22 C40 8 70 30 110 18 S180 4 220 20 S300 34 340 16 S390 10 400 18 V40 H0z" />
          </svg>
          <div className="grass">
            {Array.from({ length: 22 }).map((_, i) => (
              <i key={i} style={{ left: `${(i * 4.7 + (i % 3) * 1.3) % 100}%`, height: `${10 + ((i * 7) % 12)}px`, rotate: `${((i * 13) % 30) - 15}deg` }} />
            ))}
          </div>
          <div className="strata s1" />
          <div className="strata s2" />
          <div className="strata s3" />
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="pebble" style={{ left: `${(i * 37) % 96}%`, top: `${18 + ((i * 23) % 70)}%`, width: `${6 + (i % 4) * 4}px` }} />
          ))}
          <svg className="worm" viewBox="0 0 80 24">
            <path d="M4 14c8-10 16 10 24 0s16 10 24 0 12-6 20-2" />
            <circle cx="74" cy="12" r="1.6" />
          </svg>
        </div>

        <header className="origin-head">
          <p className="eyebrow">(01) Our story</p>
          <h2 className="h2">
            From dirt <br />
            to <em>us.</em>
          </h2>
        </header>

        <div className="origin-steps" aria-live="polite">
          {STEPS.map((s, i) => (
            <article key={s.tag} className={`ostep ${i === step ? 'on' : i < step ? 'past' : ''}`}>
              <span className="ostep-tag">{s.tag}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              {i === 3 && (
                <div className="ostep-stats">
                  <b>∞<small>hugs owed</small></b>
                  <b>100%<small>yours</small></b>
                  <b>#1<small>in my heart</small></b>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="origin-rail" aria-hidden>
          <span className="rail-fill" />
          {STEPS.map((s, i) => (
            <i key={s.tag} className={i <= step ? 'on' : ''} />
          ))}
        </div>
      </div>
    </section>
  )
}
