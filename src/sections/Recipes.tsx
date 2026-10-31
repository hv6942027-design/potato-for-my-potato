import { useState } from 'react'
import { buzz, sfx } from '../lib/sound'
import Spud from '../components/Spud'

const RECIPES = [
  { name: 'Smashed & Crispy', time: '45 min', level: 'Easy', tone: 'red', size: 'wide', steps: ['Boil baby potatoes until tender', 'Smash flat with a mug', 'Olive oil, salt, 220°C for 25 min', 'Feed Puja the crispiest one'] },
  { name: 'Cloud Mash', time: '30 min', level: 'Easy', tone: 'cream', size: 'tall', steps: ['Boil Yukon Golds', 'Rice them while hot', 'Fold in warm butter + milk', 'Serve with a forehead kiss'] },
  { name: 'Hasselback', time: '70 min', level: 'Medium', tone: 'ink', size: '', steps: ['Slice thin, not through', 'Brush with garlic butter', 'Roast 60 min, basting twice', 'Fan out & flex for Puja'] },
  { name: 'Patatas Bravas', time: '40 min', level: 'Medium', tone: 'green', size: '', steps: ['Cube & fry until golden', 'Smoky tomato sauce', 'Garlic aioli on top', 'One plate, two forks'] },
  { name: 'Triple-Cooked Chips', time: '2 hrs', level: 'Chef mode', tone: 'gold', size: 'wide', steps: ['Simmer until almost falling apart', 'Chill, then fry at 130°C', 'Chill again (patience)', 'Share. (Okay, Puja gets more.)'] },
]

export default function Recipes() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section id="recipes" data-scene="none" data-color="#FFD66B" className="recipes">
      <header className="rec-head" data-reveal>
        <p className="eyebrow">(06) Date-night cookbook</p>
        <h2 className="h2">
          Cooking <br /> for <em>us.</em>
        </h2>
      </header>
      <div className="bento">
        {RECIPES.map((r, i) => (
          <button
            key={r.name}
            className={`rcard t-${r.tone} ${r.size} ${open === i ? 'open' : ''}`}
            data-reveal
            style={{ '--d': `${i * 70}ms` } as React.CSSProperties}
            onClick={() => {
              setOpen(open === i ? null : i)
              sfx.sizzle()
              buzz(8)
            }}
            aria-expanded={open === i}
          >
            <span className="rcard-n">{String(i + 1).padStart(2, '0')}</span>
            {r.size === 'tall' && <Spud className="rcard-art" mood="sleepy" color="#FFE2A0" shape={2} />}
            <span className="rcard-meta">{r.time} · {r.level}</span>
            <span className="rcard-name">{r.name}</span>
            <ol className="rcard-steps">
              {r.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <span className="rcard-plus" aria-hidden>+</span>
          </button>
        ))}
      </div>
    </section>
  )
}
