/**
 * useLevelTheme.js
 *
 * Maps each level (1–7) to its themed assets:
 *  - enemyImage   — "Peach vs. Enemy" splash shown BEFORE the level
 *  - victoryImage — "Peach wins!" splash shown AFTER the level is beaten
 *  - background gradient
 *  - enemy display name + flavor text
 *  - a synthesized music theme id
 */

/* ── Pre-level (Peach vs. Enemy) images ────────────────────────── */
import goomba  from '../assets/initial enemies (peach)/1 peach v goomba.png'
import shy     from '../assets/initial enemies (peach)/2 peach v shy.png'
import bomb    from '../assets/initial enemies (peach)/3 peach v bomb.png'
import hammer  from '../assets/initial enemies (peach)/4 peach v hammer.png'
import chomp   from '../assets/initial enemies (peach)/5 peach v chomp.png'
import bjr     from '../assets/initial enemies (peach)/6 peach v bjr.png'
import bowser  from '../assets/initial enemies (peach)/7 peach v bowser.png'

/* ── Post-level (Peach wins!) images ──────────────────────────── */
import winGoomba  from '../assets/post enemies (peach)/1 peach win goomba.png'
import winShy     from '../assets/post enemies (peach)/2 peach win shy.png'
import winBomb    from '../assets/post enemies (peach)/3 peach win bomb.png'
import winHammer  from '../assets/post enemies (peach)/4 peach win hammer.png'
import winChomp   from '../assets/post enemies (peach)/5 peach win chomp.png'
import winBjr     from '../assets/post enemies (peach)/6 peach win bjr.png'
import winBowser  from '../assets/post enemies (peach)/7 peach win bowser.png'

export const LEVEL_THEMES = {
  1: {
    enemyName:    'Goomba',
    enemyImage:   goomba,
    victoryImage: winGoomba,
    bg: {
      top:    '#6dd5fa',
      mid:    '#87ceeb',
      bottom: '#7ADB7E',
    },
    victoryBg: {
      top:    '#FFD700',
      mid:    '#FFF176',
      bottom: '#7ADB7E',
    },
    musicId:    'overworld',
    flavorText: 'A Goomba blocks the path!',
    victoryText: 'Goomba defeated! 👑',
  },
  2: {
    enemyName:    'Shy Guy',
    enemyImage:   shy,
    victoryImage: winShy,
    bg: {
      top:    '#a18cd1',
      mid:    '#fbc2eb',
      bottom: '#c3a3e8',
    },
    victoryBg: {
      top:    '#FFD700',
      mid:    '#f8a5c2',
      bottom: '#c3a3e8',
    },
    musicId:    'underground',
    flavorText: 'A Shy Guy lurks in the shadows!',
    victoryText: 'Shy Guy unmasked! 🎉',
  },
  3: {
    enemyName:    'Bob-omb',
    enemyImage:   bomb,
    victoryImage: winBomb,
    bg: {
      top:    '#f7971e',
      mid:    '#ffd200',
      bottom: '#e8a838',
    },
    victoryBg: {
      top:    '#FFD700',
      mid:    '#ffd200',
      bottom: '#f7971e',
    },
    musicId:    'desert',
    flavorText: 'Watch out — Bob-omb is ready to blow!',
    victoryText: 'Boom! Bob-omb defused! 💥',
  },
  4: {
    enemyName:    'Hammer Bro',
    enemyImage:   hammer,
    victoryImage: winHammer,
    bg: {
      top:    '#11998e',
      mid:    '#38ef7d',
      bottom: '#1b7a56',
    },
    victoryBg: {
      top:    '#FFD700',
      mid:    '#38ef7d',
      bottom: '#11998e',
    },
    musicId:    'forest',
    flavorText: 'Hammer Bro means business!',
    victoryText: 'Hammer Bro crushed! 🔨',
  },
  5: {
    enemyName:    'Chain Chomp',
    enemyImage:   chomp,
    victoryImage: winChomp,
    bg: {
      top:    '#0f0c29',
      mid:    '#302b63',
      bottom: '#24243e',
    },
    victoryBg: {
      top:    '#FFD700',
      mid:    '#302b63',
      bottom: '#24243e',
    },
    musicId:    'spooky',
    flavorText: 'Chain Chomp is UNLEASHED!',
    victoryText: 'Chain Chomp chained up! ⛓️',
  },
  6: {
    enemyName:    'Baby Bowser Jr.',
    enemyImage:   bjr,
    victoryImage: winBjr,
    bg: {
      top:    '#b91c1c',
      mid:    '#ef4444',
      bottom: '#7f1d1d',
    },
    victoryBg: {
      top:    '#FFD700',
      mid:    '#ef4444',
      bottom: '#7f1d1d',
    },
    musicId:    'castle',
    flavorText: 'Bowser Jr. steps up to fight!',
    victoryText: 'Bowser Jr. sent packing! 🐢',
  },
  7: {
    enemyName:    'Bowser',
    enemyImage:   bowser,
    victoryImage: winBowser,
    bg: {
      top:    '#1a0000',
      mid:    '#7b0000',
      bottom: '#3d0000',
    },
    victoryBg: {
      top:    '#FFD700',
      mid:    '#FF8C00',
      bottom: '#E52521',
    },
    musicId:    'final',
    flavorText: 'BOWSER himself stands in your way!',
    victoryText: 'BOWSER DEFEATED! 🏆 You saved the kingdom!',
  },
}

