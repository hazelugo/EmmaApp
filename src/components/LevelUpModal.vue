<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import confetti from 'canvas-confetti'
import mascotUrl from '../assets/mascot.png'
import marioCoinSrc from '../assets/mario-coin.png'
import castleSrc from '../assets/castle.png'
import starSrc from '../assets/star.png'

const props = defineProps({
  show: { type: Boolean, default: false },
  stars: { type: Number, default: 0 }
})

const emit = defineEmits(['close'])

const sceneReady = ref(false)
const showText = ref(false)
const showFireworks = ref(false)
const showButton = ref(false)
const flagDown = ref(false)
let timers = []

function clearTimers () {
  timers.forEach(clearTimeout)
  timers = []
}

function startScene () {
  sceneReady.value = false
  showText.value = false
  showFireworks.value = false
  showButton.value = false
  flagDown.value = false
  clearTimers()

  timers.push(setTimeout(() => { sceneReady.value = true }, 100))
  timers.push(setTimeout(() => { flagDown.value = true }, 200))
  timers.push(setTimeout(() => {
    showFireworks.value = true
    fireFireworks()
  }, 2200))
  timers.push(setTimeout(() => { showText.value = true }, 2600))
  timers.push(setTimeout(() => { showButton.value = true }, 3400))
}

