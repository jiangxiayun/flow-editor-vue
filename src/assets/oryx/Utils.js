import ORYX_CONFIG from './CONFIG'
import ORYX_Log from './Log'

const Utils = {
  /**
   * General helper method for parsing a param out of current location url
   * 获取当前url上的参数
   * @example
   * // Current url in Browser => "http://oryx.org?param=value"
   * ORYX.Utils.getParamFromUrl("param") // => "value"
   * @param {Object} name
   */
  getParamFromUrl: function (name) {
    name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]')
    var regexS = '[\\?&]' + name + '=([^&#]*)'
    var regex = new RegExp(regexS)
    var results = regex.exec(window.location.href)
    if (results == null) {
      return null
    }
    else {
      return results[1]
    }
  },

  adjustLightness: function () {
    return arguments[0]
  },

  adjustGradient: function (gradient, reference) {

    if (ORYX_CONFIG.DISABLE_GRADIENT && gradient) {

      var col = reference.getAttributeNS(null, 'stop-color') || '#ffffff'

      $A(gradient.getElementsByTagName('stop')).each(function (stop) {
        if (stop == reference) {
          return
        }
        stop.setAttributeNS(null, 'stop-color', col)
      })
    }
  },

  // TODO Implement namespace awareness on attribute level.
  /**
   * graft() function
   * Originally by Sean M. Burke from interglacial.com, altered for usage with
   * SVG and namespace (xmlns) support. Be sure you understand xmlns before
   * using this funtion, as it creates all grafted elements in the xmlns
   * provided by you and all element's attribures in default xmlns. If you
   * need to graft elements in a certain xmlns and wish to assign attributes
   * in both that and another xmlns, you will need to do stepwise grafting,
   * adding non-default attributes yourself or you'll have to enhance this
   * function. Latter, I would appreciate: martin�apfelfabrik.de
   * @param {Object} namespace The namespace in which
   *          elements should be grafted.
   * @param {Object} parent The element that should contain the grafted
   *          structure after the function returned.
   * @param {Object} t the crafting structure.
   * @param {Object} doc the document in which grafting is performed.
   */
  graft: function (namespace, parent, t, doc) {
    doc = (doc || (parent && parent.ownerDocument) || document)
    let e
    if (t === undefined) {
      throw 'Can\'t graft an undefined value'
    } else if (t.constructor == String) {
      e = doc.createTextNode(t)
    } else {
      for (let i = 0; i < t.length; i++) {
        if (i === 0 && t[i].constructor == String) {
          let snared = t[i].match(/^([a-z][a-z0-9]*)\.([^\s\.]+)$/i)
          if (snared) {
            e = doc.createElementNS(namespace, snared[1])
            e.setAttributeNS(null, 'class', snared[2])
            continue
          }
          snared = t[i].match(/^([a-z][a-z0-9]*)$/i)
          if (snared) {
            e = doc.createElementNS(namespace, snared[1])  // but no class
            continue
          }

          // Otherwise:
          e = doc.createElementNS(namespace, 'span')
          e.setAttribute(null, 'class', 'namelessFromLOL')
        }

        if (t[i] === undefined) {
          throw 'Can\'t graft an undefined value in a list!'
        } else if (t[i].constructor == String || t[i].constructor == Array) {
          this.graft(namespace, e, t[i], doc)
        } else if (t[i].constructor == Number) {
          this.graft(namespace, e, t[i].toString(), doc)
        } else if (t[i].constructor == Object) {
          // hash's properties => element's attributes
          for (var k in t[i]) {
            e.setAttributeNS(null, k, t[i][k])
          }
        } else {

        }
      }
    }
    if (parent && parent.appendChild) {
      parent.appendChild(e)
    } else {

    }
    return e // return the topmost created node
  },
  /**
   * Provides an uniq id
   * @overwrite
   * @return {String}
   *
   */
  provideId: function  () {
    let res = [], hex = '0123456789ABCDEF'
    for (let i = 0; i < 36; i++) res[i] = Math.floor(Math.random() * 0x10)

    res[14] = 4
    res[19] = (res[19] & 0x3) | 0x8

    for (let i = 0; i < 36; i++) { res[i] = hex[res[i]] }
    res[8] = res[13] = res[18] = res[23] = '-'

    return 'sid-' + res.join('')
  },
  /**
   * Workaround for SAFARI/Webkit, because
   * when trying to check SVGSVGElement of instanceof there is
   * raising an error
   *
   */
  SVGClassElementsAreAvailable: true,
  checkClassType: function (classInst, classType) {
    if (this.SVGClassElementsAreAvailable) {
      return classInst instanceof classType
    } else {
      return classInst == classType
    }
  },
  setMissingClasses: function () {
    try {
      SVGElement
    } catch (e) {
      this.SVGClassElementsAreAvailable = false
      let SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg').toString()
      let SVGGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g').toString()
      let SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path').toString()
      let SVGTextElement = document.createElementNS('http://www.w3.org/2000/svg', 'text').toString()
      //SVGMarkerElement 	= document.createElementNS('http://www.w3.org/2000/svg', 'marker').toString();
      let SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect').toString()
      let SVGImageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image').toString()
      let SVGCircleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle').toString()
      let SVGEllipseElement = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse').toString()
      let SVGLieElement = document.createElementNS('http://www.w3.org/2000/svg', 'line').toString()
      let SVGPolylineElement = document.createElementNS('http://www.w3.org/2000/svg', 'polyline').toString()
      let SVGPolygonElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon').toString()
    }

  },
  availablePlugins: [],
  _loadPlugins: function (plugins) {
    this.availablePlugins.length = 0
    let resultXml = plugins
    // get plugins.xml content
    // var resultXml = jQuery.parseXML(plugins); //jquery parser

    // TODO: Describe how properties are handled.
    // Get the globale Properties
    let globalProperties = []
    let preferences = $A(resultXml.getElementsByTagName('properties'))
    preferences.each(function (p) {
      let props = $A(p.childNodes)
      props.each(function (prop) {
        let property = new Hash()

        // get all attributes from the node and set to global properties
        let attributes = $A(prop.attributes)
        attributes.each(function (attr) {
          property.set(attr.nodeName, attr.nodeValue)
        })
        if (attributes.length > 0) {
          globalProperties.push(property)
        }
      })
    })

    // TODO Why are we using XML if we don't respect structure anyway?
    // for each plugin element in the configuration..
    let plugin = resultXml.getElementsByTagName('plugin')
    const me = this
    $A(plugin).each(function (node) {
      // get all element's attributes.
      // TODO: What about: var pluginData = $H(node.attributes) !?
      let pluginData = new Hash()
      $A(node.attributes).each(function (attr) {
        pluginData.set(attr.nodeName, attr.nodeValue)
      })

      // ensure there's a name attribute.
      if (!pluginData.get('name')) {
        ORYX_Log.error('A plugin is not providing a name. Ingnoring this plugin.')
        return
      }

      // ensure there's a source attribute.
      if (!pluginData.get('source')) {
        ORYX_Log.error('Plugin with name \'%0\' doesn\'t provide a source attribute.', pluginData.get('name'))
        return
      }

      // Get all private Properties
      let propertyNodes = node.getElementsByTagName('property')
      let properties = []
      $A(propertyNodes).each(function (prop) {
        let property = new Hash()

        // Get all Attributes from the Node
        let attributes = $A(prop.attributes)
        attributes.each(function (attr) {
          property.set(attr.nodeName, attr.nodeValue)
        })

        if (attributes.length > 0) {
          properties.push(property)
        }
      })

      // Set all Global-Properties to the Properties
      properties = properties.concat(globalProperties)

      // Set Properties to Plugin-Data
      pluginData.set('properties', properties)

      // Get the RequieredNodes
      let requireNodes = node.getElementsByTagName('requires')
      let requires
      $A(requireNodes).each(function (req) {
        let namespace = $A(req.attributes).find(function (attr) {
          return attr.name == 'namespace'
        })
        if (namespace && namespace.nodeValue) {
          if (!requires) {
            requires = { namespaces: [] }
          }
          requires.namespaces.push(namespace.nodeValue)
        }
      })

      // Set Requires to the Plugin-Data, if there is one
      if (requires) {
        pluginData.set('requires', requires)
      }

      // Get the RequieredNodes
      let notUsesInNodes = node.getElementsByTagName('notUsesIn')
      let notUsesIn
      $A(notUsesInNodes).each(function (not) {
        let namespace = $A(not.attributes).find(function (attr) {
          return attr.name == 'namespace'
        })
        if (namespace && namespace.nodeValue) {
          if (!notUsesIn) {
            notUsesIn = { namespaces: [] }
          }

          notUsesIn.namespaces.push(namespace.nodeValue)
        }
      })

      // Set Requires to the Plugin-Data, if there is one
      if (notUsesIn) {
        pluginData.set('notUsesIn', notUsesIn)
      }

      let url = ORYX_CONFIG.PATH + ORYX_CONFIG.PLUGINS_FOLDER + pluginData.get('source')

      ORYX_Log.debug('Requireing \'%0\'', url)

      // Add the Script-Tag to the Site
      //Kickstart.require(url);

      // 加载成功log
      // ORYX_Log.info("Plugin '%0' successfully loaded.", pluginData.get('name'));

      // Add the Plugin-Data to all available Plugins
      me.availablePlugins.push(pluginData)
    })
  },
  /**
   * @namespace Collection of methods which can be used on a shape json object (ORYX.Core.AbstractShape#toJSON()).
   * @example
   * jQuery.extend(shapeAsJson, ORYX.Core.AbstractShape.JSONHelper);
   */
  JSONHelper: {
    /**
     * Iterates over each child shape.
     * @param {Object} iterator Iterator function getting a child shape and his parent as arguments.
     * @param {boolean} [deep=false] Iterate recursively (childShapes of childShapes)
     * @param {boolean} [modify=false] If true, the result of the iterator function is taken as new shape, return false
     *   to delete it. This enables modifying the object while iterating through the child shapes.
     * @example
     * // Increases the lowerRight x value of each direct child shape by one.
     * myShapeAsJson.eachChild(function(shape, parentShape){
     *     shape.bounds.lowerRight.x = shape.bounds.lowerRight.x + 1;
     *     return shape;
     * }, false, true);
     */
    eachChild: function (iterator, deep, modify) {
      if (!this.childShapes) return

      let newChildShapes = [] //needed if modify = true
      this.childShapes.each(function (shape) {
        if (!(shape.eachChild instanceof Function)) {
          jQuery.extend(shape, this.JSONHelper)
        }
        let res = iterator(shape, this)
        if (res) newChildShapes.push(res) //if false is returned, and modify = true, current shape is deleted.

        if (deep) shape.eachChild(iterator, deep, modify)
      }.bind(this))
      if (modify) this.childShapes = newChildShapes
    },
    getShape: function () {
      return null
    },
    getChildShapes: function (deep) {
      let allShapes = this.childShapes
      if (deep) {
        this.eachChild(function (shape) {
          if (!(shape.getChildShapes instanceof Function)) {
            jQuery.extend(shape, this.JSONHelper)
          }
          allShapes = allShapes.concat(shape.getChildShapes(deep))
        }, true)
      }

      return allShapes
    },
    /**
     * @return {String} Serialized JSON object
     */
    serialize: function () {
      return JSON.stringify(this)
    }
  }
}

export default Utils