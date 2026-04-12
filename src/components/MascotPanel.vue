<script setup>
import mascotUrl from '../assets/mascot.png'

defineProps({
  feedback: { type: String, default: '' },
})
</script>

<template>
  <aside
    id="mascot-panel"
    class="hidden sm:flex flex-col items-center justify-center w-28 md:w-36 shrink-0"
  >
    <!-- Mascot Image -->
    <img
      :src="mascotUrl"
      alt="Friendly fox mascot"
      class="w-24 md:w-32 animate-float drop-shadow-xl"
      :class="{
        'scale-110 transition-transform duration-300': feedback === 'correct',
        'shake': feedback === 'wrong',
      }"
    />

    <!-- Speech Bubble -->
    <div
      v-if="feedback"
      class="mt-2 rounded-xl px-3 py-2 text-center text-base font-bold pixel-border"
      :class="{
        'bg-mc-grass-light text-mc-dark': feedback === 'correct',
        'bg-mc-red text-mc-white': feedback === 'wrong',
      }"
    >
      {{ feedback === 'correct' ? 'Great job! 🎉' : 'Try again! 💪' }}
    </div>
  </aside>
</template>
