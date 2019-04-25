import Vue from 'vue'
import Router from 'vue-router'
import navConf from '@/nav.config.json'
import Home from './views/Home.vue'

Vue.use(Router)

let routes = []

Object.keys(navConf).forEach(header => {
  routes = routes.concat(navConf[header])
})


let addComponent = router => {
  router.forEach(route => {
    if (route.items) {
      addComponent(route.items)
      routes = routes.concat(route.items)
    } else {
      if (route.name === 'site-index') {
        route.component = r =>
          require.ensure([], () => r(require(`./docs/introduce.md`)))
      } else {
        route.component = r =>
          require.ensure([], () => r(require(`./docs/${route.name}.md`)))
      }
    }
  })
}
addComponent(routes)

let availableRoutes = routes.filter(item => item.path)

const createRouter = () => new Router({
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

const router = createRouter()
router.addRoutes(availableRoutes)

export default router
