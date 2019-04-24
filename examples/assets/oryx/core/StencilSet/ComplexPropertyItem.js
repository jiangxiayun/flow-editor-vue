import ORYX_CINFIG from '../../CONFIG'
import PropertyItem from './PropertyItem'


/**
 * Returns the translation of an attribute in jsonObject specified by its name
 * according to navigator.language
 */

export default class ComplexPropertyItem {
  constructor (jsonItem, namespace, property) {
    // arguments.callee.$.construct.apply(this, arguments)
    if (!jsonItem) {
      throw 'ORYX.Core.StencilSet.ComplexPropertyItem(construct): Parameter jsonItem is not defined.'
    }
    if (!namespace) {
      throw 'ORYX.Core.StencilSet.ComplexPropertyItem(construct): Parameter namespace is not defined.'
    }
    if (!property) {
      throw 'ORYX.Core.StencilSet.ComplexPropertyItem(construct): Parameter property is not defined.'
    }

    this._jsonItem = jsonItem
    this._namespace = namespace
    this._property = property
    this._items = new Hash()
    this._complexItems = new Hash()

    // init all values
    if (!jsonItem.name) {
      throw 'ORYX.Core.StencilSet.ComplexPropertyItem(construct): Name is not defined.'
    }

    if (!jsonItem.type) {
      throw 'ORYX.Core.StencilSet.ComplexPropertyItem(construct): Type is not defined.'
    } else {
      jsonItem.type = jsonItem.type.toLowerCase()
    }

    if (jsonItem.type === ORYX_CINFIG.TYPE_CHOICE) {
      if (jsonItem.items && jsonItem.items instanceof Array) {
        jsonItem.items.each((function (item) {
          this._items[item.value] = new PropertyItem(item, namespace, this)
        }).bind(this))
      } else {
        throw 'ORYX.Core.StencilSet.Property(construct): No property items defined.'
      }
    } else if (jsonItem.type === ORYX_CINFIG.TYPE_COMPLEX) {
      if (jsonItem.complexItems && jsonItem.complexItems instanceof Array) {
        jsonItem.complexItems.each((function (complexItem) {
          this._complexItems[complexItem.id] = new ComplexPropertyItem(complexItem, namespace, this)
        }).bind(this))
      } else {
        throw 'ORYX.Core.StencilSet.Property(construct): No property items defined.'
      }
    }
  }

  /**
   * @param {ORYX.Core.StencilSet.PropertyItem} item
   * @return {Boolean} True, if item has the same namespace and id.
   */
  equals (item) {
    return (this.property().equals(item.property()) && this.name() === item.name())
  }

  namespace () {
    return this._namespace
  }

  property () {
    return this._property
  }

  name () {
    return this._jsonItem.name
  }

  id () {
    return this._jsonItem.id
  }

  type () {
    return this._jsonItem.type
  }

  optional () {
    return this._jsonItem.optional
  }

  width () {
    return this._jsonItem.width
  }

  value () {
    return this._jsonItem.value
  }

  items () {
    return this._items.values()
  }

  complexItems () {
    return this._complexItems.values()
  }

  disable () {
    return this._jsonItem.disable
  }
}