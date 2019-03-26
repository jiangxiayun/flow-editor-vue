import ORYX from '@/assets/oryx'

class CreateCommand extends ORYX.Core.Command {
  constructor (option, currentReference, position, facade) {
    super()
    this.option = option
    this.currentReference = currentReference
    this.position = position
    this.facade = facade
    this.shape
    this.edge
    this.targetRefPos
    this.sourceRefPos
    /*
     * clone options parameters
     */
    this.connectedShape = option.connectedShape
    this.connectingType = option.connectingType
    this.namespace = option.namespace
    this.type = option.type
    this.containedStencil = option.containedStencil
    this.parent = option.parent
    this.currentReference = currentReference
    this.shapeOptions = option.shapeOptions
  }

  execute () {
    if (this.shape) {
      if (this.shape instanceof ORYX.Core.Node) {
        this.parent.add(this.shape)
        if (this.edge) {
          this.facade.getCanvas().add(this.edge)
          this.edge.dockers.first().setDockedShape(this.connectedShape)
          this.edge.dockers.first().setReferencePoint(this.sourceRefPos)
          this.edge.dockers.last().setDockedShape(this.shape)
          this.edge.dockers.last().setReferencePoint(this.targetRefPos)
        }

        this.facade.setSelection([this.shape])

      } else if (this.shape instanceof ORYX.Core.Edge) {
        this.facade.getCanvas().add(this.shape)
        this.shape.dockers.first().setDockedShape(this.connectedShape)
        this.shape.dockers.first().setReferencePoint(this.sourceRefPos)
      }
    } else {
      this.shape = this.facade.createShape(this.option)
      this.edge = (!(this.shape instanceof ORYX.Core.Edge)) ?
        this.shape.getIncomingShapes().first() : undefined
    }

    if (this.currentReference && this.position) {
      if (this.shape instanceof ORYX.Core.Edge) {

        if (!(this.currentReference instanceof ORYX.Core.Canvas)) {
          this.shape.dockers.last().setDockedShape(this.currentReference)

          if (this.currentReference.getStencil().idWithoutNs() === 'TextAnnotation') {
            let midpoint = {}
            midpoint.x = 0
            midpoint.y = this.currentReference.bounds.height() / 2
            this.shape.dockers.last().setReferencePoint(midpoint)
          } else {
            this.shape.dockers.last().setReferencePoint(this.currentReference.bounds.midPoint())
          }
        } else {
          this.shape.dockers.last().bounds.centerMoveTo(this.position)
        }
        this.sourceRefPos = this.shape.dockers.first().referencePoint
        this.targetRefPos = this.shape.dockers.last().referencePoint
      } else if (this.edge) {
        this.sourceRefPos = this.edge.dockers.first().referencePoint
        this.targetRefPos = this.edge.dockers.last().referencePoint
      }
    } else {
      var containedStencil = this.containedStencil
      var connectedShape = this.connectedShape
      var bc = connectedShape.bounds
      var bs = this.shape.bounds

      var pos = bc.center()
      if (containedStencil.defaultAlign() === 'north') {
        pos.y -= (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height() / 2)
      } else if (containedStencil.defaultAlign() === 'northeast') {
        pos.x += (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2)
        pos.y -= (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2)
      } else if (containedStencil.defaultAlign() === 'southeast') {
        pos.x += (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2)
        pos.y += (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2)
      } else if (containedStencil.defaultAlign() === 'south') {
        pos.y += (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height() / 2)
      } else if (containedStencil.defaultAlign() === 'southwest') {
        pos.x -= (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2)
        pos.y += (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2)
      } else if (containedStencil.defaultAlign() === 'west') {
        pos.x -= (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.width() / 2)
      } else if (containedStencil.defaultAlign() === 'northwest') {
        pos.x -= (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2)
        pos.y -= (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2)
      } else {
        pos.x += (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.width() / 2)
      }

      // Move shape to the new position
      this.shape.bounds.centerMoveTo(pos)

      // Move all dockers of a node to the position
      if (this.shape instanceof ORYX.Core.Node) {
        (this.shape.dockers || []).each(function (docker) {
          docker.bounds.centerMoveTo(pos)
        })
      }

      //this.shape.update();
      this.position = pos

      if (this.edge) {
        this.sourceRefPos = this.edge.dockers.first().referencePoint
        this.targetRefPos = this.edge.dockers.last().referencePoint
      }
    }

    this.facade.getCanvas().update()
    this.facade.updateSelection()
  }

