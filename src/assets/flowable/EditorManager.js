import { FLOWABLE, FLOWABLE_eventBus_initAddListener } from './FLOWABLE_eventBus'


/**流程图编辑器 类
 * @params modelData: 流程图实例数据
 * @params stencilData: 流程元素/组件
 **/
export default class EditorManager {
  constructor (config) {
    this.treeFilteredElements = ['SubProcess', 'CollapsedSubProcess']
    this.canvasTracker = new Hash()
    this.structualIcons = {
      'SubProcess': 'expanded.subprocess.png',
      'CollapsedSubProcess': 'subprocess.png',
      'EventSubProcess': 'event.subprocess.png'
    }
    this.current = this.modelId // 当前流程id
    this.loading = true


    // 设置 this.modelData
    this.setModelData(config.modelData)
    // 设置 this.stencilData
    this.setStencilData(config.stencilData)

    this.setToolbarItems()

    const baseUrl = 'http://b3mn.org/stencilset/'
    const stencilSet = new ORYX.Core.StencilSet.StencilSet(baseUrl, config.stencilData)
    ORYX.Core.StencilSet.loadStencilSet(baseUrl, stencilSet, '6609363a-3be5-11e9-afe0-82ad27eff10d')
    jQuery.ajax({
      type: 'GET',
      url: 'flowable/editor-app/plugins.xml',
      success: function (data, textStatus, jqXHR) {
        ORYX._loadPlugins(data)
      }
    })

    this.bootEditor()
  }

  getToolbarItems () { return this.toolbarItems }
  setToolbarItems () {
    let items = []
    const toolbarItems = FLOWABLE.TOOLBAR_CONFIG.items;
    for (let i = 0; i < toolbarItems.length; i++) {
      if (this.modelData.model.modelType === 'form') {
        if (!toolbarItems[i].disableInForm) {
          items.push(toolbarItems[i])
        }
      } else {
        items.push(toolbarItems[i])
      }
    }
    this.toolbarItems = items
  }

  getSecondaryItems () { return FLOWABLE.TOOLBAR_CONFIG.secondaryItems }

  getModelId () { return this.modelId }

  setModelId (modelId) { this.modelId = modelId }

  getModel () {
    this.syncCanvasTracker()

    var modelMetaData = this.getBaseModelData()

    var stencilId = undefined
    var stencilSetNamespace = undefined
    var stencilSetUrl = undefined
    if (modelMetaData.model.stencilset.namespace == 'http://b3mn.org/stencilset/cmmn1.1#') {
      stencilId = 'CMMNDiagram'
      stencilSetNamespace = 'http://b3mn.org/stencilset/cmmn1.1#'
      stencilSetUrl = '../editor/stencilsets/cmmn1.1/cmmn1.1.json'
    } else {
      stencilId = 'BPMNDiagram'
      stencilSetNamespace = 'http://b3mn.org/stencilset/bpmn2.0#'
      stencilSetUrl = '../editor/stencilsets/bpmn2.0/bpmn2.0.json'
    }

    //this is an object.
    var editorConfig = this.editor.getJSON()
    var model = {
      modelId: this.modelId,
      bounds: editorConfig.bounds,
      properties: editorConfig.properties,
      childShapes: JSON.parse(this.canvasTracker.get(this.modelId)),
      stencil: {
        id: stencilId
      },
      stencilset: {
        namespace: stencilSetNamespace,
        url: stencilSetUrl
      }
    }

    this._mergeCanvasToChild(model)

    return model
  }

  setModelData (response) {
    this.modelData = response
    // _this.UPDATE_modelData(response)
  }

  getBaseModelData () { return this.modelData }

  getCurrentModelId () { return this.current }

  getStencilData () { return this.stencilData }

  setStencilData (stencilData) {
    //we don't want a references!
    this.stencilData = jQuery.extend(true, {}, stencilData)
  }

  getSelection () { return this.editor.selection }

  setSelection (selection) { this.editor.setSelection(selection) }

  updateSelection () { this.editor.updateSelection() }

  getSubSelection () {
    return this.editor._subSelection
  }

