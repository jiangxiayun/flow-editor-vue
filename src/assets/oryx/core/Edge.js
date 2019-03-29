import Shape from './Shape'
import ORYX_SVG from './SVG'
import ORYX_Math from './Math'
import ORYX_Utils from '../Utils'
import ORYX_Config from '../CONFIG'
import ORYX_Controls from './Controls'
import ERDF from '../ERDF'

import ORYX_UIObject from '../core/UIObject'
import ORYX_Node from '../core/Node'

/**
 * @classDescription Abstract base class for all connections.
 * @extends {ORYX.Core.Shape}
 * @param options {Object}
 *
 * TODO da die verschiebung der Edge nicht ueber eine
 *  translation gemacht wird, die sich auch auf alle kind UIObjects auswirkt,
 *  muessen die kinder hier beim verschieben speziell betrachtet werden.
 *  Das sollte ueberarbeitet werden.
 *
 */
export default class Edge extends Shape {
  /**
   * Constructor
   * @param {Object} options
   * @param {Stencil} stencil
   */
  constructor (options, stencil, facade) {
    // arguments.callee.$.construct.apply(this, arguments);
    super(...arguments)
    this.isMovable = true
    this.isSelectable = true
    this._dockerUpdated = false
    this._markers = new Hash() //a hash map of SVGMarker objects where keys are the marker ids
    this._paths = []
    this._interactionPaths = []
    this._dockersByPath = new Hash()
    this._markersByPath = new Hash()

    /* Data structures to store positioning information of attached child nodes */
    this.attachedNodePositionData = new Hash()

    //TODO was muss hier initial erzeugt werden?
    let stencilNode = this.node.childNodes[0].childNodes[0]
    stencilNode = ORYX_Utils.graft('http://www.w3.org/2000/svg', stencilNode, ['g', {
      'pointer-events': 'painted'
    }])

    // Add to the EventHandler
    this.addEventHandlers(stencilNode.parentNode)

    this._oldBounds = this.bounds.clone()

    // load stencil
    this._init(this._stencil.view())

    if (stencil instanceof Array) {
      this.deserialize(stencil)
    }
  }

