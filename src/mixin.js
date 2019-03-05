import { mapState, mapMutations } from 'vuex'

const commonMix = {
  data () {
    return {
      mockData: {
        description: '1',
        key: '1',
        lastUpdated: '2019-02-26T01:40:30.975+0000',
        lastUpdatedBy: 'admin',
        model: {
          childShapes: [
            {
              bounds: {
                lowerRight: {x: 130, y: 193},
                upperLeft: {x: 100, y: 163}
              },
              childShapes: [],
              dockers: [],
              outgoing: [],
              resourceId: 'startEvent1',
              stencil: {id: 'StartNoneEvent'}
            }
          ],
          id: 'canvas',
          modelType: 'model',
          properties: {
            documentation: '1',
            name: '1',
            process_id: '1'
          },
          resourceId: 'canvas',
          stencilset: {
            namespace: 'http://b3mn.org/stencilset/bpmn2.0#'
          }
        },
        modelId: "80646b68-3967-11e9-bbaa-82ad27eff10d",
        name: '1'
      }
    }
  },
  computed: {
    ...mapState('Flowable', ['stencilItemGroups', 'modelData'])
  },
  created () {},
  methods: {
    ...mapMutations('Flowable', ['UPDATE_modelData']),
    createEditorManager () {
      let _this = this
      var editorManager = Class.create({
        initialize: function () {
          this.treeFilteredElements = ["SubProcess", "CollapsedSubProcess"];
          this.canvasTracker = new Hash();
          this.structualIcons = {
            "SubProcess": "expanded.subprocess.png",
            "CollapsedSubProcess": "subprocess.png",
            "EventSubProcess": "event.subprocess.png"
          };

          this.current = this.modelId;
          this.loading = true;
        },
        getModelId: function () {
          return this.modelId;
        },
        setModelId: function (modelId){
          this.modelId = modelId;
        },
        getCurrentModelId: function () {
          return this.current;
        },
        setStencilData: function(stencilData){
          //we don't want a references!
          this.stencilData = jQuery.extend(true, {},stencilData);
        },
        getStencilData: function () {
          return this.stencilData;
        },
        getSelection: function () {
          return this.editor.selection;
        },
        getSubSelection: function () {
          return this.editor._subSelection;
        },
        handleEvents: function (events) {
          this.editor.handleEvents(events);
        },
        setSelection: function (selection) {
          this.editor.setSelection(selection);
        },
        registerOnEvent: function (event, callback) {
          this.editor.registerOnEvent(event, callback);
        },
        getChildShapeByResourceId: function (resourceId) {
          return this.editor.getCanvas().getChildShapeByResourceId(resourceId);
        },
        getJSON: function () {
          return this.editor.getJSON();
        },
        getStencilSets: function () {
          return this.editor.getStencilSets();
        },
        getEditor: function () {
          return this.editor; //TODO: find out if we can avoid exposing the editor object to angular.
        },
        executeCommands: function (commands) {
          this.editor.executeCommands(commands);
        },
        getCanvas: function () {
          return this.editor.getCanvas();
        },
        getRules: function () {
          return this.editor.getRules();
        },
        eventCoordinates: function (coordinates) {
          return this.editor.eventCoordinates(coordinates);
        },
        eventCoordinatesXY: function (x, y) {
          return this.editor.eventCoordinatesXY(x, y);
        },
        updateSelection: function () {
          this.editor.updateSelection();
        },
        /**
         * @returns the modeldata as received from the server. This does not represent the current editor data.
         */
        getBaseModelData: function () {
          return _this.modelData;
        },
        edit: function (resourceId) {
          //Save the current canvas in the canvastracker if it is the root process.
          this.syncCanvasTracker();

          this.loading = true;

          var shapes = this.getCanvas().getChildren();
          shapes.each(function (shape) {
            this.editor.deleteShape(shape);
          }.bind(this));

          shapes = this.canvasTracker.get(resourceId);
          if(!shapes){
            shapes = JSON.stringify([]);
          }

          this.editor.loadSerialized({
            childShapes: shapes
          });

          this.getCanvas().update();

          this.current = resourceId;

          this.loading = false;
          FLOWABLE.eventBus.dispatch("EDITORMANAGER-EDIT-ACTION", {});
          FLOWABLE.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_UNDO_REDO_RESET, {});
        },
        getTree: function () {
          //build a tree of all subprocesses and there children.
          var result = new Hash();
          var parent = this.getModel();
          result.set("name", parent.properties["name"] || "No name provided");
          result.set("id", this.modelId);
          result.set("type", "root");
          result.set("current", this.current === this.modelId)
          var childShapes = parent.childShapes;
          var children = this._buildTreeChildren(childShapes);
          result.set("children", children);
          return result.toObject();
        },
        _buildTreeChildren: function (childShapes) {
          var children = [];
          for (var i = 0; i < childShapes.length; i++) {
            var childShape = childShapes[i];
            var stencilId = childShape.stencil.id;
            //we are currently only interested in the expanded subprocess and collapsed processes
            if (stencilId && this.treeFilteredElements.indexOf(stencilId) > -1) {
              var child = new Hash();
              child.set("name", childShape.properties.name || "No name provided");
              child.set("id", childShape.resourceId);
              child.set("type", stencilId);
              child.set("current", childShape.resourceId === this.current);

              //check if childshapes

              if (stencilId === "CollapsedSubProcess") {
                //the save function stores the real object as a childshape
                //it is possible that there is no child element because the user did not open the collapsed subprocess.
                if (childShape.childShapes.length === 0) {
                  child.set("children", []);
                } else {
                  child.set("children", this._buildTreeChildren(childShape.childShapes));
                }
                child.set("editable", true);
              } else {
                child.set("children", this._buildTreeChildren(childShape.childShapes));
                child.set("editable", false);
              }
              child.set("icon", this.structualIcons[stencilId]);
              children.push(child.toObject());
            }
          }
          return children;
        },
        syncCanvasTracker: function () {
          var shapes = this.getCanvas().getChildren();
          var jsonShapes = [];
          shapes.each(function (shape) {
            //toJson is an summary object but its not a json string.!!!!!
            jsonShapes.push(shape.toJSON());
          });
          this.canvasTracker.set(this.current, JSON.stringify(jsonShapes));
        },
        getModel: function () {
          this.syncCanvasTracker();

          var modelMetaData = this.getBaseModelData();

          var stencilId = undefined;
          var stencilSetNamespace = undefined;
          var stencilSetUrl = undefined;
          if (modelMetaData.model.stencilset.namespace == 'http://b3mn.org/stencilset/cmmn1.1#') {
            stencilId = 'CMMNDiagram';
            stencilSetNamespace = 'http://b3mn.org/stencilset/cmmn1.1#';
            stencilSetUrl = '../editor/stencilsets/cmmn1.1/cmmn1.1.json';
          } else {
            stencilId = 'BPMNDiagram';
            stencilSetNamespace = 'http://b3mn.org/stencilset/bpmn2.0#';
            stencilSetUrl = '../editor/stencilsets/bpmn2.0/bpmn2.0.json';
          }

          //this is an object.
          var editorConfig = this.editor.getJSON();
          var model = {
            modelId: this.modelId,
            bounds: editorConfig.bounds,
            properties: editorConfig.properties,
            childShapes: JSON.parse(this.canvasTracker.get(this.modelId)),
            stencil: {
              id: stencilId,
            },
            stencilset: {
              namespace: stencilSetNamespace,
              url: stencilSetUrl
            }
          };

          this._mergeCanvasToChild(model);

          return model;
        },
        setModelData: function(response){
          _this.UPDATE_modelData(response)
        },
        bootEditor: function () {
          //TODO: populate the canvas with correct json sections.
          //resetting the state
          this.canvasTracker = new Hash();
          var config = jQuery.extend(true, {}, _this.modelData); //avoid a reference to the original object.
          console.log('config', config)
          if(!config.model.childShapes){
            config.model.childShapes = [];
          }

          this.findAndRegisterCanvas(config.model.childShapes); //this will remove any childshapes of a collapseable subprocess.
          this.canvasTracker.set(config.modelId, JSON.stringify(config.model.childShapes)); //this will be overwritten almost instantly.
          this.editor = new ORYX.Editor(config);
          this.current = this.editor.id;
          this.loading = false;


          FLOWABLE.eventBus.editor = this.editor;
          FLOWABLE.eventBus.dispatch("ORYX-EDITOR-LOADED", {});
          FLOWABLE.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_EDITOR_BOOTED, {});

          var eventMappings = [
            { oryxType : ORYX.CONFIG.EVENT_SELECTION_CHANGED, flowableType : FLOWABLE.eventBus.EVENT_TYPE_SELECTION_CHANGE },
            { oryxType : ORYX.CONFIG.EVENT_DBLCLICK, flowableType : FLOWABLE.eventBus.EVENT_TYPE_DOUBLE_CLICK },
            { oryxType : ORYX.CONFIG.EVENT_MOUSEOUT, flowableType : FLOWABLE.eventBus.EVENT_TYPE_MOUSE_OUT },
            { oryxType : ORYX.CONFIG.EVENT_MOUSEOVER, flowableType : FLOWABLE.eventBus.EVENT_TYPE_MOUSE_OVER },
            { oryxType: ORYX.CONFIG.EVENT_EDITOR_INIT_COMPLETED, flowableType:FLOWABLE.eventBus.EVENT_TYPE_EDITOR_READY},
            { oryxType: ORYX.CONFIG.EVENT_PROPERTY_CHANGED, flowableType: FLOWABLE.eventBus.EVENT_TYPE_PROPERTY_VALUE_CHANGED}
          ];

          eventMappings.forEach((eventMapping) => {
            _this.editorManager.registerOnEvent(eventMapping.oryxType, function(event) {
              FLOWABLE.eventBus.dispatch(eventMapping.flowableType, event);
            });
          });
        },
        findAndRegisterCanvas: function (childShapes) {
          for (var i = 0; i < childShapes.length; i++) {
            var childShape = childShapes[i];
            if (childShape.stencil.id === "CollapsedSubProcess") {
              if (childShape.childShapes.length > 0) {
                //the canvastracker will auto correct itself with a new canvasmodel see this.edit()...
                this.findAndRegisterCanvas(childShape.childShapes);
                //a canvas can't be nested as a child because the editor would crash on redundant information.
                this.canvasTracker.set(childShape.resourceId, JSON.stringify(childShape.childShapes));
                //reference to config will clear the value.
                childShape.childShapes = [];
              } else {
                this.canvasTracker.set(childShape.resourceId, '[]');
              }
            }
          }
        },
        _mergeCanvasToChild: function (parent) {
          for (var i = 0; i < parent.childShapes.length; i++) {
            var childShape = parent.childShapes[i]
            if(childShape.stencil.id === "CollapsedSubProcess"){

              var elements = this.canvasTracker.get(childShape.resourceId);
              if(elements){
                elements = JSON.parse(elements);
              }else{
                elements = [];
              }
              childShape.childShapes = elements;
              this._mergeCanvasToChild(childShape);
            }else if(childShape.stencil.id === "SubProcess"){
              this._mergeCanvasToChild(childShape);
            }else{
              //do nothing?
            }
          }
        },
        dispatchOryxEvent: function (event) {
          FLOWABLE.eventBus.dispatchOryxEvent(event);
        },
        isLoading: function(){
          return this.loading;
        },
        navigateTo: function(resourceId){
          //TODO: this could be improved by check if the resourceId is not equal to the current tracker...
          this.syncCanvasTracker();
          var found = false;
          this.canvasTracker.each(function(pair){
            var key = pair.key;
            var children = JSON.parse(pair.value);
            var targetable = this._findTarget(children, resourceId);
            if (!found && targetable){
              this.edit(key);
              var flowableShape = this.getCanvas().getChildShapeByResourceId(targetable);
              this.setSelection([flowableShape],[],true);
              found = true;
            }
          },this);
        },
        _findTarget: function(children,resourceId){
          for(var i =0; i < children.length; i++){
            var child = children[i];
            if(child.resourceId === resourceId){
              return child.resourceId;
            }else if(child.properties && child.properties["overrideid"] === resourceId){
              return child.resourceId;
            }else{
              var result = this._findTarget(child.childShapes,resourceId);
              if(result){
                return result;
              }
            }
          }
          return false;
        }
      });
      return new editorManager();
    },
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