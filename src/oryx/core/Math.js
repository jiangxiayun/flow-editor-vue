const RIGHT = 2, TOP = 8, BOTTOM = 4, LEFT = 1

function computeOutCode (x, y, xmin, ymin, xmax, ymax) {
  var code = 0
  if (y > ymax)
    code |= TOP
  else if (y < ymin)
    code |= BOTTOM
  if (x > xmax)
    code |= RIGHT
  else if (x < xmin)
    code |= LEFT
  return code
}

const ORYX_Math = {
  /**
   * Calculate the middle point between two given points
   * 计算两点之间的中点
   * @param {x:double, y:double} point1
   * @param {x:double, y:double} point2
   * @return the middle point
   */
  midPoint: function (point1, point2) {
    return {
      x: (point1.x + point2.x) / 2.0,
      y: (point1.y + point2.y) / 2.0
    }
  },

  // 判断是否是水平或垂直的线条
  isStraightLine: function (point1, point2) {
    if (Math.abs(point1.x - point2.x) < 2) {
      return 'ver'
    }
    if (Math.abs(point1.y - point2.y) < 2) {
      return 'hor'
    }
    return false
  },

  /**
   * Returns a TRUE if the point is over a line (defined by
   * point1 and point 2). In Addition a threshold can be set,
   * which defines the weight of those line.
   *
   * @param {int} pointX - Point X
   * @param {int} pointY - Point Y
   * @param {int} lPoint1X - Line first Point X
   * @param {int} lPoint1Y - Line first Point Y
   * @param {int} lPoint2X - Line second Point X
   * @param {int} lPoint2Y - Line second Point y
   * @param {int} offset {optional} - maximal distance to line
   * @class ORYX.Core.Math.prototype
   */
  isPointInLine: function (pointX, pointY, lPoint1X, lPoint1Y, lPoint2X, lPoint2Y, offset) {
    offset = offset ? Math.abs(offset) : 1

    // Check if the edge is vertical
    if (Math.abs(lPoint1X - lPoint2X) <= offset
      && Math.abs(pointX - lPoint1X) <= offset
      && pointY - Math.max(lPoint1Y, lPoint2Y) <= offset
      && Math.min(lPoint1Y, lPoint2Y) - pointY <= offset) {
      return true
    }

    // Check if the edge is horizontal
    if (Math.abs(lPoint1Y - lPoint2Y) <= offset
      && Math.abs(pointY - lPoint1Y) <= offset
      && pointX - Math.max(lPoint1X, lPoint2X) <= offset
      && Math.min(lPoint1X, lPoint2X) - pointX <= offset) {
      return true
    }

    if (pointX > Math.max(lPoint1X, lPoint2X) || pointX < Math.min(lPoint1X, lPoint2X)) {
      return false
    }

    if (pointY > Math.max(lPoint1Y, lPoint2Y) || pointY < Math.min(lPoint1Y, lPoint2Y)) {
      return false
    }

    let s = (lPoint1Y - lPoint2Y) / (lPoint1X - lPoint2X)

    return Math.abs(pointY - ((s * pointX) + lPoint1Y - s * lPoint1X)) < offset
  },

  /**
   * Get a boolean if the point is in the polygone
   * 判断点是否在多边形中
   */
  isPointInEllipse: function (pointX, pointY, cx, cy, rx, ry) {
    if (cx === undefined || cy === undefined || rx === undefined || ry === undefined) {
      throw 'ORYX.Core.Math.isPointInEllipse needs a ellipse with these properties: x, y, radiusX, radiusY'
    }

    let tx = (pointX - cx) / rx
    let ty = (pointY - cy) / ry

    return tx * tx + ty * ty < 1.0
  },

  /**
   * Get a boolean if the point is in the polygone
   * @param {int} pointX
   * @param {int} pointY
   * @param {[int]} Cornerpoints of the Polygone (x,y,x,y,...)
   */
  isPointInPolygone: function (pointX, pointY, polygone) {
    if (arguments.length < 3) {
      throw 'ORYX.Core.Math.isPointInPolygone needs two arguments'
    }

    let lastIndex = polygone.length - 1

    if (polygone[0] !== polygone[lastIndex - 1] || polygone[1] !== polygone[lastIndex]) {
      polygone.push(polygone[0])
      polygone.push(polygone[1])
    }

    let crossings = 0

    let x1, y1, x2, y2, d

    for (let i = 0; i < polygone.length - 3;) {
      x1 = polygone[i]
      y1 = polygone[++i]
      x2 = polygone[++i]
      y2 = polygone[i + 1]
      d = (pointY - y1) * (x2 - x1) - (pointX - x1) * (y2 - y1)

      if ((y1 >= pointY) != (y2 >= pointY)) {
        crossings += y2 - y1 >= 0 ? d >= 0 : d <= 0
      }
      if (!d && Math.min(x1, x2) <= pointX && pointX <= Math.max(x1, x2)
        && Math.min(y1, y2) <= pointY && pointY <= Math.max(y1, y2)) {
        return true
      }
    }
    return (crossings % 2) ? true : false
  },

  /**
   * 计算点与线之间的距离
   *  Calculates the distance between a point and a line. It is also testable, if
   *  the distance orthogonal to the line, matches the segment of the line.
   *
   *  @param {float} lineP1
   *    The starting point of the line segment
   *  @param {float} lineP2
   *    The end point of the line segment
   *  @param {Point} point
   *    The point to calculate the distance to.
   *  @param {boolean} toSegmentOnly
   *    Flag to signal if only the segment of the line shell be evaluated.
   */
  distancePointLinie: function (lineP1, lineP2, point, toSegmentOnly) {
    let intersectionPoint = ORYX_Math.getPointOfIntersectionPointLine(lineP1, lineP2, point, toSegmentOnly)

    if (!intersectionPoint) {
      return null
    }

    return ORYX_Math.getDistancePointToPoint(point, intersectionPoint)
  },

  /**
   * Calculates the distance between two points.
   * 计算点与点之间的距离
   *
   * @param {point} point1
   * @param {point} point2
   */
  getDistancePointToPoint: function (point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2))
  },

  /**
   * Calculates the relative distance of a point which is between two other points.
   *
   * @param {point} between1
   * @param {point} between2
   * @param {point} point
   */
  getDistanceBetweenTwoPoints: function (between1, between2, point) {
    return ORYX_Math.getDistancePointToPoint(point, between1) /
      ORYX_Math.getDistancePointToPoint(between1, between2)
  },

  /**
   * Returns true, if the point is of the left hand
   * side of the regarding the line.
   *
   * @param {point} lineP1 Line first point
   * @param {point} lineP2 Line second point
   * @param {point} point
   */
  pointIsLeftOfLine: function (lineP1, lineP2, point) {
    let vec1 = ORYX_Math.getVector(lineP1, lineP2)
    let vec2 = ORYX_Math.getVector(lineP1, point)
    // if the cross produkt is more than 0
    return ((vec1.x * vec2.y) - (vec2.x * vec1.y)) > 0
  },

  /**
   * Calculates the a point which is relatively between two other points.
   *
   * @param {point} point1
   * @param {point} point2
   * @param {number} relative Relative which is between 0 and 1
   */
  getPointBetweenTwoPoints: function (point1, point2, relative) {
    relative = Math.max(Math.min(relative || 0, 1), 0)

    if (relative === 0) {
      return point1
    } else if (relative === 1) {
      return point2
    }

    return {
      x: point1.x + ((point2.x - point1.x) * relative),
      y: point1.y + ((point2.y - point1.y) * relative)
    }
  },

  /**
   * Returns the vector of the both points
   * 返回两个点的矢量
   *
   * @param {point} point1
   * @param {point} point2
   */
  OgetVector: function (point1, point2) {
    return {
      x: point2.x - point1.x,
      y: point2.y - point1.y
    }
  },

  /**
   * Returns the an identity vector of the given vector,
   * which has the length ot one.
   * 返回给定向量的一个标识向量，其长度为1。
   *
   * @param {point} vector
   * or
   * @param {point} point1
   * @param {point} point2
   */
  getIdentityVector: function (vector) {
    if (arguments.length == 2) {
      vector = ORYX_Math.getVector(arguments[0], arguments[1])
    }

    let length = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y))
    return {
      x: vector.x / (length || 1),
      y: vector.y / (length || 1)
    }
  },

  getOrthogonalIdentityVector: function (point1, point2) {
    let vec = arguments.length == 1 ? point1 : ORYX_Math.getIdentityVector(point1, point2)
    return {
      x: vec.y,
      y: -vec.x
    }
  },

  /**
   * Returns the intersection point of a line and a point that defines a line
   * orthogonal to the given line.
   * 返回直线与某点到直线垂线段的交点坐标
   *
   *  @param {float} lineP1
   *    The starting point of the line segment
   *  @param {float} lineP2
   *    The end point of the line segment
   *  @param {Point} point
   *    The point to calculate the distance to.
   *  @param {boolean} onSegmentOnly
   *    Flag to signal if only the segment of the line shell be evaluated.
   */
  getPointOfIntersectionPointLine: function (lineP1, lineP2, point, onSegmentOnly) {
    /*
     * [P3 - P1 - u(P2 - P1)] dot (P2 - P1) = 0
     * u =((x3-x1)(x2-x1)+(y3-y1)(y2-y1))/(p2-p1)²
     */
    let denominator = Math.pow(lineP2.x - lineP1.x, 2)
      + Math.pow(lineP2.y - lineP1.y, 2)
    if (denominator == 0) {
      return undefined
    }

    let u = ((point.x - lineP1.x) * (lineP2.x - lineP1.x)
      + (point.y - lineP1.y) * (lineP2.y - lineP1.y))
      / denominator

    if (onSegmentOnly) {
      if (!(0 <= u && u <= 1)) {
        return undefined
      }
    }

    let pointOfIntersection = {}
    pointOfIntersection.x = lineP1.x + u * (lineP2.x - lineP1.x)
    pointOfIntersection.y = lineP1.y + u * (lineP2.y - lineP1.y)

    return pointOfIntersection
  },

  /**
   * Translated the point with the given matrix.
   * 用给定的矩阵转换点。
   * @param {Point} point
   * @param {Matrix} matrix
   * @return {Object} Includes x, y
   */
  getTranslatedPoint: function (point, matrix) {
    let x = matrix.a * point.x + matrix.c * point.y + matrix.e * 1
    let y = matrix.b * point.x + matrix.d * point.y + matrix.f * 1
    return { x: x, y: y }
  },

  /**
   * Returns the inverse matrix of the given SVG transformation matrix
   * @param {SVGTransformationMatrix} matrix
   * @return {Matrix}
   */
  getInverseMatrix: function (matrix) {
    let det = ORYX_Math.getDeterminant(matrix), m = matrix
    // +-     -+
    // | a c e |
    // | b d f |
    // | 0 0 1 |
    // +-     -+
    return {
      a: det * ((m.d * 1) - (m.f * 0)),
      b: det * ((m.f * 0) - (m.b * 1)),
      c: det * ((m.e * 0) - (m.c * 1)),
      d: det * ((m.a * 1) - (m.e * 0)),
      e: det * ((m.c * m.f) - (m.e * m.d)),
      f: det * ((m.e * m.b) - (m.a * m.f))
    }
  },

  /**
   * Returns the determinant of the svg transformation matrix
   * 返回SVG变换矩阵的行列式
   * @param {SVGTranformationMatrix} matrix
   * @return {Number}
   */
  getDeterminant: function (m) {
    // a11a22a33+a12a23a31+a13a21a32-a13a22a31-a12a21a33-a11a23a32
    return (m.a * m.d * 1) + (m.c * m.f * 0) + (m.e * m.b * 0) - (m.e * m.d * 0) - (m.c * m.b * 1) - (m.a * m.f * 0)
  },

  /**
   * Returns the bounding box of the given node. Translates the
   * origin bounding box with the tranlation matrix.
   * @param {SVGElement} node
   * @return {Object} Includes x, y, width, height
   */
  getTranslatedBoundingBox: function (node) {
    let matrix = node.getCTM()
    let bb = node.getBBox()
    let ul = ORYX_Math.getTranslatedPoint({ x: bb.x, y: bb.y }, matrix)
    let ll = ORYX_Math.getTranslatedPoint({ x: bb.x, y: bb.y + bb.height }, matrix)
    let ur = ORYX_Math.getTranslatedPoint({ x: bb.x + bb.width, y: bb.y }, matrix)
    let lr = ORYX_Math.getTranslatedPoint({ x: bb.x + bb.width, y: bb.y + bb.height }, matrix)

    let minPoint = {
      x: Math.min(ul.x, ll.x, ur.x, lr.x),
      y: Math.min(ul.y, ll.y, ur.y, lr.y)
    }
    let maxPoint = {
      x: Math.max(ul.x, ll.x, ur.x, lr.x),
      y: Math.max(ul.y, ll.y, ur.y, lr.y)
    }
    return {
      x: minPoint.x,
      y: minPoint.y,
      width: maxPoint.x - minPoint.x,
      height: maxPoint.y - minPoint.y
    }
  },

  /**
   * Returns the angle of the given line, which is representated by the two points
   * @param {Point} p1
   * @param {Point} p2
   * @return {Number} 0 <= x <= 359.99999
   */
  getAngle: function (p1, p2) {
    if ((p1.x == p2.x && p1.y == p2.y) ||
      (Math.abs(p1.x - p2.x) < 2 && Math.abs(p1.y - p2.y) < 2))
      return 0

    let py1_2 = Math.abs(p1.y - p2.y) < 2 ? 0 : p1.y - p2.y
    let px2_1 = Math.abs(p2.x - p1.x) < 2 ? 0 : p2.x - p1.x
    let angle = Math.asin(Math.sqrt(Math.pow(py1_2, 2))
      / (Math.sqrt(Math.pow(px2_1, 2) + Math.pow(py1_2, 2))))
      * 180 / Math.PI

    if (p2.x >= p1.x && p2.y <= p1.y)
      return angle
    else if (p2.x < p1.x && p2.y <= p1.y)
      return 180 - angle
    else if (p2.x < p1.x && p2.y > p1.y)
      return 180 + angle
    else
      return 360 - angle
  },
  /**
   * Returns TRUE if the rectangle is over the edge and has intersection points or includes it
   * 如果矩形位于edge上方且有交点或包含交点，则返回true
   *
   * @param {Object} x1 Point A of the line
   * @param {Object} y1
   * @param {Object} x2 Point B of the line
   * @param {Object} y2
   * @param {Object} xmin Point A of the rectangle
   * @param {Object} ymin
   * @param {Object} xmax Point B of the rectangle
   * @param {Object} ymax
   */
  isRectOverLine: function (x1, y1, x2, y2, xmin, ymin, xmax, ymax) {
    return !!ORYX_Math.clipLineOnRect.apply(ORYX_Math, arguments)
  },

  /**
   * Returns the clipped line on the given rectangle. If there is
   * no intersection, it will return NULL.
   * 返回给定矩形上的剪切线。如果没有交集，它将返回空值。
   *
   * @param {Object} x1 Point A of the line
   * @param {Object} y1
   * @param {Object} x2 Point B of the line
   * @param {Object} y2
   * @param {Object} xmin Point A of the rectangle
   * @param {Object} ymin
   * @param {Object} xmax Point B of the rectangle
   * @param {Object} ymax
   */
  clipLineOnRect: function (x1, y1, x2, y2, xmin, ymin, xmax, ymax) {
    // Outcodes for P0, P1, and whatever point lies outside the clip rectangle
    let outcode0, outcode1, outcodeOut, hhh = 0
    let accept = false, done = false

    // compute outcodes
    outcode0 = computeOutCode(x1, y1, xmin, ymin, xmax, ymax)
    outcode1 = computeOutCode(x2, y2, xmin, ymin, xmax, ymax)

    do {
      if ((outcode0 || outcode1) === 0) {
        accept = true
        done = true
      } else if ((outcode0 & outcode1) > 0) {
        done = true
      } else {
        // failed both tests, so calculate the line segment to clip
        // from an outside point to an intersection with clip edge
        let x = 0, y = 0
        // At least one endpoint is outside the clip rectangle; pick it.
        outcodeOut = outcode0 !== 0 ? outcode0 : outcode1
        // Now find the intersection point;
        // use formulas y = y0 + slope * (x - x0), x = x0 + (1/slope)* (y - y0)
        if ((outcodeOut & TOP) > 0) {
          x = x1 + (x2 - x1) * (ymax - y1) / (y2 - y1)
          y = ymax
        } else if ((outcodeOut & BOTTOM) > 0) {
          x = x1 + (x2 - x1) * (ymin - y1) / (y2 - y1)
          y = ymin
        } else if ((outcodeOut & RIGHT) > 0) {
          y = y1 + (y2 - y1) * (xmax - x1) / (x2 - x1)
          x = xmax
        } else if ((outcodeOut & LEFT) > 0) {
          y = y1 + (y2 - y1) * (xmin - x1) / (x2 - x1)
          x = xmin
        }

        // Now we move outside point to intersection point to clip
        // and get ready for next pass.
        if (outcodeOut === outcode0) {
          x1 = x
          y1 = y
          outcode0 = computeOutCode(x1, y1, xmin, ymin, xmax, ymax)
        } else {
          x2 = x
          y2 = y
          outcode1 = computeOutCode(x2, y2, xmin, ymin, xmax, ymax)
        }
      }
      hhh++
    } while (done !== true && hhh < 5000)

    if (accept) {
      return { a: { x: x1, y: y1 }, b: { x: x2, y: y2 } }
    }
    return null
  }
}

export default ORYX_Math