  rollback () {
    this.facade.deleteShape(this.shape)
    if (this.edge) {
      this.facade.deleteShape(this.edge)
    }
    // this.currentParent.update();
    this.facade.setSelection(this.facade.getSelection().without(this.shape, this.edge))
  }
}


/** Inspired by https://github.com/krasimir/EventBus/blob/master/src/EventBus.js */

export const FLOWABLE = {
  UI_CONFIG: {
    'showRemovedProperties': false
  },
  HEADER_CONFIG: {
    'showAppTitle': true,
    'showHeaderMenu': true,
    'showMainNavigation': true,
    'showPageHeader': true
  },
  eventBus: {
    /** Event fired when the editor is loaded and ready */
    EVENT_TYPE_EDITOR_READY: 'event-type-editor-ready',
    EVENT_TYPE_EDITOR_BOOTED: 'event-type-editor-booted',
    /** Event fired when a selection is made on the canvas. */
    EVENT_TYPE_SELECTION_CHANGE: 'event-type-selection-change',
    /** Event fired when a toolbar button has been clicked. */
    EVENT_TYPE_TOOLBAR_BUTTON_CLICKEDEVENT_TYPE_TOOLBAR_BUTTON_CLICKED: 'event-type-toolbar-button-clicked',
    /** Event fired when a stencil item is dropped on the canvas. */
    EVENT_TYPE_ITEM_DROPPED: 'event-type-item-dropped',
    /** Event fired when a property value is changed. */
    EVENT_TYPE_PROPERTY_VALUE_CHANGED: 'event-type-property-value-changed',
    EVENT_TYPE_SELECTION_CHANGED: 'event-type-selection-changed',
    /** Event fired on double click in canvas. */
    EVENT_TYPE_DOUBLE_CLICK: 'event-type-double-click',
    /** Event fired on a mouse out */
    EVENT_TYPE_MOUSE_OUT: 'event-type-mouse-out',
    /** Event fired on a mouse over */
    EVENT_TYPE_MOUSE_OVER: 'event-type-mouse-over',
    /** Event fired when a model is saved. */
    EVENT_TYPE_MODEL_SAVED: 'event-type-model-saved',
    /** Event fired when the quick menu buttons should be hidden. */
    EVENT_TYPE_HIDE_SHAPE_BUTTONS: 'event-type-hide-shape-buttons',
    /** Event fired when the validation popup should be shown. */
    EVENT_TYPE_SHOW_VALIDATION_POPUP: 'event-type-show-validation-popup',
    /** Event fired when a different process must be loaded. */
    EVENT_TYPE_NAVIGATE_TO_PROCESS: 'event-type-navigate-to-process',
    EVENT_TYPE_UNDO_REDO_RESET: 'event-type-undo-redo-reset',
    /** A mapping for storing the listeners*/
    listeners: {},
    /** The Oryx editor, which is stored locally to send events to */
    editor: null,
    /**
     * Add an event listener to the event bus, listening to the event with the provided type.
     * Type and callback are mandatory parameters.
     *
     * Provide scope parameter if it is important that the callback is executed
     * within a specific scope.
     */
    addListener: function (type, callback, scope) {
      // Add to the listeners map
      if (typeof this.listeners[type] !== 'undefined') {
        this.listeners[type].push({ scope: scope, callback: callback })
      } else {
        this.listeners[type] = [
          { scope: scope, callback: callback }
        ]
      }
    },

    /**
     * Removes the provided event listener.
     */
    removeListener: function (type, callback, scope) {
      if (typeof this.listeners[type] != 'undefined') {
        const numOfCallbacks = this.listeners[type].length
        let newArray = []
        for (let i = 0; i < numOfCallbacks; i++) {
          let listener = this.listeners[type][i]
          if (listener.scope === scope && listener.callback === callback) {
            // Do nothing, this is the listener and doesn't need to survive
          } else {
            newArray.push(listener)
          }
        }
        this.listeners[type] = newArray
      }
    },

    hasListener: function (type, callback, scope) {
      if (typeof this.listeners[type] != 'undefined') {
        const numOfCallbacks = this.listeners[type].length
        if (callback === undefined && scope === undefined) {
          return numOfCallbacks > 0
        }
        for (let i = 0; i < numOfCallbacks; i++) {
          const listener = this.listeners[type][i]
          if (listener.scope == scope && listener.callback == callback) {
            return true
          }
        }
      }
      return false
    },

    /**
     * Dispatch an event to all event listeners registered to that specific type.
     */
    dispatch: function (type, event) {
      if (typeof this.listeners[type] != 'undefined') {
        const numOfCallbacks = this.listeners[type].length
        for (let i = 0; i < numOfCallbacks; i++) {
          let listener = this.listeners[type][i]
          if (listener && listener.callback) {
            listener.callback.apply(listener.scope, [event])
          }
        }
      }
    },

    dispatchOryxEvent: function (event, uiObject) {
      FLOWABLE.eventBus.editor.handleEvents(event, uiObject)
    }
  },
  CreateCommand: CreateCommand,
  PROPERTY_CONFIG: {
    'string': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'string-property-write-mode-template'
    },
    'boolean': {
      'templateUrl': 'boolean-property-template'
    },
    'text': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'text-property-write-template'
    },
    'flowable-calledelementtype': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'calledelementtype-property-write-template'
    },
    'flowable-multiinstance': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'multiinstance-property-write-template'
    },
    'flowable-processhistorylevel': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'process-historylevel-property-write-template'
    },
    'flowable-ordering': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'ordering-property-write-template'
    },
    'oryx-dataproperties-complex': {
      'readModeTemplateUrl': 'data-properties-display-template',
      'writeModeTemplateUrl': 'data-properties-write-template'
    },
    'oryx-formproperties-complex': {
      'readModeTemplateUrl': 'form-properties-display-template',
      'writeModeTemplateUrl': 'form-properties-write-template'
    },
    'oryx-executionlisteners-multiplecomplex': {
      'readModeTemplateUrl': 'execution-listeners-display-template',
      'writeModeTemplateUrl': 'execution-listeners-write-template'
    },
    'oryx-tasklisteners-multiplecomplex': {
      'readModeTemplateUrl': 'task-listeners-display-template',
      'writeModeTemplateUrl': 'task-listeners-write-template'
    },
    'oryx-eventlisteners-multiplecomplex': {
      'readModeTemplateUrl': 'event-listeners-display-template',
      'writeModeTemplateUrl': 'event-listeners-write-template'
    },
    'oryx-usertaskassignment-complex': {
      'readModeTemplateUrl': 'assignment-display-template',
      'writeModeTemplateUrl': 'assignment-write-template'
    },
    'oryx-servicetaskfields-complex': {
      'readModeTemplateUrl': 'fields-display-template',
      'writeModeTemplateUrl': 'fields-write-template'
    },
    'oryx-callactivityinparameters-complex': {
      'readModeTemplateUrl': 'in-parameters-display-template',
      'writeModeTemplateUrl': 'in-parameters-write-template'
    },
    'oryx-callactivityoutparameters-complex': {
      'readModeTemplateUrl': 'out-parameters-display-template',
      'writeModeTemplateUrl': 'out-parameters-write-template'
    },
    // oryx子进程引用子进程链接
    'oryx-subprocessreference-subprocess-link': {
      'readModeTemplateUrl': 'subprocess-reference-display-template',
      'writeModeTemplateUrl': 'subprocess-reference-write-template'
    },
    'oryx-formreference-complex': {
      'readModeTemplateUrl': 'form-reference-display-template',
      'writeModeTemplateUrl': 'form-reference-write-template'
    },
    'oryx-sequencefloworder-complex': {
      'readModeTemplateUrl': 'sequenceflow-order-display-template',
      'writeModeTemplateUrl': 'sequenceflow-order-write-template'
    },
    'oryx-conditionsequenceflow-complex': {
      'readModeTemplateUrl': 'condition-expression-display-template',
      'writeModeTemplateUrl': 'condition-expression-write-template'
    },
    'oryx-signaldefinitions-multiplecomplex': {
      'readModeTemplateUrl': 'signal-definitions-display-template',
      'writeModeTemplateUrl': 'signal-definitions-write-template'
    },
    'oryx-signalref-string': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'signal-property-write-template'
    },
    'oryx-messagedefinitions-multiplecomplex': {
      'readModeTemplateUrl': 'message-definitions-display-template',
      'writeModeTemplateUrl': 'message-definitions-write-template'
    },
    'oryx-messageref-string': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'message-property-write-template'
    },
    'oryx-duedatedefinition-complex': {
      'readModeTemplateUrl': 'duedate-display-template',
      'writeModeTemplateUrl': 'duedate-write-template'
    },
    'oryx-decisiontaskdecisiontablereference-complex': {
      'readModeTemplateUrl': 'decisiontable-reference-display-template',
      'writeModeTemplateUrl': 'decisiontable-reference-write-template'
    },
    'oryx-casetaskcasereference-complex': {
      'readModeTemplateUrl': 'case-reference-display-template',
      'writeModeTemplateUrl': 'case-reference-write-template'
    },
    'oryx-processtaskprocessreference-complex': {
      'readModeTemplateUrl': 'process-reference-display-template',
      'writeModeTemplateUrl': 'process-reference-write-template'
    },
    'oryx-processtaskinparameters-complex': {
      'readModeTemplateUrl': 'in-parameters-display-template',
      'writeModeTemplateUrl': 'in-parameters-write-template'
    },
    'oryx-processtaskoutparameters-complex': {
      'readModeTemplateUrl': 'out-parameters-display-template',
      'writeModeTemplateUrl': 'out-parameters-write-template'
    },
    'flowable-transitionevent': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'transition-event-write-template'
    },
    'flowable-planitem-dropdown': {
      'readModeTemplateUrl': 'planitem-dropdown-read-template',
      'writeModeTemplateUrl': 'planitem-dropdown-write-template'
    },
    'flowable-http-request-method': {
      'readModeTemplateUrl': 'http-request-method-display-template',
      'writeModeTemplateUrl': 'http-request-method-property-write-template'
    },
    'oryx-output-complex': {
      'readModeTemplateUrl': 'form-reference-display-template',
      'writeModeTemplateUrl': 'form-reference-write-template'
    },
    'oryx-input-complex': {
      'readModeTemplateUrl': 'form-reference-display-template',
      'writeModeTemplateUrl': 'form-reference-write-template'
    }
  },
  TOOLBAR_CONFIG: {
    'items': [
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.SAVE',
        'cssClass': 'editor-icon editor-icon-save',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.saveModel'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.VALIDATE',
        'cssClass': 'glyphicon glyphicon-ok',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.validate'
      },
      {
        'type': 'separator',
        'title': '',
        'cssClass': 'toolbar-separator'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.CUT',
        'cssClass': 'editor-icon editor-icon-cut',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.cut',
        'enabled': false,
        'enabledAction': 'element'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.COPY',
        'cssClass': 'editor-icon editor-icon-copy',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.copy',
        'enabled': false,
        'enabledAction': 'element'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.PASTE',
        'cssClass': 'editor-icon editor-icon-paste',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.paste',
        'enabled': false
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.DELETE',
        'cssClass': 'editor-icon editor-icon-delete',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.deleteItem',
        'enabled': false,
        'enabledAction': 'element'
      },
      {
        'type': 'separator',
        'title': 'TOOLBAR.ACTION.SAVE',
        'cssClass': 'toolbar-separator'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.REDO',
        'cssClass': 'editor-icon editor-icon-redo',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.redo',
        'enabled': false
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.UNDO',
        'cssClass': 'editor-icon editor-icon-undo',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.undo',
        'enabled': false
      },
      {
        'type': 'separator',
        'title': 'TOOLBAR.ACTION.SAVE',
        'cssClass': 'toolbar-separator'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ALIGNVERTICAL',
        'cssClass': 'editor-icon editor-icon-align-vertical',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.alignVertical',
        'enabled': false,
        'enabledAction': 'element',
        'disableInForm': true,
        'minSelectionCount': 2
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ALIGNHORIZONTAL',
        'cssClass': 'editor-icon editor-icon-align-horizontal',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.alignHorizontal',
        'enabledAction': 'element',
        'enabled': false,
        'disableInForm': true,
        'minSelectionCount': 2
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.SAMESIZE',
        'cssClass': 'editor-icon editor-icon-same-size',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.sameSize',
        'enabledAction': 'element',
        'enabled': false,
        'disableInForm': true,
        'minSelectionCount': 2
      },
      {
        'type': 'separator',
        'title': 'TOOLBAR.ACTION.SAVE',
        'cssClass': 'toolbar-separator',
        'disableInForm': true
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ZOOMIN',
        'cssClass': 'editor-icon editor-icon-zoom-in',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.zoomIn'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ZOOMOUT',
        'cssClass': 'editor-icon editor-icon-zoom-out',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.zoomOut'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ZOOMACTUAL',
        'cssClass': 'editor-icon editor-icon-zoom-actual',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.zoomActual'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ZOOMFIT',
        'cssClass': 'editor-icon editor-icon-zoom-fit',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.zoomFit'
      },
      {
        'type': 'separator',
        'title': 'TOOLBAR.ACTION.SAVE',
        'cssClass': 'toolbar-separator',
        'disableInForm': true
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.BENDPOINT.ADD',
        'cssClass': 'editor-icon editor-icon-bendpoint-add',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.addBendPoint',
        'id': 'add-bendpoint-button',
        'disableInForm': true
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.BENDPOINT.REMOVE',
        'cssClass': 'editor-icon editor-icon-bendpoint-remove',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.removeBendPoint',
        'id': 'remove-bendpoint-button',
        'disableInForm': true
      },
      {
        'type': 'separator',
        'title': '',
        'cssClass': 'toolbar-separator',
        'disableInForm': true
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.HELP',
        'cssClass': 'glyphicon glyphicon-question-sign',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.help'
      }
    ],
    'secondaryItems': [
      {
        'type': 'button',
        'title': 'Close',
        'cssClass': 'glyphicon glyphicon-remove',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.closeEditor'
      }
    ]
  },
  TOOLBAR: {
    ACTIONS: {
      closeEditor: function (services) {
        if (services.editorManager && services.editorManager.getStencilData()) {
          var stencilNameSpace = services.editorManager.getStencilData().namespace
          if (stencilNameSpace !== undefined && stencilNameSpace !== null && stencilNameSpace.indexOf('cmmn1.1') !== -1) {
            services.$location.path('/casemodels')
            return
          }
        }
        services.$location.path('/processes')
      },
      navigateToProcess: function (processId) {
        var navigateEvent = {
          type: FLOWABLE.eventBus.EVENT_TYPE_NAVIGATE_TO_PROCESS,
          processId: processId
        }
        FLOWABLE.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_NAVIGATE_TO_PROCESS, navigateEvent)
      },
      saveModel: function (services) {
        _internalCreateModal({
          backdrop: true,
          keyboard: true,
          template: 'editor-app/popups/save-model.html?version=' + Date.now(),
          scope: services.$scope
        }, services.$modal, services.$scope)
      },
      validate: function (services) {
        _internalCreateModal({
          backdrop: true,
          keyboard: true,
          template: 'editor-app/popups/validate-model.html?version=' + Date.now(),
          scope: services.$scope
        }, services.$modal, services.$scope)
      },
      undo: function (services) {
        // Get the last commands
        var lastCommands = services.$scope.undoStack.pop()

        if (lastCommands) {
          // Add the commands to the redo stack
          services.$scope.redoStack.push(lastCommands)
          // Force refresh of selection, might be that the undo command
          // impacts properties in the selected item
          if (services.$rootScope && services.$rootScope.forceSelectionRefresh) {
            services.$rootScope.forceSelectionRefresh = true
          }

          // Rollback every command
          for (let i = lastCommands.length - 1; i >= 0; --i) {
            lastCommands[i].rollback()
          }

          // Update and refresh the canvas
          services.editorManager.handleEvents({
            type: ORYX.CONFIG.EVENT_UNDO_ROLLBACK,
            commands: lastCommands
          })

          // Update
          services.editorManager.getCanvas().update()
          services.editorManager.updateSelection()
        }

        let toggleUndo = false
        if (services.$scope.undoStack.length === 0) {
          toggleUndo = true
        }

        let toggleRedo = false
        if (services.$scope.redoStack.length > 0) {
          toggleRedo = true
        }

        if (toggleUndo || toggleRedo) {
          for (let i = 0; i < services.$scope.items.length; i++) {
            let item = services.$scope.items[i]
            if (toggleUndo && item.action === 'FLOWABLE.TOOLBAR.ACTIONS.undo') {
              item.enabled = false
            } else if (toggleRedo && item.action === 'FLOWABLE.TOOLBAR.ACTIONS.redo') {
              item.enabled = true
            }
          }
        }
      },
      redo: function (services) {
        // Get the last commands from the redo stack
        var lastCommands = services.$scope.redoStack.pop()

        if (lastCommands) {
          // Add this commands to the undo stack
          services.$scope.undoStack.push(lastCommands)

          // Force refresh of selection, might be that the redo command
          // impacts properties in the selected item
          if (services.$rootScope && services.$rootScope.forceSelectionRefresh) {
            services.$rootScope.forceSelectionRefresh = true
          }

          // Execute those commands
          lastCommands.each(function (command) {
            command.execute()
          })

          // Update and refresh the canvas
          services.editorManager.handleEvents({
            type: ORYX.CONFIG.EVENT_UNDO_EXECUTE,
            commands: lastCommands
          })

          // Update
          services.editorManager.getCanvas().update()
          services.editorManager.updateSelection()
        }

        var toggleUndo = false
        if (services.$scope.undoStack.length > 0) {
          toggleUndo = true
        }

        var toggleRedo = false
        if (services.$scope.redoStack.length == 0) {
          toggleRedo = true
        }

        if (toggleUndo || toggleRedo) {
          for (var i = 0; i < services.$scope.items.length; i++) {
            var item = services.$scope.items[i]
            if (toggleUndo && item.action === 'FLOWABLE.TOOLBAR.ACTIONS.undo') {
              services.$scope.safeApply(function () {
                item.enabled = true
              })
            }
            else if (toggleRedo && item.action === 'FLOWABLE.TOOLBAR.ACTIONS.redo') {
              services.$scope.safeApply(function () {
                item.enabled = false
              })
            }
          }
        }
      },
      cut: function (services) {
        FLOWABLE.TOOLBAR.ACTIONS._getOryxEditPlugin(services).editCut()
        for (let i = 0; i < services.$scope.items.length; i++) {
          let item = services.$scope.items[i]
          if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.paste') {
            item.enabled = true
          }
        }
      },
      copy: function (services) {
        FLOWABLE.TOOLBAR.ACTIONS._getOryxEditPlugin(services).editCopy()
        for (let i = 0; i < services.$scope.items.length; i++) {
          let item = services.$scope.items[i]
          if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.paste') {
            item.enabled = true
          }
        }
      },
      paste: function (services) {
        FLOWABLE.TOOLBAR.ACTIONS._getOryxEditPlugin(services).editPaste()
      },
      deleteItem: function (services) {
        FLOWABLE.TOOLBAR.ACTIONS._getOryxEditPlugin(services).editDelete()
      },
      addBendPoint: function (services) {
        // Show the tutorial the first time
        FLOWABLE_EDITOR_TOUR.sequenceFlowBendpoint(services.$scope, true)

        const dockerPlugin = FLOWABLE.TOOLBAR.ACTIONS._getOryxDockerPlugin(services)
        let enableAdd = !dockerPlugin.enabledAdd()
        dockerPlugin.setEnableAdd(enableAdd)
        if (enableAdd) {
          dockerPlugin.setEnableRemove(false)
          document.body.style.cursor = 'pointer'
        }
        else {
          document.body.style.cursor = 'default'
        }
      },
      removeBendPoint: function (services) {
        // Show the tutorial the first time
        FLOWABLE_EDITOR_TOUR.sequenceFlowBendpoint(services.$scope, true)

        const dockerPlugin = FLOWABLE.TOOLBAR.ACTIONS._getOryxDockerPlugin(services)

        let enableRemove = !dockerPlugin.enabledRemove()
        dockerPlugin.setEnableRemove(enableRemove)
        if (enableRemove) {
          dockerPlugin.setEnableAdd(false)
          document.body.style.cursor = 'pointer'
        }
        else {
          document.body.style.cursor = 'default'
        }
      },
      /**
       * Helper method: fetches the Oryx Edit plugin from the provided scope,
       * if not on the scope, it is created and put on the scope for further use.
       *
       * It's important to reuse the same EditPlugin while the same scope is active,
       * as the clipboard is stored for the whole lifetime of the scope.
       */
      _getOryxEditPlugin: function (services) {
        var $scope = services.$scope
        var editorManager = services.editorManager
        if ($scope.oryxEditPlugin === undefined || $scope.oryxEditPlugin === null) {
          $scope.oryxEditPlugin = new ORYX.Plugins.Edit(editorManager.getEditor())
        }
        return $scope.oryxEditPlugin
      },
      // 缩放
      zoomIn: function (services) {
        FLOWABLE.TOOLBAR.ACTIONS._getOryxViewPlugin(services).zoom([1.0 + ORYX.CONFIG.ZOOM_OFFSET])
      },
      zoomOut: function (services) {
        FLOWABLE.TOOLBAR.ACTIONS._getOryxViewPlugin(services).zoom([1.0 - ORYX.CONFIG.ZOOM_OFFSET])
      },
      zoomActual: function (services) {
        FLOWABLE.TOOLBAR.ACTIONS._getOryxViewPlugin(services).setAFixZoomLevel(1)
      },
      zoomFit: function (services) {
        FLOWABLE.TOOLBAR.ACTIONS._getOryxViewPlugin(services).zoomFitToModel()
      },
      // 对齐
      alignVertical: function (services) {
        FLOWABLE.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_CENTER])
      },
      alignHorizontal: function (services) {
        FLOWABLE.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_MIDDLE])
      },

      sameSize: function (services) {
        FLOWABLE.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_SIZE])
      },
      help: function (services) {
        FLOWABLE_EDITOR_TOUR.gettingStarted(services.$scope)
      },
      /**
       * Helper method: fetches the Oryx View plugin from the provided scope,
       * if not on the scope, it is created and put on the scope for further use.
       */
      _getOryxViewPlugin: function (services) {
        var $scope = services.$scope
        var editorManager = services.editorManager
        if ($scope.oryxViewPlugin === undefined || $scope.oryxViewPlugin === null) {
          $scope.oryxViewPlugin = new ORYX.Plugins.View(editorManager.getEditor())
        }
        return $scope.oryxViewPlugin
      },
      _getOryxArrangmentPlugin: function (services) {
        var $scope = services.$scope
        var editorManager = services.editorManager
        if ($scope.oryxArrangmentPlugin === undefined || $scope.oryxArrangmentPlugin === null) {
          $scope.oryxArrangmentPlugin = new ORYX.Plugins.Arrangement(editorManager.getEditor())
        }
        return $scope.oryxArrangmentPlugin
      },
      _getOryxDockerPlugin: function (services) {
        var $scope = services.$scope
        var editorManager = services.editorManager
        if ($scope.oryxDockerPlugin === undefined || $scope.oryxDockerPlugin === null) {
          $scope.oryxDockerPlugin = new ORYX.Plugins.AddDocker(editorManager.getEditor())
        }
        return $scope.oryxDockerPlugin
      }
    }
  }
}


