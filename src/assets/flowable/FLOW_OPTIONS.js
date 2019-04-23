import ORYX from '@/assets/oryx'
import { FLOWABLE } from './FLOWABLE_Config'

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
    // this.facade.raiseEvent({ type: 'newshape_addin_canvas', shape: this.shape })
    this.facade.handleEvents({
      type: 'newshape_addin_canvas',
      shape: this.shape
    })
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

// 帮助提示
const FLOWABLE_EDITOR_TOUR = {
  /*
   * General 'getting started' tutorial for the Editor.
   */
  gettingStarted: function ($scope, useLocalStorage) {
    let userName
    if (!$scope.account) {
      userName = '开发者'
    } else if ($scope.account.firstName) {
      userName = $scope.account.firstName
    } else {
      userName = $scope.account.fullname
    }

    const translations = [
      $scope.$t('TOUR.WELCOME-TITLE', { userName: userName }),
      $scope.$t('TOUR.WELCOME-CONTENT'),
      $scope.$t('TOUR.PALETTE-TITLE'),
      $scope.$t('TOUR.PALETTE-CONTENT'),
      $scope.$t('TOUR.CANVAS-TITLE'),
      $scope.$t('TOUR.CANVAS-CONTENT'),
      $scope.$t('TOUR.DRAGDROP-TITLE'),
      $scope.$t('TOUR.DRAGDROP-CONTENT'),
      $scope.$t('TOUR.PROPERTIES-TITLE'),
      $scope.$t('TOUR.PROPERTIES-CONTENT'),
      $scope.$t('TOUR.TOOLBAR-TITLE'),
      $scope.$t('TOUR.TOOLBAR-CONTENT'),
      $scope.$t('TOUR.END-TITLE'),
      $scope.$t('TOUR.END-CONTENT')
    ]
    // We're using a hack here due to https://github.com/sorich87/bootstrap-tour/issues/85:
    // when clicking next in the tour, it always sets the 'display' css property to 'none'
    // The hack is simple: before the next step is shown, we reset the 'display' property to 'block'

    const tourStepDomElements = ['body', '#paletteHelpWrapper',
      '#canvasHelpWrapper', '#propertiesHelpWrapper', '#editor-header']

    const tour = new Tour({
      name: 'activitiEditorTour',
      storage: (useLocalStorage ? window.localStorage : false),
      container: 'body',
      backdrop: true,
      keyboard: true,
      steps: [
        {
          orphan: true,
          title: translations[0],
          content: translations[1],
          template: FLOWABLE_EDITOR_TOUR._buildStepTemplate(false, true, false, 300),
          onNext: FLOWABLE_EDITOR_TOUR._buildOnNextFunction(tourStepDomElements[0])
        },
        {
          element: tourStepDomElements[1],
          title: translations[2],
          content: translations[3],
          template: FLOWABLE_EDITOR_TOUR._buildStepTemplate(false, true, false, 400, 'flowable/images/tour/open-group.gif'),
          onNext: FLOWABLE_EDITOR_TOUR._buildOnNextFunction(tourStepDomElements[1])
        },
        {
          element: tourStepDomElements[2],
          title: translations[4],
          content: translations[5],
          placement: 'left',
          template: FLOWABLE_EDITOR_TOUR._buildStepTemplate(false, true, false),
          onNext: FLOWABLE_EDITOR_TOUR._buildOnNextFunction(tourStepDomElements[2])
        },
        {
          orphan: true,
          title: translations[6],
          content: translations[7],
          template: FLOWABLE_EDITOR_TOUR._buildStepTemplate(false, true, false, 720, 'flowable/images/tour/tour-dnd.gif'),
          onNext: FLOWABLE_EDITOR_TOUR._buildOnNextFunction(tourStepDomElements[0])
        },
        {
          element: tourStepDomElements[3],
          title: translations[8],
          content: translations[9],
          placement: 'top',
          template: FLOWABLE_EDITOR_TOUR._buildStepTemplate(false, true, false, 400),
          onNext: FLOWABLE_EDITOR_TOUR._buildOnNextFunction(tourStepDomElements[3])
        },
        {
          element: tourStepDomElements[4],
          title: translations[10],
          content: translations[11],
          placement: 'bottom',
          template: FLOWABLE_EDITOR_TOUR._buildStepTemplate(false, true, false, 400),
          onNext: FLOWABLE_EDITOR_TOUR._buildOnNextFunction(tourStepDomElements[4])
        },
        {
          orphan: true,
          title: translations[12],
          content: translations[13],
          template: FLOWABLE_EDITOR_TOUR._buildStepTemplate(false, false, true, 400),
          onNext: FLOWABLE_EDITOR_TOUR._buildOnNextFunction(tourStepDomElements[0])
        }
      ],
      onEnd: FLOWABLE_EDITOR_TOUR._buildOnEndFunction(tourStepDomElements)
    })
    tour.init()
    tour.start()
  },

  /*
   * Tutorial showing how to use the bendpoint functionality for sequenceflow
   */
  sequenceFlowBendpoint: function ($scope, useLocalStorage) {
    const translations = [
      $scope.$t('FEATURE-TOUR.BENDPOINT.TITLE'), $scope.$t('FEATURE-TOUR.BENDPOINT.DESCRIPTION')
    ]
    // We're using a hack here due to https://github.com/sorich87/bootstrap-tour/issues/85:
    // when clicking next in the tour, it always sets the 'display' css property to 'none'
    // The hack is simple: before the next step is shown, we reset the 'display' property to 'block'

    const tourStepDomElements = ['body']
    const tour = new Tour({
      name: 'bendpointTour',
      storage: (useLocalStorage ? window.localStorage : false),
      container: 'body',
      backdrop: true,
      keyboard: true,
      steps: [
        {
          orphan: true,
          title: translations[0],
          content: translations[1],
          template: FLOWABLE_EDITOR_TOUR._buildStepTemplate(false, false, true, 500, 'flowable/images/tour/sequenceflow-bendpoint.gif'),
          onNext: FLOWABLE_EDITOR_TOUR._buildOnNextFunction(tourStepDomElements[0])
        }
      ],
      onEnd: FLOWABLE_EDITOR_TOUR._buildOnEndFunction(tourStepDomElements)
    })

    tour.init()
    tour.start()
  },

  _buildStepTemplate: function (addPrevButton, addNextButton, addEndTourButton, optionalForcedWidth, image) {
    let width = 200
    if (optionalForcedWidth) {
      width = optionalForcedWidth
    }

    let template =
      '<div class=\'popover tour\' style=\'max-width:' + width + 'px\'>' +
      '<div class=\'arrow\'></div>' +
      '<h3 class=\'popover-title\'></h3>' +
      '<div class=\'popover-content\'></div>' +
      '<div class=\'popover-navigation\'>'
    if (image) {
      template = template + '<div><img src=\'' + image + '\' style=\'border 1px solid black;margin:5px 0 5px 0;\'></img></div>'
    }
    if (addPrevButton) {
      template = template + '<button class=\'btn btn-sm btn-default \' data-role=\'prev\'>« Prev</button>'
    }
    if (addNextButton) {
      template = template + '<button class=\'btn btn-sm btn-default\' data-role=\'next\' style=\'float:right\'">Next »</button>'
    }
    if (addEndTourButton) {
      template = template + '<button class=\'btn btn-warning btn-sm\' data-role=\'end\' style=\'float:right\'">Got it!</button>'
    }

    template = template + '</div>' + '</nav>' + '</div>'
    return template
  },

  _buildOnNextFunction: function (selector) {
    return function () {
      jQuery(selector).each(function (i, obj) {
        obj.style.display = 'block'
      })
    }
  },

  _buildOnEndFunction: function (selectors) {
    return function () {
      for (let elementsToResetIndex = 0; elementsToResetIndex < selectors.length; elementsToResetIndex++) {
        jQuery(selectors[elementsToResetIndex]).each(function (i, obj) {
          obj.style.display = 'block'
        })
      }
    }
  }
}

