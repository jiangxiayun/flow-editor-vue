<template>
  <!--文本框编辑-->
  <el-dialog
      :title="$t('PROPERTY.SEQUENCEFLOW.CONDITION.TITLE')"
      visible
      append-to-body
      @close="close"
      width="60%">
    <div class="detail-group clearfix">
      <div class="col-xs-12">
        <label class="col-xs-3">{{$t('PROPERTY.SEQUENCEFLOW.CONDITION.STATIC')}}</label>
        <div class="col-xs-9">
          <textarea v-focus
                    class="form-control"
                    v-model="expression.staticValue"
                    style="width:70%; height:100%; max-width: 100%; max-height: 100%; min-height: 50px"/>
        </div>
      </div>

    </div>

    <span slot="footer" class="dialog-footer">
    <el-button @click="close">{{$t('ACTION.CANCEL')}}</el-button>
    <el-button type="primary" @click="save">{{$t('ACTION.SAVE')}}</el-button>
  </span>
  </el-dialog>
</template>

<script>

  export default {
    name: 'condition-expression-write-template',
    data () {
      return {
        expression: {}
      }
    },
    props: {
      property: {
        type: Object,
        default: function () {
          return { title: '' }
        }
      }
    },
    mounted () {
      if (this.property.value !== undefined && this.property.value !== null
        && this.property.value.expression !== undefined
        && this.property.value.expression !== null) {

        this.expression = this.property.value.expression

      } else if (this.property.value !== undefined && this.property.value !== null) {
        this.expression = { type: 'static', staticValue: this.property.value }

      } else {
        this.expression = {}
      }
    },
    methods: {
      // Click handler for save button
      save () {
        this.property.value = { expression: this.expression }
        this.$emit('updateProperty', { property: this.property })
        this.close()
      },
      close () {
        this.property.mode = 'read'
      }
    },
    beforeDestroy () {
      this.property.mode = 'read'
    }
  }
</script>

<style scoped>

</style>