  _update (force) {
    if (this._dockerUpdated || this.isChanged || force) {
      this.dockers.invoke('update')

      // if (false && (this.bounds.width() === 0 || this.bounds.height() === 0)) {
      //   let width = this.bounds.width()
      //   let height = this.bounds.height()
      //   this.bounds.extend({
      //     x: width === 0 ? 2 : 0,
      //     y: height === 0 ? 2 : 0
      //   })
      //   this.bounds.moveBy({
      //     x: width === 0 ? -1 : 0,
      //     y: height === 0 ? -1 : 0
      //   })
      // }

      // TODO: Bounds muss abhaengig des Eltern-Shapes gesetzt werden
      let upL = this.bounds.upperLeft()
      let oldUpL = this._oldBounds.upperLeft()
      let oldWidth = this._oldBounds.width() === 0 ? this.bounds.width() : this._oldBounds.width()
      let oldHeight = this._oldBounds.height() === 0 ? this.bounds.height() : this._oldBounds.height()
      let diffX = upL.x - oldUpL.x
      let diffY = upL.y - oldUpL.y
      let diffWidth = (this.bounds.width() / oldWidth) || 1
      let diffHeight = (this.bounds.height() / oldHeight) || 1

      this.dockers.each((function (docker) {
        // Unregister on BoundsChangedCallback
        docker.bounds.unregisterCallback(this._dockerChangedCallback)

        // If there is any changes at the edge and is there is not an DockersUpdate
        // set the new bounds to the docker
        if (!this._dockerUpdated) {
          docker.bounds.moveBy(diffX, diffY)

          if (diffWidth !== 1 || diffHeight !== 1) {
            let relX = docker.bounds.upperLeft().x - upL.x
            let relY = docker.bounds.upperLeft().y - upL.y
            docker.bounds.moveTo(upL.x + relX * diffWidth, upL.y + relY * diffHeight)
          }
        }
        // Do Docker update and register on DockersBoundChange
        docker.update()
        docker.bounds.registerCallback(this._dockerChangedCallback)

      }).bind(this))

      if (this._dockerUpdated) {
        let a = this.dockers.first().bounds.center()
        let b = this.dockers.first().bounds.center()

        this.dockers.each((function (docker) {
          let center = docker.bounds.center()
          a.x = Math.min(a.x, center.x)
          a.y = Math.min(a.y, center.y)
          b.x = Math.max(b.x, center.x)
          b.y = Math.max(b.y, center.y)
        }).bind(this))

        //set the bounds of the the association
        this.bounds.set(Object.clone(a), Object.clone(b))
      }

      upL = this.bounds.upperLeft()
      oldUpL = this._oldBounds.upperLeft()
      diffWidth = (this.bounds.width() / (oldWidth || this.bounds.width()))
      diffHeight = (this.bounds.height() / (oldHeight || this.bounds.height()))
      diffX = upL.x - oldUpL.x
      diffY = upL.y - oldUpL.y

      // reposition labels
      this.getLabels().each(function (label) {
        if (label.getReferencePoint()) {
          let ref = label.getReferencePoint()
          let from = ref.segment.from, to = ref.segment.to
          if (!from || !from.parent || !to || !to.parent) {
            return
          }

          let fromPosition = from.bounds.center(), toPosition = to.bounds.center()

          if (fromPosition.x === ref.segment.fromPosition.x && fromPosition.y === ref.segment.fromPosition.y &&
            toPosition.x === ref.segment.toPosition.x && toPosition.y === ref.segment.toPosition.y && !ref.dirty) {
            return
          }

          if (!this.parent.initializingShapes) {
            let oldDistance = ORYX_Math.getDistanceBetweenTwoPoints(ref.segment.fromPosition, ref.segment.toPosition, ref.intersection)
            let newIntersection = ORYX_Math.getPointBetweenTwoPoints(fromPosition, toPosition, isNaN(oldDistance) ? 0.5 : oldDistance)

            /**
             * Set position
             */
              // Get the orthogonal identity vector of the current segment
            let oiv = ORYX_Math.getOrthogonalIdentityVector(fromPosition, toPosition)
            let isHor = Math.abs(oiv.y) === 1, isVer = Math.abs(oiv.x) === 1
            oiv.x *= ref.distance
            oiv.y *= ref.distance 				// vector * distance
            oiv.x += newIntersection.x
            oiv.y += newIntersection.y 	// vector + the intersection point
            let mx = isHor && ref.orientation && (ref.iorientation || ref.orientation).endsWith('r') ? -label.getWidth() : 0
            let my = isVer && ref.orientation && (ref.iorientation || ref.orientation).startsWith('l') ? -label.getHeight() + 2 : 0
            label.setX(oiv.x + mx)
            label.setY(oiv.y + my)

            // Update the reference point
            this.updateReferencePointOfLabel(label, newIntersection, from, to)
          } else {
            let oiv = ORYX_Math.getOrthogonalIdentityVector(fromPosition, toPosition)
            oiv.x *= ref.distance
            oiv.y *= ref.distance // vector * distance
            oiv.x += ref.intersection.x
            oiv.y += ref.intersection.y // vector + the intersection point
            label.setX(oiv.x)
            label.setY(oiv.y)
            ref.segment.fromPosition = fromPosition
            ref.segment.toPosition = toPosition
          }

          return
        }

        // Update label position if no reference point is set
        if (label.position && !this.parent.initializingShapes) {
          let x = label.position.x + (diffX * (diffWidth || 1))
          if (x > this.bounds.lowerRight().x) {
            x += this.bounds.width() - (this.bounds.width() / (diffWidth || 1))
          }

          let y = label.position.y + (diffY * (diffHeight || 1))
          if (y > this.bounds.lowerRight().y) {
            y += this.bounds.height() - (this.bounds.height() / (diffHeight || 1))
          }
          label.setX(x)
          label.setY(y)
          return
        }
        let angle, pos, numOfDockers, index, length
        switch (label.getEdgePosition()) {
          case 'starttop':
            angle = this._getAngle(this.dockers[0], this.dockers[1])
            pos = this.dockers.first().bounds.center()

            if (angle <= 90 || angle > 270) {
              label.horizontalAlign('left')
              label.verticalAlign('bottom')
              label.x = pos.x + label.getOffsetTop()
              label.y = pos.y - label.getOffsetTop()
              label.rotate(360 - angle, pos)
            } else {
              label.horizontalAlign('right')
              label.verticalAlign('bottom')
              label.x = pos.x - label.getOffsetTop()
              label.y = pos.y - label.getOffsetTop()
              label.rotate(180 - angle, pos)
            }

            break
          case 'startmiddle':
            angle = this._getAngle(this.dockers[0], this.dockers[1])
            pos = this.dockers.first().bounds.center()

            if (angle <= 90 || angle > 270) {
              label.horizontalAlign('left')
              label.verticalAlign('bottom')
              label.x = pos.x + 2
              label.y = pos.y + 4
              label.rotate(360 - angle, pos)
            } else {
              label.horizontalAlign('right')
              label.verticalAlign('bottom')
              label.x = pos.x + 1
              label.y = pos.y + 4
              label.rotate(180 - angle, pos)
            }

            break
          case 'startbottom':
            angle = this._getAngle(this.dockers[0], this.dockers[1])
            pos = this.dockers.first().bounds.center()

            if (angle <= 90 || angle > 270) {
              label.horizontalAlign('left')
              label.verticalAlign('top')
              label.x = pos.x + label.getOffsetBottom()
              label.y = pos.y + label.getOffsetBottom()
              label.rotate(360 - angle, pos)
            } else {
              label.horizontalAlign('right')
              label.verticalAlign('top')
              label.x = pos.x - label.getOffsetBottom()
              label.y = pos.y + label.getOffsetBottom()
              label.rotate(180 - angle, pos)
            }

            break
          case 'midtop':
            numOfDockers = this.dockers.length
            if (numOfDockers % 2 == 0) {
              let angle = this._getAngle(this.dockers[numOfDockers / 2 - 1], this.dockers[numOfDockers / 2])
              let pos1 = this.dockers[numOfDockers / 2 - 1].bounds.center()
              let pos2 = this.dockers[numOfDockers / 2].bounds.center()
              let pos = { x: (pos1.x + pos2.x) / 2.0, y: (pos1.y + pos2.y) / 2.0 }

              label.horizontalAlign('center')
              label.verticalAlign('bottom')
              label.x = pos.x
              label.y = pos.y - label.getOffsetTop()

              if (angle <= 90 || angle > 270) {
                label.rotate(360 - angle, pos)
              } else {
                label.rotate(180 - angle, pos)
              }
            } else {
              index = parseInt(numOfDockers / 2)
              angle = this._getAngle(this.dockers[index], this.dockers[index + 1])
              pos = this.dockers[index].bounds.center()

              if (angle <= 90 || angle > 270) {
                label.horizontalAlign('left')
                label.verticalAlign('bottom')
                label.x = pos.x + label.getOffsetTop()
                label.y = pos.y - label.getOffsetTop()
                label.rotate(360 - angle, pos)
              } else {
                label.horizontalAlign('right')
                label.verticalAlign('bottom')
                label.x = pos.x - label.getOffsetTop()
                label.y = pos.y - label.getOffsetTop()
                label.rotate(180 - angle, pos)
              }
            }

            break
          case 'midbottom':
            numOfDockers = this.dockers.length
            if (numOfDockers % 2 == 0) {
              let angle = this._getAngle(this.dockers[numOfDockers / 2 - 1], this.dockers[numOfDockers / 2])
              let pos1 = this.dockers[numOfDockers / 2 - 1].bounds.center()
              let pos2 = this.dockers[numOfDockers / 2].bounds.center()
              let pos = { x: (pos1.x + pos2.x) / 2.0, y: (pos1.y + pos2.y) / 2.0 }

              label.horizontalAlign('center')
              label.verticalAlign('top')
              label.x = pos.x
              label.y = pos.y + label.getOffsetTop()

              if (angle <= 90 || angle > 270) {
                label.rotate(360 - angle, pos)
              } else {
                label.rotate(180 - angle, pos)
              }
            } else {
              index = parseInt(numOfDockers / 2)
              angle = this._getAngle(this.dockers[index], this.dockers[index + 1])
              pos = this.dockers[index].bounds.center()

              if (angle <= 90 || angle > 270) {
                label.horizontalAlign('left')
                label.verticalAlign('top')
                label.x = pos.x + label.getOffsetBottom()
                label.y = pos.y + label.getOffsetBottom()
                label.rotate(360 - angle, pos)
              } else {
                label.horizontalAlign('right')
                label.verticalAlign('top')
                label.x = pos.x - label.getOffsetBottom()
                label.y = pos.y + label.getOffsetBottom()
                label.rotate(180 - angle, pos)
              }
            }

            break
          case 'endtop':
            length = this.dockers.length
            angle = this._getAngle(this.dockers[length - 2], this.dockers[length - 1])
            pos = this.dockers.last().bounds.center()

            if (angle <= 90 || angle > 270) {
              label.horizontalAlign('right')
              label.verticalAlign('bottom')
              label.x = pos.x - label.getOffsetTop()
              label.y = pos.y - label.getOffsetTop()
              label.rotate(360 - angle, pos)
            } else {
              label.horizontalAlign('left')
              label.verticalAlign('bottom')
              label.x = pos.x + label.getOffsetTop()
              label.y = pos.y - label.getOffsetTop()
              label.rotate(180 - angle, pos)
            }

            break
          case 'endbottom':
            length = this.dockers.length
            angle = this._getAngle(this.dockers[length - 2], this.dockers[length - 1])
            pos = this.dockers.last().bounds.center()

            if (angle <= 90 || angle > 270) {
              label.horizontalAlign('right')
              label.verticalAlign('top')
              label.x = pos.x - label.getOffsetBottom()
              label.y = pos.y + label.getOffsetBottom()
              label.rotate(360 - angle, pos)
            } else {
              label.horizontalAlign('left')
              label.verticalAlign('top')
              label.x = pos.x + label.getOffsetBottom()
              label.y = pos.y + label.getOffsetBottom()
              label.rotate(180 - angle, pos)
            }

            break
        }
      }.bind(this))

      this.children.each(function (value) {
        if (value instanceof ORYX_Node) {
          this.calculatePositionOfAttachedChildNode.call(this, value)
        }
      }.bind(this))

      this.refreshAttachedNodes()
      this.refresh()

      this.isChanged = false
      this._dockerUpdated = false

      this._oldBounds = this.bounds.clone()
    }

    // IE10 specific fix, start and end-markes get left behind when moving path
    if (ORYX_Utils.ifIE10()) {
      this.node.parentNode.insertBefore(this.node, this.node)
    }
  }

