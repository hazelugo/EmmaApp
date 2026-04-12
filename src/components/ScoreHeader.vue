<script setup>
import marioCoinSrc from '../assets/mario-coin.png'

defineProps({
  stars:      { type: Number, default: 0 },
  streak:     { type: Number, default: 0 },
  isMuted:    { type: Boolean, default: false },
  maxOperand: { type: Number, default: 5 },
  character:  { type: Object, default: () => ({}) },
})

defineEmits(['toggle-mute'])
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

    <!-- Title -->
    <h1 class="text-xl md:text-2xl font-extrabold tracking-tight text-mushroom-white drop-shadow-md text-center leading-tight">
      Emma's Star World
    </h1>

    <!-- Right Controls -->
    <div class="flex items-center gap-2">
      <!-- Streak Badge with Mario SVG Super Star -->
      <div
        v-if="streak >= 2"
        class="flex items-center gap-1 rounded-full bg-star-gold/25 border-2 border-star-gold px-2 py-1"
      >
        <!-- SVG Super Star (with eyes, like Mario) -->
        <svg viewBox="0 0 24 24" width="22" height="22" class="streak-star">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill="#FFD700" stroke="#CC9900" stroke-width="1.2"/>
          <circle cx="10.2" cy="12" r="1.1" fill="#2C2C2C"/>
          <circle cx="13.8" cy="12" r="1.1" fill="#2C2C2C"/>
        </svg>
        <span class="text-lg md:text-xl font-bold text-star-gold">{{ streak }}</span>
      </div>

      <!-- Mute Toggle -->
      <button
        id="btn-mute"
        class="btn-press flex items-center justify-center w-11 h-11 md:w-12 md:h-12
               rounded-xl bg-peach-dark/60 border-2 border-peach-light/50
               hover:bg-peach-dark/80 transition-colors cursor-pointer"
        :aria-label="isMuted ? 'Unmute sounds' : 'Mute sounds'"
        @click="$emit('toggle-mute')"
      >
        <span class="text-xl md:text-2xl">{{ isMuted ? '🔇' : '🔊' }}</span>
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

/* Streak SVG star bounce */
.streak-star {
  animation: star-spin-small 1.2s ease-in-out infinite;
  filter: drop-shadow(0 0 4px rgba(255,215,0,0.6));
}
@keyframes star-spin-small {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50%       { transform: scale(1.2) rotate(15deg); }
}
</style>
