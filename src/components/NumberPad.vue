<script setup>
defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['digit', 'backspace', 'submit'])

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
</script>

<template>
  <nav
    id="number-pad"
    class="pixel-border rounded-3xl bg-mc-dark/80 backdrop-blur-sm p-3"
    aria-label="Number pad"
  >
    <div class="grid grid-cols-4 gap-2">
      <!-- Digit buttons: 1-9 -->
      <button
        v-for="d in digits.slice(0, 9)"
        :key="d"
        :id="'btn-' + d"
        :disabled="disabled"
        class="btn-press flex items-center justify-center
               rounded-2xl font-extrabold text-3xl md:text-4xl
               min-h-[60px] md:min-h-[68px]
               bg-mc-grass text-mc-white
               border-b-4 border-mc-leaf
               hover:bg-mc-grass-light hover:border-mc-grass
               active:border-b-0 active:border-t-4 active:border-mc-leaf
               disabled:opacity-40 disabled:cursor-not-allowed
               transition-all duration-100 cursor-pointer
               shadow-md"
        @click="emit('digit', d)"
      >
        {{ d }}
      </button>

      <!-- Backspace / Clear -->
      <button
        id="btn-backspace"
        :disabled="disabled"
        class="btn-press flex items-center justify-center
               rounded-2xl font-extrabold text-2xl md:text-3xl
               min-h-[60px] md:min-h-[68px]
               bg-mc-red text-mc-white
               border-b-4 border-red-900
               hover:bg-red-500 hover:border-red-700
               active:border-b-0 active:border-t-4 active:border-red-900
               disabled:opacity-40 disabled:cursor-not-allowed
               transition-all duration-100 cursor-pointer
               shadow-md"
        aria-label="Backspace"
        @click="emit('backspace')"
      >
        ⌫
      </button>

      <!-- Zero -->
      <button
        id="btn-0"
        :disabled="disabled"
        class="btn-press flex items-center justify-center
               rounded-2xl font-extrabold text-3xl md:text-4xl
               min-h-[60px] md:min-h-[68px]
               bg-mc-grass text-mc-white
               border-b-4 border-mc-leaf
               hover:bg-mc-grass-light hover:border-mc-grass
               active:border-b-0 active:border-t-4 active:border-mc-leaf
               disabled:opacity-40 disabled:cursor-not-allowed
               transition-all duration-100 cursor-pointer
               shadow-md"
        @click="emit('digit', 0)"
      >
        0
      </button>

      <!-- Submit / Go -->
      <button
        id="btn-submit"
        :disabled="disabled"
        class="btn-press col-span-2 flex items-center justify-center
               rounded-2xl font-extrabold text-2xl md:text-3xl
               min-h-[60px] md:min-h-[68px]
               bg-mc-purple text-mc-white
               border-b-4 border-mc-purple-dark
               hover:bg-mc-purple-glow hover:border-mc-purple hover:text-mc-dark
               active:border-b-0 active:border-t-4 active:border-mc-purple-dark
               disabled:opacity-40 disabled:cursor-not-allowed
               transition-all duration-100 cursor-pointer
               shadow-md"
        aria-label="Submit answer"
        @click="emit('submit')"
      >
        GO! ✅
      </button>
    </div>
  </nav>
</template>
