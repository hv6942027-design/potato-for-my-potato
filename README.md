# Puja Loves Potato

A mobile-first, immersive 3D love letter for Puja, starring a potato. Built with Vite, React, React Three Fiber, GSAP and Lenis.

## Run it

```bash
npm install
npm run dev        # opens on http://localhost:5173 (also exposed on your LAN)
```

**Test on your phone:** with `npm run dev` running, open the `Network:` URL it prints (e.g. `http://192.168.1.20:5173`) on a phone connected to the same Wi-Fi.

```bash
npm run build      # production build -> dist/
npm run preview    # serve the production build
```

Deploy `dist/` to Vercel, Netlify or any static host.

## What's inside

| Section | What it does |
| --- | --- |
| Loader | Potato peels itself as the counter climbs to 100% |
| Hero | Procedural 3D potato character: tap to squish, drag to spin, eyes follow your finger, tilt your phone. **Tap it 10 times for Gold Edition.** |
| Origin | Scroll-pinned story: night→day sky, the potato sprouts underground and pops out at harvest |
| Glow-ups | Swipe the cards and the 3D object morphs: potato → fries → chips → mash → baked |
| Quiz | "Which potato are you?" with a shareable result (Web Share API) |
| Spud Catcher | 30-second canvas mini-game with high score |
| Spud dating | Tinder-style swipe deck of potato varieties; tap to flip for stats |
| Cookbook | Bento-grid recipes that expand on tap |
| Footer | Spud Squad signup with fries confetti |

Also: a floating thumb-zone dock nav, synthesized sound effects (no audio files, off by default), haptics, scroll-velocity skew, a mobile browser theme color that follows each section, and `prefers-reduced-motion` support.

## Where things live

- `src/three/`: 3D scene. The potato is generated in code (`geometry.ts`), so there are no model files to load.
- `src/sections/`: one file per page section
- `src/lib/scroll.ts`: the single scroll loop that drives the 3D scene changes
- `src/styles.css`: design tokens at the top (`--cream`, `--ink`, `--fry`, …)

The signup form is front-end only. Connect it to your email provider (Mailchimp, ConvertKit, etc.) in `src/sections/Footer.tsx`.
