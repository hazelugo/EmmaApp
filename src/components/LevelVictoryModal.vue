<script setup>
/**
 * LevelVictoryModal.vue
 *
 * Full-screen post-level victory screen shown when a level/world is beaten.
 * Displays the "Peach wins!" artwork for that level plus a celebration animation.
 *
 * Props:
 *   show    {Boolean} — controls visibility
 *   level   {Number}  — the level that was just beaten (1–7)
 *   theme   {Object}  — from getLevelTheme(level)
 *
 * Emits:
 *   next    — player tapped "NEXT WORLD →", ready for the next intro splash
 */

import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps({
  show:  { type: Boolean, default: false },
  level: { type: Number,  default: 1     },
  theme: { type: Object,  default: () => ({}) },
})

const emit = defineEmits(['next'])

/* ── Animation state ───────────────────────────────────────────── */
const showArt    = ref(false)
const showText   = ref(false)
const showBtn    = ref(false)
let timers = []

function clearTimers () {
  timers.forEach(clearTimeout)
  timers = []
}

function startScene () {
  showArt.value  = false
  showText.value = false
  showBtn.value  = false
  clearTimers()

  // Staggered entrance
  timers.push(setTimeout(() => { showArt.value  = true }, 200))
  timers.push(setTimeout(() => { showText.value = true }, 650))
  timers.push(setTimeout(() => { showBtn.value  = true }, 1200))

  // Victory confetti burst
  timers.push(setTimeout(() => fireVictoryConfetti(), 300))
}

function fireVictoryConfetti () {
  const marioColors = ['var(--color-star-gold)', 'var(--color-mario-red)', 'var(--color-luigi)', 'var(--color-peach)', 'var(--color-rosalina)', 'var(--color-coin)']
  const bursts = [
    { delay: 0,    x: 0.2,  y: 0.3 },
    { delay: 300,  x: 0.8,  y: 0.25 },
    { delay: 600,  x: 0.5,  y: 0.15 },
    { delay: 900,  x: 0.35, y: 0.4 },
    { delay: 1200, x: 0.65, y: 0.35 },
  ]
  bursts.forEach(b => {
    timers.push(setTimeout(() => {
      confetti({
        particleCount: 90,
        startVelocity: 28,
        spread: 360,
        ticks: 55,
        gravity: 0.75,
        origin: { x: b.x, y: b.y },
        colors: marioColors,
        shapes: ['star', 'circle'],
      })
    }, b.delay))
  })
}

watch(() => props.show, (val) => {
  if (val) startScene()
  else clearTimers()
})

onMounted(() => {
  if (props.show) startScene()
})

onUnmounted(clearTimers)

/* ── Dynamic background ────────────────────────────────────────── */
const bgStyle = computed(() => {
  const bg = props.theme?.victoryBg ?? { top: 'var(--color-star-gold)', mid: 'var(--color-star-glow)', bottom: 'var(--color-luigi-light)' }
  return {
    background: `linear-gradient(180deg, ${bg.top} 0%, ${bg.mid} 50%, ${bg.bottom} 100%)`,
  }
})

/* ── Is this the final level (Bowser)? ─────────────────────────── */
const isFinalLevel = computed(() => props.level === 7)

/* ── Background stars ──────────────────────────────────────────── */
const stars = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left:  (Math.random() * 90 + 5).toFixed(1) + '%',
  top:   (Math.random() * 70 + 5).toFixed(1) + '%',
  size:  (8 + Math.random() * 16).toFixed(1) + 'px',
  delay: (Math.random() * 2.5).toFixed(2) + 's',
}))
</script>

<template>
  <Transition name="victory-fade">
    <div
      v-if="show"
      class="victory-overlay"
      style="background: #000;"
    >
      <!-- Background Image (FullScreen) -->
      <img
        v-if="theme?.victoryImage"
        :src="theme?.victoryImage"
        :alt="`Level ${level} Clear`"
        class="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000"
        :class="{ 'opacity-100': showArt, 'opacity-0': !showArt }"
      />

      <!-- Content overly at bottom -->
      <div class="relative z-10 flex flex-col items-center justify-end h-full w-full pb-20 md:pb-32">
        <!-- Next World / Play Again button -->
        <button
          v-if="showBtn"
          class="next-btn"
          id="victory-next-btn"
          @click="emit('next')"
        >
          {{ isFinalLevel ? 'PLAY AGAIN! 🎮' : 'NEXT WORLD →' }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Transition ───────────────────────────────────────────────── */
.victory-fade-enter-active { transition: opacity 0.45s ease; }
.victory-fade-leave-active { transition: opacity 0.3s ease; }
.victory-fade-enter-from,
.victory-fade-leave-to    { opacity: 0; }

/* ── Layout ───────────────────────────────────────────────────── */
.victory-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  overflow: hidden;
  padding: 24px;
}

