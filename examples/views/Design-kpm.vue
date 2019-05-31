<template>
  <div>
    <flowEditor ref="flowEditor"
                :config="config"
                :contextmenuList="contextmenuList"
                @oncontextmenu="handleContextmenu"
                @clickContextmenuCommand="handleContextmenuCommand">
      <template slot="paletteWrapper" slot-scope="scope">
        <div id="paletteHelpWrapper" class="paletteHelpWrapper" v-if="scope.editorManager">
          <div class="stencils" id="paletteSection">
            <template v-for="group in scope.editorManager.showStencilData">
              <div :key="group.id" v-if="group.visible && group.items" class="stencil-group">
                <p class="group-name">{{group.name}}</p>
                <ul :key="group.id" v-if="group.visible && group.items">
                  <li v-for="item in group.paletteItems" :key="item.id">
                    <stencil-drag-item :item="item" :editorManager="scope.editorManager"></stencil-drag-item>
                  </li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </template>

      <template slot="propertyWrapper" slot-scope="scope">
        <span>{{stateEditorManager(scope.editorManager)}}</span>
        <!--<propertySection :editorManager="scope.editorManager"></propertySection>-->
      </template>
    </flowEditor>

    <!--节点属性编辑弹窗-->
    <el-dialog
        :title="writeDialog.title"
        :visible.sync="writeDialog.visible"
        :close-on-click-modal="false"
        width="90%"
        :before-close="handlepropertyWriteClose">.paletteHelpWrapper
      {{selectedItem.properties}}
      <component v-bind:is="writeDialog.componentTemplate"
                 :key="writeDialog.properties"
                 :property="selectedItem.properties"
                 @updateProperty="updatePropertyInModel"
                 @bubbleEvent="handlebubbleEvents"></component>
    </el-dialog>
  </div>
</template>

