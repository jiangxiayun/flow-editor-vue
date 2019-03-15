<template>
  <el-dialog
      :title="$t('PROCESS.POPUP.IMPORT-TITLE')"
      :visible.sync="dialogCreateVisible"
      width="30%">
   <div>
     <p>
       <i class="glyphicon glyphicon-info-sign"></i>
       {{$t('PROCESS.POPUP.IMPORT-DESCRIPTION')}}
     </p>
     <!--[if IE 9]>
     <div class="import-process-form">
       <input type="file" ngf-select="" ngf-change="onFileSelect($files, true)" style="font-size: smaller; padding-top:6px;" >
       <div class="import-process-dropbox"
            ngf-drop="onFileSelect($files)"
            ngf-drag-over-class="dragover"
            v-show="dropSupported">
         {{$t('PROCESS.POPUP.IMPORT.DROPZONE')}}
       </div>
       <div ngf-drop-available="dropSupported=true"
            v-show="!dropSupported">{{$t('PROCESS.POPUP.IMPORT.NO-DROP')}}</div>
       <div class="graph-wrapper" v-show="status.loading" style="margin: 10px 0 10px 0">
         <div class="graph-bar" :style="{width: model.uploadProgress + '%'}"></div>
       </div>
       <button class="btn btn-danger btn-sm"
               @click="upload.abort()"
               :disabled="!status.loading"
               style="margin-bottom: 20px">
         {{$t('PROCESS.POPUP.IMPORT.CANCEL-UPLOAD')}}
       </button>

     </div>
     <![endif]-->
     <!--[if gt IE 9]> <!-- -->
     <div class="import-process-form">
       <input type="file" ngf-select="" ngf-change="onFileSelect($files)"
              style="font-size: smaller; padding-top:6px;" >
       <div class="import-process-dropbox"
            ngf-drop
            ngf-change="onFileSelect($files)"
            ngf-drag-over-class="dragover"
            v-show="dropSupported">
         {{$t('PROCESS.POPUP.IMPORT.DROPZONE')}}
       </div>
       <div ngf-drop-available="dropSupported=true"
            v-show="!dropSupported">{{$t('PROCESS.POPUP.IMPORT.NO-DROP')}}</div>
       <div class="graph-wrapper" v-show="status.loading" style="margin: 10px 0 10px 0">
         <div class="graph-bar" :style="{width: model.uploadProgress + '%'}"></div>
       </div>
       <button class="btn btn-danger btn-sm"
               @click="upload.abort()"
               :disabled="!status.loading"
               style="margin-bottom: 20px">
         {{$t('PROCESS.POPUP.IMPORT.CANCEL-UPLOAD')}}
       </button>
     </div>
     <!-- <![endif]-->
   </div>

    <span slot="footer" class="dialog-footer">
      <div class="pull-right modeler-processes-error" v-if="model.error">
        <span>{{$t('PROCESS.POPUP.IMPORT.ERROR')}}
          <span ng-if="model.errorMessage"> : </span>
          {{model.errorMessage}}
        </span>
      </div>
    </span>
  </el-dialog>

</template>

<script>

  export default {
    name: 'process-import',
    data () {
      return {
        model: {
          loading: false
        }
      }
    },
    methods: {
      onFileSelect ($files, isIE) {
        this.model.loading = true;

        for (let i = 0; i < $files.length; i++) {
          let file = $files[i];

          let url;
          if (isIE) {
            url = FLOWABLE.APP_URL.getImportProcessModelTextUrl();
          } else {
            url = FLOWABLE.APP_URL.getImportProcessModelUrl();
          }

          Upload.upload({
            url: url,
            method: 'POST',
            file: file
          }).progress(function(evt) {
            this.model.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);

          }).success(function(data) {
            this.model.loading = false;

            $location.path("/editor/" + data.id);
            this.$hide();

          }).error(function(data) {

            if (data && data.message) {
              this.model.errorMessage = data.message;
            }

            this.model.error = true;
            this.model.loading = false;
          });
        }
      }
    }
  }
</script>

<style scoped>

</style>