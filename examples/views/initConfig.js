const FLOWABLE = {
  TOOLBAR_CONFIG: {
    items: [
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.SAVE',
        cssClass: 'editor-icon editor-icon-save',
        actionType: 'custom-defined',
        action: 'btn-save-click'
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.VALIDATE',
        cssClass: 'glyphicon glyphicon-ok',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.validate'
      },
      {
        type: 'separator',
        title: '',
        cssClass: 'toolbar-separator'
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.CUT',
        cssClass: 'editor-icon editor-icon-cut',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.cut',
        enabled: false,
        enabledAction: 'element'
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.COPY',
        cssClass: 'editor-icon editor-icon-copy',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.copy',
        enabled: false,
        enabledAction: 'element'
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.PASTE',
        cssClass: 'editor-icon editor-icon-paste',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.paste',
        enabled: false
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.DELETE',
        cssClass: 'editor-icon editor-icon-delete',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.deleteItem',
        enabled: false,
        enabledAction: 'element'
      },
      {
        type: 'separator',
        title: 'TOOLBAR.ACTION.SAVE',
        cssClass: 'toolbar-separator'
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.REDO',
        cssClass: 'editor-icon editor-icon-redo',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.redo',
        enabled: false
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.UNDO',
        cssClass: 'editor-icon editor-icon-undo',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.undo',
        enabled: false
      },
      {
        type: 'separator',
        title: 'TOOLBAR.ACTION.SAVE',
        cssClass: 'toolbar-separator'
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.ALIGNVERTICAL',
        cssClass: 'editor-icon editor-icon-align-vertical',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.alignVertical',
        enabled: false,
        enabledAction: 'element',
        minSelectionCount: 2
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.ALIGNHORIZONTAL',
        cssClass: 'editor-icon editor-icon-align-horizontal',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.alignHorizontal',
        enabledAction: 'element',
        enabled: false,
        minSelectionCount: 2
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.SAMESIZE',
        cssClass: 'editor-icon editor-icon-same-size',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.sameSize',
        enabledAction: 'element',
        enabled: false,
        minSelectionCount: 2
      },
      {
        type: 'separator',
        cssClass: 'toolbar-separator',
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.ZOOMIN',
        cssClass: 'editor-icon editor-icon-zoom-in',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.zoomIn'
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.ZOOMOUT',
        cssClass: 'editor-icon editor-icon-zoom-out',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.zoomOut'
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.ZOOMACTUAL',
        cssClass: 'editor-icon editor-icon-zoom-actual',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.zoomActual'
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.ZOOMFIT',
        cssClass: 'editor-icon editor-icon-zoom-fit',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.zoomFit'
      },
      {
        type: 'separator',
        cssClass: 'toolbar-separator',
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.BENDPOINT.ADD',
        cssClass: 'editor-icon editor-icon-bendpoint-add',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.addBendPoint',
        id: 'add-bendpoint-button',
      },
      {
        type: 'button',
        title: 'TOOLBAR.ACTION.BENDPOINT.REMOVE',
        cssClass: 'editor-icon editor-icon-bendpoint-remove',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.removeBendPoint',
        id: 'remove-bendpoint-button',
      }
    ],
    secondaryItems: [
      // {
      //   type: 'button',
      //   title: 'Close',
      //   cssClass: 'glyphicon glyphicon-remove',
      //   actionType: 'internal',
      //   action: 'FLOWABLE.TOOLBAR.ACTIONS.closeEditor'
      // },
      {
        type: 'button',
        title: '全屏',
        cssClass: 'glyphicon glyphicon-remove',
        actionType: 'internal',
        action: 'FLOWABLE.TOOLBAR.ACTIONS.fullScreen'
      }
    ]
  },
  UI_CONFIG: {
    CUSTOM_CONTEXTMENU: true,
    /* UI */
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 1050,
    CANVAS_RESIZE_INTERVAL: 100,
    CANVAS_BACKGROUND_COLOR: 'none',
    GRID_DISTANCE: 30,
    GRID_ENABLED: true,
    ZOOM_OFFSET: 0.1,
    DEFAULT_SHAPE_MARGIN: 60,
    SCALERS_SIZE: 7,
    MINIMUM_SIZE: 20,
    MAXIMUM_SIZE: 10000,
  }
}

export default FLOWABLE
