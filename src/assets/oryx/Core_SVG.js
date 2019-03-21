/**
 * Init namespaces
 */
if (!ORYX) {
  var ORYX = {};
}
if (!ORYX.Core) {
  ORYX.Core = {};
}
if (!ORYX.Core.SVG) {
  ORYX.Core.SVG = {};
}


/**
 * EditPathHandler
 *
 * Edit SVG paths' coordinates according to specified from-to movement and
 * horizontal and vertical scaling factors.
 * The resulting path's d attribute is stored in instance variable d.
 *
 * @constructor
 */
ORYX.Core.SVG.EditPathHandler = Clazz.extend({

  construct: function () {
    arguments.callee.$.construct.apply(this, arguments);
    this.x = 0;
    this.y = 0;
    this.oldX = 0;
    this.oldY = 0;
    this.deltaWidth = 1;
    this.deltaHeight = 1;
    this.d = "";
  },

  /**
   * init
   *
   * @param {float} x Target point's x-coordinate
   * @param {float} y Target point's y-coordinate
   * @param {float} oldX Reference point's x-coordinate
   * @param {float} oldY Reference point's y-coordinate
   * @param {float} deltaWidth Horizontal scaling factor
   * @param {float} deltaHeight Vertical scaling factor
   */
  init: function (x, y, oldX, oldY, deltaWidth, deltaHeight) {
    this.x = x;
    this.y = y;
    this.oldX = oldX;
    this.oldY = oldY;
    this.deltaWidth = deltaWidth;
    this.deltaHeight = deltaHeight;

    this.d = "";
  },

  /**
   * editPointsAbs
   *
   * @param {Array} points Array of absolutePoints
   */
  editPointsAbs: function (points) {
    if (points instanceof Array) {
      var newPoints = [];
      var x, y;
      for (var i = 0; i < points.length; i++) {
        x = (parseFloat(points[i]) - this.oldX) * this.deltaWidth + this.x;
        i++;
        y = (parseFloat(points[i]) - this.oldY) * this.deltaHeight + this.y;
        newPoints.push(x);
        newPoints.push(y);
      }

      return newPoints;
    } else {
      //TODO error
    }
  },

  /**
   * editPointsRel
   *
   * @param {Array} points Array of absolutePoints
   */
  editPointsRel: function (points) {
    if (points instanceof Array) {
      var newPoints = [];
      var x, y;
      for (var i = 0; i < points.length; i++) {
        x = parseFloat(points[i]) * this.deltaWidth;
        i++;
        y = parseFloat(points[i]) * this.deltaHeight;
        newPoints.push(x);
        newPoints.push(y);
      }

      return newPoints;
    } else {
      //TODO error
    }
  },

  /**
   * arcAbs - A
   *
   * @param {Number} rx
   * @param {Number} ry
   * @param {Number} xAxisRotation
   * @param {Boolean} largeArcFlag
   * @param {Boolean} sweepFlag
   * @param {Number} x
   * @param {Number} y
   */
  arcAbs: function (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    var pointsAbs = this.editPointsAbs([x, y]);
    var pointsRel = this.editPointsRel([rx, ry]);

    this.d = this.d.concat(" A" + pointsRel[0] + " " + pointsRel[1] +
      " " + xAxisRotation + " " + largeArcFlag +
      " " + sweepFlag + " " + pointsAbs[0] + " " +
      pointsAbs[1] + " ");
  },

  /**
   * arcRel - a
   *
   * @param {Number} rx
   * @param {Number} ry
   * @param {Number} xAxisRotation
   * @param {Boolean} largeArcFlag
   * @param {Boolean} sweepFlag
   * @param {Number} x
   * @param {Number} y
   */
  arcRel: function (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    var pointsRel = this.editPointsRel([rx, ry, x, y]);

    this.d = this.d.concat(" a" + pointsRel[0] + " " + pointsRel[1] +
      " " + xAxisRotation + " " + largeArcFlag +
      " " + sweepFlag + " " + pointsRel[2] + " " +
      pointsRel[3] + " ");
  },

  /**
   * curvetoCubicAbs - C
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicAbs: function (x1, y1, x2, y2, x, y) {
    var pointsAbs = this.editPointsAbs([x1, y1, x2, y2, x, y]);

    this.d = this.d.concat(" C" + pointsAbs[0] + " " + pointsAbs[1] +
      " " + pointsAbs[2] + " " + pointsAbs[3] +
      " " + pointsAbs[4] + " " + pointsAbs[5] + " ");
  },

  /**
   * curvetoCubicRel - c
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicRel: function (x1, y1, x2, y2, x, y) {
    var pointsRel = this.editPointsRel([x1, y1, x2, y2, x, y]);

    this.d = this.d.concat(" c" + pointsRel[0] + " " + pointsRel[1] +
      " " + pointsRel[2] + " " + pointsRel[3] +
      " " + pointsRel[4] + " " + pointsRel[5] + " ");
  },

  /**
   * linetoHorizontalAbs - H
   *
   * @param {Number} x
   */
  linetoHorizontalAbs: function (x) {
    var pointsAbs = this.editPointsAbs([x, 0]);

    this.d = this.d.concat(" H" + pointsAbs[0] + " ");
  },

  /**
   * linetoHorizontalRel - h
   *
   * @param {Number} x
   */
  linetoHorizontalRel: function (x) {
    var pointsRel = this.editPointsRel([x, 0]);

    this.d = this.d.concat(" h" + pointsRel[0] + " ");
  },

  /**
   * linetoAbs - L
   *
   * @param {Number} x
   * @param {Number} y
   */
  linetoAbs: function (x, y) {
    var pointsAbs = this.editPointsAbs([x, y]);

    this.d = this.d.concat(" L" + pointsAbs[0] + " " + pointsAbs[1] + " ");
  },

  /**
   * linetoRel - l
   *
   * @param {Number} x
   * @param {Number} y
   */
  linetoRel: function (x, y) {
    var pointsRel = this.editPointsRel([x, y]);

    this.d = this.d.concat(" l" + pointsRel[0] + " " + pointsRel[1] + " ");
  },

  /**
   * movetoAbs - M
   *
   * @param {Number} x
   * @param {Number} y
   */
  movetoAbs: function (x, y) {
    var pointsAbs = this.editPointsAbs([x, y]);

    this.d = this.d.concat(" M" + pointsAbs[0] + " " + pointsAbs[1] + " ");
  },

  /**
   * movetoRel - m
   *
   * @param {Number} x
   * @param {Number} y
   */
  movetoRel: function (x, y) {
    var pointsRel;
    if (this.d === "") {
      pointsRel = this.editPointsAbs([x, y]);
    } else {
      pointsRel = this.editPointsRel([x, y]);
    }

    this.d = this.d.concat(" m" + pointsRel[0] + " " + pointsRel[1] + " ");
  },

  /**
   * curvetoQuadraticAbs - Q
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticAbs: function (x1, y1, x, y) {
    var pointsAbs = this.editPointsAbs([x1, y1, x, y]);

    this.d = this.d.concat(" Q" + pointsAbs[0] + " " + pointsAbs[1] + " " +
      pointsAbs[2] + " " + pointsAbs[3] + " ");
  },

  /**
   * curvetoQuadraticRel - q
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticRel: function (x1, y1, x, y) {
    var pointsRel = this.editPointsRel([x1, y1, x, y]);

    this.d = this.d.concat(" q" + pointsRel[0] + " " + pointsRel[1] + " " +
      pointsRel[2] + " " + pointsRel[3] + " ");
  },

  /**
   * curvetoCubicSmoothAbs - S
   *
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicSmoothAbs: function (x2, y2, x, y) {
    var pointsAbs = this.editPointsAbs([x2, y2, x, y]);

    this.d = this.d.concat(" S" + pointsAbs[0] + " " + pointsAbs[1] + " " +
      pointsAbs[2] + " " + pointsAbs[3] + " ");
  },

  /**
   * curvetoCubicSmoothRel - s
   *
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicSmoothRel: function (x2, y2, x, y) {
    var pointsRel = this.editPointsRel([x2, y2, x, y]);

    this.d = this.d.concat(" s" + pointsRel[0] + " " + pointsRel[1] + " " +
      pointsRel[2] + " " + pointsRel[3] + " ");
  },

  /**
   * curvetoQuadraticSmoothAbs - T
   *
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticSmoothAbs: function (x, y) {
    var pointsAbs = this.editPointsAbs([x, y]);

    this.d = this.d.concat(" T" + pointsAbs[0] + " " + pointsAbs[1] + " ");
  },

  /**
   * curvetoQuadraticSmoothRel - t
   *
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticSmoothRel: function (x, y) {
    var pointsRel = this.editPointsRel([x, y]);

    this.d = this.d.concat(" t" + pointsRel[0] + " " + pointsRel[1] + " ");
  },

  /**
   * linetoVerticalAbs - V
   *
   * @param {Number} y
   */
  linetoVerticalAbs: function (y) {
    var pointsAbs = this.editPointsAbs([0, y]);

    this.d = this.d.concat(" V" + pointsAbs[1] + " ");
  },

  /**
   * linetoVerticalRel - v
   *
   * @param {Number} y
   */
  linetoVerticalRel: function (y) {
    var pointsRel = this.editPointsRel([0, y]);

    this.d = this.d.concat(" v" + pointsRel[1] + " ");
  },

  /**
   * closePath - z or Z
   */
  closePath: function () {
    this.d = this.d.concat(" z");
  }

});

