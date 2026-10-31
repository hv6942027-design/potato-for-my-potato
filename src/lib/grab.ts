import { useRef } from 'react'
import { live } from '../store'

/** Horizontal drag spins the 3D object (with inertia); a short press counts as a tap. Vertical scroll stays native. */
export function useGrab(onTap?: (e: React.PointerEvent) => void) {
  const st = useRef({ down: false, x: 0, sx: 0, t: 0, moved: 0 })
  return {
    'data-grab': true,
    onPointerDown: (e: React.PointerEvent) => {
      st.current = { down: true, x: e.clientX, sx: e.clientX, t: performance.now(), moved: 0 }
    },
    onPointerMove: (e: React.PointerEvent) => {
      const s = st.current
      if (!s.down) return
      const now = performance.now()
      const dx = e.clientX - s.x
      const dt = Math.max(8, now - s.t)
      live.dragVel = (dx / dt) * 9
      s.moved = Math.max(s.moved, Math.abs(e.clientX - s.sx))
      s.x = e.clientX
      s.t = now
    },
    onPointerUp: (e: React.PointerEvent) => {
      const s = st.current
      if (s.down && s.moved < 8) onTap?.(e)
      s.down = false
    },
    onPointerCancel: () => {
      st.current.down = false
    },
    onPointerLeave: () => {
      st.current.down = false
    },
  }
}
