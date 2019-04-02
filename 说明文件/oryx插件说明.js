


// vue 执行命令
const commandClass = ORYX.Core.Command.extend({
  construct: function () {
    this.key = key
    this.oldValue = oldValue
    this.newValue = newValue
    this.shape = shape
    this.facade = _this.editorManager.getEditor()
  },
  execute: function () {
    this.shape.setProperty(this.key, this.newValue) // 更新元素属性
    this.facade.getCanvas().update() // 更新画布元素, ORYX.Core.Node
    this.facade.updateSelection()
  },
  rollback: function () {
    this.shape.setProperty(this.key, this.oldValue)
    this.facade.getCanvas().update()
    this.facade.updateSelection()
  }
})

var command = new commandClass()
// Execute the command
this.editorManager.executeCommands([command])




// 触发 FLOWABLE.eventBus 事件
FLOWABLE.eventBus.dispatch(event.type, event)


// oryx.core 里触发事件
this._delegateEvent({
  type: ORYX.CONFIG.EVENT_PROPERTY_CHANGED,
  elements: [this],
  name: key,
  value: value,
  oldValue: oldValue
});


// oryx.Editor 里触发事件
this.handleEvents({
  type: ORYX.CONFIG.EVENT_SELECTION_CHANGED,
  elements: elements,
  subSelection: subSelectionElement,
  force: !!force
})

// oryx.Plugins 里监听事件
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPERTY_CHANGED, this.propertyChanged.bind(this));



ORYX.Core.StencilSet.stencil(stencilType)

// 更新属性到 Shape 视图上
// ORYX.Core.Shape  refresh



/*
属性配置结构化后:
 _complexItems: (...)
 _hidden: (...)
 _items: (...)
 _jsonProp: (...)
 _namespace: (...)
 _stencil: (...)
*/


shape.getStencil().id()