import AbstractPlugin from './AbstractPlugin'
import SelectedRect from './SelectedRect'
import GridLine from './GridLine'
import Resizer from './Resizer'
import ORYX_Edge from '../core/Edge'
import ORYX_Node from '../core/Node'
import ORYX_Shape from '../core/Shape'
import ORYX_Canvas from '../core/Canvas'
import ORYX_Command from '../core/Command'
import ORYX_Command_Move from '../core/Move'
import ORYX_Config from '../CONFIG'
import ORYX_Utils from '../Utils'
import Control from '../core/Controls/Control'

export default class PoolResizer extends Control {
  constructor (parentId, facade) {
    super(...arguments)
    this.facade = facade
    this.parentId = parentId
    this.margin = 5
    this.isMovable = true				// Enables movability
    this.bounds = null		// Set the bounds

    this.node = ORYX_Utils.graft('http://www.w3.org/2000/svg', $(parentId), ['g'])

    // The DockerNode reprasentation
    this._lineArea = ORYX_Utils.graft('http://www.w3.org/2000/svg',
      this.node,
      ['g', {
        'style': 'cursor: n-resize'
      },
        ['line', { x1: '0', y1: '0', x2: '100', y2: '0', stroke: '#5581b9', fill: 'none' }],
        ['line', { x1: '0', y1: '5', x2: '100', y2: '5',
          stroke: '#5581b9',  'stroke-width': 8, 'stroke-opacity': 0.3, fill: 'none' }],
        ['line', { x1: '0', y1: '10', x2: '100', y2: '10', stroke: '#5581b9', fill: 'none' }]
      ])
    this.node.addEventListener(ORYX_Config.EVENT_MOUSEOVER, this.handleMouseOver.bind(this), true)
    this.node.addEventListener(ORYX_Config.EVENT_MOUSEOUT, this.handleMouseOut.bind(this), true)
    this.node.addEventListener(ORYX_Config.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this), true)
    this.dragEnable = false
    this.offSetPosition = { x: 0, y: 0 }
    this.bounds = null
    this.resizeCallbacks = []
    this.resizeStartCallbacks = []
    this.resizeEndCallbacks = []
    this.hide()

  }
  handleMouseOver () {
    this.mousrOver = true
  }
  handleMouseOut () {
    if (!this.dragEnable) {
      this.mousrOver = false
      this.hide()
    }
  }
  registerOnResizeStart (callback) {
    if (!this.resizeStartCallbacks.member(callback)) {
      this.resizeStartCallbacks.push(callback)
    }
  }
  registerOnResizeEnd (callback) {
    if (!this.resizeEndCallbacks.member(callback)) {
      this.resizeEndCallbacks.push(callback)
    }
  }
  registerOnResize (callback) {
    if (!this.resizeCallbacks.member(callback)) {
      this.resizeCallbacks.push(callback)
    }
  }
  handleMouseDown (event) {
    this.dragEnable = true
    this.startEventPoint = {
      x: Event.pointerX(event),
      y: Event.pointerY(event)
    }
    this.offsetPosition = {
      x: Event.pointerX(event),
      y: Event.pointerY(event)
    }
    this.resizeStartCallbacks.each((function (value) {
      value(this.bounds)
    }).bind(this))

    document.documentElement.addEventListener(ORYX_Config.EVENT_MOUSEUP, this.handleMouseUp.bind(this), true)
    document.documentElement.addEventListener(ORYX_Config.EVENT_MOUSEMOVE, this.handleMouseMove.bind(this), false)
  }
  handleMouseMove (event) {
    if (!this.dragEnable) {
      return
    }
    this.aspectRatio = undefined

    let offset = {
      x: Event.pointerX(event) - this.startEventPoint.x,
      y: Event.pointerY(event) - this.startEventPoint.y
    }
    let totalOffset = {
      x: Event.pointerX(event) - this.offsetPosition.x,
      y: Event.pointerY(event) - this.offsetPosition.y
    }
    // if (offset.y < 0) {
    //   if (this.bounds.a.y + offset.y < 0) {
    //     offset.y = - this.bounds.a.y
    //   }
    // } else {
    //   if (this.bounds.a.y + offset.y < 0) {
    //     offset.y = - this.bounds.a.y
    //   }
    // }
    console.log(this.orientation, totalOffset)

    switch (this.orientation) {
      case 'upLH':
        this.bounds.extend({ x: 0, y: -offset.y })
        this.bounds.moveBy({ x: 0, y: offset.y })
        this.node.setAttributeNS(null, 'transform',
          `translate(${this.position.x}, ${this.position.y + totalOffset.y})`)
        break
      case 'downRH':
        this.bounds.extend({ x: 0, y: offset.y })
        this.node.setAttributeNS(null, 'transform',
          `translate(${this.position.x}, ${this.position.y + totalOffset.y})`)
        break
      case 'leftV':
        this.bounds.extend({ x: -offset.x, y: 0 })
        this.bounds.moveBy({ x: offset.x, y: 0 })
        this.node.setAttributeNS(null, 'transform',
          `translate(${this.position.x + totalOffset.x}, ${this.position.y}) rotate(90)`)
        break
      case 'rightV':
        this.bounds.extend({ x: offset.x, y: 0 })
        this.node.setAttributeNS(null, 'transform',
          `translate(${this.position.x + totalOffset.x}, ${this.position.y}) rotate(90)`)
        break
    }
    this.resizeCallbacks.each((function (value) {
      value(this.bounds)
    }).bind(this))
    this.startEventPoint = {
      x: Event.pointerX(event),
      y: Event.pointerY(event)
    }
    Event.stop(event)
  }
  handleMouseUp (event) {
    // console.log(67890, this.bounds)
    this.dragEnable = false
    this.containmentParentNode = null

    this.position = {
      x: this.position.x - this.offsetPosition.x,
      y: this.position.y - this.offsetPosition.y
    }
    this.resizeEndCallbacks.each((function (value) {
      value(this.bounds)
    }).bind(this))

    // document.documentElement.removeEventListener(ORYX_Config.EVENT_MOUSEUP, this.handleMouseUp, true)
    // document.documentElement.removeEventListener(ORYX_Config.EVENT_MOUSEMOVE, this.handleMouseMove, false)
  }
  hide () {
    this.node.setAttributeNS(null, 'display', 'none')
  }
  show () {
    this.node.setAttributeNS(null, 'display', '')
  }
  resize (bounds, where) {
    this.bounds = bounds
    this.orientation = where
    switch (where) {
      case 'upLH': // 顶横
        this.setLineSize(bounds.width(), 'hor', {
          x: bounds.a.x,
          y: bounds.a.y - this.margin
        })
        break
      case 'downRH':
        this.setLineSize(bounds.width(), 'hor', {
          x: bounds.a.x,
          y: bounds.b.y - this.margin
        })
        break
      case 'leftV':
        this.setLineSize(bounds.height(), 'ver', {
          x: bounds.a.x + this.margin,
          y: bounds.a.y
        })
        break
      case 'rightV':
        this.setLineSize(bounds.height(), 'ver', {
          x: bounds.b.x + this.margin,
          y: bounds.a.y
        })
        break
    }

  }
  setLineSize (width, type, point) {
    this.position = point
    let childs = this._lineArea.childNodes
    childs.forEach((item) => {
      item.setAttributeNS(null, 'x2', width)
    })
    // this._dockerNode.lastChild.setAttributeNS(null, 'fill', color)
    // this._lineArea.setAttributeNS(null, 'width', bounds.width())
    // this._lineArea.setAttributeNS(null, 'height', bounds.height())
    this._lineArea.setAttributeNS(null, 'style', type === 'ver' ? 'cursor: e-resize' : 'cursor: n-resize')
    this.node.setAttributeNS(null, 'transform',
      `translate(${point.x}, ${point.y}) ${type === 'ver' ? 'rotate(90)' : ''}`)
  }
  getInstanceofType () {
    return 'PoolResizer'
  }
}
