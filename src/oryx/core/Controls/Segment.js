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
        // a: point1.x -2,
        // b: point1.y < point2.y ?  point1.y + 4 : point2.y + 4,
        // width: 4,
        // height: Math.abs(point1.y - point2.y) - 8,
        cursor: 'ew-resize'
      }
    } else if (this.isStraightLine === 'hor') {
      bound = {
        // a: point1.x < point2.x ?  point1.x + 4 : point2.x + 4,
        // b: point1.y - 2,
        // width: Math.abs(point1.x - point2.x) - 8,
        // height: 4,
        cursor: 'ns-resize'
      }
    }

    // Set the bounds
    this.bounds.set(0, 0, 10, 10)

    // The DockerNode reprasentation
    // this._dockerNode = ORYX_Utils.graft('http://www.w3.org/2000/svg',
    //   this.node,
    //   ['g', { 'pointer-events': 'visible' },
    //     ['rect', { x: bound.a, y: bound.b - 3, width: bound.width, height: bound.height + 6,
    //       stroke: 'none', fill: 'none' }],
    //     ['rect', { x: bound.a, y: bound.b, width: bound.width, height: bound.height,
    //       stroke: 'black', fill: '#ffff79', 'stroke-width': '1', style: `cursor:${bound.cursor}` }]
    //   ])

    this._dockerNode = ORYX_Utils.graft('http://www.w3.org/2000/svg',
      this.node,
      ['g', { 'pointer-events': 'visible' },
        // ['rect', { x: 0, y: 0, width: 10, height: 10,
        //   stroke: 'black', fill: 'red', 'stroke-width': '1', style: `cursor:${bound.cursor}` }],
        ['rect', { x: 0, y: 0, width: 1, height: 1,
          stroke: '#fff', fill: '#49924e', 'stroke-width': '3', style: `cursor:${bound.cursor}` }]
      ])

    // this.hide()
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
    let bound = {}
    let point1 = this.segmentStartDocker.bounds.center()
    let point2 = this.segmentEndDocker.bounds.center()
    let smallThenminSize = true
    if (this.isStraightLine === 'ver') {
      bound = {
        a: point1.x - 3,
        b: point1.y < point2.y ?  point1.y + 4 : point2.y + 4,
        width: 6,
        height: Math.abs(point1.y - point2.y) - 8,
        mid: {x: point1.x, y: bound.b + bound.height / 2}
      }
      if (bound.height > 4) smallThenminSize = false
    } else if (this.isStraightLine === 'hor') {
      bound = {
        a: point1.x < point2.x ?  point1.x + 4 : point2.x + 4,
        b: point1.y - 3,
        width: Math.abs(point1.x - point2.x) - 8,
        height: 6,
        mid: {x: bound.a + bound.width / 2, y: point1.y}
      }
      if (bound.width > 4) smallThenminSize = false
    }
    // let p = this.bounds.upperLeft()
    // this._dockerNode.setAttributeNS(null, 'transform', 'translate(' + p.x + ', ' + p.y + ')')

    if (!smallThenminSize) {
      this._dockerNode.setAttributeNS(null, 'display', 'unset')
      let rect = this._dockerNode.getElementsByTagName('rect')
      this._dockerNode.setAttributeNS(null, 'transform', 'translate(' + bound.a + ', ' + bound.b + ')')
      rect[0].setAttributeNS(null, 'width', bound.width)
      rect[0].setAttributeNS(null, 'height', bound.height)
      // rect[1].setAttributeNS(null, 'width', bound.width)
      // rect[1].setAttributeNS(null, 'height', bound.height)
      // Set the bounds to the new point
      this.bounds.centerMoveTo(bound.mid.x, bound.mid.y)
    } else {
      this._dockerNode.setAttributeNS(null, 'display', 'none')
    }
    // console.log(1, this.isStraightLine, this.segmentStartDocker, this.segmentEndDocker,  bound.height)
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