/**
 * MinMaxPathHandler
 *
 * Determine the minimum and maximum of a SVG path's absolute coordinates.
 * For relative coordinates the absolute value is computed for consideration.
 * The values are stored in attributes minX, minY, maxX, and maxY.
 *
 * @constructor
 */
ORYX.Core.SVG.MinMaxPathHandler = Clazz.extend({
  construct: function () {
    arguments.callee.$.construct.apply(this, arguments);

    this.minX = undefined;
    this.minY = undefined;
    this.maxX = undefined;
    this.maxY = undefined;

    this._lastAbsX = undefined;
    this._lastAbsY = undefined;
  },

  /**
   * Store minimal and maximal coordinates of passed points to attributes minX, maxX, minY, maxY
   *
   * @param {Array} points Array of absolutePoints
   */
  calculateMinMax: function (points) {
    if (points instanceof Array) {
      var x, y;
      for (var i = 0; i < points.length; i++) {
        x = parseFloat(points[i]);
        i++;
        y = parseFloat(points[i]);

        this.minX = (this.minX !== undefined) ? Math.min(this.minX, x) : x;
        this.maxX = (this.maxX !== undefined) ? Math.max(this.maxX, x) : x;
        this.minY = (this.minY !== undefined) ? Math.min(this.minY, y) : y;
        this.maxY = (this.maxY !== undefined) ? Math.max(this.maxY, y) : y;

        this._lastAbsX = x;
        this._lastAbsY = y;
      }
    } else {
      //TODO error
    }
  },

  /**
   * arcAbs - A
   *
   * @param {Number} rx
   * @param {Number} ry
   * @param {Number} xAxisRotation
   * @param {Boolean} largeArcFlag
   * @param {Boolean} sweepFlag
   * @param {Number} x
   * @param {Number} y
   */
  arcAbs: function (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    this.calculateMinMax([x, y]);
  },

  /**
   * arcRel - a
   *
   * @param {Number} rx
   * @param {Number} ry
   * @param {Number} xAxisRotation
   * @param {Boolean} largeArcFlag
   * @param {Boolean} sweepFlag
   * @param {Number} x
   * @param {Number} y
   */
  arcRel: function (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    this.calculateMinMax([this._lastAbsX + x, this._lastAbsY + y]);
  },

  /**
   * curvetoCubicAbs - C
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicAbs: function (x1, y1, x2, y2, x, y) {
    this.calculateMinMax([x1, y1, x2, y2, x, y]);
  },

  /**
   * curvetoCubicRel - c
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicRel: function (x1, y1, x2, y2, x, y) {
    this.calculateMinMax([this._lastAbsX + x1, this._lastAbsY + y1,
      this._lastAbsX + x2, this._lastAbsY + y2,
      this._lastAbsX + x, this._lastAbsY + y]);
  },

  /**
   * linetoHorizontalAbs - H
   *
   * @param {Number} x
   */
  linetoHorizontalAbs: function (x) {
    this.calculateMinMax([x, this._lastAbsY]);
  },

  /**
   * linetoHorizontalRel - h
   *
   * @param {Number} x
   */
  linetoHorizontalRel: function (x) {
    this.calculateMinMax([this._lastAbsX + x, this._lastAbsY]);
  },

  /**
   * linetoAbs - L
   *
   * @param {Number} x
   * @param {Number} y
   */
  linetoAbs: function (x, y) {
    this.calculateMinMax([x, y]);
  },

  /**
   * linetoRel - l
   *
   * @param {Number} x
   * @param {Number} y
   */
  linetoRel: function (x, y) {
    this.calculateMinMax([this._lastAbsX + x, this._lastAbsY + y]);
  },

  /**
   * movetoAbs - M
   *
   * @param {Number} x
   * @param {Number} y
   */
  movetoAbs: function (x, y) {
    this.calculateMinMax([x, y]);
  },

  /**
   * movetoRel - m
   *
   * @param {Number} x
   * @param {Number} y
   */
  movetoRel: function (x, y) {
    if (this._lastAbsX && this._lastAbsY) {
      this.calculateMinMax([this._lastAbsX + x, this._lastAbsY + y]);
    } else {
      this.calculateMinMax([x, y]);
    }
  },

  /**
   * curvetoQuadraticAbs - Q
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticAbs: function (x1, y1, x, y) {
    this.calculateMinMax([x1, y1, x, y]);
  },

  /**
   * curvetoQuadraticRel - q
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticRel: function (x1, y1, x, y) {
    this.calculateMinMax([this._lastAbsX + x1, this._lastAbsY + y1, this._lastAbsX + x, this._lastAbsY + y]);
  },

  /**
   * curvetoCubicSmoothAbs - S
   *
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicSmoothAbs: function (x2, y2, x, y) {
    this.calculateMinMax([x2, y2, x, y]);
  },

  /**
   * curvetoCubicSmoothRel - s
   *
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicSmoothRel: function (x2, y2, x, y) {
    this.calculateMinMax([this._lastAbsX + x2, this._lastAbsY + y2, this._lastAbsX + x, this._lastAbsY + y]);
  },

  /**
   * curvetoQuadraticSmoothAbs - T
   *
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticSmoothAbs: function (x, y) {
    this.calculateMinMax([x, y]);
  },

  /**
   * curvetoQuadraticSmoothRel - t
   *
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticSmoothRel: function (x, y) {
    this.calculateMinMax([this._lastAbsX + x, this._lastAbsY + y]);
  },

  /**
   * linetoVerticalAbs - V
   *
   * @param {Number} y
   */
  linetoVerticalAbs: function (y) {
    this.calculateMinMax([this._lastAbsX, y]);
  },

  /**
   * linetoVerticalRel - v
   *
   * @param {Number} y
   */
  linetoVerticalRel: function (y) {
    this.calculateMinMax([this._lastAbsX, this._lastAbsY + y]);
  },

  /**
   * closePath - z or Z
   */
  closePath: function () {
    return;// do nothing
  }

});

/**
 * PathHandler
 *
 * Determine absolute points of a SVG path. The coordinates are stored
 * sequentially in the attribute points (x-coordinates at even indices,
 * y-coordinates at odd indices).
 *
 * @constructor
 */