  bootEditor () {
    //TODO: populate the canvas with correct json sections.
    //resetting the state
    this.canvasTracker = new Hash()

    //avoid a reference to the original object.
    // 第一个参数boolean代表是否进行深度拷贝
    var config = jQuery.extend(true, {}, this.modelData)

    if (!config.model.childShapes) {
      config.model.childShapes = []
    }

    //this will remove any childshapes of a collapseable subprocess.
    this.findAndRegisterCanvas(config.model.childShapes)

    //this will be overwritten almost instantly.
    this.canvasTracker.set(config.modelId, JSON.stringify(config.model.childShapes))

    this.editor = new ORYX.Editor(config)
    this.current = this.editor.id
    this.loading = false


    FLOWABLE.eventBus.editor = this.editor
    FLOWABLE.eventBus.dispatch('ORYX-EDITOR-LOADED', {})
    FLOWABLE.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_EDITOR_BOOTED, {})

    const eventMappings = [
      // 元素选择
      { oryxType: ORYX.CONFIG.EVENT_SELECTION_CHANGED, flowableType: FLOWABLE.eventBus.EVENT_TYPE_SELECTION_CHANGE },
      // 双击
      { oryxType: ORYX.CONFIG.EVENT_DBLCLICK, flowableType: FLOWABLE.eventBus.EVENT_TYPE_DOUBLE_CLICK },
      // 鼠标状态
      { oryxType: ORYX.CONFIG.EVENT_MOUSEOUT, flowableType: FLOWABLE.eventBus.EVENT_TYPE_MOUSE_OUT },
      { oryxType: ORYX.CONFIG.EVENT_MOUSEOVER, flowableType: FLOWABLE.eventBus.EVENT_TYPE_MOUSE_OVER },
      { oryxType: ORYX.CONFIG.EVENT_EDITOR_INIT_COMPLETED, flowableType: FLOWABLE.eventBus.EVENT_TYPE_EDITOR_READY },
      // 属性变化
      {
        oryxType: ORYX.CONFIG.EVENT_PROPERTY_CHANGED,
        flowableType: FLOWABLE.eventBus.EVENT_TYPE_PROPERTY_VALUE_CHANGED
      }
    ]

