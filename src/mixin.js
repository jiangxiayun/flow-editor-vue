
const commonMix = {
  data () {
    return {
      modelData: {},
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
  created () {


  },
  methods: {
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
          return this.modelData;
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
          this.modelData = response;
        },
        bootEditor: function () {
          //TODO: populate the canvas with correct json sections.
          //resetting the state
          this.canvasTracker = new Hash();
          var config = jQuery.extend(true, {}, this.modelData); //avoid a reference to the original object.
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
      FLOWABLE.TOOLBAR.ACTIONS.deleteItem({'this': this, 'editorManager': this.editorManager});
    },
    quickAddItem (newItemId) {
      this.safeApply(() => {
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
      });
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

    /*
     * DRAG AND DROP FUNCTIONALITY
     */

    dropCallback (event, ui) {
      this.editorManager.handleEvents({
        type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
        highlightId: "shapeRepo.attached"
      });
      this.editorManager.handleEvents({
        type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
        highlightId: "shapeRepo.added"
      });

      this.editorManager.handleEvents({
        type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
        highlightId: "shapeMenu"
      });

      FLOWABLE.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS);

      if (this.dragCanContain) {
        var item = this.getStencilItemById(ui.draggable[0].id);

        var pos = {x: event.pageX, y: event.pageY};

        var additionalIEZoom = 1;
        if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
          var ua = navigator.userAgent;
          if (ua.indexOf('MSIE') >= 0) {
            //IE 10 and below
            var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
            if (zoom !== 100) {
              additionalIEZoom = zoom / 100;
            }
          }
        }

        var screenCTM = this.editorManager.getCanvas().node.getScreenCTM();

        // Correcting the UpperLeft-Offset
        pos.x -= (screenCTM.e / additionalIEZoom);
        pos.y -= (screenCTM.f / additionalIEZoom);
        // Correcting the Zoom-Factor
        pos.x /= screenCTM.a;
        pos.y /= screenCTM.d;

        // Correcting the ScrollOffset
        pos.x -= document.documentElement.scrollLeft;
        pos.y -= document.documentElement.scrollTop;

        var parentAbs = this.dragCurrentParent.absoluteXY();
        pos.x -= parentAbs.x;
        pos.y -= parentAbs.y;

        var containedStencil = undefined;
        var stencilSets = this.editorManager.getStencilSets().values();
        for (var i = 0; i < stencilSets.length; i++) {
          var stencilSet = stencilSets[i];
          var nodes = stencilSet.nodes();
          for (var j = 0; j < nodes.length; j++) {
            if (nodes[j].idWithoutNs() === ui.draggable[0].id) {
              containedStencil = nodes[j];
              break;
            }
          }

          if (!containedStencil) {
            var edges = stencilSet.edges();
            for (var j = 0; j < edges.length; j++) {
              if (edges[j].idWithoutNs() === ui.draggable[0].id) {
                containedStencil = edges[j];
                break;
              }
            }
          }
        }

        if (!containedStencil) return;

        if (this.quickMenu) {
          var shapes = this.editorManager.getSelection();
          if (shapes && shapes.length == 1) {
            var currentSelectedShape = shapes.first();

            var option = {};
            option.type = currentSelectedShape.getStencil().namespace() + ui.draggable[0].id;
            option.namespace = currentSelectedShape.getStencil().namespace();
            option.connectedShape = currentSelectedShape;
            option.parent = this.dragCurrentParent;
            option.containedStencil = containedStencil;

            // If the ctrl key is not pressed,
            // snapp the new shape to the center
            // if it is near to the center of the other shape
            if (!event.ctrlKey) {
              // Get the center of the shape
              var cShape = currentSelectedShape.bounds.center();
              // Snapp +-20 Pixel horizontal to the center
              if (20 > Math.abs(cShape.x - pos.x)) {
                pos.x = cShape.x;
              }
              // Snapp +-20 Pixel vertical to the center
              if (20 > Math.abs(cShape.y - pos.y)) {
                pos.y = cShape.y;
              }
            }

            option.position = pos;

            if (containedStencil.idWithoutNs() !== 'SequenceFlow' && containedStencil.idWithoutNs() !== 'Association' &&
              containedStencil.idWithoutNs() !== 'MessageFlow' && containedStencil.idWithoutNs() !== 'DataAssociation') {

              var args = { sourceShape: currentSelectedShape, targetStencil: containedStencil };
              var targetStencil = this.editorManager.getRules().connectMorph(args);
              if (!targetStencil) { // Check if there can be a target shape
                return;
              }
              option.connectingType = targetStencil.id();
            }

            var command = new FLOWABLE.CreateCommand(option, this.dropTargetElement, pos, this.editorManager.getEditor());

            this.editorManager.executeCommands([command]);
          }

        } else {
          var canAttach = false;
          if (containedStencil.idWithoutNs() === 'BoundaryErrorEvent' || containedStencil.idWithoutNs() === 'BoundaryTimerEvent' ||
            containedStencil.idWithoutNs() === 'BoundarySignalEvent' || containedStencil.idWithoutNs() === 'BoundaryMessageEvent' ||
            containedStencil.idWithoutNs() === 'BoundaryCancelEvent' || containedStencil.idWithoutNs() === 'BoundaryCompensationEvent') {

            // Modify position, otherwise boundary event will get position related to left corner of the canvas instead of the container
            pos = this.editorManager.eventCoordinates( event );
            canAttach = true;
          }

          var option = {};
          option['type'] = this.modelData.model.stencilset.namespace + item.id;
          option['namespace'] = this.modelData.model.stencilset.namespace;
          option['position'] = pos;
          option['parent'] = this.dragCurrentParent;

          var commandClass = ORYX.Core.Command.extend({
            construct: function(option, dockedShape, canAttach, position, facade){
              this.option = option;
              this.docker = null;
              this.dockedShape = dockedShape;
              this.dockedShapeParent = dockedShape.parent || facade.getCanvas();
              this.position = position;
              this.facade = facade;
              this.selection = this.facade.getSelection();
              this.shape = null;
              this.parent = null;
              this.canAttach = canAttach;
            },
            execute: function(){
              if (!this.shape) {
                this.shape = this.facade.createShape(option);
                this.parent = this.shape.parent;
              } else if (this.parent) {
                this.parent.add(this.shape);
              }

              if (this.canAttach && this.shape.dockers && this.shape.dockers.length) {
                this.docker = this.shape.dockers[0];

                this.dockedShapeParent.add(this.docker.parent);

                // Set the Docker to the new Shape
                this.docker.setDockedShape(undefined);
                this.docker.bounds.centerMoveTo(this.position);
                if (this.dockedShape !== this.facade.getCanvas()) {
                  this.docker.setDockedShape(this.dockedShape);
                }
                this.facade.setSelection( [this.docker.parent] );
              }

              this.facade.getCanvas().update();
              this.facade.updateSelection();

            },
            rollback: function(){
              if (this.shape) {
                this.facade.setSelection(this.selection.without(this.shape));
                this.facade.deleteShape(this.shape);
              }
              if (this.canAttach && this.docker) {
                this.docker.setDockedShape(undefined);
              }
              this.facade.getCanvas().update();
              this.facade.updateSelection();

            }
          });

          // Update canvas
          var command = new commandClass(option, this.dragCurrentParent, canAttach, pos, this.editorManager.getEditor());
          this.editorManager.executeCommands([command]);

          // Fire event to all who want to know about this
          var dropEvent = {
            type: FLOWABLE.eventBus.EVENT_TYPE_ITEM_DROPPED,
            droppedItem: item,
            position: pos
          };
          FLOWABLE.eventBus.dispatch(dropEvent.type, dropEvent);
        }
      }

      this.dragCurrentParent = undefined;
      this.dragCurrentParentId = undefined;
      this.dragCurrentParentStencil = undefined;
      this.dragCanContain = undefined;
      this.quickMenu = undefined;
      this.dropTargetElement = undefined;
    },


    overCallback  (event, ui) {
      this.dragModeOver = true;
    },

    outCallback  (event, ui) {
      this.dragModeOver = false;
    },

    startDragCallback  (event, ui) {
      this.dragModeOver = false;
      this.quickMenu = false;
      if (!ui.helper.hasClass('stencil-item-dragged')) {
        ui.helper.addClass('stencil-item-dragged');
      }
    },

    startDragCallbackQuickMenu  (event, ui) {
      this.dragModeOver = false;
      this.quickMenu = true;
    },

    dragCallback (event, ui) {
      if (this.dragModeOver != false) {
        var coord = editorManager.eventCoordinatesXY(event.pageX, event.pageY);

        var additionalIEZoom = 1;
        if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
          var ua = navigator.userAgent;
          if (ua.indexOf('MSIE') >= 0) {
            //IE 10 and below
            var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
            if (zoom !== 100) {
              additionalIEZoom = zoom / 100
            }
          }
        }

        if (additionalIEZoom !== 1) {
          coord.x = coord.x / additionalIEZoom;
          coord.y = coord.y / additionalIEZoom;
        }

        var aShapes = this.editorManager.getCanvas().getAbstractShapesAtPosition(coord);

        if (aShapes.length <= 0) {
          if (event.helper) {
            this.dragCanContain = false;
            return false;
          }
        }

        if (aShapes[0] instanceof ORYX.Core.Canvas) {
          this.editorManager.getCanvas().setHightlightStateBasedOnX(coord.x);
        }

        if (aShapes.length == 1 && aShapes[0] instanceof ORYX.Core.Canvas) {
          var item = this.getStencilItemById(event.target.id);
          var parentCandidate = aShapes[0];

          if (item.id === 'Lane' || item.id === 'BoundaryErrorEvent' || item.id === 'BoundaryMessageEvent' ||
            item.id === 'BoundarySignalEvent' || item.id === 'BoundaryTimerEvent' ||
            item.id === 'BoundaryCancelEvent' || item.id === 'BoundaryCompensationEvent' ||
            item.id === 'EntryCriterion') {

            this.dragCanContain = false;

            // Show Highlight
            this.editorManager.handleEvents({
              type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
              highlightId: 'shapeRepo.added',
              elements: [parentCandidate],
              style: ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
              color: ORYX.CONFIG.SELECTION_INVALID_COLOR
            });

          } else {
            this.dragCanContain = true;
            this.dragCurrentParent = parentCandidate;
            this.dragCurrentParentId = parentCandidate.id;

            this.editorManager.handleEvents({
              type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
              highlightId: "shapeRepo.added"
            });
          }

          this.editorManager.handleEvents({
            type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
            highlightId: "shapeRepo.attached"
          });

          return false;

        } else  {
          var item = this.getStencilItemById(event.target.id);

          var parentCandidate = aShapes.reverse().find(function (candidate) {
            return (candidate instanceof ORYX.Core.Canvas
              || candidate instanceof ORYX.Core.Node
              || candidate instanceof ORYX.Core.Edge);
          });

          if (!parentCandidate) {
            this.dragCanContain = false;
            return false;
          }

          if (item.type === "node") {

            // check if the draggable is a boundary event and the parent an Activity
            var _canContain = false;
            var parentStencilId = parentCandidate.getStencil().id();

            if (this.dragCurrentParentId && this.dragCurrentParentId === parentCandidate.id) {
              return false;
            }

            var parentItem = this.getStencilItemById(parentCandidate.getStencil().idWithoutNs());
            if (parentItem.roles.indexOf('Activity') > -1) {
              if (item.roles.indexOf('IntermediateEventOnActivityBoundary') > -1
                || item.roles.indexOf('EntryCriterionOnItemBoundary') > -1
                || item.roles.indexOf('ExitCriterionOnItemBoundary') > -1) {
                _canContain = true;
              }

            } else if(parentItem.roles.indexOf('StageActivity') > -1) {
              if (item.roles.indexOf('EntryCriterionOnItemBoundary') > -1
                || item.roles.indexOf('ExitCriterionOnItemBoundary') > -1) {
                _canContain = true;
              }

            } else if(parentItem.roles.indexOf('StageModelActivity') > -1) {
              if (item.roles.indexOf('ExitCriterionOnItemBoundary') > -1) {
                _canContain = true;
              }

            } else if (parentCandidate.getStencil().idWithoutNs() === 'Pool') {
              if (item.id === 'Lane') {
                _canContain = true;
              }
            }

            if (_canContain) {
              this.editorManager.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                highlightId: "shapeRepo.attached",
                elements: [parentCandidate],
                style: ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
                color: ORYX.CONFIG.SELECTION_VALID_COLOR
              });

              this.editorManager.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: "shapeRepo.added"
              });

            } else {
              for (var i = 0; i < this.containmentRules.length; i++) {
                var rule = this.containmentRules[i];
                if (rule.role === parentItem.id) {
                  for (var j = 0; j < rule.contains.length; j++) {
                    if (item.roles.indexOf(rule.contains[j]) > -1) {
                      _canContain = true;
                      break;
                    }
                  }

                  if (_canContain) {
                    break;
                  }
                }
              }

              // Show Highlight
              this.editorManager.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                highlightId: 'shapeRepo.added',
                elements: [parentCandidate],
                color: _canContain ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
              });

              this.editorManager.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: "shapeRepo.attached"
              });
            }

            this.dragCurrentParent = parentCandidate;
            this.dragCurrentParentId = parentCandidate.id;
            this.dragCurrentParentStencil = parentStencilId;
            this.dragCanContain = _canContain;

          } else  {
            var canvasCandidate = this.editorManager.getCanvas();
            var canConnect = false;

            var targetStencil = this.getStencilItemById(parentCandidate.getStencil().idWithoutNs());
            if (targetStencil) {
              var associationConnect = false;
              if (stencil.idWithoutNs() === 'Association' && (curCan.getStencil().idWithoutNs() === 'TextAnnotation' || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent')) {
                associationConnect = true;
              } else if (stencil.idWithoutNs() === 'DataAssociation' && curCan.getStencil().idWithoutNs() === 'DataStore') {
                associationConnect = true;
              }

              if (targetStencil.canConnectTo || associationConnect) {
                canConnect = true;
              }
            }

            //Edge
            this.dragCurrentParent = canvasCandidate;
            this.dragCurrentParentId = canvasCandidate.id;
            this.dragCurrentParentStencil = canvasCandidate.getStencil().id();
            this.dragCanContain = canConnect;

            // Show Highlight
            this.editorManager.handleEvents({
              type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
              highlightId: 'shapeRepo.added',
              elements: [canvasCandidate],
              color: ORYX.CONFIG.SELECTION_VALID_COLOR
            });

            this.editorManager.handleEvents({
              type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
              highlightId: "shapeRepo.attached"
            });
          }
        }
      }
    },

    dragCallbackQuickMenu (event, ui) {
      if (this.dragModeOver != false) {
        var coord = this.editorManager.eventCoordinatesXY(event.pageX, event.pageY);

        var additionalIEZoom = 1;
        if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
          var ua = navigator.userAgent;
          if (ua.indexOf('MSIE') >= 0) {
            //IE 10 and below
            var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
            if (zoom !== 100) {
              additionalIEZoom = zoom / 100
            }
          }
        }

        if (additionalIEZoom !== 1) {
          coord.x = coord.x / additionalIEZoom;
          coord.y = coord.y / additionalIEZoom;
        }

        var aShapes = this.editorManager.getCanvas().getAbstractShapesAtPosition(coord);

        if (aShapes.length <= 0) {
          if (event.helper) {
            this.dragCanContain = false;
            return false;
          }
        }

        if (aShapes[0] instanceof ORYX.Core.Canvas) {
          this.editorManager.getCanvas().setHightlightStateBasedOnX(coord.x);
        }

        var stencil = undefined;
        var stencilSets = this.editorManager.getStencilSets().values();
        for (var i = 0; i < stencilSets.length; i++) {
          var stencilSet = stencilSets[i];
          var nodes = stencilSet.nodes();
          for (var j = 0; j < nodes.length; j++) {
            if (nodes[j].idWithoutNs() === event.target.id) {
              stencil = nodes[j];
              break;
            }
          }

          if (!stencil) {
            var edges = stencilSet.edges();
            for (var j = 0; j < edges.length; j++) {
              if (edges[j].idWithoutNs() === event.target.id) {
                stencil = edges[j];
                break;
              }
            }
          }
        }

        var candidate = aShapes.last();

        var isValid = false;
        if (stencil.type() === "node")  {
          //check containment rules
          var canContain = this.editorManager.getRules().canContain({containingShape:candidate, containedStencil:stencil});

          var parentCandidate = aShapes.reverse().find(function (candidate) {
            return (candidate instanceof ORYX.Core.Canvas
              || candidate instanceof ORYX.Core.Node
              || candidate instanceof ORYX.Core.Edge);
          });

          if (!parentCandidate) {
            this.dragCanContain = false;
            return false;
          }

          this.dragCurrentParent = parentCandidate;
          this.dragCurrentParentId = parentCandidate.id;
          this.dragCurrentParentStencil = parentCandidate.getStencil().id();
          this.dragCanContain = canContain;
          this.dropTargetElement = parentCandidate;
          isValid = canContain;

        } else { //Edge

          var shapes = this.editorManager.getSelection();
          if (shapes && shapes.length == 1) {
            var currentSelectedShape = shapes.first();
            var curCan = candidate;
            var canConnect = false;

            var targetStencil = this.getStencilItemById(curCan.getStencil().idWithoutNs());
            if (targetStencil) {
              var associationConnect = false;
              if (stencil.idWithoutNs() === 'Association' && (curCan.getStencil().idWithoutNs() === 'TextAnnotation' || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent')) {
                associationConnect = true;
              } else if (stencil.idWithoutNs() === 'DataAssociation' && curCan.getStencil().idWithoutNs() === 'DataStore') {
                associationConnect = true;
              }

              if (targetStencil.canConnectTo || associationConnect) {
                while (!canConnect && curCan && !(curCan instanceof ORYX.Core.Canvas)) {
                  candidate = curCan;
                  //check connection rules
                  canConnect = this.editorManager.getRules().canConnect({
                    sourceShape: currentSelectedShape,
                    edgeStencil: stencil,
                    targetShape: curCan
                  });
                  curCan = curCan.parent;
                }
              }
            }
            var parentCandidate = this.editorManager.getCanvas();

            isValid = canConnect;
            this.dragCurrentParent = parentCandidate;
            this.dragCurrentParentId = parentCandidate.id;
            this.dragCurrentParentStencil = parentCandidate.getStencil().id();
            this.dragCanContain = canConnect;
            this.dropTargetElement = candidate;
          }

        }

        this.editorManager.handleEvents({
          type:   ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
          highlightId:'shapeMenu',
          elements: [candidate],
          color: isValid ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
        });
      }
    },
  }
}

export default commonMix