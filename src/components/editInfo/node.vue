<template>
  <div>
    <div class="p">
      名称
      <el-input v-model="selectedModel.label" placeholder="请输入内容" size="mini"
                @blur="$emit('updateGraph', {key: 'label', value: selectedModel.label})"></el-input>
    </div>
    <div class="p">
      尺寸：
      <el-input-number v-model="width" controls-position="right" size="small"
                       @change="$emit('updateGraph', {key: 'size', value: newSize})">
      </el-input-number>
      <el-input-number v-model="height" controls-position="right" size="small"
                       @change="$emit('updateGraph', {key: 'size', value: newSize})">
      </el-input-number>
    </div>
  </div>

</template>

<script>

export default {
  name: 'nodeEdit',
  props: {
    selectedModel: {
      type: Object,
      default: function () {
        return {}
      }
    }
},
  data () {
    return {
      inputingLabel: null,
      width: 0,
      height: 0
    }
  },
  computed: {
    newSize () {
      return this.width + '*' + this.height
    }
  },
  watch: {
    'selectedModel.size' (newSize) {
      const splitSize = newSize.split('*')
      this.width = splitSize[0]
      this.height = splitSize[1]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
