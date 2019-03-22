/**
 * @classDescription With Bounds you can set and get position and size of UIObjects.
 * 通过边界，您可以设置并获取ui对象的位置和大小
 */

export default class Bounds {
  constructor () {
    this._changedCallbacks = [] //register a callback with changedCallacks.push(this.method.bind(this));
    this.a = {}
    this.b = {}
    this.set.apply(this, arguments)
    this.suspendChange = false
    this.changedWhileSuspend = false
  }

  /**
   * Calls all registered callbacks.
   */
  _changed (sizeChanged) {
    if (!this.suspendChange) {
      this._changedCallbacks.each(function (callback) {
        callback(this, sizeChanged)
      }.bind(this))
      this.changedWhileSuspend = false
    } else
      this.changedWhileSuspend = true
  }

  /**
   * Registers a callback that is called, if the bounds changes.
   * @param callback {Function} The callback function.
   */
  registerCallback (callback) {
    if (!this._changedCallbacks.member(callback)) {
      this._changedCallbacks.push(callback)
    }
  }

  /**
   * Unregisters a callback.
   * @param callback {Function} The callback function.
   */
  unregisterCallback (callback) {
    this._changedCallbacks = this._changedCallbacks.without(callback)
  }

  /**
   * Sets position and size of the shape dependent of four coordinates
   * (set(ax, ay, bx, by);), two points (set({x: ax, y: ay}, {x: bx, y: by});)
   * or one bound (set({a: {x: ax, y: ay}, b: {x: bx, y: by}});).
   */
  set () {
    let changed = false
    let ax, ay, bx, by
    switch (arguments.length) {
      case 1:
        if (this.a.x !== arguments[0].a.x) {
          changed = true
          this.a.x = arguments[0].a.x
        }
        if (this.a.y !== arguments[0].a.y) {
          changed = true
          this.a.y = arguments[0].a.y
        }
        if (this.b.x !== arguments[0].b.x) {
          changed = true
          this.b.x = arguments[0].b.x
        }
        if (this.b.y !== arguments[0].b.y) {
          changed = true
          this.b.y = arguments[0].b.y
        }
        break

      case 2:
        ax = Math.min(arguments[0].x, arguments[1].x)
        ay = Math.min(arguments[0].y, arguments[1].y)
        bx = Math.max(arguments[0].x, arguments[1].x)
        by = Math.max(arguments[0].y, arguments[1].y)
        if (this.a.x !== ax) {
          changed = true
          this.a.x = ax
        }
        if (this.a.y !== ay) {
          changed = true
          this.a.y = ay
        }
        if (this.b.x !== bx) {
          changed = true
          this.b.x = bx
        }
        if (this.b.y !== by) {
          changed = true
          this.b.y = by
        }
        break

      case 4:
        ax = Math.min(arguments[0], arguments[2])
        ay = Math.min(arguments[1], arguments[3])
        bx = Math.max(arguments[0], arguments[2])
        by = Math.max(arguments[1], arguments[3])
        if (this.a.x !== ax) {
          changed = true
          this.a.x = ax
        }
        if (this.a.y !== ay) {
          changed = true
          this.a.y = ay
        }
        if (this.b.x !== bx) {
          changed = true
          this.b.x = bx
        }
        if (this.b.y !== by) {
          changed = true
          this.b.y = by
        }
        break
    }

    if (changed) {
      this._changed(true)
    }
  }

  /**
   * Moves the bounds so that the point p will be the new upper left corner.
   * @param {Point} p
   * or
   * @param {Number} x
   * @param {Number} y
   */
  moveTo () {
    let currentPosition = this.upperLeft()
    switch (arguments.length) {
      case 1:
        this.moveBy({
          x: arguments[0].x - currentPosition.x,
          y: arguments[0].y - currentPosition.y
        })
        break
      case 2:
        this.moveBy({
          x: arguments[0] - currentPosition.x,
          y: arguments[1] - currentPosition.y
        })
        break
      default:
      //TODO error
    }
  }

  /**
   * Moves the bounds relatively by p.
   * @param {Point} p
   * or
   * @param {Number} x
   * @param {Number} y
   *
   */
  moveBy () {
    let changed = false

    switch (arguments.length) {
      case 1:
        let p = arguments[0]
        if (p.x !== 0 || p.y !== 0) {
          changed = true
          this.a.x += p.x
          this.b.x += p.x
          this.a.y += p.y
          this.b.y += p.y
        }
        break
      case 2:
        let x = arguments[0]
        let y = arguments[1]
        if (x !== 0 || y !== 0) {
          changed = true
          this.a.x += x
          this.b.x += x
          this.a.y += y
          this.b.y += y
        }
        break
      default:
      //TODO error
    }

    if (changed) {
      this._changed()
    }
  }

