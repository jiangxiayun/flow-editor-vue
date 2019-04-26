import propertySection from './src/main.vue'

propertySection.install = function (Vue) {
  Vue.component(propertySection.name, propertySection)
}

export default propertySection
