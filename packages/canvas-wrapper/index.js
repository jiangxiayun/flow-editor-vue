import canvasWrapper from './src/main.vue'

canvasWrapper.install = function (Vue) {
  Vue.component(canvasWrapper.name, canvasWrapper)
}

export default canvasWrapper
