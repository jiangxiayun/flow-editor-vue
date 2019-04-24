import Vue from 'vue'

// 注册一个全局自定义指令 `v-focus`
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  }
})

const ngDragDropService = {
  draggableScope: null,
  droppableScope: null,
  callEventCallback: function (scope, callbackName, event, ui) {
    if (!callbackName) return;

    var objExtract = extract(callbackName),
      callback = objExtract.callback,
      constructor = objExtract.constructor,
      args = [event, ui].concat(objExtract.args);

    // call either $scoped method i.e. $scope.dropCallback or constructor's method i.e. this.dropCallback.
    // Removing scope.$apply call that was performance intensive (especially onDrag) and does not require it
    // always. So call it within the callback if needed.
    return (scope.context[callback] || scope.context[constructor][callback]).apply(scope, args);

    function extract(callbackName) {
      var atStartBracket = callbackName.indexOf('(') !== -1 ? callbackName.indexOf('(') : callbackName.length,
        atEndBracket = callbackName.lastIndexOf(')') !== -1 ? callbackName.lastIndexOf(')') : callbackName.length,
        // matching function arguments inside brackets
        args = callbackName.substring(atStartBracket + 1, atEndBracket),
        // matching a string upto a dot to check ctrl as syntax
        constructor = callbackName.match(/^[^.]+.\s*/)[0].slice(0, -1);

      constructor = scope.context[constructor] && typeof scope.context[constructor].constructor === 'function' ? constructor : null;

      let a = args && args.split(',') || []
      a.map(function(item) {
        console.log('item', item)
      })
      return {
        callback: callbackName.substring(constructor && constructor.length + 1 || 0, atStartBracket),
        args: (args && args.split(',') || []).map(function(item) { return [$parse(item)(scope)]; }),
        // args: $.map(args && args.split(',') || [], function(item) { return [$parse(item)(scope)]; }),
        constructor: constructor
      }
    }
  },
  invokeDrop: function ($draggable, $droppable, event, ui) {
    var dragModel = '',
      dropModel = '',
      dragSettings = {},
      dropSettings = {},
      jqyoui_pos = null,
      dragItem = {},
      dropItem = {},
      dragModelValue,
      dropModelValue,
      $droppableDraggable = null,
      droppableScope = this.droppableScope,
      draggableScope = this.draggableScope;

    // dragModel = $draggable.ngattr('ng-model');
    // dropModel = $droppable.ngattr('ng-model');
    dragModel = ngattr($draggable, 'ng-model');
    dropModel =  ngattr($droppable, 'ng-model');
    dragModelValue = draggableScope.$eval(dragModel);
    dropModelValue = droppableScope.$eval(dropModel);

    $droppableDraggable = $droppable.find('[jqyoui-draggable]:last,[data-jqyoui-draggable]:last');
    dropSettings = droppableScope.$eval($droppable.attr('jqyoui-droppable') || $droppable.attr('data-jqyoui-droppable')) || [];
    dragSettings = draggableScope.$eval($draggable.attr('jqyoui-draggable') || $draggable.attr('data-jqyoui-draggable')) || [];

    // Helps pick up the right item
    dragSettings.index = this.fixIndex(draggableScope, dragSettings, dragModelValue);
    dropSettings.index = this.fixIndex(droppableScope, dropSettings, dropModelValue);

    jqyoui_pos = angular.isArray(dragModelValue) ? dragSettings.index : null;
    dragItem = angular.isArray(dragModelValue) ? dragModelValue[jqyoui_pos] : dragModelValue;

    if (dragSettings.deepCopy) {
      dragItem = angular.copy(dragItem);
    }

    if (angular.isArray(dropModelValue) && dropSettings && dropSettings.index !== undefined) {
      dropItem = dropModelValue[dropSettings.index];
    } else if (!angular.isArray(dropModelValue)) {
      dropItem = dropModelValue;
    } else {
      dropItem = {};
    }

    if (dropSettings.deepCopy) {
      dropItem = angular.copy(dropItem);
    }

    if (dragSettings.animate === true) {
      this.move($draggable, $droppableDraggable.length > 0 ? $droppableDraggable : $droppable, null, 'fast', dropSettings, null);
      this.move($droppableDraggable.length > 0 && !dropSettings.multiple ? $droppableDraggable : [], $draggable.parent('[jqyoui-droppable],[data-jqyoui-droppable]'), jqyoui.startXY, 'fast', dropSettings, angular.bind(this, function() {
        $timeout(angular.bind(this, function() {
          // Do not move this into move() to avoid flickering issue
          $draggable.css({'position': 'relative', 'left': '', 'top': ''});
          // Angular v1.2 uses ng-hide to hide an element not display property
          // so we've to manually remove display:none set in this.move()
          $droppableDraggable.css({'position': 'relative', 'left': '', 'top': '', 'display': $droppableDraggable.css('display') === 'none' ? '' : $droppableDraggable.css('display')});

          this.mutateDraggable(draggableScope, dropSettings, dragSettings, dragModel, dropModel, dropItem, $draggable);
          this.mutateDroppable(droppableScope, dropSettings, dragSettings, dropModel, dragItem, jqyoui_pos);
          this.callEventCallback(droppableScope, dropSettings.onDrop, event, ui);
        }));
      }));
    } else {
      $timeout(angular.bind(this, function() {
        this.mutateDraggable(draggableScope, dropSettings, dragSettings, dragModel, dropModel, dropItem, $draggable);
        this.mutateDroppable(droppableScope, dropSettings, dragSettings, dropModel, dragItem, jqyoui_pos);
        this.callEventCallback(droppableScope, dropSettings.onDrop, event, ui);
      }));
    }
  },
  move: function($fromEl, $toEl, toPos, duration, dropSettings, callback) {
    if ($fromEl.length === 0) {
      if (callback) {
        window.setTimeout(function() {
          callback();
        }, 300);
      }
      return false;
    }

    var zIndex = $fromEl.css('z-index'),
      fromPos = $fromEl[dropSettings.containment || 'offset'](),
      displayProperty = $toEl.css('display'), // sometimes `display` is other than `block`
      hadNgHideCls = $toEl.hasClass('ng-hide');

    if (toPos === null && $toEl.length > 0) {
      if (($toEl.attr('jqyoui-draggable') || $toEl.attr('data-jqyoui-draggable')) !== undefined && $toEl.ngattr('ng-model') !== undefined && $toEl.is(':visible') && dropSettings && dropSettings.multiple) {
        toPos = $toEl[dropSettings.containment || 'offset']();
        if (dropSettings.stack === false) {
          toPos.left+= $toEl.outerWidth(true);
        } else {
          toPos.top+= $toEl.outerHeight(true);
        }
      } else {
        // Angular v1.2 uses ng-hide to hide an element
        // so we've to remove it in order to grab its position
        if (hadNgHideCls) $toEl.removeClass('ng-hide');
        toPos = $toEl.css({'visibility': 'hidden', 'display': 'block'})[dropSettings.containment || 'offset']();
        $toEl.css({'visibility': '','display': displayProperty});
      }
    }

    $fromEl.css({'position': 'absolute', 'z-index': 9999})
      .css(fromPos)
      .animate(toPos, duration, function() {
        // Angular v1.2 uses ng-hide to hide an element
        // and as we remove it above, we've to put it back to
        // hide the element (while swapping) if it was hidden already
        // because we remove the display:none in this.invokeDrop()
        if (hadNgHideCls) $toEl.addClass('ng-hide');
        $fromEl.css('z-index', zIndex);
        if (callback) callback();
      });
  },
  mutateDroppable: function(scope, dropSettings, dragSettings, dropModel, dragItem, jqyoui_pos) {
    var dropModelValue = scope.$eval(dropModel);

    scope.dndDragItem = dragItem;

    if (angular.isArray(dropModelValue)) {
      if (dropSettings && dropSettings.index >= 0) {
        dropModelValue[dropSettings.index] = dragItem;
      } else {
        dropModelValue.push(dragItem);
      }
      if (dragSettings && dragSettings.placeholder === true) {
        dropModelValue[dropModelValue.length - 1]['jqyoui_pos'] = jqyoui_pos;
      }
    } else {
      $parse(dropModel + ' = dndDragItem')(scope);
      if (dragSettings && dragSettings.placeholder === true) {
        dropModelValue['jqyoui_pos'] = jqyoui_pos;
      }
    }
  },
  mutateDraggable: function(scope, dropSettings, dragSettings, dragModel, dropModel, dropItem, $draggable) {
    var isEmpty = angular.equals(dropItem, {}) || !dropItem,
      dragModelValue = scope.$eval(dragModel);

    scope.dndDropItem = dropItem;

    if (dragSettings && dragSettings.placeholder) {
      if (dragSettings.placeholder != 'keep'){
        if (angular.isArray(dragModelValue) && dragSettings.index !== undefined) {
          dragModelValue[dragSettings.index] = dropItem;
        } else {
          $parse(dragModel + ' = dndDropItem')(scope);
        }
      }
    } else {
      if (angular.isArray(dragModelValue)) {
        if (isEmpty) {
          if (dragSettings && ( dragSettings.placeholder !== true && dragSettings.placeholder !== 'keep' )) {
            dragModelValue.splice(dragSettings.index, 1);
          }
        } else {
          dragModelValue[dragSettings.index] = dropItem;
        }
      } else {
        // Fix: LIST(object) to LIST(array) - model does not get updated using just scope[dragModel] = {...}
        // P.S.: Could not figure out why it happened
        $parse(dragModel + ' = dndDropItem')(scope);
        if (scope.$parent) {
          $parse(dragModel + ' = dndDropItem')(scope.$parent);
        }
      }
    }

    $draggable.css({'z-index': '', 'left': '', 'top': ''});
  },
  fixIndex: function(scope, settings, modelValue) {
    if (settings.applyFilter && angular.isArray(modelValue) && modelValue.length > 0) {
      var dragModelValueFiltered = scope[settings.applyFilter](),
        lookup = dragModelValueFiltered[settings.index],
        actualIndex = undefined;

      modelValue.forEach(function(item, i) {
        if (angular.equals(item, lookup)) {
          actualIndex = i;
        }
      });

      return actualIndex;
    }

    return settings.index;
  }
}