<script>
  // import flowDesign from '@/components/flowable/flow-design'
  import propertySection from './propertySection'
  import { AA } from '@/mock/stencilData-kpm.js'
  import { mockData } from '@/mock/mockData.js'
  import configure from './initConfig'
  import EndFlowPlugin from './customPlugin'
  import refActivity from '@/components/flow/ref_task'
  import activityTabsEdit from '@/components/flow/edit_task'
  const flowSaveData = localStorage.getItem('flowSaveData')
  const flowSaveDataFinally = flowSaveData ? JSON.parse(flowSaveData) : {
    'modelId': '6609363a-3be5-11e9-afe0-82ad27eff10d',
    'name': '请假模型',
    'key': 'leave-model',
    'description': '请假模型',
    'lastUpdated': '2019-04-04T05:49:37.132+0000',
    'lastUpdatedBy': 'admin',
    'model': {
      'id': 'canvas',
      'resourceId': 'canvas',
      'stencilset': {
        'namespace': 'http://b3mn.org/stencilset/bpmn2.0#'
      },
      'properties': {
        'process_id': '1',
        'name': '1',
        'documentation': '1'
      },
      'childShapes': [],
      'modelType': 'model'
    }
  }

  const TaskNoneQuote = [
    {
      name: '新建活动',
      action: 'createQuote',
      type: 'dialog',
      dialogTitle: '活动引用',
      componentTemplate: 'refActivity'
    }
  ]
  const TaskQuoted = [
    {
      name: '查看/编辑',
      action: 'modifyActivity',
      type: 'dialog',
      dialogTitle: '活动主数据维护',
      componentTemplate: 'activityTabsEdit'
    }
  ]

  export default {
    name: 'Editor',
    data () {
      return {
        config: {
          type: 'flow',
          modelData: flowSaveDataFinally,
          stencilData: AA,
          pluginConfig: {
            properties: [
              { group: 'File', index: 1 },
              { group: 'Edit', index: 2 },
              { group: 'Undo', index: 3 },
              { group: 'Alignment', index: 4 },
              { group: 'Group', index: 5 },
              { group: 'Z-Order', index: 6 },
              { group: 'Docker', index: 7 },
              { group: 'Zoom', index: 8 }
            ],
            plugins: [
              { name: 'Plugins.Loading' },
              { name: 'Plugins.CanvasResize', notUsesIn: 'xforms' },
              { name: 'Plugins.ProcessLink' },
              { name: 'Plugins.Arrangement' },
              { name: 'Plugins.Save' },
              { name: 'Plugins.View' },
              { name: 'Plugins.DragDropResize' },
              { name: 'Plugins.HighlightingSelectedShapes' },
              { name: 'Plugins.DragDocker' },
              { name: 'Plugins.AddDocker' },
              { name: 'Plugins.SelectionFrame' },
              { name: 'Plugins.ShapeHighlighting' },
              { name: 'Plugins.Overlay' },
              { name: 'Plugins.KeysMove' },
              { name: 'Plugins.Layouter.EdgeLayouter' },
              { name: 'Plugins.BPMN2_0' },
              { name: 'Plugins.RenameShapes' },
              { name: 'Plugins.PoolAsProperty' },
              { name: 'EndFlowPlugin', plugin: EndFlowPlugin, type: 'custom' }
            ]
          },
          editorConfigs: configure
        },
        editorManager: null,
        form: {},
        contextmenuList: [],
        selectedItem: {},
        currentShapeMode: 'read',
        writeDialog: {
          visible: false,
          componentTemplate: null
        }
      }
    },
    components: { propertySection, refActivity, activityTabsEdit },
    created () {},
    computed: {
      modelData () {
        return this.editorManager ? this.editorManager.getModel() : { properties: {} }
      }
    },
    mounted () {},
    methods: {
      stateEditorManager (editor) {
        this.editorManager = editor
      },
      handleContextmenu ({ selectedElements }) {
        if (selectedElements.length === 1) {
          let currentShape = selectedElements[0]
          if (currentShape.getStencil().idWithoutNs() === 'UserTask' ||
            currentShape.getStencil().idWithoutNs() === 'UserTask2') {
            switch (currentShape.properties.get('refTask')) {
              case 'quoted':
                this.contextmenuList = TaskQuoted
                break
              default:
                this.contextmenuList = TaskNoneQuote
            }
          }
          this.$refs.flowEditor.showContextmenu()
        }
      },
      handleContextmenuCommand (params) {
        if (params.action.type === 'dialog') {
          this.writeDialog = {
            visible: true,
            title: params.action.dialogTitle,
            componentTemplate: params.action.componentTemplate
          }
        }
      },
      propertyWriteSave () {
        this.writeDialog.visible = false
        this.currentShapeMode = 'read'
      },
      handlepropertyWriteClose () {
        this.currentShapeMode = 'read'
        this.writeDialog.visible = false
      },
      /* Click handler for clicking a property */
      propertyClicked (property) {
        if (!(this.currentShapeType.endsWith('Lane') && this.laneEnableValue &&
          this.laneValueAry.includes(property.key) && property.key !== this.laneEnableValue)) {
          if (!property.hidden) {
            property.mode = 'write'
          }
          this.currentShapeMode = 'write'
        }
      },
      /* Method available to all sub controllers (for property controllers) to update the internal Oryx model */
      updatePropertyInModel ({ properties, shapeId }) {
        let shape = this.selectedShape
        // Some updates may happen when selected shape is already changed, so when an additional
        // shapeId is supplied, we need to make sure the correct shape is updated (current or previous)
        if (shapeId) {
          if (shape.id !== shapeId && this.previousSelectedShape && this.previousSelectedShape.id === shapeId) {
            shape = this.previousSelectedShape
          } else {
            shape = null
          }
        }

        if (!shape) {
          return
        }

        const _this = this

        let keys = Object.keys(properties)
        let changedProperties = [] // 提取有变动的属性
        keys.map(key => {
          // let newValue = property.value
          let newValue = properties[key]
          let oldValue = shape.properties.get(key)
          if (newValue !== oldValue) {
            changedProperties.push({
              key,
              oldValue,
              newValue
            })
          }
        })

        if (changedProperties.length > 0) {
          this.editorManager.assignCommand('setProperties',
            changedProperties, shape, _this.editorManager.getEditor())
          this.editorManager.handleEvents({
            type: 'propertyWindow.propertyChanged',
            elements: [shape],
            key: keys
          })

          // Switch the property back to read mode, now the update is done
          this.currentShapeMode = 'read'
          const event = {
            type: 'event-type-property-value-changed',
            // property: property,
            // oldValue: oldValue,
            // newValue: newValue,
            properties: changedProperties,
            keys: keys
          }

          this.editorManager.dispatchFlowEvent(event.type, event)
        } else {
          this.currentShapeMode = 'read'
        }
      },
      handlebubbleEvents (type, params) {
        switch (type) {
          // 创建新活动主数据
          case 'goToAddTask':
            this.currentShapeMode = 'read'
            console.log(TaskQuoted)
            this.writeDialog = {
              visible: true,
              title: '新建活动主数据',
              componentTemplate: 'activityTabsEdit'
            }
            break
          // 引用活动
          case 'goToRefTask':
            this.writeDialog = {
              visible: true,
              title: '引用活动',
              componentTemplate: 'refActivity'
            }
            break
        }
      }
    }
  }
</script>
<style lang="scss">

</style>