// 画布-svg 操作
const FLOW_OPTIONS = {
  CreateCommand: CreateCommand,
  TOOLBAR: {
    ACTIONS: {
      closeEditor: function (services) {
        if (services.editorManager && services.editorManager.getStencilData()) {
          const stencilNameSpace = services.editorManager.getStencilData().namespace
          if (stencilNameSpace !== undefined && stencilNameSpace !== null && stencilNameSpace.indexOf('cmmn1.1') !== -1) {
            services.$location.path('/casemodels')
            return
          }
        }
        services.$location.path('/processes')
      },
      navigateToProcess: function (processId) {
        const navigateEvent = {
          type: FLOWABLE.eventBus.EVENT_TYPE_NAVIGATE_TO_PROCESS,
          processId: processId
        }
        FLOWABLE.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_NAVIGATE_TO_PROCESS, navigateEvent)
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
        const lastCommands = services.$scope.undoStack.pop()
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
        const lastCommands = services.$scope.redoStack.pop()
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

        let toggleUndo = false
        if (services.$scope.undoStack.length > 0) {
          toggleUndo = true
        }

        let toggleRedo = false
        if (services.$scope.redoStack.length == 0) {
          toggleRedo = true
        }

        if (toggleUndo || toggleRedo) {
          for (let i = 0; i < services.$scope.items.length; i++) {
            let item = services.$scope.items[i]
            if (toggleUndo && item.action === 'FLOWABLE.TOOLBAR.ACTIONS.undo') {
              services.$scope.safeApply(function () {
                item.enabled = true
              })
            } else if (toggleRedo && item.action === 'FLOWABLE.TOOLBAR.ACTIONS.redo') {
              services.$scope.safeApply(function () {
                item.enabled = false
              })
            }
          }
        }
      },
      cut: function (services) {
        FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxEditPlugin(services).editCut()
        for (let i = 0; i < services.$scope.items.length; i++) {
          let item = services.$scope.items[i]
          if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.paste') {
            item.enabled = true
          }
        }
      },
      copy: function (services) {
        FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxEditPlugin(services).editCopy()
        for (let i = 0; i < services.$scope.items.length; i++) {
          let item = services.$scope.items[i]
          if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.paste') {
            item.enabled = true
          }
        }
      },
      paste: function (services) {
        FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxEditPlugin(services).editPaste()
      },
      deleteItem: function (services) {
        FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxEditPlugin(services).editDelete()
      },
      addBendPoint: function (services) {
        // Show the tutorial the first time
        FLOWABLE_EDITOR_TOUR.sequenceFlowBendpoint(services.$scope, true)

        const dockerPlugin = FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxDockerPlugin(services)
        let enableAdd = !dockerPlugin.enabledAdd()
        dockerPlugin.setEnableAdd(enableAdd)
        if (enableAdd) {
          dockerPlugin.setEnableRemove(false)
          document.body.style.cursor = 'pointer'
        } else {
          document.body.style.cursor = 'default'
        }
      },
      removeBendPoint: function (services) {
        // Show the tutorial the first time
        FLOWABLE_EDITOR_TOUR.sequenceFlowBendpoint(services.$scope, true)
        const dockerPlugin = FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxDockerPlugin(services)
        let enableRemove = !dockerPlugin.enabledRemove()
        dockerPlugin.setEnableRemove(enableRemove)
        if (enableRemove) {
          dockerPlugin.setEnableAdd(false)
          document.body.style.cursor = 'pointer'
        } else {
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
        const $scope = services.$scope
        const editorManager = services.editorManager
        if ($scope.oryxEditPlugin === undefined || $scope.oryxEditPlugin === null) {
          $scope.oryxEditPlugin = new ORYX.Plugins.Edit(editorManager.getEditor())
        }
        return $scope.oryxEditPlugin
      },
      // 缩放
      zoomIn: function (services) {
        FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxViewPlugin(services).zoom([1.0 + ORYX.CONFIG.ZOOM_OFFSET])
      },
      zoomOut: function (services) {
        FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxViewPlugin(services).zoom([1.0 - ORYX.CONFIG.ZOOM_OFFSET])
      },
      zoomActual: function (services) {
        FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxViewPlugin(services).setAFixZoomLevel(1)
      },
      zoomFit: function (services) {
        FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxViewPlugin(services).zoomFitToModel()
      },
      // 对齐
      alignVertical: function (services) {
        FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_CENTER])
      },
      alignHorizontal: function (services) {
        FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_MIDDLE])
      },

      sameSize: function (services) {
        FLOW_OPTIONS.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_SIZE])
      },
      help: function (services) {
        FLOW_OPTIONS.gettingStarted(services.$scope)
      },
      /**
       * Helper method: fetches the Oryx View plugin from the provided scope,
       * if not on the scope, it is created and put on the scope for further use.
       */
      _getOryxViewPlugin: function (services) {
        const $scope = services.$scope
        const editorManager = services.editorManager
        if ($scope.oryxViewPlugin === undefined || $scope.oryxViewPlugin === null) {
          $scope.oryxViewPlugin = new ORYX.Plugins.View(editorManager.getEditor())
        }
        return $scope.oryxViewPlugin
      },
      _getOryxArrangmentPlugin: function (services) {
        const $scope = services.$scope
        const editorManager = services.editorManager
        if ($scope.oryxArrangmentPlugin === undefined || $scope.oryxArrangmentPlugin === null) {
          $scope.oryxArrangmentPlugin = new ORYX.Plugins.Arrangement(editorManager.getEditor())
        }
        return $scope.oryxArrangmentPlugin
      },
      _getOryxDockerPlugin: function (services) {
        const $scope = services.$scope
        const editorManager = services.editorManager
        if ($scope.oryxDockerPlugin === undefined || $scope.oryxDockerPlugin === null) {
          $scope.oryxDockerPlugin = new ORYX.Plugins.AddDocker(editorManager.getEditor())
        }
        return $scope.oryxDockerPlugin
      }
    }
  },
  events: {
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
      this.editor.handleEvents(event, uiObject)
    }
  },
  initAddListener: function (editorManager) {
    this.events.addListener(FLOWABLE.eventBus.EVENT_TYPE_EDITOR_READY, () => {
      var url = window.location.href
      var regex = new RegExp('[?&]subProcessId(=([^&#]*)|&|#|$)')
      var results = regex.exec(url)
      if (results && results[2]) {
        editorManager.edit(decodeURIComponent(results[2].replace(/\+/g, ' ')))
      }
    })
    // 隐藏画布节点的快捷按钮
    this.events.addListener(FLOWABLE.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS, function (event) {
      jQuery('.Oryx_button').each(function (i, obj) {
        obj.style.display = 'none'
      })
    })
    this.events.addListener(FLOWABLE.eventBus.EVENT_TYPE_UNDO_REDO_RESET, function () {
      if (this.items) {
        for (let i = 0; i < this.items.length; i++) {
          let item = this.items[i]
          if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.undo' || item.action === 'FLOWABLE.TOOLBAR.ACTIONS.redo') {
            item.enabled = false
          }
        }
      }

    }, this)
    this.events.addListener(FLOWABLE.eventBus.EVENT_TYPE_SHOW_VALIDATION_POPUP, function (event) {
      // Method to open validation dialog
      var showValidationDialog = function () {
        this.currentValidationId = event.validationId
        this.isOnProcessLevel = event.onProcessLevel

        _internalCreateModal({ template: 'editor-app/popups/validation-errors.html?version=' + Date.now() }, $modal, this)
      }

      showValidationDialog()
    })
    this.events.addListener(FLOWABLE.eventBus.EVENT_TYPE_NAVIGATE_TO_PROCESS, function (event) {
      var modelMetaData = editorManager.getBaseModelData()
      this.editorHistory.push({
        id: modelMetaData.modelId,
        name: modelMetaData.name,
        type: 'bpmnmodel'
      })

      $window.location.href = '../editor/#/editor/' + event.processId
    })
  }
}


export default FLOW_OPTIONS

