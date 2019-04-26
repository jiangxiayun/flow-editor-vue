export default class PropertyItem {
  constructor (jsonItem, namespace, property) {
    // arguments.callee.$.construct.apply(this, arguments)
    if (!jsonItem) {
      throw 'ORYX.Core.StencilSet.PropertyItem(construct): Parameter jsonItem is not defined.'
    }
    if (!namespace) {
      throw 'ORYX.Core.StencilSet.PropertyItem(construct): Parameter namespace is not defined.'
    }
    if (!property) {
      throw 'ORYX.Core.StencilSet.PropertyItem(construct): Parameter property is not defined.'
    }

    this._jsonItem = jsonItem
    this._namespace = namespace
    this._property = property

    // init all values
    if (!jsonItem.value) {
      throw 'ORYX.Core.StencilSet.PropertyItem(construct): Value is not defined.'
    }

    if (this._jsonItem.refToView) {
      if (!(this._jsonItem.refToView instanceof Array)) {
        this._jsonItem.refToView = [this._jsonItem.refToView]
      }
    } else {
      this._jsonItem.refToView = []
    }
  }

  /**
   * @param {ORYX.Core.StencilSet.PropertyItem} item
   * @return {Boolean} True, if item has the same namespace and id.
   */
  equals (item) {
    return (this.property().equals(item.property()) &&
      this.value() === item.value())
  }

  namespace () {
    return this._namespace
  }

  property () {
    return this._property
  }

  value () {
    return this._jsonItem.value
  }

  title () {
    return this._jsonItem.title
  }

  refToView () {
    return this._jsonItem.refToView
  }

  icon () {
    return (this._jsonItem.icon) ? this.property().stencil()._source + 'icons/' + this._jsonItem.icon : ''
  }

  toString () {
    return 'PropertyItem ' + this.property() + ' (' + this.value() + ')'
  }
}