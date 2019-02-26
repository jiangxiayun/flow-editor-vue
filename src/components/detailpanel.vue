<template>
  <div class="detailpanel">
    <div data-status="node-selected" class="pannel">
      <div class="panel-title">节点</div>
      <div class="block-container">
        <nodeEdit :selectedModel="item" @updateGraph="updateGraph"></nodeEdit>

        {colorInput}
      </div>
    </div>
    <div data-status="edge-selected" class="pannel" id="edge_detailpanel">
      <div class="panel-title">边</div>
      <div class="block-container">
        <div class="p">
          名称：
          <nodeEdit :flow="flow"></nodeEdit>
          <!--<el-input v-model="input" placeholder="请输入内容"></el-input>-->
          <!--<Input-->
              <!--size="small"-->
              <!--className="input name-input"-->
              <!--value = {inputingLabel ? inputingLabel : selectedModel.label}-->
              <!--onChange = { ev => {-->
            <!--this.setState({-->
            <!--inputingLabel: ev.target.value-->
            <!--});-->
            <!--}}-->
            <!--onBlur = { ev => {-->
            <!--this.updateGraph('label', ev.target.value);-->
            <!--this.setState({-->
            <!--inputingLabel: null-->
            <!--});-->
            <!--}}-->
            <!--/>-->
        </div>
      </div>
    </div>
    <div data-status="group-selected" class="pannel" id="group_detailpanel">
      <div class="panel-title">组</div>
      <div class="block-container">
        {labelInput}
      </div>
    </div>
    <div data-status="canvas-selected" class="pannel" id="canvas_detailpanel">
      <div class="panel-title">画布</div>
      <div class="block-container">
        <el-checkbox v-model="checked" @change="toggleGrid">网格对齐</el-checkbox>
      </div>
    </div>
    <div data-status="multi-selected" class="pannel" id="multi_detailpanel">
      <div class="panel-title">多选</div>
      <div class="block-container">
        {colorInput}
      </div>
    </div>
  </div>
</template>

<script>
import nodeEdit from '@/components/editInfo/node'

export default {
  name: 'Detailpanel',
  data () {
    return {
      checked: false
    }
  },
  components: { nodeEdit },
  props: {
    editor: Object,
    flow: Object,
    item: Object,
  },
  methods: {
    toggleGrid(ev) {
      if (ev) {
        this.flow.showGrid();
      } else {
        this.flow.hideGrid();
      }
    },
    updateGraph({key, value}) {
      // 执行命令
      this.editor.executeCommand(() => {
        const selectedItems = this.flow.getSelected(); // 获取选中图项集
        selectedItems.forEach(item => {
          const updateModel = {};
          updateModel[key] = value;
          this.flow.update(item, updateModel); // 更新项
        });
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