export function FLOWABLE_eventBus_initAddListener (editorManager) {
  FLOWABLE.eventBus.addListener(FLOWABLE.eventBus.EVENT_TYPE_EDITOR_READY, () => {
    var url = window.location.href
    var regex = new RegExp('[?&]subProcessId(=([^&#]*)|&|#|$)')
    var results = regex.exec(url)
    if (results && results[2]) {
      editorManager.edit(decodeURIComponent(results[2].replace(/\+/g, ' ')))
    }
  })
  // 隐藏画布节点的快捷按钮
  FLOWABLE.eventBus.addListener(FLOWABLE.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS, function (event) {
    jQuery('.Oryx_button').each(function (i, obj) {
      obj.style.display = 'none'
    })
  })
  FLOWABLE.eventBus.addListener(FLOWABLE.eventBus.EVENT_TYPE_UNDO_REDO_RESET, function () {
    if (this.items) {
      for (let i = 0; i < this.items.length; i++) {
        let item = this.items[i]
        if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.undo' || item.action === 'FLOWABLE.TOOLBAR.ACTIONS.redo') {
          item.enabled = false
        }
      }
    }

  }, this)

  FLOWABLE.eventBus.addListener(FLOWABLE.eventBus.EVENT_TYPE_SHOW_VALIDATION_POPUP, function (event) {
    // Method to open validation dialog
    var showValidationDialog = function () {
      this.currentValidationId = event.validationId
      this.isOnProcessLevel = event.onProcessLevel

      _internalCreateModal({ template: 'editor-app/popups/validation-errors.html?version=' + Date.now() }, $modal, this)
    }

    showValidationDialog()
  })

  FLOWABLE.eventBus.addListener(FLOWABLE.eventBus.EVENT_TYPE_NAVIGATE_TO_PROCESS, function (event) {
    var modelMetaData = editorManager.getBaseModelData()
    this.editorHistory.push({
      id: modelMetaData.modelId,
      name: modelMetaData.name,
      type: 'bpmnmodel'
    })

    $window.location.href = '../editor/#/editor/' + event.processId
  })
}
