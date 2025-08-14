import type { App } from 'vue'
import { PiniaColada } from '@pinia/colada'
import { MotionPlugin } from '@vueuse/motion'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createI18n } from 'vue-i18n'

import enUS from '../locales/enUS'
import zhCN from '../locales/zhCN'
import router from './routes'

import '@unocss/reset/tailwind.css'
import '../styles/transitions.scss'
import '../styles/app.css'
import '../styles/colors.css'

export function setupApp(app: App) {
  const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('trantor:locale') || 'zhCN',
    messages: {
      zhCN,
      enUS,
    },
  })

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)

  app
    .use(router)
    .use(pinia)
    .use(PiniaColada)
    .use(i18n)
    .use(MotionPlugin)

  return app
}
