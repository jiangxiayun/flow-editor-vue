<template>
  <div>
    <div>
      <el-button type="primary" size="mini">关闭</el-button>
      <el-button type="primary" size="mini" @click="handleSaveBtn">保存</el-button>
      <el-button type="primary" size="mini" @click="bubbleEvent('goToRefTask')">返回引用</el-button>
    </div>
    <el-tabs type="border-card">
      <el-tab-pane label="版本信息">版本信息</el-tab-pane>
      <el-tab-pane label="流程活动基本信息">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="活动名称">
            <el-input v-model="form['oryx-name']"></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="标准规范/条款/业务单据">标准规范</el-tab-pane>
      <el-tab-pane label="风控点/活动评估">风控点/活动评估</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'editTask',
  data () {
    return {
      form: {}
    }
  },
  props: {
    property: Array
  },
  computed: {},
  mounted () {
    this.initProperty(this.property)
  },
  methods: {
    handleSaveBtn () {
      this.$emit('updateProperty', { properties: this.form })
    },
    initProperty (val) {
      if (!val || val.length === 0) {
        this.form = {}
        return
      }
      let f = {}
      val.map(item => {
        f[item.key] = item.value
      })
      this.form = f
    },
    bubbleEvent (type, params) {
      this.$emit('bubbleEvent', type, params)
    }
  },
  watch: {
    property: {
      handler: function (val, oldVal) {
        this.initProperty(val)
      },
      deep: true
    }
  }
}
</script>

<style scoped>

</style>
