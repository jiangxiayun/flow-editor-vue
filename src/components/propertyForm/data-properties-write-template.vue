<template>
  <DialogWrapper
      visible
      :property="property"
      :modal-append-to-body="false"
      @cancelHandle="close"
      @saveHandle="save"
      width="60%">
    <div class="modal-body">
      <div class="row row-no-gutter">

        <div class="col-xs-6">
          <table-sort-template :property="property"
                               :tableData="tableData"
                               @add-newRow="addNewRow"
                               @currentRowChange="currentRowChange">
            <el-table-column
                prop="dataproperty_id"
                :label="$t('PROPERTY.DATAPROPERTIES.ID')">
            </el-table-column>
            <el-table-column
                prop="dataproperty_name"
                :label="$t('PROPERTY.DATAPROPERTIES.NAME')">
            </el-table-column>
            <el-table-column
                prop="dataproperty_type"
                :label="$t('PROPERTY.DATAPROPERTIES.TYPE')">
            </el-table-column>
            <el-table-column
                prop="dataproperty_value"
                :label="$t('PROPERTY.DATAPROPERTIES.VALUE')">
            </el-table-column>
          </table-sort-template>
        </div>
        <div class="col-xs-6">
          <!--{{selectedProperty}}-->
          <div v-show="hasSelectRow">
            <div class="form-group">
              <label for="idField">{{$t('PROPERTY.DATAPROPERTIES.ID')}}</label>
              <input id="idField" class="form-control" type="text"
                     v-model="selectedProperty.dataproperty_id"
                     :placeholder="$t('PROPERTY.DATAPROPERTIES.ID.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="nameField">{{$t('PROPERTY.DATAPROPERTIES.NAME')}}</label>
              <input id="nameField" class="form-control" type="text"
                     v-model="selectedProperty.dataproperty_name"
                     :placeholder="$t('PROPERTY.DATAPROPERTIES.NAME.PLACEHOLDER')"/>
            </div>
            <div class="form-group">
              <label for="typeField">{{$t('PROPERTY.DATAPROPERTIES.TYPE')}}</label>
              <select id="typeField" class="form-control"
                      v-model="selectedProperty.dataproperty_type"
                      @change="propertyTypeChanged">
                <option selected>string</option>
                <option>boolean</option>
                <option>datetime</option>
                <option>double</option>
                <option>int</option>
                <option>long</option>
              </select>
            </div>
            <div class="form-group">
              <label for="valueField">{{$t('PROPERTY.DATAPROPERTIES.VALUE')}}</label>
              <input id="valueField" class="form-control" type="text"
                     v-model="selectedProperty.dataproperty_value"
                     :placeholder="$t('PROPERTY.DATAPROPERTIES.VALUE.PLACEHOLDER')"/>
            </div>
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
    name: 'data-properties-write-template',
    data () {
      return {
        selectedProperty: {},
        hasSelectRow: false,
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
      tableData () {
        let dataProperties = []
        // Put json representing data properties on scope
        if (this.property.value !== undefined
          && this.property.value !== null
          && this.property.value.items !== undefined
          && this.property.value.items !== null) {
          // Note that we clone the json object rather then setting it directly,
          // let dataRows = {...this.property.value.items}
          // for(let i in dataRows) {
          //   dataProperties.push(dataRows[i])
          // }
          // dataProperties = extendDeep(this.property.value.items)
          dataProperties = jQuery.extend(true, [], this.property.value.items)
        }
        return dataProperties
      },
    },
    mounted () {},
    methods: {
      currentRowChange (ifSelected, row) {
        this.hasSelectRow = ifSelected
        this.selectedProperty = row
      },
      addNewRow () {
        const newProperty = {
          dataproperty_id: 'new_data_object_' + this.propertyIndex++,
          dataproperty_name: '',
          dataproperty_type: 'string'
        }
        this.tableData.push(newProperty)
      },
      propertyTypeChanged () {
        // Check date. If date, show date pattern
        if (this.selectedProperty.type === 'date') {
          this.selectedProperty.datePattern = 'MM-dd-yyyy hh:mm'
        } else {
          delete this.selectedProperty.datePattern
        }

        // todo
        // Check enum. If enum, show list of options
        if (this.selectedProperty.type === 'enum') {
          this.selectedProperty.enumValues = [
            { id: 'value1', name: 'Value 1' },
            { id: 'value2', name: 'Value 2' }
            ]
          this.enumValues.length = 0
          for (let i = 0; i < this.selectedProperty.enumValues.length; i++) {
            this.enumValues.push(this.selectedProperty.enumValues[i])
          }
        }
      },
      save () {
        if (this.tableData.length > 0) {
          this.property.value = {
            items: this.tableData
          }
        } else {
          this.property.value = null
        }
        this.$emit('updateProperty', {property: this.property})
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