  /***
   * Includes the bounds b into the current bounds.
   * @param {Bounds} b
   */
  include (b) {
    if ((this.a.x === undefined) && (this.a.y === undefined) &&
      (this.b.x === undefined) && (this.b.y === undefined)) {
      return b
    }

    let cx = Math.min(this.a.x, b.a.x)
    let cy = Math.min(this.a.y, b.a.y)
    let dx = Math.max(this.b.x, b.b.x)
    let dy = Math.max(this.b.y, b.b.y)

    this.set(cx, cy, dx, dy)
  }

  /**
   * Relatively extends the bounds by p.
   * @param {Point} p
   */
  extend (p) {
    if (p.x !== 0 || p.y !== 0) {
      // this is over cross for the case that a and b have same coordinates.
      //((this.a.x > this.b.x) ? this.a : this.b).x += p.x;
      //((this.b.y > this.a.y) ? this.b : this.a).y += p.y;
      this.b.x += p.x
      this.b.y += p.y

      this._changed(true)
    }
  }

  /**
   * Widens the scope of the bounds by x.
   * @param {Number} x
   */
  widen (x) {
    if (x !== 0) {
      this.suspendChange = true
      this.moveBy({ x: -x, y: -x })
      this.extend({ x: 2 * x, y: 2 * x })
      this.suspendChange = false
      if (this.changedWhileSuspend) {
        this._changed(true)
      }
    }
  }

  /**
   * Returns the upper left corner's point regardless of the bound delimiter points.
   */
  upperLeft () {
    let result = {}
    result.x = this.a.x
    result.y = this.a.y
    return result
  }

  /**
   * Returns the lower Right left corner's point regardless of the
   * bound delimiter points.
   */
  lowerRight () {
    let result = {}
    result.x = this.b.x
    result.y = this.b.y
    return result
  }

  /**
   * @return {Number} Width of bounds.
   */
  width () {
    return this.b.x - this.a.x
  }

  /**
   * @return {Number} Height of bounds.
   */
  height () {
    return this.b.y - this.a.y
  }

  /**
   * @return {Point} The center point of this bounds.
   */
  center () {
    let center = {}
    center.x = (this.a.x + this.b.x) / 2.0
    center.y = (this.a.y + this.b.y) / 2.0
    return center
  }

  /**
   * @return {Point} The center point of this bounds relative to upperLeft.
   */
  midPoint () {
    let midpoint = {}
    midpoint.x = (this.b.x - this.a.x) / 2.0
    midpoint.y = (this.b.y - this.a.y) / 2.0
    return midpoint
  }

  /**
   * Moves the center point of this bounds to the new position.
   * @param p {Point}
   * or
   * @param x {Number}
   * @param y {Number}
   */
  centerMoveTo () {
    let currentPosition = this.center()

    switch (arguments.length) {
      case 1:
        this.moveBy(arguments[0].x - currentPosition.x, arguments[0].y - currentPosition.y)
        break
      case 2:
        this.moveBy(arguments[0] - currentPosition.x, arguments[1] - currentPosition.y)
        break
    }
  }

  // isIncluded (point, offset)
  isIncluded () {
    let pointX, pointY, offset

    // Get the the two Points
    switch (arguments.length) {
      case 1:
        pointX = arguments[0].x
        pointY = arguments[0].y
        offset = 0
        break
      case 2:
        if (arguments[0].x && arguments[0].y) {
          pointX = arguments[0].x
          pointY = arguments[0].y
          offset = Math.abs(arguments[1])
        } else {
          pointX = arguments[0]
          pointY = arguments[1]
          offset = 0
        }
        break
      case 3:
        pointX = arguments[0]
        pointY = arguments[1]
        offset = Math.abs(arguments[2])
        break
      default:
        throw 'isIncluded needs one, two or three arguments'
    }

    let ul = this.upperLeft()
    let lr = this.lowerRight()

    if (pointX >= ul.x - offset
      && pointX <= lr.x + offset && pointY >= ul.y - offset
      && pointY <= lr.y + offset)
      return true
    else
      return false
  }

  /**
   * @return {Bounds} A copy of this bounds.
   */
  clone () {
    // Returns a new bounds object without the callback
    // references of the original bounds
    return new Bounds(this)
  }

  toString () {
    return '( ' + this.a.x + ' | ' + this.a.y + ' )/( ' + this.b.x + ' | ' + this.b.y + ' )'
  }

  serializeForERDF () {
    return this.a.x + ',' + this.a.y + ',' + this.b.x + ',' + this.b.y
  }
}
