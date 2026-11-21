import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rootDir = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: '@shared', replacement: path.resolve(rootDir, '../shared') },
      { find: '@', replacement: path.resolve(rootDir, './src') },
      { find: /^react$/, replacement: path.resolve(rootDir, './node_modules/react/index.js') },
      { find: /^react\/(.*)$/, replacement: path.resolve(rootDir, './node_modules/react/$1') },
      { find: /^react-dom$/, replacement: path.resolve(rootDir, './node_modules/react-dom/index.js') },
      { find: /^react-dom\/(.*)$/, replacement: path.resolve(rootDir, './node_modules/react-dom/$1') },
      { find: /^lucide-react$/, replacement: path.resolve(rootDir, './node_modules/lucide-react') },
      { find: /^axios$/, replacement: path.resolve(rootDir, './node_modules/axios') },
      { find: /^socket\.io-client$/, replacement: path.resolve(rootDir, './node_modules/socket.io-client') },
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) return 'vendor-react';
          if (id.includes('socket.io')) return 'vendor-socket';
          if (id.includes('lucide-react')) return 'vendor-icons';
        },
      },
    },
  },
  server: {
    port: 5175,
    fs: { allow: ['..'] },
    proxy: {
      '/socket.io': { target: 'http://localhost:3000', ws: true, changeOrigin: true },
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
})
   