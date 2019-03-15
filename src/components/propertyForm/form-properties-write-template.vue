<template>
  <DialogWrapper
      visible
      :property="property"
      :modal-append-to-body="false"
      @cancelHandle="close"
      @saveHandle="save"
      width="60%">
    <div class="row row-no-gutter">
      <div class="col-xs-6">
        <table-sort-template :property="property"
                             :tableData="formProperties"
                             @add-newRow="addNewProperty"
                             @currentRowChange="currentRowChange">
          <el-table-column
              prop="id"
              :label="$t('PROPERTY.FORMPROPERTIES.ID')">
          </el-table-column>
          <el-table-column
              prop="name"
              :label="$t('PROPERTY.FORMPROPERTIES.NAME')">
          </el-table-column>
          <el-table-column
              prop="type"
              :label="$t('PROPERTY.FORMPROPERTIES.TYPE')">
          </el-table-column>
        </table-sort-template>
      </div>

      <div class="col-xs-6">
        <div v-show="hasSelectRow">
          <div class="form-group">
            <label for="idField">{{$t('PROPERTY.FORMPROPERTIES.ID')}}</label>
            <input id="idField" class="form-control" type="text" v-model="selectedProperty.id"
                   :placeholder="$t('PROPERTY.FORMPROPERTIES.ID.PLACEHOLDER')"/>
          </div>
          <div class="form-group">
            <label for="nameField">{{$t('PROPERTY.FORMPROPERTIES.NAME')}}</label>
            <input id="nameField" class="form-control" type="text" v-model="selectedProperty.name"
                   :placeholder="$t('PROPERTY.FORMPROPERTIES.NAME.PLACEHOLDER')"/>
          </div>
          <div class="form-group">
            <label for="typeFieldType">{{$t('PROPERTY.FORMPROPERTIES.TYPE')}}</label>
            <select id="typeFieldType" class="form-control" v-model="selectedProperty.type"
                    @change="propertyTypeChanged">
              <option>string</option>
              <option>long</option>
              <option>boolean</option>
              <option>date</option>
              <option>enum</option>
            </select>
          </div>
          <div class="form-group" v-show="selectedProperty.datePattern">
            <label for="datePatternField">{{$t('PROPERTY.FORMPROPERTIES.DATEPATTERN')}}</label>
            <input id="datePatternField" class="form-control" type="text"
                   v-model="selectedProperty.datePattern"
                   :placeholder="$t('PROPERTY.FORMPROPERTIES.DATEPATTERN.PLACEHOLDER')"/>
          </div>
          <div v-show="selectedProperty.type == 'enum'" style="padding-bottom:10px">
            <div class="row row-no-gutter">
              <div class="col-xs-6">
                <table-sort-template :property="property"
                                     :tableData="enumValues"
                                     ref="enumTable"
                                     @add-newRow="addNewEnumValue"
                                     @currentRowChange="currentEnumChange">
                  <el-table-column
                      prop="id"
                      :label="$t('PROPERTY.FORMPROPERTIES.ID')">
                  </el-table-column>
                  <el-table-column
                      prop="name"
                      :label="$t('PROPERTY.FORMPROPERTIES.NAME')">
                  </el-table-column>
                </table-sort-template>
              </div>
              <div class="col-xs-6">
                <div v-show="selectedEnumValue">
                  <div class="form-group">
                    <label for="classField">{{$t('PROPERTY.FORMPROPERTIES.VALUES.ID')}}</label>
                    <input type="text" id="classField" class="form-control"
                           v-model="selectedEnumValue.id"
                           :placeholder="$t('PROPERTY.FORMPROPERTIES.VALUES.ID.PLACEHOLDER')"/>
                  </div>
                  <div class="form-group">
                    <label for="classFieldName">{{$t('PROPERTY.FORMPROPERTIES.VALUES.NAME')}}</label>
                    <input type="text" id="classFieldName" class="form-control"
                           v-model="selectedEnumValue.name"
                           :placeholder="$t('PROPERTY.FORMPROPERTIES.VALUES.NAME.PLACEHOLDER')"/>
                  </div>
                </div>
                <div v-show="!selectedEnumValue" class="muted no-property-selected">
                  {{$t('PROPERTY.FORMPROPERTIES.ENUMVALUES.EMPTY')}}
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label for="expressionField">{{$t('PROPERTY.FORMPROPERTIES.EXPRESSION')}}</label>
            <input id="expressionField" class="form-control" type="text"
                   v-model="selectedProperty.expression"
                   :placeholder="$t('PROPERTY.FORMPROPERTIES.EXPRESSION.PLACEHOLDER')"/>
          </div>
          <div class="form-group">
            <label for="variableField">{{$t('PROPERTY.FORMPROPERTIES.VARIABLE')}}</label>
            <input id="variableField" class="form-control" type="text"
                   v-model="selectedProperty.variable"
                   :placeholder="$t('PROPERTY.FORMPROPERTIES.VARIABLE.PLACEHOLDER')"/>
          </div>
          <div class="form-inline">
            <div class="form-group col-xs-2">
              <label for="requiredField">{{$t('PROPERTY.FORMPROPERTIES.REQUIRED')}}</label>
              <input id="requiredField" class="checkbox" type="checkbox"
                     v-model="selectedProperty.required"/>
            </div>
            <div class="form-group col-xs-2">
              <label for="readableField">{{$t('PROPERTY.FORMPROPERTIES.READABLE')}}</label>
              <input id="readableField" class="checkbox" type="checkbox"
                     v-model="selectedProperty.readable"/>
            </div>
            <div class="form-group col-xs-2">
              <label for="writableField">{{$t('PROPERTY.FORMPROPERTIES.WRITABLE')}}</label>
              <input id="writableField" class="checkbox" type="checkbox"
                     v-model="selectedProperty.writable"/>
            </div>
          </div>
        </div>
        <div v-show="!hasSelectRow" class="muted no-property-selected">
          {{$t('PROPERTY.FORMPROPERTIES.EMPTY')}}
        </div>
      </div>
    </div>
  </DialogWrapper>
