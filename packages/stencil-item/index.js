import stencilItem from './src/main.vue'

stencilItem.install = function (Vue) {
  Vue.component(stencilItem.name, stencilItem)
}

export default stencilItem
