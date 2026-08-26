
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    watch: {
      ignored: ["**/src-tauri/target/**"],
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": import.meta.dirname + "/src",
    },
  },
});
