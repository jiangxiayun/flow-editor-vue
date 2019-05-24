import ORYX from '../oryx'
// import { t } from 'src/locale'

const ACTIONS = {
  // closeEditor: function (services) {
  //   if (services.editorManager && services.editorManager.getStencilData()) {
  //     const stencilNameSpace = services.editorManager.getStencilData().namespace
  //     if (stencilNameSpace !== undefined &&
  //       stencilNameSpace !== null &&
  //       stencilNameSpace.indexOf('cmmn1.1') !== -1) {
  //       services.$location.path('/casemodels')
  //       return
  //     }
  //   }
  //   services.$location.path('/processes')
  // },
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
    this._getOryxViewPlugin(services).zoom([1.0 + ORYX.CONFIG.CustomConfigs.UI_CONFIG.ZOOM_OFFSET])
  },
  zoomOut: function (services) {
    this._getOryxViewPlugin(services).zoom([1.0 - ORYX.CONFIG.CustomConfigs.UI_CONFIG.ZOOM_OFFSET])
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
  },
  fullScreen: function () {
    // var e, t = document.querySelector('html')
    // e = t
    const e = document.getElementById('editor-main-wrapper')
    // 当前全屏显示的DOM元素。
    if (document.fullscreenElement || document.mozFullScreenElement ||
      document.webkitFullscreenElement || document.msFullscreenElement) {
      // 退出全屏
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
    } else {
      // 进入全屏
      if (e.requestFullscreen) {
        e.requestFullscreen()
      } else if (e.msRequestFullscreen) {
        e.msRequestFullscreen()
      } else if (e.mozRequestFullScreen) {
        e.mozRequestFullScreen()
      } else if (document.documentElement.webkitRequestFullscreen) {
        // 参数 Element.ALLOW_KEYBOARD_INPUT 使全屏状态中可以键盘输入。
        e.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
      }
    }
  }
}

export default ACTIONS