  /**
   *  Moves a point to the upperLeft of a node's bounds.
   *
   *  @param {point} point
   *    The point to move
   *  @param {ORYX.Core.Bounds} bounds
   *    The Bounds of the related noe
   */
  movePointToUpperLeftOfNode (point, bounds) {
    point.x -= bounds.width() / 2
    point.y -= bounds.height() / 2
  }

  /**
   * Refreshes the visual representation of edge's attached nodes.
   */
  refreshAttachedNodes () {
    this.attachedNodePositionData.values().each((nodeData) => {
      let startPoint = nodeData.segment.docker1.bounds.center()
      let endPoint = nodeData.segment.docker2.bounds.center()
      this.relativizePoint(startPoint)
      this.relativizePoint(endPoint)

      let newNodePosition = {}

      /* Calculate new x-coordinate */
      newNodePosition.x = startPoint.x
        + nodeData.relativDistanceFromDocker1
        * (endPoint.x - startPoint.x)

      /* Calculate new y-coordinate */
      newNodePosition.y = startPoint.y
        + nodeData.relativDistanceFromDocker1
        * (endPoint.y - startPoint.y)

      /* Convert new position to the upper left of the node */
      this.movePointToUpperLeftOfNode(newNodePosition, nodeData.node.bounds)

      /* Move node to its new position */
      nodeData.node.bounds.moveTo(newNodePosition)
      nodeData.node._update()
    })
  }

  /**
   * Calculates the position of an edge's child node. The node is placed on
   * the path of the edge.
   *
   * @param {node}
   *    The node to calculate the new position
   * @return {Point}
   *    The calculated upper left point of the node's shape.
   */
  calculatePositionOfAttachedChildNode (node) {
    /* Initialize position */
    let position = {
      x: 0,
      y: 0
    }

    /* Case: Node was just added */
    if (!this.attachedNodePositionData.get(node.getId())) {
      this.attachedNodePositionData.set(node.getId(), {})
      this.attachedNodePositionData.get(node.getId()).relativDistanceFromDocker1 = 0
      this.attachedNodePositionData.get(node.getId()).node = node
      this.attachedNodePositionData.get(node.getId()).segment = {}
      this.findEdgeSegmentForNode(node)
    } else if (node.isChanged) {
      this.findEdgeSegmentForNode(node)
    }
  }

  /**
   * Finds the appropriate edge segement for a node.
   * The segment is choosen, which has the smallest distance to the node.
   *
   * @param {ORYX.Core.Node} node
   *    The concerning node
   */
  findEdgeSegmentForNode (node) {
    let length = this.dockers.length
    let smallestDistance = undefined

    for (let i = 1; i < length; i++) {
      let lineP1 = this.dockers[i - 1].bounds.center()
      let lineP2 = this.dockers[i].bounds.center()
      this.relativizePoint(lineP1)
      this.relativizePoint(lineP2)

      let nodeCenterPoint = node.bounds.center()
      let distance = ORYX_Math.distancePointLinie(
        lineP1,
        lineP2,
        nodeCenterPoint,
        true)

      if ((distance || distance == 0) && ((!smallestDistance && smallestDistance != 0)
        || distance < smallestDistance)) {

        smallestDistance = distance
        this.attachedNodePositionData.get(node.getId()).segment.docker1 = this.dockers[i - 1]
        this.attachedNodePositionData.get(node.getId()).segment.docker2 = this.dockers[i]
      }

      /* Either the distance does not match the segment or the distance
       * between docker1 and docker2 is 0
       *
       * In this case choose the nearest docker as attaching point.
       *
       */
      if (!distance && !smallestDistance && smallestDistance != 0) {
        let distanceCenterToLineOne = ORYX_Math.getDistancePointToPoint(nodeCenterPoint, lineP1)
        let distanceCenterToLineTwo = ORYX_Math.getDistancePointToPoint(nodeCenterPoint, lineP2)

        if (distanceCenterToLineOne < distanceCenterToLineTwo) {
          this.attachedNodePositionData.get(node.getId()).relativDistanceFromDocker1 = 0
        } else {
          this.attachedNodePositionData.get(node.getId()).relativDistanceFromDocker1 = 1
        }
        this.attachedNodePositionData.get(node.getId()).segment.docker1 = this.dockers[i - 1]
        this.attachedNodePositionData.get(node.getId()).segment.docker2 = this.dockers[i]
      }
    }

    /* Calculate position on edge segment for the node */
    if (smallestDistance || smallestDistance == 0) {
      this.attachedNodePositionData.get(node.getId()).relativDistanceFromDocker1 =
        this.getLineParameterForPosition(
          this.attachedNodePositionData.get(node.getId()).segment.docker1,
          this.attachedNodePositionData.get(node.getId()).segment.docker2,
          node)
    }
  }

  /**
   *
   * @param {ORYX.Core.Node|Object} node or position
   * @return {Object} An object with the following attribute: {ORYX.Core.Docker} fromDocker, {ORYX.Core.Docker}
   *   toDocker, {X/Y} position, {int} distance
   */
  findSegment (node) {
    let length = this.dockers.length
    let result
    let nodeCenterPoint = node instanceof ORYX_UIObject ? node.bounds.center() : node

    for (let i = 1; i < length; i++) {
      let lineP1 = this.dockers[i - 1].bounds.center()
      let lineP2 = this.dockers[i].bounds.center()
      let distance = ORYX_Math.distancePointLinie(lineP1, lineP2, nodeCenterPoint, true)

      if (typeof distance == 'number' && (result === undefined || distance < result.distance)) {
        result = {
          distance: distance,
          fromDocker: this.dockers[i - 1],
          toDocker: this.dockers[i]
        }

      }
    }
    return result
  }

  /**
   * Returns the value of the scalar to determine the position of the node on
   * line defined by docker1 and docker2.
   *
   * @param {point} docker1
   *    The docker that defines the start of the line segment
   * @param {point} docker2
   *    The docker that defines the end of the line segment
   * @param {ORYX.Core.Node} node
   *    The concerning node
   *
   * @return {float} positionParameter
   *    The scalar value to determine the position on the line
   */
  getLineParameterForPosition (docker1, docker2, node) {
    let dockerPoint1 = docker1.bounds.center()
    let dockerPoint2 = docker2.bounds.center()
    this.relativizePoint(dockerPoint1)
    this.relativizePoint(dockerPoint2)

    let intersectionPoint = ORYX_Math.getPointOfIntersectionPointLine(
      dockerPoint1,
      dockerPoint2,
      node.bounds.center(), true)
    if (!intersectionPoint) {
      return 0
    }

    let relativeDistance =
      ORYX_Math.getDistancePointToPoint(intersectionPoint, dockerPoint1) /
      ORYX_Math.getDistancePointToPoint(dockerPoint1, dockerPoint2)

    return relativeDistance
  }

