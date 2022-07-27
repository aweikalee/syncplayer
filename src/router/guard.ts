import { Router } from 'vue-router'

export function guard(router: Router) {
  router.beforeEach((to, from, next) => {
    if (to.name === 'Room') {
      if (to.params?.id?.length > 32) {
        alert('无效的房间号')
        return next({
          name: 'Home',
        })
      }
    }

    return next()
  })
}
