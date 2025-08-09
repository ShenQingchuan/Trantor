import { createApp } from 'vue'
import App from './App.vue'
import { setupApp } from './configs'

import 'virtual:uno.css'

const app = createApp(App)
setupApp(app).mount('#app')
