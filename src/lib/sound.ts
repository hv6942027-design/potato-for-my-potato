import { useStore } from '../store'

let ctx: AudioContext | null = null
const ac = () => {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

const enabled = () => useStore.getState().soundOn

function tone(freq: number, to: number, dur: number, type: OscillatorType = 'sine', vol = 0.25) {
  const c = ac()
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(to, c.currentTime + dur)
  g.gain.setValueAtTime(vol, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
  o.connect(g).connect(c.destination)
  o.start()
  o.stop(c.currentTime + dur)
}

function noise(dur: number, freq: number, vol = 0.3, q = 1) {
  const c = ac()
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() > 0.6 ? 1 : 0.3)
  const src = c.createBufferSource()
  src.buffer = buf
  const f = c.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = freq
  f.Q.value = q
  const g = c.createGain()
  g.gain.setValueAtTime(vol, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
  src.connect(f).connect(g).connect(c.destination)
  src.start()
}

export const sfx = {
  pop: () => enabled() && tone(520 + Math.random() * 200, 140, 0.18, 'sine', 0.35),
  boing: () => enabled() && tone(180, 620, 0.25, 'triangle', 0.2),
  crunch: () => enabled() && noise(0.22, 2400, 0.5, 0.7),
  sizzle: () => enabled() && noise(0.9, 6000, 0.12, 0.4),
  whoosh: () => enabled() && noise(0.35, 900, 0.25, 0.5),
  ding: () => {
    if (!enabled()) return
    tone(880, 880, 0.5, 'sine', 0.2)
    setTimeout(() => tone(1320, 1320, 0.7, 'sine', 0.18), 110)
    setTimeout(() => tone(1760, 1760, 0.9, 'sine', 0.14), 220)
  },
  unlock: () => ac(),
}

export const buzz = (p: number | number[] = 12) => {
  try {
    navigator.vibrate?.(p)
  } catch {
    /* unsupported */
  }
}
