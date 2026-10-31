/** Cheesy lines for Puja. Add your own, the more the cheesier. */
export const PICKUP_LINES = [
  'Puja, are you a potato? Because you’re a-peeling to me every single day.',
  'P for Puja. P for Potato. P for Perfect. Coincidence? I think not.',
  'My love for you is like a potato chip: I can’t stop at just one.',
  'You must be made of potatoes, because you’re the root of all my happiness.',
  'You’re the fries to my ketchup. Without you I’m just a sad red sauce.',
  'I’d never mash your feelings. Only potatoes.',
  'Do you believe in love at first fry, or should I walk past again?',
  'Puja, you’re the only one I’d share my last fry with. Think about how big that is.',
  'Life without you is like a potato without salt. Technically fine. Emotionally, no.',
  'Are you a baked potato? Because you’re hot and I’m loaded with love for you.',
  'I yam what I yam: hopelessly, embarrassingly in love with you.',
  'If kisses were potatoes, I’d give you a whole farm.',
  'You’re my favourite carb, my favourite human and my favourite notification.',
  'Puja, I’m not saying you’re perfect, I’m saying P for Perfect and P for Puja. Do the maths.',
]

export const pickLine = (avoid?: string) => {
  let l = avoid
  while (l === avoid) l = PICKUP_LINES[Math.floor(Math.random() * PICKUP_LINES.length)]
  return l!
}

/** Little words that float up in the game when the combo gets big. */
export const CHEERS = ['Puja!!', 'Cutie!', 'Ufff 😍', 'So good!', 'Marry me?', 'Potato pro', 'My girl!', 'Wowww']
