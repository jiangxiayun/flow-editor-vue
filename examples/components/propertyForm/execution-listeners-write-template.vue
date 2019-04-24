<template>
  <DialogWrapper
      visible
      :property="property"
      :modal-append-to-body="false"
      @cancelHandle="close"
      @saveHandle="save"
      width="60%">
    <!--{{selectedListener}}-->
    <div class="modal-body">
      <div class="row row-no-gutter">
        <div class="col-xs-6">
          <table-sort-template :property="property"
                               :tableData="executionListeners"
                               @add-newRow="addNewListener"
                               @currentRowChange="currentListenerChange">
            <el-table-column
                prop="event"
                :label="$t('PROPERTY.EXECUTIONLISTENERS.EVENT')">
            </el-table-column>
            <el-table-column
                prop="implementation"
                :label="$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.IMPLEMENTATION')">
            </el-table-column>
          </table-sort-template>
        </div>
        <div class="col-xs-6">
          <div v-show="hasSelectRow">
            <div class="form-group">
              <label for="eventField">{{$t('PROPERTY.EXECUTIONLISTENERS.EVENT')}}</label>
              <select id="eventField" class="form-control"
                      v-model="selectedListener.event">
                <option>start</option>
                <option>end</option>
                <option>take</option>
              </select>
            </div>
            <div class="form-group">
              <label for="classField">{{$t('PROPERTY.EXECUTIONLISTENERS.CLASS')}}</label>
              <input type="text" id="classField" class="form-control"
                     v-model="selectedListener.className"
                     @change="listenerDetailsChanged"
                     :placeholder="$t('PROPERTY.EXECUTIONLISTENERS.CLASS.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="expressionField">{{$t('PROPERTY.EXECUTIONLISTENERS.EXPRESSION')}}</label>
              <input type="text" id="expressionField" class="form-control"
                     v-model="selectedListener.expression"
                     @change="listenerDetailsChanged"
                     :placeholder="$t('PROPERTY.EXECUTIONLISTENERS.EXPRESSION.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="delegateExpressionField">{{$t('PROPERTY.EXECUTIONLISTENERS.DELEGATEEXPRESSION')}}</label>
              <input type="text" id="delegateExpressionField" class="form-control"
                     v-model="selectedListener.delegateExpression"
                     @change="listenerDetailsChanged()"
                     :placeholder="$t('PROPERTY.EXECUTIONLISTENERS.DELEGATEEXPRESSION.PLACEHOLDER')"/>
            </div>
          </div>
          <div v-show="!hasSelectRow" class="muted no-property-selected">
            {{$t('PROPERTY.EXECUTIONLISTENERS.UNSELECTED')}}
          </div>
        </div>
      </div>

      <div class="row row-no-gutter">
        <div class="col-xs-6">
          <table-sort-template :property="property"
                               :tableData="fields"
                               ref="fildTable"
                               @add-newRow="addNewField"
                               @currentRowChange="currentFieldChange">
            <el-table-column
                prop="name"
                :label="$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.NAME')">
            </el-table-column>
            <el-table-column
                prop="implementation"
                :label="$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.IMPLEMENTATION')">
            </el-table-column>
          </table-sort-template>
        </div>

        <div class="col-xs-6">
          <!--{{selectedField}}-->
          <div v-show="hasFieldSelectRow">
            <div class="form-group">
              <label for="nameField">{{$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.NAME')}}</label>
              <input type="text" id="nameField" class="form-control"
                     v-model="selectedField.name"
                     :placeholder="$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.NAME.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="stringValueField">{{$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.STRINGVALUE')}}</label>
              <input type="text" id="stringValueField" class="form-control"
                     v-model="selectedField.stringValue"
                     @change="fieldDetailsChanged()"
                     :placeholder="$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.STRINGVALUE.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="expressionField">{{$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.EXPRESSION')}}</label>
              <input type="text" id="expressionField" class="form-control"
                     v-model="selectedField.expression"
                     @change="fieldDetailsChanged"
                     :placeholder="$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.EXPRESSION.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="stringField">{{$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.STRING')}}</label>
              <textarea id="stringField" class="form-control"
                        v-model="selectedField.string"
                        @change="fieldDetailsChanged"
                        :placeholder="$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.STRING.PLACEHOLDER')"></textarea>
            </div>

          </div>
          <div v-show="!hasFieldSelectRow" class="muted no-property-selected">
            {{$t('PROPERTY.EXECUTIONLISTENERS.FIELDS.EMPTY')}}
          </div>
        </div>
      </div>

    </div>
  </DialogWrapper>
</template>

<script>
  import DialogWrapper from './DialogWrapper'
  import tableSortTemplate from './table-sort-template'

  export default {
    name: 'execution-listeners-write-template',
    data () {
      return {
        hasSelectRow: false,
        selectedListener: {},
        hasFieldSelectRow: false,
        selectedField: {},
        fields: [],
        propertyIndex: 1  // Click handler for add button
      }
    },
    props: {
      property: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    components: { DialogWrapper, tableSortTemplate },
    computed: {
      executionListeners () {
        let executionListeners = []
        if (this.property.value !== undefined && this.property.value !== null
          && this.property.value.executionListeners !== undefined
          && this.property.value.executionListeners !== null) {
          if (this.property.value.executionListeners.constructor == String) {
            executionListeners = JSON.parse(this.property.value.executionListeners)
          } else {
            // Note that we clone the json object rather then setting it directly,
            // this to cope with the fact that the user can click the cancel button and no changes should have happened
            executionListeners = jQuery.extend(true, [], this.property.value.executionListeners)
          }

          for (let i = 0; i < executionListeners.length; i++) {
            let executionListener = executionListeners[i]
            if (executionListener.className !== undefined && executionListener.className !== '') {
              executionListener.implementation = executionListener.className
            } else if (executionListener.expression !== undefined && executionListener.expression !== '') {
              executionListener.implementation = executionListener.expression
            } else if (executionListener.delegateExpression !== undefined && executionListener.delegateExpression !== '') {
              executionListener.implementation = executionListener.delegateExpression
            }
          }
        }
        return executionListeners
      }
    },
    mounted () {},
    methods: {
      currentListenerChange (ifSelected, row) {
        this.hasSelectRow = ifSelected
        this.selectedListener = row
        // 联动清除
        this.$refs.fildTable.clearSelected()

        if (this.selectedListener) {
          let fields = this.selectedListener.fields
          if (fields !== undefined && fields !== null) {
            for (let i = 0; i < fields.length; i++) {
              let field = fields[i]
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

          this.fields = this.selectedListener.fields
          // for (let i = 0; i < this.selectedListener.fields.length; i++) {
          //   this.fields.push(this.selectedListener.fields[i])
          // }
        }
      },
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
        const newListener = {
          event: 'start',
          implementation: '',
          className: '',
          expression: '',
          delegateExpression: ''
        }
        this.executionListeners.push(newListener)
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
      currentFieldChange (ifSelected, row) {
        this.hasFieldSelectRow = ifSelected
        this.selectedField = row
      },
      addNewField () {
        if (this.hasSelectRow) {
          if (!this.selectedListener.fields) {
            this.selectedListener.fields = []
          }

          const newField = {
            name: 'fieldName',
            implementation: '',
            stringValue: '',
            expression: '',
            string: ''
          }
          this.selectedListener.fields.push(newField)
        } else {
          // this.$message({
          //   type: 'warning',
          //   message: '请先选择一个执行监听器'
          // })
        }
      },
      // Click handler for save button
      save () {
        if (this.executionListeners.length > 0) {
          this.property.value = {
            executionListeners: this.executionListeners
          }
        } else {
          this.property.value = null
        }
        this.$emit('updateProperty', { property: this.property })
      },
      // Close button handler
      close () {
        this.property.mode = 'read'
      }
    }
  }
</script>

<style scoped>

</style>