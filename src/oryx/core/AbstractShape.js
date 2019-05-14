import UIObject from './UIObject'
import ERDF from '../ERDF'
import ORYX_Config from '../CONFIG'
import ORYX_Utils from '../Utils'

/**
 * Top Level uiobject.
 * @class ORYX.Core.AbstractShape
 * @extends ORYX.Core.UIObject
 */

export default class AbstractShape extends UIObject {
  constructor (options, stencil, facade) {
    super(options)
    this.resourceId = ORYX_Utils.provideId() // Id of resource in DOM

    // stencil reference
    this._stencil = stencil
    // if the stencil defines a super stencil that should be used for its instances, set it.
    if (this._stencil._jsonStencil.superId) {
      let stencilId = this._stencil.id()
      let superStencilId = stencilId.substring(0, stencilId.indexOf('#') + 1) + stencil._jsonStencil.superId
      let stencilSet = this._stencil.stencilSet()
      this._stencil = stencilSet.stencil(superStencilId)
    }

    // Hash map for all properties. Only stores the values of the properties.
    this.properties = new Hash()
    this.propertiesChanged = new Hash()

    // List of properties which are not included in the stencilset,
    // but which gets (de)serialized
    this.hiddenProperties = new Hash()

    // Initialization of property map and initial value.
    this._stencil.properties().each((function (property) {
      let key = property.prefix() + '-' + property.id()
      this.properties.set(key, property.value())
      this.propertiesChanged.set(key, true)
    }).bind(this))

    // if super stencil was defined, also regard stencil's properties:
    if (stencil._jsonStencil.superId) {
      stencil.properties().each((function (property) {
        let key = property.prefix() + '-' + property.id()
        let value = property.value()
        let oldValue = this.properties.get(key)
        this.properties.set(key, value)
        this.propertiesChanged.set(key, true)

        // Raise an event, to show that the property has changed
        // required for plugins like processLink.js
        // window.setTimeout( function(){

        this._delegateEvent({
          type: ORYX_Config.EVENT_PROPERTY_CHANGED,
          name: key,
          value: value,
          oldValue: oldValue
        })

        //}.bind(this), 10)

      }).bind(this))
    }
  }

  layout () {}

  /**
   * Returns the stencil object specifiing the type of the shape.
   */
  getStencil () {
    return this._stencil
  }

  /**
   *
   * @param {Object} resourceId
   */
  getChildShapeByResourceId (resourceId) {
    resourceId = ERDF.__stripHashes(resourceId)
    return this.getChildShapes(true).find(function (shape) {
      return shape.resourceId === resourceId
    })
  }

  /**
   * @param {Object} deep
   * @param {Object} iterator
   */
  getChildShapes (deep, iterator) {
    let result = []
    this.children.each(function (uiObject) {
      let type = uiObject.getInstanceofType()
      if (type.includes('Shape') && uiObject.isVisible) {
        if (iterator) {
          iterator(uiObject)
        }
        result.push(uiObject)
        if (deep) {
          result = result.concat(uiObject.getChildShapes(deep, iterator))
        }
      }
    })
    return result
  }

  /**
   * @param {Object} shape
   * @return {boolean} true if any of shape's childs is given shape
   */
  hasChildShape (shape) {
    return this.getChildShapes().any(function (child) {
      return (child === shape) || child.hasChildShape(shape)
    })
  }

  /**
   * @param {Object} deep
   * @param {Object} iterator
   */
  getChildNodes (deep, iterator) {
    let result = []
    this.children.each(function (uiObject) {
      let type = uiObject.getInstanceofType()
      if (type.includes('Node') && uiObject.isVisible) {
        if (iterator) {
          iterator(uiObject)
        }
        result.push(uiObject)
      }
      if (type.includes('Shape')) {
        if (deep) {
          result = result.concat(uiObject.getChildNodes(deep, iterator))
        }
      }
    })

    return result
  }

  /**
   * @param {Object} deep
   * @param {Object} iterator
   */
  getChildEdges (deep, iterator) {
    let result = []
    this.children.each(function (uiObject) {
      let type = uiObject.getInstanceofType()
      if (type.includes('Edge') && uiObject.isVisible) {
        if (iterator) {
          iterator(uiObject)
        }
        result.push(uiObject)
      }
      if (type.includes('Shape')) {
        if (deep) {
          result = result.concat(uiObject.getChildEdges(deep, iterator))
        }
      }
    })

    return result
  }

