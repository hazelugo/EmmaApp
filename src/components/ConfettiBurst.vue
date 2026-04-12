<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
})

const particles = ref([])
let cleanupTimer = null

const COLORS = [
  '#FFD700', // gold
  '#9B30FF', // purple
  '#7EC850', // grass-light
  '#E8D5A3', // sand
  '#CE93D8', // purple-glow
  '#FF6B6B', // coral
  '#4ECDC4', // teal
]

const SHAPES = ['●', '★', '■', '◆', '▲']

function spawnConfetti () {
  const count = 40
  const newParticles = []

  for (let i = 0; i < count; i++) {
    newParticles.push({
      id: Date.now() + i,
      x: 40 + Math.random() * 20,         // center-ish horizontally (%)
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: 12 + Math.random() * 16,
      angle: -90 + (Math.random() - 0.5) * 120,  // spray upward
      speed: 4 + Math.random() * 6,
      spin: (Math.random() - 0.5) * 720,
      delay: Math.random() * 200,
      duration: 800 + Math.random() * 600,
    })
  }

  particles.value = newParticles

  // Clean up after animations finish
  if (cleanupTimer) clearTimeout(cleanupTimer)
  cleanupTimer = setTimeout(() => {
    particles.value = []
  }, 1800)
}

watch(() => props.active, (val) => {
  if (val) spawnConfetti()
})

onUnmounted(() => {
  if (cleanupTimer) clearTimeout(cleanupTimer)
})
</script>

<template>
  <div
    v-if="particles.length"
    class="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    aria-hidden="true"
  >
    <span
      v-for="p in particles"
      :key="p.id"
      class="absolute"
      :style="{
        left: p.x + '%',
        top: '50%',
        fontSize: p.size + 'px',
        color: p.color,
        animationName: 'confetti-burst',
        animationDuration: p.duration + 'ms',
        animationDelay: p.delay + 'ms',
        animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        animationFillMode: 'forwards',
        '--confetti-angle': p.angle + 'deg',
        '--confetti-speed': p.speed,
        '--confetti-spin': p.spin + 'deg',
        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }"
    >
      {{ p.shape }}
    </span>
  </div>
</template>
