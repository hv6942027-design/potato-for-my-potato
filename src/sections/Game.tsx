import { useEffect, useRef, useState } from 'react'
import { buzz, sfx } from '../lib/sound'
import { load, save } from '../lib/storage'
import { confetti } from '../lib/confetti'
import { CHEERS, pickLine } from '../lib/love'
import { photoNow, usePhoto } from '../lib/photo'

/** 0 potato (+1) · 1 onion (−3, makes Puja cry) · 2 golden potato (+5) · 3 heart (+2, fills the love meter) */
type Kind = 0 | 1 | 2 | 3
type Item = { x: number; y: number; vy: number; kind: Kind; r: number; rot: number; vr: number }
type Pop = { x: number; y: number; t: number; text: string; c: string; big?: boolean }
type Floaty = { x: number; y: number; vy: number; s: number; t: number }

const ROUND = 30
const METER = 5 // hearts needed for Love Mode
const LOVE_SECS = 6

function heartPath(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath()
  ctx.moveTo(0, s * 0.9)
  ctx.bezierCurveTo(-s * 1.35, 0, -s * 0.95, -s * 1.15, 0, -s * 0.45)
  ctx.bezierCurveTo(s * 0.95, -s * 1.15, s * 1.35, 0, 0, s * 0.9)
  ctx.closePath()
}

