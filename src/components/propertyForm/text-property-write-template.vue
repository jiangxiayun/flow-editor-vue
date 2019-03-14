<template>
  <!--文本框编辑-->
  <el-dialog
      :title="`${$t('PROPERTY.PROPERTY.EDIT.TITLE')} “${$t(this.property.title)}”`"
      visible
      append-to-body
      @close="close"
      width="60%">
    <textarea v-focus
              class="form-control"
              v-model="property.value"
              style="width:70%; height:100%; max-width: 100%; max-height: 100%; min-height: 200px">
    </textarea>

    <span slot="footer" class="dialog-footer">
    <el-button @click="close">{{$t('ACTION.CANCEL')}}</el-button>
    <el-button type="primary" @click="save">{{$t('ACTION.SAVE')}}</el-button>
  </span>
  </el-dialog>
</template>

<script>

  export default {
    name: 'text-property-write-template',
    data() {
      return {  }
    },
    props: {
      property: {
        type: Object,
        default: function () {
          return { title: '' }
        }
      }
    },
    methods: {
      // Click handler for save button
      save () {
        this.$emit('updateProperty', {property: this.property})
        this.close();
      },
      close () {
        this.property.mode = 'read';
      }
    },
    beforeDestroy () {
      this.property.mode = 'read';
    }
  }
</script>

<style scoped>

</style>