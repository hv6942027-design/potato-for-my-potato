import { useState } from 'react'
import { confetti } from '../lib/confetti'
import { buzz, sfx } from '../lib/sound'
import { scrollToId } from '../lib/scroll'
import { load, save } from '../lib/storage'
import { pickLine } from '../lib/love'
import { usePhoto } from '../lib/photo'
import Spud from '../components/Spud'

const NOPES = ['Are you sure?', 'Wrong button, Puja', 'Think again 🥺', 'The potato is crying', 'Error: not allowed', 'Okay that’s enough', 'Just press yes 💛']

export default function Footer() {
  const [yes, setYes] = useState(() => load('pp-yes', 0) === 1)
  const [nos, setNos] = useState(0)
  const [noPos, setNoPos] = useState({ x: 0, y: 0 })
  const [line, setLine] = useState(() => pickLine())
  const photo = usePhoto()

  const sayYes = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setYes(true)
    save('pp-yes', 1)
    confetti(r.left + r.width / 2, r.top, 180)
    sfx.ding()
    buzz([15, 30, 15, 30, 60])
  }

  const dodge = () => {
    setNos((n) => n + 1)
    setNoPos({ x: (Math.random() - 0.5) * Math.min(240, window.innerWidth * 0.6), y: (Math.random() - 0.5) * 120 })
    sfx.whoosh()
    buzz([20, 40, 20])
  }

  return (
    <footer id="join" data-scene="footer" data-color="#1A1410" className="footer">
      <div className="join-anchor" data-anchor="footer" aria-hidden />
      <div className="join">
        <p className="eyebrow">(07) Important question</p>
        <h2 className="h2">
          Puja, be my <br /> <em>potato forever?</em>
        </h2>
        <p className="join-sub">No pressure. There is only one correct answer, and it is very clearly the yellow button.</p>
        {yes ? (
          <div className="joined" role="status">
            {photo && <Spud className="joined-spud" photo={photo} shape={2} color="#FFC83D" />}
            <b>Puja said yes! 🥔💛</b>
            <span>Contract signed. Lifetime supply of hugs, fries, bad jokes and me. No refunds.</span>
          </div>
        ) : (
          <>
            <div className="ask">
              <button className="btn btn-gold yes-btn" style={{ transform: `scale(${1 + Math.min(nos, 7) * 0.12})` }} onClick={sayYes}>
                Yes, obviously 💛
              </button>
              <button
                className="btn btn-ghost no-btn"
                style={{ transform: `translate(${noPos.x}px, ${noPos.y}px) scale(${Math.max(0.5, 1 - nos * 0.08)})` }}
                onPointerDown={(e) => { e.preventDefault(); dodge() }}
                onClick={dodge}
              >
                No
              </button>
            </div>
            <p className="ask-note" aria-live="polite">{nos ? NOPES[Math.min(nos - 1, NOPES.length - 1)] : ''}</p>
          </>
        )}
      </div>

      <div className="pickup">
        <p className="eyebrow">Daily dose of cheese</p>
        <p className="pickup-line" key={line}>“{line}”</p>
        <button className="btn btn-gold" onClick={() => { setLine(pickLine(line)); sfx.pop(); buzz(8) }}>
          Another one 🥔
        </button>
      </div>

      <div className="foot-links">
        <button onClick={() => scrollToId('play')}>Play again</button>
        <button onClick={() => scrollToId('quiz')}>Retake quiz</button>
        <button onClick={() => scrollToId('hero')}>Back to top ↑</button>
      </div>

      <div className="wordmark" aria-hidden>
        <span>P♥P</span>
      </div>
      <p className="legal">Made with love (and potatoes) only for Puja. © forever, no expiry date.</p>
    </footer>
  )
}
