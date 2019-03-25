import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/design/kpm/1',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/list',
      name: 'list',
      component: () => import('./views/Home.vue')
    },
    {
      path: '/design/kpm/:id',
      name: 'design-kpm',
      component: () => import('./views/Design-kpm.vue')
    },
    {
      path: '/design/bpm/:id',
      name: 'design-bpm',
      component: () => import('./views/Design.vue')
    }
  ]
})
