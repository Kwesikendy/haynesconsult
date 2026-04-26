// vite.config.js
import { defineConfig } from "file:///D:/Haynes/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "D:\\Haynes";
var vite_config_default = defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: resolve(__vite_injected_original_dirname, "index.html"),
        academy: resolve(__vite_injected_original_dirname, "academy.html"),
        about: resolve(__vite_injected_original_dirname, "about.html"),
        senyah: resolve(__vite_injected_original_dirname, "dr-senyah.html"),
        cases: resolve(__vite_injected_original_dirname, "case-studies.html"),
        webDev: resolve(__vite_injected_original_dirname, "services/web-development.html"),
        aiAuto: resolve(__vite_injected_original_dirname, "services/ai-automation.html"),
        digitalMkt: resolve(__vite_injected_original_dirname, "services/digital-marketing.html"),
        digitalSvc: resolve(__vite_injected_original_dirname, "services/digital-services.html"),
        login: resolve(__vite_injected_original_dirname, "login.html"),
        admin: resolve(__vite_injected_original_dirname, "admin.html")
      }
    }
  },
  server: {
    port: 3e3,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ["gsap", "lenis"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxIYXluZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEhheW5lc1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovSGF5bmVzL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByb290OiAnLicsXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBtYWluOiByZXNvbHZlKF9fZGlybmFtZSwgJ2luZGV4Lmh0bWwnKSxcbiAgICAgICAgYWNhZGVteTogcmVzb2x2ZShfX2Rpcm5hbWUsICdhY2FkZW15Lmh0bWwnKSxcbiAgICAgICAgYWJvdXQ6IHJlc29sdmUoX19kaXJuYW1lLCAnYWJvdXQuaHRtbCcpLFxuICAgICAgICBzZW55YWg6IHJlc29sdmUoX19kaXJuYW1lLCAnZHItc2VueWFoLmh0bWwnKSxcbiAgICAgICAgY2FzZXM6IHJlc29sdmUoX19kaXJuYW1lLCAnY2FzZS1zdHVkaWVzLmh0bWwnKSxcbiAgICAgICAgd2ViRGV2OiByZXNvbHZlKF9fZGlybmFtZSwgJ3NlcnZpY2VzL3dlYi1kZXZlbG9wbWVudC5odG1sJyksXG4gICAgICAgIGFpQXV0bzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzZXJ2aWNlcy9haS1hdXRvbWF0aW9uLmh0bWwnKSxcbiAgICAgICAgZGlnaXRhbE1rdDogcmVzb2x2ZShfX2Rpcm5hbWUsICdzZXJ2aWNlcy9kaWdpdGFsLW1hcmtldGluZy5odG1sJyksXG4gICAgICAgIGRpZ2l0YWxTdmM6IHJlc29sdmUoX19kaXJuYW1lLCAnc2VydmljZXMvZGlnaXRhbC1zZXJ2aWNlcy5odG1sJyksXG4gICAgICAgIGxvZ2luOiByZXNvbHZlKF9fZGlybmFtZSwgJ2xvZ2luLmh0bWwnKSxcbiAgICAgICAgYWRtaW46IHJlc29sdmUoX19kaXJuYW1lLCAnYWRtaW4uaHRtbCcpXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIG9wZW46IHRydWUsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDEnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsnZ3NhcCcsICdsZW5pcyddXG4gIH1cbn0pXG5cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaU4sU0FBUyxvQkFBb0I7QUFDOU8sU0FBUyxlQUFlO0FBRHhCLElBQU0sbUNBQW1DO0FBR3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQSxRQUNMLE1BQU0sUUFBUSxrQ0FBVyxZQUFZO0FBQUEsUUFDckMsU0FBUyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxRQUMxQyxPQUFPLFFBQVEsa0NBQVcsWUFBWTtBQUFBLFFBQ3RDLFFBQVEsUUFBUSxrQ0FBVyxnQkFBZ0I7QUFBQSxRQUMzQyxPQUFPLFFBQVEsa0NBQVcsbUJBQW1CO0FBQUEsUUFDN0MsUUFBUSxRQUFRLGtDQUFXLCtCQUErQjtBQUFBLFFBQzFELFFBQVEsUUFBUSxrQ0FBVyw2QkFBNkI7QUFBQSxRQUN4RCxZQUFZLFFBQVEsa0NBQVcsaUNBQWlDO0FBQUEsUUFDaEUsWUFBWSxRQUFRLGtDQUFXLGdDQUFnQztBQUFBLFFBQy9ELE9BQU8sUUFBUSxrQ0FBVyxZQUFZO0FBQUEsUUFDdEMsT0FBTyxRQUFRLGtDQUFXLFlBQVk7QUFBQSxNQUN4QztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLFFBQVEsT0FBTztBQUFBLEVBQzNCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
