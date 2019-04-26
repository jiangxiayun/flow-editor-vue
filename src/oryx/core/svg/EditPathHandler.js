/**
 * EditPathHandler
 *
 * Edit SVG paths' coordinates according to specified from-to movement and
 * horizontal and vertical scaling factors.
 * The resulting path's d attribute is stored in instance variable d.
 */
export default class EditPathHandler {
  constructor () {
    // arguments.callee.$.construct.apply(this, arguments);
    this.x = 0
    this.y = 0
    this.oldX = 0
    this.oldY = 0
    this.deltaWidth = 1
    this.deltaHeight = 1
    this.d = ''
  }
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
  init (x, y, oldX, oldY, deltaWidth, deltaHeight) {
    this.x = x
    this.y = y
    this.oldX = oldX
    this.oldY = oldY
    this.deltaWidth = deltaWidth
    this.deltaHeight = deltaHeight

    this.d = ''
  }
  /**
   * editPointsAbs
   * @param {Array} points Array of absolutePoints
   */
  editPointsAbs (points) {
    if (points instanceof Array) {
      let newPoints = []
      let x, y
      for (let i = 0; i < points.length; i++) {
        x = (parseFloat(points[i]) - this.oldX) * this.deltaWidth + this.x
        i++
        y = (parseFloat(points[i]) - this.oldY) * this.deltaHeight + this.y
        newPoints.push(x)
        newPoints.push(y)
      }

      return newPoints
    } else {
      //TODO error
    }
  }

