import DEFAULT_CONFIG from './CustomConfigs_default'

// oryx constants.
const ORYX_CONFIGURATION_DELAY = 100
const ORYX_CONFIGURATION_WAIT_ATTEMPTS = 10

// Triple constants
const TRIPLE_REMOVE = 0x01
const TRIPLE_ADD = 0x02
const TRIPLE_RELOAD = 0x04
const TRIPLE_SAVE = 0x08

// const ROOT_PATH = 'editor/'  //T ODO: Remove last slash!!
// const LIBS_PATH = 'libs'
// const SERVER_HANDLER_ROOT = 'service'

const ORYX_CONFIG = {
  // PATH: 'editor/',
  /**
   * This file contains URI constants that may be used for XMLHTTPRequests.
   * 此文件包含可用于xmlhttpRequests的uri常量
   */
  // ROOT_PATH: 'editor/', // TODO: Remove last slash!!
  // EXPLORER_PATH: 'explorer',

  DISABLE_GRADIENT: true,
  /**
   * Regular Config
   */
  // SERVER_HANDLER_ROOT: 'service',
  // SERVER_EDITOR_HANDLER: SERVER_HANDLER_ROOT + '/editor',
  // SERVER_MODEL_HANDLER: SERVER_HANDLER_ROOT + '/model',
  // STENCILSET_HANDLER: SERVER_HANDLER_ROOT + '/editor_stencilset?embedsvg=true&url=true&namespace=',
  // STENCIL_SETS_URL: SERVER_HANDLER_ROOT + '/editor_stencilset',
  //
  // PLUGINS_CONFIG: 'editor-app/plugins.xml',
  // SYNTAXCHECKER_URL: SERVER_HANDLER_ROOT + '/syntaxchecker',
  // DEPLOY_URL: SERVER_HANDLER_ROOT + '/model/deploy',
  // MODEL_LIST_URL: SERVER_HANDLER_ROOT + '/models',
  // FORM_FLOW_LIST_URL: SERVER_HANDLER_ROOT + '/formflows',
  // FORM_FLOW_IMAGE_URL: SERVER_HANDLER_ROOT + '/formflow',
  // FORM_LIST_URL: SERVER_HANDLER_ROOT + '/forms',
  // FORM_IMAGE_URL: SERVER_HANDLER_ROOT + '/form',
  // SUB_PROCESS_LIST_URL: SERVER_HANDLER_ROOT + '/subprocesses',
  // SUB_PROCESS_IMAGE_URL: SERVER_HANDLER_ROOT + '/subprocess',
  // TEST_SERVICE_URL: SERVER_HANDLER_ROOT + '/service/',
  //
  // SERVICE_LIST_URL: SERVER_HANDLER_ROOT + '/services',
  // CONDITION_ELEMENT_LIST_URL: SERVER_HANDLER_ROOT + '/conditionelements',
  // constIABLEDEF_ELEMENT_LIST_URL: SERVER_HANDLER_ROOT + '/constiabledefinitionelements',
  // VALIDATOR_LIST_URL: SERVER_HANDLER_ROOT + '/validators',
  //
  // SS_EXTENSIONS_FOLDER: ROOT_PATH + 'stencilsets/extensions/',
  // SS_EXTENSIONS_CONFIG: SERVER_HANDLER_ROOT + '/editor_ssextensions',
  // ORYX_NEW_URL: '/new',
  // BPMN_LAYOUTER: ROOT_PATH + 'bpmnlayouter',
  //
  // EXPRESSION_METADATA_URL: SERVER_HANDLER_ROOT + '/expression-metadata',
  // DATASOURCE_METADATA_URL: SERVER_HANDLER_ROOT + '/datasource-metadata',

  /**
   * Signavio specific constiables
   */
  BACKEND_SWITCH: true,
  PANEL_LEFT_WIDTH: 250,
  PANEL_RIGHT_COLLAPSED: true,
  PANEL_RIGHT_WIDTH: 300,
  APPNAME: 'Flowable',
  WEB_URL: '.',

  // BLANK_IMAGE: LIBS_PATH + '/ext-2.0.2/resources/images/default/s.gif',

  /* Specify offset of header */
  OFFSET_HEADER: 61,

  /* 拖动时显示对齐辅助线 */
  SHOW_GRIDLINE: true,

  /* Editor-Mode */
  MODE_READONLY: 'readonly',
  MODE_FULLSCREEN: 'fullscreen',
  WINDOW_HEIGHT: 800,
  PREVENT_LOADINGMASK_AT_READY: false,

  /* Plugins */
  PLUGINS_ENABLED: true,
  PLUGINS_FOLDER: 'Plugins/',

  BPMN20_SCHEMA_VALIDATION_ON: true,

  /* Namespaces */
  NAMESPACE_ORYX: 'http://www.b3mn.org/oryx',
  NAMESPACE_SVG: 'http://www.w3.org/2000/svg',


  /* Shape-Menu Align */
  SHAPEMENU_RIGHT: 'Oryx_Right',
  SHAPEMENU_BOTTOM: 'Oryx_Bottom',
  SHAPEMENU_LEFT: 'Oryx_Left',
  SHAPEMENU_TOP: 'Oryx_Top',


  /* Morph-Menu Item */
  MORPHITEM_DISABLED: 'Oryx_MorphItem_disabled',

  /* Property type names */
  TYPE_STRING: 'string',
  TYPE_BOOLEAN: 'boolean',
  TYPE_INTEGER: 'integer',
  TYPE_FLOAT: 'float',
  TYPE_COLOR: 'color',
  TYPE_DATE: 'date',
  TYPE_CHOICE: 'choice',
  TYPE_URL: 'url',
  TYPE_DIAGRAM_LINK: 'diagramlink',
  TYPE_COMPLEX: 'complex',
  TYPE_MULTIPLECOMPLEX: 'multiplecomplex',
  TYPE_TEXT: 'text',
  TYPE_FLOWABLE_MULTIINSTANCE: 'flowable-multiinstance',
  TYPE_MODEL_LINK: 'modellink',
  TYPE_FORM_FLOW_LINK: 'formflowlink',
  TYPE_FORM_LINK: 'formlink',
  TYPE_SUB_PROCESS_LINK: 'subprocess-link',
  TYPE_SERVICE_LINK: 'servicelink',
  TYPE_CONDITIONS: 'conditions',
  TYPE_constIABLES: 'constiables',
  TYPE_LISTENER: 'listener',
  TYPE_EPC_FREQ: 'epcfrequency',
  TYPE_GLOSSARY_LINK: 'glossarylink',
  TYPE_EXPRESSION: 'expression',
  TYPE_DATASOURCE: 'datasource',
  TYPE_DATASOURCE_MINIMAL: 'datasource-minimal',
  TYPE_VALIDATORS: 'validators',
  TYPE_FLOWABLE_HTTP_REQUEST_METHOD: 'flowable-http-request-method',


  /* Vertical line distance of multiline labels */
  LABEL_LINE_DISTANCE: 2,
  LABEL_DEFAULT_LINE_HEIGHT: 12,

  /* Open Morph Menu with Hover */
  ENABLE_MORPHMENU_BY_HOVER: false,

  /* Editor constants come here */
  EDITOR_ALIGN_BOTTOM: 0x01,
  EDITOR_ALIGN_MIDDLE: 0x02,
  EDITOR_ALIGN_TOP: 0x04,
  EDITOR_ALIGN_LEFT: 0x08,
  EDITOR_ALIGN_CENTER: 0x10,
  EDITOR_ALIGN_RIGHT: 0x20,
  EDITOR_ALIGN_SIZE: 0x30,

  /* Event types */
  EVENT_MOUSEDOWN: 'mousedown',
  EVENT_MOUSEUP: 'mouseup',
  EVENT_MOUSEOVER: 'mouseover',
  EVENT_MOUSEOUT: 'mouseout',
  EVENT_MOUSEMOVE: 'mousemove',
  EVENT_CLICK: 'click',
  EVENT_DBLCLICK: 'dblclick',
  EVENT_KEYDOWN: 'keydown',
  EVENT_KEYUP: 'keyup',

  EVENT_LOADED: 'editorloaded',
  EVENT_SAVED: 'editorSaved',

  EVENT_EXECUTE_COMMANDS: 'executeCommands',
  EVENT_STENCIL_SET_LOADED: 'stencilSetLoaded',
  EVENT_SELECTION_CHANGED: 'selectionchanged',
  EVENT_SHAPEADDED: 'shapeadded',
  EVENT_SHAPEREMOVED: 'shaperemoved',
  EVENT_PROPERTY_CHANGED: 'propertyChanged',
  EVENT_PROPERTY_CHANGED_BYOUTSIDE: 'EVENT_PROPERTY_CHANGED_BYOUTSIDE', // 在双击输入框中修改了属性
  EVENT_DRAGDROP_START: 'dragdrop.start',
  EVENT_SHAPE_MENU_CLOSE: 'shape.menu.close',
  EVENT_DRAGDROP_END: 'dragdrop.end',
  EVENT_RESIZE_START: 'resize.start',
  EVENT_RESIZE_END: 'resize.end',
  EVENT_DRAGDOCKER_DOCKED: 'dragDocker.docked',
  EVENT_HIGHLIGHT_SHOW: 'highlight.showHighlight',
  EVENT_HIGHLIGHT_HIDE: 'highlight.hideHighlight',
  EVENT_LOADING_ENABLE: 'loading.enable',
  EVENT_LOADING_DISABLE: 'loading.disable',
  EVENT_LOADING_STATUS: 'loading.status',
  EVENT_OVERLAY_SHOW: 'overlay.show',
  EVENT_OVERLAY_HIDE: 'overlay.hide',
  EVENT_ARRANGEMENT_TOP: 'arrangement.setToTop',
  EVENT_ARRANGEMENT_BACK: 'arrangement.setToBack',
  EVENT_ARRANGEMENT_FORWARD: 'arrangement.setForward',
  EVENT_ARRANGEMENT_BACKWARD: 'arrangement.setBackward',
  EVENT_PROPWINDOW_PROP_CHANGED: 'propertyWindow.propertyChanged',
  EVENT_LAYOUT_ROWS: 'layout.rows',
  EVENT_LAYOUT_BPEL: 'layout.BPEL',
  EVENT_LAYOUT_BPEL_VERTICAL: 'layout.BPEL.vertical',
  EVENT_LAYOUT_BPEL_HORIZONTAL: 'layout.BPEL.horizontal',
  EVENT_LAYOUT_BPEL_SINGLECHILD: 'layout.BPEL.singlechild',
  EVENT_LAYOUT_BPEL_AUTORESIZE: 'layout.BPEL.autoresize',
  EVENT_AUTOLAYOUT_LAYOUT: 'autolayout.layout',
  EVENT_UNDO_EXECUTE: 'undo.execute',
  EVENT_UNDO_ROLLBACK: 'undo.rollback',
  EVENT_UNDO_RESET: 'undo.reset',
  EVENT_BUTTON_UPDATE: 'toolbar.button.update',
  EVENT_LAYOUT: 'layout.dolayout',
  EVENT_GLOSSARY_LINK_EDIT: 'glossary.link.edit',
  EVENT_GLOSSARY_SHOW: 'glossary.show.info',
  EVENT_GLOSSARY_NEW: 'glossary.show.new',
  EVENT_DOCKERDRAG: 'dragTheDocker',
  EVENT_CANVAS_SCROLL: 'canvas.scroll',

  EVENT_SHOW_PROPERTYWINDOW: 'propertywindow.show',
  EVENT_ABOUT_TO_SAVE: 'file.aboutToSave',

  // extra events
  EVENT_EDITOR_INIT_COMPLETED: 'editor.init.completed',

  EVENT_TYPE_EDITOR_READY: 'event-type-editor-ready',
  EVENT_TYPE_EDITOR_BOOTED: 'event-type-editor-booted',
  EVENT_TYPE_SELECTION_CHANGE: 'event-type-selection-change',
  EVENT_TYPE_TOOLBAR_BUTTON_CLICKEDEVENT_TYPE_TOOLBAR_BUTTON_CLICKED: 'event-type-toolbar-button-clicked',
  /** Event fired when a stencil item is dropped on the canvas. */
  EVENT_TYPE_ITEM_DROPPED: 'event-type-item-dropped',
  /** Event fired when a property value is changed. */
  EVENT_TYPE_PROPERTY_VALUE_CHANGED: 'event-type-property-value-changed',
  EVENT_TYPE_PROPERTY_CHANGED_BYOUTSIDE: 'event-type-property-value-changed-outside',
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
  EVENT_TYPE_UNDO_REDO_RESET: 'event-type-undo-redo-reset',

  // actions events that are fired when a button or key was pressed after completing the initial logic.
  ACTION_DELETE_COMPLETED: 'delete.action.completed',

  /* Selection Shapes Highlights */
  SELECTION_HIGHLIGHT_SIZE: 5,
  SELECTION_HIGHLIGHT_COLOR: '#4444FF',
  SELECTION_HIGHLIGHT_COLOR2: '#9999FF',

  SELECTION_HIGHLIGHT_STYLE_CORNER: 'corner',
  SELECTION_HIGHLIGHT_STYLE_RECTANGLE: 'rectangle',

  SELECTION_VALID_COLOR: '#00FF00',
  SELECTION_INVALID_COLOR: '#FF0000',


  DOCKER_DOCKED_COLOR: '#00FF00',
  DOCKER_UNDOCKED_COLOR: '#FF0000',
  DOCKER_SNAP_OFFSET: 10,

  /* Copy & Paste */
  EDIT_OFFSET_PASTE: 10,

  /* Key-Codes */
  KEY_CODE_X: 88,
  KEY_CODE_C: 67,
  KEY_CODE_V: 86,
  KEY_CODE_DELETE: 46,
  KEY_CODE_META: 224,
  KEY_CODE_BACKSPACE: 8,
  KEY_CODE_LEFT: 37,
  KEY_CODE_RIGHT: 39,
  KEY_CODE_UP: 38,
  KEY_CODE_DOWN: 40,

  // TODO Determine where the lowercase constants are still used and remove them from here.
  KEY_Code_enter: 12,
  KEY_Code_left: 37,
  KEY_Code_right: 39,
  KEY_Code_top: 38,
  KEY_Code_bottom: 40,

  /* Supported Meta Keys */

  META_KEY_META_CTRL: 'metactrl',
  META_KEY_ALT: 'alt',
  META_KEY_SHIFT: 'shift',

  /* Key Actions */

  KEY_ACTION_DOWN: 'down',
  KEY_ACTION_UP: 'up',


  /* Form Rowlayouting */
  FORM_ROW_WIDTH: 350,
  FORM_GROUP_MARGIN: 5,
  FORM_GROUP_EMPTY_HEIGHT: 100,

  /* Form element types */
  // FORM_ELEMENT_ID_PREFIX: 'http://b3mn.org/stencilset/xforms',
  // FORM_ELEMENT_TYPE_ROOT: 'http://b3mn.org/stencilset/xforms#XForm',
  // FORM_ELEMENT_TYPE_GROUP: 'http://b3mn.org/stencilset/xforms#Group',
  // FORM_ELEMENT_TYPE_REPEATING_GROUP: 'http://b3mn.org/stencilset/xforms#RepeatingGroup',
  // FORM_ELEMENT_TYPE_LABEL_FIELD: 'http://b3mn.org/stencilset/xforms#LabelField',

  XMLNS: {
    ATOM: "http://www.w3.org/2005/Atom",
    XHTML: "http://www.w3.org/1999/xhtml",
    ERDF: "http://purl.org/NET/erdf/profile",
    RDFS: "http://www.w3.org/2000/01/rdf-schema#",
    RDF: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    RAZIEL: "http://b3mn.org/Raziel",
    SCHEMA: ""
  },
  CustomConfigs: {},
  setCustomConfigs: function (configs) {
    let keys = Object.keys(configs)
    for(let key in DEFAULT_CONFIG) {
      if (keys.includes(key)) {
        DEFAULT_CONFIG[key] = Object.assign({}, DEFAULT_CONFIG[key], configs[key])
      }
    }
    this.CustomConfigs = DEFAULT_CONFIG
  }
}

export default ORYX_CONFIG
