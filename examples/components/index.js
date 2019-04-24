import Vue from 'vue'
import FlowDesign from './flowable/flow-design.vue'
import StencilDragItem from './flowable/stencil-drag-item-template.vue'

const Components = {
  FlowDesign,
  StencilDragItem
}

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name])
})

export default Components
