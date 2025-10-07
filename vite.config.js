// vite.config.js
// Vite configuration file to enable browser compatibility for Node.js globals and alias resolution.
// Polyfills 'buffer' to resolve ReferenceError: Buffer is not defined in Solana SDK.
// Defines '@/' alias for src/ directory to resolve local imports.

import { defineConfig } from 'vite';

export default defineConfig({
  // Define global variables for browser compatibility
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    global: 'globalThis', // Ensure 'global' is defined (some libs expect it)
  },
  // Resolve Node.js built-ins and local aliases
  resolve: {
    alias: {
      // Map '@/' to the src/ directory
      '@': '/src',
      // Alias 'buffer' to the installed package
      buffer: 'buffer',
    },
  },
  // Optimize dependencies and inject polyfills
  optimizeDeps: {
    esbuildOptions: {
      // Define globals for esbuild to avoid externalization issues
      define: {
        global: 'globalThis',
      },
    },
  },
});