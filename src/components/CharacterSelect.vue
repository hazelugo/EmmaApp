<script setup>
import { ref } from 'vue'
import { CHARACTERS } from '../data/characters.js'

const emit = defineEmits(['select', 'open-shop'])

const hoveredChar = ref(null)
</script>

<template>
  <div class="fixed inset-0 z-[200] bg-sky flex justify-center items-center p-4">
    <div class="max-w-2xl w-full bg-mushroom-white block-border rounded-3xl p-8 flex flex-col items-center gap-6">

      <div class="text-4xl md:text-6xl font-black drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)] text-center leading-tight" style="-webkit-text-stroke: 1px black;">
        <span style="color: #E52521">W</span><span style="color: #4CAF50">e</span><span style="color: #FFD700">l</span><span style="color: #4384F4">c</span><span style="color: #E52521">o</span><span style="color: #4CAF50">m</span><span style="color: #FFD700">e</span>
        <span class="hidden md:inline">&nbsp;</span><br class="md:hidden" />
        <span style="color: #4384F4">E</span><span style="color: #E52521">m</span><span style="color: #4CAF50">m</span><span style="color: #FFD700">a</span><span style="color: #E52521">!</span>
      </div>
      <p class="text-lg md:text-xl font-medium text-dark text-center -mt-2">
        Choose your player!
      </p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <div
          v-for="char in CHARACTERS"
          :key="char.id"
          class="flex flex-col items-center gap-3"
        >
          <button
            class="relative group aspect-square w-full rounded-2xl border-4 block-border flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-sky/30"
            :class="char.border"
            @click="emit('select', char)"
            @mouseenter="hoveredChar = char.id"
            @mouseleave="hoveredChar = null"
          >
            <div class="absolute inset-0 transition-opacity duration-300"
                 :class="[char.bg, hoveredChar === char.id ? 'opacity-100' : 'opacity-40']" />
            <img
              :src="char.src"
              :alt="char.name"
              class="relative z-10 w-24 md:w-32 object-contain"
              style="image-rendering: pixelated;"
            />
          </button>
          <div class="text-dark font-bold text-xs md:text-sm text-center leading-tight min-h-[36px] md:min-h-[44px] flex items-center justify-center">
            <span class="line-clamp-2">{{ char.name }}</span>
          </div>
        </div>
      </div>

      <button
        class="flex items-center gap-2 text-dark/50 hover:text-dark/80 transition-colors cursor-pointer text-sm font-semibold"
        @click="emit('open-shop')"
      >
        <span>🏪</span>
        <span>Star Shop</span>
      </button>

    </div>
  </div>
</template>
