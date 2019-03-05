import { mapState, mapMutations } from 'vuex'

const commonMix = {
  data () {
    return {
      mockData: {
        "modelId": "6609363a-3be5-11e9-afe0-82ad27eff10d",
        "name": "请假模型",
        "key": "leave-model",
        "description": "请假模型",
        "lastUpdated": "2019-03-04T02:15:00.384+0000",
        "lastUpdatedBy": "admin",
        "model": {
          "modelId": "6609363a-3be5-11e9-afe0-82ad27eff10d",
          "bounds": {
            "lowerRight": {
              "x": 1200,
              "y": 1050
            },
            "upperLeft": {
              "x": 0,
              "y": 0
            }
          },
          "properties": {
            "process_id": "leave-model",
            "name": "请假模型",
            "documentation": "请假模型",
            "process_author": "",
            "process_version": "",
            "process_namespace": "http://www.flowable.org/processdef",
            "process_historylevel": "",
            "isexecutable": true,
            "dataproperties": "",
            "executionlisteners": "",
            "eventlisteners": "",
            "signaldefinitions": "",
            "messagedefinitions": "",
            "process_potentialstarteruser": "",
            "process_potentialstartergroup": "",
            "iseagerexecutionfetch": "false"
          },
          "childShapes": [
            {
              "resourceId": "startEvent1",
              "properties": {
                "overrideid": "",
                "name": "开始",
                "documentation": "",
                "executionlisteners": "",
                "initiator": "",
                "formkeydefinition": "",
                "formreference": "",
                "formproperties": ""
              },
              "stencil": {
                "id": "StartNoneEvent"
              },
              "childShapes": [

              ],
              "outgoing": [
                {
                  "resourceId": "sid-2DA089CE-2D36-4C1F-9889-0DBA4A1D4C34"
                }
              ],
              "bounds": {
                "lowerRight": {
                  "x": 130,
                  "y": 193
                },
                "upperLeft": {
                  "x": 100,
                  "y": 163
                }
              },
              "dockers": [

              ]
            },
            {
              "resourceId": "sid-F2289A33-D579-452D-86F8-AE5F37D39C5C",
              "properties": {
                "overrideid": "",
                "name": "用户填写请假单",
                "documentation": "",
                "asynchronousdefinition": "false",
                "exclusivedefinition": "false",
                "executionlisteners": "",
                "multiinstance_type": "None",
                "multiinstance_cardinality": "",
                "multiinstance_collection": "",
                "multiinstance_variable": "",
                "multiinstance_condition": "",
                "isforcompensation": "false",
                "usertaskassignment": {
                  "assignment": {
                    "type": "idm",
                    "idm": {
                      "type": "initiator"
                    }
                  }
                },
                "formkeydefinition": "",
                "formreference": {
                  "id": "638e122b-3be7-11e9-afe0-82ad27eff10d",
                  "name": "填写请假单",
                  "key": "leave-input-from"
                },
                "duedatedefinition": "",
                "prioritydefinition": "",
                "formproperties": "",
                "tasklisteners": "",
                "skipexpression": "",
                "categorydefinition": ""
              },
              "stencil": {
                "id": "UserTask"
              },
              "childShapes": [

              ],
              "outgoing": [
                {
                  "resourceId": "sid-FF15BFB7-7C71-4C9D-9CBC-15E28C3EC563"
                }
              ],
              "bounds": {
                "lowerRight": {
                  "x": 275,
                  "y": 218
                },
                "upperLeft": {
                  "x": 175,
                  "y": 138
                }
              },
              "dockers": [

              ]
            },
            {
              "resourceId": "sid-2DA089CE-2D36-4C1F-9889-0DBA4A1D4C34",
              "properties": {
                "overrideid": "",
                "name": "",
                "documentation": "",
                "conditionsequenceflow": "",
                "executionlisteners": "",
                "defaultflow": "false",
                "skipexpression": ""
              },
              "stencil": {
                "id": "SequenceFlow"
              },
              "childShapes": [

              ],
              "outgoing": [
                {
                  "resourceId": "sid-F2289A33-D579-452D-86F8-AE5F37D39C5C"
                }
              ],
              "bounds": {
                "lowerRight": {
                  "x": 174.15625,
                  "y": 178
                },
                "upperLeft": {
                  "x": 130.609375,
                  "y": 178
                }
              },
              "dockers": [
                {
                  "x": 15,
                  "y": 15
                },
                {
                  "x": 50,
                  "y": 40
                }
              ],
              "target": {
                "resourceId": "sid-F2289A33-D579-452D-86F8-AE5F37D39C5C"
              }
            },
            {
              "resourceId": "sid-3B2BA28A-F373-4DAD-B916-FBD2C1ED714E",
              "properties": {
                "overrideid": "",
                "name": "部门领导审批",
                "documentation": "",
                "asynchronousdefinition": "false",
                "exclusivedefinition": "false",
                "executionlisteners": "",
                "multiinstance_type": "None",
                "multiinstance_cardinality": "",
                "multiinstance_collection": "",
                "multiinstance_variable": "",
                "multiinstance_condition": "",
                "isforcompensation": "false",
                "usertaskassignment": "",
                "formkeydefinition": "",
                "formreference": "",
                "duedatedefinition": "",
                "prioritydefinition": "",
                "formproperties": "",
                "tasklisteners": "",
                "skipexpression": "",
                "categorydefinition": ""
              },
              "stencil": {
                "id": "UserTask"
              },
              "childShapes": [

              ],
              "outgoing": [
                {
                  "resourceId": "sid-0D4A7B4D-3C1D-4D1A-B7FC-A42B84C60CBE"
                }
              ],
              "bounds": {
                "lowerRight": {
                  "x": 445,
                  "y": 218
                },
                "upperLeft": {
                  "x": 345,
                  "y": 138
                }
              },
              "dockers": [

              ]
            },
            {
              "resourceId": "sid-FF15BFB7-7C71-4C9D-9CBC-15E28C3EC563",
              "properties": {
                "overrideid": "",
                "name": "",
                "documentation": "",
                "conditionsequenceflow": "",
                "executionlisteners": "",
                "defaultflow": "false",
                "skipexpression": ""
              },
              "stencil": {
                "id": "SequenceFlow"
              },
              "childShapes": [

              ],
              "outgoing": [
                {
                  "resourceId": "sid-3B2BA28A-F373-4DAD-B916-FBD2C1ED714E"
                }
              ],
              "bounds": {
                "lowerRight": {
                  "x": 344.859375,
                  "y": 178
                },
                "upperLeft": {
                  "x": 275.140625,
                  "y": 178
                }
              },
              "dockers": [
                {
                  "x": 50,
                  "y": 40
                },
                {
                  "x": 50,
                  "y": 40
                }
              ],
              "target": {
                "resourceId": "sid-3B2BA28A-F373-4DAD-B916-FBD2C1ED714E"
              }
            },
            {
              "resourceId": "sid-6716D349-84DB-4CE5-90E9-B9FABE573BE7",
              "properties": {
                "overrideid": "",
                "name": "结束",
                "documentation": "",
                "executionlisteners": ""
              },
              "stencil": {
                "id": "EndNoneEvent"
              },
              "childShapes": [

              ],
              "outgoing": [

              ],
              "bounds": {
                "lowerRight": {
                  "x": 518,
                  "y": 192
                },
                "upperLeft": {
                  "x": 490,
                  "y": 164
                }
              },
              "dockers": [

              ]
            },
            {
              "resourceId": "sid-0D4A7B4D-3C1D-4D1A-B7FC-A42B84C60CBE",
              "properties": {
                "overrideid": "",
                "name": "",
                "documentation": "",
                "conditionsequenceflow": "",
                "executionlisteners": "",
                "defaultflow": "false",
                "skipexpression": ""
              },
              "stencil": {
                "id": "SequenceFlow"
              },
              "childShapes": [

              ],
              "outgoing": [
                {
                  "resourceId": "sid-6716D349-84DB-4CE5-90E9-B9FABE573BE7"
                }
              ],
              "bounds": {
                "lowerRight": {
                  "x": 489.375,
                  "y": 178
                },
                "upperLeft": {
                  "x": 445.390625,
                  "y": 178
                }
              },
              "dockers": [
                {
                  "x": 50,
                  "y": 40
                },
                {
                  "x": 14,
                  "y": 14
                }
              ],
              "target": {
                "resourceId": "sid-6716D349-84DB-4CE5-90E9-B9FABE573BE7"
              }
            }
          ],
          "stencil": {
            "id": "BPMNDiagram"
          },
          "stencilset": {
            "namespace": "http://b3mn.org/stencilset/bpmn2.0#",
            "url": "../editor/stencilsets/bpmn2.0/bpmn2.0.json"
          },
          "modelType": "model"
        }
      }
    }
  },
  computed: {
    ...mapState('Flowable', ['stencilItemGroups', 'modelData'])
  },
  created () {},
  methods: {
    ...mapMutations('Flowable', ['UPDATE_modelData']),
    // Helper method: find a group in an array
    findGroup (name, groupArray) {
      for (var index = 0; index < groupArray.length; index++) {
        if (groupArray[index].name === name) {
          return groupArray[index];
        }
      }
      return null;
    },
    // Helper method: add a new group to an array of groups
    addGroup (groupName, groupArray) {
      var group = { name: groupName, items: [], paletteItems: [], groups: [], visible: true };
      groupArray.push(group);
      return group;
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
    morphShape () {
      this.safeApply(() => {
        var shapes = this.editorManager.getSelection();
        if (shapes && shapes.length == 1) {
          this.currentSelectedShape = shapes.first();
          var stencilItem = this.getStencilItemById(this.currentSelectedShape.getStencil().idWithoutNs());
          var morphShapes = [];
          for (let i = 0; i < this.morphRoles.length; i++) {
            if (this.morphRoles[i].role === stencilItem.morphRole) {
              morphShapes = this.morphRoles[i].morphOptions.slice();
            }
          }

          // Method to open shape select dialog (used later on)
          var showSelectShapeDialog = function() {
            this.morphShapes = morphShapes;
            _internalCreateModal({
              backdrop: false,
              keyboard: true,
              template: 'editor-app/popups/select-shape.html?version=' + Date.now()
            },  $modal, this);
          };

          showSelectShapeDialog();
        }
      });
    },
    deleteShape () {
      FLOWABLE.TOOLBAR.ACTIONS.deleteItem({'$scope': this, 'editorManager': this.editorManager});
    },
    quickAddItem (newItemId) {
      console.log('Oryx_button:', newItemId)
      var shapes = this.editorManager.getSelection();
      if (shapes && shapes.length == 1) {
        this.currentSelectedShape = shapes.first();propertyWindowState

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

    /**
     * Helper method that searches a group for an item with the given id.
     * If not found, will return undefined.
     */
    findStencilItemInGroup  (stencilItemId, group) {
      var item;

      // Check all items directly in this group
      for (var j = 0; j < group.items.length; j++) {
        item = group.items[j];
        if (item.id === stencilItemId) {
          return item;
        }
      }

      // Check the child groups
      if (group.groups && group.groups.length > 0) {
        for (var k = 0; k < group.groups.length; k++) {
          item = this.findStencilItemInGroup(stencilItemId, group.groups[k]);
          if (item) {
            return item;
          }
        }
      }

      return undefined;
    },

    /**
     * Helper method to find a stencil item.
     */
    getStencilItemById (stencilItemId) {
      for (var i = 0; i < this.stencilItemGroups.length; i++) {
        var element = this.stencilItemGroups[i];

        // Real group
        if (element.items !== null && element.items !== undefined) {
          var item = this.findStencilItemInGroup(stencilItemId, element);
          if (item) {
            return item;
          }
        } else { // Root stencil item
          if (element.id === stencilItemId) {
            return element;
          }
        }
      }
      return undefined;
    },
  }
}

export default commonMix