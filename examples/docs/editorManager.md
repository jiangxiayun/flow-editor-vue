流程图编辑器 构造器

使用方法：
this.editorManager =  new EditorManager(configs)

<!-- {.md} -->

---

<!-- {.md} -->

## API:
<!-- {.md} -->
- __getSelectedItem__
- __getSelectedShape__
- __getContainmentRules__
- __getToolbarItems__
- __setToolbarItems__
- __getSecondaryItems__
- __getModelId__
- __setModelId__
- __getModel__
- __setModelData__
- __getBaseModelData__
- __getCurrentModelId__
- __getStencilData__
- __setStencilData__
- __getShowStencilData__
- __setShowStencilData__
- __getSelection__
- __setSelection__
- __updateSelection__
- __getSubSelection__
- __bootEditor__
- __renderProcessHierarchy__
- __filterEvent__
- __getStencilItemById__
- __findStencilItemInGroup__
- __initRegisterOnEvent__
- __handleEvents__: 触发指定类型事件，在oryx中捕获和执行
- __registerOnEvent__：

  注册监听事件，this.registerOnEvent（type, function(event)），捕获oryx里- __handleEvents 触发的事件类型

- __getChildShapeByResourceId__
- __getJSON__
- __getStencilSets__
- __getCanvas__
- __getRules__
- __getEditor__
- __getTree__
- __executeCommands__
- __eventCoordinates__
- __eventCoordinatesXY__
- __edit__
- ___buildTreeChildren__
- __syncCanvasTracker__
- __findAndRegisterCanvas__
- ___mergeCanvasToChild__
- __dispatchOryxEvent__
- __isLoading__
- __navigateTo__
- ___findTarget__
- __dispatchFlowEvent__
- __addListenerFlowEvent__
- __flowToolbarEvent__
- __updateOryxButtonPosition__: 调整节点选中状态悬浮按钮的位置


<!-- {.md} -->

---

<!-- {.md} -->
处理的事件：
```js
ORYX.CONFIG.EVENT_SELECTION_CHANGED
```
