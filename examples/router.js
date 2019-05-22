import Vue from 'vue'
import Router from 'vue-router'
import navConf from '@/nav.config.json'
import Home from './views/Home.vue'

Vue.use(Router)

let routes = []

Object.keys(navConf).forEach(header => {
  routes = routes.concat(navConf[header])
})


const addComponent = (router, prefix = '/docs') => {
  router.forEach(route => {
    if (route.items) {
      addComponent(route.items, prefix + (route.path || ''))
      routes = routes.concat(route.items)
    } else {
      if (route.path) {
        route.path = prefix + route.path
      }
      route.component = r =>
        require.ensure([], () => r(require(`./docs/${route.name}.md`)))
    }
  })
}
addComponent(routes)

// let availableRoutes = routes.filter(item => item.path)
let availableRoutes = [{
  path: '/docs',
  name: 'docs',
  redirect: '/docs/introduce',
  component: () => import('./docs/docs.vue'),
  children: routes.filter(item => item.path)
}]

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
      component: () => import('./views/list.vue')
    },
    {
      path: '/view',
      name: 'view',
      component: () => import('./views/view.vue')
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
    },
    // {
    //   path: '/docs',
    //   name: 'docs',
    //   redirect: '/docs/introduce',
    //   // component: { render (c) { return c('router-view') } },
    //   component: () => import('./docs/docs.vue'),
    //   children: [
    //     {
    //       path: 'introduce',
    //       name: 'introduce',
    //       component: () => import('./docs/introduce.md')
    //     }
    //   ]
    // }
  ]
})

const router = createRouter()
router.addRoutes(availableRoutes)

export default router
