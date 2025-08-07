import { MotionPlugin } from '@vueuse/motion'
import { createApp } from 'vue'
import App from './App.vue'
import { i18n, pinia, router } from './configs'

import 'virtual:uno.css'


const app = createApp(App)

app.use(pinia)
app.use(i18n)
app.use(router)
app.use(MotionPlugin)

app.mount('#app')
