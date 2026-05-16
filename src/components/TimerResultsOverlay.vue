<script setup>
defineProps({
  show:            { type: Boolean, required: true },
  coins:           { type: Number,  default: 0 },
  correctCount:    { type: Number,  default: 0 },
  highScore:       { type: Number,  default: 0 },
  isNewHighScore:  { type: Boolean, default: false },
})

defineEmits(['close'])
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        class="block-border relative mx-4 w-full max-w-sm rounded-3xl bg-mario-red/95
               backdrop-blur-sm px-6 py-8 text-center shadow-2xl"
      >
        <!-- Time's Up heading -->
        <h2 class="text-4xl font-extrabold tracking-tight text-mushroom-white drop-shadow-lg mb-2">
          Time's Up!
        </h2>

        <!-- New High Score badge (conditional) -->
        <div
          v-if="isNewHighScore"
          class="inline-block mb-4 rounded-full bg-star-gold px-4 py-1
                 text-sm font-extrabold text-dark shadow-md animate-bounce"
        >
          ⭐ New High Score!
        </div>

        <!-- Stats -->
        <div class="mt-4 space-y-3">
          <!-- Correct problems -->
          <div class="flex items-center justify-between rounded-xl bg-mushroom-white/15 px-4 py-3">
            <span class="text-lg font-bold text-mushroom-white">Correct Problems</span>
            <span class="text-3xl font-extrabold text-star-gold drop-shadow-md">{{ correctCount }}</span>
          </div>

          <!-- Coins earned -->
          <div class="flex items-center justify-between rounded-xl bg-mushroom-white/15 px-4 py-3">
            <span class="text-lg font-bold text-mushroom-white">Coins Earned</span>
            <span class="text-3xl font-extrabold text-star-gold drop-shadow-md">{{ coins }}</span>
          </div>

          <!-- Best score -->
          <div class="flex items-center justify-between rounded-xl bg-mushroom-white/10 px-4 py-2">
            <span class="text-sm font-semibold text-mushroom-white/80">Best Score</span>
            <span class="text-xl font-extrabold text-mushroom-white/80">{{ highScore }}</span>
          </div>
        </div>

        <!-- Done button -->
        <button
          type="button"
          class="btn-press mt-6 w-full rounded-2xl bg-star-gold py-3
                 text-xl font-extrabold text-dark shadow-md
                 hover:scale-105 transition-transform cursor-pointer"
          @click="$emit('close')"
        >
          Done
        </button>
      </div>
    </div>
  </Transition>
</template>
