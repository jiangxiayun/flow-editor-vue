<template>
  <DialogWrapper
      visible
      :property="property"
      :modal-append-to-body="false"
      @cancelHandle="close"
      @saveHandle="save"
      width="60%">
    <div class="modal-body-with-overflow">
      <div class="detail-group clearfix">
        <div class="col-xs-12">
          <div class="alert alert-error" v-show="!loadingForms && formError">
            {{$t('PROPERTY.FORMREFERENCE.ERROR.FORM')}}
          </div>
        </div>
      </div>
      <div class="detail-group clearfix">
        <div class="col-xs-12 editor-item-picker">
          <template v-if="!loadingForms && !formError">
            <div class="col-xs-4 editor-item-picker-component"
                 v-for="form in forms"
                 :key="form.id"
                 :class="{'selected' : form.formId == selectedForm.formId}"
                 @click="(event) => selectForm(form, event)">
              <div class="controls">
                <input type="checkbox" value="option1"
                       @click="selectForm(form, $event)"
                       :checked="form.id == selectedForm.id"/>
              </div>
              <h4>{{form.name}}</h4>
              <img :src="getModelThumbnailUrl(form.id)"/>
            </div>
          </template>
          <div v-show="loadingForms">
            <p class="loading">{{$t('PROPERTY.FORMREFERENCE.FORM.LOADING')}}</p>
          </div>
          <div v-show="!loadingForms && forms.length == 0">
            <p>{{$t('PROPERTY.FORMREFERENCE.FORM.EMPTY')}}</p>
          </div>
        </div>
      </div>
    </div>

  </DialogWrapper>
</template>

<script>
  import DialogWrapper from './DialogWrapper'
  import APIS from '@/service'
  const formList = require('@/mock/form-models.json')

  export default {
    name: 'form-reference-write-template',
    data () {
      return {
        'loadingForms' : true,
        'formError' : false,
        forms: [],
        selectedForm: {}
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
    components: { DialogWrapper },
    computed: {
    },
    mounted () {
      this.selectedForm = this.property.value
      this.loadForms()
    },
    methods: {
      loadForms () {
        // this.loadingForms = true
        // APIS.getFormModelsUrl().then(res => {
        //   this.loadingForms = false
        //   this.formError = false
        //   this.forms = res.data
        // }).catch(() => {
        //   this.loadingForms = false
        //   this.formError = true
        // })

        this.forms = formList.data
        this.loadingForms = false
        this.formError = false
      },
      // Selecting/deselecting a subprocess
      selectForm (form, $event) {
        $event.stopPropagation()
        if (this.selectedForm && this.selectedForm.id && form.id == this.selectedForm.id) {
          // un-select the current selection
          this.selectedForm = null
        } else {
          this.selectedForm = form
        }
      },
      // Click handler for save button
      save () {
        if (this.selectedForm) {
          this.property.value = {
            'id': this.selectedForm.id,
            'name': this.selectedForm.name,
            'key': this.selectedForm.key
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