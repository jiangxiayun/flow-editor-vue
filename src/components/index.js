import Vue from 'vue'
import FlowDesign from './flowable/flow-design.vue'
const Components = {
  FlowDesign
}

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name])
})

export default Components

