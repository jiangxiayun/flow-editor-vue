// 整合所有的组件，对外导出，即一个完整的组件库

import flowEditor from '../packages/flow-design'
import canvasWrapper from '../packages/canvas-wrapper'
import propertySection from '../packages/property-section'
import paletteWrapper from '../packages/palette-wrapper'
import editorToolbar from '../packages/editor-toolbar'
import processTreeList from '../packages/process-tree-list'
import rootStencilTtem from '../packages/root-stencil-item'
import stencilItem from '../packages/stencil-item'
import stencilDragItem from '../packages/stencil-drag-item'


// 存储组件列表
const components = [
  flowEditor,
  canvasWrapper,
  propertySection,
  paletteWrapper,
  editorToolbar,
  processTreeList,
  rootStencilTtem,
  stencilItem,
  stencilDragItem
]

// 定义 install 方法，接收 Vue 作为参数。如果使用 use 注册插件，则所有的组件都将被注册
const install = function (Vue) {
  // 判断是否安装
  if (install.installed) return
  // 遍历注册全局组件
  components.map(component => Vue.component(component.name, component))
}

// 判断是否是直接引入文件
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  // 导出的对象必须具有 install，才能被 Vue.use() 方法安装
  install,
  // 以下是具体的组件列表
  flowEditor,
  canvasWrapper,
  propertySection,
  paletteWrapper,
  editorToolbar,
  processTreeList,
  rootStencilTtem,
  stencilItem,
  stencilDragItem
}
