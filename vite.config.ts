import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3001,
      host: "0.0.0.0",
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
        manifest: {
          name: "Meu App",
          short_name: "MeuApp",
          description: "Um app PWA em React + Vite",
          theme_color: "#6366f1",
          background_color: "#6366f1",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "pwa-film-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-film-512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "pwa-film-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
      }),
    ],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
