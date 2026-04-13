<script setup>
import { ref } from 'vue'
import { useSound } from '../composables/useSound.js'

const emit = defineEmits(['select'])
const { playThemeMusic, playTap } = useSound()

const started = ref(false)
function startApp() {
  started.value = true
  playThemeMusic('title')
  playTap()
}

import peachSrc from '../assets/mascot.png'
import daisySrc from '../assets/daisy.png'
import rosalinaSrc from '../assets/rosalina.png'
import toadSrc from '../assets/toad.png'

const characters = [
  { 
    id: 'peach',
    name: 'Princess Peach', 
    src: peachSrc,
    bg: 'bg-peach/60',
    border: 'border-peach-dark',
    icon: '👑',
  },
  { 
    id: 'daisy',
    name: 'Princess Daisy', 
    src: daisySrc,
    emoji: '🌼',
    bg: 'bg-daisy/60',
    border: 'border-daisy-dark',
    icon: '🌼',
  },
  { 
    id: 'rosalina',
    name: 'Rosalina', 
    src: rosalinaSrc,
    emoji: '💫',
    bg: 'bg-rosalina/60',
    border: 'border-rosalina-dark',
    icon: '✨',
  },
  { 
    id: 'toad',
    name: 'Toad', 
    src: toadSrc,
    emoji: '🍄',
    bg: 'bg-mario-red/60',
    border: 'border-mario-red-dark',
    icon: '🍄',
  }
]

const hoveredChar = ref(null)

function selectCharacter(char) {
  emit('select', char)
}
</script>

<template>
  <div class="fixed inset-0 z-[200] bg-sky flex justify-center items-center p-4">
    
    <!-- Title Screen overlay -->
    <div 
      v-if="!started" 
      class="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-sky z-50 transition-opacity duration-500 text-center px-4"
      @click="startApp"
    >
      <h1 class="text-6xl md:text-8xl font-black text-mario-red drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)] mb-12 animate-float leading-tight" style="-webkit-text-stroke: 3px white;">
        SUPER MATH<br/>WORLD
      </h1>
      <p class="text-2xl md:text-4xl font-bold text-dark animate-pulse bg-mushroom-white/80 px-8 py-4 rounded-full border-4 border-dark/20 shadow-lg">
        Tap to Start!
      </p>
    </div>

    <div 
      class="max-w-2xl w-full bg-mushroom-white block-border rounded-3xl p-8 flex flex-col items-center transition-all duration-700 transform"
      :class="{ 'opacity-0 scale-90 blur-sm pointer-events-none': !started, 'opacity-100 scale-100 blur-0': started }"
    >
      
      <h1 class="text-3xl md:text-5xl font-extrabold text-mario-red drop-shadow-md text-center mb-2">
        Choose Your Player!
      </h1>
      <p class="text-lg md:text-xl font-bold text-dark text-center mb-8">
        Who will Emma play as today?
      </p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <button
          v-for="char in characters"
          :key="char.id"
          class="relative group aspect-square rounded-2xl border-4 block-border flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer bg-sky/30"
          :class="char.border"
          @click="selectCharacter(char)"
          @mouseenter="hoveredChar = char.id"
          @mouseleave="hoveredChar = null"
        >
          <!-- Background Glow -->
          <div class="absolute inset-0 transition-opacity duration-300"
               :class="[char.bg, hoveredChar === char.id ? 'opacity-100' : 'opacity-40']">
          </div>

          <!-- Character Image or Emoji -->
          <img
            v-if="char.src"
            :src="char.src"
            :alt="char.name"
            class="relative z-10 w-24 md:w-32 object-contain"
            style="image-rendering: pixelated;"
          />
          <div v-else class="relative z-10 text-6xl md:text-8xl filter drop-shadow-md">
            {{ char.emoji }}
          </div>

          <div class="absolute bottom-2 left-0 right-0 text-center z-10">
            <span class="bg-mushroom-white/90 text-dark px-2 rounded-full font-bold text-sm md:text-base border-2 border-dark/20 shadow-sm">
              {{ char.name }}
            </span>
          </div>
        </button>
      </div>

    </div>
  </div>
</template>
