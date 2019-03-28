<template>
  <div class="subheader editor-toolbar" id="editor-header">
    <div class="btn-group">
      <div class="btn-toolbar pull-left">
        <button v-for="(item, index) in items"
                :key="item.id"
                :id="item.id"
                class="btn btn-inverse"
                :class="{'separator': item.type == 'separator'}"
                :disabled="item.type == 'separator' || item.enabled == false"
                @click="toolbarButtonClicked(index)">
          <i v-if="item.type == 'button'"
             :class="item.cssClass"
             class="toolbar-button" data-toggle="tooltip" :title="$t(item.title)"></i>
          <div v-if="item.type == 'separator'" :class="item.cssClass"></div>
        </button>
      </div>
    </div>

    <div class="btn-group pull-right" v-show="secondaryItems.length > 0">
      <div class="btn-toolbar pull-right">
        <button v-for="(item, index) in secondaryItems"
                :key="item.id"
                :id="item.id"
                :title="$t(item.title)"
                class="btn btn-inverse" :class="{'separator': item.type == 'separator'}"
                :disabled="item.type == 'separator'"
                @click="toolbarSecondaryButtonClicked(index)">
          <i v-if="item.type == 'button'" :class="item.cssClass" class="toolbar-button"
             data-toggle="tooltip" :title="$t(item.title)"></i>
          <div v-if="item.type == 'separator'" :class="item.cssClass"></div>
        </button>
      </div>
    </div>

    <el-dialog
        :title="$t('MODEL.SAVE.TITLE')"
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
          <label for="nameField">{{$t('MODEL.NAME')}}</label>
          <input type="text"
                 :disabled="saveLoading || (error && error.conflictResolveAction == 'saveAs')"
                 id="nameField"
                 class="form-control"
                 v-model="saveDialog.name"
                 v-focus/>
        </div>
        <div class="form-group">
          <label for="keyField">{{$t('MODEL.KEY')}}</label>
          <input type="text"
                 :disabled="saveLoading || (error && error.conflictResolveAction == 'saveAs')"
                 id="keyField"
                 class="form-control"
                 v-model="saveDialog.key"/>
        </div>
        <div class="form-group">
          <label for="docTextArea">{{$t('MODEL.DESCRIPTION')}}</label>
          <textarea id="docTextArea" :disabled="saveLoading" class="form-control"
                    v-model="saveDialog.description"></textarea>
        </div>

        <div class="checkbox" v-show="!error">
          <label>
            <input type="checkbox" :disabled="saveLoading" v-model="saveDialog.newVersion">
            {{$t('MODEL.SAVE.NEWVERSION')}}
          </label>
        </div>

        <div class="form-group" v-if="saveDialog.newVersion">
          <label for="commentTextArea">{{$t('MODEL.SAVE.COMMENT')}}</label>
          <textarea id="commentTextArea" class="form-control" v-model="saveDialog.comment"
                    :disabled="saveLoading"></textarea>
        </div>

        <div v-if="saveDialog.validationErrors" class="alert error" style="font-size: 14px; margin-top:20px">

          <div class="popup-error" style="font-size: 14px">
            <span class="glyphicon glyphicon-remove-circle"></span>
            <span>{{$t('MODEL.VALIDATIONERRORS')}}</span>
          </div>
        </div>

        <!--<div v-if="error && error.isConflict && !saveLoading" class="alert error"-->
             <!--style="font-size: 14px; margin-top:20px">-->

          <!--<div class="popup-error" style="font-size: 14px">-->
            <!--<span class="glyphicon glyphicon-remove-circle"></span>-->
            <!--<span>{{$t('MODEL.CONFLICT.WRITE')}}</span>-->
          <!--</div>-->

          <!--<div>-->

            <!--<div style="font-size: 14px; margin-bottom: 10px">{{$t('MODEL.CONFLICT.WRITE.OPTIONS')}}</div>-->
            <!--<div class="btn-group" data-toggle="buttons">-->
              <!--<label class="btn btn-danger"-->
                     <!--@click="error.conflictResolveAction = 'overwrite'">-->
                <!--<input type="radio" name="options" id="option1">-->
                <!--{{$t('MODEL.CONFLICT.WRITE.OPTION.OVERWRITE')}}-->
              <!--</label>-->
              <!--<label class="btn btn-danger"-->
                     <!--@click="error.conflictResolveAction = 'discardChanges'">-->
                <!--<input type="radio" name="options" id="option2">-->
                <!--{{$t('MODEL.CONFLICT.WRITE.OPTION.DISCARDCHANGES')}}-->
              <!--</label>-->
              <!--<label class="btn btn-danger"-->
                     <!--@click="error.conflictResolveAction = 'saveAs'">-->
                <!--<input type="radio" name="options" id="option3" :disabled="account.type != 'enterprise'">-->
                <!--{{$t('MODEL.CONFLICT.WRITE.OPTION.SAVEAS')}}-->
              <!--</label>-->
              <!--<label class="btn btn-danger"-->
                     <!--@click="error.conflictResolveAction = 'newVersion'">-->
                <!--<input type="radio" name="options" id="optio43">-->
                <!--{{$t('MODEL.CONFLICT.WRITE.OPTION.NEWVERSION')}}-->
              <!--</label>-->
            <!--</div>-->

            <!--<div v-if="error.conflictResolveAction == 'saveAs'" style="margin-top: 10px">-->
              <!--<span>{{$t('MODEL.CONFLICT.SAVEAS')}}</span>-->
              <!--<input type="text" v-model="error.saveAs" style="width: 300px" v-focus>-->
            <!--</div>-->
          <!--</div>-->

        <!--</div>-->

      </div>


      <span slot="footer" class="dialog-footer">
        <div class="popup-error" v-if="error && !error.isConflict">
          <span>{{$t('MODEL.SAVE.ERROR')}}</span>
        </div>
        <div>
          <el-button @click="close" :disabled="saveLoading">{{$t('ACTION.CANCEL')}}</el-button>
          <el-button type="primary" @click="saveAndClose" v-show="!error"
                     :disabled="saveLoading || saveDialog.name.length == 0 || saveDialog.key.length == 0">
            {{$t('ACTION.SAVE-AND-CLOSE')}}
          </el-button>
          <el-button type="primary" @click="save" v-show="!error"
                     :disabled="saveLoading || saveDialog.name.length == 0 || saveDialog.key.length == 0">
            {{$t('ACTION.SAVE')}}
          </el-button>
          <el-button type="primary" @click="okClicked" v-show="error && error.isConflict"
                     :disabled="isOkButtonDisabled()">
            {{$t('ACTION.OK')}}
          </el-button>
        </div>

  </span>
    </el-dialog>
  </div>
