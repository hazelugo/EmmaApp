import { ref } from 'vue'

/**
 * Web Audio API-based sound effects composable.
 * No external audio files needed — all sounds are synthesized.
 */

const isMuted = ref(false)
let audioCtx = null

function getContext () {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/**
 * Play a simple tone with an envelope.
 * @param {number} freq      – Frequency in Hz
 * @param {string} type      – OscillatorNode type: 'sine' | 'square' | 'triangle' | 'sawtooth'
 * @param {number} duration  – Duration in seconds
 * @param {number} volume    – Gain 0–1
 */
function playTone (freq, type = 'sine', duration = 0.15, volume = 0.3) {
  if (isMuted.value) return
  const ctx = getContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)

  // Envelope: quick attack, sustain, smooth release
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02)
  gain.gain.setValueAtTime(volume, ctx.currentTime + duration * 0.6)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

/* ── Named Sound Effects ─────────────────────────────────────── */

/** Happy ascending arpeggio — correct answer */
function playCorrect () {
  if (isMuted.value) return
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 'triangle', 0.18, 0.25), i * 80)
  })
}

/** Low buzz — wrong answer */
function playWrong () {
  if (isMuted.value) return
  playTone(180, 'sawtooth', 0.3, 0.2)
  setTimeout(() => playTone(140, 'sawtooth', 0.25, 0.15), 100)
}

/** Soft click — button tap */
function playTap () {
  if (isMuted.value) return
  playTone(800, 'sine', 0.06, 0.12)
}

/** Triumphant fanfare — streak milestone */
function playStreak () {
  if (isMuted.value) return
  const notes = [392, 523.25, 659.25, 783.99, 1046.5] // G4→C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 'square', 0.22, 0.18), i * 100)
  })
}

/** Toggle mute state */
function toggleMute () {
  isMuted.value = !isMuted.value
}

export function useSound () {
  return {
    isMuted,
    toggleMute,
    playCorrect,
    playWrong,
    playTap,
    playStreak,
  }
}
