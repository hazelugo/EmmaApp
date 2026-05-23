<script setup>
import marioCoinSrc from '../assets/mario-coin.png'

defineProps({
  stars:       { type: Number,  default: 0 },
  isMuted:     { type: Boolean, default: false },
  isTimerMode: { type: Boolean, default: false },
  timeLeft:    { type: Number,  default: 60 },
})

defineEmits(['open-sound-settings', 'go-home'])
</script>

<template>
  <header
    id="score-header"
    class="block-border flex items-center justify-between rounded-2xl
           bg-mario-red/95 backdrop-blur-sm px-4 py-3"
  >
    <!-- Coin + Count -->
    <div class="flex items-center gap-2">
      <!-- Image coin -->
      <img :src="marioCoinSrc" alt="coin" class="w-8 h-8 header-coin-anim" :key="'coin-' + stars" style="image-rendering: pixelated;" />
      <span
        class="text-3xl font-extrabold tracking-wide text-star-gold drop-shadow-lg roll-in"
        :key="stars"
      >
        {{ stars }}
      </span>
    </div>

    <!-- Title OR Timer Countdown -->
    <h1
      v-if="!isTimerMode"
      class="text-xl md:text-2xl font-extrabold tracking-tight text-mushroom-white drop-shadow-md text-center leading-tight"
    >
      Emma's Star World
    </h1>
    <span
      v-else
      class="text-2xl md:text-3xl font-extrabold drop-shadow-md text-center leading-tight"
      :class="timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-mushroom-white'"
    >
      &#x23F3; {{ timeLeft }}s
    </span>

    <!-- Right controls -->
    <div class="flex items-center gap-1">
      <button
        class="btn-press flex items-center justify-center w-10 h-10 rounded-xl
               hover:scale-110 transition-transform cursor-pointer"
        :aria-label="isMuted ? 'Sound settings (muted)' : 'Sound settings'"
        @click="$emit('open-sound-settings')"
      >
        <span class="text-lg drop-shadow-md">{{ isMuted ? '🔇' : '🔊' }}</span>
      </button>
      <button
        class="btn-press flex items-center justify-center w-10 h-10 rounded-xl
               hover:scale-110 transition-transform cursor-pointer"
        aria-label="Go home"
        @click="$emit('go-home')"
      >
        <span class="text-lg drop-shadow-md">🏠</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header-coin-anim {
  animation: coin-flip 1s ease-in-out 1;
}
@keyframes coin-flip {
  0%   { transform: rotateY(0deg) scale(1); }
  50%  { transform: rotateY(180deg) scale(1.2); }
  100% { transform: rotateY(360deg) scale(1); }
}
</style>