  /**
   * 返回已排序的oryx.core.node对象数组。
   * 按Z 顺序排列，最后一个对象拥有最高层级。
   */
  // TODO deep iterator
  getAbstractShapesAtPosition () {
    let x, y
    switch (arguments.length) {
      case 1:
        x = arguments[0].x
        y = arguments[0].y
        break
      case 2:
        x = arguments[0]
        y = arguments[1]
        break
      default:
        throw 'getAbstractShapesAtPosition needs 1 or 2 arguments!'
    }

    if (this.isPointIncluded(x, y)) {
      let result = []
      result.push(this)

      // check, if one child is at that position
      let childNodes = this.getChildNodes()
      let childEdges = this.getChildEdges()

      let ary = [childNodes, childEdges]
      ary.each(function (ne) {
        let nodesAtPosition = new Hash()

        ne.each(function (node) {
          if (!node.isVisible) {
            return
          }
          let candidates = node.getAbstractShapesAtPosition(x, y)
          if (candidates.length > 0) {
            let nodesInZOrder = $A(node.node.parentNode.childNodes)
            let zOrderIndex = nodesInZOrder.indexOf(node.node)
            nodesAtPosition.set(zOrderIndex, candidates)
          }
        })

        nodesAtPosition.keys().sort().each(function (key) {
          result = result.concat(nodesAtPosition.get(key))
        })
      })

      return result
    } else {
      return []
    }
  }

  /**
   *
   * @param key {String} Must be 'prefix-id' of property
   * @param value {Object} Can be of type String or Number according to property type.
   */
  setProperty (key, value, force) {
    let oldValue = this.properties.get(key)
    if (oldValue !== value || force === true) {
      this.properties.set(key, value)
      this.propertiesChanged.set(key, true)
      this._changed()

      // Raise an event, to show that the property has changed
      // window.setTimeout( function(){

      if (!this._isInSetProperty) {
        this._isInSetProperty = true
        this._delegateEvent({
          type: ORYX_Config.EVENT_PROPERTY_CHANGED,
          elements: [this],
          name: key,
          value: value,
          oldValue: oldValue
        })

        delete this._isInSetProperty
      }
      //}.bind(this), 10)
    }
  }

  /**
   * Returns TRUE if one of the properties is flagged as dirty
   * @return {boolean}
   */
  isPropertyChanged () {
    return this.propertiesChanged.any(function (property) {
      return property.value
    })
  }

  /**
   *
   * @param {String} Must be 'prefix-id' of property
   * @param {Object} Can be of type String or Number according to property type.
   */
  setHiddenProperty (key, value) {
    // IF undefined, Delete
    if (value === undefined) {
      this.hiddenProperties.unset(key)
      return
    }
    let oldValue = this.hiddenProperties.get(key)
    if (oldValue !== value) {
      this.hiddenProperties.set(key, value)
    }
  }

  /**
   * Calculate if the point is inside the Shape
   * @param {Point}
   */
  isPointIncluded (pointX, pointY, absoluteBounds) {
    let absBounds = absoluteBounds ? absoluteBounds : this.absoluteBounds()
    return absBounds.isIncluded(pointX, pointY)
  }

  /**
   * Get the serialized object
   * return Array with hash-entrees (prefix, name, value)
   * Following values will given:
   *    Type
   *    Properties
   */
  serialize () {
    let serializedObject = []
    // Add the type
    serializedObject.push({ name: 'type', prefix: 'oryx', value: this.getStencil().id(), type: 'literal' })

    // Add hidden properties
    this.hiddenProperties.each(function (prop) {
      serializedObject.push({
        name: prop.key.replace('oryx-', ''),
        prefix: 'oryx',
        value: prop.value,
        type: 'literal'
      })
    }.bind(this))

    // Add all properties
    this.getStencil().properties().each((function (property) {
      let prefix = property.prefix()	// Get prefix
      let name = property.id()		// Get name

      //if(typeof this.properties[prefix+'-'+name] == 'boolean' || this.properties[prefix+'-'+name] != "")
      serializedObject.push({
        name: name,
        prefix: prefix,
        value: this.properties.get(prefix + '-' + name),
        type: 'literal'
      })

    }).bind(this))

    return serializedObject
  }