  /**
   * Makes point relative to the upper left of the edge's bound.
   *
   * @param {point} point
   *    The point to relativize
   */
  relativizePoint (point) {
    point.x -= this.bounds.upperLeft().x
    point.y -= this.bounds.upperLeft().y
  }

  /**
   * Move the first and last docker and calls the refresh method.
   * Attention: This does not calculates intersection point between the
   * edge and the bounded nodes. This only works if only the nodes are
   * moves.
   *
   */
  optimizedUpdate () {
    let updateDocker = function (docker) {
      if (!docker._dockedShape || !docker._dockedShapeBounds) { return }
      let off = {
        x: docker._dockedShape.bounds.a.x - docker._dockedShapeBounds.a.x,
        y: docker._dockedShape.bounds.a.y - docker._dockedShapeBounds.a.y
      }
      docker.bounds.moveBy(off)
      docker._dockedShapeBounds.moveBy(off)
    }

    updateDocker(this.dockers.first())
    updateDocker(this.dockers.last())

    this.refresh()
  }

  refresh () {
    // call base class refresh method
    // arguments.callee.$.refresh.apply(this, arguments)

    super.refresh()
    //TODO consider points for marker mids
    let lastPoint
    this._paths.each((function (path, index) {
      let dockers = this._dockersByPath.get(path.id)
      let c = undefined
      let d = undefined
      if (lastPoint) {
        d = 'M' + lastPoint.x + ' ' + lastPoint.y
      } else {
        c = dockers[0].bounds.center()
        lastPoint = c

        d = 'M' + c.x + ' ' + c.y
      }

      for (let i = 1; i < dockers.length; i++) {
        // for each docker, draw a line to the center
        c = dockers[i].bounds.center()
        d = d + 'L' + c.x + ' ' + c.y + ' '
        lastPoint = c
      }

      path.setAttributeNS(null, 'd', d)
      this._interactionPaths[index].setAttributeNS(null, 'd', d)

    }).bind(this))


    /* move child shapes of an edge */
    if (this.getChildNodes().length > 0) {
      let x = this.bounds.upperLeft().x
      let y = this.bounds.upperLeft().y
      this.node.firstChild.childNodes[1].setAttributeNS(null, 'transform', 'translate(' + x + ', ' + y + ')')
    }

  }

  /**
   * Calculate the Border Intersection Point between two points
   * @param {PointA}
   * @param {PointB}
   */
  getIntersectionPoint () {
    let length = Math.floor(this.dockers.length / 2)
    return ORYX_Math.midPoint(this.dockers[length - 1].bounds.center(), this.dockers[length].bounds.center())
  }

  /**
   * Returns TRUE if the bounds is over the edge
   * @param {Bounds}
   *
   */
  isBoundsIncluded (bounds) {
    let dockers = this.dockers, size = dockers.length
    return dockers.any(function (docker, i) {
      if (i == size - 1) {
        return false
      }
      let a = docker.bounds.center()
      let b = dockers[i + 1].bounds.center()

      return ORYX_Math.isRectOverLine(a.x, a.y, b.x, b.y, bounds.a.x, bounds.a.y, bounds.b.x, bounds.b.y)
    })
  }

  /**
   * Calculate if the point is inside the Shape
   * @param {PointX}
   * @param {PointY}
   */
  isPointIncluded (pointX, pointY) {
    let isbetweenAB = this.absoluteBounds().isIncluded(pointX, pointY, ORYX_Config.OFFSET_EDGE_BOUNDS)
    let isPointIncluded = undefined

    if (isbetweenAB && this.dockers.length > 0) {
      let i = 0
      let point1, point2

      do {
        point1 = this.dockers[i].bounds.center()
        point2 = this.dockers[++i].bounds.center()

        isPointIncluded = ORYX_Math.isPointInLine(pointX, pointY,
          point1.x, point1.y,
          point2.x, point2.y,
          ORYX_Config.OFFSET_EDGE_BOUNDS)

      } while (!isPointIncluded && i < this.dockers.length - 1)

    }

    return isPointIncluded
  }


  /**
   * Calculate if the point is over an special offset area
   * @param {Point}
   */
  isPointOverOffset () {
    return false
  }

  /**
   * Returns TRUE if the given node
   * is a child node of the shapes node
   * @param {Element} node
   * @return {Boolean}
   *
   */
  containsNode (node) {
    if (this._paths.include(node) || this._interactionPaths.include(node)) {
      return true
    }
    return false
  }

  /**
   * Returns the angle of the line between two dockers
   * (0 - 359.99999999)
   */
  _getAngle (docker1, docker2) {
    let p1 = docker1 instanceof ORYX_Controls.Docker ? docker1.absoluteCenterXY() : docker1;
    let p2 = docker2 instanceof ORYX_Controls.Docker ? docker2.absoluteCenterXY() : docker2;

    return ORYX_Math.getAngle(p1, p2)
  }

  alignDockers () {
    this._update(true)

    let firstPoint = this.dockers.first().bounds.center()
    let lastPoint = this.dockers.last().bounds.center()

    let deltaX = lastPoint.x - firstPoint.x
    let deltaY = lastPoint.y - firstPoint.y

    let numOfDockers = this.dockers.length - 1

    this.dockers.each((function (docker, index) {
      let part = index / numOfDockers
      docker.bounds.unregisterCallback(this._dockerChangedCallback)
      docker.bounds.moveTo(firstPoint.x + part * deltaX, firstPoint.y + part * deltaY)
      docker.bounds.registerCallback(this._dockerChangedCallback)
    }).bind(this))

    this._dockerChanged()
  }

  add (shape) {
    // arguments.callee.$.add.apply(this, arguments)
    super.add(shape)

    // If the new shape is a Docker which is not contained
    if (shape instanceof ORYX_Controls.Docker && this.dockers.include(shape)) {
      // Add it to the dockers list ordered by paths
      let pathArray = this._dockersByPath.values()[0]
      if (pathArray) {
        pathArray.splice(this.dockers.indexOf(shape), 0, shape)
      }

      /* Perform nessary adjustments on the edge's child shapes */
      this.handleChildShapesAfterAddDocker(shape)
    }
  }

