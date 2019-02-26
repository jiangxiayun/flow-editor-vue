'use strict';

// app-cfg
export const ACTIVITI = {
  CONFIG:{
    'contextRoot' : '/service',
  }
}


export const KISBPM = {
  // editor-config
  CONFIG:{
    'showRemovedProperties' : false
  },
  HEADER_CONFIG: {
    'showAppTitle' : true,
    'showHeaderMenu' : true,
    'showMainNavigation' : true,
    'showPageHeader' : true
  },
  // url-config
  URL: {
    getModel: function(modelId) {
      return ACTIVITI.CONFIG.contextRoot + '/model/' + modelId + '/json';
    },

    getStencilSet: function() {
      return ACTIVITI.CONFIG.contextRoot + '/editor/stencilset?version=' + Date.now();
    },

    putModel: function(modelId) {
      return ACTIVITI.CONFIG.contextRoot + '/model/' + modelId + '/save';
    }
  },
  // eventbus
  /** Inspired by https://github.com/krasimir/EventBus/blob/master/src/EventBus.js */
  eventBus: {
    /** Event fired when the editor is loaded and ready */
    EVENT_TYPE_EDITOR_READY: 'event-type-editor-ready',

    /** Event fired when a selection is made on the canvas. */
    EVENT_TYPE_SELECTION_CHANGE: 'event-type-selection-change',

    /** Event fired when a toolbar button has been clicked. */
    EVENT_TYPE_TOOLBAR_BUTTON_CLICKED: 'event-type-toolbar-button-clicked',

    /** Event fired when a stencil item is dropped on the canvas. */
    EVENT_TYPE_ITEM_DROPPED: 'event-type-item-dropped',

    /** Event fired when a property value is changed. */
    EVENT_TYPE_PROPERTY_VALUE_CHANGED: 'event-type-property-value-changed',

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
      if (typeof this.listeners[type] !== "undefined") {
        this.listeners[type].push({scope: scope, callback: callback});
      } else {
        this.listeners[type] = [
          {scope: scope, callback: callback}
        ];
      }
    },

    /**
     * Removes the provided event listener.
     */
    removeListener: function (type, callback, scope) {
      if (typeof this.listeners[type] != "undefined") {
        var numOfCallbacks = this.listeners[type].length;
        var newArray = [];
        for (var i = 0; i < numOfCallbacks; i++) {
          var listener = this.listeners[type][i];
          if (listener.scope === scope && listener.callback === callback) {
            // Do nothing, this is the listener and doesn't need to survive
          } else {
            newArray.push(listener);
          }
        }
        this.listeners[type] = newArray;
      }
    },

    hasListener:function(type, callback, scope) {
      if(typeof this.listeners[type] != "undefined") {
        var numOfCallbacks = this.listeners[type].length;
        if(callback === undefined && scope === undefined){
          return numOfCallbacks > 0;
        }
        for(var i=0; i<numOfCallbacks; i++) {
          var listener = this.listeners[type][i];
          if(listener.scope == scope && listener.callback == callback) {
            return true;
          }
        }
      }
      return false;
    },

    /**
     * Dispatch an event to all event listeners registered to that specific type.
     */
    dispatch:function(type, event) {
      if(typeof this.listeners[type] != "undefined") {
        var numOfCallbacks = this.listeners[type].length;
        for(var i=0; i<numOfCallbacks; i++) {
          var listener = this.listeners[type][i];
          if(listener && listener.callback) {
            listener.callback.apply(listener.scope, [event]);
          }
        }
      }
    },

    dispatchOryxEvent: function(event, uiObject) {
      KISBPM.eventBus.editor.handleEvents(event, uiObject);
    }
  },
  // toolbar
  TOOLBAR_CONFIG: {
    "items" : [
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.SAVE",
        "cssClass" : "editor-icon editor-icon-save",
        "action" : "KISBPM.TOOLBAR.ACTIONS.saveModel"
      },
      {
        "type" : "separator",
        "title" : "",
        "cssClass" : "toolbar-separator"
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.CUT",
        "cssClass" : "editor-icon editor-icon-cut",
        "action" : "KISBPM.TOOLBAR.ACTIONS.cut",
        "enabled" : false,
        "enabledAction" : "element"
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.COPY",
        "cssClass" : "editor-icon editor-icon-copy",
        "action" : "KISBPM.TOOLBAR.ACTIONS.copy",
        "enabled" : false,
        "enabledAction" : "element"
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.PASTE",
        "cssClass" : "editor-icon editor-icon-paste",
        "action" : "KISBPM.TOOLBAR.ACTIONS.paste",
        "enabled" : false
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.DELETE",
        "cssClass" : "editor-icon editor-icon-delete",
        "action" : "KISBPM.TOOLBAR.ACTIONS.deleteItem",
        "enabled" : false,
        "enabledAction" : "element"
      },
      {
        "type" : "separator",
        "title" : "TOOLBAR.ACTION.SAVE",
        "cssClass" : "toolbar-separator"
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.REDO",
        "cssClass" : "editor-icon editor-icon-redo",
        "action" : "KISBPM.TOOLBAR.ACTIONS.redo",
        "enabled" : false
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.UNDO",
        "cssClass" : "editor-icon editor-icon-undo",
        "action" : "KISBPM.TOOLBAR.ACTIONS.undo",
        "enabled" : false
      },
      {
        "type" : "separator",
        "title" : "TOOLBAR.ACTION.SAVE",
        "cssClass" : "toolbar-separator"
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.ALIGNVERTICAL",
        "cssClass" : "editor-icon editor-icon-align-vertical",
        "action" : "KISBPM.TOOLBAR.ACTIONS.alignVertical",
        "enabled" : false,
        "enabledAction" : "element",
        "minSelectionCount" : 2
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.ALIGNHORIZONTAL",
        "cssClass" : "editor-icon editor-icon-align-horizontal",
        "action" : "KISBPM.TOOLBAR.ACTIONS.alignHorizontal",
        "enabledAction" : "element",
        "enabled" : false,
        "minSelectionCount" : 2
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.SAMESIZE",
        "cssClass" : "editor-icon editor-icon-same-size",
        "action" : "KISBPM.TOOLBAR.ACTIONS.sameSize",
        "enabledAction" : "element",
        "enabled" : false,
        "minSelectionCount" : 2
      },

      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.ZOOMIN",
        "cssClass" : "editor-icon editor-icon-zoom-in",
        "action" : "KISBPM.TOOLBAR.ACTIONS.zoomIn"
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.ZOOMOUT",
        "cssClass" : "editor-icon editor-icon-zoom-out",
        "action" : "KISBPM.TOOLBAR.ACTIONS.zoomOut"
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.ZOOMACTUAL",
        "cssClass" : "editor-icon editor-icon-zoom-actual",
        "action" : "KISBPM.TOOLBAR.ACTIONS.zoomActual"
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.ZOOMFIT",
        "cssClass" : "editor-icon editor-icon-zoom-fit",
        "action" : "KISBPM.TOOLBAR.ACTIONS.zoomFit"
      },
      {
        "type" : "separator",
        "title" : "TOOLBAR.ACTION.SAVE",
        "cssClass" : "toolbar-separator"
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.BENDPOINT.ADD",
        "cssClass" : "editor-icon editor-icon-bendpoint-add",
        "action" : "KISBPM.TOOLBAR.ACTIONS.addBendPoint",
        "id" : "add-bendpoint-button"
      },
      {
        "type" : "button",
        "title" : "TOOLBAR.ACTION.BENDPOINT.REMOVE",
        "cssClass" : "editor-icon editor-icon-bendpoint-remove",
        "action" : "KISBPM.TOOLBAR.ACTIONS.removeBendPoint",
        "id" : "remove-bendpoint-button"
      }
    ],
    "secondaryItems" : [
      {
        "type" : "button",
        "title" : "Close",
        "cssClass" : "editor-icon editor-icon-close",
        "action" : "KISBPM.TOOLBAR.ACTIONS.closeEditor"
      }
    ]
}
}
