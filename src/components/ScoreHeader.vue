<script setup>
defineProps({
  stars:  { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
})
</script>

<template>
  <header
    id="score-header"
    class="pixel-border flex items-center justify-between rounded-2xl
           bg-mc-purple-dark/90 backdrop-blur-sm px-5 py-3"
  >
    <!-- Star Count -->
    <div class="flex items-center gap-2">
      <span class="text-4xl" role="img" aria-label="star">⭐</span>
      <span
        class="text-3xl font-extrabold tracking-wide text-mc-gold drop-shadow-lg"
        :class="{ 'star-bounce': stars > 0 }"
        :key="stars"
      >
        {{ stars }}
      </span>
    </div>

    <!-- Title -->
    <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-mc-white drop-shadow-md">
      Emma's Math Quest
    </h1>

    <!-- Streak Badge -->
    <div
      v-if="streak >= 2"
      class="flex items-center gap-1 rounded-full bg-mc-gold/20 border-2 border-mc-gold px-3 py-1"
    >
      <span class="text-2xl">🔥</span>
      <span class="text-xl font-bold text-mc-gold">{{ streak }}</span>
    </div>
  </header>
</template>