  /**
   * Performs nessary adjustments on the edge's child shapes.
   *
   * @param {ORYX.Core.Controls.Docker} docker
   *    The added docker
   */
  handleChildShapesAfterAddDocker (docker) {
    /* Ensure type of Docker */
    if (!(docker instanceof ORYX_Controls.Docker)) {
      return undefined
    }

    let index = this.dockers.indexOf(docker)
    if (!(0 < index && index < this.dockers.length - 1)) {
      /* Exception: Expect added docker between first and last node of the edge */
      return undefined
    }

    /* Get child nodes concerning the segment of the new docker */
    let startDocker = this.dockers[index - 1]
    let endDocker = this.dockers[index + 1]

    /* Adjust the position of edge's child nodes */
    let segmentElements = this.getAttachedNodePositionDataForSegment(startDocker, endDocker)

    let lengthSegmentPart1 = ORYX_Math.getDistancePointToPoint(
      startDocker.bounds.center(),
      docker.bounds.center())
    let lengthSegmentPart2 = ORYX_Math.getDistancePointToPoint(
      endDocker.bounds.center(),
      docker.bounds.center())

    if (!(lengthSegmentPart1 + lengthSegmentPart2)) {
      return
    }

    let relativDockerPosition = lengthSegmentPart1 / (lengthSegmentPart1 + lengthSegmentPart2)

    segmentElements.each(function (nodePositionData) {
      /* Assign child node to the new segment */
      if (nodePositionData.value.relativDistanceFromDocker1 < relativDockerPosition) {
        /* Case: before added Docker */
        nodePositionData.value.segment.docker2 = docker
        nodePositionData.value.relativDistanceFromDocker1 =
          nodePositionData.value.relativDistanceFromDocker1 / relativDockerPosition
      } else {
        /* Case: after added Docker */
        nodePositionData.value.segment.docker1 = docker
        let newFullDistance = 1 - relativDockerPosition
        let relativPartOfSegment =
          nodePositionData.value.relativDistanceFromDocker1
          - relativDockerPosition

        nodePositionData.value.relativDistanceFromDocker1 =
          relativPartOfSegment / newFullDistance

      }
    })


    // Update all labels reference points
    this.getLabels().each(function (label) {
      let ref = label.getReferencePoint()
      if (!ref) {
        return
      }
      let index = this.dockers.indexOf(docker)
      if (index >= ref.segment.fromIndex && index <= ref.segment.toIndex) {

        let segment = this.findSegment(ref.intersection)
        if (!segment) {
          // Choose whether the first of the last segment
          segment.fromDocker = ref.segment.fromIndex >= (this.dockers.length / 2) ? this.dockers[0] : this.dockers[this.dockers.length - 2]
          segment.toDocker = this.dockers[this.dockers.indexOf(from) + 1] // The next one if the to docker
        }

        let fromPosition = segment.fromDocker.bounds.center(), toPosition = segment.toDocker.bounds.center()

        let intersection = ORYX_Math.getPointOfIntersectionPointLine(
          fromPosition, 		// P1 - Center of the first docker
          toPosition, 		// P2 - Center of the second docker
          ref.intersection, 	// P3 - Center of the label
          true)
        //var oldDistance = ORYX.Core.Math.getDistanceBetweenTwoPoints(ref.segment.fromPosition,
        // ref.segment.toPosition, ref.intersection); intersection =
        // ORYX.Core.Math.getPointBetweenTwoPoints(fromPosition, toPosition, isNaN(oldDistance) ? 0.5 :
        // (lengthOld*oldDistance)/lengthNew);

        // Update the reference point
        this.updateReferencePointOfLabel(label, intersection, segment.fromDocker, segment.toDocker, true)
      }
    }.bind(this))

    /* Update attached nodes visual representation */
    this.refreshAttachedNodes()
  }

  /**
   *  Returns elements from {@link attachedNodePositiondata} that match the
   *  segement defined by startDocker and endDocker.
   *
   *  @param {ORYX.Core.Controls.Docker} startDocker
   *    The docker defining the begin of the segment.
   *  @param {ORYX.Core.Controls.Docker} endDocker
   *    The docker defining the begin of the segment.
   *
   *  @return {Hash} attachedNodePositionData
   *    Child elements matching the segment
   */
  getAttachedNodePositionDataForSegment (startDocker, endDocker) {
    /* Ensure that the segment is defined correctly */
    if (!((startDocker instanceof ORYX_Controls.Docker)
      && (endDocker instanceof ORYX_Controls.Docker))) {
      return []
    }

    /* Get elements of the segment */
    let elementsOfSegment =
      this.attachedNodePositionData.findAll(function (nodePositionData) {
        return nodePositionData.value.segment.docker1 === startDocker &&
          nodePositionData.value.segment.docker2 === endDocker
      })

    /* Return a Hash in each case */
    if (!elementsOfSegment) {
      return []
    }

    return elementsOfSegment
  }

  /**
   * Removes an edge's child shape
   */
  remove (shape) {
    // arguments.callee.$.remove.apply(this, arguments)
    super.remove(shape)

    if (this.attachedNodePositionData.get(shape.getId())) {
      this.attachedNodePositionData.unset[shape.getId()]
    }

    /* Adjust child shapes if neccessary */
    if (shape instanceof ORYX_Controls.Docker) {
      this.handleChildShapesAfterRemoveDocker(shape)
    }
  }

  updateReferencePointOfLabel (label, intersection, from, to, dirty) {
    if (!label.getReferencePoint() || !label.isVisible) {
      return
    }

    let ref = label.getReferencePoint()

    if (ref.orientation && ref.orientation !== 'ce') {
      let angle = this._getAngle(from, to)
      if (ref.distance >= 0) {
        if (angle == 0) {
          label.horizontalAlign('left')//ref.orientation == "lr" ? "right" : "left");
          label.verticalAlign('bottom')
        } else if (angle > 0 && angle < 90) {
          label.horizontalAlign('right')
          label.verticalAlign('bottom')
        } else if (angle == 90) {
          label.horizontalAlign('right')
          label.verticalAlign('top')//ref.orientation == "lr" ? "bottom" : "top");
        } else if (angle > 90 && angle < 180) {
          label.horizontalAlign('right')
          label.verticalAlign('top')
        } else if (angle == 180) {
          label.horizontalAlign('left')//ref.orientation == "ur" ? "right" : "left");
          label.verticalAlign('top')
        } else if (angle > 180 && angle < 270) {
          label.horizontalAlign('left')
          label.verticalAlign('top')
        } else if (angle == 270) {
          label.horizontalAlign('left')
          label.verticalAlign('top')//ref.orientation == "ll" ? "bottom" : "top");
        } else if (angle > 270 && angle <= 360) {
          label.horizontalAlign('left')
          label.verticalAlign('bottom')
        }
      } else {
        if (angle == 0) {
          label.horizontalAlign('left')//ref.orientation == "ur" ? "right" : "left");
          label.verticalAlign('top')
        } else if (angle > 0 && angle < 90) {
          label.horizontalAlign('left')
          label.verticalAlign('top')
        } else if (angle == 90) {
          label.horizontalAlign('left')
          label.verticalAlign('top')//ref.orientation == "ll" ? "bottom" : "top");
        } else if (angle > 90 && angle < 180) {
          label.horizontalAlign('left')
          label.verticalAlign('bottom')
        } else if (angle == 180) {
          label.horizontalAlign('left')//ref.orientation == "lr" ? "right" : "left");
          label.verticalAlign('bottom')
        } else if (angle > 180 && angle < 270) {
          label.horizontalAlign('right')
          label.verticalAlign('bottom')
        } else if (angle == 270) {
          label.horizontalAlign('right')
          label.verticalAlign('top')//ref.orientation == "lr" ? "bottom" : "top");
        } else if (angle > 270 && angle <= 360) {
          label.horizontalAlign('right')
          label.verticalAlign('top')
        }
      }
      ref.iorientation = ref.iorientation || ref.orientation
      ref.orientation = (label.verticalAlign() == 'top' ? 'u' : 'l') + (label.horizontalAlign() == 'left' ? 'l' : 'r')
    }

    label.setReferencePoint(jQuery.extend({}, {
      intersection: intersection,
      segment: {
        from: from,
        fromIndex: this.dockers.indexOf(from),
        fromPosition: from.bounds.center(),
        to: to,
        toIndex: this.dockers.indexOf(to),
        toPosition: to.bounds.center()
      },
      dirty: dirty || false
    }, ref))
  }

