import ORYX from '../oryx'
import { t } from 'src/locale'

// 帮助提示
const EDITOR_TOUR = {
  /*
   * General 'getting started' tutorial for the Editor.
   */
  gettingStarted: function ($scope, useLocalStorage) {
    const _this = this
    let userName
    if (!$scope.account) {
      userName = '开发者'
    } else if ($scope.account.firstName) {
      userName = $scope.account.firstName
    } else {
      userName = $scope.account.fullname
    }

    const translations = [
      t('TOUR.WELCOME-TITLE', { userName: userName }),
      t('TOUR.WELCOME-CONTENT'),
      t('TOUR.PALETTE-TITLE'),
      t('TOUR.PALETTE-CONTENT'),
      t('TOUR.CANVAS-TITLE'),
      t('TOUR.CANVAS-CONTENT'),
      t('TOUR.DRAGDROP-TITLE'),
      t('TOUR.DRAGDROP-CONTENT'),
      t('TOUR.PROPERTIES-TITLE'),
      t('TOUR.PROPERTIES-CONTENT'),
      t('TOUR.TOOLBAR-TITLE'),
      t('TOUR.TOOLBAR-CONTENT'),
      t('TOUR.END-TITLE'),
      t('TOUR.END-CONTENT')
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
          template: _this._buildStepTemplate(false, true, false, 300),
          onNext: _this._buildOnNextFunction(tourStepDomElements[0])
        },
        {
          element: tourStepDomElements[1],
          title: translations[2],
          content: translations[3],
          template: _this._buildStepTemplate(false, true, false, 400, 'flowable/images/tour/open-group.gif'),
          onNext: _this._buildOnNextFunction(tourStepDomElements[1])
        },
        {
          element: tourStepDomElements[2],
          title: translations[4],
          content: translations[5],
          placement: 'left',
          template: _this._buildStepTemplate(false, true, false),
          onNext: _this._buildOnNextFunction(tourStepDomElements[2])
        },
        {
          orphan: true,
          title: translations[6],
          content: translations[7],
          template: _this._buildStepTemplate(false, true, false, 720, 'flowable/images/tour/tour-dnd.gif'),
          onNext: _this._buildOnNextFunction(tourStepDomElements[0])
        },
        {
          element: tourStepDomElements[3],
          title: translations[8],
          content: translations[9],
          placement: 'top',
          template: _this._buildStepTemplate(false, true, false, 400),
          onNext: _this._buildOnNextFunction(tourStepDomElements[3])
        },
        {
          element: tourStepDomElements[4],
          title: translations[10],
          content: translations[11],
          placement: 'bottom',
          template: _this._buildStepTemplate(false, true, false, 400),
          onNext: _this._buildOnNextFunction(tourStepDomElements[4])
        },
        {
          orphan: true,
          title: translations[12],
          content: translations[13],
          template: _this._buildStepTemplate(false, false, true, 400),
          onNext: _this._buildOnNextFunction(tourStepDomElements[0])
        }
      ],
      onEnd: _this._buildOnEndFunction(tourStepDomElements)
    })
    tour.init()
    tour.start()
  },

  /*
   * Tutorial showing how to use the bendpoint functionality for sequenceflow
   */
  sequenceFlowBendpoint: function ($scope, useLocalStorage) {
    const _this = this
    const translations = [
      t('FEATURE-TOUR.BENDPOINT.TITLE'), t('FEATURE-TOUR.BENDPOINT.DESCRIPTION')
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
          template: _this._buildStepTemplate(false, false, true, 500, 'flowable/images/tour/sequenceflow-bendpoint.gif'),
          onNext: _this._buildOnNextFunction(tourStepDomElements[0])
        }
      ],
      onEnd: _this._buildOnEndFunction(tourStepDomElements)
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

const ACTIONS = {
  closeEditor: function (services) {
    if (services.editorManager && services.editorManager.getStencilData()) {
      const stencilNameSpace = services.editorManager.getStencilData().namespace
      if (stencilNameSpace !== undefined &&
        stencilNameSpace !== null &&
        stencilNameSpace.indexOf('cmmn1.1') !== -1) {
        services.$location.path('/casemodels')
        return
      }
    }
    services.$location.path('/processes')
  },
  // navigateToProcess: function (processId) {
  //   const navigateEvent = {
  //     type: FLOWABLE.eventBus.EVENT_TYPE_NAVIGATE_TO_PROCESS,
  //     processId: processId
  //   }
  //   this.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_NAVIGATE_TO_PROCESS, navigateEvent)
  // },
  validate: function (services) {
    // _internalCreateModal({
    //   backdrop: true,
    //   keyboard: true,
    //   template: 'editor-app/popups/validate-model.html?version=' + Date.now(),
    //   scope: services.$scope
    // }, services.$modal, services.$scope)
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
    this._getOryxEditPlugin(services).editCut()
    for (let i = 0; i < services.$scope.items.length; i++) {
      let item = services.$scope.items[i]
      if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.paste') {
        item.enabled = true
      }
    }
  },
  copy: function (services) {
    this._getOryxEditPlugin(services).editCopy()
    for (let i = 0; i < services.$scope.items.length; i++) {
      let item = services.$scope.items[i]
      if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.paste') {
        item.enabled = true
      }
    }
  },
  paste: function (services) {
    this._getOryxEditPlugin(services).editPaste()
  },
  deleteItem: function (services) {
    this._getOryxEditPlugin(services).editDelete()
  },
  addBendPoint: function (services) {
    // Show the tutorial the first time
    EDITOR_TOUR.sequenceFlowBendpoint(services.$scope, true)

    const dockerPlugin = this._getOryxDockerPlugin(services)
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
    EDITOR_TOUR.sequenceFlowBendpoint(services.$scope, true)
    const dockerPlugin = this._getOryxDockerPlugin(services)
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
    this._getOryxViewPlugin(services).zoom([1.0 + ORYX.CONFIG.CustomConfigs.ZOOM_OFFSET])
  },
  zoomOut: function (services) {
    this._getOryxViewPlugin(services).zoom([1.0 - ORYX.CONFIG.CustomConfigs.ZOOM_OFFSET])
  },
  zoomActual: function (services) {
    this._getOryxViewPlugin(services).setAFixZoomLevel(1)
  },
  zoomFit: function (services) {
    this._getOryxViewPlugin(services).zoomFitToModel()
  },
  // 对齐
  alignVertical: function (services) {
    this._getOryxArrangmentPlugin(services).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_CENTER])
  },
  alignHorizontal: function (services) {
    this._getOryxArrangmentPlugin(services).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_MIDDLE])
  },

  sameSize: function (services) {
    this._getOryxArrangmentPlugin(services).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_SIZE])
  },
  help: function (services) {
    EDITOR_TOUR.gettingStarted(services.$scope)
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

export default ACTIONS
