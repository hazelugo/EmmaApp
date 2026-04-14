import { ref } from 'vue'

/**
 * Web Audio API-based sound effects composable.
 * Nintendo / Mario-inspired synthesized sounds.
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
function playTone (freq, type = 'square', duration = 0.15, volume = 0.2) {
  if (isMuted.value) return
  const ctx = getContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)

  // Envelope: quick attack, sustain, smooth release
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
  gain.gain.setValueAtTime(volume, ctx.currentTime + duration * 0.6)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
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

/** Block bump / button tap */
function playTap () {
  if (isMuted.value) return
  // Quick blocky click (like hitting a ? block lightly)
  playTone(600, 'square', 0.04, 0.1)
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
    playLevelUp,
  }
}
