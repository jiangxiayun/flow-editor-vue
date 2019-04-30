import ORYX_Utils from '../Utils'
import ORYX_Config from '../CONFIG'

export default class CanvasResizeButton {
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
    let parentNode = canvas.getHTMLContainer().parentNode
    // window.myParent = parentNode

    let actualScrollNode = jQuery('#canvasSection')[0]
    let scrollNode = actualScrollNode
    let canvasNode = $$('#canvasSection .ORYX_Editor')[0]
    let svgRootNode = canvasNode.children[0]

    let iconClass = 'glyphicon glyphicon-chevron-'
    let iconClassShrink = 'glyphicon glyphicon-chevron-'
    if (position === 'N') {
      iconClass += 'up'
      iconClassShrink += 'down'
    } else if (position == 'S') {
      iconClass += 'down'
      iconClassShrink += 'up'
    } else if (position == 'E') {
      iconClass += 'right'
      iconClassShrink += 'left'
    } else if (position == 'W') {
      iconClass += 'left'
      iconClassShrink += 'right'
    }

    // The buttons
    let idGrow = 'canvas-shrink-' + position
    let idShrink = 'canvas-grow-' + position

    const buttonGrow = ORYX_Utils.graft('http://www.w3.org/1999/xhtml', parentNode.parentNode, ['div', {
      'class': 'canvas_resize_indicator canvas_resize_indicator_grow' + ' ' + position,
      'id': idGrow,
      'title': this.I18N.RESIZE.tipGrow + this.I18N.RESIZE[position]
    },
      ['i', { 'class': iconClass }]
    ])
    const buttonShrink = ORYX_Utils.graft('http://www.w3.org/1999/xhtml', parentNode.parentNode, ['div', {
      'class': 'canvas_resize_indicator canvas_resize_indicator_shrink' + ' ' + position,
      'id': idShrink,
      'title': this.I18N.RESIZE.tipShrink + this.I18N.RESIZE[position]
    },
      ['i', { 'class': iconClassShrink }]
    ])
    // Defines a callback which gives back
    // a boolean if the current mouse event
    // is over the particular button area
    let offSetWidth = 60
    const isOverOffset = function (event) {
      let isOverButton = event.target.id.indexOf('canvas-shrink') !== -1
        || event.target.id.indexOf('canvas-grow') !== -1
        || event.target.parentNode.id.indexOf('canvas-shrink') !== -1
        || event.target.parentNode.id.indexOf('canvas-grow') !== -1
      if (isOverButton) {
        if (event.target.id === idGrow || event.target.id === idShrink ||
          event.target.parentNode.id === idGrow || event.target.parentNode.id === idShrink) {
          return true
        } else {
          return false
        }
      }

      if (event.target !== parentNode &&
        event.target !== scrollNode &&
        event.target !== scrollNode.firstChild &&
        event.target !== svgRootNode &&
        event.target !== scrollNode) {
        return false
      }

      // if(inCanvas){offSetWidth=30}else{offSetWidth=30*2}
      // Safari work around
      let X = event.offsetX !== undefined ? event.offsetX : event.layerX
      let Y = event.offsetY !== undefined ? event.offsetY : event.layerY
      let canvasOffset = 0
      if (canvasNode.clientWidth < actualScrollNode.clientWidth) {
        let widthDiff = actualScrollNode.clientWidth - canvasNode.clientWidth
        canvasOffset = widthDiff / 2
      }

      // Adjust to relative location to the actual viewport
      Y = Y - actualScrollNode.scrollTop
      X = X - actualScrollNode.scrollLeft

      if (position === 'N') {
        return Y < offSetWidth
      } else if (position === 'W') {
        return X < offSetWidth + canvasOffset
      } else if (position === 'E') {
        return actualScrollNode.clientWidth - X < offSetWidth + canvasOffset
      } else if (position === 'S') {
        return actualScrollNode.clientHeight - Y < offSetWidth
      }

      return false
    }

    const showButtons = (function () {
      buttonGrow.show()
      let w = canvas.bounds.width()
      let h = canvas.bounds.height()

      if (position === 'N' && (h - ORYX_Config.CustomConfigs.CANVAS_RESIZE_INTERVAL > ORYX_Config.CustomConfigs.CANVAS_MIN_HEIGHT)) buttonShrink.show()
      else if (position === 'E' && (w - ORYX_Config.CustomConfigs.CANVAS_RESIZE_INTERVAL > ORYX_Config.CustomConfigs.CANVAS_MIN_WIDTH)) buttonShrink.show()
      else if (position === 'S' && (h - ORYX_Config.CustomConfigs.CANVAS_RESIZE_INTERVAL > ORYX_Config.CustomConfigs.CANVAS_MIN_HEIGHT)) buttonShrink.show()
      else if (position === 'W' && (w - ORYX_Config.CustomConfigs.CANVAS_RESIZE_INTERVAL > ORYX_Config.CANVAS_MIN_WIDTH)) buttonShrink.show()
      else buttonShrink.hide()
    }).bind(this)

    const hideButtons = function () {
      buttonGrow.hide()
      buttonShrink.hide()
    }

    // If the mouse move is over the button area, show the button
    parentNode.parentNode.addEventListener(ORYX_Config.EVENT_MOUSEMOVE, function (event) {
      if (isOverOffset(event)) {
        showButtons()
      } else {
        hideButtons()
      }
    }, false)
    // If the mouse is over the button, show them
    buttonGrow.addEventListener(ORYX_Config.EVENT_MOUSEOVER, function (event) {
      showButtons()
    }, true)
    buttonShrink.addEventListener(ORYX_Config.EVENT_MOUSEOVER, function (event) {
      showButtons()
    }, true)
    // If the mouse is out, hide the button
    // scrollNode.addEventListener(		ORYX.CONFIG.EVENT_MOUSEOUT, 	function(event){button.hide()}, true )
    parentNode.parentNode.addEventListener(ORYX_Config.EVENT_MOUSEOUT, function (event) {
      hideButtons()
    }, true)
    // svgRootNode.addEventListener(	ORYX.CONFIG.EVENT_MOUSEOUT, 	function(event){ inCanvas = false } , true );

    // Hide the button initialy
    hideButtons()

    // Add the callbacks
    buttonGrow.addEventListener('click', function () {
      callback(position)
      showButtons()
    }, true)
    buttonShrink.addEventListener('click', function () {
      callback(position, true)
      showButtons()
    }, true)
  }
}
