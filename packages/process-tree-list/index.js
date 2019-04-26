import processTreeList from './src/main.vue'

processTreeList.install = function (Vue) {
  Vue.component(processTreeList.name, processTreeList)
}

export default processTreeList
