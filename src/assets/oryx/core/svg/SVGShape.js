import ORYX_CONFIG from '../../CONFIG'
import ORYX_Utils from '../../Utils'
import ORYX_Math from '../Math'
import EditPathHandler from './EditPathHandler'
import MinMaxPathHandler from './MinMaxPathHandler'
import PointsPathHandler from './PointsPathHandler'


/**
 * @classDescription 此类包装对SVG基本形状或路径的操作.
 * @namespace ORYX.Core.SVG
 * uses PathParser by Kevin Lindsey (http://kevlindev.com/)
 * uses MinMaxPathHandler
 * uses EditPathHandler
 */

export default class SVGShape {
  /**
   * @param svgElem {SVGElement} An SVGElement that is a basic shape or a path.
   */
  constructor (svgElem) {
    // arguments.callee.$.construct.apply(this, arguments);
    this.type = null
    this.element = svgElem
    this.x = undefined
    this.y = undefined
    this.width = undefined
    this.height = undefined
    this.oldX = undefined
    this.oldY = undefined
    this.oldWidth = undefined
    this.oldHeight = undefined
    this.radiusX = undefined
    this.radiusY = undefined
    this.isHorizontallyResizable = false
    this.isVerticallyResizable = false
    //this.anchors = [];
    this.anchorLeft = false
    this.anchorRight = false
    this.anchorTop = false
    this.anchorBottom = false

    // 边缘对象的路径元素属性
    this.allowDockers = true
    this.resizeMarkerMid = false

    this.editPathParser = null
    this.editPathHandler = null

    this.init()
  }
  /**
   * 初始化上面声明的所有属性。.
   */
  init () {
    /**initialize position and size*/
    if (ORYX_Utils.checkClassType(this.element, SVGRectElement) ||
      ORYX_Utils.checkClassType(this.element, SVGImageElement)) {
      this.type = 'Rect'

      const xAttr = this.element.getAttributeNS(null, 'x')
      if (xAttr) {
        this.oldX = parseFloat(xAttr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      const yAttr = this.element.getAttributeNS(null, 'y')
      if (yAttr) {
        this.oldY = parseFloat(yAttr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      const widthAttr = this.element.getAttributeNS(null, 'width')
      if (widthAttr) {
        this.oldWidth = parseFloat(widthAttr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      const heightAttr = this.element.getAttributeNS(null, 'height')
      if (heightAttr) {
        this.oldHeight = parseFloat(heightAttr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }

    } else if (ORYX_Utils.checkClassType(this.element, SVGCircleElement)) {
      this.type = 'Circle'

      let cx = undefined
      let cy = undefined
      //var r = undefined;

      const cxAttr = this.element.getAttributeNS(null, 'cx')
      if (cxAttr) {
        cx = parseFloat(cxAttr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      const cyAttr = this.element.getAttributeNS(null, 'cy')
      if (cyAttr) {
        cy = parseFloat(cyAttr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      const rAttr = this.element.getAttributeNS(null, 'r')
      if (rAttr) {
        //r = parseFloat(rAttr);
        this.radiusX = parseFloat(rAttr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      this.oldX = cx - this.radiusX
      this.oldY = cy - this.radiusX
      this.oldWidth = 2 * this.radiusX
      this.oldHeight = 2 * this.radiusX

    } else if (ORYX_Utils.checkClassType(this.element, SVGEllipseElement)) {
      this.type = 'Ellipse'

      let cx = undefined
      let cy = undefined
      const cxAttr = this.element.getAttributeNS(null, 'cx')
      if (cxAttr) {
        cx = parseFloat(cxAttr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      const cyAttr = this.element.getAttributeNS(null, 'cy')
      if (cyAttr) {
        cy = parseFloat(cyAttr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      const rxAttr = this.element.getAttributeNS(null, 'rx')
      if (rxAttr) {
        this.radiusX = parseFloat(rxAttr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      const ryAttr = this.element.getAttributeNS(null, 'ry')
      if (ryAttr) {
        this.radiusY = parseFloat(ryAttr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      this.oldX = cx - this.radiusX
      this.oldY = cy - this.radiusY
      this.oldWidth = 2 * this.radiusX
      this.oldHeight = 2 * this.radiusY

    } else if (ORYX_Utils.checkClassType(this.element, SVGLineElement)) {
      this.type = 'Line'

      let x1 = undefined
      let y1 = undefined
      let x2 = undefined
      let y2 = undefined
      const x1Attr = this.element.getAttributeNS(null, 'x1')
      if (x1Attr) {
        x1 = parseFloat(x1Attr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      const y1Attr = this.element.getAttributeNS(null, 'y1')
      if (y1Attr) {
        y1 = parseFloat(y1Attr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      const x2Attr = this.element.getAttributeNS(null, 'x2')
      if (x2Attr) {
        x2 = parseFloat(x2Attr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      const y2Attr = this.element.getAttributeNS(null, 'y2')
      if (y2Attr) {
        y2 = parseFloat(y2Attr)
      } else {
        throw 'Missing attribute in element ' + this.element
      }
      this.oldX = Math.min(x1, x2)
      this.oldY = Math.min(y1, y2)
      this.oldWidth = Math.abs(x1 - x2)
      this.oldHeight = Math.abs(y1 - y2)

    } else if (ORYX_Utils.checkClassType(this.element, SVGPolylineElement) ||
      ORYX_Utils.checkClassType(this.element, SVGPolygonElement)) {
      this.type = 'Polyline'

      let pointsArray = []
      if (this.element.points && this.element.points.numberOfItems) {
        for (let i = 0, size = this.element.points.numberOfItems; i < size; i++) {
          pointsArray.push(this.element.points.getItem(i).x)
          pointsArray.push(this.element.points.getItem(i).y)
        }
      } else {
        let points = this.element.getAttributeNS(null, 'points')
        if (points) {
          points = points.replace(/,/g, ' ')
          pointsArray = points.split(' ')
          pointsArray = pointsArray.without('')
        } else {
          throw 'Missing attribute in element ' + this.element
        }
      }

      if (pointsArray && pointsArray.length && pointsArray.length > 1) {
        let minX = parseFloat(pointsArray[0])
        let minY = parseFloat(pointsArray[1])
        let maxX = parseFloat(pointsArray[0])
        let maxY = parseFloat(pointsArray[1])

        for (let i = 0; i < pointsArray.length; i++) {
          minX = Math.min(minX, parseFloat(pointsArray[i]))
          maxX = Math.max(maxX, parseFloat(pointsArray[i]))
          i++
          minY = Math.min(minY, parseFloat(pointsArray[i]))
          maxY = Math.max(maxY, parseFloat(pointsArray[i]))
        }

        this.oldX = minX
        this.oldY = minY
        this.oldWidth = maxX - minX
        this.oldHeight = maxY - minY
      } else {
        throw 'Missing attribute in element ' + this.element
      }

    } else if (ORYX_Utils.checkClassType(this.element, SVGPathElement)) {
      this.type = 'Path'

      this.editPathParser = new PathParser()
      this.editPathHandler = new EditPathHandler()
      this.editPathParser.setHandler(this.editPathHandler)

      let parser = new PathParser()
      let handler = new MinMaxPathHandler()
      parser.setHandler(handler)
      parser.parsePath(this.element)

      this.oldX = handler.minX
      this.oldY = handler.minY
      this.oldWidth = handler.maxX - handler.minX
      this.oldHeight = handler.maxY - handler.minY

      // delete parser
      // delete handler
    } else {
      throw 'Element is not a shape.'
    }

    /** initialize attributes of oryx namespace */
      // resize
    let resizeAttr = this.element.getAttributeNS(ORYX_CONFIG.NAMESPACE_ORYX, 'resize')
    if (resizeAttr) {
      resizeAttr = resizeAttr.toLowerCase()
      if (resizeAttr.match(/horizontal/)) {
        this.isHorizontallyResizable = true
      } else {
        this.isHorizontallyResizable = false
      }
      if (resizeAttr.match(/vertical/)) {
        this.isVerticallyResizable = true
      } else {
        this.isVerticallyResizable = false
      }
    } else {
      this.isHorizontallyResizable = false
      this.isVerticallyResizable = false
    }

    // anchors
    let anchorAttr = this.element.getAttributeNS(ORYX_CONFIG.NAMESPACE_ORYX, 'anchors')
    if (anchorAttr) {
      anchorAttr = anchorAttr.replace('/,/g', ' ')
      const anchors = anchorAttr.split(' ').without('')

      for (let i = 0; i < anchors.length; i++) {
        switch (anchors[i].toLowerCase()) {
          case 'left':
            this.anchorLeft = true
            break
          case 'right':
            this.anchorRight = true
            break
          case 'top':
            this.anchorTop = true
            break
          case 'bottom':
            this.anchorBottom = true
            break
        }
      }
    }

    // allowDockers and resizeMarkerMid
    if (ORYX_Utils.checkClassType(this.element, SVGPathElement)) {
      const allowDockersAttr = this.element.getAttributeNS(ORYX_CONFIG.NAMESPACE_ORYX, 'allowDockers')
      if (allowDockersAttr) {
        if (allowDockersAttr.toLowerCase() === 'no') {
          this.allowDockers = false
        } else {
          this.allowDockers = true
        }
      }

      const resizeMarkerMidAttr = this.element.getAttributeNS(ORYX_CONFIG.NAMESPACE_ORYX, 'resizeMarker-mid')
      if (resizeMarkerMidAttr) {
        if (resizeMarkerMidAttr.toLowerCase() === 'yes') {
          this.resizeMarkerMid = true
        } else {
          this.resizeMarkerMid = false
        }
      }
    }

    this.x = this.oldX
    this.y = this.oldY
    this.width = this.oldWidth
    this.height = this.oldHeight
  }

  /**
   * Writes the changed values into the SVG element.
   */
  update () {
    if (this.x !== this.oldX || this.y !== this.oldY || this.width !== this.oldWidth || this.height !== this.oldHeight) {
      switch (this.type) {
        case 'Rect':
          if (this.x !== this.oldX) this.element.setAttributeNS(null, 'x', this.x)
          if (this.y !== this.oldY) this.element.setAttributeNS(null, 'y', this.y)
          if (this.width !== this.oldWidth) this.element.setAttributeNS(null, 'width', this.width)
          if (this.height !== this.oldHeight) this.element.setAttributeNS(null, 'height', this.height)
          break
        case 'Circle':
          //calculate the radius
          //var r;
          //					if(this.width/this.oldWidth <= this.height/this.oldHeight) {
          //						this.radiusX = ((this.width > this.height) ? this.width : this.height)/2.0;
          //					} else {
          this.radiusX = ((this.width < this.height) ? this.width : this.height) / 2.0
          //}

          this.element.setAttributeNS(null, 'cx', this.x + this.width / 2.0)
          this.element.setAttributeNS(null, 'cy', this.y + this.height / 2.0)
          this.element.setAttributeNS(null, 'r', this.radiusX)
          break
        case 'Ellipse':
          this.radiusX = this.width / 2
          this.radiusY = this.height / 2

          this.element.setAttributeNS(null, 'cx', this.x + this.radiusX)
          this.element.setAttributeNS(null, 'cy', this.y + this.radiusY)
          this.element.setAttributeNS(null, 'rx', this.radiusX)
          this.element.setAttributeNS(null, 'ry', this.radiusY)
          break
        case 'Line':
          if (this.x !== this.oldX)
            this.element.setAttributeNS(null, 'x1', this.x)

          if (this.y !== this.oldY)
            this.element.setAttributeNS(null, 'y1', this.y)

          if (this.x !== this.oldX || this.width !== this.oldWidth)
            this.element.setAttributeNS(null, 'x2', this.x + this.width)

          if (this.y !== this.oldY || this.height !== this.oldHeight)
            this.element.setAttributeNS(null, 'y2', this.y + this.height)
          break
        case 'Polyline':
          let points = this.element.getAttributeNS(null, 'points')
          if (points) {
            points = points.replace(/,/g, ' ').split(' ').without('')

            if (points && points.length && points.length > 1) {
              // TODO what if oldWidth == 0?
              let widthDelta = (this.oldWidth === 0) ? 0 : this.width / this.oldWidth
              let heightDelta = (this.oldHeight === 0) ? 0 : this.height / this.oldHeight

              let updatedPoints = ''
              for (let i = 0; i < points.length; i++) {
                let x = (parseFloat(points[i]) - this.oldX) * widthDelta + this.x
                i++
                let y = (parseFloat(points[i]) - this.oldY) * heightDelta + this.y
                updatedPoints += x + ' ' + y + ' '
              }
              this.element.setAttributeNS(null, 'points', updatedPoints)
            } else {
              // TODO error
            }
          } else {
            // TODO error
          }
          break
        case 'Path':
          // calculate scaling delta
          // TODO what if oldWidth == 0?
          let widthDelta = (this.oldWidth === 0) ? 0 : this.width / this.oldWidth
          let heightDelta = (this.oldHeight === 0) ? 0 : this.height / this.oldHeight

          // use path parser to edit each point of the path
          this.editPathHandler.init(this.x, this.y, this.oldX, this.oldY, widthDelta, heightDelta)
          this.editPathParser.parsePath(this.element)

          // change d attribute of path
          this.element.setAttributeNS(null, 'd', this.editPathHandler.d)
          break
      }

      this.oldX = this.x
      this.oldY = this.y
      this.oldWidth = this.width
      this.oldHeight = this.height
    }

    // Remove cached variables
    delete this.visible
    delete this.handler
  }

  isPointIncluded (pointX, pointY) {
    // Check if there are the right arguments and if the node is visible
    if (!pointX || !pointY || !this.isVisible()) {
      return false
    }

    switch (this.type) {
      case 'Rect':
        return (pointX >= this.x && pointX <= this.x + this.width &&
          pointY >= this.y && pointY <= this.y + this.height)
        break
      case 'Circle':
        //calculate the radius
        //				var r;
        //				if(this.width/this.oldWidth <= this.height/this.oldHeight) {
        //					r = ((this.width > this.height) ? this.width : this.height)/2.0;
        //				} else {
        //				 	r = ((this.width < this.height) ? this.width : this.height)/2.0;
        //				}
        return ORYX_Math.isPointInEllipse(pointX, pointY, this.x + this.width / 2.0, this.y + this.height / 2.0, this.radiusX, this.radiusX)
        break
      case 'Ellipse':
        return ORYX_Math.isPointInEllipse(pointX, pointY, this.x + this.radiusX, this.y + this.radiusY, this.radiusX, this.radiusY)
        break
      case 'Line':
        return ORYX_Math.isPointInLine(pointX, pointY, this.x, this.y, this.x + this.width, this.y + this.height)
        break
      case 'Polyline':
        let points = this.element.getAttributeNS(null, 'points')

        if (points) {
          points = points.replace(/,/g, ' ').split(' ').without('')

          points = points.collect(function (n) {
            return parseFloat(n)
          })

          return ORYX_Math.isPointInPolygone(pointX, pointY, points)
        } else {
          return false
        }
        break
      case 'Path':
        // Cache Path handler
        if (!this.handler) {
          let parser = new PathParser()
          this.handler = new PointsPathHandler()
          parser.setHandler(this.handler)
          parser.parsePath(this.element)
        }
        return ORYX_Math.isPointInPolygone(pointX, pointY, this.handler.points)

        break
      default:
        return false
    }
  }

  /**
   * Returns true if the element is visible
   * @param {SVGElement} elem
   * @return boolean
   */
  isVisible (elem) {
    if (this.visible !== undefined) {
      return this.visible
    }

    if (!elem) {
      elem = this.element
    }

    let hasOwnerSVG = false
    try {
      hasOwnerSVG = !!elem.ownerSVGElement
    } catch (e) {}

    // Is SVG context
    if (hasOwnerSVG) {
      // IF G-Element
      if (ORYX_Utils.checkClassType(elem, SVGGElement)) {
        if (elem.className && elem.className.baseVal == 'me') {
          this.visible = true
          return this.visible
        }
      }

      // Check if fill or stroke is set
      var fill = elem.getAttributeNS(null, 'fill')
      var stroke = elem.getAttributeNS(null, 'stroke')
      if (fill && fill == 'none' && stroke && stroke == 'none') {
        this.visible = false
      } else {
        // Check if displayed
        var attr = elem.getAttributeNS(null, 'display')
        if (!attr)
          this.visible = this.isVisible(elem.parentNode)
        else if (attr == 'none')
          this.visible = false
        else
          this.visible = true
      }
    } else {
      this.visible = true
    }

    return this.visible
  }

  toString () {
    return (this.element) ? 'SVGShape ' + this.element.id : 'SVGShape ' + this.element
  }
}