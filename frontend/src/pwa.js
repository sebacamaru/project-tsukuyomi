import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  immediate: true,
  onRegistered(registration) {
    console.log("✅ Service Worker registrado:", registration);
  },
  onRegisterError(error) {
    console.error("❌ Error registrando Service Worker:", error);
  },
  onNeedRefresh() {
    console.log("🔄 New content available — reload?");
  },
  onOfflineReady() {
    console.warn("✨ App ready offline!");
  },
});
