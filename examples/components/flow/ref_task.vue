<template>
  <div class="container-box flex1 flex-column task-temple">
    <el-button size="medium"
               @click="searchQuery">取消</el-button>
    <el-button size="medium"
               type="primary"
               @click="selectedOneTask">选择并引用</el-button>
  </div>
</template>

<script>

export default {
  name: 'refTask',
  data () {
    return {}
  },
  created () {
  },
  computed: {},
  methods: {
    searchQuery () {

    },
    selectedOneTask (type, params) {
      this.$emit('bubbleEvent', 'refOneTask', '11')
    }
  }
}
</script>