function drawFace(ctx: CanvasRenderingContext2D, r: number, sad = false) {
  ctx.fillStyle = '#1A1410'
  ctx.beginPath()
  ctx.arc(-r * 0.3, -r * 0.1, r * 0.11, 0, Math.PI * 2)
  ctx.arc(r * 0.3, -r * 0.1, r * 0.11, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.strokeStyle = '#1A1410'
  ctx.lineWidth = 2.5
  if (sad) ctx.arc(0, r * 0.38, r * 0.2, Math.PI + 0.3, -0.3)
  else ctx.arc(0, r * 0.1, r * 0.22, 0.2, Math.PI - 0.2)
  ctx.stroke()
}

function drawItem(ctx: CanvasRenderingContext2D, it: Item, t: number) {
  const r = it.r
  ctx.save()
  ctx.translate(it.x, it.y)

  if (it.kind === 3) {
    // heart: gentle pulse instead of spin
    const p = 1 + Math.sin(t * 9 + it.x) * 0.08
    ctx.scale(p, p)
    ctx.rotate(Math.sin(t * 3 + it.y * 0.01) * 0.2)
    heartPath(ctx, r * 1.05)
    ctx.fillStyle = '#FF5C8A'
    ctx.strokeStyle = '#1A1410'
    ctx.lineWidth = 3
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,.75)'
    ctx.beginPath()
    ctx.ellipse(-r * 0.42, -r * 0.42, r * 0.16, r * 0.1, -0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    return
  }

  ctx.rotate(it.kind === 1 ? Math.sin(t * 4 + it.x) * 0.25 : it.rot)

  if (it.kind === 1) {
    // onion
    ctx.fillStyle = '#C9A0DC'
    ctx.strokeStyle = '#1A1410'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, -r * 1.55)
    ctx.quadraticCurveTo(r * 0.25, -r * 1.0, r * 1.05, -r * 0.15)
    ctx.quadraticCurveTo(r * 1.2, r * 0.95, 0, r)
    ctx.quadraticCurveTo(-r * 1.2, r * 0.95, -r * 1.05, -r * 0.15)
    ctx.quadraticCurveTo(-r * 0.25, -r * 1.0, 0, -r * 1.55)
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = 'rgba(26,20,16,.35)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, -r * 1.3); ctx.quadraticCurveTo(-r * 0.6, -r * 0.2, -r * 0.2, r * 0.9)
    ctx.moveTo(0, -r * 1.3); ctx.quadraticCurveTo(r * 0.6, -r * 0.2, r * 0.2, r * 0.9)
    ctx.stroke()
    drawFace(ctx, r, true)
    ctx.restore()
    // tears
    ctx.fillStyle = '#7FD3FF'
    for (let k = 0; k < 2; k++) {
      const ph = (t * 1.6 + k * 0.5) % 1
      const tx = it.x + (k ? r * 0.3 : -r * 0.3)
      const ty = it.y + r * 0.05 + ph * r * 0.9
      ctx.globalAlpha = 1 - ph
      ctx.beginPath()
      ctx.arc(tx, ty, 2.6, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    return
  }

  // potato (normal or golden)
  ctx.fillStyle = it.kind === 2 ? '#FFC83D' : '#E8B04B'
  ctx.strokeStyle = '#1A1410'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 1.25, r, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = 'rgba(120,70,20,.55)'
  for (const [sx, sy, sr] of [[-0.5, -0.3, 0.12], [0.45, 0.35, 0.1], [0.2, -0.5, 0.08]]) {
    ctx.beginPath()
    ctx.arc(sx * r, sy * r, sr * r, 0, Math.PI * 2)
    ctx.fill()
  }
  const pic = it.kind === 2 ? photoNow() : null
  if (pic) {
    const fr = r * 0.78
    const side = Math.min(pic.width, pic.height)
    ctx.save()
    ctx.rotate(-it.rot) // keep her face upright while the potato spins
    ctx.beginPath()
    ctx.arc(0, 0, fr, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(pic, (pic.width - side) / 2, (pic.height - side) / 2, side, side, -fr, -fr, fr * 2, fr * 2)
    ctx.restore()
    ctx.beginPath()
    ctx.arc(0, 0, fr, 0, Math.PI * 2)
    ctx.strokeStyle = '#1A1410'
    ctx.lineWidth = 2.5
    ctx.stroke()
  } else drawFace(ctx, r)
  // blush
  ctx.fillStyle = 'rgba(255,92,138,.45)'
  ctx.beginPath()
  ctx.ellipse(-r * 0.62, r * 0.12, r * 0.16, r * 0.1, 0, 0, Math.PI * 2)
  ctx.ellipse(r * 0.62, r * 0.12, r * 0.16, r * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  if (it.kind === 2) {
    ctx.strokeStyle = '#FFF4C2'
    ctx.lineWidth = 2
    const s = r * (1.6 + Math.sin(t * 10) * 0.2)
    ctx.beginPath()
    ctx.moveTo(it.x - s, it.y); ctx.lineTo(it.x + s, it.y)
    ctx.moveTo(it.x, it.y - s); ctx.lineTo(it.x, it.y + s)
    ctx.stroke()
  }
}

function drawBasket(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, squash: number, love: boolean, t: number) {
  const h = w * 0.42 * (1 - squash * 0.25)
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(1 + squash * 0.12, 1)
  if (love) {
    ctx.shadowColor = '#FF5C8A'
    ctx.shadowBlur = 18 + Math.sin(t * 8) * 6
  }
  ctx.fillStyle = love ? '#FF5C8A' : '#E63946'
  ctx.strokeStyle = '#1A1410'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(-w / 2, 0)
  ctx.lineTo(w / 2, 0)
  ctx.lineTo(w / 2 - w * 0.1, h)
  ctx.lineTo(-w / 2 + w * 0.1, h)
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.stroke()
  // label on the basket
  ctx.fillStyle = '#FFF1D6'
  ctx.font = `800 ${Math.round(h * 0.42)}px "Bricolage Grotesque", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('P ♥ P', 0, h * 0.55)
  ctx.fillStyle = '#FFF1D6'
  ctx.strokeStyle = '#1A1410'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(-w / 2 - 6, -7, w + 12, 12, 6)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

function verdict(score: number) {
  if (score >= 80) return 'Puja, you absolute legend. Marry me (again)?'
  if (score >= 50) return 'Certified potato queen. I’m so proud of you.'
  if (score >= 25) return 'Not bad, cutie. One more round, for me?'
  return 'The onions won. I still love you the most.'
}

export default function Game() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'idle' | 'play' | 'over'>('idle')
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(ROUND)
  const [best, setBest] = useState(() => load('spud-best', 0))
  const [newBest, setNewBest] = useState(false)
  const [line, setLine] = useState(() => pickLine())
  const [stats, setStats] = useState({ hearts: 0, maxCombo: 0 })
  const photo = usePhoto()
  const g = useRef({
    items: [] as Item[], pops: [] as Pop[], floaties: [] as Floaty[],
    bx: 0.5, tx: 0.5, score: 0, start: 0, last: 0, spawn: 0, squash: 0, shake: 0, playing: false,
    combo: 0, maxCombo: 0, meter: 0, heartsCaught: 0, loveUntil: 0, el: 0, visible: true,
  })

  // size + render loop (runs while visible so the idle screen animates too)
  useEffect(() => {
    const cv = canvas.current!
    const ctx = cv.getContext('2d')!
    let W = 0, H = 0, raf = 0
    const resize = () => {
      const r = wrap.current!.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio)
      W = r.width
      H = r.height
      cv.width = W * dpr
      cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap.current!)
    const io = new IntersectionObserver(([e]) => { g.current.visible = e.isIntersecting })
    io.observe(wrap.current!)

    const end = () => {
      const s = g.current
      s.playing = false
      s.items = []
      setPhase('over')
      setLine(pickLine())
      setStats({ hearts: s.heartsCaught, maxCombo: s.maxCombo })
      const prev = load('spud-best', 0)
      if (s.score > prev) {
        save('spud-best', s.score)
        setBest(s.score)
        setNewBest(true)
        sfx.ding()
        const rr = cv.getBoundingClientRect()
        confetti(rr.left + rr.width / 2, rr.top + rr.height / 2, 120)
      }
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const s = g.current
      const dt = Math.min(0.033, (now - (s.last || now)) / 1000)
      s.last = now
      if (!s.visible && !s.playing) return
      const t = now / 1000
      const r = Math.max(14, W * 0.045)
      const el = s.playing ? (now - s.start) / 1000 : s.el
      s.el = el
      const love = s.playing && el < s.loveUntil
      const bw = W * (love ? 0.42 : 0.28)
      const by = H - r * 2.6

      if (s.playing) {
        const left = Math.max(0, ROUND - el)
        setTime(Math.ceil(left))
        if (left <= 0) end()
        const rate = 0.6 - Math.min(0.32, el * 0.011)
        s.spawn -= dt
        if (s.spawn <= 0) {
          s.spawn = love ? rate * 0.7 : rate
          const roll = Math.random()
          let kind: Kind = roll < 0.06 ? 2 : roll < 0.24 ? 3 : roll < 0.46 ? 1 : 0
          if (love && kind === 1) kind = 3 // no onions in Love Mode
          s.items.push({
            x: r * 1.5 + Math.random() * (W - r * 3), y: -r * 2,
            vy: H * (0.32 + Math.random() * 0.18 + el * 0.013) * (kind === 3 ? 0.85 : 1),
            kind, r: kind === 2 ? (photoNow() ? r * 1.25 : r * 0.85) : r, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 4,
          })
        }
      }

      s.bx += (s.tx - s.bx) * Math.min(1, dt * 18)
      const bx = s.bx * W
      s.squash *= Math.pow(0.002, dt)
      s.shake *= Math.pow(0.001, dt)

      for (const it of s.items) {
        it.y += it.vy * dt
        it.rot += it.vr * dt
        if (s.playing && it.y + it.r > by - 4 && it.y < by + 18 && Math.abs(it.x - bx) < bw / 2 + it.r * 0.4) {
          it.y = 1e9
          if (it.kind === 1) {
            s.score = Math.max(0, s.score - 3)
            s.combo = 0
            s.shake = 1
            s.pops.push({ x: bx, y: by - 20, t: 0, text: '−3 😢', c: '#C9A0DC' })
            sfx.crunch()
            buzz([20, 30, 40])
          } else {
            s.combo++
            s.maxCombo = Math.max(s.maxCombo, s.combo)
            const mult = (s.combo >= 10 ? 3 : s.combo >= 5 ? 2 : 1) * (love ? 2 : 1)
            const base = it.kind === 0 ? 1 : it.kind === 2 ? 5 : 2
            const pts = base * mult
            s.score += pts
            s.squash = 1
            s.pops.push({ x: bx, y: by - 20, t: 0, text: `+${pts}`, c: it.kind === 3 ? '#FF8FB1' : pts > 1 ? '#FFC83D' : '#9BD36A' })
            if (s.combo % 5 === 0) {
              s.pops.push({ x: W / 2, y: H * 0.42, t: 0, text: CHEERS[Math.floor(Math.random() * CHEERS.length)], c: '#FFF1D6', big: true })
              sfx.ding()
            } else if (it.kind === 0) sfx.pop()
            else sfx.boing()
            buzz(8)
            if (it.kind === 3) {
              s.heartsCaught++
              for (let k = 0; k < 4; k++) s.floaties.push({ x: bx + (Math.random() - 0.5) * bw * 0.6, y: by, vy: 60 + Math.random() * 60, s: 5 + Math.random() * 5, t: 0 })
              if (!love) {
                s.meter++
                if (s.meter >= METER) {
                  s.meter = 0
                  s.loveUntil = el + LOVE_SECS
                  s.pops.push({ x: W / 2, y: H * 0.34, t: 0, text: 'LOVE MODE 💖', c: '#FF8FB1', big: true })
                  sfx.ding()
                  buzz([20, 40, 20, 40, 60])
                }
              }
            }
          }
          setScore(s.score)
        } else if (s.playing && it.y > H + it.r && it.y < 1e8 && it.kind !== 1 && s.combo > 0) {
          s.combo = 0 // dropped a good one: combo resets
          it.y = 1e9
        }
      }
      s.items = s.items.filter((it) => it.y < H + 60)

      ctx.save()
      ctx.clearRect(0, 0, W, H)
      if (s.shake > 0.02) ctx.translate((Math.random() - 0.5) * 12 * s.shake, (Math.random() - 0.5) * 8 * s.shake)
      if (love) {
        ctx.fillStyle = `rgba(255,92,138,${0.1 + Math.sin(t * 6) * 0.04})`
        ctx.fillRect(-20, -20, W + 40, H + 40)
        if (Math.random() < dt * 8) s.floaties.push({ x: Math.random() * W, y: H + 10, vy: 50 + Math.random() * 50, s: 4 + Math.random() * 6, t: 0 })
      }
      ctx.fillStyle = 'rgba(255,241,214,.07)'
      for (let x = 12; x < W; x += 24) for (let y = 12; y < H; y += 24) ctx.fillRect(x, y, 2, 2)

      // floating background hearts
      for (const f of s.floaties) {
        f.t += dt
        f.y -= f.vy * dt
        ctx.save()
        ctx.globalAlpha = Math.max(0, 0.7 - f.t * 0.35)
        ctx.translate(f.x + Math.sin(f.t * 3 + f.s) * 8, f.y)
        heartPath(ctx, f.s)
        ctx.fillStyle = '#FF8FB1'
        ctx.fill()
        ctx.restore()
      }
      s.floaties = s.floaties.filter((f) => f.t < 2 && f.y > -20)

      for (const it of s.items) drawItem(ctx, it, t)
      drawBasket(ctx, bx, by, bw, s.squash, love, t)

      if (s.playing) {
        // love meter (top left) + combo (top right)
        const hs = Math.max(7, r * 0.42)
        for (let k = 0; k < METER; k++) {
          ctx.save()
          ctx.translate(14 + hs + k * hs * 2.5, 14 + hs)
          heartPath(ctx, hs)
          const filled = love ? Math.max(0, s.loveUntil - el) / LOVE_SECS > k / METER : k < s.meter
          ctx.fillStyle = filled ? '#FF5C8A' : 'rgba(255,241,214,.12)'
          ctx.strokeStyle = 'rgba(255,241,214,.55)'
          ctx.lineWidth = 1.5
          ctx.fill()
          ctx.stroke()
          ctx.restore()
        }
        if (s.combo >= 3) {
          const mult = (s.combo >= 10 ? 3 : s.combo >= 5 ? 2 : 1) * (love ? 2 : 1)
          ctx.font = `800 ${Math.round(r * 0.95)}px "Bricolage Grotesque", sans-serif`
          ctx.textAlign = 'right'
          ctx.textBaseline = 'top'
          ctx.fillStyle = mult > 1 ? '#FFC83D' : 'rgba(255,241,214,.7)'
          ctx.fillText(`${s.combo} combo${mult > 1 ? ` ×${mult}` : ''}`, W - 14, 12)
        }
      }

      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      for (const p of s.pops) {
        p.t += dt
        const life = p.big ? 1.2 : 0.8
        ctx.globalAlpha = Math.max(0, 1 - p.t / life)
        ctx.font = `800 ${Math.round(r * (p.big ? 2 : 1.2))}px "Bricolage Grotesque", sans-serif`
        ctx.fillStyle = p.c
        if (p.big) {
          ctx.strokeStyle = '#1A1410'
          ctx.lineWidth = 5
          ctx.strokeText(p.text, p.x, p.y - p.t * 40)
        }
        ctx.fillText(p.text, p.x, p.y - p.t * (p.big ? 40 : 70))
      }
      ctx.globalAlpha = 1
      s.pops = s.pops.filter((p) => p.t < (p.big ? 1.2 : 0.8))
      ctx.restore()
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  // controls
  useEffect(() => {
    const el = wrap.current!
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      g.current.tx = Math.min(0.92, Math.max(0.08, (e.clientX - r.left) / r.width))
    }
    const key = (e: KeyboardEvent) => {
      if (!g.current.playing) return
      if (e.key === 'ArrowLeft') g.current.tx = Math.max(0.08, g.current.tx - 0.12)
      if (e.key === 'ArrowRight') g.current.tx = Math.min(0.92, g.current.tx + 0.12)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerdown', move)
    window.addEventListener('keydown', key)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerdown', move)
      window.removeEventListener('keydown', key)
    }
  }, [])

  const start = () => {
    const s = g.current
    Object.assign(s, { items: [], pops: [], floaties: [], score: 0, start: performance.now(), spawn: 0.3, playing: true, combo: 0, maxCombo: 0, meter: 0, heartsCaught: 0, loveUntil: 0, el: 0 })
    setScore(0)
    setTime(ROUND)
    setNewBest(false)
    setPhase('play')
    sfx.unlock()
    sfx.whoosh()
    buzz(15)
  }

  return (
    <section id="play" data-scene="none" data-color="#1A1410" className="game">
      <header className="game-head" data-reveal>
        <p className="eyebrow">(04) Puja’s arcade</p>
        <h2 className="h2">
          Catch my <em>love</em>
        </h2>
        <p className="game-rules">
          <span>🥔 +1</span>
          <span>💖 +2 &amp; fills love meter</span>
          <span>{photo ? '✨ Puja potato +5' : '✨ golden +5'}</span>
          <span>🧅 −3 (onions make you cry)</span>
        </p>
      </header>

      <div className={`arcade ${phase}`} data-reveal>
        <div className="hud">
          <span>Score <b>{score}</b></span>
          <span className={time <= 5 && phase === 'play' ? 'hurry' : ''}>⏱ <b>{time}s</b></span>
          <span>Best <b>{best}</b></span>
        </div>
        <div className="screen" ref={wrap} data-grab>
          <canvas ref={canvas} />
          {phase !== 'play' && (
            <div className="screen-over">
              {phase === 'over' ? (
                <>
                  <p className="over-k">{newBest ? 'New high score, Puja!' : 'Time’s up, cutie!'}</p>
                  <p className="over-score">{score}</p>
                  <p className="over-sub">{verdict(score)}</p>
                  <p className="over-stats">💖 {stats.hearts} hearts caught · 🔥 best combo {stats.maxCombo}</p>
                  <p className="over-line">“{line}”</p>
                </>
              ) : (
                <>
                  <p className="over-k">30 seconds · just for Puja</p>
                  <p className="over-title">Catch the potatoes.<br />Dodge the onions.</p>
                  <p className="over-sub">Grab 5 hearts for Love Mode: bigger basket, double points, no onions.</p>
                </>
              )}
              <button className="btn btn-gold" onClick={start}>{phase === 'over' ? 'One more for me' : 'Let’s play'} ▶</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
