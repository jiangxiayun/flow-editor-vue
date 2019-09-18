import ORYX_Config from '../CONFIG'
import ORYX_Utils from '../Utils'
import ORYX_Canvas from '../core/Canvas'

export default class SelectionFrame {
  constructor (facade) {
    this.facade = facade
    // Register on MouseEvents
    this.handleMouseUpFun = this.handleMouseUp.bind(this)
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_CANVAS_SCROLL, this.canvasScroll.bind(this))
    document.documentElement.addEventListener(ORYX_Config.EVENT_MOUSEUP, this.handleMouseUpFun, true)

    // Some initiale variables
    this.position = { x: 0, y: 0 }
    this.size = { width: 0, height: 0 }
    this.offsetPosition = { x: 0, y: 0 }
    this.selectMoving = false

    // (Un)Register Mouse-Move Event
    this.moveCallback = undefined
    this.offsetScroll = { x: 0, y: 0 }
    // HTML-Node of Selection-Frame
    this.node = ORYX_Utils.graft('http://www.w3.org/1999/xhtml', $('canvasSection'),
      ['div', { 'class': 'Oryx_SelectionFrame' }])

    this.CanvasSection = jQuery('#canvasSection')
    this.hide()
  }

  handleMouseDown (event, uiObj) {
    // If there is the Canvas
    if (uiObj instanceof ORYX_Canvas) {
      this.selectMoving = true
      // Calculate the Offset
      let scrollNode = uiObj.rootNode.parentNode.parentNode
      this.offsetScroll = { x: scrollNode.scrollLeft, y: scrollNode.scrollTop }
      let a = this.facade.getCanvas().node.getScreenCTM()
      this.offsetPosition = {
        x: a.e,
        y: a.f
      }

      // Set the new Position
      this.setPos({
        x: Event.pointerX(event) - this.CanvasSection.offset().left,
        y: Event.pointerY(event) - this.CanvasSection.offset().top + 5
      })

      // Reset the size
      this.resize({ width: 0, height: 0 })
      this.moveCallback = this.handleMouseMove.bind(this)

      // Register Mouse-Move Event
      document.documentElement.addEventListener(ORYX_Config.EVENT_MOUSEMOVE, this.moveCallback, false)
      // Show the Frame
      this.show()
    }

    // 阻止事件继续冒泡
    event.stopPropagation()
    // Event.stop(event)
  }

  handleMouseMove (event) {
    if (!this.selectMoving) {
      return
    }
    // Calculate the size
    const CanvasSection_offset = this.CanvasSection.offset()
    let size = {
      width: Event.pointerX(event) - this.position.x - CanvasSection_offset.left,
      height: Event.pointerY(event) - this.position.y - CanvasSection_offset.top + 5
    }

    // const scrollNode = this.facade.getCanvas().rootNode.parentNode.parentNode
    const scrollNode = document.getElementById('canvasSection')
    size.width -= this.offsetScroll.x - scrollNode.scrollLeft
    size.height -= this.offsetScroll.y - scrollNode.scrollTop

    this.moveimgSize = size
    // Set the size
    this.resize(size)
    Event.stop(event)
  }

  canvasScroll (event) {
    if (!this.selectMoving) {
      return
    }
    const scrollNode = document.getElementById('canvasSection')
    let { x, y } = this.offsetScroll
    // 与鼠标down 时的偏移差
    let offset = {
      x: scrollNode.scrollLeft - x,
      y: scrollNode.scrollTop - y
    }

    // 顶点坐标变化，拓展 scroll 偏移距离
    this.setPos({
      x: this.position.x - offset.x,
      y: this.position.y - offset.y
    })
    // let size = {
    //   width: this.moveimgSize.width + offset.x,
    //   height: this.moveimgSize.height + offset.y
    // }
    this.moveimgSize.width += offset.x
    this.moveimgSize.height += offset.y
    this.resize(this.moveimgSize)

    // this.offsetScroll = {
    //   x: this.offsetScroll.x + offset.x,
    //   y: this.offsetScroll.y + offset.y
    // }

    this.offsetScroll = {
      x: scrollNode.scrollLeft,
      y: scrollNode.scrollTop
    }
  }

  handleMouseUp (event) {
    this.selectMoving = false
    // If there was an MouseMoving
    if (this.moveCallback) {
      // Hide the Frame
      this.hide()

      // Unregister Mouse-Move
      document.documentElement.removeEventListener(ORYX_Config.EVENT_MOUSEMOVE, this.moveCallback, false)

      this.moveCallback = undefined
      let corrSVG = this.facade.getCanvas().node.getScreenCTM()
      // Calculate the positions of the Frame
      let a = {
        x: this.size.width > 0 ? this.position.x : this.position.x + this.size.width,
        y: this.size.height > 0 ? this.position.y : this.position.y + this.size.height
      }
      let b = {
        x: a.x + Math.abs(this.size.width),
        y: a.y + Math.abs(this.size.height)
      }

      let additionalIEZoom = 1
      additionalIEZoom = ORYX_Utils.IEZoomBelow10(additionalIEZoom)

      if (additionalIEZoom === 1) {
        a.x = a.x - (corrSVG.e - jQuery('#canvasSection').offset().left)
        a.y = a.y - (corrSVG.f - jQuery('#canvasSection').offset().top)
        b.x = b.x - (corrSVG.e - jQuery('#canvasSection').offset().left)
        b.y = b.y - (corrSVG.f - jQuery('#canvasSection').offset().top)
      } else {
        let canvasOffsetLeft = jQuery('#canvasSection').offset().left
        let canvasScrollLeft = jQuery('#canvasSection').scrollLeft()
        let canvasScrollTop = jQuery('#canvasSection').scrollTop()

        let offset = a.e - (canvasOffsetLeft * additionalIEZoom)
        let additionaloffset = 0
        if (offset > 10) {
          additionaloffset = (offset / additionalIEZoom) - offset
        }

        a.x = a.x - (corrSVG.e - (canvasOffsetLeft * additionalIEZoom) + additionaloffset + ((canvasScrollLeft * additionalIEZoom) - canvasScrollLeft))
        a.y = a.y - (corrSVG.f - (jQuery('#canvasSection').offset().top * additionalIEZoom) + ((canvasScrollTop * additionalIEZoom) - canvasScrollTop))
        b.x = b.x - (corrSVG.e - (canvasOffsetLeft * additionalIEZoom) + additionaloffset + ((canvasScrollLeft * additionalIEZoom) - canvasScrollLeft))
        b.y = b.y - (corrSVG.f - (jQuery('#canvasSection').offset().top * additionalIEZoom) + ((canvasScrollTop * additionalIEZoom) - canvasScrollTop))
      }
      // Fit to SVG-Coordinates
      a.x /= corrSVG.a
      a.y /= corrSVG.d
      b.x /= corrSVG.a
      b.y /= corrSVG.d

      // Calculate the elements from the childs of the canvas
      let elements = this.facade.getCanvas().getChildShapes(true).findAll(function (value) {
        let absBounds = value.absoluteBounds()
        let bA = absBounds.upperLeft()
        let bB = absBounds.lowerRight()
        if (bA.x > a.x && bA.y > a.y && bB.x < b.x && bB.y < b.y) {
          return true
        }
        return false
      })

      // Set the selection
      this.facade.setSelection(elements)
    }
  }

  hide () {
    this.node.style.display = 'none'
  }

  show () {
    this.node.style.display = ''
  }

  setPos (pos) {
    // Set the Position
    this.node.style.top = pos.y + 'px'
    this.node.style.left = pos.x + 'px'
    this.position = pos
  }

  resize (size) {
    // Calculate the negative offset
    // this.setPos(this.position)
    this.size = Object.clone(size)

    if (size.width < 0) {
      this.node.style.left = (this.position.x + size.width) + 'px'
      size.width = -size.width
    }
    if (size.height < 0) {
      this.node.style.top = (this.position.y + size.height) + 'px'
      size.height = -size.height
    }

    // Set the size
    this.node.style.width = size.width + 'px'
    this.node.style.height = size.height + 'px'
  }

  clearAddEventListener () {
    document.documentElement.removeEventListener(ORYX_Config.EVENT_MOUSEUP, this.handleMouseUpFun, true)
  }
}
