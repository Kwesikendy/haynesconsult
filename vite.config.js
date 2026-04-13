import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        webDev: resolve(__dirname, 'services/web-development.html'),
        aiAuto: resolve(__dirname, 'services/ai-automation.html'),
        digitalMkt: resolve(__dirname, 'services/digital-marketing.html'),
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['gsap', 'lenis']
  }
})

