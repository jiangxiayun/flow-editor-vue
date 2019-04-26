import paletteWrapper from './src/main.vue'

paletteWrapper.install = function (Vue) {
  Vue.component(paletteWrapper.name, paletteWrapper)
}

export default paletteWrapper
