
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


export const EVENTS_SELECT_OPTION = [
  { title: null, label: 'ACTIVITY_CANCELLED'},
  { title: 'EVENT_TYPE.ACTIVITY.COMPENSATE.TOOLTIP', label: 'ACTIVITY_COMPENSATE'},
  { title: 'EVENT_TYPE.ACTIVITY.COMPLETED.TOOLTIP', label: 'ACTIVITY_COMPLETED'},
  { title: 'bla', label: 'ACTIVITY_ERROR_RECEIVED'},
  { title: null, label: 'ACTIVITY_MESSAGE_CANCELLED'},
  { title: null, label: 'ACTIVITY_MESSAGE_RECEIVED'},
  { title: null, label: 'ACTIVITY_MESSAGE_WAITING'},
  { title: null, label: 'ACTIVITY_SIGNALED'},
  { title: null, label: 'ACTIVITY_SIGNAL_WAITING'},
  { title: null, label: 'ACTIVITY_STARTED'},
  { title: null, label: 'CUSTOM'},
  { title: null, label: 'ENGINE_CLOSED'},
  { title: null, label: 'ENGINE_CREATED'},
  { title: null, label: 'ENTITY_ACTIVATED'},
  { title: null, label: 'ENTITY_CREATED'},
  { title: null, label: 'ENTITY_DELETED'},
  { title: null, label: 'ENTITY_INITIALIZED'},
  { title: null, label: 'ENTITY_SUSPENDED'},
  { title: null, label: 'ENTITY_UPDATED'},
  { title: null, label: 'HISTORIC_ACTIVITY_INSTANCE_CREATED'},
  { title: null, label: 'HISTORIC_ACTIVITY_INSTANCE_ENDED'},
  { title: null, label: 'HISTORIC_PROCESS_INSTANCE_CREATED'},
  { title: null, label: 'HISTORIC_PROCESS_INSTANCE_ENDED'},
  { title: null, label: 'JOB_CANCELED'},
  { title: null, label: 'JOB_EXECUTION_FAILURE'},
  { title: null, label: 'JOB_EXECUTION_SUCCESS'},
  { title: null, label: 'JOB_RESCHEDULED'},
  { title: null, label: 'JOB_RETRIES_DECREMENTED'},
  { title: 'EVENT_TYPE.MEMBERSHIP.CREATED.TOOLTIP', label: 'MEMBERSHIP_CREATED'},
  { title: 'EVENT_TYPE.MEMBERSHIP.DELETED.TOOLTIP', label: 'MEMBERSHIP_DELETED'},
  { title: 'EVENT_TYPE.MEMBERSHIPS.DELETED.TOOLTIP', label: 'MEMBERSHIPS_DELETED'},
  { title: null, label: 'MULTI_INSTANCE_ACTIVITY_CANCELLED'},
  { title: null, label: 'MULTI_INSTANCE_ACTIVITY_COMPLETED'},
  { title: null, label: 'MULTI_INSTANCE_ACTIVITY_COMPLETED_WITH_CONDITION'},
  { title: null, label: 'MULTI_INSTANCE_ACTIVITY_STARTED'},
  { title: null, label: 'PROCESS_CANCELLED'},
  { title: null, label: 'PROCESS_COMPLETED'},
  { title: null, label: 'PROCESS_COMPLETED_WITH_TERMINATE_END_EVENT'},
  { title: null, label: 'PROCESS_COMPLETED_WITH_ERROR_END_EVENT'},
  { title: null, label: 'PROCESS_CREATED'},
  { title: null, label: 'PROCESS_STARTED'},
  { title: null, label: 'SEQUENCEFLOW_TAKEN'},
  { title: 'EVENT_TYPE.TASK.ASSIGNED.TOOLTIP', label: 'TASK_ASSIGNED'},
  { title: 'EVENT_TYPE.TASK.COMPLETED.TOOLTIP', label: 'TASK_COMPLETED'},
  { title: null, label: 'TASK_CREATED'},
  { title: null, label: 'TIMER_FIRED'},
  { title: null, label: 'TIMER_SCHEDULED'},
  { title: 'EVENT_TYPE.UNCAUGHT.BPMNERROR.TOOLTIP', label: 'UNCAUGHT_BPMN_ERROR'},
  { title: 'EVENT_TYPE.VARIABLE.CREATED.TOOLTIP', label: 'VARIABLE_CREATED'},
  { title: 'EVENT_TYPE.VARIABLE.DELETED.TOOLTIP', label: 'VARIABLE_DELETED'},
  { title: 'EVENT_TYPE.VARIABLE.UPDATED.TOOLTIP', label: 'VARIABLE_UPDATED'},
]