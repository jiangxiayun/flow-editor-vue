<template>
  <div id="aaaaa">
    <flowEditor :config="config" @btn-save-click="handleSaveBtn">

      <template slot="paletteWrapper" slot-scope="scope">
        <div id="paletteHelpWrapper" class="paletteHelpWrapper" v-if="scope.editorManager">
          <div class="stencils" id="paletteSection">
            <template v-for="group in scope.editorManager.showStencilData">
              <div :key="group.id" v-if="group.visible && group.items" class="stencil-group">
                <p class="group-name">{{group.name}}</p>
                <ul>
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
        <div></div>
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
  </div>

</template>

<script>
  import propertySection from 'packages/property-section'
  import { AA } from '@/mock/stencilData-kpm.js'
  import { mockData } from '@/mock/mockData.js'
  import configure from './initConfig'

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

  export default {
    name: 'Editor',
    data () {
      return {
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
        error: null,
        config: {
          type: 'flow',
          // modelData: mockData,
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
              { name: 'Plugins.PoolAsProperty' }
            ]
          },
          editorConfigs: configure
        }
      }
    },
    components: { propertySection },
    created () {},
    computed: {},
    mounted () {
      // this.$on('btn-save-click', this.handleSaveBtn);
    },
    methods: {
      handleSaveBtn (editor) {
        this.saveVisible = true
        this.editorManager = editor
      },
      save () {
        this.saveLoading = true

        let json = this.editorManager.getModel()
        console.log(json)

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
      }
    }
  }
</script>
<style lang="scss" scoped>

</style>
