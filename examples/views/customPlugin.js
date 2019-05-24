import ORYX from 'src/oryx'

// 双击修改名称
export default class KPM_Plugin {
  constructor (facade) {
    console.log('!!!!!!!!!!!!')
    this.facade = facade
    // this.facade.registerOnEvent(ORYX.CONFIG.EVENT_CANVAS_SCROLL, this.hideField.bind(this))
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK, this.actOnDBLClick.bind(this))
    // this.facade.offer({
    //   keyCodes: [{
    //     keyCode: 113, // F2-Key
    //     keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
    //   }],
    //   functionality: this.renamePerF2.bind(this)
    // })
    // document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN, this.hide.bind(this), true)
  }

  renamePerF2 () {
    let selectedShapes = this.facade.getSelection()
    this.actOnDBLClick(undefined, selectedShapes.first())
  }

  actOnDBLClick (evt, shape) {
    if (!(shape instanceof ORYX.Core.Shape)) {
      return
    }

    alert(877)
  }

  getCenterPosition (svgNode, shape) {
    if (!svgNode) {
      return { x: 0, y: 0 }
    }

    let scale = this.facade.getCanvas().node.getScreenCTM()
    let absoluteXY = shape.bounds.upperLeft()

    let hasParent = true
    let searchShape = shape
    while (hasParent) {
      if (searchShape.getParentShape().getStencil().idWithoutNs() === 'BPMNDiagram' || searchShape.getParentShape().getStencil().idWithoutNs() === 'CMMNDiagram') {
        hasParent = false
      } else {
        let parentXY = searchShape.getParentShape().bounds.upperLeft()
        absoluteXY.x += parentXY.x
        absoluteXY.y += parentXY.y
        searchShape = searchShape.getParentShape()
      }
    }

    let center = shape.bounds.midPoint()
    center.x += absoluteXY.x + scale.e
    center.y += absoluteXY.y + scale.f

    center.x *= scale.a
    center.y *= scale.d

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
      center.y = center.y - jQuery('#canvasSection').offset().top + 5
      center.x -= jQuery('#canvasSection').offset().left
    } else {
      let canvasOffsetLeft = jQuery('#canvasSection').offset().left
      let canvasScrollLeft = jQuery('#canvasSection').scrollLeft()
      let canvasScrollTop = jQuery('#canvasSection').scrollTop()

      let offset = scale.e - (canvasOffsetLeft * additionalIEZoom)
      let additionaloffset = 0
      if (offset > 10) {
        additionaloffset = (offset / additionalIEZoom) - offset
      }
      center.y = center.y - (jQuery('#canvasSection').offset().top * additionalIEZoom) + 5 + ((canvasScrollTop * additionalIEZoom) - canvasScrollTop)
      center.x = center.x - (canvasOffsetLeft * additionalIEZoom) + additionaloffset + ((canvasScrollLeft * additionalIEZoom) - canvasScrollLeft)
    }

    return center
  }

  hide (e) {
    if (this.shownTextField && (!e || e.target !== this.shownTextField)) {
      let newValue = this.shownTextField.value
      if (newValue !== this.oldValueText) {
        this.updateValueFunction(newValue, this.oldValueText)
      }
      this.destroy()
    }
  }

  hideField (e) {
    if (this.shownTextField) {
      this.destroy()
    }
  }

  destroy (e) {
    let textInputComp = jQuery('#shapeTextInput')
    if (textInputComp) {
      textInputComp.remove()
      delete this.shownTextField

      this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN)
    }
  }
}
