import Control from './Control'
import ORYX_Config from '../../CONFIG'
import ORYX_Utils from '../../Utils'
import ORYX_Math from '../Math'
import ORYX_Controls from './index'


/**
 * @classDescription Represents a movable docker that can be bound to a shape. Dockers are used
 * for positioning shape objects.
 * @extends {Control}
 *
 * TODO absoluteXY und absoluteCenterXY von einem Docker liefern falsche Werte!!!
 */
export default class Segment extends Control {
  constructor (options) {
    super(...arguments)
    this.isMovable = true				// Enables movability
    this.segmentStartDocker = options.docker1
    this.segmentEndDocker = options.docker2
    let point1 = options.point1
    let point2 = options.point2
    this.node = ORYX_Utils.graft('http://www.w3.org/2000/svg', null, ['g'])

    this.isStraightLine = ORYX_Math.isStraightLine(point1, point2)
    let bound = {}
    if (this.isStraightLine === 'ver') {
      bound = {
        a: point1.x -2,
        b: point1.y < point2.y ?  point1.y + 4 : point2.y + 4,
        width: 4,
        height: Math.abs(point1.y - point2.y) - 8,
        cursor: 'ew-resize'
      }
    } else if (this.isStraightLine === 'hor') {
      bound = {
        a: point1.x < point2.x ?  point1.x + 4 : point2.x + 4,
        b: point1.y - 2,
        width: Math.abs(point1.x - point2.x) - 8,
        height: 4,
        cursor: 'ns-resize'
      }
    }

    // Set the bounds
    this.bounds.set(bound.a, bound.b, bound.a + bound.width, bound.b + bound.height)

    // The DockerNode reprasentation
    this._dockerNode = ORYX_Utils.graft('http://www.w3.org/2000/svg',
      this.node,
      ['g', { 'pointer-events': 'visible' },
        ['rect', { x: bound.a, y: bound.b - 3, width: bound.width, height: bound.height + 6,
          stroke: 'none', fill: 'none' }],
        ['rect', { x: bound.a, y: bound.b, width: bound.width, height: bound.height,
          stroke: 'black', fill: '#ffff79', 'stroke-width': '1', style: `cursor:${bound.cursor}` }]
      ])
    this.hide()
    this.addEventHandlers(this._dockerNode)

    // Buffer the Update Callback for un-/register on Event-Handler
    this._updateCallback = this._changed.bind(this)
  }
  update () {
    super.update()
  }
  /**
   * Calls the super class refresh method and updates the view of the docker.
   */
  refresh () {
    super.refresh()
    // Refresh the dockers node
    let p = this.bounds.upperLeft()
    this._dockerNode.setAttributeNS(null, 'transform', 'translate(' + p.x + ', ' + p.y + ')')
  }

  /**
   * Hides this UIObject and all its children.
   */
  hide () {
    if (this._preventHiding) {
      return false
    }
    // Hide Visual and reference point
    this.node.setAttributeNS(null, 'visibility', 'hidden')
  }
  /**
   * Enables visibility of this UIObject and all its children.
   */
  show () {
    // Show Visual
    this.node.setAttributeNS(null, 'visibility', 'visible')
  }
  toString() {
    return 'SegmentVisual ' + this.id
  }
  getInstanceofType () {
    return 'SegmentVisual'
  }
}
