/**
 * @classDescription Abstract base class for all objects that have a graphical representation
 * within the editor. 具有图形表示的所有对象的抽象基类
 *
 * @extends Clazz
 */
import ORYX_Config from '../CONFIG'
import ORYX_Log from '../Log'
import ORYX_Utils from '../Utils'
import Bounds from './Bounds'

export default class UIObject {
  constructor (options) {
    this.isChanged = true			// Flag, if UIObject has been changed since last update.
    this.isResized = true
    this.isVisible = true			// Flag, if UIObject's display attribute is set to 'inherit' or 'none'
    this.isSelectable = false		// Flag, if UIObject is selectable.
    this.isResizable = false		// Flag, if UIObject is resizable.
    this.isMovable = false			// Flag, if UIObject is movable.

    this.id = ORYX_Utils.provideId()	//get unique id
    this.parent = undefined		//parent is defined, if this object is added to another uiObject.
    this.node = undefined			//this is a reference to the SVG representation, either locally or in DOM.
    this.children = []				//array for all add uiObjects

    this.bounds = new Bounds()		//bounds with undefined values

    this._changedCallback = this._changed.bind(this)	//callback reference for calling _changed
    this.bounds.registerCallback(this._changedCallback)	//set callback in bounds

    if (options && options.eventHandlerCallback) {
      this.eventHandlerCallback = options.eventHandlerCallback
    }
  }
  /**
   * Sets isChanged flag to true. Callback for the bounds object.
   */
  _changed (bounds, isResized) {
    this.isChanged = true
    if (this.bounds == bounds) {
      this.isResized = isResized || this.isResized
    }
  }

  /**
   * If something changed, this method calls the refresh method that must be implemented by subclasses.
   */
  update () {
    if (this.isChanged) {
      this.refresh()
      this.isChanged = false

      // call update of all children
      this.children.each(function (value) {
        value.update()
      })
    }
  }

  /**
   * Is called in update method, if isChanged is set to true. Sub classes should call the super class method.
   */
  refresh () {

  }

  /**
   * @return {Array} Array of all child UIObjects.
   */
  getChildren () {
    return this.children.clone()
  }

  /**
   * @return {Array} Array of all parent UIObjects.
   */
  getParents () {
    let parents = []
    let parent = this.parent
    while (parent) {
      parents.push(parent)
      parent = parent.parent
    }
    return parents
  }

  /**
   * Returns TRUE if the given parent is one of the UIObjects parents or the UIObject themselves, otherwise FALSE.
   * @param {UIObject} parent
   * @return {Boolean}
   */
  isParent (parent) {
    let cparent = this
    while (cparent) {
      if (cparent === parent) {
        return true
      }
      cparent = cparent.parent
    }
    return false
  }

  /**
   * @return {String} Id of this UIObject
   */
  getId () {
    return this.id
  }

  /**
   * Method for accessing child uiObjects by id.
   * @param {String} id
   * @param {Boolean} deep
   *
   * @return {UIObject} If found, it returns the UIObject with id.
   */
  getChildById (id, deep) {
    return this.children.find(function (uiObj) {
      if (uiObj.getId() === id) {
        return uiObj
      } else {
        if (deep) {
          let obj = uiObj.getChildById(id, deep)
          if (obj) {
            return obj
          }
        }
      }
    })
  }

  /**
   * Adds an UIObject to this UIObject and sets the parent of the
   * added UIObject. It is also added to the SVG representation of this
   * UIObject.
   * @param {UIObject} uiObject
   */
  add (uiObject) {
    //add uiObject, if it is not already a child of this object
    if (!(this.children.member(uiObject))) {
      //if uiObject is child of another parent, remove it from that parent.
      if (uiObject.parent) {
        uiObject.remove(uiObject)
      }

      //add uiObject to children
      this.children.push(uiObject)

      //set parent reference
      uiObject.parent = this

      //add uiObject.node to this.node
      uiObject.node = this.node.appendChild(uiObject.node)

      //register callback to get informed, if child is changed
      uiObject.bounds.registerCallback(this._changedCallback)

      //uiObject.update();
    } else {
      ORYX_Log.info('add: ORYX.Core.UIObject is already a child of this object.')
    }
  }

