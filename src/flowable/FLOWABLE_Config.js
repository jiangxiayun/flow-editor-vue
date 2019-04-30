/** Inspired by https://github.com/krasimir/EventBus/blob/master/src/EventBus.js */

const FLOWABLE_CONFIG = {
  UI_CONFIG: {
    'showRemovedProperties': false,
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


export default FLOWABLE_CONFIG
