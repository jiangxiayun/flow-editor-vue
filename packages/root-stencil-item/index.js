import rootStencilTtem from './src/main.vue'

rootStencilTtem.install = function (Vue) {
  Vue.component(rootStencilTtem.name, rootStencilTtem)
}

export default rootStencilTtem
