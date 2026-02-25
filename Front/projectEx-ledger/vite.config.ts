import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; //필수

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), //필수
  ],
});



