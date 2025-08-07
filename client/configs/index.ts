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

export { router }

export const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const i18n = createI18n({
  legacy: false,
  locale: 'zhCN',
  messages: {
    zhCN,
    enUS,
  },
})
