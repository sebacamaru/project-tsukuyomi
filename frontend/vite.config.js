import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../public",
  },
  plugins: [
    // VitePWA({
    //   registerType: "autoUpdate",
    //   devOptions: {
    //     enabled: false,
    //   },
    //   workbox: {
    //     globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
    //   },
    //   manifest: {
    //     name: "Chigotama",
    //     short_name: "Chigo",
    //     start_url: "/",
    //     display: "standalone",
    //     background_color: "#ffffff",
    //     theme_color: "#ffcc00",
    //     icons: [
    //       // { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
    //       // { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
    //     ],
    //   },
    // }),
  ],
});
