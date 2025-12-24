import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    // Ensure proper module resolution for React
    dedupe: ['react', 'react-dom']
  },
  // PostCSS is configured in postcss.config.cjs (prefer that over inline config)
  css: {},
  // Memory-saving optimizations
  optimizeDeps: {
    // Enable pre-bundling but with minimal entries to reduce memory usage
    entries: ['src/main.tsx'],
    // Force include React and JSX runtime in pre-bundling (required for JSX to work)
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@tanstack/react-query'
    ],
    // Exclude heavy dependencies from pre-bundling
    exclude: ['@tanstack/react-query-devtools'],
    // Keep esbuild options conservative
    esbuildOptions: {
      target: 'es2020',
      jsx: 'automatic'
    },
    // Skip lockfile-based optimization to avoid I/O errors
    holdUntilCrawlEnd: false,
    // Force re-optimization to avoid stale cache - ensures changes reflect immediately
    force: true
  },
  build: {
    // Memory-saving build options
    target: 'es2020',
    minify: 'esbuild', // Faster and less memory-intensive than terser
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking to reduce memory usage
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Proxy API requests to backend
    // In Docker, the backend is accessible via service name 'api'
    // Locally, it's accessible via 'localhost'
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path, // Don't rewrite, keep /api prefix
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 [Vite Proxy] Error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 [Vite Proxy] Proxying:', req.method, req.url, '→', proxyReq.path);
          });
        },
      },
    },
    hmr: {
      port: 5173,
      host: 'localhost',
      protocol: 'ws',
      clientPort: 5173,
      // Improve HMR stability in Docker
      overlay: true
    },
    fs: {
      allow: [path.resolve(__dirname)]
    },
    watch: {
      usePolling: true,
      interval: 1000, // Reduced from 3000ms for faster hot reload
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/Dockerfile',
        '**/.viteignore',
        '**/.dockerignore',
        '**/docker-compose.yml',
        '**/*.log',
        '**/package-lock.json' // Ignore lockfile to avoid I/O errors
      ]
    },
    // Disable caching in development - force browser to always fetch fresh files
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  // Disable features that require file system access to lockfiles
  clearScreen: false,
  logLevel: 'info', // Changed to info to see HMR messages
  // Enable better hot reload
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
