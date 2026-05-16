<script setup>
/**
 * PWAInstallPrompt.vue
 *
 * Shows a styled "Add to Home Screen" banner after 60 seconds on the page.
 * Uses the beforeinstallprompt browser event captured and exposed by vite-plugin-pwa's
 * useRegisterSW / virtual:pwa-register/vue.
 *
 * Props:
 *   show (Boolean) — parent controls visibility (set true after 60s timer fires)
 *
 * Emits:
 *   install — user tapped Install; parent should call deferredPrompt.prompt()
 *   dismiss — user tapped Not Now
 */

defineProps({
  show: { type: Boolean, default: false },
})

defineEmits(['install', 'dismiss'])
</script>

<template>
  <Transition name="pwa-slide">
    <div
      v-if="show"
      class="pwa-banner"
      role="dialog"
      aria-modal="false"
      aria-label="Install Emma's Star World"
    >
      <div class="pwa-icon-wrap">
        <img src="/pwa-192x192.png" alt="Emma's Star World icon" class="pwa-icon" />
      </div>

      <div class="pwa-text">
        <p class="pwa-title">Play Offline! 🌟</p>
        <p class="pwa-sub">Install Emma's Star World on your device</p>
      </div>

      <div class="pwa-actions">
        <button
          id="btn-pwa-install"
          class="pwa-btn-install btn-press"
          aria-label="Install app"
          @click="$emit('install')"
        >
          Install
        </button>
        <button
          id="btn-pwa-dismiss"
          class="pwa-btn-dismiss btn-press"
          aria-label="Dismiss install prompt"
          @click="$emit('dismiss')"
        >
          Not now
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Banner ───────────────────────────────────────────────────── */
.pwa-banner {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 400;
  width: calc(100% - 2rem);
  max-width: 420px;

  display: flex;
  align-items: center;
  gap: 0.75rem;

  background: #1a1a2e;
  border: 3px solid #ffd700;
  border-radius: 1.25rem;
  box-shadow:
    0 0 0 1px #e52521,
    0 8px 32px rgba(0, 0, 0, 0.6);
  padding: 0.85rem 1rem;
}

/* ── Icon ─────────────────────────────────────────────────────── */
.pwa-icon-wrap {
  flex-shrink: 0;
}
.pwa-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid #ffd700;
  image-rendering: pixelated;
}

/* ── Text ─────────────────────────────────────────────────────── */
.pwa-text {
  flex: 1;
  min-width: 0;
}
.pwa-title {
  font-size: 0.95rem;
  font-weight: 900;
  color: #ffd700;
  text-shadow: 1px 1px 0 #000;
  margin: 0 0 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pwa-sub {
  font-size: 0.75rem;
  font-weight: 600;
  color: #c8c8e8;
  margin: 0;
  line-height: 1.3;
}

/* ── Actions ──────────────────────────────────────────────────── */
.pwa-actions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex-shrink: 0;
}

.pwa-btn-install {
  background: #ffd700;
  color: #1a1a2e;
  border: 2px solid #1a1a2e;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  font-weight: 900;
  padding: 0.35rem 0.85rem;
  cursor: pointer;
  box-shadow: 0 3px 0 #b8860b;
  transition: transform 0.1s, box-shadow 0.1s;
  white-space: nowrap;
}
.pwa-btn-install:hover { transform: scale(1.05); }
.pwa-btn-install:active { transform: scale(0.95); box-shadow: none; }

.pwa-btn-dismiss {
  background: transparent;
  color: #8888aa;
  border: 1.5px solid #444466;
  border-radius: 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.85rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.pwa-btn-dismiss:hover { color: #c8c8e8; border-color: #888; }

/* ── Transition ───────────────────────────────────────────────── */
.pwa-slide-enter-active,
.pwa-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.pwa-slide-enter-from,
.pwa-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1.5rem);
}
</style>
