const ngDragDropService = {
  draggableScope: null,
  droppableScope: null,
  extract: function (scope, callbackName) {
    var atStartBracket = callbackName.indexOf('(') !== -1 ? callbackName.indexOf('(') : callbackName.length,
      atEndBracket = callbackName.lastIndexOf(')') !== -1 ? callbackName.lastIndexOf(')') : callbackName.length,
      // matching function arguments inside brackets
      args = callbackName.substring(atStartBracket + 1, atEndBracket),
      // matching a string upto a dot to check ctrl as syntax
      constructor = callbackName.match(/^[^.]+.\s*/)[0].slice(0, -1)

    constructor = scope.context[constructor] && typeof scope.context[constructor].constructor === 'function' ? constructor : null

    let a = args && args.split(',') || []
    a.map(function (item) {
      console.log('item', item)
    })
    return {
      callback: callbackName.substring(constructor && constructor.length + 1 || 0, atStartBracket),
      args: (args && args.split(',') || []).map(function (item) { return [$parse(item)(scope)] }),
      // args: $.map(args && args.split(',') || [], function(item) { return [$parse(item)(scope)]; }),
      constructor: constructor
    }
  },
  callEventCallback: function (scope, callbackName, event, ui) {
    if (!callbackName) return

    const objExtract = this.extract(scope, callbackName)
    const callback = objExtract.callback
    const constructor = objExtract.constructor
    const args = [event, ui].concat(objExtract.args)

    // call either $scoped method i.e. $scope.dropCallback or constructor's method i.e. this.dropCallback.
    // Removing scope.$apply call that was performance intensive (especially onDrag) and does not require it
    // always. So call it within the callback if needed.
    return (scope.context[callback] || scope.context[constructor][callback]).apply(scope, args)
  }
}


export function draggable (el, binding, vnode) {
  let dragSettings = {
    onStart: binding.value.onStart,
    onDrag: binding.value.onDrag,
    onStop: binding.value.onStop
  }
  let jqyouiOptions, zIndex

  if (el.dataset.drag) {
    jqyouiOptions = {
      revert: binding.value.revert,
      helper: binding.value.helper,
      opacity: binding.value.opacity
    }

    let element = jQuery(el)
    element
      .draggable({ disabled: false })
      .draggable(jqyouiOptions)
      .draggable({
        start: function (event, ui) {
          ngDragDropService.draggableScope = vnode
          zIndex = element.css('z-index')
          let q = jqyouiOptions.helper ? ui.helper : element
          q.css('z-index', 9999)
          // let startXY = element[dragSettings.containment || 'offset']()
          // console.log(11, startXY)
          // vnode.context[dragSettings.onStart](event, ui)
          ngDragDropService.callEventCallback(vnode, dragSettings.onStart, event, ui)
        },
        stop: function (event, ui) {
          let q = jqyouiOptions.helper ? ui.helper : element
          q.css('z-index', zIndex)
          // vnode.context[dragSettings.onStop](event, ui)
          ngDragDropService.callEventCallback(vnode, dragSettings.onStop, event, ui)
        },
        drag: function (event, ui) {
          // vnode.context[dragSettings.onDrag](event, ui)
          ngDragDropService.callEventCallback(vnode, dragSettings.onDrag, event, ui)
        }
      })
  } else {
    el.draggable({ disabled: true })
  }
}

export function droppable (el, binding, vnode) {
  let dropSettings
  if (el.dataset.drop) {
    dropSettings = {
      onDrop: binding.value.onDrop,
      onOver: binding.value.onOver,
      onOut: binding.value.onOut
    }

    let element = jQuery(el)
    // console.log('element', element)
    // console.log('droppable', element.droppable)
    element
      .droppable({ disabled: false })
      .droppable({
        over: function (event, ui) {
          // 当可接受的元素拖拽到可放置的区域
          ngDragDropService.callEventCallback(vnode, dropSettings.onOver, event, ui)
        },
        out: function (event, ui) {
          // 当可接受的元素移出可放置的区域
          ngDragDropService.callEventCallback(vnode, dropSettings.onOut, event, ui)
        },
        drop: function (event, ui) {
          if (dropSettings.beforeDrop) {
            ngDragDropService.callEventCallback(vnode, dropSettings.beforeDrop, event, ui)
          } else {
            // let uiDraggable = jQuery(ui.draggable)
            // console.log(333, ngattr(ui.draggable, 'model'))
            // if (ngattr(ui.draggable, 'model')) {
            //   ngDragDropService.droppableScope = vnode;
            //   ngDragDropService.invokeDrop(jQuery(ui.draggable), element, event, ui);
            // } else {
            //   ngDragDropService.callEventCallback(vnode, dropSettings.onDrop, event, ui);
            // }
            ngDragDropService.callEventCallback(vnode, dropSettings.onDrop, event, ui)
          }
        }
      })
  } else {
    el.droppable({ disabled: true })
  }
}
