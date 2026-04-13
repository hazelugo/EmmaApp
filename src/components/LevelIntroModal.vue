<script setup>
/**
 * LevelIntroModal.vue
 *
 * Full-screen pre-level splash that animates in before each level starts.
 * Shows:
 *  - Themed background for this level
 *  - Enemy artwork (Peach vs. Enemy image)
 *  - Level number + enemy name
 *  - Flavor text / battle cry
 *  - "LET'S GO!" button to start the level
 *
 * Props:
 *   show    {Boolean} — controls visibility
 *   level   {Number}  — current level (1–7)
 *   theme   {Object}  — from getLevelTheme(level)
 *   isMuted {Boolean} — mute flag for music
 *
 * Emits:
 *   start   — fired when the player taps "LET'S GO!"
 */

import { ref, watch, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  show:    { type: Boolean, default: false },
  level:   { type: Number,  default: 1     },
  theme:   { type: Object,  default: () => ({}) },
  isMuted: { type: Boolean, default: false  },
})

const emit = defineEmits(['start'])

/* ── Animation state ───────────────────────────────────────────── */
const ready     = ref(false)
const showEnemy = ref(false)
const showText  = ref(false)
const showBtn   = ref(false)
let timers = []

function clearTimers () {
  timers.forEach(clearTimeout)
  timers = []
}

function startAnimation () {
  ready.value     = false
  showEnemy.value = false
  showText.value  = false
  showBtn.value   = false
  clearTimers()

  timers.push(setTimeout(() => { ready.value     = true  }, 80))
  timers.push(setTimeout(() => { showEnemy.value = true  }, 300))
  timers.push(setTimeout(() => { showText.value  = true  }, 700))
  timers.push(setTimeout(() => { showBtn.value   = true  }, 1300))
}

function onStart () {
  emit('start')
}

watch(() => props.show, (val) => {
  if (val) startAnimation()
  else {
    clearTimers()
  }
})

onMounted(() => {
  if (props.show) startAnimation()
})

onUnmounted(() => {
  clearTimers()
})

/* ── Dynamic background gradient ──────────────────────────────── */
const bgStyle = computed(() => {
  const bg = props.theme?.bg ?? { top: '#1a1a4e', mid: '#2a2a7a', bottom: '#3a2a6a' }
  return {
    background: `linear-gradient(180deg, ${bg.top} 0%, ${bg.mid} 50%, ${bg.bottom} 100%)`,
  }
})

/* ── Stars in the background ──────────────────────────────────── */
const stars = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left:  (Math.random() * 90 + 5).toFixed(1) + '%',
  top:   (Math.random() * 70 + 5).toFixed(1) + '%',
  size:  (8 + Math.random() * 14).toFixed(1) + 'px',
  delay: (Math.random() * 3).toFixed(2) + 's',
}))
</script>

<template>
  <Transition name="intro-fade">
    <div
      v-if="show"
      class="intro-overlay"
      style="background: #000;"
    >
      <!-- Background Image (FullScreen) -->
      <img
        v-if="theme?.enemyImage"
        :src="theme?.enemyImage"
        :alt="theme?.enemyName"
        class="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000"
        :class="{ 'opacity-100': showEnemy, 'opacity-0': !showEnemy }"
      />

      <!-- Content overly at bottom -->
      <div class="relative z-10 flex flex-col items-center justify-end h-full w-full pb-20 md:pb-32">
        <!-- LET'S GO button -->
        <button
          v-if="showBtn"
          class="lets-go-btn"
          @click="onStart"
          id="level-intro-start-btn"
        >
          LET'S GO! 🌟
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Transition ─────────────────────────────────────────────── */
.intro-fade-enter-active { transition: opacity 0.45s ease; }
.intro-fade-leave-active { transition: opacity 0.3s ease; }
.intro-fade-enter-from,
.intro-fade-leave-to    { opacity: 0; }

/* ── Layout ─────────────────────────────────────────────────── */
.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  overflow: hidden;
  padding: 24px;
}

/* ── Background stars ───────────────────────────────────────── */
.intro-star {
  position: absolute;
  color: #FFD700;
  pointer-events: none;
  animation: twinkle 2s ease-in-out infinite alternate;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.7);
}
@keyframes twinkle {
  0%   { opacity: 0.2; transform: scale(0.7); }
  100% { opacity: 1;   transform: scale(1.3); }
}

