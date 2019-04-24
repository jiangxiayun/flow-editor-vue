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
                             :tableData="signalDefinitions"
                             layout="addNew,remove"
                             @add-newRow="addNewSignalDefinition"
                             @currentRowChange="currentRowChange">
          <el-table-column
              prop="id"
              :label="$t('PROPERTY.SIGNALDEFINITIONS.ID')">
          </el-table-column>
          <el-table-column
              prop="name"
              :label="$t('PROPERTY.SIGNALDEFINITIONS.NAME')">
          </el-table-column>
          <el-table-column
              prop="scope"
              :label="$t('PROPERTY.SIGNALDEFINITIONS.SCOPE')">
          </el-table-column>
        </table-sort-template>
      </div>

      <div class="col-xs-4" v-show="hasSelectRow">
<!--{{selectedSignalDefinition}}-->
        <div class="form-group">
          <label>{{$t('PROPERTY.SIGNALDEFINITIONS.ID')}}</label>
          <input type="text" class="form-control" v-model="selectedSignalDefinition.id">
        </div>

        <div class="form-group">
          <label>{{$t('PROPERTY.SIGNALDEFINITIONS.NAME')}}</label>
          <input type="text" class="form-control" v-model="selectedSignalDefinition.name">
        </div>

        <div class="form-group">
          <label>{{$t('PROPERTY.SIGNALDEFINITIONS.SCOPE')}}</label>
          <select class="form-control" v-model="selectedSignalDefinition.scope">
            <!--ng-options="option.value as option.translationId | translate for option in scopeOptions"-->
            <option v-for="option in scopeOptions"
                    :key="option.translationId" :value="option.value">
              {{$t(option.translationId)}}
            </option>
          </select>
        </div>

      </div>

    </div>

  </DialogWrapper>
</template>

<script>
  import DialogWrapper from './DialogWrapper'
  import tableSortTemplate from './table-sort-template'

  export default {
    name: 'signal-definitions-write-template',
    data () {
      return {
        hasSelectRow: false,
        selectedSignalDefinition: {},
        scopeOptions: [
          { 'value': 'global', 'translationId': 'PROPERTY.SIGNALDEFINITIONS.SCOPE-GLOBAL' },
          { 'value': 'processInstance', 'translationId': 'PROPERTY.SIGNALDEFINITIONS.SCOPE-PROCESSINSTANCE' }
        ]
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
      signalDefinitions () {
        let signalDefinitions = []
        // Put json representing signal definitions on scope
        if (this.property.value !== undefined && this.property.value !== null && this.property.value.length > 0) {
          if (this.property.value.constructor == String) {
            signalDefinitions = JSON.parse(this.property.value)
          } else {
            // Note that we clone the json object rather then setting it directly,
            // this to cope with the fact that the user can click the cancel button and no changes should have happened
            signalDefinitions = jQuery.extend(true, [], this.property.value)
          }
        }
        return signalDefinitions
      }
    },
    methods: {
      currentRowChange (ifSelected, row) {
        this.hasSelectRow = ifSelected
        this.selectedSignalDefinition = row
      },
      // Click handler for add button
      addNewSignalDefinition () {
        const newSignalDefinition = { id: '', name: '', scope: 'global' }
        this.signalDefinitions.push(newSignalDefinition)
      },
      // Click handler for save button
      save () {
        if (this.signalDefinitions.length > 0) {
          this.property.value = this.signalDefinitions
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