function fireFireworks () {
  const marioColors = ['#FFD700', '#E52521', '#4CAF50', '#F8A5C2', '#80D8FF', '#FFB300']
  const bursts = [
    { delay: 0,    x: 0.25, y: 0.3 },
    { delay: 400,  x: 0.75, y: 0.25 },
    { delay: 800,  x: 0.5,  y: 0.2 },
    { delay: 1200, x: 0.3,  y: 0.35 },
    { delay: 1600, x: 0.7,  y: 0.3 },
  ]
  bursts.forEach(b => {
    timers.push(setTimeout(() => {
      confetti({
        particleCount: 80,
        startVelocity: 25,
        spread: 360,
        ticks: 50,
        gravity: 0.8,
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

onUnmounted(() => {
  clearTimers()
})
</script>

<template>
  <Transition name="scene-fade">
    <div v-if="show" class="fixed inset-0 z-[100] overflow-hidden">

      <!-- ═══ Sky ═══ -->
      <div class="absolute inset-0 flagpole-sky">
        <span v-for="i in 12" :key="i" class="sky-star" :style="{
          left: (Math.random() * 90 + 5) + '%',
          top: (Math.random() * 40 + 5) + '%',
          animationDelay: (Math.random() * 3) + 's',
          fontSize: (10 + Math.random() * 14) + 'px',
        }">✦</span>
      </div>

      <!-- ═══ Ground ═══ -->
      <div class="absolute bottom-0 left-0 right-0">
        <div class="ground-bricks"></div>
        <div class="ground-fill"></div>
      </div>

      <!-- ═══ Castle (PNG asset) ═══ -->
      <div class="castle-wrap" :class="{ 'castle-visible': sceneReady }">
        <img :src="castleSrc" alt="castle" class="castle-img" style="image-rendering: pixelated;" />
      </div>

      <!-- ═══ Flagpole (CSS drawn, green like Mario) ═══ -->
      <div class="flagpole-wrap" :class="{ 'pole-visible': sceneReady }">
        <!-- The pole (green!) -->
        <div class="pole-green"></div>
        <!-- Gold ball on top -->
        <div class="pole-ball-gold"></div>

        <!-- Flag -->
        <div class="flag-slider" :class="{ 'flag-descend': flagDown }">
          <div class="flag-shape"></div>
        </div>

        <!-- Princess Peach sliding down -->
        <div class="peach-slider" :class="{ 'peach-slide-down': flagDown }">
          <img :src="mascotUrl" alt="Princess Peach" class="peach-img" style="image-rendering: pixelated;" />
        </div>
      </div>

      <!-- ═══ Fireworks Bursts ═══ -->
      <div v-if="showFireworks" class="fireworks-layer">
        <span class="fw fw-1">🎆</span>
        <span class="fw fw-2">🎇</span>
        <span class="fw fw-3">🎆</span>
        <span class="fw fw-4">🎇</span>
        <span class="fw fw-5">🎆</span>
      </div>

      <!-- ═══ Text Overlay ═══ -->
      <div class="text-overlay">
        <div v-if="showText" class="text-content">
          <h2 class="title-text">LEVEL COMPLETE!</h2>
          <p class="sub-text">
            Princess Mathematician<br/>
            <span class="emma-line">
              <img :src="starSrc" alt="star" class="w-7 h-7 mx-1 inline-block star-bounce" style="image-rendering: pixelated;" />
              <span class="emma-name">Emma</span>
              <img :src="starSrc" alt="star" class="w-7 h-7 mx-1 inline-block star-bounce" style="image-rendering: pixelated;" />
            </span>
          </p>

          <!-- Coin count with Image coin -->
          <div class="coin-box">
            <img :src="marioCoinSrc" alt="coin" class="w-8 h-8 modal-coin-anim" style="image-rendering: pixelated;" />
            <span class="coin-num">{{ stars }}</span>
            <span class="coin-lbl">COINS</span>
          </div>
        </div>

        <button v-if="showButton" @click="emit('close')" class="continue-btn">
          NEXT WORLD →
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ═══ Scene ═══ */
.scene-fade-enter-active { transition: opacity 0.4s ease; }
.scene-fade-leave-active { transition: opacity 0.3s ease; }
.scene-fade-enter-from, .scene-fade-leave-to { opacity: 0; }

.flagpole-sky {
  background: linear-gradient(180deg, #1a1a4e 0%, #2a2a7a 30%, #4a3a9a 60%, #3a2a6a 100%);
}

/* ═══ Stars ═══ */
.sky-star {
  position: absolute;
  color: #FFD700;
  animation: twinkle 2s ease-in-out infinite alternate;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.7);
}
@keyframes twinkle {
  0% { opacity: 0.3; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.2); }
}

/* ═══ Ground ═══ */
.ground-bricks {
  height: 32px;
  background:
    repeating-linear-gradient(
      90deg,
      #C47A1A 0px, #C47A1A 30px,
      #A0600E 30px, #A0600E 32px
    );
  border-top: 3px solid #8B5E0A;
  border-bottom: 2px solid #6B4508;
  box-shadow: inset 0 2px 0 rgba(255,255,255,0.15);
}
.ground-fill {
  height: 50px;
  background: #704010;
}

/* ═══ Castle ═══ */
.castle-wrap {
  position: absolute;
  bottom: 82px;
  right: 6%;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s;
}
.castle-visible { opacity: 1; transform: translateY(0); }

.castle-img {
  width: 140px; /* Adjust size based on your actual png dimensions */
  filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.3));
}

/* ═══ Flagpole (green like Mario!) ═══ */
.flagpole-wrap {
  position: absolute;
  bottom: 82px;
  left: 30%;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s;
}
.pole-visible { opacity: 1; transform: translateY(0); }

.pole-green {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 300px;
  background: linear-gradient(90deg, #2E7D32, #4CAF50, #2E7D32);
  border-radius: 4px;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.4);
}
.pole-ball-gold {
  position: absolute;
  bottom: 300px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #FFEA70, #FFD700, #CC9900);
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.7), inset -2px -2px 4px rgba(0,0,0,0.2);
}

/* ═══ Flag ═══ */
.flag-slider {
  position: absolute;
  bottom: 268px;
  left: 12px;
  transition: bottom 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.flag-descend { bottom: 20px; }
.flag-shape {
  width: 0; height: 0;
  border-top: 16px solid transparent;
  border-bottom: 16px solid transparent;
  border-left: 28px solid #4CAF50;
  filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));
  animation: flag-flutter 0.5s ease-in-out infinite alternate;
}
@keyframes flag-flutter {
  0% { transform: scaleX(1); }
  100% { transform: scaleX(0.88) skewY(3deg); }
}

/* ═══ Peach Sliding ═══ */
.peach-slider {
  position: absolute;
  bottom: 260px;
  left: -30px;
  transition: bottom 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.peach-slide-down { bottom: 4px; }
.peach-img {
  width: 60px;
  filter: drop-shadow(3px 3px 4px rgba(0,0,0,0.5));
  animation: peach-wiggle 0.3s ease-in-out infinite alternate;
}
@keyframes peach-wiggle {
  0% { transform: rotate(-3deg); }
  100% { transform: rotate(3deg); }
}

/* ═══ Fireworks ═══ */
.fireworks-layer { position: absolute; inset: 0; pointer-events: none; }
.fw {
  position: absolute;
  font-size: 52px;
  animation: fw-pop 1.5s ease-out forwards;
}
@keyframes fw-pop {
  0% { transform: scale(0); opacity: 0; }
  30% { transform: scale(1.3); opacity: 1; }
  60% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}
.fw-1 { top: 8%;  left: 12%; animation-delay: 0s; }
.fw-2 { top: 6%;  left: 50%; animation-delay: 0.3s; }
.fw-3 { top: 16%; left: 78%; animation-delay: 0.6s; }
.fw-4 { top: 4%;  left: 32%; animation-delay: 0.9s; }
.fw-5 { top: 14%; left: 62%; animation-delay: 1.2s; }

/* ═══ Text ═══ */
.text-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}
.text-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: text-bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes text-bounce-in {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.15) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
.title-text {
  font-size: 2.5rem;
  font-weight: 900;
  color: #FFD700;
  text-shadow: 3px 3px 0 #E52521, 6px 6px 0 rgba(0,0,0,0.3);
  letter-spacing: 2px;
  animation: title-pulse 1.5s ease-in-out infinite alternate;
}
@keyframes title-pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); text-shadow: 3px 3px 0 #E52521, 6px 6px 0 rgba(0,0,0,0.3), 0 0 20px rgba(255,215,0,0.4); }
}
.sub-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: #FFF8F0;
  text-align: center;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.5);
  line-height: 1.6;
}
.emma-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}
.emma-name {
  font-size: 1.8rem;
  color: #F8A5C2;
  text-shadow: 2px 2px 0 #E06F9A, 0 0 15px rgba(248, 165, 194, 0.5);
}

