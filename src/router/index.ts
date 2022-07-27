import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { guard } from './guard'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

guard(router)