ORYX.Core.SVG.PointsPathHandler = Clazz.extend({
  construct: function () {
    arguments.callee.$.construct.apply(this, arguments);

    this.points = [];

    this._lastAbsX = undefined;
    this._lastAbsY = undefined;
  },

  /**
   * addPoints
   *
   * @param {Array} points Array of absolutePoints
   */
  addPoints: function (points) {
    if (points instanceof Array) {
      var x, y;
      for (var i = 0; i < points.length; i++) {
        x = parseFloat(points[i]);
        i++;
        y = parseFloat(points[i]);

        this.points.push(x);
        this.points.push(y);
        //this.points.push({x:x, y:y});

        this._lastAbsX = x;
        this._lastAbsY = y;
      }
    } else {
      //TODO error
    }
  },

  /**
   * arcAbs - A
   *
   * @param {Number} rx
   * @param {Number} ry
   * @param {Number} xAxisRotation
   * @param {Boolean} largeArcFlag
   * @param {Boolean} sweepFlag
   * @param {Number} x
   * @param {Number} y
   */
  arcAbs: function (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    this.addPoints([x, y]);
  },

  /**
   * arcRel - a
   *
   * @param {Number} rx
   * @param {Number} ry
   * @param {Number} xAxisRotation
   * @param {Boolean} largeArcFlag
   * @param {Boolean} sweepFlag
   * @param {Number} x
   * @param {Number} y
   */
  arcRel: function (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
  },

  /**
   * curvetoCubicAbs - C
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicAbs: function (x1, y1, x2, y2, x, y) {
    this.addPoints([x, y]);
  },

  /**
   * curvetoCubicRel - c
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicRel: function (x1, y1, x2, y2, x, y) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
  },

  /**
   * linetoHorizontalAbs - H
   *
   * @param {Number} x
   */
  linetoHorizontalAbs: function (x) {
    this.addPoints([x, this._lastAbsY]);
  },

  /**
   * linetoHorizontalRel - h
   *
   * @param {Number} x
   */
  linetoHorizontalRel: function (x) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY]);
  },

  /**
   * linetoAbs - L
   *
   * @param {Number} x
   * @param {Number} y
   */
  linetoAbs: function (x, y) {
    this.addPoints([x, y]);
  },

  /**
   * linetoRel - l
   *
   * @param {Number} x
   * @param {Number} y
   */
  linetoRel: function (x, y) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
  },

  /**
   * movetoAbs - M
   *
   * @param {Number} x
   * @param {Number} y
   */
  movetoAbs: function (x, y) {
    this.addPoints([x, y]);
  },

  /**
   * movetoRel - m
   *
   * @param {Number} x
   * @param {Number} y
   */
  movetoRel: function (x, y) {
    if (this._lastAbsX && this._lastAbsY) {
      this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
    } else {
      this.addPoints([x, y]);
    }
  },

  /**
   * curvetoQuadraticAbs - Q
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticAbs: function (x1, y1, x, y) {
    this.addPoints([x, y]);
  },

  /**
   * curvetoQuadraticRel - q
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticRel: function (x1, y1, x, y) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
  },

  /**
   * curvetoCubicSmoothAbs - S
   *
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicSmoothAbs: function (x2, y2, x, y) {
    this.addPoints([x, y]);
  },

  /**
   * curvetoCubicSmoothRel - s
   *
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicSmoothRel: function (x2, y2, x, y) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
  },

  /**
   * curvetoQuadraticSmoothAbs - T
   *
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticSmoothAbs: function (x, y) {
    this.addPoints([x, y]);
  },

  /**
   * curvetoQuadraticSmoothRel - t
   *
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticSmoothRel: function (x, y) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY + y]);
  },

  /**
   * linetoVerticalAbs - V
   *
   * @param {Number} y
   */
  linetoVerticalAbs: function (y) {
    this.addPoints([this._lastAbsX, y]);
  },

  /**
   * linetoVerticalRel - v
   *
   * @param {Number} y
   */
  linetoVerticalRel: function (y) {
    this.addPoints([this._lastAbsX, this._lastAbsY + y]);
  },

  /**
   * closePath - z or Z
   */
  closePath: function () {
    return;// do nothing
  }

});


/**
 *
 * Config variables
 */
NAMESPACE_ORYX = "http://www.b3mn.org/oryx";
NAMESPACE_SVG = "http://www.w3.org/2000/svg/";

/**
 * @classDescription This class wraps the manipulation of a SVG marker.
 * @namespace ORYX.Core.SVG
 * uses Inheritance (Clazz)
 * uses Prototype 1.5.0
 *
 */


ORYX.Core.SVG.SVGMarker = Clazz.extend({
  /**
   * Constructor
   * @param markerElement {SVGMarkerElement}
   */
  construct: function (markerElement) {
    arguments.callee.$.construct.apply(this, arguments);

    this.id = undefined;
    this.element = markerElement;
    this.refX = undefined;
    this.refY = undefined;
    this.markerWidth = undefined;
    this.markerHeight = undefined;
    this.oldRefX = undefined;
    this.oldRefY = undefined;
    this.oldMarkerWidth = undefined;
    this.oldMarkerHeight = undefined;
    this.optional = false;
    this.enabled = true;
    this.minimumLength = undefined;
    this.resize = false;

    this.svgShapes = [];

    this._init(); //initialisation of all the properties declared above.
  },

  /**
   * Initializes the values that are defined in the constructor.
   */
  _init: function () {
    //check if this.element is a SVGMarkerElement
    if (!(this.element == "[object SVGMarkerElement]")) {
      throw "SVGMarker: Argument is not an instance of SVGMarkerElement.";
    }

    this.id = this.element.getAttributeNS(null, "id");

    //init svg marker attributes
    var refXValue = this.element.getAttributeNS(null, "refX");
    if (refXValue) {
      this.refX = parseFloat(refXValue);
    } else {
      this.refX = 0;
    }
    var refYValue = this.element.getAttributeNS(null, "refY");
    if (refYValue) {
      this.refY = parseFloat(refYValue);
    } else {
      this.refY = 0;
    }
    var markerWidthValue = this.element.getAttributeNS(null, "markerWidth");
    if (markerWidthValue) {
      this.markerWidth = parseFloat(markerWidthValue);
    } else {
      this.markerWidth = 3;
    }
    var markerHeightValue = this.element.getAttributeNS(null, "markerHeight");
    if (markerHeightValue) {
      this.markerHeight = parseFloat(markerHeightValue);
    } else {
      this.markerHeight = 3;
    }

    this.oldRefX = this.refX;
    this.oldRefY = this.refY;
    this.oldMarkerWidth = this.markerWidth;
    this.oldMarkerHeight = this.markerHeight;

    //init oryx attributes
    var optionalAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "optional");
    if (optionalAttr) {
      optionalAttr = optionalAttr.strip();
      this.optional = (optionalAttr.toLowerCase() === "yes");
    } else {
      this.optional = false;
    }

    var enabledAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "enabled");
    if (enabledAttr) {
      enabledAttr = enabledAttr.strip();
      this.enabled = !(enabledAttr.toLowerCase() === "no");
    } else {
      this.enabled = true;
    }

    var minLengthAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "minimumLength");
    if (minLengthAttr) {
      this.minimumLength = parseFloat(minLengthAttr);
    }

    var resizeAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "resize");
    if (resizeAttr) {
      resizeAttr = resizeAttr.strip();
      this.resize = (resizeAttr.toLowerCase() === "yes");
    } else {
      this.resize = false;
    }

    //init SVGShape objects
    //this.svgShapes = this._getSVGShapes(this.element);
  },

  /**
   *
   */
  _getSVGShapes: function (svgElement) {
    if (svgElement.hasChildNodes) {
      var svgShapes = [];
      var me = this;
      $A(svgElement.childNodes).each(function (svgChild) {
        try {
          var svgShape = new ORYX.Core.SVG.SVGShape(svgChild);
          svgShapes.push(svgShape);
        } catch (e) {
          svgShapes = svgShapes.concat(me._getSVGShapes(svgChild));
        }
      });
      return svgShapes;
    }
  },

  /**
   * Writes the changed values into the SVG marker.
   */
  update: function () {
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
    this.oldRefX = this.refX;
    this.oldRefY = this.refY;
    this.oldMarkerWidth = this.markerWidth;
    this.oldMarkerHeight = this.markerHeight;
  },

  toString: function () {
    return (this.element) ? "SVGMarker " + this.element.id : "SVGMarker " + this.element;
  }
});

/**
 * @classDescription This class wraps the manipulation of a SVG basic shape or a path.
 * @namespace ORYX.Core.SVG
 * uses Inheritance (Clazz)
 * uses Prototype 1.5.0
 * uses PathParser by Kevin Lindsey (http://kevlindev.com/)
 * uses MinMaxPathHandler
 * uses EditPathHandler
 *
 */


