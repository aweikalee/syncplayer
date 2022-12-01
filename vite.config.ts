import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/socket.io': 'ws://localhost:4000',
      '/danmu': 'http://localhost:4000',
    },
  },

  resolve: {
    alias: [{ find: '@', replacement: path.join(__dirname, 'src') }],
  },

  plugins: [
    vue(),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
      ],

      imports: ['vue'],
      dts: 'src/auto-imports.d.ts',
    }),
  ],
})
