import peachSrc    from '../assets/mascot.png'
import daisySrc    from '../assets/daisy.png'
import rosalinaSrc from '../assets/rosalina.png'
import toadSrc     from '../assets/toad.png'

export const CHARACTERS = [
  { id: 'peach',    name: 'Princess Peach',  src: peachSrc,    bg: 'bg-peach/60',      border: 'border-peach-dark',     icon: '👑' },
  { id: 'daisy',    name: 'Princess Daisy',  src: daisySrc,    bg: 'bg-daisy/60',      border: 'border-daisy-dark',     icon: '🌼' },
  { id: 'rosalina', name: 'Rosalina',         src: rosalinaSrc, bg: 'bg-rosalina/60',   border: 'border-rosalina-dark',  icon: '✨' },
  { id: 'toad',     name: 'Toad',             src: toadSrc,     bg: 'bg-mario-red/60',  border: 'border-mario-red-dark', icon: '🍄' },
]