</template>

<script>
  import DialogWrapper from './DialogWrapper'
  import tableSortTemplate from './table-sort-template'

  export default {
    name: 'form-properties-write-template',
    data () {
      return {
        hasSelectRow: false,
        selectedProperty: {},
        hasSelectEnum: false,
        selectedEnumValue: {},
        propertyIndex: 1
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
      formProperties () {
        let formProperties = []
        // Put json representing form properties on scope
        if (this.property.value !== undefined && this.property.value !== null
          && this.property.value.formProperties !== undefined
          && this.property.value.formProperties !== null) {
          // Note that we clone the json object rather then setting it directly,
          // this to cope with the fact that the user can click the cancel button and no changes should have happended
          formProperties = jQuery.extend(true, [], this.property.value.formProperties)

          for (let i = 0; i < formProperties.length; i++) {
            let formProperty = formProperties[i]
            if (formProperty.enumValues && formProperty.enumValues.length > 0) {
              for (let j = 0; j < formProperty.enumValues.length; j++) {
                let enumValue = formProperty.enumValues[j]
                if (!enumValue.id && !enumValue.name && enumValue.value) {
                  enumValue.id = enumValue.value
                  enumValue.name = enumValue.value
                }
              }
            }
          }

        }
        return formProperties
      },
      enumValues () {
        let enumValues = []
        return enumValues
      }
    },
    methods: {
      currentRowChange (ifSelected, row) {
        this.hasSelectRow = ifSelected
        this.selectedProperty = row
        // 联动清除
        this.$refs.enumTable.clearSelected()

        this.selectedEnumValue = {}
        if (this.selectedProperty && this.selectedProperty.enumValues) {
          this.enumValues = this.selectedProperty.enumValues
        }
      },
      currentEnumChange (ifSelected, row) {
        this.hasSelectEnum = ifSelected
        this.selectedEnumValue = row
      },
      addNewProperty () {
        const newProperty = {
          id: 'new_property_' + this.propertyIndex++,
          name: '',
          type: 'string',
          readable: true,
          writable: true
        }
        this.formProperties.push(newProperty)
      },
      addNewEnumValue () {
        if (this.selectedProperty) {
          const newEnumValue = { id: '', name: '' }
          this.enumValues.push(newEnumValue)
        }
      },
      propertyTypeChanged () {
        // Check date. If date, show date pattern
        if (this.selectedProperty.type === 'date') {
          this.selectedProperty.datePattern = 'MM-dd-yyyy hh:mm'
        } else {
          delete this.selectedProperty.datePattern
        }

        // Check enum. If enum, show list of options
        if (this.selectedProperty.type === 'enum') {
          this.selectedProperty.enumValues = [{ id: 'value1', name: 'Value 1' }, { id: 'value2', name: 'Value 2' }]
          this.enumValues = this.selectedProperty.enumValues
        } else {
          delete this.selectedProperty.enumValues
          this.enumValues = []
        }
      },
      // Click handler for save button
      save () {
        if (this.formProperties.length > 0) {
          this.property.value = {
            formProperties: this.formProperties
          }
        } else {
          this.property.value = null
        }

        this.$emit('updateProperty', { property: this.property })
        this.close()
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