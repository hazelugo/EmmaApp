<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  character: { type: Object, required: true },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="fixed inset-0 z-[190] bg-sky flex justify-center items-center p-4">
    <div class="max-w-sm w-full flex flex-col items-center gap-6">

      <!-- Character portrait -->
      <div class="flex flex-col items-center gap-2">
        <img
          :src="character.src"
          :alt="character.name"
          class="w-24 h-24 object-contain drop-shadow-lg"
          style="image-rendering: pixelated;"
        />
        <p class="text-xl font-extrabold text-mushroom-white drop-shadow-md">
          Ready, {{ character.name.split(' ')[1] || character.name }}?
        </p>
      </div>

      <!-- Mode cards -->
      <div class="flex flex-col gap-4 w-full">

        <!-- Adventure -->
        <button
          class="btn-press block-border w-full rounded-2xl bg-mushroom-white px-6 py-5
                 flex items-center gap-5 hover:scale-[1.02] transition-transform cursor-pointer text-left"
          @click="emit('select', 'adventure')"
        >
          <span class="text-5xl drop-shadow-md leading-none">⭐</span>
          <div>
            <div class="text-xl font-extrabold text-dark leading-tight">Adventure</div>
            <div class="text-sm font-medium text-dark/70 mt-0.5">Earn stars &amp; level up!</div>
          </div>
        </button>

        <!-- Sprint -->
        <button
          class="btn-press block-border w-full rounded-2xl bg-mushroom-white px-6 py-5
                 flex items-center gap-5 hover:scale-[1.02] transition-transform cursor-pointer text-left"
          @click="emit('select', 'sprint')"
        >
          <span class="text-5xl drop-shadow-md leading-none">⏱️</span>
          <div>
            <div class="text-xl font-extrabold text-dark leading-tight">Sprint</div>
            <div class="text-sm font-medium text-dark/70 mt-0.5">60-second challenge!</div>
          </div>
        </button>

      </div>
    </div>
  </div>
</template>
