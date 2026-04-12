<script setup>
defineProps({
  stars:      { type: Number, default: 0 },
  streak:     { type: Number, default: 0 },
  isMuted:    { type: Boolean, default: false },
  maxOperand: { type: Number, default: 5 },
})

defineEmits(['toggle-mute'])
</script>

<template>
  <header
    id="score-header"
    class="pixel-border flex items-center justify-between rounded-2xl
           bg-mc-purple-dark/90 backdrop-blur-sm px-4 py-3"
  >
    <!-- Star Count -->
    <div class="flex items-center gap-2">
      <span class="text-3xl md:text-4xl" role="img" aria-label="star">⭐</span>
      <span
        class="text-3xl font-extrabold tracking-wide text-mc-gold drop-shadow-lg roll-in"
        :key="stars"
      >
        {{ stars }}
      </span>
    </div>

    <!-- Title -->
    <h1 class="text-xl md:text-3xl font-extrabold tracking-tight text-mc-white drop-shadow-md text-center">
      Emma's Math Quest
    </h1>

    <!-- Right Controls -->
    <div class="flex items-center gap-2">
      <!-- Streak Badge -->
      <div
        v-if="streak >= 2"
        class="flex items-center gap-1 rounded-full bg-mc-gold/20 border-2 border-mc-gold px-2 py-1"
      >
        <span class="text-xl md:text-2xl">🔥</span>
        <span class="text-lg md:text-xl font-bold text-mc-gold">{{ streak }}</span>
      </div>

      <!-- Mute Toggle -->
      <button
        id="btn-mute"
        class="btn-press flex items-center justify-center w-11 h-11 md:w-12 md:h-12
               rounded-xl bg-mc-purple/50 border-2 border-mc-purple-glow/40
               hover:bg-mc-purple/70 transition-colors cursor-pointer"
        :aria-label="isMuted ? 'Unmute sounds' : 'Mute sounds'"
        @click="$emit('toggle-mute')"
      >
        <span class="text-xl md:text-2xl">{{ isMuted ? '🔇' : '🔊' }}</span>
      </button>
    </div>
  </header>
</template>
