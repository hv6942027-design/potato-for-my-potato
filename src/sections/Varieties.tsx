import { useRef, useState } from 'react'
import Spud from '../components/Spud'
import { buzz, sfx } from '../lib/sound'

const VARIETIES = [
  { name: 'Cuddle Potato', origin: 'Mood: clingy', vibe: 'Professional hugger, open 24/7', color: '#C9925A', spot: '#8E5A26', bg: '#F3D9B1', shape: 3, stats: { Cuddles: 100, Snacks: 70, Drama: 40 } },
  { name: 'Chef Potato', origin: 'Mood: hungry', vibe: 'Makes you Maggi at 2am', color: '#F2C14E', spot: '#B8862B', bg: '#FFE9A8', shape: 0, stats: { Cuddles: 80, Snacks: 100, Drama: 20 } },
  { name: 'Sleepy Potato', origin: 'Mood: 5 more min', vibe: 'Says 5 minutes, means 2 hours', color: '#6B3FA0', spot: '#3E1F66', bg: '#D9C6F2', shape: 2, stats: { Cuddles: 95, Snacks: 50, Drama: 10 } },
  { name: 'Romantic Potato', origin: 'Mood: filmy', vibe: 'Built you a whole website', color: '#E0A75E', spot: '#A0682C', bg: '#FFE0C2', shape: 1, stats: { Cuddles: 90, Snacks: 60, Drama: 85 } },
  { name: 'Blushing Potato', origin: 'Mood: shy', vibe: 'Goes red every time you smile', color: '#C8434B', spot: '#8A2530', bg: '#FFD0CF', shape: 2, stats: { Cuddles: 85, Snacks: 65, Drama: 30 } },
]

export default function Varieties() {
  const [idx, setIdx] = useState(0)
  const [loved, setLoved] = useState<string[]>([])
  const [fly, setFly] = useState<{ dir: number } | null>(null)
  const [flipped, setFlipped] = useState(false)
  const drag = useRef({ on: false, x: 0, dx: 0 })
  const top = useRef<HTMLDivElement>(null)

  const decide = (dir: number) => {
    if (fly || idx >= VARIETIES.length) return
    setFly({ dir })
    if (dir > 0) {
      setLoved((l) => [...l, VARIETIES[idx].name])
      sfx.pop()
    } else sfx.whoosh()
    buzz(dir > 0 ? [10, 30, 10] : 12)
    setTimeout(() => {
      setIdx((i) => i + 1)
      setFly(null)
      setFlipped(false)
      drag.current.dx = 0
    }, 380)
  }

  const setX = (dx: number) => {
    const el = top.current
    if (!el) return
    el.style.transform = `translateX(${dx}px) rotate(${dx * 0.06}deg)`
    el.style.setProperty('--love', String(Math.max(0, Math.min(1, dx / 110))))
    el.style.setProperty('--nope', String(Math.max(0, Math.min(1, -dx / 110))))
  }

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      drag.current = { on: true, x: e.clientX, dx: 0 }
      top.current?.classList.add('dragging')
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!drag.current.on) return
      drag.current.dx = e.clientX - drag.current.x
      setX(drag.current.dx)
    },
    onPointerUp: () => {
      if (!drag.current.on) return
      drag.current.on = false
      top.current?.classList.remove('dragging')
      const dx = drag.current.dx
      if (Math.abs(dx) > 90) decide(Math.sign(dx))
      else {
        if (Math.abs(dx) < 6) {
          setFlipped((f) => !f)
          sfx.pop()
        }
        setX(0)
      }
    },
  }

  const finished = idx >= VARIETIES.length

  return (
    <section id="varieties" data-scene="none" data-color="#FFF1D6" className="varieties">
      <header className="var-head" data-reveal>
        <p className="eyebrow">(05) Potato dating</p>
        <h2 className="h2">
          Pick your <br /> <em>potato.</em>
        </h2>
        <p className="var-sub">Swipe right to love, left to pass, Puja. Tap a card to see its stats. (Spoiler: they’re all me.)</p>
      </header>

      <div className="deck" data-reveal>
        {finished ? (
          <div className="deck-done">
            <Spud className="deck-done-spud" mood="wow" />
            <h3>{loved.length ? `It’s a match ×${loved.length}!` : 'Rejected?? All of me??'}</h3>
            <p>{loved.length ? `Plot twist: every single potato was me. You picked me ${loved.length} time${loved.length > 1 ? 's' : ''} 💛` : 'That’s okay. I swipe right on you anyway. Every day. Forever.'}</p>
            <button className="btn btn-ink" onClick={() => { setIdx(0); setLoved([]); sfx.whoosh() }}>Swipe again ↻</button>
          </div>
        ) : (
          VARIETIES.slice(idx, idx + 3)
            .map((v, k) => {
              const isTop = k === 0
              return (
                <div
                  key={v.name}
                  ref={isTop ? top : undefined}
                  className={`vcard ${isTop ? 'top' : ''} ${isTop && fly ? (fly.dir > 0 ? 'fly-r' : 'fly-l') : ''} ${isTop && flipped ? 'flipped' : ''}`}
                  style={{ '--k': k, '--bg': v.bg } as React.CSSProperties}
                  data-grab
                  {...(isTop ? handlers : {})}
                >
                  <div className="vcard-inner">
                    <div className="vface front">
                      <span className="stamp love">Love</span>
                      <span className="stamp nope">Nope</span>
                      <div className="vcard-meta">
                        <span>{v.origin}</span>
                        <span>{String(idx + k + 1).padStart(2, '0')}/05</span>
                      </div>
                      <Spud className="vcard-spud" color={v.color} spot={v.spot} shape={v.shape} />
                      <h3>{v.name}</h3>
                      <p>{v.vibe}</p>
                    </div>
                    <div className="vface back">
                      <h3>{v.name}</h3>
                      {Object.entries(v.stats).map(([s, n]) => (
                        <div className="vstat" key={s}>
                          <span>{s}</span>
                          <div><i style={{ width: `${n}%` }} /></div>
                          <b>{n}</b>
                        </div>
                      ))}
                      <p className="vback-tip">Tap to flip back</p>
                    </div>
                  </div>
                </div>
              )
            })
            .reverse()
        )}
      </div>

      {!finished && (
        <div className="deck-actions">
          <button className="round big nope-btn" onClick={() => decide(-1)} aria-label="Pass">✕</button>
          <button className="round big love-btn" onClick={() => decide(1)} aria-label="Love">♥</button>
        </div>
      )}
    </section>
  )
}