/* ── Twinkling stars ──────────────────────────────────────────── */
.victory-star {
  position: absolute;
  color: var(--color-mario-red);
  pointer-events: none;
  animation: vtwinkle 1.8s ease-in-out infinite alternate;
  text-shadow: 0 0 8px rgba(var(--color-mario-red-rgb), 0.6);
}
/* Alternate some to gold */
.victory-star:nth-child(odd) {
  color: var(--color-star-gold);
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.7);
}
@keyframes vtwinkle {
  0%   { opacity: 0.8; transform: scale(0.7) rotate(0deg); }
  100% { opacity: 1;   transform: scale(1.3) rotate(20deg); }
}

/* ── Victory badge ────────────────────────────────────────────── */
.victory-badge {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(180deg, var(--color-mario-red) 0%, #B71C1C 100%);
  border: 4px solid var(--color-block-outline);
  border-radius: 40px;
  padding: 8px 28px;
  font-size: 1.05rem;
  font-weight: 900;
  color: var(--color-star-gold);
  letter-spacing: 2px;
  white-space: nowrap;
  box-shadow:
    inset 2px 2px 0 rgba(255,255,255,0.2),
    4px 4px 0 rgba(0,0,0,0.35);
  animation: badge-drop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  z-index: 10;
}
@keyframes badge-drop {
  0%   { opacity: 0; transform: translateX(-50%) translateY(-50px); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ── Victory artwork ──────────────────────────────────────────── */
.art-wrap {
  opacity: 0;
  transform: scale(0.75) translateY(20px);
  transition: opacity 0.5s ease, transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-top: 20px;
  filter: drop-shadow(0 8px 32px rgba(0,0,0,0.35));
}
.art-in {
  opacity: 1;
  transform: scale(1) translateY(0);
}
.victory-img {
  max-width: min(380px, 90vw);
  max-height: 38vh;
  object-fit: contain;
  border-radius: 16px;
  animation: victory-bob 2.5s ease-in-out infinite;
}
@keyframes victory-bob {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50%       { transform: translateY(-10px) rotate(1deg); }
}

/* ── Text block ───────────────────────────────────────────────── */
.text-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.text-in {
  opacity: 1;
  transform: scale(1);
}

.victory-title {
  font-size: clamp(2rem, 8vw, 3rem);
  font-weight: 900;
  color: var(--color-mario-red);
  text-shadow:
    3px 3px 0 var(--color-star-gold),
    6px 6px 0 rgba(0,0,0,0.3);
  letter-spacing: 2px;
  margin: 0;
  animation: title-shimmer 1.8s ease-in-out infinite alternate;
}
@keyframes title-shimmer {
  0%   { text-shadow: 3px 3px 0 var(--color-star-gold), 6px 6px 0 rgba(0,0,0,0.3); }
  100% { text-shadow: 3px 3px 0 var(--color-star-gold), 6px 6px 0 rgba(0,0,0,0.3), 0 0 30px rgba(229,37,33,0.5); }
}

.victory-sub {
  font-size: clamp(0.85rem, 3vw, 1.05rem);
  color: var(--color-dark);
  font-weight: 700;
  text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
  max-width: 340px;
  line-height: 1.5;
  margin: 0;
}

/* ── Next World button ────────────────────────────────────────── */
.next-btn {
  opacity: 0.8;
  margin-top: 8px;
  padding: 15px 44px;
  font-family: inherit;
  font-size: clamp(1.1rem, 4vw, 1.4rem);
  font-weight: 900;
  color: var(--color-star-gold);
  background: linear-gradient(180deg, var(--color-mario-red) 0%, #B71C1C 100%);
  border: 4px solid var(--color-block-outline);
  border-radius: 18px;
  cursor: pointer;
  letter-spacing: 1px;
  box-shadow:
    inset 2px 2px 0 rgba(255,255,255,0.25),
    inset -2px -2px 0 rgba(0,0,0,0.2),
    4px 4px 0 rgba(0,0,0,0.4),
    0 0 20px rgba(229,37,33,0.3);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  animation: btn-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 10;
}
@keyframes btn-appear {
  0%   { transform: scale(0.4) translateY(30px); opacity: 0; }
  100% { transform: scale(1)   translateY(0);    opacity: 0.8; }
}
.next-btn:hover {
  transform: scale(1.07) translateY(-2px);
  box-shadow:
    inset 2px 2px 0 rgba(255,255,255,0.25),
    inset -2px -2px 0 rgba(0,0,0,0.2),
    6px 6px 0 rgba(0,0,0,0.4),
    0 0 30px rgba(229,37,33,0.6);
}
.next-btn:active {
  transform: scale(0.95) translateY(2px);
  box-shadow: inset 2px 2px 8px rgba(0,0,0,0.4);
}
</style>
