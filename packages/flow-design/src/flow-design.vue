<template>
  <div id="editor-main-wrapper" class="editor-main-wrapper" :style="{height: wrapperHeight}">
    <!--头部操作按钮-->
    <toolbar :editor="editor" :editorManager="editorManager"></toolbar>
    <div class="flow-content-box">
      <slot name="paletteWrapper" v-bind:editorManager="editorManager">
        <paletteWrapper :editorManager="editorManager"></paletteWrapper>
      </slot>
      <div id="contentCanvasWrapper" class="contentCanvasWrapper">
        <canvasWrapper :editorManager="editorManager" :contextmenuList="contextmenuList"></canvasWrapper>
        <slot name="propertyWrapper" v-bind:editorManager="editorManager">
          <propertySection :editorManager="editorManager"></propertySection>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
  import toolbar from 'packages/editor-toolbar'
  import paletteWrapper from 'packages/palette-wrapper'
  import canvasWrapper from 'packages/canvas-wrapper'
  import propertySection from 'packages/property-section'
  import EditorManager from 'src/flowable/EditorManager'
  import Locale from 'src/mixins/locale'
  import Default_Config from 'src/flowable/Default_Config'

  export default {
    name: 'flowEditor',
    data () {
      return {
        wrapperHeight: '700px',
        editorManager: null,
        editor: null,
        editorHistory: [],
        undoStack: [],
        redoStack: [],
        forceSelectionRefresh: false,
        list1: [
          { name: "John", id: 1 },
          { name: "Joao", id: 2 },
          { name: "Jean", id: 3 },
          { name: "Gerard", id: 4 }
        ],
        list2: [
          { name: "Juan", id: 5 },
          { name: "Edgard", id: 6 },
          { name: "Johnson", id: 7 }
        ]
      }
    },
    mixins: [Locale],
    props: {
      config: {
        type: Object
      },
      contextmenuList: Array
    },
    components: { toolbar, paletteWrapper, canvasWrapper, propertySection },
    created () {},
    computed: {
      createConfig () {
        return Object.assign({}, Default_Config, this.config)
      }
    },
    mounted () {
      this.editorManager = new EditorManager({
        ...this.createConfig,
        elementsWithoutRenameAction: ['Lane', 'V-Lane']
      })

      // 将用户在深层子组件里的自定义事件抛出
      this.$on('Propagation', this.handleSaveBtn)
    },
    methods: {
      handleSaveBtn (eventName, params) {
        // console.log(33, params)
        this.$emit(eventName, params)
      },
    }
  }
</script>
<style lang="scss">

</style>
