<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  active:   { type: Boolean, default: false },
  itemName: { type: String,  default: ''    },
})
const emit = defineEmits(['undo', 'expired'])

const countdown = ref(10)
let interval = null

function stopCountdown () {
  if (interval !== null) {
    clearInterval(interval)
    interval = null
  }
}

function startCountdown () {
  stopCountdown()
  countdown.value = 10
  interval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      stopCountdown()
      emit('expired')
    }
  }, 1000)
}

watch(() => props.active, (val) => {
  if (val) startCountdown()
  else stopCountdown()
})

onUnmounted(stopCountdown)

function onUndoTap () {
  stopCountdown()
  emit('undo')
}
</script>

<template>
  <Transition name="undo-fade">
    <div
      v-if="active"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[210]
             bg-dark text-mushroom-white block-border rounded-2xl
             px-6 py-4 flex items-center gap-4 min-w-[280px] max-w-[90vw]"
      role="status"
      aria-live="polite"
    >
      <span class="font-bold flex-1 text-base">
        {{ itemName ? `Undo ${itemName}?` : 'Undo purchase?' }} ({{ countdown }}s)
      </span>
      <button
        type="button"
        class="btn-press bg-mario-red text-mushroom-white font-black
               rounded-xl px-4 py-2 border-2 border-dark min-h-[44px]"
        aria-label="Undo purchase"
        @click="onUndoTap"
      >
        UNDO
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.undo-fade-enter-active,
.undo-fade-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.undo-fade-enter-from,
.undo-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
.undo-fade-enter-to,
.undo-fade-leave-from {
  opacity: 1;
  transform: translate(-50%, 0);
}
</style>
