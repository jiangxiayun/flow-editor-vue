import Command from './core/Command'
import Bounds from './core/Bounds'
import UIObject from './core/UIObject'
import AbstractShape from './core/AbstractShape'
import Canvas from './core/Canvas'
import MoveDockersCommand from './core/MoveDockersCommand'
import Shape from './core/Shape'
import Node from './core/Node'
import Edge from './core/Edge'
import Move from './core/Move'
import Controls from './core/Controls/index'
import Math from './core/Math'

import StencilSet from './core/StencilSet/index'
import SVG from './core/SVG'
import { UIEnableDrag, UIDragCallback, UIDisableDrag } from './core/UIEnableDrag'

import Editor from './Editor'
import Plugins from './Plugins'
import Utils from './Utils'
import CONFIG from './CONFIG'
import Log from './Log'

const ORYX = {
  //set the path in the config.js file!!!!
  PATH: 'editor/',
  //CONFIGURATION: "config.js",

  URLS: [],

  alreadyLoaded: [],

  configrationRetries: 0,

  Version: '0.1.1',

  /**
   * First bootstrapping layer. The Oryx loading procedure begins. In this
   * step, all preliminaries that are not in the responsibility of Oryx to be
   * met have to be checked here, such as the existance of the prototpe
   * library in the current execution environment. After that, the second
   * bootstrapping layer is being invoked. Failing to ensure that any
   * preliminary condition is not met has to fail with an error.
   *
   * 第一个引导层。Oryx开始加载，在这步骤，所有不属于Oryx责任的准备工作必须在这里检查MET，例如Prototpe的存在
   * 当前执行环境中的库。之后，第二个正在调用引导层。未能确保不满足初步条件就必须失败并出现错误。
   */
  load: function () {
    ORYX.Log.debug('Oryx begins loading procedure.')

    // check for prototype
    if ((typeof Prototype == 'undefined') ||
      (typeof Element == 'undefined') ||
      (typeof Element.Methods == 'undefined') ||
      parseFloat(Prototype.Version.split('.')[0] + '.' +
        Prototype.Version.split('.')[1]) < 1.5)

      throw('Application requires the Prototype JavaScript framework >= 1.5.3')

    ORYX.Log.debug('Prototype > 1.5 found.')

    // continue loading.
    ORYX._load()
  },

  /**
   * Second bootstrapping layer. The oryx configuration is checked. When not
   * yet loaded, config.js is being requested from the server. A repeated
   * error in retrieving the configuration will result in an error to be
   * thrown after a certain time of retries. Once the configuration is there,
   * all urls that are registered with oryx loading are being requested from
   * the server. Once everything is loaded, the third layer is being invoked.
   */
  _load: function () {
    ORYX.loadPlugins()
  },

  /**
   * Third bootstrapping layer. This is where first the plugin coniguration
   * file is loaded into oryx, analyzed, and where all plugins are being
   * requested by the server. Afterwards, all editor instances will be
   * initialized.
   */
  loadPlugins: function () {
    // load plugins if enabled.
    if (ORYX.CONFIG.PLUGINS_ENABLED)
      Utils._loadPlugins()
    else
      ORYX.Log.warn('Ignoring plugins, loading Core only.')

    // init the editor instances.
    init()
  },
  _loadPluginsOnFails: function (result) {
    ORYX.Log.error('Plugin configuration file not available.')
  }
}

ORYX.CONFIG = CONFIG
ORYX.Log = Log

ORYX.Core = {}
ORYX.Core.Command = Command
ORYX.Core.Bounds = Bounds
ORYX.Core.UIObject = UIObject
ORYX.Core.AbstractShape = AbstractShape
ORYX.Core.Canvas = Canvas
ORYX.Core.MoveDockersCommand = MoveDockersCommand
ORYX.Core.Shape = Shape
ORYX.Core.Node = Node
ORYX.Core.Edge = Edge
ORYX.Core.Move = Move
ORYX.Core.UIEnableDrag = UIEnableDrag
ORYX.Core.UIDragCallback = UIDragCallback
ORYX.Core.UIDisableDrag = UIDisableDrag
ORYX.Core.Controls = Controls
ORYX.Core.Math = Math
ORYX.Core.StencilSet = StencilSet
ORYX.Core.SVG = SVG


ORYX.Editor = Editor
ORYX.Plugins = Plugins
ORYX.Utils = Utils

/**
 * Main initialization method. To be called when loading
 * of the document, including all scripts, is completed.
 */


function init () {
  ORYX.Log.debug('Querying editor instances')
  // Hack for WebKit to set the SVGElement-Classes
  ORYX.Utils.setMissingClasses();
  // If someone wants to create the editor instance himself
  if (window.onOryxResourcesLoaded) {
    window.onOryxResourcesLoaded()
  } else {
    // Else fetch the model from server and display editor
    let modelId = window.location.search.substring(4)
    let modelUrl = './service/model/' + modelId + '/json'
    ORYX.Editor.createByUrl(modelUrl)
  }
}

export default ORYX
