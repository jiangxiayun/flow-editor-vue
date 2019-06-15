<template>
  <div id="editor-main-wrapper" class="editor-main-wrapper" :style="{height: wrapperHeight}">
    <!--头部操作按钮-->
    <toolbar :interceptors-draw="interceptorsDraw" :editor="editor" :editorManager="editorManager"></toolbar>
    <div class="flow-content-box">
      <slot name="paletteWrapper" v-bind:editorManager="editorManager">
        <paletteWrapper :editorManager="editorManager"></paletteWrapper>
      </slot>
      <div id="contentCanvasWrapper" class="contentCanvasWrapper">
        <canvasWrapper ref="canvasWrapper"
                       :editorManager="editorManager" :contextmenuList="contextmenuList"></canvasWrapper>
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
  import ORYX_CONFIG from 'src/oryx/CONFIG'
  import FLOW_eventBus from 'src/flowable/FLOW_eventBus'

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
      },
      contextmenuList: Array,
      interceptorsDraw: Function
    },
    components: { toolbar, paletteWrapper, canvasWrapper, propertySection },
    created () {
      ORYX_CONFIG.setCustomConfigs(this.config.editorConfigs)
    },
    computed: {},
    mounted () {
      this.editorManager = new EditorManager({
        ...this.config,
        elementsWithoutRenameAction: ['Lane', 'V-Lane']
      })
      FLOW_eventBus.addListener(ORYX_CONFIG.EVENT_EDITOR_INIT_COMPLETED, this.initCompleted)
      FLOW_eventBus.addListener(ORYX_CONFIG.EVENT_TYPE_SELECTION_CHANGED, this.selectChangeFun)
      FLOW_eventBus.addListener(ORYX_CONFIG.EVENT_TYPE_DOUBLE_CLICK, this.doubleClick)
      FLOW_eventBus.addListener(ORYX_CONFIG.EVENT_TYPE_PROPERTY_CHANGED_BYOUTSIDE, this.doubleClickToChangeVal)
      // 将用户在深层子组件里的自定义事件抛出
      this.$on('Propagation', this.handlePopEvent)
    },
    methods: {
      selectChangeFun (event) {
        this.handlePopEvent('selection-changed', event)
      },
      initCompleted () {
        this.handlePopEvent('editorInitCompleted', this.editorManager)
      },
      handlePopEvent (eventName, params) {
        this.$emit(eventName, params)
      },
      showContextmenu () {
        this.$refs.canvasWrapper.showContextmenu()
      },
      doubleClick (evt, shape) {
        this.handlePopEvent('doubleClick', shape)
      },
      doubleClickToChangeVal (params) {
        this.handlePopEvent('doubleClickToChangeVal', params)

      }
    },
    beforeDestroy () {
      FLOW_eventBus.removeListener(ORYX_CONFIG.EVENT_EDITOR_INIT_COMPLETED, this.initCompleted)
      FLOW_eventBus.removeListener(ORYX_CONFIG.EVENT_TYPE_SELECTION_CHANGED, this.selectChangeFun)
      FLOW_eventBus.removeListener(ORYX_CONFIG.EVENT_TYPE_DOUBLE_CLICK, this.doubleClick)
      FLOW_eventBus.removeListener(ORYX_CONFIG.EVENT_TYPE_PROPERTY_CHANGED_BYOUTSIDE, this.doubleClickToChangeVal)
      this.editorManager.clearAllEvents()
    }
  }
</script>
<style lang="scss">

</style>
