/**
 * useLevelTheme.js
 *
 * Maps each level (1–7) to its themed assets:
 *  - enemyImage   — "X vs. Enemy" splash shown BEFORE the level
 *  - victoryImage — "X wins!" splash shown AFTER the level is beaten
 *  - background gradient
 *  - enemy display name + flavor text
 *  - a synthesized music theme id
 */

/* ── PEACH Pre-level images ────────────────────────── */
import peachGoomba  from '../assets/initial enemies (peach)/1 peach v goomba.png'
import peachShy     from '../assets/initial enemies (peach)/2 peach v shy.png'
import peachBomb    from '../assets/initial enemies (peach)/3 peach v bomb.png'
import peachHammer  from '../assets/initial enemies (peach)/4 peach v hammer.png'
import peachChomp   from '../assets/initial enemies (peach)/5 peach v chomp.png'
import peachBjr     from '../assets/initial enemies (peach)/6 peach v bjr.png'
import peachBowser  from '../assets/initial enemies (peach)/7 peach v bowser.png'

/* ── PEACH Post-level (wins!) images ──────────────────────────── */
import winPeachGoomba  from '../assets/post enemies (peach)/1 peach win goomba.png'
import winPeachShy     from '../assets/post enemies (peach)/2 peach win shy.png'
import winPeachBomb    from '../assets/post enemies (peach)/3 peach win bomb.png'
import winPeachHammer  from '../assets/post enemies (peach)/4 peach win hammer.png'
import winPeachChomp   from '../assets/post enemies (peach)/5 peach win chomp.png'
import winPeachBjr     from '../assets/post enemies (peach)/6 peach win bjr.png'
import winPeachBowser  from '../assets/post enemies (peach)/7 peach win bowser.png'

/* ── DAISY Pre-level images ────────────────────────── */
import daisyTatanga   from '../assets/initial enemies (daisy)/1 daisy v tatanga.png'
import daisyPionpi    from '../assets/initial enemies (daisy)/2 daisy v pionpi.png'
import daisyMekabon   from '../assets/initial enemies (daisy)/3 daisy v mekabon.png'
import daisyWigglers  from '../assets/initial enemies (daisy)/4 daisy v wigglers.png'
import daisyBb        from '../assets/initial enemies (daisy)/5 daisy v bb.png'
import daisyBiokinton from '../assets/initial enemies (daisy)/6 daisy v biokinton.png'
import daisySphinx    from '../assets/initial enemies (daisy)/7 daisy v sphinx.png'

/* ── DAISY Post-level (wins!) images ──────────────────────────── */
import winDaisyTatanga   from '../assets/post enemies (daisy)/1 daisy wins tatanga.png'
import winDaisyPionpi    from '../assets/post enemies (daisy)/2 daisy wins pionpi.png'
import winDaisyMekabon   from '../assets/post enemies (daisy)/3 daisy wins mekabon.png'
import winDaisyWigglers  from '../assets/post enemies (daisy)/4 daisy wins wigglers.png'
import winDaisyBb        from '../assets/post enemies (daisy)/5 daisy wins bb.png'
import winDaisyBiokinton from '../assets/post enemies (daisy)/6 daisy win biokinton.png'
import winDaisySphinx    from '../assets/post enemies (daisy)/7 daisy wins sphinx.png'

const PEACH_THEMES = {
  1: {
    enemyName:    'Goomba',
    enemyImage:   peachGoomba,
    victoryImage: winPeachGoomba,
    bg: { top: '#6dd5fa', mid: '#87ceeb', bottom: '#7ADB7E' },
    victoryBg: { top: '#FFD700', mid: '#FFF176', bottom: '#7ADB7E' },
    musicId:    'overworld',
    flavorText: 'A Goomba blocks the path!',
    victoryText: 'Goomba defeated! 👑',
  },
  2: {
    enemyName:    'Shy Guy',
    enemyImage:   peachShy,
    victoryImage: winPeachShy,
    bg: { top: '#a18cd1', mid: '#fbc2eb', bottom: '#c3a3e8' },
    victoryBg: { top: '#FFD700', mid: '#f8a5c2', bottom: '#c3a3e8' },
    musicId:    'underground',
    flavorText: 'A Shy Guy lurks in the shadows!',
    victoryText: 'Shy Guy unmasked! 🎉',
  },
  3: {
    enemyName:    'Bob-omb',
    enemyImage:   peachBomb,
    victoryImage: winPeachBomb,
    bg: { top: '#f7971e', mid: '#ffd200', bottom: '#e8a838' },
    victoryBg: { top: '#FFD700', mid: '#ffd200', bottom: '#f7971e' },
    musicId:    'desert',
    flavorText: 'Watch out — Bob-omb is ready to blow!',
    victoryText: 'Boom! Bob-omb defused! 💥',
  },
  4: {
    enemyName:    'Hammer Bro',
    enemyImage:   peachHammer,
    victoryImage: winPeachHammer,
    bg: { top: '#11998e', mid: '#38ef7d', bottom: '#1b7a56' },
    victoryBg: { top: '#FFD700', mid: '#38ef7d', bottom: '#11998e' },
    musicId:    'forest',
    flavorText: 'Hammer Bro means business!',
    victoryText: 'Hammer Bro crushed! 🔨',
  },
  5: {
    enemyName:    'Chain Chomp',
    enemyImage:   peachChomp,
    victoryImage: winPeachChomp,
    bg: { top: '#0f0c29', mid: '#302b63', bottom: '#24243e' },
    victoryBg: { top: '#FFD700', mid: '#302b63', bottom: '#24243e' },
    musicId:    'spooky',
    flavorText: 'Chain Chomp is UNLEASHED!',
    victoryText: 'Chain Chomp chained up! ⛓️',
  },
  6: {
    enemyName:    'Baby Bowser Jr.',
    enemyImage:   peachBjr,
    victoryImage: winPeachBjr,
    bg: { top: '#b91c1c', mid: '#ef4444', bottom: '#7f1d1d' },
    victoryBg: { top: '#FFD700', mid: '#ef4444', bottom: '#7f1d1d' },
    musicId:    'castle',
    flavorText: 'Bowser Jr. steps up to fight!',
    victoryText: 'Bowser Jr. sent packing! 🐢',
  },
  7: {
    enemyName:    'Bowser',
    enemyImage:   peachBowser,
    victoryImage: winPeachBowser,
    bg: { top: '#1a0000', mid: '#7b0000', bottom: '#3d0000' },
    victoryBg: { top: '#FFD700', mid: '#FF8C00', bottom: '#E52521' },
    musicId:    'final',
    flavorText: 'BOWSER himself stands in your way!',
    victoryText: 'BOWSER DEFEATED! 🏆 You saved the kingdom!',
  },
}

