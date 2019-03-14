<template>
  <DialogWrapper :title="`${$t('PROPERTY.PROPERTY.EDIT.TITLE')}'${$t(property.title)}'`">``
    <div class="modal-body">
      <div class="row row-no-gutter">
        <div class="col-xs-6">
          <div v-if="translationsRetrieved" class="kis-listener-grid" ui-grid="gridOptions"
               ui-grid-selection></div>
          <div class="pull-right">
            <div class="btn-group">
              <a class="btn btn-icon btn-lg" rel="tooltip"
                 :data-title="$t('ACTION.MOVE.UP')"
                 data-placement="bottom" data-original-title="" title=""
                 @click="moveListenerUp"><i class="glyphicon glyphicon-arrow-up"></i></a>
              <a class="btn btn-icon btn-lg" rel="tooltip"
                 :data-title="$t('ACTION.MOVE.DOWN')"
                 data-placement="bottom" data-original-title="" title=""
                 @click="moveListenerDown"><i class="glyphicon glyphicon-arrow-down"></i></a>
            </div>
            <div class="btn-group">
              <a class="btn btn-icon btn-lg" rel="tooltip"
                 :data-title="$t('ACTION.ADD')"
                 data-placement="bottom" data-original-title="" title=""
                 @click="addNewListener"><i class="glyphicon glyphicon-plus"></i></a>
              <a class="btn btn-icon btn-lg" rel="tooltip"
                 :data-title="$t('ACTION.REMOVE')"
                 data-placement="bottom" data-original-title="" title=""
                 @click="removeListener"><i class="glyphicon glyphicon-minus"></i></a>
            </div>
          </div>
        </div>

        <div class="col-xs-6">
          <div v-show="selectedListener">
            <div class="form-group">
              <label for="eventField">{{$t('PROPERTY.TASKLISTENERS.EVENT')}}</label>
              <select id="eventField" class="form-control" v-model="selectedListener.event">
                <option>create</option>
                <option>assignment</option>
                <option>complete</option>
                <option>delete</option>
              </select>
            </div>
            <div class="form-group">
              <label for="classField">{{$t('PROPERTY.TASKLISTENERS.CLASS')}}</label>
              <input type="text" id="classField" class="form-control"
                     v-model="selectedListener.className"
                     @change="listenerDetailsChanged"
                     :placeholder="$t('PROPERTY.TASKLISTENERS.CLASS.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="expressionField">{{$t('PROPERTY.TASKLISTENERS.EXPRESSION')}}</label>
              <input type="text" id="expressionField" class="form-control"
                     v-model="selectedListener.expression"
                     @change="listenerDetailsChanged"
                     :placeholder="$t('PROPERTY.TASKLISTENERS.EXPRESSION.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="delegateExpressionField">{{$t('PROPERTY.TASKLISTENERS.DELEGATEEXPRESSION')}}</label>
              <input type="text" id="delegateExpressionField" class="form-control"
                     v-model="selectedListener.delegateExpression"
                     @change="listenerDetailsChanged"
                     :placeholder="$t('PROPERTY.TASKLISTENERS.DELEGATEEXPRESSION.PLACEHOLDER')"/>
            </div>
          </div>
          <div v-show="!selectedListener" class="muted no-property-selected">
            {{$t('PROPERTY.TASKLISTENERS.UNSELECTED')}}
          </div>
        </div>
      </div>

      <div class="row row-no-gutter">
        <div class="col-xs-6">
          <div v-if="translationsRetrieved" class="kis-field-grid" ui-grid="gridFieldOptions"
               ui-grid-selection></div>
          <div class="pull-right">
            <div class="btn-group">
              <a class="btn btn-icon btn-lg" rel="tooltip"
                 :data-title="$t('ACTION.MOVE.UP')"
                 data-placement="bottom" data-original-title="" title=""
                 @click="moveFieldUp"><i class="glyphicon glyphicon-arrow-up"></i></a>
              <a class="btn btn-icon btn-lg" rel="tooltip"
                 :data-title="$t('ACTION.MOVE.DOWN')"
                 data-placement="bottom" data-original-title="" title=""
                 @click="moveFieldDown"><i class="glyphicon glyphicon-arrow-down"></i></a>
            </div>
            <div class="btn-group">
              <a class="btn btn-icon btn-lg" rel="tooltip"
                 :data-title="$t('ACTION.ADD')"
                 data-placement="bottom" data-original-title="" title=""
                 @click="addNewField"><i class="glyphicon glyphicon-plus"></i></a>
              <a class="btn btn-icon btn-lg" rel="tooltip"
                 :data-title="$t('ACTION.REMOVE')"
                 data-placement="bottom" data-original-title="" title=""
                 @click="removeField()"><i class="glyphicon glyphicon-minus"></i></a>
            </div>
          </div>
        </div>

        <div class="col-xs-6">
          <div v-show="selectedField">

            <div class="form-group">
              <label for="nameField">{{$t('PROPERTY.TASKLISTENERS.FIELDS.NAME')}}</label>
              <input type="text" id="nameField" class="form-control"
                     v-model="selectedField.name"
                     :placeholder="$t('PROPERTY.TASKLISTENERS.FIELDS.NAME.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="stringValueField">{{$t('PROPERTY.TASKLISTENERS.FIELDS.STRINGVALUE')}}</label>
              <input type="text" id="stringValueField" class="form-control"
                     v-model="selectedField.stringValue"
                     @change="fieldDetailsChanged"
                     :placeholder="$t('PROPERTY.TASKLISTENERS.FIELDS.STRINGVALUE.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="expressionField">{{$t('PROPERTY.TASKLISTENERS.FIELDS.EXPRESSION')}}</label>
              <input type="text" id="expressionField" class="form-control"
                     v-model="selectedField.expression"
                     @change="fieldDetailsChanged"
                     :placeholder="$t('PROPERTY.TASKLISTENERS.FIELDS.EXPRESSION.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="stringField">{{$t('PROPERTY.TASKLISTENERS.FIELDS.STRING')}}</label>
              <textarea id="stringField" class="form-control"
                        v-model="selectedField.string"
                        @change="fieldDetailsChanged"
                        :placeholder="$t('PROPERTY.TASKLISTENERS.FIELDS.STRING.PLACEHOLDER')"></textarea>
            </div>

          </div>
          <div v-show="!selectedField" class="muted no-property-selected">
            {{$t(' PROPERTY.TASKLISTENERS.FIELDS.EMPTY')}}
          </div>
        </div>
      </div>
    </div>

    <div class="modal">
      <div class="modal-dialog modal-wide">

        <div class="modal-footer">
          <button @click="cancel" class="btn btn-primary">{{$t('ACTION.CANCEL')}}</button>
          <button @click="save" class="btn btn-primary">{{$t('ACTION.SAVE')}}</button>
        </div>
      </div>
    </div>
    </div>
  </DialogWrapper>

