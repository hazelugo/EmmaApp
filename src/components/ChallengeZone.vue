<script setup>
defineProps({
  num1:     { type: Number, required: true },
  num2:     { type: Number, required: true },
  operator: { type: String, required: true },
  answer:   { type: String, default: '' },
  feedback: { type: String, default: '' },
})
</script>

<template>
  <section
    id="challenge-zone"
    class="pixel-border flex-1 flex flex-col items-center justify-center
           rounded-3xl bg-mc-wood/80 backdrop-blur-sm p-6 min-h-[200px]
           transition-all duration-300"
    :class="{
      'pulse-glow ring-4 ring-mc-grass-light/60': feedback === 'correct',
      'shake ring-4 ring-mc-red/60': feedback === 'wrong',
    }"
  >
    <!-- Problem display -->
    <div class="flex items-center gap-3 text-center">
      <!-- First Number -->
      <span class="text-6xl md:text-7xl font-extrabold text-mc-sand drop-shadow-lg">
        {{ num1 }}
      </span>

      <!-- Operator -->
      <span class="text-5xl md:text-6xl font-extrabold text-mc-purple-glow drop-shadow-md">
        {{ operator }}
      </span>

      <!-- Second Number -->
      <span class="text-6xl md:text-7xl font-extrabold text-mc-sand drop-shadow-lg">
        {{ num2 }}
      </span>

      <!-- Equals -->
      <span class="text-5xl md:text-6xl font-extrabold text-mc-purple-glow drop-shadow-md">
        =
      </span>

      <!-- Answer Box -->
      <div
        class="relative min-w-[80px] md:min-w-[100px] rounded-2xl border-4
               flex items-center justify-center px-4 py-2
               transition-colors duration-200"
        :class="{
          'border-mc-gold bg-mc-dark/40':   !feedback,
          'border-mc-grass-light bg-mc-grass/40': feedback === 'correct',
          'border-mc-red bg-mc-red/20':     feedback === 'wrong',
        }"
      >
        <span
          v-if="answer"
          class="text-6xl md:text-7xl font-extrabold text-mc-white drop-shadow-lg"
        >
          {{ answer }}
        </span>

        <!-- Blinking cursor placeholder -->
        <span
          v-else
          class="text-6xl md:text-7xl font-extrabold text-mc-gold/50 animate-pulse"
        >
          ?
        </span>
      </div>
    </div>

    <!-- Mobile-only feedback (shown when mascot is hidden) -->
    <p
      v-if="feedback"
      class="sm:hidden mt-4 text-2xl font-bold"
      :class="{
        'text-mc-grass-light': feedback === 'correct',
        'text-mc-red': feedback === 'wrong',
      }"
    >
      {{ feedback === 'correct' ? '🎉 Great job!' : '💪 Try again!' }}
    </p>
  </section>
</template>