</template>

<script>
  import { FLOWABLE } from '@/assets/flowable/FLOWABLE_Config'
  import ORYX_CONFIG from '@/assets/oryx/CONFIG'

  export default {
    name: 'toolbar',
    data () {
      return {
        undoStack: [],
        redoStack: [],
        saveVisible: false,
        description: '',
        saveLoading: false,
        saveDialog: {
          name: '',
          key: '',
          errorMessage: []
        },
        account: {},
        error: null
      }
    },
    props: {
      editor: {},
      editorManager: {}
    },
    computed: {
      items () {
        return this.editorManager ? this.editorManager.getToolbarItems() : []
      },
      secondaryItems () {
        return this.editorManager ? this.editorManager.getSecondaryItems() : []
      }
    },
    mounted () {
      this.MousetrapBind()
    },
    methods: {
      executeFunctionByName (functionName, context /*, args */) {
        var args = Array.prototype.slice.call(arguments).splice(2)
        var namespaces = functionName.split('.')
        var func = namespaces.pop()
        for (let i = 1; i < namespaces.length; i++) {
          context = context[namespaces[i]]
        }

        return context[func].apply(this, args)
      },
      toolbarButtonClicked (buttonIndex) {
        if (buttonIndex === 0) {
          this.saveVisible = true
          return
        }
        // Default behaviour
        let buttonClicked = this.items[buttonIndex]
        let services = {
          '$scope': this,
          '$rootScope': this.$parent,
          // '$http' : $http,
          // '$modal' : $modal,
          // '$q' : $q,
          // '$translate' : $translate,
          'editorManager': this.editorManager
        }
        this.executeFunctionByName(buttonClicked.action, FLOWABLE, services)

        // Other events
        let event = {
          type: FLOWABLE.eventBus.EVENT_TYPE_TOOLBAR_BUTTON_CLICKED,
          toolbarItem: buttonClicked
        }
        FLOWABLE.eventBus.dispatch(event.type, event)
      },
      toolbarSecondaryButtonClicked (buttonIndex) {
        let buttonClicked = this.secondaryItems[buttonIndex]
        let services = {
          'this': this,
          // '$http' : $http,
          // '$modal' : $modal,
          // '$q' : $q,
          // '$translate' : $translate,
          // '$location': $location,
          'editorManager': this.editorManager
        }
        this.executeFunctionByName(buttonClicked.action, FLOWABLE, services)
      },
      MousetrapBind () {
        /* Key bindings */
        Mousetrap.bind('mod+z', () => {
          const services = { '$scope': this, 'editorManager': this.editorManager }
          FLOWABLE.TOOLBAR.ACTIONS.undo(services)
          return false
        })

        Mousetrap.bind('mod+y', () => {
          const services = { '$scope': this, 'editorManager': this.editorManager }
          FLOWABLE.TOOLBAR.ACTIONS.redo(services)
          return false
        })

        Mousetrap.bind('mod+c', () => {
          const services = { '$scope': this, 'editorManager': this.editorManager }
          FLOWABLE.TOOLBAR.ACTIONS.copy(services)
          return false
        })

        Mousetrap.bind('mod+v', () => {
          const services = { '$scope': this, 'editorManager': this.editorManager }
          FLOWABLE.TOOLBAR.ACTIONS.paste(services)
          return false
        })

        Mousetrap.bind(['del'], () => {
          const services = { '$scope': this, 'editorManager': this.editorManager }
          FLOWABLE.TOOLBAR.ACTIONS.deleteItem(services)
          return false
        })
      },
      registerOnEvent () {
        // 捕获所有执行的命令并将它们存储在各自的堆栈上
        this.editorManager.registerOnEvent(ORYX_CONFIG.EVENT_EXECUTE_COMMANDS, (evt) => {
          // If the event has commands
          if (!evt.commands) return

          this.undoStack.push(evt.commands)
          this.redoStack = []

          for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.undo') {
              item.enabled = true
            } else if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.redo') {
              item.enabled = false
            }
          }

          // Update
          this.editorManager.getCanvas().update()
          this.editorManager.updateSelection()
        })
      },
      saveAndClose () {
        this.save(() => {
          if (this.editorManager.getStencilData()) {
            const stencilNameSpace = this.editorManager.getStencilData().namespace
            if (stencilNameSpace !== undefined && stencilNameSpace !== null && stencilNameSpace.indexOf('cmmn1.1') !== -1) {
              // $location.path('/casemodels')
              console.log('/casemodels')
              return
            }
          }
          // $location.path('/processes')
          console.log('/processes')
        })
      },
      save (successCallback) {
        if (!this.saveDialog.name || this.saveDialog.name.length === 0 ||
          !this.saveDialog.key || this.saveDialog.key.length === 0) {
          return
        }

        // Indicator spinner image
        this.saveLoading = true

        this.modelMetaData.name = this.saveDialog.name
        this.modelMetaData.key = this.saveDialog.key
        this.modelMetaData.description = this.saveDialog.description

        var json = this.editorManager.getModel()

        var params = {
          modeltype: this.modelMetaData.model.modelType,
          json_xml: JSON.stringify(json),
          name: this.saveDialog.name,
          key: this.saveDialog.key,
          description: this.saveDialog.description,
          newversion: this.saveDialog.newVersion,
          comment: this.saveDialog.comment,
          lastUpdated: this.modelMetaData.lastUpdated
        }

        if (this.error && this.error.isConflict) {
          params.conflictResolveAction = this.error.conflictResolveAction
          if (this.error.conflictResolveAction === 'saveAs') {
            params.saveAs = this.error.saveAs
          }
        }

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
      isOkButtonDisabled () {
        if (this.saveLoading) {
          return false
        } else if (this.error && this.error.conflictResolveAction) {
          if (this.error.conflictResolveAction === 'saveAs') {
            return !this.error.saveAs || this.error.saveAs.length === 0
          } else {
            return false
          }
        }
        return true
      },
      okClicked () {
        if (this.error) {
          if (this.error.conflictResolveAction === 'discardChanges') {
            this.close()
            window.location.reload()
          } else if (this.error.conflictResolveAction === 'overwrite'
            || this.error.conflictResolveAction === 'newVersion') {
            this.save()
          } else if (this.error.conflictResolveAction === 'saveAs') {
            this.save(() => {
              this.ignoreChanges = true  // Otherwise will get pop up that changes are not saved.
              if (this.editorManager.getStencilData()) {
                var stencilNameSpace = this.editorManager.getStencilData().namespace
                if (stencilNameSpace !== undefined && stencilNameSpace !== null && stencilNameSpace.indexOf('cmmn1.1') !== -1) {
                  // $location.path('/casemodels')
                  console.log('/casemodels2')
                  return
                }
              }
              // $location.path('/processes')
              console.log('/processes2')
            })
          }
        }
      },
      close () {
        this.saveVisible = false
      }
    },
    watch: {
      editorManager (nv, ov) {
        if (!ov) {
          this.registerOnEvent()

          // if (nv.getCurrentModelId() != nv.getModelId()) {
          //   nv.edit(nv.getModelId())
          // }

          this.modelMetaData = this.editorManager.getBaseModelData()
          if (this.modelMetaData.description) {
            this.description = this.modelMetaData.description
          }
          this.saveDialog = {
            'name': this.modelMetaData.name,
            'key': this.modelMetaData.key,
            'description': this.description,
            'newVersion': false,
            'comment': ''
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>