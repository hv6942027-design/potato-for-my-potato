import { lazy, Suspense, useEffect, useState } from 'react'
import { live } from './store'
import { initLenis, startReveals, startTracker } from './lib/scroll'
import { Cursor, Marquee, Nav, TopBar } from './components/Chrome'
import Loader from './sections/Loader'
import Hero from './sections/Hero'
import Origin from './sections/Origin'
import Dishes from './sections/Dishes'
import Quiz from './sections/Quiz'
import Game from './sections/Game'
import Varieties from './sections/Varieties'
import Recipes from './sections/Recipes'
import Footer from './sections/Footer'

const Scene = lazy(() => import('./three/Scene'))

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function App() {
  const [gl] = useState(hasWebGL)

  useEffect(() => {
    initLenis()
    const stopTracker = startTracker()
    const stopReveals = startReveals()
    const move = (e: PointerEvent) => {
      live.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      live.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      stopTracker()
      stopReveals()
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <>
      <Loader />
      {gl ? (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      ) : (
        <div className="no-gl" aria-hidden>🥔</div>
      )}
      <TopBar />
      <main>
        <Hero />
        <Marquee words={['P for Puja', 'P for Potato', 'P for Perfect', 'P for Pyaar']} />
        <Origin />
        <Dishes />
        <Marquee words={['Mashed on you', 'Fry-ever yours', 'My favourite carb', 'Tater-ly in love']} tone="gold" reverse />
        <Quiz />
        <Game />
        <Varieties />
        <Recipes />
        <Footer />
      </main>
      <Nav />
      <Cursor />
      <div className="grain" aria-hidden />
    </>
  )
}
