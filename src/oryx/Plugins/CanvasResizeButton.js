import ORYX_Utils from '../Utils'
import ORYX_Config from '../CONFIG'

export default class CanvasResizeButton {
  UI_CONFIG = ORYX_Config.CustomConfigs.UI_CONFIG
  I18N = {
    RESIZE: {
      // tipGrow: 'Increase canvas size:',
      // tipShrink: 'Decrease canvas size:',
      tipGrow: '增加画布尺寸:',
      tipShrink: '减小画布尺寸:',
      N: 'Top',
      W: 'Left',
      S: 'Down',
      E: 'Right'
    }
  }

  constructor (canvas, position, callback) {
    this.canvas = canvas
    this.position = position
    this.callback = callback
    this.parentNode = canvas.getHTMLContainer().parentNode

    this.actualScrollNode = jQuery('#canvasSection')[0]
    this.scrollNode = this.actualScrollNode
    this.canvasNode = $$('#canvasSection .ORYX_Editor')[0]
    this.svgRootNode = this.canvasNode.children[0]

    let iconClass = 'glyphicon glyphicon-chevron-'
    let iconClassShrink = 'glyphicon glyphicon-chevron-'
    if (position === 'N') {
      iconClass += 'up'
      iconClassShrink += 'down'
    } else if (position === 'S') {
      iconClass += 'down'
      iconClassShrink += 'up'
    } else if (position === 'E') {
      iconClass += 'right'
      iconClassShrink += 'left'
    } else if (position === 'W') {
      iconClass += 'left'
      iconClassShrink += 'right'
    }

    // The buttons
    this.idGrow = 'canvas-shrink-' + position
    this.idShrink = 'canvas-grow-' + position

    this.buttonGrow = ORYX_Utils.graft('http://www.w3.org/1999/xhtml', this.parentNode.parentNode, ['div', {
      'class': 'canvas_resize_indicator canvas_resize_indicator_grow' + ' ' + position,
      'id':  this.idGrow,
      'title': this.I18N.RESIZE.tipGrow + this.I18N.RESIZE[position]
    },
      ['i', { 'class': iconClass }]
    ])
    this.buttonShrink = ORYX_Utils.graft('http://www.w3.org/1999/xhtml', this.parentNode.parentNode, ['div', {
      'class': 'canvas_resize_indicator canvas_resize_indicator_shrink' + ' ' + position,
      'id':  this.idShrink,
      'title': this.I18N.RESIZE.tipShrink + this.I18N.RESIZE[position]
    },
      ['i', { 'class': iconClassShrink }]
    ])
    // Defines a callback which gives back
    // a boolean if the current mouse event
    // is over the particular button area

    this.offSetWidth = 60
    this.parentNodeMouseMoveFun = this.parentNodeMouseMove.bind(this)
    this.showButtonsFun = this.showButtons.bind(this)
    this.hideButtonsFun = this.hideButtons.bind(this)
    this.buttonGrowClickFun = this.buttonGrowClick.bind(this)
    this.buttonShrinkClickFun = this.buttonShrinkClick.bind(this)

    // If the mouse move is over the button area, show the button
    this.parentNode.parentNode.addEventListener(ORYX_Config.EVENT_MOUSEMOVE, this.parentNodeMouseMoveFun, false)
    // If the mouse is out, hide the button
    // scrollNode.addEventListener(		ORYX.CONFIG.EVENT_MOUSEOUT, 	function(event){button.hide()}, true )
    this.parentNode.parentNode.addEventListener(ORYX_Config.EVENT_MOUSEOUT, this.hideButtonsFun, true)
    // svgRootNode.addEventListener(	ORYX.CONFIG.EVENT_MOUSEOUT, 	function(event){ inCanvas = false } , true );

    // Hide the button initialy
    this.hideButtons()

    // If the mouse is over the button, show them
    this.buttonGrow.addEventListener(ORYX_Config.EVENT_MOUSEOVER, this.showButtonsFun, true)
    this.buttonShrink.addEventListener(ORYX_Config.EVENT_MOUSEOVER, this.showButtonsFun, true)
    // Add the callbacks
    this.buttonGrow.addEventListener('click', this.buttonGrowClickFun, true)
    this.buttonShrink.addEventListener('click', this.buttonShrinkClickFun, true)
  }
  parentNodeMouseMove (event) {
    if (this.isOverOffset(event)) {
      this.showButtons()
    } else {
      this.hideButtons()
    }
  }
  buttonGrowClick () {
    this.callback(this.position)
    this.showButtons()
  }
  buttonShrinkClick () {
    this.callback(this.position, true)
    this.showButtons()
  }
  isOverOffset (event) {
    let isOverButton = event.target.id.indexOf('canvas-shrink') !== -1
      || event.target.id.indexOf('canvas-grow') !== -1
      || event.target.parentNode.id.indexOf('canvas-shrink') !== -1
      || event.target.parentNode.id.indexOf('canvas-grow') !== -1
    if (isOverButton) {
      if (event.target.id === this.idGrow || event.target.id === this.idShrink ||
        event.target.parentNode.id === this.idGrow || event.target.parentNode.id === this.idShrink) {
        return true
      } else {
        return false
      }
    }

    if (event.target !== this.parentNode &&
      event.target !== this.scrollNode &&
      event.target !== this.scrollNode.firstChild &&
      event.target !== this.svgRootNode &&
      event.target !== this.scrollNode) {
      return false
    }

    // if(inCanvas){offSetWidth=30}else{offSetWidth=30*2}
    // Safari work around
    let X = event.offsetX !== undefined ? event.offsetX : event.layerX
    let Y = event.offsetY !== undefined ? event.offsetY : event.layerY
    let canvasOffset = 0
    if (this.canvasNode.clientWidth < this.actualScrollNode.clientWidth) {
      let widthDiff = this.actualScrollNode.clientWidth - this.canvasNode.clientWidth
      canvasOffset = widthDiff / 2
    }

    // Adjust to relative location to the actual viewport
    Y = Y - this.actualScrollNode.scrollTop
    X = X - this.actualScrollNode.scrollLeft

    if (this.position === 'N') {
      return Y < this.offSetWidth
    } else if (this.position === 'W') {
      return X < this.offSetWidth + canvasOffset
    } else if (this.position === 'E') {
      return this.actualScrollNode.clientWidth - X < this.offSetWidth + canvasOffset
    } else if (this.position === 'S') {
      return this.actualScrollNode.clientHeight - Y < this.offSetWidth
    }

    return false
  }

