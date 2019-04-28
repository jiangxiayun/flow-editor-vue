<template>
  <flowEditor :config="config">

    <template slot="paletteWrapper" slot-scope="scope">
      <div id="paletteHelpWrapper" class="paletteHelpWrapper" v-if="scope.editorManager">
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

    <template slot="propertyWrapper" slot-scope="scope">
      <propertySection :editorManager="scope.editorManager"></propertySection>
    </template>
  </flowEditor>
</template>

<script>
  // import flowDesign from '@/components/flowable/flow-design'
  import propertySection from 'packages/property-section'
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
          plugins: [
            {name: 'Plugins.Loading'},
            {name: 'Plugins.CanvasResize', notUsesIn: 'xforms'},
            {name: 'Plugins.ProcessLink'},
            {name: 'Plugins.Arrangement'},
            {name: 'Plugins.Save'},
            {name: 'Plugins.View'},
            {name: 'Plugins.DragDropResize'},
            {name: 'Plugins.HighlightingSelectedShapes'},
            {name: 'Plugins.DragDocker'},
            {name: 'Plugins.AddDocker'},
            {name: 'Plugins.SelectionFrame'},
            {name: 'Plugins.ShapeHighlighting'},
            {name: 'Plugins.Overlay'},
            {name: 'Plugins.KeysMove'},
            {name: 'Plugins.EdgeLayouter'},
            {name: 'Plugins.BPMN2_0'},
            {name: 'Plugins.RenameShapes'},
            {name: 'Plugins.PoolAsProperty'},
          ]
        }
      }
    },
    components: { propertySection },
    created () {},
    computed: {},
    mounted () {

    },
    methods: {

    }
  }
</script>
<style lang="scss">
  @import "~@/assets/styles/kpm.scss";
</style>
<style lang="scss" scoped>
  .paletteHelpWrapper{
    float: left;
    width: 200px;
    transition: 0.3s width;
  }
</style>
