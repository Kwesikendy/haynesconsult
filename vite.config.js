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
        academy: resolve(__dirname, 'academy.html'),
        about: resolve(__dirname, 'about.html'),
        senyah: resolve(__dirname, 'dr-senyah.html'),
        cases: resolve(__dirname, 'case-studies.html'),
        webDev: resolve(__dirname, 'services/web-development.html'),
        aiAuto: resolve(__dirname, 'services/ai-automation.html'),
        digitalMkt: resolve(__dirname, 'services/digital-marketing.html'),
        digitalSvc: resolve(__dirname, 'services/digital-services.html'),
        login: resolve(__dirname, 'login.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['gsap', 'lenis']
  }
})

