<template>
  <el-dialog
      :title="showTitle"
      visible
      append-to-body
      @close="cancel"
      width="80%">
    <slot></slot>

    <span slot="footer" class="dialog-footer">
    <el-button @click="cancel">{{$t('ACTION.CANCEL')}}</el-button>
    <el-button type="primary" @click="save">{{$t('ACTION.SAVE')}}</el-button>
  </span>
  </el-dialog>
</template>

<script>
  export default {
    name: 'DialogWrapper',
    data() {
      return {}
    },
    props: {
      property: {
        type: Object,
        default: function () {
          return {}
        }
      },
      title: {
        type: String,
      }
    },
    computed: {
      showTitle () {
        return this.title || `${this.$t('PROPERTY.PROPERTY.EDIT.TITLE')} “${this.property.title}”`
      }
    },
    methods: {
      cancel () {
        this.property.mode = 'read'
        this.$emit('cancelHandle')
      },
      save () {
        this.$emit('saveHandle')
      }
    }
  }
</script>

<style scoped>

</style>