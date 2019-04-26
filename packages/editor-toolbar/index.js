import editorToolbar from './src/main.vue'

editorToolbar.install = function (Vue) {
  Vue.component(editorToolbar.name, editorToolbar)
}

export default editorToolbar