  /**
   * editPointsRel
   *
   * @param {Array} points Array of absolutePoints
   */
  editPointsRel (points) {
    if (points instanceof Array) {
      let newPoints = []
      let x, y
      for (let i = 0; i < points.length; i++) {
        x = parseFloat(points[i]) * this.deltaWidth
        i++
        y = parseFloat(points[i]) * this.deltaHeight
        newPoints.push(x)
        newPoints.push(y)
      }

      return newPoints
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
    let pointsAbs = this.editPointsAbs([x, y])
    let pointsRel = this.editPointsRel([rx, ry])

    this.d = this.d.concat(' A' + pointsRel[0] + ' ' + pointsRel[1] +
      ' ' + xAxisRotation + ' ' + largeArcFlag +
      ' ' + sweepFlag + ' ' + pointsAbs[0] + ' ' +
      pointsAbs[1] + ' ')
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
    let pointsRel = this.editPointsRel([rx, ry, x, y])

    this.d = this.d.concat(' a' + pointsRel[0] + ' ' + pointsRel[1] +
      ' ' + xAxisRotation + ' ' + largeArcFlag +
      ' ' + sweepFlag + ' ' + pointsRel[2] + ' ' +
      pointsRel[3] + ' ')
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
    let pointsAbs = this.editPointsAbs([x1, y1, x2, y2, x, y])

    this.d = this.d.concat(' C' + pointsAbs[0] + ' ' + pointsAbs[1] +
      ' ' + pointsAbs[2] + ' ' + pointsAbs[3] +
      ' ' + pointsAbs[4] + ' ' + pointsAbs[5] + ' ')
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
    let pointsRel = this.editPointsRel([x1, y1, x2, y2, x, y])

    this.d = this.d.concat(' c' + pointsRel[0] + ' ' + pointsRel[1] +
      ' ' + pointsRel[2] + ' ' + pointsRel[3] +
      ' ' + pointsRel[4] + ' ' + pointsRel[5] + ' ')
  }

  /**
   * linetoHorizontalAbs - H
   *
   * @param {Number} x
   */
  linetoHorizontalAbs (x) {
    let pointsAbs = this.editPointsAbs([x, 0])

    this.d = this.d.concat(' H' + pointsAbs[0] + ' ')
  }

  /**
   * linetoHorizontalRel - h
   *
   * @param {Number} x
   */
  linetoHorizontalRel (x) {
    let pointsRel = this.editPointsRel([x, 0])
    this.d = this.d.concat(' h' + pointsRel[0] + ' ')
  }

  /**
   * linetoAbs - L
   *
   * @param {Number} x
   * @param {Number} y
   */
  linetoAbs (x, y) {
    let pointsAbs = this.editPointsAbs([x, y])
    this.d = this.d.concat(' L' + pointsAbs[0] + ' ' + pointsAbs[1] + ' ')
  }

  /**
   * linetoRel - l
   *
   * @param {Number} x
   * @param {Number} y
   */
  linetoRel (x, y) {
    let pointsRel = this.editPointsRel([x, y])
    this.d = this.d.concat(' l' + pointsRel[0] + ' ' + pointsRel[1] + ' ')
  }

  /**
   * movetoAbs - M
   *
   * @param {Number} x
   * @param {Number} y
   */
  movetoAbs (x, y) {
    let pointsAbs = this.editPointsAbs([x, y])
    this.d = this.d.concat(' M' + pointsAbs[0] + ' ' + pointsAbs[1] + ' ')
  }

  /**
   * movetoRel - m
   *
   * @param {Number} x
   * @param {Number} y
   */
  movetoRel (x, y) {
    let pointsRel
    if (this.d === '') {
      pointsRel = this.editPointsAbs([x, y])
    } else {
      pointsRel = this.editPointsRel([x, y])
    }
    this.d = this.d.concat(' m' + pointsRel[0] + ' ' + pointsRel[1] + ' ')
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
    let pointsAbs = this.editPointsAbs([x1, y1, x, y])
    this.d = this.d.concat(' Q' + pointsAbs[0] + ' ' + pointsAbs[1] + ' ' +
      pointsAbs[2] + ' ' + pointsAbs[3] + ' ')
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
    let pointsRel = this.editPointsRel([x1, y1, x, y])
    this.d = this.d.concat(' q' + pointsRel[0] + ' ' + pointsRel[1] + ' ' +
      pointsRel[2] + ' ' + pointsRel[3] + ' ')
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
    let pointsAbs = this.editPointsAbs([x2, y2, x, y])
    this.d = this.d.concat(' S' + pointsAbs[0] + ' ' + pointsAbs[1] + ' ' +
      pointsAbs[2] + ' ' + pointsAbs[3] + ' ')
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
    let pointsRel = this.editPointsRel([x2, y2, x, y])
    this.d = this.d.concat(' s' + pointsRel[0] + ' ' + pointsRel[1] + ' ' +
      pointsRel[2] + ' ' + pointsRel[3] + ' ')
  }

  /**
   * curvetoQuadraticSmoothAbs - T
   *
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticSmoothAbs (x, y) {
    let pointsAbs = this.editPointsAbs([x, y])
    this.d = this.d.concat(' T' + pointsAbs[0] + ' ' + pointsAbs[1] + ' ')
  }

  /**
   * curvetoQuadraticSmoothRel - t
   *
   * @param {Number} x
   * @param {Number} y
   */
  curvetoQuadraticSmoothRel (x, y) {
    let pointsRel = this.editPointsRel([x, y])
    this.d = this.d.concat(' t' + pointsRel[0] + ' ' + pointsRel[1] + ' ')
  }

  /**
   * linetoVerticalAbs - V
   *
   * @param {Number} y
   */
  linetoVerticalAbs (y) {
    let pointsAbs = this.editPointsAbs([0, y])
    this.d = this.d.concat(' V' + pointsAbs[1] + ' ')
  }

  /**
   * linetoVerticalRel - v
   *
   * @param {Number} y
   */
  linetoVerticalRel (y) {
    let pointsRel = this.editPointsRel([0, y])
    this.d = this.d.concat(' v' + pointsRel[1] + ' ')
  }

  /**
   * closePath - z or Z
   */
  closePath () {
    this.d = this.d.concat(' z')
  }

}