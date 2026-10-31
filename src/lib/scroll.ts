import Lenis from 'lenis'
import { live, useStore, type Scene } from '../store'

export let lenis: Lenis | null = null
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initLenis() {
  if (lenis || reducedMotion()) return
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.stop()
  const raf = (t: number) => {
    lenis?.raf(t)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.4 })
  else el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
}

/** One rAF loop that drives everything scroll-linked: active scene, origin progress, velocity skew, theme color. */
export function startTracker() {
  const html = document.documentElement
  const meta = document.querySelector('meta[name=theme-color]')
  const origin = document.getElementById('origin')
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'))
  const anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-anchor]'))
  let lastY = window.scrollY
  let lastT = performance.now()
  let vel = 0
  let lastSkew = 0
  let raf = 0

  const loop = (now: number) => {
    const dt = Math.max(1, now - lastT)
    lastT = now
    const y = window.scrollY
    vel += (((y - lastY) / dt) * 16 - vel) * 0.15
    lastY = y
    live.scrollVel = vel
    // tuck the top bar away while reading downwards, bring it back on any upward scroll
    if (vel > 1.5 && y > 240) html.classList.add('hide-top')
    else if (vel < -1.5 || y <= 240) html.classList.remove('hide-top')

    const skew = Math.max(-9, Math.min(9, vel * 0.3))
    if (Math.abs(skew - lastSkew) > 0.04) {
      html.style.setProperty('--skew', `${skew.toFixed(2)}deg`)
      lastSkew = skew
    }

    for (const a of anchors) {
      const r = a.getBoundingClientRect()
      live.anchors[a.dataset.anchor!] = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }

    const mid = window.innerHeight * 0.5
    for (const s of sections) {
      const r = s.getBoundingClientRect()
      if (r.top <= mid && r.bottom > mid) {
        const st = useStore.getState()
        if (st.section !== s.id) {
          useStore.setState({ scene: s.dataset.scene as Scene, section: s.id })
          meta?.setAttribute('content', s.dataset.color || '#FFF1D6')
        }
        break
      }
    }

    if (origin) {
      const r = origin.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)))
      live.originProgress = p
      origin.style.setProperty('--p', p.toFixed(4))
      const step = p < 0.2 ? 0 : p < 0.48 ? 1 : p < 0.74 ? 2 : 3
      if (useStore.getState().originStep !== step) useStore.setState({ originStep: step })
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => cancelAnimationFrame(raf)
}

export function startReveals() {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          // a data attribute, not a class: React re-renders would wipe an added className
          ;(e.target as HTMLElement).dataset.in = ''
          io.unobserve(e.target)
        }
      }),
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  )
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
  return () => io.disconnect()
}
