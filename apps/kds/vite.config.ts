import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  resolve: {
    alias: {
      "react-native": path.resolve(__dirname, "node_modules/react-native-web"),
      "react-native-svg": "react-native-svg-web",
    },
  },
  optimizeDeps: {
    exclude: ["react-native-safe-area-context", "@sous/features"],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 1423,
    strictPort: true,
    host: host || "127.0.0.1",
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1433,
        }
      : {
          protocol: "ws",
          host: "127.0.0.1",
          port: 1433,
        },
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
