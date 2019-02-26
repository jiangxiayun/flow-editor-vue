<template>
  <div id="navigator">
    <div class="panel-title">导航器</div>
    <div id="minimap"></div>
  <div id="zoom-slider">
    <el-slider  v-model="initVal" :min="minZoom" :max="maxZoom" :step="0.1"
               :format-tooltip="formatTooltip"></el-slider>
    <el-dropdown @command="dropdownChange">
      <span class="el-dropdown-link">
        {{parseInt(curZoom * 100)}}%<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="0.5">50%</el-dropdown-item>
        <el-dropdown-item command="1">100%</el-dropdown-item>
        <el-dropdown-item command="1.5">150%</el-dropdown-item>
        <el-dropdown-item command="2">200%</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
  </div>
</template>

<script>
export default {
  name: 'Navigator',
  props: {
    curZoom: Number,
    minZoom: Number,
    maxZoom: Number
  },
  computed: {
    initVal: {
     get () {
       return this.curZoom
     },
      set (val) {
        this.$emit('changeZoom', val)
      }
    }
  },
  methods: {
    dropdownChange(zoom) {
      this.$emit('changeZoom', Number(zoom))
    },
    formatTooltip(num) {
      return parseInt(num * 100) + '%';
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
