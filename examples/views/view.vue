<template>
  <div class="content center-pane">
    <div class="model-preview-wrapper">
      <div id="bpmnModel"></div>
    </div>
  </div>
</template>

<script>
  import processCreate from '@/components/popup/process-create'
  import mockViewData from '@/mock/mockViewData.js'

  export default {
    name: 'Editor',
    data () {
      return {
        dialogCreateVisible: false,
        model: {
          process: mockViewData
        }

      }
    },
    components: { processCreate },
    created () {},
    computed: {},
    mounted () {
      this.loadProcess()
    },
    methods: {
      loadProcess () {

      }
    }
  }
</script>
<style lang="scss">

</style>