function ngattr (el, name, value) {
  var element = jQuery(el).get(0);
  return element.getAttribute(name) || element.getAttribute('data-' + name);
}

var dragSettings, jqyouiOptions, zIndex;

// 注册一个全局自定义指令 `v-draggable`
Vue.directive('draggable', function (el, binding, vnode) {
  if (el.dataset.drag) {
    jqyouiOptions ={
      revert: binding.value.revert,
      helper: binding.value.helper,
      opacity : binding.value.opacity
    }

    let element = jQuery(el)
      element
        .draggable({disabled: false})
        .draggable(jqyouiOptions)
        .draggable({
          start: function(event, ui) {
            dragSettings = {
              onStart: binding.value.onStart,
              onDrag: binding.value.onDrag
            }

            ngDragDropService.draggableScope = vnode;
            zIndex = element.css('z-index')
            let q = jqyouiOptions.helper ? ui.helper : element
            q.css('z-index', 9999);
            let startXY = element[dragSettings.containment || 'offset']();
            // console.log(11, startXY)
            // vnode.context[dragSettings.onStart](event, ui)
            ngDragDropService.callEventCallback(vnode, dragSettings.onStart, event, ui);
          },
          stop: function(event, ui) {
            let q = jqyouiOptions.helper ? ui.helper : element
            q.css('z-index', zIndex);
            // vnode.context[dragSettings.onStop](event, ui)
            ngDragDropService.callEventCallback(vnode, dragSettings.onStop, event, ui);
          },
          drag: function(event, ui) {
            // vnode.context[dragSettings.onDrag](event, ui)
            ngDragDropService.callEventCallback(vnode, dragSettings.onDrag, event, ui);
          }
        })
    } else {
      el.draggable({disabled: true})
    }
  }
)

