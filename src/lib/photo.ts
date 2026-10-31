import { useEffect, useState } from 'react'

/** Drop Puja's photo at public/puja.jpg (a face-centred, roughly square crop works best). */
export const PHOTO_URL = '/puja.jpg'

let img: HTMLImageElement | null = null
let ready: Promise<HTMLImageElement | null> | null = null

/** Loads the photo once. Resolves to null if the file isn't there, so everything falls back to a normal potato face. */
export function loadPhoto() {
  if (!ready) {
    ready = new Promise((resolve) => {
      const i = new Image()
      i.onload = () => { img = i; resolve(i) }
      i.onerror = () => resolve(null)
      i.src = PHOTO_URL
    })
  }
  return ready
}

export const photoNow = () => img

export function usePhoto() {
  const [url, setUrl] = useState<string | null>(img ? PHOTO_URL : null)
  useEffect(() => {
    let on = true
    loadPhoto().then((i) => on && setUrl(i ? PHOTO_URL : null))
    return () => { on = false }
  }, [])
  return url
}