/* ── Level badge ────────────────────────────────────────────── */
.level-badge {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(-60px);
  opacity: 0;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;

  background: linear-gradient(180deg, #FFD700 0%, #FF8C00 100%);
  border: 4px solid #8B5E0A;
  border-radius: 40px;
  padding: 8px 28px;
  font-size: 1.1rem;
  font-weight: 900;
  color: #2C2C2C;
  letter-spacing: 3px;
  box-shadow:
    inset 2px 2px 0 rgba(255,255,255,0.4),
    4px 4px 0 rgba(0,0,0,0.35);
  white-space: nowrap;
  z-index: 10;
}
.badge-in {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

/* ── Enemy artwork ──────────────────────────────────────────── */
.enemy-art-wrap {
  opacity: 0;
  transform: scale(0.7) translateY(30px);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-top: 20px;
  filter: drop-shadow(0 8px 32px rgba(0,0,0,0.5));
}
.enemy-in {
  opacity: 1;
  transform: scale(1) translateY(0);
}
.enemy-img {
  max-width: min(380px, 90vw);
  max-height: 38vh;
  object-fit: contain;
  border-radius: 16px;
  animation: enemy-float 3s ease-in-out infinite;
}
@keyframes enemy-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50%       { transform: translateY(-10px) scale(1.02); }
}

/* ── Text block ─────────────────────────────────────────────── */
.text-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease 0.1s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s;
}
.text-in {
  opacity: 1;
  transform: translateY(0);
}

.vs-text {
  font-size: 1.2rem;
  color: #FF6B6B;
  font-weight: 900;
  letter-spacing: 4px;
  text-shadow: 0 0 12px rgba(255, 107, 107, 0.8);
  animation: vs-pulse 1.2s ease-in-out infinite alternate;
}
@keyframes vs-pulse {
  0%   { transform: scale(1); }
  100% { transform: scale(1.08); text-shadow: 0 0 24px rgba(255, 107, 107, 1); }
}

.enemy-name {
  font-size: clamp(2rem, 8vw, 3rem);
  font-weight: 900;
  color: #FFD700;
  text-shadow:
    3px 3px 0 #E52521,
    6px 6px 0 rgba(0,0,0,0.4);
  letter-spacing: 2px;
  margin: 0;
  animation: name-pulse 2s ease-in-out infinite alternate;
}
@keyframes name-pulse {
  0%   { text-shadow: 3px 3px 0 #E52521, 6px 6px 0 rgba(0,0,0,0.4); }
  100% { text-shadow: 3px 3px 0 #E52521, 6px 6px 0 rgba(0,0,0,0.4), 0 0 30px rgba(255,215,0,0.5); }
}

.flavor-text {
  font-size: clamp(0.85rem, 3vw, 1.05rem);
  color: rgba(255, 248, 240, 0.9);
  font-weight: 700;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.6);
  max-width: 340px;
  line-height: 1.5;
  margin: 0;
}

/* ── LET'S GO button ────────────────────────────────────────── */
.lets-go-btn {
  margin-top: 8px;
  padding: 15px 44px;
  font-family: inherit;
  font-size: clamp(1.1rem, 4vw, 1.4rem);
  font-weight: 900;
  color: #1B2B1B;
  background: linear-gradient(180deg, #7ADB7E 0%, #388E3C 100%);
  border: 4px solid #1B5E20;
  border-radius: 18px;
  cursor: pointer;
  letter-spacing: 1px;
  box-shadow:
    inset 2px 2px 0 rgba(255,255,255,0.35),
    inset -2px -2px 0 rgba(0,0,0,0.2),
    4px 4px 0 rgba(0,0,0,0.4),
    0 0 20px rgba(76,175,80,0.25);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  animation: btn-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 10;
}
@keyframes btn-appear {
  0%   { transform: scale(0.4) translateY(30px); opacity: 0; }
  100% { transform: scale(1) translateY(0);       opacity: 1; }
}
.lets-go-btn:hover {
  transform: scale(1.07) translateY(-2px);
  box-shadow:
    inset 2px 2px 0 rgba(255,255,255,0.35),
    inset -2px -2px 0 rgba(0,0,0,0.2),
    6px 6px 0 rgba(0,0,0,0.4),
    0 0 30px rgba(76,175,80,0.5);
}
.lets-go-btn:active {
  transform: scale(0.95) translateY(2px);
  box-shadow: inset 2px 2px 8px rgba(0,0,0,0.4);
}
</style>
