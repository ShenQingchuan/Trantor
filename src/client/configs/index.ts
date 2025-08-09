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
  const pinia = createPinia()
  const i18n = createI18n({
    legacy: false,
    locale: 'zhCN',
    messages: {
      zhCN,
      enUS,
    },
  })

  app.use(router)

  app.use(pinia)
  pinia.use(piniaPluginPersistedstate)

  app.use(PiniaColada)

  app.use(i18n)
  app.use(MotionPlugin)

  return app
}
