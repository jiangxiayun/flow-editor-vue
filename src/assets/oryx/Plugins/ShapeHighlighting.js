export default class ShapeHighlighting {

  constructor (facade) {

    this.parentNode = facade.getCanvas().getSvgContainer();

    // The parent Node
    this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.parentNode,
      ['g']);

    this.highlightNodes = {};

    facade.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, this.setHighlight.bind(this));
    facade.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, this.hideHighlight.bind(this));

  }

  setHighlight (options) {
    if (options && options.highlightId) {
      var node = this.highlightNodes[options.highlightId];

      if (!node) {
        node = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node,
          ['path', {
            "stroke-width": 2.0, "fill": "none"
          }]);

        this.highlightNodes[options.highlightId] = node;
      }

      if (options.elements && options.elements.length > 0) {

        this.setAttributesByStyle(node, options);
        this.show(node);

      } else {

        this.hide(node);

      }

    }
  }

  hideHighlight (options) {
    if (options && options.highlightId && this.highlightNodes[options.highlightId]) {
      this.hide(this.highlightNodes[options.highlightId]);
    }
  }

  hide (node) {
    node.setAttributeNS(null, 'display', 'none');
  }

  show (node) {
    node.setAttributeNS(null, 'display', '');
  }

  setAttributesByStyle (node, options) {

    // If the style say, that it should look like a rectangle
    if (options.style && options.style == ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE) {

      // Set like this
      var bo = options.elements[0].absoluteBounds();

      var strWidth = options.strokewidth ? options.strokewidth : ORYX.CONFIG.BORDER_OFFSET

      node.setAttributeNS(null, "d", this.getPathRectangle(bo.a, bo.b, strWidth));
      node.setAttributeNS(null, "stroke", options.color ? options.color : ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
      node.setAttributeNS(null, "stroke-opacity", options.opacity ? options.opacity : 0.2);
      node.setAttributeNS(null, "stroke-width", strWidth);

    } else if (options.elements.length == 1
      && options.elements[0] instanceof ORYX.Core.Edge &&
      options.highlightId != "selection") {

      /* Highlight containment of edge's childs */
      var path = this.getPathEdge(options.elements[0].dockers);
      if (path && path.length > 0) {
        node.setAttributeNS(null, "d", path);
      }
      node.setAttributeNS(null, "stroke", options.color ? options.color : ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
      node.setAttributeNS(null, "stroke-opacity", options.opacity ? options.opacity : 0.2);
      node.setAttributeNS(null, "stroke-width", ORYX.CONFIG.OFFSET_EDGE_BOUNDS);

    } else {
      // If not, set just the corners
      var path = this.getPathByElements(options.elements);
      if (path && path.length > 0) {
        node.setAttributeNS(null, "d", path);
      }
      node.setAttributeNS(null, "stroke", options.color ? options.color : ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
      node.setAttributeNS(null, "stroke-opacity", options.opacity ? options.opacity : 1.0);
      node.setAttributeNS(null, "stroke-width", options.strokewidth ? options.strokewidth : 2.0);

    }
  }

  getPathByElements (elements) {
    if (!elements || elements.length <= 0) {
      return undefined
    }

    // Get the padding and the size
    var padding = ORYX.CONFIG.SELECTED_AREA_PADDING;

    var path = ""

    // Get thru all Elements
    elements.each((function (element) {
      if (!element) {
        return
      }
      // Get the absolute Bounds and the two Points
      var bounds = element.absoluteBounds();
      bounds.widen(padding)
      var a = bounds.upperLeft();
      var b = bounds.lowerRight();

      path = path + this.getPath(a, b);

    }).bind(this));

    return path;

  }

  getPath(a, b) {

    return this.getPathCorners(a, b);

  }

  getPathCorners (a, b) {

    var size = ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;

    var path = ""

    // Set: Upper left
    path = path + "M" + a.x + " " + (a.y + size) + " l0 -" + size + " l" + size + " 0 ";
    // Set: Lower left
    path = path + "M" + a.x + " " + (b.y - size) + " l0 " + size + " l" + size + " 0 ";
    // Set: Lower right
    path = path + "M" + b.x + " " + (b.y - size) + " l0 " + size + " l-" + size + " 0 ";
    // Set: Upper right
    path = path + "M" + b.x + " " + (a.y + size) + " l0 -" + size + " l-" + size + " 0 ";

    return path;
  }

  getPathRectangle (a, b, strokeWidth) {

    var size = ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;

    var path = ""
    var offset = strokeWidth / 2.0;

    // Set: Upper left
    path = path + "M" + (a.x + offset) + " " + (a.y);
    path = path + " L" + (a.x + offset) + " " + (b.y - offset);
    path = path + " L" + (b.x - offset) + " " + (b.y - offset);
    path = path + " L" + (b.x - offset) + " " + (a.y + offset);
    path = path + " L" + (a.x + offset) + " " + (a.y + offset);

    return path;
  }

  getPathEdge (edgeDockers) {
    var length = edgeDockers.length;
    var path = "M" + edgeDockers[0].bounds.center().x + " "
      + edgeDockers[0].bounds.center().y;

    for (i = 1; i < length; i++) {
      var dockerPoint = edgeDockers[i].bounds.center();
      path = path + " L" + dockerPoint.x + " " + dockerPoint.y;
    }

    return path;
  }

}