import ORYX from '@/assets/oryx'



/** Inspired by https://github.com/krasimir/EventBus/blob/master/src/EventBus.js */

export const FLOWABLE = {
  UI_CONFIG: {
    'showRemovedProperties': false
  },
  HEADER_CONFIG: {
    'showAppTitle': true,
    'showHeaderMenu': true,
    'showMainNavigation': true,
    'showPageHeader': true
  },
  eventBus: {
    /** Event fired when the editor is loaded and ready */
    EVENT_TYPE_EDITOR_READY: 'event-type-editor-ready',
    EVENT_TYPE_EDITOR_BOOTED: 'event-type-editor-booted',
    /** Event fired when a selection is made on the canvas. */
    EVENT_TYPE_SELECTION_CHANGE: 'event-type-selection-change',
    /** Event fired when a toolbar button has been clicked. */
    EVENT_TYPE_TOOLBAR_BUTTON_CLICKEDEVENT_TYPE_TOOLBAR_BUTTON_CLICKED: 'event-type-toolbar-button-clicked',
    /** Event fired when a stencil item is dropped on the canvas. */
    EVENT_TYPE_ITEM_DROPPED: 'event-type-item-dropped',
    /** Event fired when a property value is changed. */
    EVENT_TYPE_PROPERTY_VALUE_CHANGED: 'event-type-property-value-changed',
    EVENT_TYPE_SELECTION_CHANGED: 'event-type-selection-changed',
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
    /** Event fired when the validation popup should be shown. */
    EVENT_TYPE_SHOW_VALIDATION_POPUP: 'event-type-show-validation-popup',
    /** Event fired when a different process must be loaded. */
    EVENT_TYPE_NAVIGATE_TO_PROCESS: 'event-type-navigate-to-process',
    EVENT_TYPE_UNDO_REDO_RESET: 'event-type-undo-redo-reset'
  },
  PROPERTY_CONFIG: {
    'string': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'string-property-write-mode-template'
    },
    'boolean': {
      'templateUrl': 'boolean-property-template'
    },
    'text': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'text-property-write-template'
    },
    'flowable-calledelementtype': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'calledelementtype-property-write-template'
    },
    'flowable-multiinstance': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'multiinstance-property-write-template'
    },
    'flowable-processhistorylevel': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'process-historylevel-property-write-template'
    },
    'flowable-ordering': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'ordering-property-write-template'
    },
    'oryx-dataproperties-complex': {
      'readModeTemplateUrl': 'data-properties-display-template',
      'writeModeTemplateUrl': 'data-properties-write-template'
    },
    'oryx-formproperties-complex': {
      'readModeTemplateUrl': 'form-properties-display-template',
      'writeModeTemplateUrl': 'form-properties-write-template'
    },
    'oryx-executionlisteners-multiplecomplex': {
      'readModeTemplateUrl': 'execution-listeners-display-template',
      'writeModeTemplateUrl': 'execution-listeners-write-template'
    },
    'oryx-tasklisteners-multiplecomplex': {
      'readModeTemplateUrl': 'task-listeners-display-template',
      'writeModeTemplateUrl': 'task-listeners-write-template'
    },
    'oryx-eventlisteners-multiplecomplex': {
      'readModeTemplateUrl': 'event-listeners-display-template',
      'writeModeTemplateUrl': 'event-listeners-write-template'
    },
    'oryx-usertaskassignment-complex': {
      'readModeTemplateUrl': 'assignment-display-template',
      'writeModeTemplateUrl': 'assignment-write-template'
    },
    'oryx-servicetaskfields-complex': {
      'readModeTemplateUrl': 'fields-display-template',
      'writeModeTemplateUrl': 'fields-write-template'
    },
    'oryx-callactivityinparameters-complex': {
      'readModeTemplateUrl': 'in-parameters-display-template',
      'writeModeTemplateUrl': 'in-parameters-write-template'
    },
    'oryx-callactivityoutparameters-complex': {
      'readModeTemplateUrl': 'out-parameters-display-template',
      'writeModeTemplateUrl': 'out-parameters-write-template'
    },
    // oryx子进程引用子进程链接
    'oryx-subprocessreference-subprocess-link': {
      'readModeTemplateUrl': 'subprocess-reference-display-template',
      'writeModeTemplateUrl': 'subprocess-reference-write-template'
    },
    'oryx-formreference-complex': {
      'readModeTemplateUrl': 'form-reference-display-template',
      'writeModeTemplateUrl': 'form-reference-write-template'
    },
    'oryx-sequencefloworder-complex': {
      'readModeTemplateUrl': 'sequenceflow-order-display-template',
      'writeModeTemplateUrl': 'sequenceflow-order-write-template'
    },
    'oryx-conditionsequenceflow-complex': {
      'readModeTemplateUrl': 'condition-expression-display-template',
      'writeModeTemplateUrl': 'condition-expression-write-template'
    },
    'oryx-signaldefinitions-multiplecomplex': {
      'readModeTemplateUrl': 'signal-definitions-display-template',
      'writeModeTemplateUrl': 'signal-definitions-write-template'
    },
    'oryx-signalref-string': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'signal-property-write-template'
    },
    'oryx-messagedefinitions-multiplecomplex': {
      'readModeTemplateUrl': 'message-definitions-display-template',
      'writeModeTemplateUrl': 'message-definitions-write-template'
    },
    'oryx-messageref-string': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'message-property-write-template'
    },
    'oryx-duedatedefinition-complex': {
      'readModeTemplateUrl': 'duedate-display-template',
      'writeModeTemplateUrl': 'duedate-write-template'
    },
    'oryx-decisiontaskdecisiontablereference-complex': {
      'readModeTemplateUrl': 'decisiontable-reference-display-template',
      'writeModeTemplateUrl': 'decisiontable-reference-write-template'
    },
    'oryx-casetaskcasereference-complex': {
      'readModeTemplateUrl': 'case-reference-display-template',
      'writeModeTemplateUrl': 'case-reference-write-template'
    },
    'oryx-processtaskprocessreference-complex': {
      'readModeTemplateUrl': 'process-reference-display-template',
      'writeModeTemplateUrl': 'process-reference-write-template'
    },
    'oryx-processtaskinparameters-complex': {
      'readModeTemplateUrl': 'in-parameters-display-template',
      'writeModeTemplateUrl': 'in-parameters-write-template'
    },
    'oryx-processtaskoutparameters-complex': {
      'readModeTemplateUrl': 'out-parameters-display-template',
      'writeModeTemplateUrl': 'out-parameters-write-template'
    },
    'flowable-transitionevent': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'transition-event-write-template'
    },
    'flowable-planitem-dropdown': {
      'readModeTemplateUrl': 'planitem-dropdown-read-template',
      'writeModeTemplateUrl': 'planitem-dropdown-write-template'
    },
    'flowable-http-request-method': {
      'readModeTemplateUrl': 'http-request-method-display-template',
      'writeModeTemplateUrl': 'http-request-method-property-write-template'
    },
    'oryx-output-complex': {
      'readModeTemplateUrl': 'form-reference-display-template',
      'writeModeTemplateUrl': 'form-reference-write-template'
    },
    'oryx-input-complex': {
      'readModeTemplateUrl': 'form-reference-display-template',
      'writeModeTemplateUrl': 'form-reference-write-template'
    },
    'oryx-important_level-select': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'multiinstance-property-write-template'
    },
    'oryx-propertiesfortask-select': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'lane-property-write-template'
    },
    'oryx-department-complex': {
      'readModeTemplateUrl': 'form-reference-display-template',
      'writeModeTemplateUrl': 'form-reference-write-template'
    },
    'oryx-activerole-complex': {
      'readModeTemplateUrl': 'form-reference-display-template',
      'writeModeTemplateUrl': 'form-reference-write-template'
    },
    'oryx-activesystem-select': {
      'readModeTemplateUrl': 'default-value-display-template',
      'writeModeTemplateUrl': 'system-write-template'
    }
  },
  TOOLBAR_CONFIG: {
    'items': [
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.SAVE',
        'cssClass': 'editor-icon editor-icon-save',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.saveModel'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.VALIDATE',
        'cssClass': 'glyphicon glyphicon-ok',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.validate'
      },
      {
        'type': 'separator',
        'title': '',
        'cssClass': 'toolbar-separator'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.CUT',
        'cssClass': 'editor-icon editor-icon-cut',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.cut',
        'enabled': false,
        'enabledAction': 'element'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.COPY',
        'cssClass': 'editor-icon editor-icon-copy',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.copy',
        'enabled': false,
        'enabledAction': 'element'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.PASTE',
        'cssClass': 'editor-icon editor-icon-paste',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.paste',
        'enabled': false
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.DELETE',
        'cssClass': 'editor-icon editor-icon-delete',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.deleteItem',
        'enabled': false,
        'enabledAction': 'element'
      },
      {
        'type': 'separator',
        'title': 'TOOLBAR.ACTION.SAVE',
        'cssClass': 'toolbar-separator'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.REDO',
        'cssClass': 'editor-icon editor-icon-redo',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.redo',
        'enabled': false
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.UNDO',
        'cssClass': 'editor-icon editor-icon-undo',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.undo',
        'enabled': false
      },
      {
        'type': 'separator',
        'title': 'TOOLBAR.ACTION.SAVE',
        'cssClass': 'toolbar-separator'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ALIGNVERTICAL',
        'cssClass': 'editor-icon editor-icon-align-vertical',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.alignVertical',
        'enabled': false,
        'enabledAction': 'element',
        'disableInForm': true,
        'minSelectionCount': 2
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ALIGNHORIZONTAL',
        'cssClass': 'editor-icon editor-icon-align-horizontal',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.alignHorizontal',
        'enabledAction': 'element',
        'enabled': false,
        'disableInForm': true,
        'minSelectionCount': 2
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.SAMESIZE',
        'cssClass': 'editor-icon editor-icon-same-size',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.sameSize',
        'enabledAction': 'element',
        'enabled': false,
        'disableInForm': true,
        'minSelectionCount': 2
      },
      {
        'type': 'separator',
        'title': 'TOOLBAR.ACTION.SAVE',
        'cssClass': 'toolbar-separator',
        'disableInForm': true
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ZOOMIN',
        'cssClass': 'editor-icon editor-icon-zoom-in',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.zoomIn'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ZOOMOUT',
        'cssClass': 'editor-icon editor-icon-zoom-out',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.zoomOut'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ZOOMACTUAL',
        'cssClass': 'editor-icon editor-icon-zoom-actual',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.zoomActual'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ZOOMFIT',
        'cssClass': 'editor-icon editor-icon-zoom-fit',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.zoomFit'
      },
      {
        'type': 'separator',
        'title': 'TOOLBAR.ACTION.SAVE',
        'cssClass': 'toolbar-separator',
        'disableInForm': true
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.BENDPOINT.ADD',
        'cssClass': 'editor-icon editor-icon-bendpoint-add',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.addBendPoint',
        'id': 'add-bendpoint-button',
        'disableInForm': true
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.BENDPOINT.REMOVE',
        'cssClass': 'editor-icon editor-icon-bendpoint-remove',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.removeBendPoint',
        'id': 'remove-bendpoint-button',
        'disableInForm': true
      },
      {
        'type': 'separator',
        'title': '',
        'cssClass': 'toolbar-separator',
        'disableInForm': true
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.HELP',
        'cssClass': 'glyphicon glyphicon-question-sign',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.help'
      }
    ],
    'secondaryItems': [
      {
        'type': 'button',
        'title': 'Close',
        'cssClass': 'glyphicon glyphicon-remove',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.closeEditor'
      }
    ]
  }
}
