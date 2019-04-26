/**
 * @classDescription This class wraps the manipulation of a SVG marker.
 * @namespace ORYX.Core.SVG
 * uses Inheritance (Clazz)
 * uses Prototype 1.5.0
 *
 */

import ORYX_CONFIG from '../../CONFIG'
import SVGShape from './SVGShape'

export default class SVGMarker {
  /**
   * Constructor
   * @param markerElement {SVGMarkerElement}
   */
  constructor (markerElement) {
    // arguments.callee.$.construct.apply(this, arguments);

    this.id = undefined
    this.element = markerElement
    this.refX = undefined
    this.refY = undefined
    this.markerWidth = undefined
    this.markerHeight = undefined
    this.oldRefX = undefined
    this.oldRefY = undefined
    this.oldMarkerWidth = undefined
    this.oldMarkerHeight = undefined
    this.optional = false
    this.enabled = true
    this.minimumLength = undefined
    this.resize = false

    this.svgShapes = []

    this._init() //initialisation of all the properties declared above.
  }

  /**
   * Initializes the values that are defined in the constructor.
   */
  _init () {
    // check if this.element is a SVGMarkerElement
    if (!(this.element == '[object SVGMarkerElement]')) {
      throw 'SVGMarker: Argument is not an instance of SVGMarkerElement.'
    }

    this.id = this.element.getAttributeNS(null, 'id')

    // init svg marker attributes
    let refXValue = this.element.getAttributeNS(null, 'refX')
    if (refXValue) {
      this.refX = parseFloat(refXValue)
    } else {
      this.refX = 0
    }
    let refYValue = this.element.getAttributeNS(null, 'refY')
    if (refYValue) {
      this.refY = parseFloat(refYValue)
    } else {
      this.refY = 0
    }
    let markerWidthValue = this.element.getAttributeNS(null, 'markerWidth')
    if (markerWidthValue) {
      this.markerWidth = parseFloat(markerWidthValue)
    } else {
      this.markerWidth = 3
    }

    let markerHeightValue = this.element.getAttributeNS(null, 'markerHeight')
    if (markerHeightValue) {
      this.markerHeight = parseFloat(markerHeightValue)
    } else {
      this.markerHeight = 3
    }

    this.oldRefX = this.refX
    this.oldRefY = this.refY
    this.oldMarkerWidth = this.markerWidth
    this.oldMarkerHeight = this.markerHeight

    //init oryx attributes
    let optionalAttr = this.element.getAttributeNS(ORYX_CONFIG.NAMESPACE_ORYX, 'optional')
    if (optionalAttr) {
      optionalAttr = optionalAttr.strip()
      this.optional = (optionalAttr.toLowerCase() === 'yes')
    } else {
      this.optional = false
    }

    let enabledAttr = this.element.getAttributeNS(ORYX_CONFIG.NAMESPACE_ORYX, 'enabled')
    if (enabledAttr) {
      enabledAttr = enabledAttr.strip()
      this.enabled = !(enabledAttr.toLowerCase() === 'no')
    } else {
      this.enabled = true
    }

    let minLengthAttr = this.element.getAttributeNS(ORYX_CONFIG.NAMESPACE_ORYX, 'minimumLength')
    if (minLengthAttr) {
      this.minimumLength = parseFloat(minLengthAttr)
    }

    var resizeAttr = this.element.getAttributeNS(ORYX_CONFIG.NAMESPACE_ORYX, 'resize')
    if (resizeAttr) {
      resizeAttr = resizeAttr.strip()
      this.resize = (resizeAttr.toLowerCase() === 'yes')
    } else {
      this.resize = false
    }

    //init SVGShape objects
    //this.svgShapes = this._getSVGShapes(this.element);
  }

  /**
   *
   */
  _getSVGShapes (svgElement) {
    if (svgElement.hasChildNodes) {
      let svgShapes = []
      let me = this
      $A(svgElement.childNodes).each(function (svgChild) {
        try {
          let svgShape = new SVGShape(svgChild)
          svgShapes.push(svgShape)
        } catch (e) {
          svgShapes = svgShapes.concat(me._getSVGShapes(svgChild))
        }
      })
      return svgShapes
    }
  }

  /**
   * Writes the changed values into the SVG marker.
   */
  update () {
    //TODO mache marker resizebar!!! aber erst wenn der rest der connectingshape funzt!

    //		//update marker attributes
    //		if(this.refX != this.oldRefX) {
    //			this.element.setAttributeNS(null, "refX", this.refX);
    //		}
    //		if(this.refY != this.oldRefY) {
    //			this.element.setAttributeNS(null, "refY", this.refY);
    //		}
    //		if(this.markerWidth != this.oldMarkerWidth) {
    //			this.element.setAttributeNS(null, "markerWidth", this.markerWidth);
    //		}
    //		if(this.markerHeight != this.oldMarkerHeight) {
    //			this.element.setAttributeNS(null, "markerHeight", this.markerHeight);
    //		}
    //
    //		//update SVGShape objects
    //		var widthDelta = this.markerWidth / this.oldMarkerWidth;
    //		var heightDelta = this.markerHeight / this.oldMarkerHeight;
    //		if(widthDelta != 1 && heightDelta != 1) {
    //			this.svgShapes.each(function(svgShape) {
    //
    //			});
    //		}

    //update old values to prepare the next update
    this.oldRefX = this.refX
    this.oldRefY = this.refY
    this.oldMarkerWidth = this.markerWidth
    this.oldMarkerHeight = this.markerHeight
  }

  toString () {
    return (this.element) ? 'SVGMarker ' + this.element.id : 'SVGMarker ' + this.element
  }
}