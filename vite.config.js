import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/collage-editor-clean/", // ✅ your GitHub repo name
  plugins: [react()],
  build: {
    minify: "esbuild", // ✅ ensures logs are not stripped
  },
});
