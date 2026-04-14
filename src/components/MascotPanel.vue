<script setup>
defineProps({
  feedback: { type: String, default: '' },
  character: { type: Object, required: true },
})
</script>

<template>
  <aside
    id="mascot-panel"
    class="hidden sm:flex flex-col items-center justify-center w-28 md:w-36 shrink-0"
  >
    <!-- Character Mascot -->
    <div class="relative flex items-center justify-center">
      <div 
        class="absolute w-28 h-28 md:w-36 md:h-36 rounded-full blur-md"
        :class="character.bg"
      ></div>
      <img
        v-if="character.src"
        :src="character.src"
        :alt="character.name"
        class="relative w-28 md:w-36 animate-float drop-shadow-xl z-20"
        style="image-rendering: pixelated;"
        :class="{
          'scale-110 transition-transform duration-300': feedback === 'correct',
          'shake': feedback === 'wrong',
        }"
      />
      <!-- Emoji Fallback if no sprite image available -->
      <div 
        v-else 
        class="relative text-[6rem] md:text-[8rem] filter drop-shadow-md animate-float z-20"
        :class="{
          'scale-110 transition-transform duration-300': feedback === 'correct',
          'shake': feedback === 'wrong',
        }"
      >
        {{ character.emoji }}
      </div>
    </div>
  </aside>
</template>
