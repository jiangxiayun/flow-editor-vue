<template>
  <div id="main" class="editor-main-wrapper" :style="{height: wrapperHeight}">
    <!--头部操作按钮-->
    <toolbar :editor="editor" :editorManager="editorManager"></toolbar>
    <div class="flow-content-box">
      <slot name="paletteWrapper" v-bind:editorManager="editorManager">
        <paletteWrapper :editorManager="editorManager"></paletteWrapper>
      </slot>

      <div id="contentCanvasWrapper" class="contentCanvasWrapper">
        <canvasWrapper :editorManager="editorManager"></canvasWrapper>

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
        forceSelectionRefresh: false
      }
    },
    mixins: [Locale],
    props: {
      config: {
        type: Object
      }
    },
    components: { toolbar, paletteWrapper, canvasWrapper, propertySection },
    created () {},
    computed: {},
    mounted () {
      // this.getJson()
      this.editorManager = new EditorManager({
        ...this.config,
        elementsWithoutRenameAction: ['Lane', 'V-Lane']
      })
    },
    methods: {}
  }
</script>
<style lang="scss">

</style>
