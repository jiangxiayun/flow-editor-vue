<template>
  <div>
    <div data-status="node-selected" class="panel">
      <div class="panel-title">节点</div>
      <div class="block-container">
        {labelInput}
        <div class="p">
          尺寸：
          <InputNumber
              size="small"
              value={width} class="input width-input"
              onChange={ value => {
            const newSize = value + '*' + height;
            selectedModel.size = newSize;
            this.setState({
            selectedModel
            });
            this.updateGraph('size', newSize);
            } }/>
            <InputNumber
                size="small"
                value={height} class="input height-input"
                onChange={ value => {
              const newSize = width + '*' + value;
              selectedModel.size = newSize;
              this.setState({
              selectedModel
              });
              this.updateGraph('size', newSize);
              } }/>
        </div>
        {colorInput}
      </div>
    </div>
    <div data-status="edge-selected" class="panel" id="edge_detailpanel">
      <div class="panel-title">边</div>
      <div class="block-container">
        {labelInput}
      </div>
    </div>
    <div data-status="group-selected" class="panel" id="group_detailpanel">
      <div class="panel-title">组</div>
      <div class="block-container">
        {labelInput}
      </div>
    </div>
    <div data-status="canvas-selected" class="panel" id="canvas_detailpanel">
      <div class="panel-title">画布</div>
      <div class="block-container">
        <Checkbox onChange={ this.toggleGrid.bind(this) } >网格对齐</Checkbox>
      </div>
    </div>
    <div data-status="multi-selected" class="panel" id="multi_detailpanel">
      <div class="panel-title">多选</div>
      <div class="block-container">
        {colorInput}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Detailpanel',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
