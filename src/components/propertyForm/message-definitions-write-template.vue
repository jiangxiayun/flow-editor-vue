<template>
  <DialogWrapper
      visible
      :property="property"
      :modal-append-to-body="false"
      @cancelHandle="close"
      @saveHandle="save"
      width="60%">
    <div class="row row-no-gutter">

      <div class="col-xs-8">
        <table-sort-template :property="property"
                             :tableData="messageDefinitions"
                             layout="addNew,remove"
                             @add-newRow="addNewMessageDefinition"
                             @currentRowChange="currentRowChange">
          <el-table-column
              prop="id"
              :label="$t('PROPERTY.MESSAGEDEFINITIONS.ID')">
          </el-table-column>
          <el-table-column
              prop="name"
              :label="$t('PROPERTY.MESSAGEDEFINITIONS.NAME')">
          </el-table-column>
        </table-sort-template>
      </div>

      <div class="col-xs-4" v-show="hasSelectRow">
        <div class="form-group">
          <label>{{$t('PROPERTY.MESSAGEDEFINITIONS.ID')}}</label>
          <input type="text" class="form-control" v-model="selectedMessageDefinition.id">
        </div>

        <div class="form-group">
          <label>{{$t('PROPERTY.MESSAGEDEFINITIONS.NAME')}}</label>
          <input type="text" class="form-control" v-model="selectedMessageDefinition.name">
        </div>

      </div>

    </div>

  </DialogWrapper>
</template>


<script>
  import DialogWrapper from './DialogWrapper'
  import tableSortTemplate from './table-sort-template'

  export default {
    name: 'message-definitions-write-template',    data () {
      return {
        hasSelectRow: false,
        selectedMessageDefinition: {}
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
      messageDefinitions () {
        let messageDefinitions = []
        // Put json representing mesage definitions on scope
        if (this.property.value !== undefined &&
          this.property.value !== null && this.property.value.length > 0) {
          if (this.property.value.constructor == String) {
            messageDefinitions = JSON.parse(this.property.value)
          } else {
            // Note that we clone the json object rather then setting it directly,
            // this to cope with the fact that the user can click the cancel button and no changes should have happened
            messageDefinitions = jQuery.extend(true, [], this.property.value)
          }
        }
        return messageDefinitions
      }
    },
    methods: {
      currentRowChange (ifSelected, row) {
        this.hasSelectRow = ifSelected
        this.selectedMessageDefinition = row
      },
      // Click handler for add button
      addNewMessageDefinition () {
        const newMessageDefinition = { id: '', name: '' }
        this.messageDefinitions.push(newMessageDefinition)
      },
      // Click handler for save button
      save () {
        if (this.messageDefinitions.length > 0) {
          this.property.value = this.messageDefinitions
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