  /**
   * Removes UIObject from this UIObject. The SVG representation will also
   * be removed from this UIObject's SVG representation.
   * @param {UIObject} uiObject
   */
  remove (uiObject) {
    //if uiObject is a child of this object, remove it.
    if (this.children.member(uiObject)) {
      //remove uiObject from children
      this.children = this._uiObjects.without(uiObject)

      //delete parent reference of uiObject
      uiObject.parent = undefined

      //delete uiObject.node from this.node
      uiObject.node = this.node.removeChild(uiObject.node)

      //unregister callback to get informed, if child is changed
      uiObject.bounds.unregisterCallback(this._changedCallback)
    } else {
      ORYX_Log.info('remove: ORYX.Core.UIObject is not a child of this object.')
    }

  }

  /**
   * Calculates absolute bounds of this UIObject.
   */
  absoluteBounds () {
    if (this.parent) {
      let absUL = this.absoluteXY()
      return new Bounds(absUL.x, absUL.y,
        absUL.x + this.bounds.width(),
        absUL.y + this.bounds.height())
    } else {
      return this.bounds.clone()
    }
  }

  /**
   * @return {Point} The absolute position of this UIObject.
   */
  absoluteXY () {
    if (this.parent) {
      let pXY = this.parent.absoluteXY()
      let result = {}
      result.x = pXY.x + this.bounds.upperLeft().x
      result.y = pXY.y + this.bounds.upperLeft().y
      return result
    } else {
      let result = {}
      result.x = this.bounds.upperLeft().x
      result.y = this.bounds.upperLeft().y
      return result
    }
  }

  /**
   * @return {Point} The absolute position from the Center of this UIObject.
   */
  absoluteCenterXY () {
    if (this.parent) {
      let pXY = this.parent.absoluteXY()
      let result = {}
      result.x = pXY.x + this.bounds.center().x
      result.y = pXY.y + this.bounds.center().y
      return result

    } else {
      let result = {}
      result.x = this.bounds.center().x
      result.y = this.bounds.center().y
      return result
    }
  }

  /**
   * Hides this UIObject and all its children.
   */
  hide () {
    this.node.setAttributeNS(null, 'display', 'none')
    this.isVisible = false
    this.children.each(function (uiObj) {
      uiObj.hide()
    })
  }

  /**
   * Enables visibility of this UIObject and all its children.
   */
  show () {
    this.node.setAttributeNS(null, 'display', 'inherit')
    this.isVisible = true
    this.children.each(function (uiObj) {
      uiObj.show()
    })
  }

  addEventHandlers (node) {
    node.addEventListener(ORYX_Config.EVENT_MOUSEDOWN, this._delegateEvent.bind(this), false)
    node.addEventListener(ORYX_Config.EVENT_MOUSEMOVE, this._delegateEvent.bind(this), false)
    node.addEventListener(ORYX_Config.EVENT_MOUSEUP, this._delegateEvent.bind(this), false)
    node.addEventListener(ORYX_Config.EVENT_MOUSEOVER, this._delegateEvent.bind(this), false)
    node.addEventListener(ORYX_Config.EVENT_MOUSEOUT, this._delegateEvent.bind(this), false)
    node.addEventListener('click', this._delegateEvent.bind(this), false)
    node.addEventListener(ORYX_Config.EVENT_DBLCLICK, this._delegateEvent.bind(this), false)
  }

  _delegateEvent (event) {
    if (this.eventHandlerCallback) {
      this.eventHandlerCallback(event, this)
    }
  }

  toString () {
    return 'UIObject ' + this.id
  }
}