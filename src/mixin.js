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

    quickAddItem (newItemId) {
      console.log('Oryx_button:', newItemId)
      var shapes = this.editorManager.getSelection();
      if (shapes && shapes.length == 1) {
        this.currentSelectedShape = shapes.first();

        var containedStencil = undefined;
        var stencilSets = this.editorManager.getStencilSets().values();
        for (var i = 0; i < stencilSets.length; i++) {
          var stencilSet = stencilSets[i];
          var nodes = stencilSet.nodes();
          for (var j = 0; j < nodes.length; j++) {
            if (nodes[j].idWithoutNs() === newItemId) {
              containedStencil = nodes[j];
              break;
            }
          }
        }

        if (!containedStencil) return;

        var option = {type: this.currentSelectedShape.getStencil().namespace() + newItemId, namespace: this.currentSelectedShape.getStencil().namespace()};
        option['connectedShape'] = this.currentSelectedShape;
        option['parent'] = this.currentSelectedShape.parent;
        option['containedStencil'] = containedStencil;

        var args = { sourceShape: this.currentSelectedShape, targetStencil: containedStencil };
        var targetStencil = this.editorManager.getRules().connectMorph(args);

        // Check if there can be a target shape
        if (!targetStencil) {
          return;
        }

        option['connectingType'] = targetStencil.id();

        var command = new FLOWABLE.CreateCommand(option, undefined, undefined, this.editorManager.getEditor());

        this.editorManager.executeCommands([command]);
      }
    },
    editShape (){
      this.editorManager.edit(this.selectedShape.resourceId);
    },
    /* Click handler for clicking a property */
    propertyClicked (index) {
      if (!this.selectedItem.properties[index].hidden) {
        this.selectedItem.properties[index].mode = "write";
      }
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

    /* Method available to all sub controllers (for property controllers) to update the internal Oryx model */
    updatePropertyInModel (property, shapeId) {

      var shape = this.selectedShape;
      // Some updates may happen when selected shape is already changed, so when an additional
      // shapeId is supplied, we need to make sure the correct shape is updated (current or previous)
      if (shapeId) {
        if (shape.id != shapeId && this.previousSelectedShape && this.previousSelectedShape.id == shapeId) {
          shape = this.previousSelectedShape;
        } else {
          shape = null;
        }
      }

      if (!shape) {
        // When no shape is selected, or no shape is found for the alternative
        // shape ID, do nothing
        return;
      }
      var key = property.key;
      var newValue = property.value;
      var oldValue = shape.properties.get(key);

      let _this = this
      if (newValue != oldValue) {
        var commandClass = ORYX.Core.Command.extend({
          construct: function () {
            this.key = key;
            this.oldValue = oldValue;
            this.newValue = newValue;
            this.shape = shape;
            this.facade = _this.editorManager.getEditor();
          },
          execute: function () {
            this.shape.setProperty(this.key, this.newValue);
            this.facade.getCanvas().update();
            this.facade.updateSelection();
          },
          rollback: function () {
            this.shape.setProperty(this.key, this.oldValue);
            this.facade.getCanvas().update();
            this.facade.updateSelection();
          }
        });
        // Instantiate the class
        var command = new commandClass();

        // Execute the command
        this.editorManager.executeCommands([command]);
        this.editorManager.handleEvents({
          type: ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,
          elements: [shape],
          key: key
        });

        // Switch the property back to read mode, now the update is done
        property.mode = 'read';

        // Fire event to all who is interested
        // Fire event to all who want to know about this
        var event = {
          type: FLOWABLE.eventBus.EVENT_TYPE_PROPERTY_VALUE_CHANGED,
          property: property,
          oldValue: oldValue,
          newValue: newValue
        };
        FLOWABLE.eventBus.dispatch(event.type, event);
      } else {
        // Switch the property back to read mode, no update was needed
        property.mode = 'read';
      }
    },


  }
}

export default commonMix