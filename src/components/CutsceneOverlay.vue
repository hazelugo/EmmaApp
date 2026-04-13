<template>
  <div class="fixed inset-0 z-50 bg-black flex items-center justify-center">
    <video 
      :src="videoSrc" 
      autoplay 
      playsinline 
      muted 
      class="w-full h-full object-contain"
      @ended="handleEnded"
    ></video>
    
    <button 
      @click="skipVideo"
      class="absolute bottom-6 right-6 px-6 py-3 bg-white/20 hover:bg-white/40 text-white font-bold rounded-full backdrop-blur-md cursor-pointer transition-colors"
    >
      Skip
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  videoSrc: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['ended']);

const handleEnded = () => {
  emit('ended');
};

const skipVideo = () => {
  emit('ended');
};
</script>
