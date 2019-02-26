<template>
  <div class="toolbar">
    <link rel="stylesheet" type="text/css" href="//at.alicdn.com/t/font_598462_3xve1872wizzolxr.css" />
    <i data-command="undo" class="command iconfont icon-undo" title="撤销"></i>
    <i data-command="redo" class="command iconfont icon-redo" title="重做"></i>
    <span class="separator"></span>
    <i data-command="copy" class="command iconfont icon-copy-o" title="复制"></i>
    <i data-command="paste" class="command iconfont icon-paster-o" title="粘贴"></i>
    <i data-command="delete" class="command iconfont icon-delete-o" title="删除"></i>
    <span class="separator"></span>
    <i data-command="zoomIn" class="command iconfont icon-zoom-in-o" title="放大"></i>
    <i data-command="zoomOut" class="command iconfont icon-zoom-out-o" title="缩小"></i>
    <i data-command="autoZoom" class="command iconfont icon-fit" title="适应画布"></i>
    <i data-command="resetZoom" class="command iconfont icon-actual-size-o" title="实际尺寸"></i>
    <span class="separator"></span>
    <i data-command="toBack" class="command iconfont icon-to-back" title="层级后置"></i>
    <i data-command="toFront" class="command iconfont icon-to-front" title="层级前置"></i>
    <span class="separator"></span>
    <i data-command="multiSelect" class="command iconfont icon-select" title="多选"></i>
    <i data-command="addGroup" class="command iconfont icon-group" title="成组"></i>
    <i data-command="unGroup" class="command iconfont icon-ungroup" title="解组"></i>
    <i data-command="save" class="command" title="save">save</i>
    <i data-command="clear" class="command" title="清空画布">clear</i>
  </div>
</template>

<script>

export default {
  name: 'ToolBar',
  props: {
    flow: Object
  },
  methods: {
    // save () {
    //   const data = this.flow.save()
    //   console.log('save', data)
    // }
  }
}
</script>

<style scoped lang="scss">

</style>
