import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@koti-scout/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@koti-scout/property-engine": path.resolve(__dirname, "../../packages/property-engine/src"),
      "@koti-scout/database": path.resolve(__dirname, "../../packages/database/src")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      },
      "/internal": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
