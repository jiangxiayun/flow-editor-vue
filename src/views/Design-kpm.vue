<template>
  <flowDesign :config="config">

    <template slot="paletteWrapper" slot-scope="scope">
      <div id="paletteHelpWrapper" class="col-xs-3 full-height" v-if="scope.editorManager">
        <div class="stencils" id="paletteSection">
          <div v-for="group in scope.editorManager.showStencilData" :key="group.id"
               v-if="group.visible && group.items" class="stencil-group">
            <p class="group-name">{{group.name}}</p>
            <ul>
              <li v-for="item in group.paletteItems" :key="item.id">
                <stencil-drag-item :item="item" :editorManager="scope.editorManager"></stencil-drag-item>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </flowDesign>
</template>

<script>
  import flowDesign from '@/components/flowable/flow-design'
  import { AA } from '@/mock/stencilData-kpm.js'
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
  @import "@/assets/scss/kpm.scss";
</style>