Vue.directive('droppable', function (el, binding, vnode) {
    let dropSettings;
    if (el.dataset.drop) {
      dropSettings = {
        onDrop: binding.value.onDrop,
        onOver: binding.value.onOver,
        onOut: binding.value.onOut
      }

      let element = jQuery(el)
      element
        .droppable({disabled: false})
        .droppable({
          over: function(event, ui) {
            ngDragDropService.callEventCallback(vnode, dropSettings.onOver, event, ui);
          },
          out: function(event, ui) {
            ngDragDropService.callEventCallback(vnode, dropSettings.onOut, event, ui);
          },
          drop: function(event, ui) {
            if (dropSettings.beforeDrop) {
              ngDragDropService.callEventCallback(vnode, dropSettings.beforeDrop, event, ui);
            } else {
              // let uiDraggable = jQuery(ui.draggable)
              // console.log(333, ngattr(ui.draggable, 'model'))
              // if (ngattr(ui.draggable, 'model')) {
              //   ngDragDropService.droppableScope = vnode;
              //   ngDragDropService.invokeDrop(jQuery(ui.draggable), element, event, ui);
              // } else {
              //   ngDragDropService.callEventCallback(vnode, dropSettings.onDrop, event, ui);
              // }
              ngDragDropService.callEventCallback(vnode, dropSettings.onDrop, event, ui);
            }
          }
        })
    } else {
      el.droppable({disabled: true})
    }
  }
)