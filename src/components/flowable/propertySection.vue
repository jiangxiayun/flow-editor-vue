<template>
  <!--表单信息区域-->
  <div id="propertiesHelpWrapper" class="col-xs-12">
    <div class="propertySection" id="propertySection"
         :class="{collapsed: propertyWindowState.collapsed}">
      <div class="selected-item-section">
        <div class="clearfix">
          <!--<div class="pull-right" v-if="selectedItem.auditData.createDate">-->
            <!--<strong>{{'ELEMENT.DATE_CREATED' | translate}}: </strong> {{selectedItem.auditData.createDate}}-->
          <!--</div>-->
          <!--<div class="pull-right" v-if="selectedItem.auditData.author">-->
            <!--<strong>{{'ELEMENT.AUTHOR' | translate}}: </strong> {{selectedItem.auditData.author}}-->
          <!--</div>-->
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
              <span class="value"></span>
              <!--<ng-include-->
              <!--src="getPropertyTemplateUrl($index)" v-if="!property.hasReadWriteMode"></ng-include>-->
              <!--<ng-include src="getPropertyReadModeTemplateUrl($index)"-->
              <!--v-if="property.hasReadWriteMode && property.mode == 'read'"></ng-include>-->
              <!--<ng-include src="getPropertyWriteModeTemplateUrl($index)"-->
              <!--v-if="property.hasReadWriteMode && property.mode == 'write'"></ng-include>-->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "propertySection",
    data () {
      return {
        propertyWindowState: {'collapsed': false},
        selectedItem: {'title': '', 'properties': []}
      }
    },
    mounted () {

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