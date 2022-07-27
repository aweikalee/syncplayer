import { RouteRecordRaw } from 'vue-router'

import Home from '@/views/Home.vue'
import Room from '@/views/Room.vue'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/room/:id',
    name: 'Room',
    component: Room,
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]