</template>

<script>
  import DialogWrapper from './DialogWrapper'

  export default {
    name: 'task-listeners-write-template',
    props: {
      property: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    components: { DialogWrapper },
    mounted () {
      // Put json representing form properties on scope
      if (this.property.value !== undefined && this.property.value !== null
        && this.property.value.taskListeners !== undefined
        && this.property.value.taskListeners !== null) {

        if (this.property.value.taskListeners.constructor == String) {
          this.taskListeners = JSON.parse(this.property.value.taskListeners)
        }
        else {
          // Note that we clone the json object rather then setting it directly,
          // this to cope with the fact that the user can click the cancel button and no changes should have happened
          this.taskListeners = angular.copy(this.property.value.taskListeners)
        }

        for (var i = 0; i < this.taskListeners.length; i++) {
          var taskListener = this.taskListeners[i]
          if (taskListener.className !== undefined && taskListener.className !== '') {
            taskListener.implementation = taskListener.className
          }
          else if (taskListener.expression !== undefined && taskListener.expression !== '') {
            taskListener.implementation = taskListener.expression
          }
          else if (taskListener.delegateExpression !== undefined && taskListener.delegateExpression !== '') {
            taskListener.implementation = taskListener.delegateExpression
          }
        }
      } else {
        this.taskListeners = []
      }

      this.selectedListener = undefined
      this.selectedField = undefined
      this.fields = []
      this.translationsRetrieved = false

      this.labels = {}

      var eventPromise = $translate('PROPERTY.TASKLISTENERS.EVENT')
      var implementationPromise = $translate('PROPERTY.TASKLISTENERS.FIELDS.IMPLEMENTATION')
      var namePromise = $translate('PROPERTY.TASKLISTENERS.FIELDS.NAME')

      this.labels.eventLabel = results[0]
      this.labels.implementationLabel = results[1]
      this.labels.nameLabel = results[2]
      this.translationsRetrieved = true

      // Config for grid
      this.gridOptions = {
        data: this.taskListeners,
        headerRowHeight: 28,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        enableHorizontalScrollbar: 0,
        enableColumnMenus: false,
        enableSorting: false,
        columnDefs: [{ field: 'event', displayName: this.labels.eventLabel },
          { field: 'implementation', displayName: this.labels.implementationLabel }]
      }

      this.gridOptions.onRegisterApi = function (gridApi) {
        //set gridApi on scope
        this.gridApi = gridApi
        gridApi.selection.on.rowSelectionChanged(this, function (row) {
          this.selectedListener = row.entity
          this.selectedField = undefined
          if (this.selectedListener) {
            var fields = this.selectedListener.fields
            if (fields !== undefined && fields !== null) {
              for (var i = 0; i < fields.length; i++) {
                var field = fields[i]
                if (field.stringValue !== undefined && field.stringValue !== '') {
                  field.implementation = field.stringValue
                } else if (field.expression !== undefined && field.expression !== '') {
                  field.implementation = field.expression
                } else if (field.string !== undefined && field.string !== '') {
                  field.implementation = field.string
                }
              }
            } else {
              this.selectedListener.fields = []
            }

            this.fields.length = 0
            for (var i = 0; i < this.selectedListener.fields.length; i++) {
              this.fields.push(this.selectedListener.fields[i])
            }
          }
        })
      }

      // Config for field grid
      this.gridFieldOptions = {
        data: this.fields,
        headerRowHeight: 28,
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        columnDefs: [{ field: 'name', displayName: this.labels.name },
          { field: 'implementation', displayName: this.labels.implementationLabel }]
      }

      this.gridFieldOptions.onRegisterApi = function (gridApi) {
        // set gridApi on scope
        this.fieldGridApi = gridApi
        gridApi.selection.on.rowSelectionChanged(this, function (row) {
          this.selectedField = row.entity
        })
      }
    },
    methods: {
      listenerDetailsChanged () {
        if (this.selectedListener.className !== '') {
          this.selectedListener.implementation = this.selectedListener.className
        } else if (this.selectedListener.expression !== '') {
          this.selectedListener.implementation = this.selectedListener.expression
        } else if (this.selectedListener.delegateExpression !== '') {
          this.selectedListener.implementation = this.selectedListener.delegateExpression
        } else {
          this.selectedListener.implementation = ''
        }
      },

      // Click handler for add button
      addNewListener () {
        var newListener = {
          event: 'create',
          implementation: '',
          className: '',
          expression: '',
          delegateExpression: ''
        }
        this.taskListeners.push(newListener)

        $timeout(function () {
          this.gridApi.selection.toggleRowSelection(newListener)
        })
      },

      // Click handler for remove button
      removeListener () {
        var selectedItems = this.gridApi.selection.getSelectedRows()
        if (selectedItems && selectedItems.length > 0) {
          var index = this.taskListeners.indexOf(selectedItems[0])
          this.gridApi.selection.toggleRowSelection(selectedItems[0])

          this.taskListeners.splice(index, 1)

          if (this.taskListeners.length == 0) {
            this.selectedListener = undefined
          }

          $timeout(function () {
            if (this.taskListeners.length > 0) {
              this.gridApi.selection.toggleRowSelection(this.taskListeners[0])
            }
          })
        }
      },

      // Click handler for up button
      moveListenerUp () {
        var selectedItems = this.gridApi.selection.getSelectedRows()
        if (selectedItems && selectedItems.length > 0) {
          var index = this.taskListeners.indexOf(selectedItems[0])
          if (index != 0) { // If it's the first, no moving up of course
            var temp = this.taskListeners[index]
            this.taskListeners.splice(index, 1)
            $timeout(function () {
              this.taskListeners.splice(index + -1, 0, temp)
              $timeout(function () {
                this.gridApi.selection.toggleRowSelection(temp)
              })
            })
          }
        }
      },

      // Click handler for down button
      moveListenerDown () {
        var selectedItems = this.gridApi.selection.getSelectedRows()
        if (selectedItems && selectedItems.length > 0) {
          var index = this.taskListeners.indexOf(selectedItems[0])
          if (index != this.taskListeners.length - 1) { // If it's the last element, no moving down of course
            var temp = this.taskListeners[index]
            this.taskListeners.splice(index, 1)
            $timeout(function () {
              this.taskListeners.splice(index + 1, 0, temp)
              $timeout(function () {
                this.gridApi.selection.toggleRowSelection(temp)
              })
            })

          }
        }
      },

      fieldDetailsChanged () {
        if (this.selectedField.stringValue != '') {
          this.selectedField.implementation = this.selectedField.stringValue
        } else if (this.selectedField.expression != '') {
          this.selectedField.implementation = this.selectedField.expression
        } else if (this.selectedField.string != '') {
          this.selectedField.implementation = this.selectedField.string
        } else {
          this.selectedField.implementation = ''
        }
      },

      // Click handler for add button
      addNewField () {
        if (this.selectedListener) {
          if (this.selectedListener.fields == undefined) {
            this.selectedListener.fields = []
          }

          var newField = {
            name: 'fieldName',
            implementation: '',
            stringValue: '',
            expression: '',
            string: ''
          }
          this.fields.push(newField)
          this.selectedListener.fields.push(newField)

          $timeout(function () {
            this.fieldGridApi.selection.toggleRowSelection(newField)
          })
        }
      },

      // Click handler for remove button
      removeField () {
        var selectedItems = this.fieldGridApi.selection.getSelectedRows()
        if (selectedItems && selectedItems.length > 0) {
          var index = this.fields.indexOf(selectedItems[0])
          this.fieldGridApi.selection.toggleRowSelection(selectedItems[0])

          this.fields.splice(index, 1)
          this.selectedListener.fields.splice(index, 1)

          if (this.fields.length == 0) {
            this.selectedField = undefined
          }

          $timeout(function () {
            if (this.fields.length > 0) {
              this.fieldGridApi.selection.toggleRowSelection(this.fields[0])
            }
          })
        }
      },

      // Click handler for up button
      moveFieldUp () {
        var selectedItems = this.fieldGridApi.selection.getSelectedRows()
        if (selectedItems && selectedItems.length > 0) {
          var index = this.fields.indexOf(selectedItems[0])
          if (index != 0) { // If it's the first, no moving up of course
            var temp = this.fields[index]
            this.fields.splice(index, 1)
            this.selectedListener.fields.splice(index, 1)
            $timeout(function () {
              this.fields.splice(index + -1, 0, temp)
              this.selectedListener.fields.splice(index + -1, 0, temp)
              $timeout(function () {
                this.fieldGridApi.selection.toggleRowSelection(temp)
              })
            })

          }
        }
      },

      // Click handler for down button
      moveFieldDown () {
        var selectedItems = this.fieldGridApi.selection.getSelectedRows()
        if (selectedItems && selectedItems.length > 0) {
          var index = this.fields.indexOf(selectedItems[0])
          if (index != this.fields.length - 1) { // If it's the last element, no moving down of course
            var temp = this.fields[index]
            this.fields.splice(index, 1)
            this.selectedListeners.fields.splice(index, 1)
            $timeout(function () {
              this.fields.splice(index + 1, 0, temp)
              this.selectedListener.fields.splice(index + 1, 0, temp)
              $timeout(function () {
                this.fieldGridApi.selection.toggleRowSelection(temp)
              })
            })
          }
        }
      },

      // Click handler for save button
      save () {
        if (this.taskListeners.length > 0) {
          this.property.value = {}
          this.property.value.taskListeners = this.taskListeners
        } else {
          this.property.value = null
        }
        this.$emit('updateProperty', {property: this.property})
        this.close()
      },
      cancel () {
        this.close()
      }
    }
  }
</script>

<style scoped>

</style>