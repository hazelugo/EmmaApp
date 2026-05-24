import peachSrc    from '../assets/mascot.png'
import daisySrc    from '../assets/daisy.png'
import rosalinaSrc from '../assets/rosalina.png'
import toadSrc     from '../assets/toad.png'

export const CHARACTERS = [
  {
    id: 'peach',
    name: 'Princess Peach',
    tagline: 'Royal Math Master',
    src: peachSrc,
    bg: 'bg-peach/60',
    border: 'border-peach-dark',
    icon: '👑',
    cardBg: 'linear-gradient(150deg, #f9a8d4 0%, #fde68a 100%)',
    decorations: [
      { emoji: '👑', style: 'top:6px;left:8px;font-size:20px;opacity:.9;' },
      { emoji: '🌸', style: 'top:8px;right:8px;font-size:16px;opacity:.75;' },
      { emoji: '💖', style: 'top:34px;left:16px;font-size:11px;opacity:.55;' },
    ],
  },
  {
    id: 'daisy',
    name: 'Princess Daisy',
    tagline: 'All-Star Champion',
    src: daisySrc,
    bg: 'bg-daisy/60',
    border: 'border-daisy-dark',
    icon: '🌼',
    cardBg: 'linear-gradient(150deg, #fb923c 0%, #fde047 100%)',
    decorations: [
      { emoji: '🌼', style: 'top:6px;left:8px;font-size:20px;opacity:.95;' },
      { emoji: '⚽', style: 'top:8px;right:8px;font-size:14px;opacity:.75;' },
      { emoji: '🌻', style: 'top:36px;right:10px;font-size:11px;opacity:.6;' },
    ],
  },
  {
    id: 'rosalina',
    name: 'Rosalina',
    tagline: 'Cosmic Star Guardian',
    src: rosalinaSrc,
    bg: 'bg-rosalina/60',
    border: 'border-rosalina-dark',
    icon: '✨',
    cardBg: 'linear-gradient(150deg, #1e1b4b 0%, #6d28d9 100%)',
    decorations: [
      { emoji: '⭐', style: 'top:6px;left:8px;font-size:18px;opacity:.95;' },
      { emoji: '🌙', style: 'top:8px;right:8px;font-size:15px;opacity:.85;' },
      { emoji: '✨', style: 'top:34px;left:18px;font-size:11px;opacity:.65;' },
    ],
  },
  {
    id: 'toad',
    name: 'Toad',
    tagline: 'Speedy Number Whiz',
    src: toadSrc,
    bg: 'bg-mario-red/60',
    border: 'border-mario-red-dark',
    icon: '🍄',
    cardBg: 'linear-gradient(150deg, #dc2626 0%, #f97316 100%)',
    decorations: [
      { emoji: '🍄', style: 'top:6px;left:8px;font-size:20px;opacity:.95;' },
      { emoji: '⭐', style: 'top:8px;right:8px;font-size:15px;opacity:.85;' },
      { emoji: '💨', style: 'top:36px;right:10px;font-size:12px;opacity:.65;' },
    ],
  },
]
