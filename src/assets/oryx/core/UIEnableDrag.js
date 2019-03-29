import ORYX_Config from '../CONFIG'

function UIDragCallback (event) {
  let position = {
    x: Event.pointerX(event) - this.offSetPosition.x,
    y: Event.pointerY(event) - this.offSetPosition.y
  }

  position.x -= this.offsetScroll.x - this.scrollNode.scrollLeft
  position.y -= this.offsetScroll.y - this.scrollNode.scrollTop
  position.x /= this.faktorXY.x
  position.y /= this.faktorXY.y

  this.uiObj.bounds.moveTo(position)
  // this.uiObj.update();

  if (this.movedCallback) {
    this.movedCallback(event)
  }

  // Event.stop(event);
}

function UIDisableDrag (event) {
  document.documentElement.removeEventListener(ORYX_Config.EVENT_MOUSEMOVE, this.dragCallback, false)
  document.documentElement.removeEventListener(ORYX_Config.EVENT_MOUSEUP, this.disableCallback, true)

  if (this.upCallback)
    this.upCallback(event)

  this.upCallback = undefined
  this.movedCallback = undefined

  Event.stop(event)
}

function UIEnableDrag (event, uiObj, option) {
  this.uiObj = uiObj
  let upL = uiObj.bounds.upperLeft()

  let a = uiObj.node.getScreenCTM()
  this.faktorXY = { x: a.a, y: a.d }

  this.scrollNode = uiObj.node.ownerSVGElement.parentNode.parentNode
  this.offSetPosition = {
    x: Event.pointerX(event) - (upL.x * this.faktorXY.x),
    y: Event.pointerY(event) - (upL.y * this.faktorXY.y)
  }

  this.offsetScroll = { x: this.scrollNode.scrollLeft, y: this.scrollNode.scrollTop }

  this.dragCallback = UIDragCallback.bind(this)
  this.disableCallback = UIDisableDrag.bind(this)

  this.movedCallback = option ? option.movedCallback : undefined
  this.upCallback = option ? option.upCallback : undefined

  document.documentElement.addEventListener(ORYX_Config.EVENT_MOUSEUP, this.disableCallback, true)
  document.documentElement.addEventListener(ORYX_Config.EVENT_MOUSEMOVE, this.dragCallback, false)

}

export {
  UIEnableDrag,
  UIDragCallback,
  UIDisableDrag
}