    eventMappings.forEach((eventMapping) => {
      this.registerOnEvent(eventMapping.oryxType, function (event) {
        FLOWABLE.eventBus.dispatch(eventMapping.flowableType, event)
      })
    })
  }

  initRegisterOnEvent () {
    /*
     * Listen to selection change events: show properties
     */
    this.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, (event) => {
      let shapes = event.elements
      let canvasSelected = false
      if (shapes && shapes.length === 0) {
        shapes = [this.getCanvas()]
        canvasSelected = true
      }
      if (shapes && shapes.length > 0) {
        const selectedShape = shapes.first()
        const stencil = selectedShape.getStencil()

        if (this.selectedElementBeforeScrolling &&
          stencil.id().indexOf('BPMNDiagram') !== -1 &&
          stencil.id().indexOf('CMMNDiagram') !== -1) {
          // ignore canvas event because of empty selection when scrolling stops
          return
        }

        if (this.selectedElementBeforeScrolling &&
          this.selectedElementBeforeScrolling.getId() === selectedShape.getId()) {
          this.selectedElementBeforeScrolling = null
          return
        }

        // Store previous selection
        this.previousSelectedShape = this.selectedShape

        // Only do something if another element is selected (Oryx fires this event multiple times)
        if (this.selectedShape !== undefined && this.selectedShape.getId() === selectedShape.getId()) {
          if (this.forceSelectionRefresh) {
            // Switch the flag again, this run will force refresh
            this.forceSelectionRefresh = false
          } else {
            // Selected the same element again, no need to update anything
            return
          }
        }

        let selectedItem = { 'title': '', 'properties': [] }

        if (canvasSelected) {
          selectedItem.auditData = {
            'author': this.modelData.createdByUser,
            'createDate': this.modelData.createDate
          }
        }

        // Gather properties of selected item 获取选中元素的属性
        var properties = stencil.properties()
        for (let i = 0; i < properties.length; i++) {
          let property = properties[i]
          if (!property.popular()) continue
          let key = property.prefix() + '-' + property.id()

          if (key === 'oryx-name') {
            selectedItem.title = selectedShape.properties.get(key)
          }

          // First we check if there is a config for 'key-type' and then for 'type' alone
          let propertyConfig = FLOWABLE.PROPERTY_CONFIG[key + '-' + property.type()]
          if (propertyConfig === undefined || propertyConfig === null) {
            propertyConfig = FLOWABLE.PROPERTY_CONFIG[property.type()]
          }

          if (propertyConfig === undefined || propertyConfig === null) {
            console.log('WARNING: no property configuration defined for ' + key + ' of type ' + property.type())
          } else {
            if (selectedShape.properties.get(key) === 'true') {
              selectedShape.properties.set(key, true)
            }

            if (FLOWABLE.UI_CONFIG.showRemovedProperties === false && property.isHidden()) {
              continue
            }

            let currentProperty = {
              'key': key,
              'title': property.title(),
              'description': property.description(),
              'type': property.type(),
              'mode': 'read',
              'hidden': property.isHidden(),
              'value': selectedShape.properties.get(key)
            }

            if ((currentProperty.type === 'complex' || currentProperty.type === 'multiplecomplex') && currentProperty.value && currentProperty.value.length > 0) {
              try {
                currentProperty.value = JSON.parse(currentProperty.value)
              } catch (err) {
                // ignore
              }
            }

            if (propertyConfig.readModeTemplateUrl !== undefined && propertyConfig.readModeTemplateUrl !== null) {
              currentProperty.readModeTemplateUrl = propertyConfig.readModeTemplateUrl + '?version=' + this.staticIncludeVersion
            }
            if (propertyConfig.writeModeTemplateUrl !== null && propertyConfig.writeModeTemplateUrl !== null) {
              currentProperty.writeModeTemplateUrl = propertyConfig.writeModeTemplateUrl + '?version=' + this.staticIncludeVersion
            }

            if (propertyConfig.templateUrl !== undefined && propertyConfig.templateUrl !== null) {
              currentProperty.templateUrl = propertyConfig.templateUrl + '?version=' + this.staticIncludeVersion
              currentProperty.hasReadWriteMode = false
            } else {
              currentProperty.hasReadWriteMode = true
            }

            if (currentProperty.value === undefined
              || currentProperty.value === null
              || currentProperty.value.length == 0) {
              currentProperty.noValue = true
            }

            selectedItem.properties.push(currentProperty)
          }
        }

        this.selectedItem = selectedItem
        this.selectedShape = selectedShape
      } else {
        this.selectedItem = {}
        this.selectedShape = null
      }
    })

    this.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, (event) => {
      FLOWABLE.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS)

      var shapes = event.elements

      if (shapes && shapes.length == 1) {

        var selectedShape = shapes.first()

        var a = this.editorManager.getCanvas().node.getScreenCTM()

        var absoluteXY = selectedShape.absoluteXY()

        absoluteXY.x *= a.a
        absoluteXY.y *= a.d

        var additionalIEZoom = 1
        if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
          var ua = navigator.userAgent
          if (ua.indexOf('MSIE') >= 0) {
            //IE 10 and below
            var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100)
            if (zoom !== 100) {
              additionalIEZoom = zoom / 100
            }
          }
        }

        if (additionalIEZoom === 1) {
          absoluteXY.y = absoluteXY.y - jQuery('#canvasSection').offset().top + 5
          absoluteXY.x = absoluteXY.x - jQuery('#canvasSection').offset().left

        } else {
          var canvasOffsetLeft = jQuery('#canvasSection').offset().left
          var canvasScrollLeft = jQuery('#canvasSection').scrollLeft()
          var canvasScrollTop = jQuery('#canvasSection').scrollTop()

          var offset = a.e - (canvasOffsetLeft * additionalIEZoom)
          var additionaloffset = 0
          if (offset > 10) {
            additionaloffset = (offset / additionalIEZoom) - offset
          }
          absoluteXY.y = absoluteXY.y - (jQuery('#canvasSection').offset().top * additionalIEZoom) + 5 + ((canvasScrollTop * additionalIEZoom) - canvasScrollTop)
          absoluteXY.x = absoluteXY.x - (canvasOffsetLeft * additionalIEZoom) + additionaloffset + ((canvasScrollLeft * additionalIEZoom) - canvasScrollLeft)
        }

        var bounds = new ORYX.Core.Bounds(a.e + absoluteXY.x, a.f + absoluteXY.y, a.e + absoluteXY.x + a.a * selectedShape.bounds.width(), a.f + absoluteXY.y + a.d * selectedShape.bounds.height())
        var shapeXY = bounds.upperLeft()

        var stencilItem = this.getStencilItemById(selectedShape.getStencil().idWithoutNs())
        var morphShapes = []
        if (stencilItem && stencilItem.morphRole) {
          for (var i = 0; i < this.morphRoles.length; i++) {
            if (this.morphRoles[i].role === stencilItem.morphRole) {
              morphShapes = this.morphRoles[i].morphOptions
            }
          }
        }

        var x = shapeXY.x
        if (bounds.width() < 48) {
          x -= 24
        }

        if (morphShapes && morphShapes.length > 0) {
          // In case the element is not wide enough, start the 2 bottom-buttons more to the left
          // to prevent overflow in the right-menu

          var morphButton = document.getElementById('morph-button')
          morphButton.style.display = 'block'
          morphButton.style.left = x + 24 + 'px'
          morphButton.style.top = (shapeXY.y + bounds.height() + 2) + 'px'
        }

        var deleteButton = document.getElementById('delete-button')
        deleteButton.style.display = 'block'
        deleteButton.style.left = x + 'px'
        deleteButton.style.top = (shapeXY.y + bounds.height() + 2) + 'px'

        var editable = selectedShape._stencil._jsonStencil.id.endsWith('CollapsedSubProcess')
        var editButton = document.getElementById('edit-button')
        if (editable) {
          editButton.style.display = 'block'
          if (morphShapes && morphShapes.length > 0) {
            editButton.style.left = x + 24 + 24 + 'px'
          } else {
            editButton.style.left = x + 24 + 'px'
          }
          editButton.style.top = (shapeXY.y + bounds.height() + 2) + 'px'

        } else {
          editButton.style.display = 'none'
        }

        if (stencilItem && (stencilItem.canConnect || stencilItem.canConnectAssociation)) {
          var quickButtonCounter = 0
          var quickButtonX = shapeXY.x + bounds.width() + 5
          var quickButtonY = shapeXY.y
          jQuery('.Oryx_button').each(function (i, obj) {
            if (obj.id !== 'morph-button' && obj.id != 'delete-button' && obj.id !== 'edit-button') {
              quickButtonCounter++
              if (quickButtonCounter > 3) {
                quickButtonX = shapeXY.x + bounds.width() + 5
                quickButtonY += 24
                quickButtonCounter = 1

              } else if (quickButtonCounter > 1) {
                quickButtonX += 24
              }

              obj.style.display = 'block'
              obj.style.left = quickButtonX + 'px'
              obj.style.top = quickButtonY + 'px'
            }
          })
        }
      }
    })

    // 控制 toolbar buttons 是否可用
    this.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, (event) => {
      const elements = event.elements
      for (let i = 0; i < this.toolbarItems.length; i++) {
        let item = this.toolbarItems[i]
        if (item.enabledAction && item.enabledAction === 'element') {
          let minLength = 1
          if (item.minSelectionCount) {
            minLength = item.minSelectionCount
          }
          if (elements.length >= minLength && !item.enabled) {
            item.enabled = true
          } else if (elements.length == 0 && item.enabled) {
            item.enabled = false
          }
        }
      }
    })


    // 捕获所有执行的命令并将它们存储在各自的堆栈上
    this.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS, (evt) => {
      // If the event has commands
      if (!evt.commands) return

      this.undoStack.push(evt.commands)
      this.redoStack = []

      for (let i = 0; i < this.items.length; i++) {
        let item = this.items[i]
        if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.undo') {
          item.enabled = true
        } else if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.redo') {
          item.enabled = false
        }
      }

      // Update
      this.editorManager.getCanvas().update()
      this.editorManager.updateSelection()
    })

  }

  handleEvents (events) {
    this.editor.handleEvents(events)
  }

  registerOnEvent (event, callback) {
    this.editor.registerOnEvent(event, callback)
  }

  getChildShapeByResourceId (resourceId) {
    return this.editor.getCanvas().getChildShapeByResourceId(resourceId)
  }

  getJSON () { return this.editor.getJSON() }

  getStencilSets () { return this.editor.getStencilSets() }

  getCanvas () { return this.editor.getCanvas() }

  getRules () { return this.editor.getRules() }

  getEditor () {
    //TODO: find out if we can avoid exposing the editor object to angular.
    return this.editor
  }

  getTree () {
    //build a tree of all subprocesses and there children.
    var result = new Hash()
    var parent = this.getModel()
    result.set('name', parent.properties['name'] || 'No name provided')
    result.set('id', this.modelId)
    result.set('type', 'root')
    result.set('current', this.current === this.modelId)
    var childShapes = parent.childShapes
    var children = this._buildTreeChildren(childShapes)
    result.set('children', children)
    return result.toObject()
  }

  executeCommands (commands) {
    this.editor.executeCommands(commands)
  }

  eventCoordinates (coordinates) {
    return this.editor.eventCoordinates(coordinates)
  }

  eventCoordinatesXY (x, y) {
    return this.editor.eventCoordinatesXY(x, y)
  }


  edit (resourceId) {
    //Save the current canvas in the canvastracker if it is the root process.
    this.syncCanvasTracker()

    this.loading = true

    var shapes = this.getCanvas().getChildren()
    shapes.each(function (shape) {
      this.editor.deleteShape(shape)
    }.bind(this))

    shapes = this.canvasTracker.get(resourceId)
    if (!shapes) {
      shapes = JSON.stringify([])
    }

    this.editor.loadSerialized({
      childShapes: shapes
    })

    this.getCanvas().update()

    this.current = resourceId

    this.loading = false
    FLOWABLE.eventBus.dispatch('EDITORMANAGER-EDIT-ACTION', {})
    FLOWABLE.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_UNDO_REDO_RESET, {})
  }


  _buildTreeChildren (childShapes) {
    var children = []
    for (var i = 0; i < childShapes.length; i++) {
      var childShape = childShapes[i]
      var stencilId = childShape.stencil.id
      //we are currently only interested in the expanded subprocess and collapsed processes
      if (stencilId && this.treeFilteredElements.indexOf(stencilId) > -1) {
        var child = new Hash()
        child.set('name', childShape.properties.name || 'No name provided')
        child.set('id', childShape.resourceId)
        child.set('type', stencilId)
        child.set('current', childShape.resourceId === this.current)

        //check if childshapes

        if (stencilId === 'CollapsedSubProcess') {
          //the save function stores the real object as a childshape
          //it is possible that there is no child element because the user did not open the collapsed subprocess.
          if (childShape.childShapes.length === 0) {
            child.set('children', [])
          } else {
            child.set('children', this._buildTreeChildren(childShape.childShapes))
          }
          child.set('editable', true)
        } else {
          child.set('children', this._buildTreeChildren(childShape.childShapes))
          child.set('editable', false)
        }
        child.set('icon', this.structualIcons[stencilId])
        children.push(child.toObject())
      }
    }
    return children
  }

  syncCanvasTracker () {
    var shapes = this.getCanvas().getChildren()
    var jsonShapes = []
    shapes.each(function (shape) {
      //toJson is an summary object but its not a json string.!!!!!
      jsonShapes.push(shape.toJSON())
    })
    this.canvasTracker.set(this.current, JSON.stringify(jsonShapes))
  }

  findAndRegisterCanvas (childShapes) {
    for (let i = 0; i < childShapes.length; i++) {
      let childShape = childShapes[i]
      if (childShape.stencil.id === 'CollapsedSubProcess') {
        if (childShape.childShapes.length > 0) {
          //the canvastracker will auto correct itself with a new canvasmodel see this.edit()...
          this.findAndRegisterCanvas(childShape.childShapes)
          //a canvas can't be nested as a child because the editor would crash on redundant information.
          this.canvasTracker.set(childShape.resourceId, JSON.stringify(childShape.childShapes))
          //reference to config will clear the value.
          childShape.childShapes = []
        } else {
          this.canvasTracker.set(childShape.resourceId, '[]')
        }
      }
    }
  }

  _mergeCanvasToChild (parent) {
    for (var i = 0; i < parent.childShapes.length; i++) {
      var childShape = parent.childShapes[i]
      if (childShape.stencil.id === 'CollapsedSubProcess') {

        var elements = this.canvasTracker.get(childShape.resourceId)
        if (elements) {
          elements = JSON.parse(elements)
        } else {
          elements = []
        }
        childShape.childShapes = elements
        this._mergeCanvasToChild(childShape)
      } else if (childShape.stencil.id === 'SubProcess') {
        this._mergeCanvasToChild(childShape)
      } else {
        //do nothing?
      }
    }
  }

  dispatchOryxEvent (event) {
    FLOWABLE.eventBus.dispatchOryxEvent(event)
  }

  isLoading () {
    return this.loading
  }

  navigateTo (resourceId) {
    //TODO: this could be improved by check if the resourceId is not equal to the current tracker...
    this.syncCanvasTracker()
    var found = false
    this.canvasTracker.each(function (pair) {
      var key = pair.key
      var children = JSON.parse(pair.value)
      var targetable = this._findTarget(children, resourceId)
      if (!found && targetable) {
        this.edit(key)
        var flowableShape = this.getCanvas().getChildShapeByResourceId(targetable)
        this.setSelection([flowableShape], [], true)
        found = true
      }
    }, this)
  }

  _findTarget (children, resourceId) {
    for (var i = 0; i < children.length; i++) {
      var child = children[i]
      if (child.resourceId === resourceId) {
        return child.resourceId
      } else if (child.properties && child.properties['overrideid'] === resourceId) {
        return child.resourceId
      } else {
        var result = this._findTarget(child.childShapes, resourceId)
        if (result) {
          return result
        }
      }
    }
    return false
  }
}