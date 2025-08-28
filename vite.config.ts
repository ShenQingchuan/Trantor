import { env } from 'node:process'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import mkcert from 'vite-plugin-mkcert'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VineVitePlugin as VueVine } from 'vue-vine/vite'

const ToolLibsModules = [
  'nanoid',
  'lodash-es',
  'date-fns',
  'ofetch',
  '@nrsk/unindent',
  'ts-retry',
]
const ProseKitModules = [
  'prosekit',
  'prosemirror-view',
]
const vueLibsModules = [
  'vue',
  'vue-router',
  'pinia',
  'vue-i18n',
  '@pinia/colada',
  '@vueuse/core',
  '@vueuse/motion',
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
        manualChunks: (id: string) => {
          // vendor 分类（优先处理 node_modules）
          if (id.includes('node_modules')) {
            if (vueLibsModules.some(module => id.includes(`node_modules/${module}`)))
              return 'vueLibs'
            if (ProseKitModules.some(module => id.includes(`node_modules/${module}`)))
              return 'prosekit'
            if (ToolLibsModules.some(module => id.includes(`node_modules/${module}`)))
              return 'toolLibs'
          }

          // MyOS 应用分块
          if (id.includes('/src/client/components/MyOS/apps/ChatApp'))
            return 'myos-app-chat'
          if (id.includes('/src/client/components/MyOS/apps/MusicApp'))
            return 'myos-app-music'
          if (id.includes('/src/client/components/MyOS/AboutMyOS'))
            return 'myos-app-about'

          // MyOS 桌面外壳（页面 + 非 apps 组件）
          if (id.includes('/src/client/pages/MyOS.vine'))
            return 'myos-shell'
          if (id.includes('/src/client/components/MyOS/')
            && !id.includes('/src/client/components/MyOS/apps/')) {
            return 'myos-shell'
          }

          // 共享 stores
          if (id.includes('/src/client/stores/'))
            return 'stores-shared'

          // locales
          if (id.includes('/src/client/locales/'))
            return 'locales'
        },
      },
    },
  },
})
