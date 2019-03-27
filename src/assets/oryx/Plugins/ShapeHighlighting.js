import ORYX_Config from '../CONFIG'
import ORYX_Utils from '../Utils'
import ORYX_Edge from '../core/Edge'


export default class ShapeHighlighting {
  constructor (facade) {
    this.parentNode = facade.getCanvas().getSvgContainer()
    // The parent Node
    this.node = ORYX_Utils.graft('http://www.w3.org/2000/svg', this.parentNode,
      ['g'])

    this.highlightNodes = {}
    facade.registerOnEvent(ORYX_Config.EVENT_HIGHLIGHT_SHOW, this.setHighlight.bind(this))
    facade.registerOnEvent(ORYX_Config.EVENT_HIGHLIGHT_HIDE, this.hideHighlight.bind(this))
  }

  setHighlight (options) {
    if (options && options.highlightId) {
      let node = this.highlightNodes[options.highlightId]

      if (!node) {
        node = ORYX_Utils.graft('http://www.w3.org/2000/svg', this.node,
          ['path', {
            'stroke-width': 2.0, 'fill': 'none'
          }])

        this.highlightNodes[options.highlightId] = node
      }

      if (options.elements && options.elements.length > 0) {
        this.setAttributesByStyle(node, options)
        this.show(node)
      } else {
        this.hide(node)
      }

    }
  }

  hideHighlight (options) {
    if (options && options.highlightId && this.highlightNodes[options.highlightId]) {
      this.hide(this.highlightNodes[options.highlightId])
    }
  }

  hide (node) {
    node.setAttributeNS(null, 'display', 'none')
  }

  show (node) {
    node.setAttributeNS(null, 'display', '')
  }

  setAttributesByStyle (node, options) {
    // If the style say, that it should look like a rectangle
    if (options.style && options.style == ORYX_Config.SELECTION_HIGHLIGHT_STYLE_RECTANGLE) {

      // Set like this
      let bo = options.elements[0].absoluteBounds()
      let strWidth = options.strokewidth ? options.strokewidth : ORYX_Config.BORDER_OFFSET

      node.setAttributeNS(null, 'd', this.getPathRectangle(bo.a, bo.b, strWidth))
      node.setAttributeNS(null, 'stroke', options.color ? options.color : ORYX_Config.SELECTION_HIGHLIGHT_COLOR)
      node.setAttributeNS(null, 'stroke-opacity', options.opacity ? options.opacity : 0.2)
      node.setAttributeNS(null, 'stroke-width', strWidth)

    } else if (options.elements.length == 1
      && options.elements[0] instanceof ORYX_Edge &&
      options.highlightId != 'selection') {

      /* Highlight containment of edge's childs */
      let path = this.getPathEdge(options.elements[0].dockers)
      if (path && path.length > 0) {
        node.setAttributeNS(null, 'd', path)
      }
      node.setAttributeNS(null, 'stroke', options.color ? options.color : ORYX_Config.SELECTION_HIGHLIGHT_COLOR)
      node.setAttributeNS(null, 'stroke-opacity', options.opacity ? options.opacity : 0.2)
      node.setAttributeNS(null, 'stroke-width', ORYX_Config.OFFSET_EDGE_BOUNDS)
    } else {
      // If not, set just the corners
      let path = this.getPathByElements(options.elements)
      if (path && path.length > 0) {
        node.setAttributeNS(null, 'd', path)
      }
      node.setAttributeNS(null, 'stroke', options.color ? options.color : ORYX_Config.SELECTION_HIGHLIGHT_COLOR)
      node.setAttributeNS(null, 'stroke-opacity', options.opacity ? options.opacity : 1.0)
      node.setAttributeNS(null, 'stroke-width', options.strokewidth ? options.strokewidth : 2.0)

    }
  }

  getPathByElements (elements) {
    if (!elements || elements.length <= 0) {
      return undefined
    }

    // Get the padding and the size
    let padding = ORYX_Config.SELECTED_AREA_PADDING
    let path = ''

    // Get thru all Elements
    elements.each((function (element) {
      if (!element) {
        return
      }
      // Get the absolute Bounds and the two Points
      let bounds = element.absoluteBounds()
      bounds.widen(padding)
      let a = bounds.upperLeft()
      let b = bounds.lowerRight()

      path = path + this.getPath(a, b)

    }).bind(this))

    return path
  }

  getPath (a, b) {
    return this.getPathCorners(a, b)
  }

  getPathCorners (a, b) {
    let size = ORYX_Config.SELECTION_HIGHLIGHT_SIZE
    let path = ''
    // Set: Upper left
    path = path + 'M' + a.x + ' ' + (a.y + size) + ' l0 -' + size + ' l' + size + ' 0 '
    // Set: Lower left
    path = path + 'M' + a.x + ' ' + (b.y - size) + ' l0 ' + size + ' l' + size + ' 0 '
    // Set: Lower right
    path = path + 'M' + b.x + ' ' + (b.y - size) + ' l0 ' + size + ' l-' + size + ' 0 '
    // Set: Upper right
    path = path + 'M' + b.x + ' ' + (a.y + size) + ' l0 -' + size + ' l-' + size + ' 0 '
    return path
  }

  getPathRectangle (a, b, strokeWidth) {
    let size = ORYX_Config.SELECTION_HIGHLIGHT_SIZE
    let path = ''
    let offset = strokeWidth / 2.0

    // Set: Upper left
    path = path + 'M' + (a.x + offset) + ' ' + (a.y)
    path = path + ' L' + (a.x + offset) + ' ' + (b.y - offset)
    path = path + ' L' + (b.x - offset) + ' ' + (b.y - offset)
    path = path + ' L' + (b.x - offset) + ' ' + (a.y + offset)
    path = path + ' L' + (a.x + offset) + ' ' + (a.y + offset)

    return path
  }

  getPathEdge (edgeDockers) {
    let length = edgeDockers.length
    let path = 'M' + edgeDockers[0].bounds.center().x + ' '
      + edgeDockers[0].bounds.center().y

    for (let i = 1; i < length; i++) {
      let dockerPoint = edgeDockers[i].bounds.center()
      path = path + ' L' + dockerPoint.x + ' ' + dockerPoint.y
    }

    return path
  }

}