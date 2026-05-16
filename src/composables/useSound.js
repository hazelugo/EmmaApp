import { ref } from 'vue'

import peachThemeMp3    from '../assets/music/peach-theme.mp3'
import daisyThemeMp3    from '../assets/music/daisy-theme.mp3'
import rosalinaThemeMp3 from '../assets/music/rosalina-theme.mp3'
import toadThemeMp3     from '../assets/music/toad-theme.mp3'
import titleThemeMp3    from '../assets/music/title-theme.mp3'

const CHARACTER_BGM = {
  peach:    peachThemeMp3,
  daisy:    daisyThemeMp3,
  rosalina: rosalinaThemeMp3,
  toad:     toadThemeMp3,
  title:    titleThemeMp3,
}

/**
 * Web Audio API-based sound effects composable.
 * Nintendo / Mario-inspired synthesized sounds.
 *
 * Phase 4: Added master GainNode for volume control, separate from mute.
 * Both isMuted and volume persist to localStorage.
 */

// ── Persistent state (module-level singletons) ─────────────────────────────
const isMuted = ref(localStorage.getItem('emma-mute') === 'true')
const volume  = ref(parseFloat(localStorage.getItem('emma-volume') ?? '0.7'))

let currentBgmAudio = null
let audioCtx = null
let masterGain = null   // master gain node — all SFX and BGM route through this

// ── Audio context ──────────────────────────────────────────────────────────
function getContext () {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()

    // Create master gain node on first call and wire to destination
    masterGain = audioCtx.createGain()
    masterGain.gain.value = isMuted.value ? 0 : volume.value
    masterGain.connect(audioCtx.destination)
  }

  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// ── Volume control ─────────────────────────────────────────────────────────

/**
 * Set master volume (0–1). Distinct from mute — volume=0 is different from
 * isMuted=true because mute also pauses BGM.
 */
function setVolume (v) {
  const clamped = Math.min(1, Math.max(0, v))
  volume.value = clamped
  localStorage.setItem('emma-volume', clamped)

  // Apply to master gain if audio context is already initialised
  if (masterGain) {
    masterGain.gain.value = isMuted.value ? 0 : clamped
  }

  // Apply to BGM audio element
  if (currentBgmAudio) {
    currentBgmAudio.volume = clamped
  }
}

/**
 * Play a simple tone with an envelope.
 * @param {number} freq      – Frequency in Hz
 * @param {string} type      – OscillatorNode type: 'sine' | 'square' | 'triangle' | 'sawtooth'
 * @param {number} duration  – Duration in seconds
 * @param {number} gainAmt   – Gain 0–1 (relative; actual output scaled by master gain)
 */
function playTone (freq, type = 'square', duration = 0.15, gainAmt = 0.2) {
  if (isMuted.value) return
  const ctx = getContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)

  // Envelope: quick attack, sustain, smooth release
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(gainAmt, ctx.currentTime + 0.01)
  gain.gain.setValueAtTime(gainAmt, ctx.currentTime + duration * 0.6)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.connect(gain)
  gain.connect(masterGain)   // ← route through master gain (not directly to destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

/* ── Named Sound Effects (Mario-inspired) ────────────────────── */

/** Mario coin collect sound — correct answer */
function playCorrect () {
  if (isMuted.value) return
  // Classic coin: B5 → E6 (quick two-note chime)
  playTone(987.77, 'square', 0.08, 0.18)
  setTimeout(() => playTone(1318.5, 'square', 0.35, 0.15), 80)
}

/** Pipe / bonk — wrong answer */
function playWrong () {
  if (isMuted.value) return
  // Low thud with a quick drop, like bumping into a pipe
  playTone(180, 'square', 0.12, 0.2)
  setTimeout(() => playTone(120, 'square', 0.2, 0.15), 60)
}

/** Block bump / button tap (fallback when no digit note is needed) */
function playTap () {
  if (isMuted.value) return
  playTone(600, 'square', 0.04, 0.1)
}

// Pentatonic C-major scale — one note per digit, all harmonious together
const DIGIT_NOTES = {
  1: 261.63, 2: 293.66, 3: 329.63,
  4: 392.00, 5: 440.00, 6: 523.25,
  7: 587.33, 8: 659.25, 9: 783.99,
  0: 220.00,
}

/** Xylophone-style note for each number pad digit. */
function playDigitNote (digit) {
  if (isMuted.value) return
  const freq = DIGIT_NOTES[Number(digit)]
  if (freq == null) return
  // Triangle wave with medium decay = marimba/xylophone feel
  playTone(freq, 'triangle', 0.30, 0.22)
}

/** 1-UP / Power-Up fanfare — streak milestone */
function playStreak () {
  if (isMuted.value) return
  // 1-UP inspired ascending sequence: E5 → G5 → E6 → C6 → D6 → G6
  const notes = [659.25, 783.99, 1318.5, 1046.5, 1174.66, 1567.98]
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 'square', 0.12, 0.15), i * 75)
  })
}

/** Super Star power-up jingle — level up celebration */
function playLevelUp () {
  if (isMuted.value) return
  // Triumphant ascending: C5 → E5 → G5 → C6 (with sustain)
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 'square', 0.2, 0.18), i * 120)
  })
  // Big finish chord
  setTimeout(() => {
    playTone(1046.5, 'square', 0.4, 0.15)
    playTone(1318.5, 'square', 0.4, 0.12)
    playTone(1567.98, 'square', 0.4, 0.1)
  }, 520)
}

/** Toggle mute state — pauses/resumes BGM and silences master gain */
function toggleMute () {
  isMuted.value = !isMuted.value
  localStorage.setItem('emma-mute', isMuted.value)

  // Apply mute to master gain immediately (no click if context exists)
  if (masterGain) {
    masterGain.gain.value = isMuted.value ? 0 : volume.value
  }

  if (currentBgmAudio) {
    if (isMuted.value) {
      currentBgmAudio.pause()
    } else {
      currentBgmAudio.play().catch(e => console.error('BGM Autoplay blocked:', e))
    }
  }
}

/** Play looping background MP3 for the selected character */
function playThemeMusic (characterId) {
  if (currentBgmAudio) {
    currentBgmAudio.pause()
    currentBgmAudio = null
  }

  const bgmSrc = CHARACTER_BGM[characterId]
  if (!bgmSrc) return

  currentBgmAudio = new Audio(bgmSrc)
  currentBgmAudio.loop = true
  currentBgmAudio.volume = volume.value   // ← respect current volume

  if (!isMuted.value) {
    // Start muted briefly to avoid iOS pop, then unmute
    currentBgmAudio.muted = true
    currentBgmAudio.play().catch(e => console.error('BGM Autoplay blocked:', e))
    setTimeout(() => {
      if (currentBgmAudio) currentBgmAudio.muted = false
    }, 150)
  }
}

function stopThemeMusic () {
  if (currentBgmAudio) {
    currentBgmAudio.pause()
    currentBgmAudio = null
  }
}

function playSuccessMP3 () {
  // placeholder — swap in an MP3 path here when available
}

export function useSound () {
  return {
    isMuted,
    volume,
    toggleMute,
    setVolume,
    playCorrect,
    playWrong,
    playTap,
    playDigitNote,
    playStreak,
    playLevelUp,
    playSuccessMP3,
    playThemeMusic,
    stopThemeMusic,
  }
}
