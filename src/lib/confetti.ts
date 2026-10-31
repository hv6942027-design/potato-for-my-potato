type P = { x: number; y: number; vx: number; vy: number; r: number; vr: number; kind: number; c: string; w: number; h: number }

const COLORS = ['#F9C74F', '#E8B04B', '#E63946', '#7BC74D', '#FFF1D6', '#C9862B']

/** Bursts fries, chips and tiny potatoes from a point on screen. */
export function confetti(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 90, gold = false) {
  const cv = document.createElement('canvas')
  const dpr = Math.min(2, window.devicePixelRatio)
  cv.width = window.innerWidth * dpr
  cv.height = window.innerHeight * dpr
  cv.className = 'confetti'
  document.body.appendChild(cv)
  const ctx = cv.getContext('2d')!
  ctx.scale(dpr, dpr)

  const ps: P[] = Array.from({ length: count }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2
    const sp = 6 + Math.random() * 11
    const kind = Math.floor(Math.random() * 3)
    return {
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
      kind,
      c: gold ? (Math.random() > 0.5 ? '#FFC83D' : '#FFE38A') : COLORS[Math.floor(Math.random() * COLORS.length)],
      w: kind === 0 ? 5 : 9 + Math.random() * 6,
      h: kind === 0 ? 22 + Math.random() * 10 : 7 + Math.random() * 5,
    }
  })

  const start = performance.now()
  const tick = (now: number) => {
    const t = now - start
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    for (const p of ps) {
      p.vy += 0.32
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.r += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.r)
      ctx.globalAlpha = Math.max(0, 1 - t / 2600)
      ctx.fillStyle = p.c
      ctx.strokeStyle = '#1A1410'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      if (p.kind === 0) ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 2)
      else if (p.kind === 1) ctx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2)
      else ctx.ellipse(0, 0, p.w * 0.8, p.w * 0.6, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }
    if (t < 2700) requestAnimationFrame(tick)
    else cv.remove()
  }
  requestAnimationFrame(tick)
}
