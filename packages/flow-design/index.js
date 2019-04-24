// 导入组件，组件必须声明 name
import flowEditor from './src/flow-design.vue'

// 为组件提供 install 安装方法，供按需引入
flowEditor.install = function (Vue) {
  Vue.component(flowEditor.name, flowEditor)
}

// 默认导出组件
export default flowEditor
