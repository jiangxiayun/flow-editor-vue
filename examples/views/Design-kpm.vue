<template>
  <div>
    <button @click="clearAllEvents">移除所有事件</button>
    <flowEditor ref="flowEditor"
                :config="config"
                @btn-save-click="handleSaveBtn"
                @btn-paste-click="handlePasteBtn"
                :interceptors-draw="handlePasteBtn"
                :contextmenuList="contextmenuList"
                @editorInitCompleted="editorInitCompleted"
                @oncontextmenu="handleContextmenu"
                @doubleClick="doubleClick"
                @doubleClickToChangeVal="doubleClickToChangeVal"
                @clickContextmenuCommand="handleContextmenuCommand"
                @selection-changed="selectionChanged">
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

    <el-dialog
        title="保存模型"
        :visible="saveVisible"
        append-to-body
        @close="close"
        width="60%">
      <div class="modal-body">
        <div v-if="saveDialog.errorMessage && saveDialog.errorMessage.length > 0" class="alert error"
             style="font-size: 14px; margin-top:20px">
          <div class="popup-error" style="font-size: 14px">
            <span class="glyphicon glyphicon-remove-circle"></span>
            <span>{{saveDialog.errorMessage}}</span>
          </div>
        </div>
        <div class="form-group">
          <label for="nameField">名称</label>
          <input type="text"
                 :disabled="saveLoading || (error && error.conflictResolveAction == 'saveAs')"
                 id="nameField"
                 class="form-control"
                 v-model.trim="saveDialog.name"/>
        </div>
        <div class="form-group">
          <label for="keyField">Key</label>
          <input type="text"
                 :disabled="saveLoading || (error && error.conflictResolveAction == 'saveAs')"
                 id="keyField"
                 class="form-control"
                 v-model.trim="saveDialog.key"/>
        </div>
        <div class="form-group">
          <label for="docTextArea">描述</label>
          <textarea id="docTextArea" :disabled="saveLoading" class="form-control"
                    v-model="saveDialog.description"></textarea>
        </div>

      </div>

      <span slot="footer" class="dialog-footer">
        <div>
          <el-button @click="close" :disabled="saveLoading">取消</el-button>
          <el-button type="primary" @click="save"
                     :disabled="saveLoading || saveDialog.name.length === 0 || saveDialog.key.length === 0">
            保存
          </el-button>
        </div>

  </span>
    </el-dialog>

    <!--节点属性编辑弹窗-->
    <el-dialog
        :title="writeDialog.title"
        :visible.sync="writeDialog.visible"
        :close-on-click-modal="false"
        width="90%"
        :before-close="handlepropertyWriteClose">
      <!--{{selectedItem}}-->
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
  import FLOW_eventBus from 'src/flowable/FLOW_eventBus'
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
              { name: 'Plugins.NodesResize' },
              { name: 'Plugins.PoolResize' },
              { name: 'Plugins.HighlightingSelectedShapes' },
              // { name: 'Plugins.DragDocker' },
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
        },
        saveVisible: false,
        saveDialog: {
          name: mockData.name,
          key: mockData.key,
          errorMessage: [],
          description: mockData.description,
          newVersion: false,
          comment: '',
          user: mockData.lastUpdatedBy,
          lastUpdatedData: mockData.lastUpdated
        },
        saveLoading: false,
        error: null
      }
    },
    components: { propertySection, refActivity, activityTabsEdit },
    computed: {
      modelData () {
        return this.editorManager ? this.editorManager.getModel() : { properties: {} }
      }
    },
    methods: {
      editorInitCompleted () {
        console.log(66778)
      },
      selectionChanged (event) {
        if (this.currentShapeMode !== 'write') {
          this.selectedItem = event.selectedItem
          this.selectedShape = event.selectedShape
        }
      },
      clearAllEvents () {
        this.editorManager.clearAllEvents()
      },
      handleSaveBtn (editor) {
        this.saveVisible = true
        this.editorManager = editor
      },
      save () {
        this.saveLoading = true

        let json = this.editorManager.getModel()
        console.log(json)
        this.editorManager.handleEvents({
          type: 'editorSaved'
        })

        // let params = {
        //   modeltype: this.mockData.model.modelType,
        //   json_xml: JSON.stringify(json),
        //   name: this.saveDialog.name,
        //   key: this.saveDialog.key,
        //   description: this.saveDialog.description,
        //   newversion: this.saveDialog.newVersion,
        //   comment: this.saveDialog.comment
        //   lastUpdated: this.modelMetaData.lastUpdated
        // }

        let params = {
          modelId: '6609363a-3be5-11e9-afe0-82ad27eff10d',
          name: '请假模型',
          key: 'leave-model',
          description: '请假模型',
          lastUpdated: '2019-04-04T05:49:37.132+0000',
          lastUpdatedBy: 'admin',
          model: json
        }

        localStorage.setItem('flowSaveData', JSON.stringify(params))
        // Fire event to all who is listening
        // const saveEvent = {
        //   type: FLOWABLE.eventBus.EVENT_TYPE_MODEL_SAVED,
        //   model: params,
        //   modelId: this.modelMetaData.modelId,
        //   eventType: 'update-model'
        // }
        // FLOWABLE.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_MODEL_SAVED, saveEvent)
        this.saveLoading = false
        // Update
        console.log('$http', params)
        // $http({
        //   method: 'POST',
        //   data: params,
        //   ignoreErrors: true,
        //   headers: {
        //     'Accept': 'application/json',
        //     'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        //   },
        //   transformRequest: function (obj) {
        //     var str = []
        //     for (var p in obj) {
        //       str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
        //     }
        //     return str.join('&')
        //   },
        //   url: FLOWABLE.URL.putModel(this.modelMetaData.modelId)
        // })
        //   .success(function (data, status, headers, config) {
        //     this.editorManager.handleEvents({
        //       type: ORYX_CONFIG.EVENT_SAVED
        //     })
        //     this.modelData.name = this.saveDialog.name
        //     this.modelData.key = this.saveDialog.key
        //     this.modelData.lastUpdated = data.lastUpdated
        //
        //     this.status.loading = false
        //     this.$hide()
        //
        //     // Fire event to all who is listening
        //     var saveEvent = {
        //       type: FLOWABLE.eventBus.EVENT_TYPE_MODEL_SAVED,
        //       model: params,
        //       modelId: this.modelMetaData.modelId,
        //       eventType: 'update-model'
        //     }
        //     FLOWABLE.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_MODEL_SAVED, saveEvent)
        //
        //     // Reset state
        //     this.error = undefined
        //     this.status.loading = false
        //
        //     // Execute any callback
        //     if (successCallback) {
        //       successCallback()
        //     }
        //
        //   })
        //   .error(function (data, status, headers, config) {
        //     if (status == 409) {
        //       this.error = {}
        //       this.error.isConflict = true
        //       this.error.userFullName = data.customData.userFullName
        //       this.error.isNewVersionAllowed = data.customData.newVersionAllowed
        //       this.error.saveAs = this.modelMetaData.name + '_2'
        //     } else {
        //       this.error = undefined
        //       this.saveDialog.errorMessage = data.message
        //     }
        //     this.status.loading = false
        //   })
      },
      close () {
        this.saveVisible = false
      },
      // handlePasteBtn (editor) {
      //   console.log(8888)
      //   // this.editorManager = editor
      //   // let shapes = this.editorManager.getSelectedShape()
      //   // console.log(112, shapes)
      //
      // },
      handlePasteBtn(done, type) {
        if (type === 'paste') {
          this.$confirm('此操作将复制属性并创建新的活动主数据，确定创建吗？')
            .then(_ => {
              done()
            })
            .catch(_ => {})
        } else {
          done()
        }
      },
      stateEditorManager (editor) {
        console.log(456)
        this.editorManager = editor
      },
      handleContextmenu ({ selectedElements }) {
        if (selectedElements.length === 1) {
          let currentShape = selectedElements[0]
          if (currentShape.getStencil().idWithoutNs() === 'UserTask' ||
            currentShape.getStencil().idWithoutNs() === 'UserTask2') {
            let value = currentShape.properties.get('refId')
            console.log(33, currentShape.properties)
            this.contextmenuList = value ? TaskQuoted : TaskNoneQuote
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
      // 切换元素类型
      handleCommand () {
        let morphShapes = []
        const morphRoles = this.editorManager.morphRoles
        console.log('morphRoles', morphRoles)
        console.log('morphRoles', this.selectedShape.morphRole)
        let currentSelectedShapeId = this.selectedShape.getStencil().idWithoutNs()
        let stencilItem = this.editorManager.getStencilItemById(currentSelectedShapeId)

        for (let i = 0; i < morphRoles.length; i++) {
          if (morphRoles[i].role === stencilItem.morphRole) {
            let ary = morphRoles[i].morphOptions.slice()
            console.log('ary', ary)
            for (let y = 0; y < ary.length; y++) {
              if (ary[y].id === 'UserTask') {
                morphShapes.push(ary[y])
                break
              }
            }
          }
        }
        let item = morphShapes[0]
        console.log('item', morphShapes)

        let stencil = undefined
        const stencilSets = this.editorManager.getStencilSets().values()
        const stencilId = item.genericTaskId || item.id

        for (let i = 0; i < stencilSets.length; i++) {
          let stencilSet = stencilSets[i]
          let nodes = stencilSet.nodes()
          for (let j = 0; j < nodes.length; j++) {
            if (nodes[j].idWithoutNs() === stencilId) {
              stencil = nodes[j]
              break
            }
          }
        }

        if (!stencil) return
        this.editorManager.assignCommand('MorphTo', this.selectedShape, stencil, this.editorManager.getEditor())
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
          // 返回引用活动
          case 'goToRefTask':
            this.writeDialog = {
              visible: true,
              title: '引用活动',
              componentTemplate: 'refActivity'
            }
            break
          // 引用某个具体活动
          case 'refOneTask':
            this.handleCommand()
            this.updatePropertyInModel({
              properties: {
                'refId': '123',
                'name': '引用活动',
                'type': 1,
                'dates': '0.4 天'
              }
            })
            this.writeDialog.visible = false
            break
        }
      },
      doubleClick (shape) {
        console.log(333, shape)
      },
      doubleClickToChangeVal (params) {
        console.log(44, params)
      }
    },
    beforeRouteLeave (to, from , next) {
      const loadedPlugins = this.editorManager.editor.loadedPlugins
      let SavePlugins = null
      for(let i in loadedPlugins) {
        console.log(loadedPlugins[i].type)
        if (loadedPlugins[i].type === 'Plugins.Save') {
          SavePlugins = loadedPlugins[i]
          break
        }
      }
      console.log(22, SavePlugins._hasChanges())


      // const answer = window.confirm('确认离开吗？系统可能不会保存您所做的更改。')
      // if (answer) {
      //   next()
      // } else {
      //   next(false)
      // }
    }
  }
</script>
<style lang="scss">

</style>
