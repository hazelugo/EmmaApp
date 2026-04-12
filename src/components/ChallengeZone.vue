<script setup>
defineProps({
  num1:       { type: Number, required: true },
  num2:       { type: Number, required: true },
  operator:   { type: String, required: true },
  answer:     { type: String, default: '' },
  feedback:   { type: String, default: '' },
  problemKey: { type: Number, default: 0 },
})
</script>

<template>
  <section
    id="challenge-zone"
    class="block-border flex-1 flex flex-col items-center justify-center
           rounded-3xl bg-coin/90 backdrop-blur-sm p-6 min-h-[200px]
           transition-all duration-300"
    :class="{
      'pulse-glow ring-4 ring-star-gold/70': feedback === 'correct',
      'shake ring-4 ring-mario-red/60': feedback === 'wrong',
    }"
  >
    <!-- Question Block "?" decoration at top removed per feedback -->

    <!-- Problem display — pop-in on new problem -->
    <div class="flex items-center gap-3 text-center pop-in" :key="problemKey">
      <!-- First Number -->
      <span class="text-6xl md:text-7xl font-extrabold text-dark drop-shadow-lg">
        {{ num1 }}
      </span>

      <!-- Operator -->
      <span class="text-5xl md:text-6xl font-extrabold text-mario-red drop-shadow-md">
        {{ operator }}
      </span>

      <!-- Second Number -->
      <span class="text-6xl md:text-7xl font-extrabold text-dark drop-shadow-lg">
        {{ num2 }}
      </span>

      <!-- Equals -->
      <span class="text-5xl md:text-6xl font-extrabold text-mario-red drop-shadow-md">
        =
      </span>

      <!-- Answer Box (styled like a ? block) -->
      <div
        class="relative min-w-[80px] md:min-w-[100px] rounded-2xl border-4
               flex items-center justify-center px-4 py-2
               transition-colors duration-200"
        :class="{
          'border-block-outline bg-mushroom-white/60':   !feedback,
          'border-star-gold bg-star-glow/40 block-bump': feedback === 'correct',
          'border-mario-red bg-mario-red/15':             feedback === 'wrong',
        }"
      >
        <span
          v-if="answer"
          class="text-6xl md:text-7xl font-extrabold text-dark drop-shadow-lg"
        >
          {{ answer }}
        </span>

        <!-- Blinking cursor placeholder -->
        <span
          v-else
          class="text-6xl md:text-7xl font-extrabold text-block-outline/50 animate-pulse"
        >
          ?
        </span>
      </div>
    </div>

    <!-- Mobile-only feedback -->
    <p
      v-if="feedback"
      class="sm:hidden mt-4 text-2xl font-bold"
      :class="{
        'text-luigi': feedback === 'correct',
        'text-mario-red': feedback === 'wrong',
      }"
    >
      {{ feedback === 'correct' ? '⭐ Wahoo!' : '🍄 Try again!' }}
    </p>
  </section>
</template>
