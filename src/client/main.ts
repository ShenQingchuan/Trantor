import { createApp } from 'vue'
import { App } from './App.vine'
import { setupApp } from './configs'

import 'virtual:uno.css'

const app = createApp(App)
setupApp(app).mount('#app')