  deserialize (serialize) {
    // Search in Serialize
    let initializedDocker = 0

    // Sort properties so that the hidden properties are first in the list
    serialize = serialize.sort(function (a, b) {
      a = Number(this.properties.keys().member(a.prefix + '-' + a.name))
      b = Number(this.properties.keys().member(b.prefix + '-' + b.name))
      return a > b ? 1 : (a < b ? -1 : 0)
    }.bind(this))

    serialize.each((function (obj) {
      let name = obj.name
      let prefix = obj.prefix
      let value = obj.value

      // Complex properties can be real json objects, encode them to a string
      if (Object.prototype.toString.call(value) === 'Object') value = JSON.stringify(value)

      switch (prefix + '-' + name) {
        case 'raziel-parent':
          // Set parent
          if (!this.parent) {
            break
          }
          // Set outgoing Shape
          let parent = this.getCanvas().getChildShapeByResourceId(value)
          if (parent) {
            parent.add(this)
          }
          break
        default:
          // If list, eval as an array
          let prop = this.getStencil().property(prefix + '-' + name)
          if (prop && prop.isList() && typeof value === 'string') {
            if ((value || '').strip() && !value.startsWith('[') && !value.startsWith(']'))
              value = '["' + value.strip() + '"]'
            value = ((value || '').strip() || '[]').evalJSON()
          }

          // Set property
          if (this.properties.keys().member(prefix + '-' + name)) {
            this.setProperty(prefix + '-' + name, value)
          } else if (!(name === 'bounds' || name === 'parent' || name === 'target' || name === 'dockers' || name === 'docker' || name === 'outgoing' || name === 'incoming')) {
            this.setHiddenProperty(prefix + '-' + name, value)
          }

      }
    }).bind(this))
  }

  toString () {
    return 'ORYX.Core.AbstractShape ' + this.id
  }

  /**
   * Converts the shape to a JSON representation.
   * @return {Object} A JSON object with included ORYX.Core.AbstractShape.JSONHelper and getShape() method.
   */
  toJSON () {
    // upgrade to prototype 1.6/1.7 breaks the jquery extend call. rebuilding the properties here.
    let mergedProperties = this.properties.merge(this.hiddenProperties)
    let resultProperties = new Hash()
    mergedProperties.each(function (pair) {
      let key = pair.key
      let value = pair.value

      //If complex property, value should be a json object
      if (this.getStencil().property(key)
        && this.getStencil().property(key).type() === ORYX_Config.TYPE_COMPLEX
        && Object.prototype.toString.call(value) === 'String') {

        try {
          value = JSON.parse(value)
        } catch (error) {
        }

        // Parse date
      } else if (value instanceof Date && this.getStencil().property(key)) {
        try {
          value = value.format(this.getStencil().property(key).dateFormat())
        } catch (e) {
        }
      }

      // Takes "my_property" instead of "oryx-my_property" as key
      key = key.replace(/^[\w_]+-/, '')
      resultProperties.set(key, value)

    }.bind(this))

    let json = {
      resourceId: this.resourceId,
      properties: resultProperties.toObject(),
      stencil: {
        id: this.getStencil().idWithoutNs()
      },
      childShapes: this.getChildShapes().map(function (shape) {
        return shape.toJSON()
      })
    }

    if (this.getOutgoingShapes) {
      json.outgoing = this.getOutgoingShapes().map(function (shape) {
        return {
          resourceId: shape.resourceId
        }
      })
    }

    if (this.bounds) {
      json.bounds = {
        lowerRight: this.bounds.lowerRight(),
        upperLeft: this.bounds.upperLeft()
      }
    }

    if (this.dockers) {
      json.dockers = this.dockers.map(function (docker) {
        let d = docker.getDockedShape() && docker.referencePoint ? docker.referencePoint : docker.bounds.center()
        d.getDocker = function () {
          return docker
        }
        return d
      })
    }

    jQuery.extend(json, ORYX_Utils.JSONHelper)

    // do not pollute the json attributes (for serialization), so put the corresponding
    // shape is encapsulated in a method
    json.getShape = function () {
      return this
    }.bind(this)

    return json
  }
}
