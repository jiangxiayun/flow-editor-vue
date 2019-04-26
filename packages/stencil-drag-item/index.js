import stencilDragItem from './src/main.vue'

stencilDragItem.install = function (Vue) {
  Vue.component(stencilDragItem.name, stencilDragItem)
}

export default stencilDragItem
