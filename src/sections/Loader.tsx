import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useStore } from '../store'
import { lenis, reducedMotion } from '../lib/scroll'

const WORDS = ['Washing', 'Peeling', 'Blushing', 'Missing Puja', 'Falling', 'Hugging']
const SHAPE = 'M18 40C24 15 58 6 84 12s34 30 28 52-34 30-62 26S12 64 18 40z'

export default function Loader() {
  const [n, setN] = useState(0)
  const [gone, setGone] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.classList.add('locked')
    const fast = reducedMotion()
    const dur = fast ? 300 : 2100
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      setN(Math.round(e * 100))
      if (t < 1) raf = requestAnimationFrame(tick)
      else Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(finish)
    }
    const finish = () => {
      const el = root.current!
      const tl = gsap.timeline({
        onComplete: () => {
          setGone(true)
        },
      })
      tl.to(el.querySelectorAll('.ld-count, .ld-word'), { yPercent: -110, duration: 0.5, ease: 'power3.in', stagger: 0.05 })
        .to(el.querySelector('.ld-spud'), { scale: 1.25, rotate: -14, duration: 0.25, ease: 'power2.out' }, '<')
        .to(el.querySelector('.ld-spud'), { scale: 0, rotate: 30, duration: 0.4, ease: 'back.in(2)' })
        .add(() => {
          useStore.getState().setLoaded()
          document.documentElement.classList.remove('locked')
          lenis?.start()
        }, '-=0.1')
        .to(el, { clipPath: 'inset(0% 0% 100% 0% round 0 0 50% 50%)', duration: fast ? 0.2 : 0.9, ease: 'expo.inOut' }, '-=0.15')
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (gone) return null
  return (
    <div className="loader" ref={root} role="status" aria-label={`Loading ${n}%`}>
      <div className="ld-spud">
        <svg viewBox="0 0 120 100" aria-hidden>
          <defs>
            <clipPath id="ldclip">
              <path d={SHAPE} />
            </clipPath>
          </defs>
          <path d={SHAPE} fill="#FBE3A6" />
          <g clipPath="url(#ldclip)">
            {Array.from({ length: 6 }).map((_, i) => (
              <rect
                key={i}
                className={`peel ${n > (i + 1) * 14 ? 'off' : ''}`}
                x={8 + i * 18}
                y="0"
                width="19"
                height="100"
                fill={i % 2 ? '#B57E3E' : '#C48C48'}
                style={{ transformOrigin: `${17 + i * 18}px 10px` }}
              />
            ))}
          </g>
          <path d={SHAPE} fill="none" stroke="#FFF1D6" strokeWidth="3.5" />
          <ellipse cx="49" cy="47" rx="4" ry="5" fill="#1A1410" />
          <ellipse cx="71" cy="47" rx="4" ry="5" fill="#1A1410" />
          <path d="M52 58q8 8 16 0" stroke="#1A1410" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div className="ld-meta">
        <div className="ld-mask">
          <div className="ld-word">{WORDS[Math.min(WORDS.length - 1, Math.floor(n / 17))]}…</div>
        </div>
        <div className="ld-mask">
          <div className="ld-count">
            {String(n).padStart(3, '0')}
            <small>%</small>
          </div>
        </div>
      </div>
      <p className="ld-foot">Made with love, only for Puja</p>
    </div>
  )
}
