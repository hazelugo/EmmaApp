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
        <button
          v-for="char in CHARACTERS"
          :key="char.id"
          class="char-card relative aspect-square w-full rounded-2xl border-4 block-border overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 flex flex-col"
          :class="[char.border, `char-${char.id}`]"
          :style="{ background: char.cardBg }"
          @click="emit('select', char)"
          @mouseenter="hoveredChar = char.id"
          @mouseleave="hoveredChar = null"
        >
          <!-- Corner decorations -->
          <span
            v-for="(deco, i) in char.decorations"
            :key="i"
            class="deco absolute select-none pointer-events-none"
            :style="deco.style"
          >{{ deco.emoji }}</span>

          <!-- Sprite area -->
          <div class="relative z-10 flex-1 flex items-end justify-center">
            <img
              :src="char.src"
              :alt="char.name"
              class="sprite w-20 md:w-28 object-contain drop-shadow-lg"
              style="image-rendering: pixelated;"
            />
          </div>

          <!-- Name tag — gradient scrim + text -->
          <div class="relative z-10 w-full">
            <div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            <div class="relative pb-2 px-2 text-center">
              <div class="font-black text-white text-xs md:text-sm leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">{{ char.name }}</div>
              <div class="font-semibold text-white/85 text-[9px] md:text-[11px] leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,1)] tracking-wide uppercase">{{ char.tagline }}</div>
            </div>
          </div>
        </button>
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

<style scoped>
/* ── Peach: graceful float ── */
.char-peach:hover .sprite {
  animation: float 0.9s ease-in-out infinite alternate;
}
.char-peach .deco {
  animation: sway 4s ease-in-out infinite;
}

/* ── Daisy: energetic bounce ── */
.char-daisy:hover .sprite {
  animation: bounce-up 0.45s ease-in-out infinite;
}
.char-daisy .deco {
  animation: spin-slow 6s linear infinite;
}

/* ── Rosalina: ethereal glow ── */
.char-rosalina:hover .sprite {
  animation: glow-rise 1.2s ease-in-out infinite alternate;
}
.char-rosalina .deco {
  animation: twinkle 2.5s ease-in-out infinite;
}

/* ── Toad: hyper wiggle ── */
.char-toad:hover .sprite {
  animation: wiggle 0.12s ease-in-out infinite;
}
.char-toad .deco {
  animation: pop 0.5s ease-in-out infinite alternate;
}

@keyframes float {
  from { transform: translateY(0); }
  to   { transform: translateY(-10px); }
}

@keyframes bounce-up {
  0%, 100% { transform: translateY(0) scaleY(1); }
  45%       { transform: translateY(-12px) scaleY(1.05); }
  55%       { transform: translateY(-12px) scaleY(1.05); }
}

@keyframes glow-rise {
  from { filter: drop-shadow(0 0 4px #a78bfa) brightness(1); transform: translateY(0); }
  to   { filter: drop-shadow(0 0 18px #c4b5fd) brightness(1.2); transform: translateY(-6px); }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(-5deg) scale(1.02); }
  50%       { transform: rotate(5deg) scale(1.02); }
}

@keyframes sway {
  0%, 100% { transform: rotate(-8deg) scale(1); }
  50%       { transform: rotate(8deg) scale(1.1); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.4; transform: scale(0.75); }
  50%       { opacity: 1; transform: scale(1.3); }
}

@keyframes pop {
  from { transform: scale(1); }
  to   { transform: scale(1.35) rotate(10deg); }
}
</style>
