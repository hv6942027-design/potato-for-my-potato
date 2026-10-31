import { useState } from 'react'
import Spud from '../components/Spud'
import { buzz, sfx } from '../lib/sound'
import { confetti } from '../lib/confetti'
import { usePhoto } from '../lib/photo'

type T = 'curly' | 'baked' | 'mash' | 'chip'

const RESULTS: Record<T, { name: string; line: string; traits: string[]; color: string; shape: number }> = {
  curly: { name: 'Curly Fry', line: 'Chaotic, twisty and everyone’s favourite. Puja walks in and suddenly it’s a party. I’m obsessed.', traits: ['Main character', 'Spontaneous', 'Extra cute'], color: '#F9C74F', shape: 1 },
  baked: { name: 'Baked Potato', line: 'Warm, dependable and secretly loaded with love. Puja is my comfort food, honestly.', traits: ['My safe place', 'Cozy', 'Deep'], color: '#C9862B', shape: 0 },
  mash: { name: 'Mashed Potato', line: 'Soft, smooth, a walking hug. Puja is my emotional support side dish (main dish, actually).', traits: ['Caring', 'Huggable', 'Buttery'], color: '#FFEFC4', shape: 2 },
  chip: { name: 'Potato Chip', line: 'Crunchy outside, impossible to have just one of. Sharp wit, salty jokes, steals my heart anyway.', traits: ['Witty', 'Bold', 'Addictive'], color: '#FFD84D', shape: 3 },
}

const QS: { q: string; a: [string, T][] }[] = [
  { q: 'What is better?', a: [['Potato', 'curly'], ['My beloved', 'baked'], ['My lesbian friend', 'mash'], ['I, me, myself', 'chip']] },
  { q: 'Do you love me? 🙈 Say truthh', a: [['Yes', 'curly'], ['Obviously yes', 'baked'], ['Absolutely yes', 'mash'], ['No 😭😭😭', 'chip']] },
  { q: 'Will you be my forever? 🙈', a: [['Yes', 'baked'], ['No 😭', 'chip'], ['If not you, who else 🐣', 'mash'], ['No, I want Mr Penguin', 'curly']] },
  { q: 'Idk a question to ask, just click yes', a: [['Yes', 'curly'], ['Yes', 'baked'], ['Yes', 'mash'], ['Yes', 'chip']] },
]

export default function Quiz() {
  const [i, setI] = useState(0)
  const [score, setScore] = useState<Record<T, number>>({ curly: 0, baked: 0, mash: 0, chip: 0 })
  const [picked, setPicked] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const photo = usePhoto()
  const done = i >= QS.length
  const result = (Object.keys(score) as T[]).reduce((a, b) => (score[b] > score[a] ? b : a), 'curly')

  const choose = (k: number, t: T, e: React.MouseEvent) => {
    if (picked !== null) return
    setPicked(k)
    sfx.pop()
    buzz(10)
    setTimeout(() => {
      setScore((s) => ({ ...s, [t]: s[t] + 1 }))
      setPicked(null)
      setI((n) => n + 1)
      if (i === QS.length - 1) {
        sfx.ding()
        confetti(e.clientX, e.clientY, 100)
      }
    }, 420)
  }

  const share = async () => {
    const r = RESULTS[result]
    const text = `Today Puja is a ${r.name}! 🥔💛 ${r.line}`
    try {
      if (navigator.share) await navigator.share({ title: 'Which potato is Puja today?', text, url: location.href })
      else {
        await navigator.clipboard.writeText(`${text} ${location.href}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      /* cancelled */
    }
  }

  const reset = () => {
    setI(0)
    setScore({ curly: 0, baked: 0, mash: 0, chip: 0 })
    sfx.whoosh()
  }

  return (
    <section id="quiz" data-scene="none" data-color="#9BD36A" className="quiz">
      <header className="quiz-head" data-reveal>
        <p className="eyebrow">(03) The Puja quiz</p>
        <h2 className="h2">
          Which potato is <br /> <em>Puja</em> today?
        </h2>
      </header>

      <div className="quiz-card" data-reveal>
        {!done ? (
          <div className="q" key={i}>
            <div className="q-top">
              <span className="q-n">Q{i + 1}</span>
              <div className="q-progress" aria-hidden>
                {QS.map((_, k) => <i key={k} className={k < i ? 'done' : k === i ? 'now' : ''} />)}
              </div>
            </div>
            <h3 className="q-q">{QS[i].q}</h3>
            <div className="q-opts">
              {QS[i].a.map(([label, t], k) => (
                <button key={k}className={`q-opt ${picked === k ? 'picked' : ''}`} onClick={(e) => choose(k, t, e)} style={{ '--d': `${k * 60}ms` } as React.CSSProperties}>
                  <span className="q-key">{'ABCD'[k]}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="result">
            <span className="result-kicker">Today Puja is a…</span>
            <Spud className="result-spud" color={RESULTS[result].color} shape={RESULTS[result].shape} mood="wow" photo={photo} />
            <h3 className="result-name">{RESULTS[result].name}</h3>
            <p>{RESULTS[result].line}</p>
            <div className="result-traits">
              {RESULTS[result].traits.map((t, k) => <span key={t} className="sticker" style={{ rotate: `${(k - 1) * 4}deg` }}>{t}</span>)}
            </div>
            <div className="result-actions">
              <button className="btn btn-ink" onClick={share}>{copied ? 'Copied! ✓' : 'Send it to me ↗'}</button>
              <button className="btn btn-ghost" onClick={reset}>Retake</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