/**
 * Returns the theme config for the given level.
 * Falls back to level 1 for anything out of range.
 */
export function getLevelTheme (level) {
  return LEVEL_THEMES[level] ?? LEVEL_THEMES[1]
}

/* ── Synthesized Level Music ───────────────────────────────────── */

let audioCtx = null

function getCtx () {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

/**
 * Play a short unique fanfare/jingle intro per level.
 * Each returns a stop function to silence it.
 */
const MUSIC_THEMES = {
  overworld:   () => playSequence([523, 659, 784, 1047], 'square',  0.13, 110),
  underground: () => playSequence([220, 277, 330, 415],  'sawtooth',0.12, 130),
  desert:      () => playSequence([349, 392, 440, 523],  'square',  0.12, 95),
  forest:      () => playSequence([392, 494, 587, 740],  'triangle',0.13, 105),
  spooky:      () => playSequence([196, 233, 277, 196],  'sawtooth',0.11, 150),
  castle:      () => playSequence([262, 311, 370, 440],  'square',  0.13, 90),
  final:       () => playSequence([147, 175, 220, 294],  'sawtooth',0.14, 140),
}

let _stopCurrentMusic = null

export function playLevelMusic (musicId, isMuted) {
  if (isMuted) return
  stopLevelMusic()
  const fn = MUSIC_THEMES[musicId]
  if (fn) _stopCurrentMusic = fn()
}

export function stopLevelMusic () {
  if (_stopCurrentMusic) {
    _stopCurrentMusic()
    _stopCurrentMusic = null
  }
}

/**
 * Plays a looping note sequence.
 * @returns {Function} stop function
 */
function playSequence (freqs, type, volume, bpm) {
  const ctx    = getCtx()
  const beatMs = (60 / bpm) * 1000
  let   stopped = false
  let   i       = 0
  let   timerId = null

  function playNext () {
    if (stopped) return
    const freq = freqs[i % freqs.length]
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
    gain.gain.setValueAtTime(volume, ctx.currentTime + (beatMs / 1000) * 0.6)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + beatMs / 1000)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + beatMs / 1000)
    i++
    timerId = setTimeout(playNext, beatMs)
  }

  playNext()

  return function stop () {
    stopped = true
    if (timerId) clearTimeout(timerId)
  }
}
