<script setup>
defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['digit', 'backspace', 'submit'])

const digits = [7, 8, 9, 4, 5, 6, 1, 2, 3]
</script>

<template>
  <nav
    id="number-pad"
    class="block-border rounded-3xl bg-dark/85 backdrop-blur-sm p-4 mx-auto max-w-sm"
    aria-label="Number pad"
  >
    <div class="grid grid-cols-3 gap-3">
      <!-- Digit buttons: 7-9, 4-6, 1-3 (Pipe-green like warp pipes) -->
      <button
        v-for="d in digits.slice(0, 9)"
        :key="d"
        :id="'btn-' + d"
        :disabled="disabled"
        class="btn-press flex items-center justify-center
               rounded-2xl font-extrabold text-3xl md:text-4xl
               min-h-[60px] md:min-h-[68px]
               bg-pipe text-mushroom-white
               border-b-4 border-pipe-dark
               hover:bg-luigi hover:border-luigi-dark
               active:border-b-0 active:border-t-4 active:border-pipe-dark
               disabled:opacity-40 disabled:cursor-not-allowed
               transition-all duration-100 cursor-pointer
               shadow-md"
        @click="emit('digit', d)"
      >
        {{ d }}
      </button>

      <!-- Backspace / Clear (Mario Red) -->
      <button
        id="btn-backspace"
        :disabled="disabled"
        class="btn-press flex items-center justify-center
               rounded-2xl font-extrabold text-2xl md:text-3xl
               min-h-[60px] md:min-h-[68px]
               bg-mario-red text-mushroom-white
               border-b-4 border-mario-red-dark
               hover:bg-toad-red hover:border-mario-red-dark
               active:border-b-0 active:border-t-4 active:border-mario-red-dark
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
               bg-pipe text-mushroom-white
               border-b-4 border-pipe-dark
               hover:bg-luigi hover:border-luigi-dark
               active:border-b-0 active:border-t-4 active:border-pipe-dark
               disabled:opacity-40 disabled:cursor-not-allowed
               transition-all duration-100 cursor-pointer
               shadow-md"
        @click="emit('digit', 0)"
      >
        0
      </button>

      <!-- Submit / Go (Star Gold) -->
      <button
        id="btn-submit"
        :disabled="disabled"
        class="btn-press flex items-center justify-center
               rounded-2xl font-extrabold text-2xl md:text-3xl
               min-h-[60px] md:min-h-[68px]
               bg-star-gold text-dark
               border-b-4 border-daisy-dark
               hover:bg-star-glow hover:border-daisy
               active:border-b-0 active:border-t-4 active:border-daisy-dark
               disabled:opacity-40 disabled:cursor-not-allowed
               transition-all duration-100 cursor-pointer
               shadow-md"
        aria-label="Submit answer"
        @click="emit('submit')"
      >
        GO! ⭐
      </button>
    </div>
  </nav>
</template>
