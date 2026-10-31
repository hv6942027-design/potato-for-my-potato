import { useId } from 'react'

const SHAPES = [
  'M18 40C24 15 58 6 84 12s34 30 28 52-34 30-62 26S12 64 18 40z',
  'M8 54C9 36 40 31 64 31s49 4 50 21-24 26-54 24S7 72 8 54z',
  'M20 50C20 22 44 10 66 12s40 20 38 44-22 38-50 36S20 78 20 50z',
  'M14 46C16 20 50 8 78 14s36 26 30 46-30 32-58 28S12 72 14 46z',
]

/** Where a photo face sits on each shape: cx, cy, r */
const FACE_SPOT = [[62, 50, 27], [60, 54, 20], [62, 52, 29], [62, 48, 27]]

type Props = {
  color?: string
  spot?: string
  shape?: number
  face?: boolean
  mood?: 'happy' | 'wow' | 'sleepy'
  /** image url: shows this photo as the potato's face */
  photo?: string | null
  className?: string
  style?: React.CSSProperties
}

/** Flat sticker-style potato used across the 2D UI. */
export default function Spud({ color = '#E8B04B', spot = '#9A6B2C', shape = 0, face = true, mood = 'happy', photo, className, style }: Props) {
  const id = useId().replace(/:/g, '')
  const [cx, cy, r] = FACE_SPOT[shape % FACE_SPOT.length]
  return (
    <svg viewBox="0 0 120 100" className={className} style={style} aria-hidden>
      <path d={SHAPES[shape % SHAPES.length]} fill={color} stroke="#1A1410" strokeWidth="3.5" strokeLinejoin="round" />
      <path d={SHAPES[shape % SHAPES.length]} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeDasharray="18 200" strokeDashoffset="-150" strokeLinecap="round" transform="translate(-3 -3) scale(.98)" />
      <circle cx="30" cy="34" r="2.6" fill={spot} />
      <circle cx="92" cy="66" r="3" fill={spot} />
      <circle cx="80" cy="24" r="2" fill={spot} />
      <circle cx="38" cy="72" r="2.2" fill={spot} />
      {photo && (
        <g>
          <defs>
            <clipPath id={`pf${id}`}>
              <circle cx={cx} cy={cy} r={r} />
            </clipPath>
          </defs>
          <image href={photo} x={cx - r} y={cy - r} width={r * 2} height={r * 2} preserveAspectRatio="xMidYMid slice" clipPath={`url(#pf${id})`} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A1410" strokeWidth="3" />
          <ellipse cx={cx - r * 0.95} cy={cy + r * 0.5} rx="5" ry="3" fill="#FF7A7A" opacity=".7" />
          <ellipse cx={cx + r * 0.95} cy={cy + r * 0.5} rx="5" ry="3" fill="#FF7A7A" opacity=".7" />
          <path d={`M${cx + r * 0.62} ${cy - r * 0.98}c-3-5-10-2-7 4l7 6 7-6c3-6-4-9-7-4z`} fill="#FF5C8A" stroke="#1A1410" strokeWidth="2" />
        </g>
      )}
      {face && !photo && (
        <g>
          {mood === 'sleepy' ? (
            <>
              <path d="M44 48q5 4 10 0M66 48q5 4 10 0" stroke="#1A1410" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="49" cy="47" rx="4.2" ry="5.2" fill="#1A1410" />
              <ellipse cx="71" cy="47" rx="4.2" ry="5.2" fill="#1A1410" />
              <circle cx="50.5" cy="45" r="1.4" fill="#fff" />
              <circle cx="72.5" cy="45" r="1.4" fill="#fff" />
            </>
          )}
          {mood === 'wow' ? (
            <ellipse cx="60" cy="61" rx="4" ry="5" fill="#3B1F12" />
          ) : (
            <path d="M52 58q8 8 16 0" stroke="#1A1410" strokeWidth="3" fill="none" strokeLinecap="round" />
          )}
          <ellipse cx="40" cy="57" rx="5" ry="3" fill="#FF7A7A" opacity=".55" />
          <ellipse cx="80" cy="57" rx="5" ry="3" fill="#FF7A7A" opacity=".55" />
        </g>
      )}
    </svg>
  )
}