  /**
   *  Adjusts the child shapes of an edges after a docker was removed.
   *
   *  @param{ORYX.Core.Controls.Docker} docker
   *    The removed docker.
   */
  handleChildShapesAfterRemoveDocker (docker) {
    /* Ensure docker type */
    if (!(docker instanceof ORYX_Controls.Docker)) {
      return
    }

    this.attachedNodePositionData.each(function (nodePositionData) {
      if (nodePositionData.value.segment.docker1 === docker) {
        /* The new start of the segment is the predecessor of docker2. */
        let index = this.dockers.indexOf(nodePositionData.value.segment.docker2)
        if (index == -1) {
          return
        }
        nodePositionData.value.segment.docker1 = this.dockers[index - 1]
      } else if (nodePositionData.value.segment.docker2 === docker) {
        /* The new end of the segment is the successor of docker1. */
        let index = this.dockers.indexOf(nodePositionData.value.segment.docker1)
        if (index == -1) {
          return
        }
        nodePositionData.value.segment.docker2 = this.dockers[index + 1]
      }
    }.bind(this))

    // Update all labels reference points
    this.getLabels().each(function (label) {
      let ref = label.getReferencePoint()
      if (!ref) {
        return
      }
      let from = ref.segment.from
      let to = ref.segment.to

      if (from !== docker && to !== docker) {
        return
      }

      let segment = this.findSegment(ref.intersection)
      if (!segment) {
        from = segment.fromDocker
        to = segment.toDocker
      } else {
        from = from === docker ? this.dockers[this.dockers.indexOf(to) - 1] : from
        to = this.dockers[this.dockers.indexOf(from) + 1]
      }

      let intersection = ORYX_Math.getPointOfIntersectionPointLine(from.bounds.center(), to.bounds.center(), ref.intersection, true)
      // Update the reference point
      this.updateReferencePointOfLabel(label, intersection, from, to, true)
    }.bind(this))

    /* Update attached nodes visual representation */
    this.refreshAttachedNodes()
  }

