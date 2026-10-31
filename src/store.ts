import { create } from 'zustand'

export type Scene = 'hero' | 'origin' | 'dishes' | 'footer' | 'none'

type State = {
  loaded: boolean
  scene: Scene
  section: string
  soundOn: boolean
  golden: boolean
  dish: number
  originStep: number
  setLoaded: () => void
  setSoundOn: (v: boolean) => void
  setGolden: (v: boolean) => void
  setDish: (i: number) => void
}

export const useStore = create<State>((set) => ({
  loaded: false,
  scene: 'hero',
  section: 'hero',
  soundOn: false,
  golden: false,
  dish: 0,
  originStep: 0,
  setLoaded: () => set({ loaded: true }),
  setSoundOn: (soundOn) => set({ soundOn }),
  setGolden: (golden) => set({ golden }),
  setDish: (dish) => set({ dish }),
}))

/** High-frequency values read inside the render loop. Mutated directly, never triggers React renders. */
export const live = {
  originProgress: 0,
  pointer: { x: 0, y: 0 },
  tilt: { x: 0, y: 0 },
  dragVel: 0,
  squish: 0,
  scrollVel: 0,
  heroTaps: 0,
  dragRot: 0,
  /** on-screen centre (px) of each scene's [data-anchor] element, so 3D objects scroll with their section */
  anchors: {} as Record<string, { x: number; y: number }>,
}
