import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { useGrab } from '../lib/grab'
import { buzz, sfx } from '../lib/sound'

const DISHES = [
  { name: 'The Original', tag: 'Raw & real', fact: 'Before the fries, before the chips, there was one plain potato who saw Puja and forgot how to talk.', joy: 62, color: '#FFF1D6' },
  { name: 'Fries', tag: 'Golden. Crispy. Yours.', fact: 'Puja, you’re the only one I’d share my fries with. And I don’t share fries. Think about that.', joy: 98, color: '#F9C74F' },
  { name: 'Chips', tag: 'Crunchy crush', fact: 'Like chips, I can’t have just one of you. Good thing there’s only one Puja in the whole world.', joy: 91, color: '#FFE08A' },
  { name: 'Mash', tag: 'An edible hug', fact: 'Puja, I am completely, hopelessly mashed on you. Soft heart, extra butter, no lumps.', joy: 95, color: '#FFF4D0' },
  { name: 'Baked', tag: 'Hot & loaded', fact: 'Are you a baked potato? Because you’re hot and I’m loaded with love for you. Sour cream optional, you are not.', joy: 88, color: '#E9E4DA' },
]

export default function Dishes() {
  const dish = useStore((s) => s.dish)
  const track = useRef<HTMLDivElement>(null)
  const grab = useGrab(() => {
    sfx.crunch()
    buzz(10)
  })

  useEffect(() => {
    const root = track.current!
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = Number((e.target as HTMLElement).dataset.i)
          if (useStore.getState().dish !== i) {
            useStore.getState().setDish(i)
            if (useStore.getState().section === 'dishes') {
              sfx.pop()
              buzz(6)
            }
          }
        }
      },
      { root, threshold: 0.6 },
    )
    root.querySelectorAll('.dcard').forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [])

  const go = (dir: number) => {
    const root = track.current!
    const card = root.querySelector<HTMLElement>('.dcard')
    if (!card) return
    root.scrollBy({ left: dir * (card.offsetWidth + 14), behavior: 'smooth' })
  }

  return (
    <section id="dishes" data-scene="dishes" data-color="#E63946" className="dishes">
      <header className="dishes-head">
        <p className="eyebrow">(02) Love, but make it potato</p>
        <h2 className="h2">
          One potato. <em>Infinite</em> <br /> crushes.
        </h2>
      </header>

      <div className="dishes-stage" data-anchor="dishes" {...grab} aria-label="Drag to spin the dish">
        <span className="dish-name" key={dish} aria-hidden>{DISHES[dish].name}</span>
        <span className="drag-hint" aria-hidden>⟵ drag to spin ⟶</span>
      </div>

      <div className="dishes-ui">
        <div className="dtrack" ref={track}>
          {DISHES.map((d, i) => (
            <article key={d.name} className={`dcard ${i === dish ? 'on' : ''}`} data-i={i} style={{ '--c': d.color } as React.CSSProperties}>
              <div className="dcard-top">
                <span className="dcard-n">{String(i + 1).padStart(2, '0')}<small>/05</small></span>
                <span className="dcard-tag">{d.tag}</span>
              </div>
              <h3>{d.name}</h3>
              <p>{d.fact}</p>
              <div className="joy">
                <span>Love</span>
                <div className="joy-bar"><i style={{ width: `${d.joy}%` }} /></div>
                <b>{d.joy}</b>
              </div>
            </article>
          ))}
          <div className="dtrack-end" aria-hidden />
        </div>
        <div className="dnav">
          <button className="round" onClick={() => go(-1)} aria-label="Previous dish" disabled={dish === 0}>←</button>
          <div className="dots" aria-hidden>
            {DISHES.map((_, i) => <i key={i} className={i === dish ? 'on' : ''} />)}
          </div>
          <button className="round" onClick={() => go(1)} aria-label="Next dish" disabled={dish === DISHES.length - 1}>→</button>
        </div>
      </div>
    </section>
  )
}
