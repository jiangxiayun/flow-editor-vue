<template>
  <div>
    <el-table
        ref="objectTable"
        border
        highlight-current-row
        :data="tableData"
        max-height="450"
        style="width: 100%"
        :empty-text="$t('PROPERTY.DATAPROPERTIES.EMPTY')"
        @row-click="rowClick">
      <slot></slot>
    </el-table>
    <div class="pull-right">
      <div class="btn-group">
        <a v-if="layoutAry.includes('moveUp')"
            class="btn btn-icon btn-lg" :title="$t('ACTION.MOVE.UP')" @click="movePropertyUp">
          <i class="glyphicon glyphicon-arrow-up"></i>
        </a>
        <a v-if="layoutAry.includes('moveDown')"
           class="btn btn-icon btn-lg" :title="$t('ACTION.MOVE.DOWN')" @click="movePropertyDown">
          <i class="glyphicon glyphicon-arrow-down"></i>
        </a>
      </div>
      <div class="btn-group">
        <a v-if="layoutAry.includes('addNew')"
           class="btn btn-icon btn-lg" :title="$t('ACTION.ADD')" @click="addNewProperty">
          <i class="glyphicon glyphicon-plus"></i>
        </a>
        <a v-if="layoutAry.includes('remove')"
           class="btn btn-icon btn-lg"
           :title="$t('ACTION.REMOVE')" @click="removeProperty">
          <i class="glyphicon glyphicon-minus"></i>
        </a>
      </div>
    </div>
  </div>

</template>

<script>

  export default {
    name: 'table-sort-template',
    data () {
      return {
        selectedProperty: {},
        hasSelectRow: false
      }
    },
    props: {
      tableData: {
        type: Array,
        default: () => []
      },
      property: {
        type: Object,
        default: function () {
          return {}
        }
      },
      layout: {
        type: String,
        default: 'moveUp,moveDown,addNew,remove'
      }
    },
    computed: {
      layoutAry () {
        return this.layout.split(',')
      }
    },
    mounted () {},
    methods: {
      clearSelected () {
        this.rowClick(false, {})
      },
      rowClick (row) {
        if (row) {
          this.hasSelectRow = true
          this.selectedProperty = row
          this.$emit('currentRowChange', true, row)
        } else {
          this.hasSelectRow = false
          this.selectedProperty = {}
          this.$refs.objectTable.setCurrentRow()
          this.$emit('currentRowChange', false, {})
        }
      },
      addNewProperty () {
        this.$emit('add-newRow')
        this.$nextTick(() => {
          let length = this.tableData.length
          let newRow = this.tableData[length - 1]
          this.$refs.objectTable.setCurrentRow(newRow)
          this.rowClick(newRow)
        })
      },
      // Click handler for remove button
      removeProperty () {
        if (this.hasSelectRow) {
          const selectedItems = this.selectedProperty
          let index = this.tableData.indexOf(selectedItems)

          this.rowClick()
          this.tableData.splice(index, 1)
        }
      },
      // Click handler for up button
      movePropertyUp () {
        const selectedItems = this.selectedProperty
        if (this.hasSelectRow) {
          let index = this.tableData.indexOf(selectedItems)
          if (index !== 0) {
            // If it's the first, no moving up of course
            let temp = this.tableData.splice(index, 1)
            console.log('temp', index, temp)
            this.$nextTick(() => {
              this.tableData.splice(index + -1, 0, temp[0])
            })
          }
        }
      },
      // Click handler for down button
      movePropertyDown () {
        const selectedItems = this.selectedProperty
        if (this.hasSelectRow) {
          let index = this.tableData.indexOf(selectedItems)
          if (index !== this.tableData.length - 1) {
            // If it's the last element, no moving down of course
            let temp = this.tableData.splice(index, 1)
            this.tableData.splice(index + 1, 0, temp[0])
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>