ORYX.Core.SVG.SVGShape = Clazz.extend({
  /**
   * Constructor
   * @param svgElem {SVGElement} An SVGElement that is a basic shape or a path.
   */
  construct: function (svgElem) {
    arguments.callee.$.construct.apply(this, arguments);

    this.type;
    this.element = svgElem;
    this.x = undefined;
    this.y = undefined;
    this.width = undefined;
    this.height = undefined;
    this.oldX = undefined;
    this.oldY = undefined;
    this.oldWidth = undefined;
    this.oldHeight = undefined;
    this.radiusX = undefined;
    this.radiusY = undefined;
    this.isHorizontallyResizable = false;
    this.isVerticallyResizable = false;
    //this.anchors = [];
    this.anchorLeft = false;
    this.anchorRight = false;
    this.anchorTop = false;
    this.anchorBottom = false;

    //attributes of path elements of edge objects
    this.allowDockers = true;
    this.resizeMarkerMid = false;

    this.editPathParser;
    this.editPathHandler;

    this.init(); //initialisation of all the properties declared above.
  },

  /**
   * Initializes the values that are defined in the constructor.
   */
  init: function () {

    /**initialize position and size*/
    if (ORYX.Editor.checkClassType(this.element, SVGRectElement) || ORYX.Editor.checkClassType(this.element, SVGImageElement)) {
      this.type = "Rect";

      var xAttr = this.element.getAttributeNS(null, "x");
      if (xAttr) {
        this.oldX = parseFloat(xAttr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      var yAttr = this.element.getAttributeNS(null, "y");
      if (yAttr) {
        this.oldY = parseFloat(yAttr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      var widthAttr = this.element.getAttributeNS(null, "width");
      if (widthAttr) {
        this.oldWidth = parseFloat(widthAttr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      var heightAttr = this.element.getAttributeNS(null, "height");
      if (heightAttr) {
        this.oldHeight = parseFloat(heightAttr);
      } else {
        throw "Missing attribute in element " + this.element;
      }

    } else if (ORYX.Editor.checkClassType(this.element, SVGCircleElement)) {
      this.type = "Circle";

      var cx = undefined;
      var cy = undefined;
      //var r = undefined;

      var cxAttr = this.element.getAttributeNS(null, "cx");
      if (cxAttr) {
        cx = parseFloat(cxAttr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      var cyAttr = this.element.getAttributeNS(null, "cy");
      if (cyAttr) {
        cy = parseFloat(cyAttr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      var rAttr = this.element.getAttributeNS(null, "r");
      if (rAttr) {
        //r = parseFloat(rAttr);
        this.radiusX = parseFloat(rAttr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      this.oldX = cx - this.radiusX;
      this.oldY = cy - this.radiusX;
      this.oldWidth = 2 * this.radiusX;
      this.oldHeight = 2 * this.radiusX;

    } else if (ORYX.Editor.checkClassType(this.element, SVGEllipseElement)) {
      this.type = "Ellipse";

      var cx = undefined;
      var cy = undefined;
      //var rx = undefined;
      //var ry = undefined;
      var cxAttr = this.element.getAttributeNS(null, "cx");
      if (cxAttr) {
        cx = parseFloat(cxAttr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      var cyAttr = this.element.getAttributeNS(null, "cy");
      if (cyAttr) {
        cy = parseFloat(cyAttr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      var rxAttr = this.element.getAttributeNS(null, "rx");
      if (rxAttr) {
        this.radiusX = parseFloat(rxAttr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      var ryAttr = this.element.getAttributeNS(null, "ry");
      if (ryAttr) {
        this.radiusY = parseFloat(ryAttr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      this.oldX = cx - this.radiusX;
      this.oldY = cy - this.radiusY;
      this.oldWidth = 2 * this.radiusX;
      this.oldHeight = 2 * this.radiusY;

    } else if (ORYX.Editor.checkClassType(this.element, SVGLineElement)) {
      this.type = "Line";

      var x1 = undefined;
      var y1 = undefined;
      var x2 = undefined;
      var y2 = undefined;
      var x1Attr = this.element.getAttributeNS(null, "x1");
      if (x1Attr) {
        x1 = parseFloat(x1Attr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      var y1Attr = this.element.getAttributeNS(null, "y1");
      if (y1Attr) {
        y1 = parseFloat(y1Attr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      var x2Attr = this.element.getAttributeNS(null, "x2");
      if (x2Attr) {
        x2 = parseFloat(x2Attr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      var y2Attr = this.element.getAttributeNS(null, "y2");
      if (y2Attr) {
        y2 = parseFloat(y2Attr);
      } else {
        throw "Missing attribute in element " + this.element;
      }
      this.oldX = Math.min(x1, x2);
      this.oldY = Math.min(y1, y2);
      this.oldWidth = Math.abs(x1 - x2);
      this.oldHeight = Math.abs(y1 - y2);

    } else if (ORYX.Editor.checkClassType(this.element, SVGPolylineElement) || ORYX.Editor.checkClassType(this.element, SVGPolygonElement)) {
      this.type = "Polyline";

      var pointsArray = [];
      if (this.element.points && this.element.points.numberOfItems) {
        for (var i = 0, size = this.element.points.numberOfItems; i < size; i++) {
          pointsArray.push(this.element.points.getItem(i).x)
          pointsArray.push(this.element.points.getItem(i).y)
        }
      } else {
        var points = this.element.getAttributeNS(null, "points");
        if (points) {
          points = points.replace(/,/g, " ");
          pointsArray = points.split(" ");
          pointsArray = pointsArray.without("");
        } else {
          throw "Missing attribute in element " + this.element;
        }
      }


      if (pointsArray && pointsArray.length && pointsArray.length > 1) {
        var minX = parseFloat(pointsArray[0]);
        var minY = parseFloat(pointsArray[1]);
        var maxX = parseFloat(pointsArray[0]);
        var maxY = parseFloat(pointsArray[1]);

        for (var i = 0; i < pointsArray.length; i++) {
          minX = Math.min(minX, parseFloat(pointsArray[i]));
          maxX = Math.max(maxX, parseFloat(pointsArray[i]));
          i++;
          minY = Math.min(minY, parseFloat(pointsArray[i]));
          maxY = Math.max(maxY, parseFloat(pointsArray[i]));
        }

        this.oldX = minX;
        this.oldY = minY;
        this.oldWidth = maxX - minX;
        this.oldHeight = maxY - minY;
      } else {
        throw "Missing attribute in element " + this.element;
      }

    } else if (ORYX.Editor.checkClassType(this.element, SVGPathElement)) {
      this.type = "Path";

      this.editPathParser = new PathParser();
      this.editPathHandler = new ORYX.Core.SVG.EditPathHandler();
      this.editPathParser.setHandler(this.editPathHandler);

      var parser = new PathParser();
      var handler = new ORYX.Core.SVG.MinMaxPathHandler();
      parser.setHandler(handler);
      parser.parsePath(this.element);

      this.oldX = handler.minX;
      this.oldY = handler.minY;
      this.oldWidth = handler.maxX - handler.minX;
      this.oldHeight = handler.maxY - handler.minY;

      delete parser;
      delete handler;
    } else {
      throw "Element is not a shape.";
    }

    /** initialize attributes of oryx namespace */
      //resize
    var resizeAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "resize");
    if (resizeAttr) {
      resizeAttr = resizeAttr.toLowerCase();
      if (resizeAttr.match(/horizontal/)) {
        this.isHorizontallyResizable = true;
      } else {
        this.isHorizontallyResizable = false;
      }
      if (resizeAttr.match(/vertical/)) {
        this.isVerticallyResizable = true;
      } else {
        this.isVerticallyResizable = false;
      }
    } else {
      this.isHorizontallyResizable = false;
      this.isVerticallyResizable = false;
    }

    //anchors
    var anchorAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "anchors");
    if (anchorAttr) {
      anchorAttr = anchorAttr.replace("/,/g", " ");
      var anchors = anchorAttr.split(" ").without("");

      for (var i = 0; i < anchors.length; i++) {
        switch (anchors[i].toLowerCase()) {
          case "left":
            this.anchorLeft = true;
            break;
          case "right":
            this.anchorRight = true;
            break;
          case "top":
            this.anchorTop = true;
            break;
          case "bottom":
            this.anchorBottom = true;
            break;
        }
      }
    }

    //allowDockers and resizeMarkerMid
    if (ORYX.Editor.checkClassType(this.element, SVGPathElement)) {
      var allowDockersAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "allowDockers");
      if (allowDockersAttr) {
        if (allowDockersAttr.toLowerCase() === "no") {
          this.allowDockers = false;
        } else {
          this.allowDockers = true;
        }
      }

      var resizeMarkerMidAttr = this.element.getAttributeNS(NAMESPACE_ORYX, "resizeMarker-mid");
      if (resizeMarkerMidAttr) {
        if (resizeMarkerMidAttr.toLowerCase() === "yes") {
          this.resizeMarkerMid = true;
        } else {
          this.resizeMarkerMid = false;
        }
      }
    }

    this.x = this.oldX;
    this.y = this.oldY;
    this.width = this.oldWidth;
    this.height = this.oldHeight;
  },

  /**
   * Writes the changed values into the SVG element.
   */
  update: function () {

    if (this.x !== this.oldX || this.y !== this.oldY || this.width !== this.oldWidth || this.height !== this.oldHeight) {
      switch (this.type) {
        case "Rect":
          if (this.x !== this.oldX) this.element.setAttributeNS(null, "x", this.x);
          if (this.y !== this.oldY) this.element.setAttributeNS(null, "y", this.y);
          if (this.width !== this.oldWidth) this.element.setAttributeNS(null, "width", this.width);
          if (this.height !== this.oldHeight) this.element.setAttributeNS(null, "height", this.height);
          break;
        case "Circle":
          //calculate the radius
          //var r;
//					if(this.width/this.oldWidth <= this.height/this.oldHeight) {
//						this.radiusX = ((this.width > this.height) ? this.width : this.height)/2.0;
//					} else {
          this.radiusX = ((this.width < this.height) ? this.width : this.height) / 2.0;
          //}

          this.element.setAttributeNS(null, "cx", this.x + this.width / 2.0);
          this.element.setAttributeNS(null, "cy", this.y + this.height / 2.0);
          this.element.setAttributeNS(null, "r", this.radiusX);
          break;
        case "Ellipse":
          this.radiusX = this.width / 2;
          this.radiusY = this.height / 2;

          this.element.setAttributeNS(null, "cx", this.x + this.radiusX);
          this.element.setAttributeNS(null, "cy", this.y + this.radiusY);
          this.element.setAttributeNS(null, "rx", this.radiusX);
          this.element.setAttributeNS(null, "ry", this.radiusY);
          break;
        case "Line":
          if (this.x !== this.oldX)
            this.element.setAttributeNS(null, "x1", this.x);

          if (this.y !== this.oldY)
            this.element.setAttributeNS(null, "y1", this.y);

          if (this.x !== this.oldX || this.width !== this.oldWidth)
            this.element.setAttributeNS(null, "x2", this.x + this.width);

          if (this.y !== this.oldY || this.height !== this.oldHeight)
            this.element.setAttributeNS(null, "y2", this.y + this.height);
          break;
        case "Polyline":
          var points = this.element.getAttributeNS(null, "points");
          if (points) {
            points = points.replace(/,/g, " ").split(" ").without("");

            if (points && points.length && points.length > 1) {

              //TODO what if oldWidth == 0?
              var widthDelta = (this.oldWidth === 0) ? 0 : this.width / this.oldWidth;
              var heightDelta = (this.oldHeight === 0) ? 0 : this.height / this.oldHeight;

              var updatedPoints = "";
              for (var i = 0; i < points.length; i++) {
                var x = (parseFloat(points[i]) - this.oldX) * widthDelta + this.x;
                i++;
                var y = (parseFloat(points[i]) - this.oldY) * heightDelta + this.y;
                updatedPoints += x + " " + y + " ";
              }
              this.element.setAttributeNS(null, "points", updatedPoints);
            } else {
              //TODO error
            }
          } else {
            //TODO error
          }
          break;
        case "Path":
          //calculate scaling delta
          //TODO what if oldWidth == 0?
          var widthDelta = (this.oldWidth === 0) ? 0 : this.width / this.oldWidth;
          var heightDelta = (this.oldHeight === 0) ? 0 : this.height / this.oldHeight;

          //use path parser to edit each point of the path
          this.editPathHandler.init(this.x, this.y, this.oldX, this.oldY, widthDelta, heightDelta);
          this.editPathParser.parsePath(this.element);

          //change d attribute of path
          this.element.setAttributeNS(null, "d", this.editPathHandler.d);
          break;
      }

      this.oldX = this.x;
      this.oldY = this.y;
      this.oldWidth = this.width;
      this.oldHeight = this.height;
    }

    // Remove cached variables
    delete this.visible;
    delete this.handler;
  },

  isPointIncluded: function (pointX, pointY) {

    // Check if there are the right arguments and if the node is visible
    if (!pointX || !pointY || !this.isVisible()) {
      return false;
    }

    switch (this.type) {
      case "Rect":
        return (pointX >= this.x && pointX <= this.x + this.width &&
          pointY >= this.y && pointY <= this.y + this.height);
        break;
      case "Circle":
        //calculate the radius
//				var r;
//				if(this.width/this.oldWidth <= this.height/this.oldHeight) {
//					r = ((this.width > this.height) ? this.width : this.height)/2.0;
//				} else {
//				 	r = ((this.width < this.height) ? this.width : this.height)/2.0;
//				}
        return ORYX.Core.Math.isPointInEllipse(pointX, pointY, this.x + this.width / 2.0, this.y + this.height / 2.0, this.radiusX, this.radiusX);
        break;
      case "Ellipse":
        return ORYX.Core.Math.isPointInEllipse(pointX, pointY, this.x + this.radiusX, this.y + this.radiusY, this.radiusX, this.radiusY);
        break;
      case "Line":
        return ORYX.Core.Math.isPointInLine(pointX, pointY, this.x, this.y, this.x + this.width, this.y + this.height);
        break;
      case "Polyline":
        var points = this.element.getAttributeNS(null, "points");

        if (points) {
          points = points.replace(/,/g, " ").split(" ").without("");

          points = points.collect(function (n) {
            return parseFloat(n);
          });

          return ORYX.Core.Math.isPointInPolygone(pointX, pointY, points);
        } else {
          return false;
        }
        break;
      case "Path":

        // Cache Path handler
        if (!this.handler) {
          var parser = new PathParser();
          this.handler = new ORYX.Core.SVG.PointsPathHandler();
          parser.setHandler(this.handler);
          parser.parsePath(this.element);
        }

        return ORYX.Core.Math.isPointInPolygone(pointX, pointY, this.handler.points);

        break;
      default:
        return false;
    }
  },

  /**
   * Returns true if the element is visible
   * @param {SVGElement} elem
   * @return boolean
   */
  isVisible: function (elem) {

    if (this.visible !== undefined) {
      return this.visible;
    }

    if (!elem) {
      elem = this.element;
    }

    var hasOwnerSVG = false;
    try {
      hasOwnerSVG = !!elem.ownerSVGElement;
    } catch (e) {
    }

    // Is SVG context
    if (hasOwnerSVG) {
      // IF G-Element
      if (ORYX.Editor.checkClassType(elem, SVGGElement)) {
        if (elem.className && elem.className.baseVal == "me") {
          this.visible = true;
          return this.visible;
        }
      }

      // Check if fill or stroke is set
      var fill = elem.getAttributeNS(null, "fill");
      var stroke = elem.getAttributeNS(null, "stroke");
      if (fill && fill == "none" && stroke && stroke == "none") {
        this.visible = false;
      } else {
        // Check if displayed
        var attr = elem.getAttributeNS(null, "display");
        if (!attr)
          this.visible = this.isVisible(elem.parentNode);
        else if (attr == "none")
          this.visible = false;
        else
          this.visible = true;
      }
    } else {
      this.visible = true;
    }

    return this.visible;
  },

  toString: function () {
    return (this.element) ? "SVGShape " + this.element.id : "SVGShape " + this.element;
  }
});

/**
 * @classDescription Class for adding text to a shape.
 *
 */
ORYX.Core.SVG.Label = Clazz.extend({
  _characterSets: [
    "%W",
    "@",
    "m",
    "wDGMOQ√ñ#+=<>~^",
    "ABCHKNRSUVXZ√ú√Ñ&",
    "bdghnopqux√∂√ºETY1234567890√ü_¬ß${}*¬¥`¬µ‚Ç¨",
    "aeksvyz√§FLP?¬∞¬≤¬≥",
    "c-",
    "rtJ\"/()[]:;!|\\",
    "fjI., ",
    "'",
    "il"
  ],
  _characterSetValues: [15, 14, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3],

  /**
   * Constructor
   * @param options {Object} :
   *  textElement
   *
   */
  construct: function (options) {
    arguments.callee.$.construct.apply(this, arguments);

    if (!options.textElement) {
      throw "Label: No parameter textElement."
    } else if (!ORYX.Editor.checkClassType(options.textElement, SVGTextElement)) {
      throw "Label: Parameter textElement is not an SVGTextElement."
    }

    this.invisibleRenderPoint = -5000;

    this.node = options.textElement;


    this.node.setAttributeNS(null, 'stroke-width', '0pt');
    this.node.setAttributeNS(null, 'letter-spacing', '0px');

    this.shapeId = options.shapeId;

    this.id;

    this.fitToElemId;

    this.edgePosition;

    this.x;
    this.y;
    this.oldX;
    this.oldY;

    this.isVisible = true;

    this._text;
    this._verticalAlign;
    this._horizontalAlign;
    this._rotate;
    this._rotationPoint;

    //this.anchors = [];
    this.anchorLeft;
    this.anchorRight;
    this.anchorTop;
    this.anchorBottom;

    this._isChanged = true;

    //if the text element already has an id, don't change it.
    var _id = this.node.getAttributeNS(null, 'id');
    if (_id) {
      this.id = _id;
    }

    //initialization

    //set referenced element the text is fit to
    this.fitToElemId = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'fittoelem');
    if (this.fitToElemId)
      this.fitToElemId = this.shapeId + this.fitToElemId;

    //set alignment
    var alignValues = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'align');
    if (alignValues) {
      alignValues = alignValues.replace(/,/g, " ");
      alignValues = alignValues.split(" ");
      alignValues = alignValues.without("");

      alignValues.each((function (alignValue) {
        switch (alignValue) {
          case 'top':
          case 'middle':
          case 'bottom':
            if (!this._verticalAlign) {
              this._originVerticalAlign = this._verticalAlign = alignValue;
            }
            break;
          case 'left':
          case 'center':
          case 'right':
            if (!this._horizontalAlign) {
              this._originHorizontalAlign = this._horizontalAlign = alignValue;
            }
            break;
        }
      }).bind(this));
    }

    //set edge position (only in case the label belongs to an edge)
    this.edgePosition = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'edgePosition');
    if (this.edgePosition) {
      this.originEdgePosition = this.edgePosition = this.edgePosition.toLowerCase();
    }


    //get offset top
    this.offsetTop = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'offsetTop') || ORYX.CONFIG.OFFSET_EDGE_LABEL_TOP;
    if (this.offsetTop) {
      this.offsetTop = parseInt(this.offsetTop);
    }

    //get offset top
    this.offsetBottom = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'offsetBottom') || ORYX.CONFIG.OFFSET_EDGE_LABEL_BOTTOM;
    if (this.offsetBottom) {
      this.offsetBottom = parseInt(this.offsetBottom);
    }


    //set rotation
    var rotateValue = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'rotate');
    if (rotateValue) {
      try {
        this._rotate = parseFloat(rotateValue);
      } catch (e) {
        this._rotate = 0;
      }
    } else {
      this._rotate = 0;
    }

    //anchors
    var anchorAttr = this.node.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "anchors");
    if (anchorAttr) {
      anchorAttr = anchorAttr.replace("/,/g", " ");
      var anchors = anchorAttr.split(" ").without("");

      for (var i = 0; i < anchors.length; i++) {
        switch (anchors[i].toLowerCase()) {
          case "left":
            this.originAnchorLeft = this.anchorLeft = true;
            break;
          case "right":
            this.originAnchorRight = this.anchorRight = true;
            break;
          case "top":
            this.originAnchorTop = this.anchorTop = true;
            break;
          case "bottom":
            this.originAnchorBottom = this.anchorBottom = true;
            break;
        }
      }
    }

    //if no alignment defined, set default alignment
    if (!this._verticalAlign) {
      this._verticalAlign = 'bottom';
    }
    if (!this._horizontalAlign) {
      this._horizontalAlign = 'left';
    }

    var xValue = this.node.getAttributeNS(null, 'x');
    if (xValue) {
      this.oldX = this.x = parseFloat(xValue);
    } else {
      //TODO error
    }

    var yValue = this.node.getAttributeNS(null, 'y');
    if (yValue) {
      this.oldY = this.y = parseFloat(yValue);
    } else {
      //TODO error
    }

    //set initial text
    this.text(this.node.textContent);
  },

  /**
   * Reset the anchor position to the original value
   * which was specified in the stencil set
   *
   */
  resetAnchorPosition: function () {
    this.anchorLeft = this.originAnchorLeft || false;
    this.anchorRight = this.originAnchorRight || false;
    this.anchorTop = this.originAnchorTop || false;
    this.anchorBottom = this.originAnchorBottom || false;
  },

  isOriginAnchorLeft: function () {
    return this.originAnchorLeft || false;
  },
  isOriginAnchorRight: function () {
    return this.originAnchorRight || false;
  },
  isOriginAnchorTop: function () {
    return this.originAnchorTop || false;
  },
  isOriginAnchorBottom: function () {
    return this.originAnchorBottom || false;
  },


  isAnchorLeft: function () {
    return this.anchorLeft || false;
  },
  isAnchorRight: function () {
    return this.anchorRight || false;
  },
  isAnchorTop: function () {
    return this.anchorTop || false;
  },
  isAnchorBottom: function () {
    return this.anchorBottom || false;
  },

  /**
   * Returns the x coordinate
   * @return {number}
   */
  getX: function () {
    try {
      var x = this.node.x.baseVal.getItem(0).value;
      switch (this.horizontalAlign()) {
        case "left":
          return x;
        case "center":
          return x - (this.getWidth() / 2);
        case "right":
          return x - this.getWidth();
      }
      return this.node.getBBox().x;
    } catch (e) {
      return this.x;
    }
  },

  setX: function (x) {
    if (this.position)
      this.position.x = x;
    else
      this.setOriginX(x);
  },


  /**
   * Returns the y coordinate
   * @return {number}
   */
  getY: function () {
    try {
      return this.node.getBBox().y;
    } catch (e) {
      return this.y;
    }
  },

  setY: function (y) {
    if (this.position)
      this.position.y = y;
    else
      this.setOriginY(y);
  },

  setOriginX: function (x) {
    this.x = x;
  },

  setOriginY: function (y) {
    this.y = y;
  },


  /**
   * Returns the width of the label
   * @return {number}
   */
  getWidth: function () {
    try {
      try {
        var width, cn = this.node.childNodes;
        if (cn.length == 0) {
          width = this.node.getBBox().width;
        } else {
          for (var i = 0, size = cn.length; i < size; ++i) {
            var w = cn[i].getComputedTextLength();
            if ("undefined" == typeof width || width < w) {
              width = w;
            }
          }
        }
        return width + (width % 2 == 0 ? 0 : 1);
      } catch (ee) {
        return this.node.getBBox().width;
      }
    } catch (e) {
      return 0;
    }
  },

  getOriginUpperLeft: function () {
    var x = this.x, y = this.y;
    switch (this._horizontalAlign) {
      case 'center' :
        x -= this.getWidth() / 2;
        break;
      case 'right' :
        x -= this.getWidth();
        break;
    }
    switch (this._verticalAlign) {
      case 'middle' :
        y -= this.getHeight() / 2;
        break;
      case 'bottom' :
        y -= this.getHeight();
        break;
    }
    return {x: x, y: y};
  },

  /**
   * Returns the height of the label
   * @return {number}
   */
  getHeight: function () {
    try {
      return this.node.getBBox().height;
    } catch (e) {
      return 0;
    }
  },

  /**
   * Returns the relative center position of the label
   * to its parent shape.
   * @return {Object}
   */
  getCenter: function () {
    var up = {x: this.getX(), y: this.getY()};
    up.x += this.getWidth() / 2;
    up.y += this.getHeight() / 2;
    return up;
  },

  /**
   * Sets the position of a label relative to the parent.
   * @param {Object} position
   */
  setPosition: function (position) {
    if (!position || position.x === undefined || position.y === undefined) {
      delete this.position;
    } else {
      this.position = position;
    }

    if (this.position) {
      delete this._referencePoint;
      delete this.edgePosition;
    }

    this._isChanged = true;
    this.update();
  },

  /**
   * Return the position
   */
  getPosition: function () {
    return this.position;
  },

  setReferencePoint: function (ref) {
    if (ref) {
      this._referencePoint = ref;
    } else {
      delete this._referencePoint;
    }
    if (this._referencePoint) {
      delete this.position;
    }
  },

  getReferencePoint: function () {
    return this._referencePoint || undefined;
  },

  changed: function () {
    this._isChanged = true;
  },

  /**
   * Register a callback which will be called if the label
   * was rendered.
   * @param {Object} fn
   */
  registerOnChange: function (fn) {
    if (!this.changeCallbacks) {
      this.changeCallbacks = [];
    }
    if (fn instanceof Function && !this.changeCallbacks.include(fn)) {
      this.changeCallbacks.push(fn);
    }
  },

  /**
   * Unregister the callback for changes.
   * @param {Object} fn
   */
  unregisterOnChange: function (fn) {
    if (this.changeCallbacks && fn instanceof Function && this.changeCallbacks.include(fn)) {
      this.changeCallbacks = this.changeCallbacks.without(fn);
    }
  },

  /**
   * Returns TRUE if the labe is currently in
   * the update mechanism.
   * @return {Boolean}
   */
  isUpdating: function () {
    return !!this._isUpdating;
  },


  getOriginEdgePosition: function () {
    return this.originEdgePosition;
  },

  /**
   * Returns the edgeposition.
   *
   * @return {String} "starttop", "startmiddle", "startbottom",
   * "midtop", "midbottom", "endtop", "endbottom" or null
   */
  getEdgePosition: function () {
    return this.edgePosition || null;
  },

  /**
   * Set the edge position, must be one of the valid
   * edge positions (see getEdgePosition).
   * Removes the reference point and the absolute position as well.
   *
   * @param {Object} position
   */
  setEdgePosition: function (position) {
    if (["starttop", "startmiddle", "startbottom",
      "midtop", "midbottom", "endtop", "endbottom"].include(position)) {
      this.edgePosition = position;
      delete this.position;
      delete this._referencePoint;
    } else {
      delete this.edgePosition;
    }
  },

  /**
   * Update the SVG text element.
   */
  update: function (force) {

    var x = this.x, y = this.y;
    if (this.position) {
      x = this.position.x;
      y = this.position.y;
    }
    x = Math.floor(x);
    y = Math.floor(y);

    if (this._isChanged || x !== this.oldX || y !== this.oldY || force === true) {
      if (this.isVisible) {
        this._isChanged = false;
        this._isUpdating = true;

        this.node.setAttributeNS(null, 'x', x);
        this.node.setAttributeNS(null, 'y', y);
        this.node.removeAttributeNS(null, "fill-opacity");

        //this.node.setAttributeNS(null, 'font-size', this._fontSize);
        //this.node.setAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'align', this._horizontalAlign + " " + this._verticalAlign);

        this.oldX = x;
        this.oldY = y;

        //set rotation
        if (!this.position && !this.getReferencePoint()) {
          if (this._rotate !== undefined) {
            if (this._rotationPoint)
              this.node.setAttributeNS(null, 'transform', 'rotate(' + this._rotate + ' ' + Math.floor(this._rotationPoint.x) + ' ' + Math.floor(this._rotationPoint.y) + ')');
            else
              this.node.setAttributeNS(null, 'transform', 'rotate(' + this._rotate + ' ' + Math.floor(x) + ' ' + Math.floor(y) + ')');
          }
        } else {
          this.node.removeAttributeNS(null, 'transform');
        }

        var textLines = this._text.split("\n");
        while (textLines.last() == "")
          textLines.pop();


        if (this.node.ownerDocument) {
          // Only reset the tspans if the text
          // has changed or has to be wrapped
          if (this.fitToElemId || this._textHasChanged) {
            this.node.textContent = ""; // Remove content
            textLines.each((function (textLine, index) {
              var tspan = this.node.ownerDocument.createElementNS(ORYX.CONFIG.NAMESPACE_SVG, 'tspan');
              tspan.textContent = textLine.trim();
              if (this.fitToElemId) {
                tspan.setAttributeNS(null, 'x', this.invisibleRenderPoint);
                tspan.setAttributeNS(null, 'y', this.invisibleRenderPoint);
              }

              /*
							 * Chrome's getBBox() method fails, if a text node contains an empty tspan element.
							 * So, we add a whitespace to such a tspan element.
							 */
              if (tspan.textContent === "") {
                tspan.textContent = " ";
              }

              //append tspan to text node
              this.node.appendChild(tspan);
            }).bind(this));
            delete this._textHasChanged;
            delete this.indices;
          }

          //Work around for Mozilla bug 293581
          if (this.isVisible && this.fitToElemId) {
            this.node.setAttributeNS(null, 'visibility', 'hidden');
          }

          if (this.fitToElemId) {
            window.setTimeout(this._checkFittingToReferencedElem.bind(this), 0);
            //this._checkFittingToReferencedElem();
          } else {
            window.setTimeout(this._positionText.bind(this), 0);
            //this._positionText();
          }
        }
      } else {
        this.node.textContent = "";
        //this.node.setAttributeNS(null, "fill-opacity", "0.2");
      }
    }
  },

  _checkFittingToReferencedElem: function () {
    try {
      var tspans = $A(this.node.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'tspan'));

      //only do this in firefox 3. all other browsers do not support word wrapping!!!!!
      //if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) && new Number(RegExp.$1)>=3) {
      var newtspans = [];

      var refNode = this.node.ownerDocument.getElementById(this.fitToElemId);

      if (refNode) {
        var refbb = refNode.getBBox();

        var fontSize = this.getFontSize();

        for (var j = 0; j < tspans.length; j++) {
          var tspan = tspans[j];

          var textLength = this._getRenderedTextLength(tspan, undefined, undefined, fontSize);

          var refBoxLength = (this._rotate != 0
          && this._rotate % 180 != 0
          && this._rotate % 90 == 0 ?
            refbb.height : refbb.width);

          if (textLength > refBoxLength) {

            var startIndex = 0;
            var lastSeperatorIndex = 0;

            var numOfChars = this.getTrimmedTextLength(tspan.textContent);
            for (var i = 0; i < numOfChars; i++) {
              var sslength = this._getRenderedTextLength(tspan, startIndex, i - startIndex, fontSize);

              if (sslength > refBoxLength - 2) {
                var newtspan = this.node.ownerDocument.createElementNS(ORYX.CONFIG.NAMESPACE_SVG, 'tspan');
                if (lastSeperatorIndex <= startIndex) {
                  lastSeperatorIndex = (i == 0) ? i : i - 1;
                  newtspan.textContent = tspan.textContent.slice(startIndex, lastSeperatorIndex).trim();
                  //lastSeperatorIndex = i;
                }
                else {
                  newtspan.textContent = tspan.textContent.slice(startIndex, ++lastSeperatorIndex).trim();
                }

                newtspan.setAttributeNS(null, 'x', this.invisibleRenderPoint);
                newtspan.setAttributeNS(null, 'y', this.invisibleRenderPoint);

                //insert tspan to text node
                //this.node.insertBefore(newtspan, tspan);
                newtspans.push(newtspan);

                startIndex = lastSeperatorIndex;
              }
              else {
                var curChar = tspan.textContent.charAt(i);
                if (curChar == ' ' ||
                  curChar == '-' ||
                  curChar == "." ||
                  curChar == "," ||
                  curChar == ";" ||
                  curChar == ":") {
                  lastSeperatorIndex = i;
                }
              }
            }

            tspan.textContent = tspan.textContent.slice(startIndex).trim();
          }

          newtspans.push(tspan);
        }

        while (this.node.hasChildNodes())
          this.node.removeChild(this.node.childNodes[0]);

        while (newtspans.length > 0) {
          this.node.appendChild(newtspans.shift());
        }
      }
      //}
    } catch (e) {
      ORYX.Log.fatal("Error " + e);
    }
    window.setTimeout(this._positionText.bind(this), 0);
    //this._positionText();
  },

  /**
   * This is a work around method for Mozilla bug 293581.
   * Before the method getComputedTextLength works, the text has to be rendered.
   */
  _positionText: function () {
    try {

      var tspans = this.node.childNodes;

      var fontSize = this.getFontSize(this.node);

      var invalidTSpans = [];

      var x = this.x, y = this.y;
      if (this.position) {
        x = this.position.x;
        y = this.position.y;
      }
      x = Math.floor(x);
      y = Math.floor(y);

      var i = 0, indic = []; // Cache indices if the _positionText is called again, before update is called
      var is = (this.indices || $R(0, tspans.length - 1).toArray());
      var length = is.length;
      is.each((function (index) {
        if ("undefined" == typeof index) {
          return;
        }

        var tspan = tspans[i++];

        if (tspan.textContent.trim() === "") {
          invalidTSpans.push(tspan);
        } else {
          //set vertical position
          var dy = 0;
          switch (this._verticalAlign) {
            case 'bottom':
              dy = -(length - index - 1) * (fontSize);
              break;
            case 'middle':
              dy = -(length / 2.0 - index - 1) * (fontSize);
              dy -= ORYX.CONFIG.LABEL_LINE_DISTANCE / 2;
              break;
            case 'top':
              dy = index * (fontSize);
              dy += fontSize;
              break;
          }
          tspan.setAttributeNS(null, 'dy', Math.floor(dy));

          tspan.setAttributeNS(null, 'x', x);
          tspan.setAttributeNS(null, 'y', y);
          indic.push(index);
        }

      }).bind(this));

      indic.length = tspans.length;
      this.indices = this.indices || indic;

      invalidTSpans.each(function (tspan) {
        this.node.removeChild(tspan)
      }.bind(this));

      //set horizontal alignment
      switch (this._horizontalAlign) {
        case 'left':
          this.node.setAttributeNS(null, 'text-anchor', 'start');
          break;
        case 'center':
          this.node.setAttributeNS(null, 'text-anchor', 'middle');
          break;
        case 'right':
          this.node.setAttributeNS(null, 'text-anchor', 'end');
          break;
      }

    } catch (e) {
      //console.log(e);
      this._isChanged = true;
    }


    if (this.isVisible) {
      this.node.removeAttributeNS(null, 'visibility');
    }


    // Finished
    delete this._isUpdating;

    // Raise change event
    (this.changeCallbacks || []).each(function (fn) {
      fn.apply(fn);
    })

  },

  /**
   * Returns the text length of the text content of an SVG tspan element.
   * For all browsers but Firefox 3 the values are estimated.
   * @param {TSpanSVGElement} tspan
   * @param {int} startIndex Optional, for sub strings
   * @param {int} endIndex Optional, for sub strings
   */
  _getRenderedTextLength: function (tspan, startIndex, endIndex, fontSize) {
    //if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) && new Number(RegExp.$1) >= 3) {
    if (startIndex === undefined) {
//test string: abcdefghijklmnopqrstuvwxyz√∂√§√º,.-#+ 1234567890√üABCDEFGHIJKLMNOPQRSTUVWXYZ;:_'*√ú√Ñ√ñ!"¬ß$%&/()=?[]{}|<>'~¬¥`\^¬∞¬µ@‚Ç¨¬≤¬≥
//				for(var i = 0; i < tspan.textContent.length; i++) {
//					console.log(tspan.textContent.charAt(i), tspan.getSubStringLength(i,1), this._estimateCharacterWidth(tspan.textContent.charAt(i))*(fontSize/14.0));
//				}
      return tspan.getComputedTextLength();
    } else {
      return tspan.getSubStringLength(startIndex, endIndex);
    }
    /*} else {
			if(startIndex === undefined) {
				return this._estimateTextWidth(tspan.textContent, fontSize);
			} else {
				return this._estimateTextWidth(tspan.textContent.substr(startIndex, endIndex).trim(), fontSize);
			}
		}*/
  },

  /**
   * Estimates the text width for a string.
   * Used for word wrapping in all browser but FF3.
   * @param {Object} text
   */
  _estimateTextWidth: function (text, fontSize) {
    var sum = 0.0;
    for (var i = 0; i < text.length; i++) {
      sum += this._estimateCharacterWidth(text.charAt(i));
    }

    return sum * (fontSize / 14.0);
  },

  /**
   * Estimates the width of a single character for font size 14.
   * Used for word wrapping in all browser but FF3.
   * @param {Object} character
   */
  _estimateCharacterWidth: function (character) {
    for (var i = 0; i < this._characterSets.length; i++) {
      if (this._characterSets[i].indexOf(character) >= 0) {
        return this._characterSetValues[i];
      }
    }
    return 9;
  },

  getReferencedElementWidth: function () {
    var refNode = this.node.ownerDocument.getElementById(this.fitToElemId);

    if (refNode) {
      var refbb = refNode.getBBox();

      if (refbb) {
        return (this._rotate != 0
        && this._rotate % 180 != 0
        && this._rotate % 90 == 0 ?
          refbb.height : refbb.width);
      }
    }

    return undefined;
  },

  /**
   * If no parameter is provided, this method returns the current text.
   * @param text {String} Optional. Replaces the old text with this one.
   */
  text: function () {
    switch (arguments.length) {
      case 0:
        return this._text
        break;

      case 1:
        var oldText = this._text;
        if (arguments[0]) {
          // Filter out multiple spaces to fix issue in chrome for line-wrapping
          this._text = arguments[0].toString();
          if (this._text != null && this._text != undefined) {
            this._text = this._text.replace(/ {2,}/g, ' ');
          }
        } else {
          this._text = "";
        }
        if (oldText !== this._text) {
          this._isChanged = true;
          this._textHasChanged = true;
        }
        break;

      default:
        //TODO error
        break;
    }
  },

  getOriginVerticalAlign: function () {
    return this._originVerticalAlign;
  },

  verticalAlign: function () {
    switch (arguments.length) {
      case 0:
        return this._verticalAlign;
      case 1:
        if (['top', 'middle', 'bottom'].member(arguments[0])) {
          var oldValue = this._verticalAlign;
          this._verticalAlign = arguments[0];
          if (this._verticalAlign !== oldValue) {
            this._isChanged = true;
          }
        }
        break;

      default:
        //TODO error
        break;
    }
  },

  getOriginHorizontalAlign: function () {
    return this._originHorizontalAlign;
  },

  horizontalAlign: function () {
    switch (arguments.length) {
      case 0:
        return this._horizontalAlign;
      case 1:
        if (['left', 'center', 'right'].member(arguments[0])) {
          var oldValue = this._horizontalAlign;
          this._horizontalAlign = arguments[0];
          if (this._horizontalAlign !== oldValue) {
            this._isChanged = true;
          }
        }
        break;

      default:
        //TODO error
        break;
    }
  },

  rotate: function () {
    switch (arguments.length) {
      case 0:
        return this._rotate;
      case 1:
        if (this._rotate != arguments[0]) {
          this._rotate = arguments[0];
          this._rotationPoint = undefined;
          this._isChanged = true;
        }
      case 2:
        if (this._rotate != arguments[0] ||
          !this._rotationPoint ||
          this._rotationPoint.x != arguments[1].x ||
          this._rotationPoint.y != arguments[1].y) {
          this._rotate = arguments[0];
          this._rotationPoint = arguments[1];
          this._isChanged = true;
        }

    }
  },

  hide: function () {
    if (this.isVisible) {
      this.isVisible = false;
      this._isChanged = true;
    }
  },

  show: function () {
    if (!this.isVisible) {
      this.isVisible = true;
      this._isChanged = true;

      // Since text is removed from the tspan when "hidden", mark
      // the text as changed to get it redrawn
      this._textHasChanged = true;
    }
  },

  /**
   * iterates parent nodes till it finds a SVG font-size
   * attribute.
   * @param {SVGElement} node
   */
  getInheritedFontSize: function (node) {
    if (!node || !node.getAttributeNS)
      return;

    var attr = node.getAttributeNS(null, "font-size");
    if (attr) {
      return parseFloat(attr);
    } else if (!ORYX.Editor.checkClassType(node, SVGSVGElement)) {
      return this.getInheritedFontSize(node.parentNode);
    }
  },

  getFontSize: function (node) {
    var tspans = this.node.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'tspan');

    //trying to get an inherited font-size attribute
    //NO CSS CONSIDERED!
    var fontSize = this.getInheritedFontSize(this.node);

    if (!fontSize) {
      //because this only works in firefox 3, all other browser use the default line height
      if (tspans[0] && /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent) && new Number(RegExp.$1) >= 3) {
        fontSize = tspans[0].getExtentOfChar(0).height;
      }
      else {
        fontSize = ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT;
      }

      //handling of unsupported method in webkit
      if (fontSize <= 0) {
        fontSize = ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT;
      }
    }

    if (fontSize)
      this.node.setAttribute("oryx:fontSize", fontSize);

    return fontSize;
  },

  /**
   * Get trimmed text length for use with
   * getExtentOfChar and getSubStringLength.
   * @param {String} text
   */
  getTrimmedTextLength: function (text) {
    text = text.strip().gsub('  ', ' ');

    var oldLength;
    do {
      oldLength = text.length;
      text = text.gsub('  ', ' ');
    } while (oldLength > text.length);

    return text.length;
  },

  /**
   * Returns the offset from
   * edge to the label which is
   * positioned under the edge
   * @return {int}
   */
  getOffsetBottom: function () {
    return this.offsetBottom;
  },


  /**
   * Returns the offset from
   * edge to the label which is
   * positioned over the edge
   * @return {int}
   */
  getOffsetTop: function () {
    return this.offsetTop;
  },

  /**
   *
   * @param {Object} obj
   */
  deserialize: function (obj, shape) {
    if (obj && "undefined" != typeof obj.x && "undefined" != typeof obj.y) {
      this.setPosition({x: obj.x, y: obj.y});

      if ("undefined" != typeof obj.distance) {
        var from = shape.dockers[obj.from];
        var to = shape.dockers[obj.to];
        if (from && to) {
          this.setReferencePoint({
            dirty: true,
            distance: obj.distance,
            intersection: {x: obj.x, y: obj.y},
            orientation: obj.orientation,
            segment: {
              from: from,
              fromIndex: obj.from,
              fromPosition: from.bounds.center(),
              to: to,
              toIndex: obj.to,
              toPosition: to.bounds.center()
            }
          })
        }
      }

      if (obj.left) this.anchorLeft = true;
      if (obj.right) this.anchorRight = true;
      if (obj.top) this.anchorTop = true;
      if (obj.bottom) this.anchorBottom = true;
      if (obj.valign) this.verticalAlign(obj.valign);
      if (obj.align) this.horizontalAlign(obj.align);

    } else if (obj && "undefined" != typeof obj.edge) {
      this.setEdgePosition(obj.edge);
    }
  },

  /**
   *
   * @return {Object}
   */
  serialize: function () {

    // On edge position
    if (this.getEdgePosition()) {
      if (this.getOriginEdgePosition() !== this.getEdgePosition()) {
        return {edge: this.getEdgePosition()};
      } else {
        return null;
      }
    }

    // On self defined position
    if (this.position) {
      var pos = {x: this.position.x, y: this.position.y};
      if (this.isAnchorLeft() && this.isAnchorLeft() !== this.isOriginAnchorLeft()) {
        pos.left = true;
      }
      if (this.isAnchorRight() && this.isAnchorRight() !== this.isOriginAnchorRight()) {
        pos.right = true;
      }
      if (this.isAnchorTop() && this.isAnchorTop() !== this.isOriginAnchorTop()) {
        pos.top = true;
      }
      if (this.isAnchorBottom() && this.isAnchorBottom() !== this.isOriginAnchorBottom()) {
        pos.bottom = true;
      }

      if (this.getOriginVerticalAlign() !== this.verticalAlign()) {
        pos.valign = this.verticalAlign();
      }
      if (this.getOriginHorizontalAlign() !== this.horizontalAlign()) {
        pos.align = this.horizontalAlign();
      }

      return pos;
    }

    // On reference point which is interesting for edges
    if (this.getReferencePoint()) {
      var ref = this.getReferencePoint();
      return {
        distance: ref.distance,
        x: ref.intersection.x,
        y: ref.intersection.y,
        from: ref.segment.fromIndex,
        to: ref.segment.toIndex,
        orientation: ref.orientation,
        valign: this.verticalAlign(),
        align: this.horizontalAlign()
      }
    }
    return null;
  },

  toString: function () {
    return "Label " + this.id
  }
});