const DAISY_THEMES = {
  1: {
    enemyName:    'Tatanga',
    enemyImage:   daisyTatanga,
    victoryImage: winDaisyTatanga,
    bg: { top: '#6dd5fa', mid: '#87ceeb', bottom: '#7ADB7E' },
    victoryBg: { top: '#FFD700', mid: '#FFF176', bottom: '#7ADB7E' },
    musicId:    'overworld',
    flavorText: 'Tatanga approaches!',
    victoryText: 'Tatanga defeated! ✨',
  },
  2: {
    enemyName:    'Pionpi',
    enemyImage:   daisyPionpi,
    victoryImage: winDaisyPionpi,
    bg: { top: '#a18cd1', mid: '#fbc2eb', bottom: '#c3a3e8' },
    victoryBg: { top: '#FFD700', mid: '#f8a5c2', bottom: '#c3a3e8' },
    musicId:    'underground',
    flavorText: 'Pionpi bounces in!',
    victoryText: 'Pionpi put to rest! 🌟',
  },
  3: {
    enemyName:    'Mekabon',
    enemyImage:   daisyMekabon,
    victoryImage: winDaisyMekabon,
    bg: { top: '#f7971e', mid: '#ffd200', bottom: '#e8a838' },
    victoryBg: { top: '#FFD700', mid: '#ffd200', bottom: '#f7971e' },
    musicId:    'desert',
    flavorText: 'Mekabon is charging up!',
    victoryText: 'Mekabon dismantled! ⚙️',
  },
  4: {
    enemyName:    'Wigglers',
    enemyImage:   daisyWigglers,
    victoryImage: winDaisyWigglers,
    bg: { top: '#11998e', mid: '#38ef7d', bottom: '#1b7a56' },
    victoryBg: { top: '#FFD700', mid: '#38ef7d', bottom: '#11998e' },
    musicId:    'forest',
    flavorText: 'Angry Wigglers ahead!',
    victoryText: 'Wigglers calmed down! 🐛',
  },
  5: {
    enemyName:    'BB',
    enemyImage:   daisyBb,
    victoryImage: winDaisyBb,
    bg: { top: '#0f0c29', mid: '#302b63', bottom: '#24243e' },
    victoryBg: { top: '#FFD700', mid: '#302b63', bottom: '#24243e' },
    musicId:    'spooky',
    flavorText: 'A wild BB appears!',
    victoryText: 'BB beaten back! 💫',
  },
  6: {
    enemyName:    'Biokinton',
    enemyImage:   daisyBiokinton,
    victoryImage: winDaisyBiokinton,
    bg: { top: '#b91c1c', mid: '#ef4444', bottom: '#7f1d1d' },
    victoryBg: { top: '#FFD700', mid: '#ef4444', bottom: '#7f1d1d' },
    musicId:    'castle',
    flavorText: 'Biokinton floats into view!',
    victoryText: 'Biokinton banished! ☁️',
  },
  7: {
    enemyName:    'Sphinx',
    enemyImage:   daisySphinx,
    victoryImage: winDaisySphinx,
    bg: { top: '#1a0000', mid: '#7b0000', bottom: '#3d0000' },
    victoryBg: { top: '#FFD700', mid: '#FF8C00', bottom: '#E52521' },
    musicId:    'final',
    flavorText: 'The mighty Sphinx challenges you!',
    victoryText: 'SPHINX DEFEATED! 🏆 The cosmos is safe!',
  },
}

export const CHARACTER_THEMES = {
  peach: PEACH_THEMES,
  daisy: DAISY_THEMES,
}

/**
 * Returns the theme config for the given level and character.
 * Falls back to peach and level 1.
 */
export function getLevelTheme (level, characterId = 'peach') {
  const charTheme = CHARACTER_THEMES[characterId] || CHARACTER_THEMES['peach'];
  return charTheme[level] ?? charTheme[1];
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
