import ORYX_Config from '../CONFIG'
import ORYX_Utils from '../Utils'

import ORYX_Canvas from '../core/Canvas'

export default class SelectionFrame {

  constructor (facade) {
    this.facade = facade

    // Register on MouseEvents
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this))
    document.documentElement.addEventListener(ORYX_Config.EVENT_MOUSEUP, this.handleMouseUp.bind(this), true)

    // Some initiale variables
    this.position = { x: 0, y: 0 }
    this.size = { width: 0, height: 0 }
    this.offsetPosition = { x: 0, y: 0 }

    // (Un)Register Mouse-Move Event
    this.moveCallback = undefined
    this.offsetScroll = { x: 0, y: 0 }
    // HTML-Node of Selection-Frame
    this.node = ORYX_Utils.graft('http://www.w3.org/1999/xhtml', $('canvasSection'),
      ['div', { 'class': 'Oryx_SelectionFrame' }])

    this.hide()
  }

  handleMouseDown (event, uiObj) {
    // If there is the Canvas
    if (uiObj instanceof ORYX_Canvas) {
      // Calculate the Offset
      let scrollNode = uiObj.rootNode.parentNode.parentNode
      let a = this.facade.getCanvas().node.getScreenCTM()
      this.offsetPosition = {
        x: a.e,
        y: a.f
      }

      // Set the new Position
      this.setPos({
        x: Event.pointerX(event) - jQuery('#canvasSection').offset().left,
        y: Event.pointerY(event) - jQuery('#canvasSection').offset().top + 5
      })

      // Reset the size
      this.resize({ width: 0, height: 0 })
      this.moveCallback = this.handleMouseMove.bind(this)

      // Register Mouse-Move Event
      document.documentElement.addEventListener(ORYX_Config.EVENT_MOUSEMOVE, this.moveCallback, false)

      this.offsetScroll = { x: scrollNode.scrollLeft, y: scrollNode.scrollTop }

      // Show the Frame
      this.show()
    }

    Event.stop(event)
  }

  handleMouseUp (event) {
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
        if (bA.x > a.x && bA.y > a.y && bB.x < b.x && bB.y < b.y)
          return true
        return false
      })

      // Set the selection
      this.facade.setSelection(elements)
    }
  }

  handleMouseMove (event) {
    // Calculate the size
    let size = {
      width: Event.pointerX(event) - this.position.x - jQuery('#canvasSection').offset().left,
      height: Event.pointerY(event) - this.position.y - jQuery('#canvasSection').offset().top + 5
    }

    let scrollNode = this.facade.getCanvas().rootNode.parentNode.parentNode
    size.width -= this.offsetScroll.x - scrollNode.scrollLeft
    size.height -= this.offsetScroll.y - scrollNode.scrollTop

    // Set the size
    this.resize(size)
    Event.stop(event)
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
    this.setPos(this.position)
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

}