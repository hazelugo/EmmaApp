<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show:    { type: Boolean, default: false },
  isMuted: { type: Boolean, default: false },
  volume:  { type: Number,  default: 0.7 },
})

const emit = defineEmits(['close', 'toggle-mute', 'set-volume'])

// Local slider value mirrors prop; updated on input for smooth UX
const localVolume = ref(props.volume)
watch(() => props.volume, v => { localVolume.value = v })

function onSliderInput (e) {
  const v = Number(e.target.value)
  localVolume.value = v
  emit('set-volume', v)
}

function onClose () {
  emit('close')
}

// Auto-focus slider when overlay opens
const sliderRef = ref(null)
watch(() => props.show, (val) => {
  if (val) {
    // Wait for transition before focusing
    setTimeout(() => sliderRef.value?.focus(), 50)
  }
})
</script>

<template>
  <Transition name="settings-fade">
    <div
      v-if="show"
      class="settings-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Sound Settings"
      @click.self="onClose"
    >
      <div class="settings-panel">

        <!-- Header -->
        <div class="settings-header">
          <h2 class="settings-title">🎵 Sound Settings</h2>
          <button
            class="settings-close btn-press"
            aria-label="Close sound settings"
            @click="onClose"
          >✕</button>
        </div>

        <!-- Mute Toggle Row -->
        <div class="setting-row">
          <span class="setting-label">Sound</span>
          <button
            id="btn-sound-toggle"
            class="mute-btn btn-press"
            :class="isMuted ? 'muted' : 'active'"
            :aria-pressed="isMuted"
            :aria-label="isMuted ? 'Unmute sound' : 'Mute sound'"
            @click="emit('toggle-mute')"
          >
            <span class="mute-icon">{{ isMuted ? '🔇' : '🔊' }}</span>
            <span class="mute-label">{{ isMuted ? 'Muted' : 'On' }}</span>
          </button>
        </div>

        <!-- Volume Slider Row -->
        <div class="setting-row" :class="{ dimmed: isMuted }">
          <label for="volume-slider" class="setting-label">Volume</label>
          <div class="slider-wrapper">
            <input
              id="volume-slider"
              ref="sliderRef"
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="localVolume"
              :disabled="isMuted"
              class="volume-slider"
              :aria-label="`Volume: ${Math.round(localVolume * 100)}%`"
              @input="onSliderInput"
            />
            <span class="volume-percent">{{ Math.round(localVolume * 100) }}%</span>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Backdrop ─────────────────────────────────────────────────── */
.settings-backdrop {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* ── Panel ────────────────────────────────────────────────────── */
.settings-panel {
  background: #e52521;                     /* Mario red */
  border: 4px solid #1a1a2e;
  border-radius: 1.25rem;
  box-shadow:
    0 0 0 2px #ffd700,                     /* gold border ring */
    0 8px 32px rgba(0, 0, 0, 0.5);
  padding: 1.5rem 1.75rem 1.75rem;
  min-width: 290px;
  max-width: 360px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Header ───────────────────────────────────────────────────── */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.settings-title {
  font-size: 1.25rem;
  font-weight: 900;
  color: #ffd700;
  text-shadow: 2px 2px 0 #1a1a2e;
  letter-spacing: 0.03em;
  margin: 0;
}

.settings-close {
  background: #1a1a2e;
  border: 2px solid #ffd700;
  border-radius: 0.5rem;
  color: #ffd700;
  font-size: 1rem;
  font-weight: 900;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.settings-close:hover { background: #ffd700; color: #1a1a2e; }

/* ── Setting Row ──────────────────────────────────────────────── */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  transition: opacity 0.2s;
}
.setting-row.dimmed { opacity: 0.45; pointer-events: none; }

.setting-label {
  font-size: 1rem;
  font-weight: 800;
  color: #fff8dc;
  text-shadow: 1px 1px 0 #1a1a2e;
  min-width: 64px;
}

/* ── Mute Button ──────────────────────────────────────────────── */
.mute-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 0.75rem;
  border: 2px solid #1a1a2e;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, box-shadow 0.1s;
}
.mute-btn.active {
  background: #ffd700;
  color: #1a1a2e;
  box-shadow: 0 3px 0 #b8860b;
}
.mute-btn.muted {
  background: #1a1a2e;
  color: #aaa;
  box-shadow: 0 3px 0 #000;
}
.mute-btn:hover { transform: scale(1.05); }
.mute-btn:active { transform: scale(0.95); box-shadow: none; }

.mute-icon { font-size: 1.1rem; }
.mute-label { letter-spacing: 0.02em; }

/* ── Slider ───────────────────────────────────────────────────── */
.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
}

.volume-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 4px;
  background: #1a1a2e;
  outline: none;
  cursor: pointer;
  border: 1.5px solid #ffd700;
}

/* Thumb — Chrome/Safari */
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ffd700;
  border: 3px solid #1a1a2e;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  transition: transform 0.12s, box-shadow 0.12s;
}
.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.35);
}

/* Thumb — Firefox */
.volume-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ffd700;
  border: 3px solid #1a1a2e;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  transition: transform 0.12s;
}
.volume-slider::-moz-range-thumb:hover { transform: scale(1.2); }

.volume-slider:disabled { cursor: not-allowed; }

.volume-percent {
  font-size: 0.85rem;
  font-weight: 800;
  color: #ffd700;
  text-shadow: 1px 1px 0 #1a1a2e;
  min-width: 38px;
  text-align: right;
}



/* ── Transition ───────────────────────────────────────────────── */
.settings-fade-enter-active,
.settings-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.settings-fade-enter-from,
.settings-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.97);
}
</style>
