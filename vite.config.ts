import { env } from 'node:process'
import vue from '@vitejs/plugin-vue'
import { config } from 'dotenv'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import mkcert from 'vite-plugin-mkcert'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VineVitePlugin as VueVine } from 'vue-vine/vite'

if (env.NODE_ENV === 'development') {
  config({ path: '.env.local' })
}

const ToolLibsModules = [
  'nanoid',
  'naive-ui',
  'lodash-es',
  'date-fns',
  'ofetch',
  '@nrsk/unindent',
  'ts-retry',
]

// https://vite.dev/config/
export default defineConfig({
  clearScreen: false,
  plugins: [
    vue(),
    mkcert(),
    VueVine(),
    vueDevTools(),
    Inspect(),
    UnoCSS(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
      dirs: [
        'client/components',
        'client/composables',
      ],
      dts: './src/client/auto-imports.d.ts',
    }),
  ],
  server: {
    https: {},
    proxy: {
      '/api': `http://localhost:${env.SERVER_HTTP_PORT}`,
    },
  },
  build: {
    outDir: './dist/static',
    rollupOptions: {
      output: {
        manualChunks: {
          toolLibs: ToolLibsModules,
        },
      },
    },
  },
})
