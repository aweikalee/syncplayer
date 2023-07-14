import { createApp } from 'vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style.less'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)

app.use(router)
app.mount('#app')
