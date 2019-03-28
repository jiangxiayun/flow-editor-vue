import AbstractPlugin from './AbstractPlugin'
import ORYX_Config from '../CONFIG'


/**
 This abstract plugin implements the core behaviour of layout

 @class ORYX.Plugins.AbstractLayouter
 @constructor Creates a new instance
 @author Willi Tscheschner
 */
export default class AbstractLayouter extends AbstractPlugin {
  /**
   * 'layouted' defined all types of shapes which will be layouted.
   * It can be one value or an array of values. The value
   * can be a Stencil ID (as String) or an class type of either
   * a ORYX.Core.Node or ORYX.Core.Edge
   * @type Array|String|Object
   * @memberOf ORYX.Plugins.AbstractLayouter.prototype
   */


  /**
   * Constructor
   * @param {Object} facade
   * @memberOf ORYX.Plugins.AbstractLayouter.prototype
   */
  constructor (facade) {
    // arguments.callee.$.construct.apply(this, arguments);
    super(facade)
    this.layouted = []
    this.facade.registerOnEvent(ORYX_Config.EVENT_LAYOUT, this._initLayout.bind(this))
  }

  /**
   * Proofs if this shape should be layouted or not
   * @param {Object} shape
   * @memberOf ORYX.Plugins.AbstractLayouter.prototype
   */
  isIncludedInLayout (shape) {
    if (!(this.layouted instanceof Array)) {
      this.layouted = [this.layouted].compact()
    }

    // If there are no elements
    if (this.layouted.length <= 0) {
      // Return TRUE
      return true
    }

    // Return TRUE if there is any correlation between
    // the 'layouted' attribute and the shape themselve.
    return this.layouted.any(function (s) {
      if (typeof s == 'string') {
        return shape.getStencil().id().include(s)
      } else {
        return shape instanceof s
      }
    })
  }

  /**
   * Callback to start the layouting
   * @param {Object} event Layout event
   * @param {Object} shapes Given shapes
   * @memberOf ORYX.Plugins.AbstractLayouter.prototype
   */
  _initLayout (event) {
    // Get the shapes
    let shapes = [event.shapes].flatten().compact()

    // Find all shapes which should be layouted
    let toLayout = shapes.findAll(function (shape) {
      return this.isIncludedInLayout(shape)
    }.bind(this))

    // If there are shapes left
    if (toLayout.length > 0) {
      // Do layout
      this.layout(toLayout)
    }
  }

  /**
   * Implementation of layouting a set on shapes
   * @param {Object} shapes Given shapes
   * @memberOf ORYX.Plugins.AbstractLayouter.prototype
   */
  layout (shapes) {
    throw new Error('Layouter has to implement the layout function.')
  }
}