  /**
   *@deprecated Use the .createDocker() Method and set the point via the bounds
   */
  addDocker (position, exDocker) {
    let lastDocker
    let result
    this._dockersByPath.any((function (pair) {
      return pair.value.any((function (docker, index) {
        if (!lastDocker) {
          lastDocker = docker
          return false
        } else {
          let point1 = lastDocker.bounds.center()
          let point2 = docker.bounds.center()

          let additionalIEZoom = 1
          if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
            let ua = navigator.userAgent
            if (ua.indexOf('MSIE') >= 0) {
              //IE 10 and below
              let zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100)
              if (zoom !== 100) {
                additionalIEZoom = zoom / 100
              }
            }
          }

          if (additionalIEZoom !== 1) {
            position.x = position.x / additionalIEZoom
            position.y = position.y / additionalIEZoom
          }

          if (ORYX_Math.isPointInLine(position.x, position.y, point1.x, point1.y, point2.x, point2.y, 10)) {
            let path = this._paths.find(function (path) {
              return path.id === pair.key
            })
            if (path) {
              let allowAttr = path.getAttributeNS(ORYX_Config.NAMESPACE_ORYX, 'allowDockers')
              if (allowAttr && allowAttr.toLowerCase() === 'no') {
                return true
              }
            }

            let newDocker = (exDocker) ? exDocker : this.createDocker(this.dockers.indexOf(lastDocker) + 1, position)
            newDocker.bounds.centerMoveTo(position)
            if (exDocker) {
              this.add(newDocker, this.dockers.indexOf(lastDocker) + 1)
            }
            result = newDocker
            return true
          } else {
            lastDocker = docker
            return false
          }
        }
      }).bind(this))
    }).bind(this))
    return result
  }

  removeDocker (docker) {
    if (this.dockers.length > 2 && !(this.dockers.first() === docker)) {
      this._dockersByPath.any((function (pair) {
        if (pair.value.member(docker)) {
          if (docker === pair.value.last()) {
            return true
          } else {
            this.remove(docker)
            this._dockersByPath.set(pair.key, pair.value.without(docker))
            this.isChanged = true
            this._dockerChanged()
            return true
          }
        }
        return false
      }).bind(this))
    }
  }

  /**
   * Removes all dockers from the edge which are on
   * the line between two dockers
   * @return {Object} Removed dockers in an indicied array
   * (key is the removed position of the docker, value is docker themselve)
   */
  removeUnusedDockers () {
    let marked = new Hash()

    this.dockers.each(function (docker, i) {
      if (i == 0 || i == this.dockers.length - 1) {
        return
      }
      let previous = this.dockers[i - 1]

      /* Do not consider already removed dockers */
      if (marked.values().indexOf(previous) != -1 && this.dockers[i - 2]) {
        previous = this.dockers[i - 2]
      }
      let next = this.dockers[i + 1]

      let cp = previous.getDockedShape() && previous.referencePoint ? previous.getAbsoluteReferencePoint() : previous.bounds.center()
      let cn = next.getDockedShape() && next.referencePoint ? next.getAbsoluteReferencePoint() : next.bounds.center()
      let cd = docker.bounds.center()

      if (ORYX_Math.isPointInLine(cd.x, cd.y, cp.x, cp.y, cn.x, cn.y, 1)) {
        marked.set(i, docker)
      }
    }.bind(this))

    marked.each(function (docker) {
      this.removeDocker(docker.value)
    }.bind(this))

    if (marked.values().length > 0) {
      this._update(true)
    }

    return marked
  }

  /**
   * Initializes the Edge after loading the SVG representation of the edge.
   * @param {SVGDocument} svgDocument
   */
  _init (svgDocument) {
    // arguments.callee.$._init.apply(this, arguments)
    super._init(svgDocument)

    let minPointX, minPointY, maxPointX, maxPointY
    // init markers
    let defs = svgDocument.getElementsByTagNameNS(ORYX_Config.NAMESPACE_SVG, 'defs')
    if (defs.length > 0) {
      defs = defs[0]
      let markerElements = $A(defs.getElementsByTagNameNS(ORYX_Config.NAMESPACE_SVG, 'marker'))
      let marker
      const me = this
      markerElements.each(function (markerElement) {
        try {
          marker = new ORYX_SVG.SVGMarker(markerElement.cloneNode(true))
          me._markers.set(marker.id, marker)
          let textElements = $A(marker.element.getElementsByTagNameNS(ORYX_Config.NAMESPACE_SVG, 'text'))
          let label
          textElements.each(function (textElement) {
            label = new ORYX_SVG.Label({
              textElement: textElement,
              shapeId: this.id
            })

            me._labels.set(label.id, label)
          })
        }
        catch (e) {}
      })
    }

    let gs = svgDocument.getElementsByTagNameNS(ORYX_Config.NAMESPACE_SVG, 'g')
    if (gs.length <= 0) {
      throw 'Edge: No g element found.'
    }

    let g = gs[0]
    g.setAttributeNS(null, 'id', null)
    let isFirst = true

    $A(g.childNodes).each((function (path, index) {
      if (ORYX_Utils.checkClassType(path, SVGPathElement)) {
        path = path.cloneNode(false)

        let pathId = this.id + '_' + index
        path.setAttributeNS(null, 'id', pathId)
        this._paths.push(path)

        // check, if markers are set and update the id
        let markersByThisPath = []
        let markerUrl = path.getAttributeNS(null, 'marker-start')

        if (markerUrl && markerUrl !== '') {
          markerUrl = markerUrl.strip()
          markerUrl = markerUrl.replace(/^url\(#/, '')

          let markerStartId = this.getValidMarkerId(markerUrl)
          path.setAttributeNS(null, 'marker-start', 'url(#' + markerStartId + ')')

          markersByThisPath.push(this._markers.get(markerStartId))
        }

        markerUrl = path.getAttributeNS(null, 'marker-mid')

        if (markerUrl && markerUrl !== '') {
          markerUrl = markerUrl.strip()
          markerUrl = markerUrl.replace(/^url\(#/, '')
          let markerMidId = this.getValidMarkerId(markerUrl)
          path.setAttributeNS(null, 'marker-mid', 'url(#' + markerMidId + ')')

          markersByThisPath.push(this._markers.get(markerMidId))
        }

        markerUrl = path.getAttributeNS(null, 'marker-end')

        if (markerUrl && markerUrl !== '') {
          markerUrl = markerUrl.strip()

          let markerEndId = this.getValidMarkerId(markerUrl)
          path.setAttributeNS(null, 'marker-end', 'url(#' + markerEndId + ')')

          markersByThisPath.push(this._markers.get(markerEndId))
        }

        this._markersByPath[pathId] = markersByThisPath

        // init dockers
        let parser = new PathParser()
        let handler = new ORYX_SVG.PointsPathHandler()
        parser.setHandler(handler)
        parser.parsePath(path)

        if (handler.points.length < 4) {
          throw 'Edge: Path has to have two or more points specified.'
        }

        this._dockersByPath.set(pathId, [])

        for (let i = 0; i < handler.points.length; i += 2) {
          // handler.points.each((function(point, pIndex){
          let x = handler.points[i]
          let y = handler.points[i + 1]
          if (isFirst || i > 0) {
            let docker = new ORYX_Controls.Docker({
              eventHandlerCallback: this.eventHandlerCallback
            })

            docker.bounds.centerMoveTo(x, y)
            docker.bounds.registerCallback(this._dockerChangedCallback)
            this.add(docker, this.dockers.length)

            // this._dockersByPath[pathId].push(docker);

            // calculate minPoint and maxPoint
            if (minPointX) {
              minPointX = Math.min(x, minPointX)
              minPointY = Math.min(y, minPointY)
            } else {
              minPointX = x
              minPointY = y
            }

            if (maxPointX) {
              maxPointX = Math.max(x, maxPointX)
              maxPointY = Math.max(y, maxPointY)
            } else {
              maxPointX = x
              maxPointY = y
            }
          }
          //}).bind(this));
        }
        isFirst = false
      }
    }).bind(this))

    this.bounds.set(minPointX, minPointY, maxPointX, maxPointY)

    if (false && (this.bounds.width() === 0 || this.bounds.height() === 0)) {
      let width = this.bounds.width()
      let height = this.bounds.height()

      this.bounds.extend({
        x: width === 0 ? 2 : 0,
        y: height === 0 ? 2 : 0
      })

      this.bounds.moveBy({
        x: width === 0 ? -1 : 0,
        y: height === 0 ? -1 : 0
      })

    }

    this._oldBounds = this.bounds.clone()

    // add paths to this.node
    this._paths.reverse()
    let paths = []
    this._paths.each((function (path) {
      paths.push(this.node.childNodes[0].childNodes[0].childNodes[0].appendChild(path))
    }).bind(this))

    this._paths = paths

    // init interaction path
    this._paths.each((function (path) {
      let iPath = path.cloneNode(false)
      iPath.setAttributeNS(null, 'id', undefined)
      iPath.setAttributeNS(null, 'stroke-width', 10)
      iPath.setAttributeNS(null, 'visibility', 'hidden')
      iPath.setAttributeNS(null, 'stroke-dasharray', null)
      iPath.setAttributeNS(null, 'stroke', 'black')
      iPath.setAttributeNS(null, 'fill', 'none')
      iPath.setAttributeNS(null, 'title', this.getStencil().title())
      this._interactionPaths.push(this.node.childNodes[0].childNodes[0].childNodes[0].appendChild(iPath))
    }).bind(this))

    this._paths.reverse()
    this._interactionPaths.reverse()

    /**initialize labels*/
    let textElems = svgDocument.getElementsByTagNameNS(ORYX_Config.NAMESPACE_SVG, 'text')

    $A(textElems).each((function (textElem) {
      let label = new ORYX_SVG.Label({
        textElement: textElem,
        shapeId: this.id
      })
      this.node.childNodes[0].childNodes[0].appendChild(label.node)
      this._labels.set(label.id, label)

      label.registerOnChange(this.layout.bind(this))
    }).bind(this))

    this.propertiesChanged.each(function (pair) {
      pair.value = true
    })

    //if(this.dockers.length == 2) {


    //  }

    //this._update(true);
  }

  getValidMarkerId (markerUrl) {
    if (markerUrl.indexOf('url("#') >= 0) {
      // Fix for IE9, additional quotes are added to the <id
      let rawId = markerUrl.replace(/^url\(\"#/, '').replace(/\"\)$/, '')
      return this.id + rawId
    } else {
      markerUrl = markerUrl.replace(/^url\(#/, '')
      return this.id.concat(markerUrl.replace(/\)$/, ''))
    }
  }

  /**
   * Adds all necessary markers of this Edge to the SVG document.
   * Has to be called, while this.node is part of DOM.
   */
  addMarkers (defs) {
    this._markers.each(function (marker) {
      if (!defs.ownerDocument.getElementById(marker.value.id)) {
        marker.value.element = defs.appendChild(marker.value.element)
      }
    })
  }

  /**
   * Removes all necessary markers of this Edge from the SVG document.
   * Has to be called, while this.node is part of DOM.
   */
  removeMarkers () {
    let svgElement = this.node.ownerSVGElement
    if (svgElement) {
      let defs = svgElement.getElementsByTagNameNS(ORYX_Config.NAMESPACE_SVG, 'defs')
      if (defs.length > 0) {
        defs = defs[0]
        this._markers.each(function (marker) {
          let foundMarker = defs.ownerDocument.getElementById(marker.value.id)
          if (foundMarker) {
            marker.value.element = defs.removeChild(marker.value.element)
          }
        })
      }
    }
  }

  /**
   * Calls when a docker has changed
   */
  _dockerChanged () {
    //this._update(true);
    this._dockerUpdated = true
  }

  serialize () {
    let result = super.serialize()
    // var result = arguments.callee.$.serialize.apply(this)

    //add dockers triple
    let value = ''
    this._dockersByPath.each((function (pair) {
      pair.value.each(function (docker) {
        let position = docker.getDockedShape() && docker.referencePoint ? docker.referencePoint : docker.bounds.center()
        value = value.concat(position.x + ' ' + position.y + ' ')
      })

      value += ' # '
    }).bind(this))
    result.push({
      name: 'dockers',
      prefix: 'oryx',
      value: value,
      type: 'literal'
    })

    //add parent triple dependant on the dockedShapes
    //TODO change this when canvas becomes a resource
    /*        var source = this.dockers.first().getDockedShape();
     var target = this.dockers.last().getDockedShape();
     var sharedParent;
     if (source && target) {
     //get shared parent
     while (source.parent) {
     source = source.parent;
     if (source instanceof ORYX.Core.Canvas) {
     sharedParent = source;
     break;
     }
     else {
     var targetParent = target.parent;
     var found;
     while (targetParent) {
     if (source === targetParent) {
     sharedParent = source;
     found = true;
     break;
     }
     else {
     targetParent = targetParent.parent;
     }
     }
     if (found) {
     break;
     }
     }
     }
     }
     else
     if (source) {
     sharedParent = source.parent;
     }
     else
     if (target) {
     sharedParent = target.parent;
     }
     */
    //if (sharedParent) {
    /*            result.push({
     name: 'parent',
     prefix: 'raziel',
     //value: '#' + ERDF.__stripHashes(sharedParent.resourceId),
     value: '#' + ERDF.__stripHashes(this.getCanvas().resourceId),
     type: 'resource'
     });*/
    //}

    //serialize target and source
    let lastDocker = this.dockers.last()
    let target = lastDocker.getDockedShape()

    if (target) {
      result.push({
        name: 'target',
        prefix: 'raziel',
        value: '#' + ERDF.__stripHashes(target.resourceId),
        type: 'resource'
      })
    }

    try {
      //result = this.getStencil().serialize(this, result);
      let serializeEvent = this.getStencil().serialize()

      /*
       * call serialize callback by reference, result should be found
       * in serializeEvent.result
       */
      if (serializeEvent.type) {
        serializeEvent.shape = this
        serializeEvent.data = result
        serializeEvent.result = undefined
        serializeEvent.forceExecution = true

        this._delegateEvent(serializeEvent)

        if (serializeEvent.result) {
          result = serializeEvent.result
        }
      }
    }
    catch (e) {}
    return result
  }

  deserialize (data) {
    try {
      // data = this.getStencil().deserialize(this, data);
      let deserializeEvent = this.getStencil().deserialize()

      /*
       * call serialize callback by reference, result should be found
       * in serializeEventInfo.result
       */
      if (deserializeEvent.type) {
        deserializeEvent.shape = this
        deserializeEvent.data = data
        deserializeEvent.result = undefined
        deserializeEvent.forceExecution = true

        this._delegateEvent(deserializeEvent)
        if (deserializeEvent.result) {
          data = deserializeEvent.result
        }
      }
    }
    catch (e) {}

    // Set the outgoing shapes
    let target = data.find(function (ser) {
      return (ser.prefix + '-' + ser.name) == 'raziel-target'
    })
    let targetShape
    if (target) {
      targetShape = this.getCanvas().getChildShapeByResourceId(target.value)
    }

    let outgoing = data.findAll(function (ser) {
      return (ser.prefix + '-' + ser.name) == 'raziel-outgoing'
    })
    outgoing.each((function (obj) {
      // TODO: Look at Canvas
      if (!this.parent) {
        return
      }

      // Set outgoing Shape
      let next = this.getCanvas().getChildShapeByResourceId(obj.value)

      if (next) {
        if (next == targetShape) {
          // If this is an edge, set the last docker to the next shape
          this.dockers.last().setDockedShape(next)
          this.dockers.last().setReferencePoint({ x: next.bounds.width() / 2.0, y: next.bounds.height() / 2.0 })
        } else if (next instanceof Edge) {
          // Set the first docker of the next shape
          next.dockers.first().setDockedShape(this)
          //next.dockers.first().setReferencePoint({x: this.bounds.width() / 2.0, y: this.bounds.height() / 2.0});
        }
        /*else if(next.dockers.length > 0) { //next is a node and next has a docker
         next.dockers.first().setDockedShape(this);
         next.dockers.first().setReferencePoint({x: this.bounds.width() / 2.0, y: this.bounds.height() / 2.0});
         }*/
      }

    }).bind(this))

    let oryxDockers = data.find(function (obj) {
      return (obj.prefix === 'oryx' &&
        obj.name === 'dockers')
    })

    if (oryxDockers) {
      let dataByPath = oryxDockers.value.split('#').without('').without(' ')

      dataByPath.each((function (data, index) {
        let values = data.replace(/,/g, ' ').split(' ').without('')

        // for each docker two values must be defined
        if (values.length % 2 === 0) {
          let path = this._paths[index]

          if (path) {
            if (index === 0) {
              while (this._dockersByPath.get(path.id).length > 2) {
                this.removeDocker(this._dockersByPath.get(path.id)[1])
              }
            } else {
              while (this._dockersByPath.get(path.id).length > 1) {
                this.removeDocker(this._dockersByPath.get(path.id)[0])
              }
            }

            let dockersByPath = this._dockersByPath.get(path.id)

            if (index === 0) {
              // set position of first docker
              let x = parseFloat(values.shift())
              let y = parseFloat(values.shift())

              if (dockersByPath.first().getDockedShape()) {
                dockersByPath.first().setReferencePoint({
                  x: x,
                  y: y
                })
              } else {
                dockersByPath.first().bounds.centerMoveTo(x, y)
              }
            }

            // set position of last docker
            let y = parseFloat(values.pop())
            let x = parseFloat(values.pop())

            if (dockersByPath.last().getDockedShape()) {
              dockersByPath.last().setReferencePoint({
                x: x,
                y: y
              })
            } else {
              dockersByPath.last().bounds.centerMoveTo(x, y)
            }

            // add additional dockers
            for (let i = 0; i < values.length; i++) {
              x = parseFloat(values[i])
              y = parseFloat(values[++i])

              let newDocker = this.createDocker()
              newDocker.bounds.centerMoveTo(x, y)

              //this.dockers = this.dockers.without(newDocker);
              //this.dockers.splice(this.dockers.indexOf(dockersByPath.last()), 0, newDocker);
              //dockersByPath.splice(this.dockers.indexOf(dockersByPath.last()), 0, newDocker);
            }
          }
        }
      }).bind(this))
    } else {
      this.alignDockers()
    }

    // arguments.callee.$.deserialize.apply(this, arguments)
    super.deserialize(...arguments)
    this._changed()
  }

  toString () {
    return this.getStencil().title() + ' ' + this.id
  }

  /**
   * @return {ORYX.Core.Shape} Returns last docked shape or null.
   */
  getTarget () {
    return this.dockers.last() ? this.dockers.last().getDockedShape() : null
  }

  /**
   * @return {ORYX.Core.Shape} Returns the first docked shape or null
   */
  getSource () {
    return this.dockers.first() ? this.dockers.first().getDockedShape() : null
  }

  /**
   * Checks whether the edge is at least docked to one shape.
   *
   * @return {boolean} True if edge is docked
   */
  isDocked () {
    let isDocked = false
    this.dockers.each(function (docker) {
      if (docker.isDocked()) {
        isDocked = true
        throw $break
      }
    })
    return isDocked
  }

  /**
   * Calls {@link ORYX.Core.AbstractShape#toJSON} and add a some stencil set information.
   */
  toJSON () {
    // var json = arguments.callee.$.toJSON.apply(this, arguments)
    let json = super.toJSON()

    if (this.getTarget()) {
      json.target = {
        resourceId: this.getTarget().resourceId
      }
    }

    return json
  }

  getInstanceofType () {
    return 'Edge, Shape'
  }
}
