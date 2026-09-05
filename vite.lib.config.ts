import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * Library build for the Oasis design system (src/ds).
 *
 * Separate from vite.config.ts, which builds the Figma Make *app*. This one
 * emits an importable ES module plus a single stylesheet, which is what
 * design-system consumers — and the claude.ai/design sync — need.
 *
 *   pnpm build:ds  ->  dist-ds/oasis-ds.js + dist-ds/oasis-ds.css + *.d.ts
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'dist-ds',
    emptyOutDir: true,
    // One stylesheet for the whole system — the tokens and the component
    // classes are a single unit and splitting them breaks the cascade.
    cssCodeSplit: false,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/ds/index.ts'),
      name: 'OasisDS',
      formats: ['es'],
      fileName: () => 'oasis-ds.js',
      cssFileName: 'oasis-ds',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  },
})
