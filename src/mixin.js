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
    initScrollHandling() {
      var canvasSection = jQuery('#canvasSection');
      canvasSection.scroll(() => {
        // Hides the resizer and quick menu items during scrolling
        var selectedElements = this.editorManager.getSelection();
        var subSelectionElements = this.editorManager.getSubSelection();

        this.selectedElements = selectedElements;
        this.subSelectionElements = subSelectionElements;
        if (selectedElements && selectedElements.length > 0)
        {
          this.selectedElementBeforeScrolling = selectedElements[0];
        }

        jQuery('.Oryx_button').each(function(i, obj) {
          this.orginalOryxButtonStyle = obj.style.display;
          obj.style.display = 'none';
        });
        jQuery('.resizer_southeast').each(function(i, obj) {
          this.orginalResizerSEStyle = obj.style.display;
          obj.style.display = 'none';
        });
        jQuery('.resizer_northwest').each(function(i, obj) {
          this.orginalResizerNWStyle = obj.style.display;
          obj.style.display = 'none';
        });
        this.editorManager.handleEvents({type:ORYX.CONFIG.EVENT_CANVAS_SCROLL});
      });

      canvasSection.scrollStopped(() => {

        // Puts the quick menu items and resizer back when scroll is stopped.

        this.editorManager.setSelection([]); // needed cause it checks for element changes and does nothing if the elements are the same
        this.editorManager.setSelection(this.selectedElements, this.subSelectionElements);
        this.selectedElements = undefined;
        this.subSelectionElements = undefined;

        function handleDisplayProperty(obj) {
          if (jQuery(obj).position().top > 0) {
            obj.style.display = 'block';
          } else {
            obj.style.display = 'none';
          }
        }

        jQuery('.Oryx_button').each(function(i, obj) {
          handleDisplayProperty(obj);
        });
        jQuery('.resizer_southeast').each(function(i, obj) {
          handleDisplayProperty(obj);
        });
        jQuery('.resizer_northwest').each(function(i, obj) {
          handleDisplayProperty(obj);
        });

      });
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