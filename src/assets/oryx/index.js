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
import Controls from './core/Controls'
import Math from './core/Math'

import StencilSet from './core/StencilSet/index'
import SVG from './core/SVG'

import Editor from './Editor'
import Plugins from './Plugins'
import Utils from './Utils'
import CONFIG from './CONFIG'


const ORYX = {
  //set the path in the config.js file!!!!
  PATH: 'editor/',
  //CONFIGURATION: "config.js",

  URLS: [],

  alreadyLoaded: [],

  configrationRetries: 0,

  Version: '0.1.1',

  availablePlugins: [],


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
    ORYX.Log.debug("Oryx begins loading procedure.");

    // check for prototype
    if ((typeof Prototype == 'undefined') ||
      (typeof Element == 'undefined') ||
      (typeof Element.Methods == 'undefined') ||
      parseFloat(Prototype.Version.split(".")[0] + "." +
        Prototype.Version.split(".")[1]) < 1.5)

      throw("Application requires the Prototype JavaScript framework >= 1.5.3");

    ORYX.Log.debug("Prototype > 1.5 found.");

    // continue loading.
    ORYX._load();
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
    ORYX.loadPlugins();
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
      ORYX._loadPlugins()
    else
      ORYX.Log.warn("Ignoring plugins, loading Core only.");

    // init the editor instances.
    init();
  },

  _loadPlugins: function (plugins) {
    ORYX.availablePlugins.length = 0;

    var resultXml = plugins
    // get plugins.xml content
    // var resultXml = jQuery.parseXML(plugins); //jquery parser

    // TODO: Describe how properties are handled.
    // Get the globale Properties
    var globalProperties = [];
    var preferences = $A(resultXml.getElementsByTagName("properties"));
    preferences.each(function (p) {
      var props = $A(p.childNodes);
      props.each(function (prop) {
        var property = new Hash();

        // get all attributes from the node and set to global properties
        var attributes = $A(prop.attributes)
        attributes.each(function (attr) {
          property.set(attr.nodeName, attr.nodeValue);
        });
        if (attributes.length > 0) {
          globalProperties.push(property)
        }
        ;
      });
    });

    // TODO Why are we using XML if we don't respect structure anyway?
    // for each plugin element in the configuration..
    var plugin = resultXml.getElementsByTagName("plugin");
    $A(plugin).each(function (node) {
      // get all element's attributes.
      // TODO: What about: var pluginData = $H(node.attributes) !?
      var pluginData = new Hash();
      $A(node.attributes).each(function (attr) {
        pluginData.set(attr.nodeName, attr.nodeValue);
      });

      // ensure there's a name attribute.
      if (!pluginData.get('name')) {
        ORYX.Log.error("A plugin is not providing a name. Ingnoring this plugin.");
        return;
      }

      // ensure there's a source attribute.
      if (!pluginData.get('source')) {
        ORYX.Log.error("Plugin with name '%0' doesn't provide a source attribute.", pluginData.get('name'));
        return;
      }

      // Get all private Properties
      var propertyNodes = node.getElementsByTagName("property");
      var properties = [];
      $A(propertyNodes).each(function (prop) {
        var property = new Hash();

        // Get all Attributes from the Node
        var attributes = $A(prop.attributes)
        attributes.each(function (attr) {
          property.set(attr.nodeName, attr.nodeValue);
        });

        if (attributes.length > 0) {
          properties.push(property)
        }

      });

      // Set all Global-Properties to the Properties
      properties = properties.concat(globalProperties);

      // Set Properties to Plugin-Data
      pluginData.set('properties', properties);

      // Get the RequieredNodes
      var requireNodes = node.getElementsByTagName("requires");
      var requires;
      $A(requireNodes).each(function (req) {
        var namespace = $A(req.attributes).find(function (attr) {
          return attr.name == "namespace"
        })
        if (namespace && namespace.nodeValue) {
          if (!requires) {
            requires = {namespaces: []}
          }

          requires.namespaces.push(namespace.nodeValue)
        }
      });

      // Set Requires to the Plugin-Data, if there is one
      if (requires) {
        pluginData.set('requires', requires);
      }

      // Get the RequieredNodes
      var notUsesInNodes = node.getElementsByTagName("notUsesIn");
      var notUsesIn;
      $A(notUsesInNodes).each(function (not) {
        var namespace = $A(not.attributes).find(function (attr) {
          return attr.name == "namespace"
        })
        if (namespace && namespace.nodeValue) {
          if (!notUsesIn) {
            notUsesIn = {namespaces: []}
          }

          notUsesIn.namespaces.push(namespace.nodeValue)
        }
      });

      // Set Requires to the Plugin-Data, if there is one
      if (notUsesIn) {
        pluginData.set('notUsesIn', notUsesIn);
      }


      var url = ORYX.PATH + ORYX.CONFIG.PLUGINS_FOLDER + pluginData.get('source');

      ORYX.Log.debug("Requireing '%0'", url);

      // Add the Script-Tag to the Site
      //Kickstart.require(url);

      // 加载成功log
      // ORYX.Log.info("Plugin '%0' successfully loaded.", pluginData.get('name'));

      // Add the Plugin-Data to all available Plugins
      ORYX.availablePlugins.push(pluginData);
    });
  },

  _loadPluginsOnFails: function (result) {
    ORYX.Log.error("Plugin configuration file not available.");
  }
}

ORYX.CONFIG = CONFIG
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



ORYX.Core.UIEnableDrag = function (event, uiObj, option) {

  this.uiObj = uiObj;
  var upL = uiObj.bounds.upperLeft();

  var a = uiObj.node.getScreenCTM();
  this.faktorXY = {x: a.a, y: a.d};

  this.scrollNode = uiObj.node.ownerSVGElement.parentNode.parentNode;

  this.offSetPosition = {
    x: Event.pointerX(event) - (upL.x * this.faktorXY.x),
    y: Event.pointerY(event) - (upL.y * this.faktorXY.y)
  };

  this.offsetScroll = {x: this.scrollNode.scrollLeft, y: this.scrollNode.scrollTop};

  this.dragCallback = ORYX.Core.UIDragCallback.bind(this);
  this.disableCallback = ORYX.Core.UIDisableDrag.bind(this);

  this.movedCallback = option ? option.movedCallback : undefined;
  this.upCallback = option ? option.upCallback : undefined;

  document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.disableCallback, true);
  document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.dragCallback, false);

};

ORYX.Core.UIDragCallback = function (event) {

  var position = {
    x: Event.pointerX(event) - this.offSetPosition.x,
    y: Event.pointerY(event) - this.offSetPosition.y
  }

  position.x -= this.offsetScroll.x - this.scrollNode.scrollLeft;
  position.y -= this.offsetScroll.y - this.scrollNode.scrollTop;

  position.x /= this.faktorXY.x;
  position.y /= this.faktorXY.y;

  this.uiObj.bounds.moveTo(position);
  //this.uiObj.update();

  if (this.movedCallback)
    this.movedCallback(event);

  //Event.stop(event);

};

ORYX.Core.UIDisableDrag = function (event) {
  document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.dragCallback, false);
  document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.disableCallback, true);

  if (this.upCallback)
    this.upCallback(event);

  this.upCallback = undefined;
  this.movedCallback = undefined;

  Event.stop(event);
};


ORYX.Core.Controls = Controls
ORYX.Core.Math = Math
ORYX.Core.Index = StencilSet
ORYX.Core.SVG = SVG


ORYX.Editor = Editor
ORYX.Plugins = Plugins
ORYX.Utils = Utils

export default ORYX