  showButtons () {
    this.buttonGrow.show()
    let w = this.canvas.bounds.width()
    let h = this.canvas.bounds.height()

    if (this.position === 'N' && (h - this.UI_CONFIG.CANVAS_RESIZE_INTERVAL > this.UI_CONFIG.CANVAS_MIN_HEIGHT)) this.buttonShrink.show()
    else if (this.position === 'E' && (w - this.UI_CONFIG.CANVAS_RESIZE_INTERVAL > this.UI_CONFIG.CANVAS_MIN_WIDTH)) this.buttonShrink.show()
    else if (this.position === 'S' && (h - this.UI_CONFIG.CANVAS_RESIZE_INTERVAL > this.UI_CONFIG.CANVAS_MIN_HEIGHT)) this.buttonShrink.show()
    else if (this.position === 'W' && (w - this.UI_CONFIG.CANVAS_RESIZE_INTERVAL > this.UI_CONFIG.CANVAS_MIN_WIDTH)) this.buttonShrink.show()
    else this.buttonShrink.hide()
  }
  hideButtons () {
    this.buttonGrow.hide()
    this.buttonShrink.hide()
  }

  clearAddEventListener() {
    this.parentNode.parentNode.removeEventListener(ORYX_Config.EVENT_MOUSEMOVE, this.parentNodeMouseMoveFun, false)
    this.parentNode.parentNode.removeEventListener(ORYX_Config.EVENT_MOUSEOUT, this.hideButtonsFun, true)

    this.buttonGrow.removeEventListener(ORYX_Config.EVENT_MOUSEOVER, this.showButtonsFun, true)
    this.buttonShrink.removeEventListener(ORYX_Config.EVENT_MOUSEOVER, this.showButtonsFun, true)
    this.buttonGrow.removeEventListener('click', this.buttonGrowClickFun, true)
    this.buttonShrink.removeEventListener('click', this.buttonShrinkClickFun, true)
  }
}
