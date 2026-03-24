import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  base: "/inkfinity/",
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png"],
      manifest: {
        name: "PrintFlow — India's Smartest Printing Platform",
        short_name: "PrintFlow",
        description: "Upload your design and get professional prints from local shops",
        start_url: "./",
        scope: "/inkfinity/",
        display: "standalone",
        background_color: "#f7f4ef",
        theme_color: "#e8613a",
        orientation: "portrait-primary",
        icons: [
          { src: "/favicon.png", sizes: "512x512", type: "image/png" },
        ],
        categories: ["business", "productivity", "shopping"],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: { cacheName: "supabase-api", expiration: { maxEntries: 50, maxAgeSeconds: 300 } },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
