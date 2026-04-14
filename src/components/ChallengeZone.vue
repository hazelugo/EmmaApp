<script setup>
defineProps({
  num1:       { type: Number, required: true },
  num2:       { type: Number, required: true },
  operator:   { type: String, required: true },
  answer:     { type: String, default: '' },
  feedback:   { type: String, default: '' },
  problemKey: { type: Number, default: 0 },
  character:  { type: Object, required: true },
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

    <!-- Character Mascot (moved from MascotPanel so it shows on mobile) -->
    <div class="relative flex items-center justify-center mb-4 md:mb-6">
      <div 
        class="absolute w-20 h-20 md:w-32 md:h-32 rounded-full blur-md"
        :class="character.bg"
      ></div>
      <img
        v-if="character.src"
        :src="character.src"
        :alt="character.name"
        class="relative w-24 md:w-36 animate-float drop-shadow-xl z-20"
        style="image-rendering: pixelated;"
        :class="{
          'scale-110 transition-transform duration-300': feedback === 'correct',
          'shake': feedback === 'wrong',
        }"
      />
      <div 
        v-else 
        class="relative text-7xl md:text-9xl filter drop-shadow-md animate-float z-20"
        :class="{
          'scale-110 transition-transform duration-300': feedback === 'correct',
          'shake': feedback === 'wrong',
        }"
      >
        {{ character.emoji }}
      </div>
    </div>

    <!-- Problem display — pop-in on new problem -->
    <div class="flex items-center gap-2 md:gap-3 text-center pop-in" :key="problemKey">
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

  </section>
</template>
