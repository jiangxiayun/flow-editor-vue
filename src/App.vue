<template>
  <flowDesign :config="config"></flowDesign>
</template>

<script>
  import flowDesign from '@/components/flowable/flow-design'
  import { AA } from './editorAA.js'
  import { mockData } from './mockData.js'

  export default {
    name: 'Editor',
    data () {
      return {
        config: {
          type: 'flow',
          modelData: mockData,
          stencilData: AA,
        }
      }
    },
    components: { flowDesign },
    created () {},
    computed: {},
    mounted () {

    },
    methods: {

    }
  }
</script>
<style lang="scss">

</style>
