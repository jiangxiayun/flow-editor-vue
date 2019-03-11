<template>
  <!--表单信息区域-->
  <div id="propertiesHelpWrapper" class="col-xs-12">
    <div class="propertySection" id="propertySection"
         :class="{collapsed: propertyWindowState.collapsed}">
      <div class="selected-item-section">
        <div class="clearfix">
          <div class="pull-right" v-if="selectedItem.auditData && selectedItem.auditData.createDate">
            <strong>{{$t('ELEMENT.DATE_CREATED')}}: </strong> {{selectedItem.auditData.createDate}}
          </div>
          <div class="pull-right" v-if="selectedItem.auditData && selectedItem.auditData.author">
            <strong>{{$t('ELEMENT.AUTHOR')}}: </strong> {{selectedItem.auditData.author}}
          </div>
          <div class="selected-item-title">
            <a @click="propertyWindowStateToggle">
              <i class="glyphicon"
                 :class="{'glyphicon-chevron-right': propertyWindowState.collapsed,
                 'glyphicon-chevron-down': !propertyWindowState.collapsed}"></i>
              <span v-show="selectedItem.title != undefined && selectedItem.title != null &&
              selectedItem.title.length > 0">{{selectedItem.title}}</span>
              <span v-show="!selectedItem || selectedItem.title == undefined ||
              selectedItem.title == null || selectedItem.title.length == 0">{{modelData.name}}</span>
            </a>
          </div>
        </div>
        <div class="selected-item-body">
          <div>
            <div class="property-row" v-for="(property, index) in selectedItem.properties"
                 :key="index" :class="{'clear' : index%2 == 0}"
                 @click="propertyClicked(index)">
              <span class="title" v-if="!property.hidden">{{ property.title }}&nbsp;:</span>
              <span class="title-removed" v-if="property.hidden">
                <i>{{ property.title }}&nbsp;({{'PROPERTY.REMOVED' | translate}})&nbsp;:</i>
              </span>
              <span class="value">
                {{property.templateUrl}}
                <Property-template :properties="property.templateUrl"></Property-template>
                <!--<Property-template v-if="!property.hasReadWriteMode" :properties="property.templateUrl"></Property-template>-->
                <!--<Property-template v-if="property.hasReadWriteMode && property.mode == 'read'"></Property-template>-->
                <!--<Property-template v-if="property.hasReadWriteMode && property.mode == 'write'"></Property-template>-->
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import PropertyTemplate from '@/components/propertyForm/Property-template'

  export default {
    name: "propertySection",
    data () {
      return {
        propertyWindowState: {'collapsed': false}
      }
    },
    props: {
      editorManager: {}
    },
    components: {PropertyTemplate},
    mounted () {

    },
    computed: {
      modelData () {
        return this.editorManager ? this.editorManager.getBaseModelData() : {}
      },
      selectedItem () {
        return this.editorManager ? this.editorManager.getSelectedItem() : {
          title: '',
          properties: [],
          auditData: {}
        }
      }
    },
    methods: {
      propertyWindowStateToggle () {
        this.propertyWindowState.collapsed = !this.propertyWindowState.collapsed;
        setTimeout(function () {
          window.dispatchEvent(new Event("resize"));
        }, 100);
      }
    }
  }
</script>

<style scoped>

</style>