<template>
  <flowEditor :config="config"></flowEditor>
</template>

<script>
  // import flowDesign from '@/components/flowable/flow-design'
  import { AA } from '@/mock/stencilData.js'
  import { mockData } from '@/mock/mockData.js'

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
    // components: { flowDesign },
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
