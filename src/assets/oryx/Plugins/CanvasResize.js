/**
 * This plugin is responsible for resizing the canvas.
 * @param {Object} facade The editor plugin facade to register enhancements with.
 */
export default class CanvasResize {
  constructor(facade) {

    this.facade = facade;
    new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(), "N", this.resize.bind(this));
    new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(), "W", this.resize.bind(this));
    new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(), "E", this.resize.bind(this));
    new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(), "S", this.resize.bind(this));

    window.setTimeout(function () {
      jQuery(window).trigger('resize');
    });

  }

  resize(position, shrink) {

    resizeCanvas = function (position, extentionSize, facade) {
      var canvas = facade.getCanvas();
      var b = canvas.bounds;
      var scrollNode = facade.getCanvas().getHTMLContainer().parentNode.parentNode;

      if (position == "E" || position == "W") {
        canvas.setSize({width: (b.width() + extentionSize) * canvas.zoomLevel, height: (b.height()) * canvas.zoomLevel})

      } else if (position == "S" || position == "N") {
        canvas.setSize({width: (b.width()) * canvas.zoomLevel, height: (b.height() + extentionSize) * canvas.zoomLevel})
      }

      if (position == "N" || position == "W") {

        var move = position == "N" ? {x: 0, y: extentionSize} : {x: extentionSize, y: 0};

        // Move all children
        canvas.getChildNodes(false, function (shape) {
          shape.bounds.moveBy(move)
        })
        // Move all dockers, when the edge has at least one docked shape
        var edges = canvas.getChildEdges().findAll(function (edge) {
          return edge.getAllDockedShapes().length > 0
        })
        var dockers = edges.collect(function (edge) {
          return edge.dockers.findAll(function (docker) {
            return !docker.getDockedShape()
          })
        }).flatten();
        dockers.each(function (docker) {
          docker.bounds.moveBy(move)
        })
      } else if (position == "S") {
        scrollNode.scrollTop += extentionSize;
      } else if (position == "E") {
        scrollNode.scrollLeft += extentionSize;
      }

      jQuery(window).trigger('resize');

      canvas.update();
      facade.updateSelection();
    }

    var commandClass = ORYX.Core.Command.extend({
      construct: function (position, extentionSize, facade) {
        this.position = position;
        this.extentionSize = extentionSize;
        this.facade = facade;
      },
      execute: function () {
        resizeCanvas(this.position, this.extentionSize, this.facade);
      },
      rollback: function () {
        resizeCanvas(this.position, -this.extentionSize, this.facade);
      },
      update: function () {
      }
    });

    var extentionSize = ORYX.CONFIG.CANVAS_RESIZE_INTERVAL;
    if (shrink) extentionSize = -extentionSize;
    var command = new commandClass(position, extentionSize, this.facade);

    this.facade.executeCommands([command]);

  }

}

