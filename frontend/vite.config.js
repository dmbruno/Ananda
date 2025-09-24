import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: '/', 
  plugins: [react()],
  server: {
    port: 5173, // Forzar puerto 5173
    host: 'localhost',
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
    },
  },
});
