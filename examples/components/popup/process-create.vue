<template>
  <el-dialog
      :title="$t('PROCESS.POPUP.CREATE-TITLE')"
      :visible.sync="dialogCreateVisible"
      width="30%">

    <p>{{$t('PROCESS.POPUP.CREATE-DESCRIPTION')}}</p>
    <div v-if="model.errorMessage && model.errorMessage.length > 0" class="alert error"
         style="font-size: 14px; margin-top:20px">
      <div class="popup-error" style="font-size: 14px">
        <span class="glyphicon glyphicon-remove-circle"></span>
        <span>{{model.errorMessage}}</span>
      </div>
    </div>
    <div class="form-group">
      <label for="newProcessName">{{$t('PROCESS.NAME')}}</label>
      <input :disabled="model.loading" type="text" class="form-control"
             id="newProcessName" v-model="model.process.name" auto-focus editor-input-check>
    </div>
    <div class="form-group">
      <label for="newProcessKey">{{$t('PROCESS.KEY')}}</label>
      <input :disabled="model.loading" type="text" class="form-control"
             id="newProcessKey" v-model="model.process.key" editor-input-check>
    </div>
    <div class="form-group">
      <label for="newProcessDescription">{{$t('PROCESS.DESCRIPTION')}}</label>
      <textarea :disabled="model.loading" class="form-control" id="newProcessDescription" rows="5"
                v-model="model.process.description"></textarea>
    </div>

    <span slot="footer" class="dialog-footer">
    <el-button @click="closeDialogCreate"
               :disabled="model.loading">{{$t('GENERAL.ACTION.CANCEL')}}</el-button>
    <el-button type="primary" @click="createProcess"
               :disabled="model.loading || !model.process.name || model.process.name.length == 0 || !model.process.key || model.process.key.length == 0">
      {{$t('PROCESS.ACTION.CREATE-CONFIRM')}}
    </el-button>
  <div class="loading pull-right" v-show="model.loading">
					<div class="l1"></div><div class="l2"></div><div class="l2"></div>
				</div>
    </span>
  </el-dialog>
</template>

<script>

  export default {
    name: 'process-create',
    data () {
      return {
        dialogCreateVisible: false,
        model: {
          loading: false,
          process: {
            name: '',
            key: '',
            description: '',
            modelType: 0
          }
        }
      }
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      }
    },
    mounted () {

    },
    methods: {
      closeDialogCreate () {
        this.dialogCreateVisible = false
      },
      createProcess () {
        if (!this.model.process.name || this.model.process.name.length === 0 ||
          !this.model.process.key || this.model.process.key.length === 0) {
          return
        }

        this.model.loading = true
        // $http({
        //   method: 'POST',
        //   url: FLOWABLE.APP_URL.getModelsUrl(),
        //   data: this.model.process
        // }).success(function (data) {
        //   this.$hide()
        //
        //   this.model.loading = false
        //   $rootScope.editorHistory = []
        //   $location.path('/editor/' + data.id)
        // }).error(function (data, status, headers, config) {
        //   this.model.loading = false
        //   this.model.errorMessage = data.message
        // })
      }
    }
  }
</script>

<style scoped>

</style>