const DEFAULT_CONFIG = {
  UI_CONFIG: {
    showRemovedProperties: false,
    CUSTOM_CONTEXTMENU: false, // 是否自定义上下文
    Oryx_button_left_bottom: true,  // 节点选中时左下角悬浮快捷键是否展示
    Oryx_button_right_top: true,  // 节点选中时右上角悬浮快捷键是否展示
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 1050,
    CANVAS_RESIZE_INTERVAL: 100,
    CANVAS_MIN_WIDTH: 800,
    CANVAS_MIN_HEIGHT: 300,
    CANVAS_BACKGROUND_COLOR: 'none',
    SelectedRect_Border_color: '#E70012', // 选中标记虚线框的border颜色
    SELECTED_AREA_PADDING: 5,  // 选中标记虚线框的 padding 像素
    LABEL_DEFAULT_LINE_WIDTH: 70, // 默认label 文本宽度
    GRID_DISTANCE: 30,
    GRID_ENABLED: true,
    ZOOM_OFFSET: 0.1,
    DEFAULT_SHAPE_MARGIN: 60,
    SCALERS_SIZE: 7,
    MINIMUM_SIZE: 20,
    MAXIMUM_SIZE: 10000,
    OFFSET_MAGNET: 15,
    OFFSET_EDGE_LABEL_TOP: 8,
    OFFSET_EDGE_LABEL_BOTTOM: 8,
    OFFSET_EDGE_BOUNDS: 5,
    COPY_MOVE_OFFSET: 30,

    BORDER_OFFSET: 14,

    MAX_NUM_SHAPES_NO_GROUP: 20, // Updated so the form editor shows all elements at once

    SHAPEMENU_CREATE_OFFSET_CORNER: 30,
    SHAPEMENU_CREATE_OFFSET: 45,

    NODE_ICON_TYPE: 'images', // images, iconfont
    HOR_POOL_TITLE_HEIGHT: 40,
    HOR_LANE_TITLE_WIDTH: 110,
    HOR_LANE_INIT_HEIGHT: 250,
    HOR_LANE_MINSIZE: 65,
    VER_LANE_MINSIZE: 110,

    canNodesResize: true, // 节点是否可缩放
    PX_OFFSET: 5 // 水平像素容差

  },
  HEADER_CONFIG: {
    'showAppTitle': true,
    'showHeaderMenu': true,
    'showMainNavigation': true,
    'showPageHeader': true
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
        'actionType': 'internal',
        'action': 'FLOWABLE.TOOLBAR.ACTIONS.zoomActual'
      },
      {
        'type': 'button',
        'title': 'TOOLBAR.ACTION.ZOOMFIT',
        'cssClass': 'editor-icon editor-icon-zoom-fit',
        'actionType': 'internal',
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

export default DEFAULT_CONFIG

