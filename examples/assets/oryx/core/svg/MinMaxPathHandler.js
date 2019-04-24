/**
 * MinMaxPathHandler
 *
 * Determine the minimum and maximum of a SVG path's absolute coordinates.
 * For relative coordinates the absolute value is computed for consideration.
 * The values are stored in attributes minX, minY, maxX, and maxY.
 *
 */
export default class MinMaxPathHandler {
  constructor () {
    // arguments.callee.$.construct.apply(this, arguments);

    this.minX = undefined
    this.minY = undefined
    this.maxX = undefined
    this.maxY = undefined

    this._lastAbsX = undefined
    this._lastAbsY = undefined
  }

  /**
   * Store minimal and maximal coordinates of passed points to attributes minX, maxX, minY, maxY
   *
   * @param {Array} points Array of absolutePoints
   */
  calculateMinMax (points) {
    if (points instanceof Array) {
      let x, y
      for (let i = 0; i < points.length; i++) {
        x = parseFloat(points[i])
        i++
        y = parseFloat(points[i])

        this.minX = (this.minX !== undefined) ? Math.min(this.minX, x) : x
        this.maxX = (this.maxX !== undefined) ? Math.max(this.maxX, x) : x
        this.minY = (this.minY !== undefined) ? Math.min(this.minY, y) : y
        this.maxY = (this.maxY !== undefined) ? Math.max(this.maxY, y) : y

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
    this.calculateMinMax([x, y])
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
    this.calculateMinMax([this._lastAbsX + x, this._lastAbsY + y])
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
    this.calculateMinMax([x1, y1, x2, y2, x, y])
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
    this.calculateMinMax([this._lastAbsX + x1, this._lastAbsY + y1,
      this._lastAbsX + x2, this._lastAbsY + y2,
      this._lastAbsX + x, this._lastAbsY + y])
  }

  /**
   * linetoHorizontalAbs - H
   *
   * @param {Number} x
   */
  linetoHorizontalAbs (x) {
    this.calculateMinMax([x, this._lastAbsY])
  }

  /**
   * linetoHorizontalRel - h
   *
   * @param {Number} x
   */
  linetoHorizontalRel (x) {
    this.calculateMinMax([this._lastAbsX + x, this._lastAbsY])
  }

  /**
   * linetoAbs - L
   *
   * @param {Number} x
   * @param {Number} y
   */
  linetoAbs (x, y) {
    this.calculateMinMax([x, y])
  }

  /**
   * linetoRel - l
   *
   * @param {Number} x
   * @param {Number} y
   */
  linetoRel (x, y) {
    this.calculateMinMax([this._lastAbsX + x, this._lastAbsY + y])
  }

  /**
   * movetoAbs - M
   *
   * @param {Number} x
   * @param {Number} y
   */
  movetoAbs (x, y) {
    this.calculateMinMax([x, y])
  }

  /**
   * movetoRel - m
   *
   * @param {Number} x
   * @param {Number} y
   */
  movetoRel (x, y) {
    if (this._lastAbsX && this._lastAbsY) {
      this.calculateMinMax([this._lastAbsX + x, this._lastAbsY + y])
    } else {
      this.calculateMinMax([x, y])
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
    this.calculateMinMax([x1, y1, x, y])
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
    this.calculateMinMax([this._lastAbsX + x1, this._lastAbsY + y1, this._lastAbsX + x, this._lastAbsY + y])
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
    this.calculateMinMax([x2, y2, x, y])
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
    this.calculateMinMax([this._lastAbsX + x2, this._lastAbsY + y2, this._lastAbsX + x, this._lastAbsY + y])
  }

  /**
   * curvetoQuadraticSmoothAbs - T
   *
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticSmoothAbs (x, y) {
    this.calculateMinMax([x, y])
  }

  /**
   * curvetoQuadraticSmoothRel - t
   *
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticSmoothRel (x, y) {
    this.calculateMinMax([this._lastAbsX + x, this._lastAbsY + y])
  }

  /**
   * linetoVerticalAbs - V
   *
   * @param {Number} y
   */
  linetoVerticalAbs (y) {
    this.calculateMinMax([this._lastAbsX, y])
  }

  /**
   * linetoVerticalRel - v
   *
   * @param {Number} y
   */
  linetoVerticalRel (y) {
    this.calculateMinMax([this._lastAbsX, this._lastAbsY + y])
  }

  /**
   * closePath - z or Z
   */
  closePath () {
    return
  }

}