/* Mario Super Stars (SVG) — with eyes! */
.mario-star {
  filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.6));
  animation: star-bounce-inline 1s ease-in-out infinite;
}
@keyframes star-bounce-inline {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(10deg); }
}

/* ═══ Image Coin (modal) ═══ */
.coin-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 3px solid #FFD700;
  border-radius: 16px;
  padding: 10px 24px;
  margin-top: 4px;
  animation: coin-box-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}
@keyframes coin-box-pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.modal-coin-anim {
  animation: coin-rotate 1s ease-in-out infinite;
}
@keyframes coin-rotate {
  0%, 100% { transform: rotateY(0deg) scale(1); }
  50% { transform: rotateY(180deg) scale(1.1); }
}

.coin-num {
  font-size: 2rem;
  font-weight: 900;
  color: #FFD700;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.5);
}
.coin-lbl {
  font-size: 0.9rem;
  font-weight: 700;
  color: #FFF8F0;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
  letter-spacing: 2px;
}

/* ═══ Continue Button ═══ */
.continue-btn {
  pointer-events: auto;
  margin-top: 20px;
  padding: 14px 36px;
  font-family: inherit;
  font-size: 1.3rem;
  font-weight: 900;
  color: #2C2C2C;
  background: linear-gradient(180deg, #7ADB7E 0%, #388E3C 100%);
  border: 4px solid #1B5E20;
  border-radius: 16px;
  cursor: pointer;
  box-shadow:
    inset 2px 2px 0 rgba(255,255,255,0.3),
    inset -2px -2px 0 rgba(0,0,0,0.2),
    4px 4px 0 rgba(0,0,0,0.3);
  transition: all 0.15s ease;
  animation: btn-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: 1px;
}
@keyframes btn-appear {
  0% { transform: translateY(40px) scale(0.5); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
.continue-btn:hover {
  transform: scale(1.08);
  box-shadow: inset 2px 2px 0 rgba(255,255,255,0.3), inset -2px -2px 0 rgba(0,0,0,0.2), 6px 6px 0 rgba(0,0,0,0.3), 0 0 20px rgba(76, 175, 80, 0.4);
}
.continue-btn:active {
  transform: scale(0.95) translateY(3px);
  box-shadow: inset 2px 2px 6px rgba(0,0,0,0.3);
}
</style>
