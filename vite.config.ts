import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import smd from "solid-markdown"

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [smd]
    }
  },
});
