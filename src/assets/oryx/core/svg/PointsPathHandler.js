/**
 * PathHandler
 *
 * Determine absolute points of a SVG path. The coordinates are stored
 * sequentially in the attribute points (x-coordinates at even indices,
 * y-coordinates at odd indices).
 *
 * @constructor
 */
export default class PointsPathHandler {
  constructor () {
    // arguments.callee.$.construct.apply(this, arguments)

    this.points = []

    this._lastAbsX = undefined
    this._lastAbsY = undefined
  }

  /**
   * addPoints
   *
   * @param {Array} points Array of absolutePoints
   */
  addPoints (points) {
    if (points instanceof Array) {
      let x, y
      for (let i = 0; i < points.length; i++) {
        x = parseFloat(points[i])
        i++
        y = parseFloat(points[i])

        this.points.push(x)
        this.points.push(y)
        //this.points.push({x:x, y:y});

        this._lastAbsX = x
        this._lastAbsY = y
      }
    } else {
      //TODO error
    }
  }

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
  arcAbs (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    this.addPoints([x, y])
  }

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
  arcRel (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY + y])
  }

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
  curvetoCubicAbs (x1, y1, x2, y2, x, y) {
    this.addPoints([x, y])
  }

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
  curvetoCubicRel (x1, y1, x2, y2, x, y) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY + y])
  }

  /**
   * linetoHorizontalAbs - H
   *
   * @param {Number} x
   */
  linetoHorizontalAbs (x) {
    this.addPoints([x, this._lastAbsY])
  }

  /**
   * linetoHorizontalRel - h
   *
   * @param {Number} x
   */
  linetoHorizontalRel (x) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY])
  }

  /**
   * linetoAbs - L
   *
   * @param {Number} x
   * @param {Number} y
   */
  linetoAbs (x, y) {
    this.addPoints([x, y])
  }

  /**
   * linetoRel - l
   *
   * @param {Number} x
   * @param {Number} y
   */
  linetoRel (x, y) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY + y])
  }

  /**
   * movetoAbs - M
   *
   * @param {Number} x
   * @param {Number} y
   */
  movetoAbs (x, y) {
    this.addPoints([x, y])
  }

  /**
   * movetoRel - m
   *
   * @param {Number} x
   * @param {Number} y
   */
  movetoRel (x, y) {
    if (this._lastAbsX && this._lastAbsY) {
      this.addPoints([this._lastAbsX + x, this._lastAbsY + y])
    } else {
      this.addPoints([x, y])
    }
  }

  /**
   * curvetoQuadraticAbs - Q
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticAbs (x1, y1, x, y) {
    this.addPoints([x, y])
  }

  /**
   * curvetoQuadraticRel - q
   *
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticRel (x1, y1, x, y) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY + y])
  }

  /**
   * curvetoCubicSmoothAbs - S
   *
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicSmoothAbs (x2, y2, x, y) {
    this.addPoints([x, y])
  }

  /**
   * curvetoCubicSmoothRel - s
   *
   * @param {Number} x2
   * @param {Number} y2
   * @param {Number} x
   * @param {Number} y
   */
  curvetoCubicSmoothRel (x2, y2, x, y) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY + y])
  }

  /**
   * curvetoQuadraticSmoothAbs - T
   *
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticSmoothAbs (x, y) {
    this.addPoints([x, y])
  }

  /**
   * curvetoQuadraticSmoothRel - t
   *
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticSmoothRel (x, y) {
    this.addPoints([this._lastAbsX + x, this._lastAbsY + y])
  }

  /**
   * linetoVerticalAbs - V
   *
   * @param {Number} y
   */
  linetoVerticalAbs (y) {
    this.addPoints([this._lastAbsX, y])
  }

  /**
   * linetoVerticalRel - v
   *
   * @param {Number} y
   */
  linetoVerticalRel (y) {
    this.addPoints([this._lastAbsX, this._lastAbsY + y])
  }

  /**
   * closePath - z or Z
   */
  closePath () {
    // do nothing
    return
  }

}