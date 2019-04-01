import { mapState, mapMutations } from 'vuex'

const commonMix = {
  data () {
    return {}
  },
  computed: {
    ...mapState('Flowable', ['stencilItemGroups'])
  },
  created () {},
  methods: {
    getModelThumbnailUrl (modelId, version) {
      return process.env.VUE_APP_API_PREFIX+'/app/rest/models/' + modelId + '/thumbnail' + (version ? "?version=" + version : "");
    },
    getStencilSetName () {
      var modelMetaData = this.editorManager.getBaseModelData();
      if (modelMetaData.model.stencilset.namespace == 'http://b3mn.org/stencilset/cmmn1.1#') {
        return 'cmmn1.1';
      } else {
        return 'bpmn2.0';
      }
    },
    safeApply: function(fn) {
      if (this.$root) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
          if(fn && (typeof(fn) === 'function')) {
            fn();
          }
        } else {
          // this.$apply(fn);
        }

      } else {
        // this.$apply(fn);
      }
    },
    addHistoryItem (resourceId) {
      var modelMetaData = this.editorManager.getBaseModelData();

      var historyItem = {
        id: modelMetaData.modelId,
        name: modelMetaData.name,
        key: modelMetaData.key,
        stepId: resourceId,
        type: 'bpmnmodel'
      };

      if (this.editorManager.getCurrentModelId() != this.editorManager.getModelId()) {
        historyItem.subProcessId = this.editorManager.getCurrentModelId();
      }
      this.editorHistory.push(historyItem);
    },

    editShape (){
      this.editorManager.edit(this.selectedShape.resourceId);
    },


    /* Helper method to retrieve the template url for a property */
    getPropertyTemplateUrl (index) {
      return this.selectedItem.properties[index].templateUrl;
    },
    getPropertyReadModeTemplateUrl (index) {
      return this.selectedItem.properties[index].readModeTemplateUrl;
    },
    getPropertyWriteModeTemplateUrl (index) {
      return this.selectedItem.properties[index].writeModeTemplateUrl;
    },



  }
}

export default commonMix