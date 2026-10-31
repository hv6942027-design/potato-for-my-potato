export const load = (k: string, fallback: number) => {
  try {
    const v = localStorage.getItem(k)
    return v ? Number(v) : fallback
  } catch {
    return fallback
  }
}
export const save = (k: string, v: number) => {
  try {
    localStorage.setItem(k, String(v))
  } catch {
    /* private mode */
  }
}
