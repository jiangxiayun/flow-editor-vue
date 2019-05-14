## 属性：
<!-- {.md} -->
DOMEventListeners

selection

zoomLevel

_eventsQueue

loadedPlugins

pluginsData

fullscreen

Cookie


----
<!-- {.md} -->



## 方法：
<!-- {.md} -->

* constructor
```js
// Initialize the eventlistener
this._initEventListener()
// CREATES the canvas
this._createCanvas(model.stencil ? model.stencil.id : null, model.properties)
// 生成整个 EXT.VIEWPORT
this._generateGUI()

// LOAD the plugins
window.setTimeout(function () {
  this.loadPlugins()
  loadPluginFinished = true
  initFinished()
}.bind(this), 100)

// LOAD the content of the current editor instance
window.setTimeout(function () {
  this.loadSerialized(model, true) // Request the meta data as well
  this.getCanvas().update()
  loadContentFinished = true
  initFinished()
  this.handleEvents({ type: ORYX_Config.EVENT_EDITOR_INIT_COMPLETED })
}.bind(this), 200)
```
<!-- {.md} -->

* _finishedLoading
* _initEventListener
* addEventListener
```js
keydown、keyup
```

* handleEvents 触发事件
```js
this.handleEvents({
  type: ORYX_Config.EVENT_SELECTION_CHANGED,
  elements: elements,
  subSelection: subSelectionElement,
  force: !!force
})
```


* _executeEventImmediately
* _executeEvents
* registerOnEvent   监听事件
* unregisterOnEvent
* registerPluginsOnKeyEvents：注册键盘组合按键事件
* offer： 添加 pluginsData
```js
// 参数
{
  name: this.I18N.Edit.cut,
  description: this.I18N.Edit.cutDesc,
  icon: ORYX_Config.PATH + 'images/cut.png',
  keyCodes: [{
    metaKeys: [ORYX_Config.META_KEY_META_CTRL],
    keyCode: 65,
    keyAction: ORYX_Config.KEY_ACTION_DOWN
  }],
  functionality: this.selectAll.bind(this),
  group: this.I18N.Edit.group,
  index: 1,
  minShape: 1,
  toggle
  buttonInstance
}
```

* disableEvent
* enableEvent
* isValidEvent
* _handleMouseDown
* _handleMouseMove
* _handleMouseUp
* _handleMouseHover
* _handleMouseOut
* catchKeyUpEvents
* catchKeyDownEvents
* createKeyCombEvent

* _generateGUI
* _createCanvas
* getCanvas
* createShape
* deleteShape

* setSelection
* updateSelection
* getSelection

* loadPlugins：加载插件
* getAvailablePlugins
* activatePluginByName
* _getPluginFacade

* loadSerialized
* loadStencilSet
* getStencilSets
* getSerializedJSON
* getRules


* loadScript
* isExecutingCommands
* executeCommands
* renewResourceIds
* loadSSExtensions
* loadSSExtension
* getExtensionForMetaData
* getModelMetaData
* isEqual
* isDirty
* eventCoordinates
* eventCoordinatesXY
* createByUrl
* resizeFix
* getJSON
* importJSON


<!-- {.md} -->






