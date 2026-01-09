import { defineConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ['src/core'],
      exclude: ['vite.config.ts', 'src/tests/**'],
      insertTypesEntry: true,
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json'
    }),
    visualizer({
      open: false,
      filename: 'stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
      sourcemap: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-anno': path.resolve(__dirname, './src/core/index.ts')
    }
  },

  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/core/index.ts'),
      name: 'ReactAnno',
      fileName: (format) => `react-anno.${format}.js`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'lucide-react',
        'tailwind-merge',
        'clsx'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'JSXRuntime',
          'lucide-react': 'LucideReact',
          'tailwind-merge': 'twMerge',
          clsx: 'clsx'
        }
      }
    },
    // 开启压缩体积报告
    reportCompressedSize: true,
    sourcemap: true,
    minify: 'esbuild',
    emptyOutDir: true
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false
  }
})
