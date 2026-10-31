import { useEffect, useState } from 'react'
import { live, useStore } from '../store'
import { useGrab } from '../lib/grab'
import { buzz, sfx } from '../lib/sound'
import { confetti } from '../lib/confetti'
import { scrollToId } from '../lib/scroll'
import { usePhoto } from '../lib/photo'
import Spud from '../components/Spud'

const clamp = (v: number) => Math.max(-1, Math.min(1, v))

function onOrient(e: DeviceOrientationEvent) {
  if (e.gamma == null || e.beta == null) return
  live.tilt.x = clamp(e.gamma / 35)
  live.tilt.y = clamp((e.beta - 50) / 40)
}

export default function Hero() {
  const loaded = useStore((s) => s.loaded)
  const golden = useStore((s) => s.golden)
  const [taps, setTaps] = useState(0)
  const photo = usePhoto()
  const [needsTiltPermission, setNeedsTiltPermission] = useState(false)

  useEffect(() => {
    const DOE = (window as any).DeviceOrientationEvent
    if (!DOE || !('ontouchstart' in window)) return
    if (typeof DOE.requestPermission === 'function') setNeedsTiltPermission(true)
    else window.addEventListener('deviceorientation', onOrient)
    return () => window.removeEventListener('deviceorientation', onOrient)
  }, [])

  const enableTilt = async () => {
    try {
      const res = await (window as any).DeviceOrientationEvent.requestPermission()
      if (res === 'granted') window.addEventListener('deviceorientation', onOrient)
    } catch {
      /* denied */
    }
    setNeedsTiltPermission(false)
  }

  const grab = useGrab((e) => {
    live.squish = 1
    sfx.boing()
    buzz(14)
    const next = taps + 1
    if (next >= 10) {
      const g = !useStore.getState().golden
      useStore.getState().setGolden(g)
      document.documentElement.classList.toggle('golden', g)
      confetti(e.clientX, e.clientY, 140, g)
      sfx.ding()
      buzz([30, 40, 30, 40, 80])
      setTaps(0)
    } else setTaps(next)
  })

  return (
    <section id="hero" data-scene="hero" data-color="#FFF1D6" className={`hero ${loaded ? 'go' : ''}`}>
      <h1 className="hero-title">
        <span className="line"><span>Puja</span></span>
        <span className="line serif"><span>loves</span></span>
        <span className="line"><span className="hero-gold">potato.</span></span>
      </h1>

      <div className="hero-stage" data-anchor="hero" {...grab} aria-label="Tap or drag the potato" role="button" tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            live.squish = 1
            sfx.boing()
          }
        }}
      >
        <span className="sticker s-est">Puja’s potato</span>
        <span className="sticker s-tap">
          {taps >= 3 ? `${10 - taps} more taps…` : golden ? 'Golden Puja!' : 'Hug me, Puja'}
          <svg viewBox="0 0 40 30" aria-hidden><path d="M4 4c10 2 20 8 24 20m0 0l-8-4m8 4l3-9" /></svg>
        </span>
      </div>

      <div className="hero-foot">
        <p className="hero-lede">
          P for Puja. P for Potato. P for <em>Perfect</em>, which is just you again. A tiny website made only for my favourite person. Squish it, spin it, love it.
        </p>
        <div className="hero-actions">
          <button className="btn btn-ink" onClick={() => { sfx.whoosh(); scrollToId('origin') }}>
            Open your gift <span aria-hidden>↓</span>
          </button>
          {needsTiltPermission && (
            <button className="btn btn-ghost" onClick={enableTilt}>
              Enable tilt ✦
            </button>
          )}
        </div>
      </div>

      <div className="badge" aria-hidden>
        <svg viewBox="0 0 120 120">
          <defs>
            <path id="circ" d="M60 60m-46 0a46 46 0 1092 0a46 46 0 10-92 0" />
          </defs>
          <text>
            <textPath href="#circ">P FOR PUJA ✺ P FOR POTATO ✺ ALL YOURS ✺ </textPath>
          </text>
        </svg>
        {photo ? <Spud className="badge-spud" photo={photo} shape={2} /> : <span>🥔</span>}
      </div>
    </section>
  )
}
