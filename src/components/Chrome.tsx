import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { scrollToId } from '../lib/scroll'
import { buzz, sfx } from '../lib/sound'

const I = {
  home: <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" />,
  story: <path d="M12 21c-4-3-7-6-7-10a7 7 0 0114 0c0 4-3 7-7 10zM12 8v6M9 11h6" />,
  dish: <path d="M7 3l1 7M12 2v8M17 3l-1 7M5 10h14l-2 11H7z" />,
  quiz: <path d="M9 9a3 3 0 116 0c0 2-3 2-3 5M12 18h.01M12 22a10 10 0 100-20 10 10 0 000 20z" />,
  play: <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01M7 6h10a5 5 0 015 5v2a5 5 0 01-5 5H7a5 5 0 01-5-5v-2a5 5 0 015-5z" />,
}

const LINKS: { id: string; label: string; icon: keyof typeof I; match: string[] }[] = [
  { id: 'hero', label: 'Home', icon: 'home', match: ['hero'] },
  { id: 'origin', label: 'Us', icon: 'story', match: ['origin'] },
  { id: 'dishes', label: 'Love', icon: 'dish', match: ['dishes'] },
  { id: 'quiz', label: 'Quiz', icon: 'quiz', match: ['quiz', 'varieties'] },
  { id: 'play', label: 'Play', icon: 'play', match: ['play', 'recipes', 'join'] },
]

export function Nav() {
  const section = useStore((s) => s.section)
  const loaded = useStore((s) => s.loaded)
  const active = Math.max(0, LINKS.findIndex((l) => l.match.includes(section)))
  return (
    <nav className={`dock ${loaded ? 'show' : ''}`} aria-label="Sections" style={{ '--i': active } as React.CSSProperties}>
      <span className="dock-blob" aria-hidden />
      {LINKS.map((l, i) => (
        <button
          key={l.id}
          className={`dock-btn ${i === active ? 'on' : ''}`}
          aria-current={i === active ? 'true' : undefined}
          onClick={() => {
            buzz(8)
            sfx.pop()
            scrollToId(l.id)
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden>{I[l.icon]}</svg>
          <span>{l.label}</span>
        </button>
      ))}
    </nav>
  )
}

const DARK = ['origin', 'dishes', 'play', 'join']

export function TopBar() {
  const soundOn = useStore((s) => s.soundOn)
  const golden = useStore((s) => s.golden)
  const loaded = useStore((s) => s.loaded)
  const dark = useStore((s) => DARK.includes(s.section))
  return (
    <header className={`topbar ${loaded ? 'show' : ''} ${dark ? 'dark' : ''}`}>
      <button className="logo" onClick={() => scrollToId('hero')} aria-label="Puja loves potato, home">
        Puja <span aria-hidden>♥</span> Potato
        {golden && <em className="logo-gold">golden puja</em>}
      </button>
      <button
        className={`sound ${soundOn ? 'on' : ''}`}
        aria-pressed={soundOn}
        aria-label={soundOn ? 'Mute sound' : 'Turn sound on'}
        onClick={() => {
          useStore.getState().setSoundOn(!soundOn)
          sfx.unlock()
          if (!soundOn) setTimeout(() => sfx.sizzle(), 30)
          buzz(10)
        }}
      >
        <span className="bars" aria-hidden>
          <i /><i /><i /><i />
        </span>
        {soundOn ? 'Love on' : 'Sound off'}
      </button>
    </header>
  )
}

export function Marquee({ words, tone = 'ink', reverse = false }: { words: string[]; tone?: 'ink' | 'gold' | 'red'; reverse?: boolean }) {
  const row = [...words, ...words, ...words, ...words]
  return (
    <div className={`marquee m-${tone} ${reverse ? 'rev' : ''}`} aria-hidden>
      <div className="marquee-track">
        {[0, 1].map((k) => (
          <div className="marquee-row" key={k}>
            {row.map((w, i) => (
              <span key={i}>
                {w}
                <b>✺</b>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Desktop-only potato cursor that grows over interactive elements. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = ref.current!
    document.documentElement.classList.add('has-cursor')
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf = 0
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      const t = e.target as HTMLElement
      el.classList.toggle('big', !!t.closest('button, a, input, [data-grab]'))
    }
    const loop = () => {
      cx += (x - cx) * 0.2
      cy += (y - cy) * 0.2
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])
  return <div className="cursor" ref={ref} aria-hidden><i /></div>
}
