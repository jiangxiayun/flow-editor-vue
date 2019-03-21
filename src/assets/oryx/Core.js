/**
 * Init namespaces
 */
if (!ORYX) {
  var ORYX = {};
}
if (!ORYX.Core) {
  ORYX.Core = {};
}


NAMESPACE_SVG = "http://www.w3.org/2000/svg";
NAMESPACE_ORYX = "http://www.b3mn.org/oryx";

/**
 * @classDescription With Bounds you can set and get position and size of UIObjects.
 */
ORYX.Core.Command = Clazz.extend({

  /**
   * Constructor
   */
  construct: function () {

  },

  execute: function () {
    throw "Command.execute() has to be implemented!"
  },

  rollback: function () {
    throw "Command.rollback() has to be implemented!"
  }


});

/**
 * @classDescription With Bounds you can set and get position and size of UIObjects.
 */
ORYX.Core.Bounds = {

  /**
   * Constructor
   */
  construct: function () {
    this._changedCallbacks = []; //register a callback with changedCallacks.push(this.method.bind(this));
    this.a = {};
    this.b = {};
    this.set.apply(this, arguments);
    this.suspendChange = false;
    this.changedWhileSuspend = false;
  },

  /**
   * Calls all registered callbacks.
   */
  _changed: function (sizeChanged) {
    if (!this.suspendChange) {
      this._changedCallbacks.each(function (callback) {
        callback(this, sizeChanged);
      }.bind(this));
      this.changedWhileSuspend = false;
    } else
      this.changedWhileSuspend = true;
  },

  /**
   * Registers a callback that is called, if the bounds changes.
   * @param callback {Function} The callback function.
   */
  registerCallback: function (callback) {
    if (!this._changedCallbacks.member(callback)) {
      this._changedCallbacks.push(callback);
    }
  },

  /**
   * Unregisters a callback.
   * @param callback {Function} The callback function.
   */
  unregisterCallback: function (callback) {
    this._changedCallbacks = this._changedCallbacks.without(callback);
  },

  /**
   * Sets position and size of the shape dependent of four coordinates
   * (set(ax, ay, bx, by);), two points (set({x: ax, y: ay}, {x: bx, y: by});)
   * or one bound (set({a: {x: ax, y: ay}, b: {x: bx, y: by}});).
   */
  set: function () {

    var changed = false;

    switch (arguments.length) {

      case 1:
        if (this.a.x !== arguments[0].a.x) {
          changed = true;
          this.a.x = arguments[0].a.x;
        }
        if (this.a.y !== arguments[0].a.y) {
          changed = true;
          this.a.y = arguments[0].a.y;
        }
        if (this.b.x !== arguments[0].b.x) {
          changed = true;
          this.b.x = arguments[0].b.x;
        }
        if (this.b.y !== arguments[0].b.y) {
          changed = true;
          this.b.y = arguments[0].b.y;
        }
        break;

      case 2:
        var ax = Math.min(arguments[0].x, arguments[1].x);
        var ay = Math.min(arguments[0].y, arguments[1].y);
        var bx = Math.max(arguments[0].x, arguments[1].x);
        var by = Math.max(arguments[0].y, arguments[1].y);
        if (this.a.x !== ax) {
          changed = true;
          this.a.x = ax;
        }
        if (this.a.y !== ay) {
          changed = true;
          this.a.y = ay;
        }
        if (this.b.x !== bx) {
          changed = true;
          this.b.x = bx;
        }
        if (this.b.y !== by) {
          changed = true;
          this.b.y = by;
        }
        break;

      case 4:
        var ax = Math.min(arguments[0], arguments[2]);
        var ay = Math.min(arguments[1], arguments[3]);
        var bx = Math.max(arguments[0], arguments[2]);
        var by = Math.max(arguments[1], arguments[3]);
        if (this.a.x !== ax) {
          changed = true;
          this.a.x = ax;
        }
        if (this.a.y !== ay) {
          changed = true;
          this.a.y = ay;
        }
        if (this.b.x !== bx) {
          changed = true;
          this.b.x = bx;
        }
        if (this.b.y !== by) {
          changed = true;
          this.b.y = by;
        }
        break;
    }

    if (changed) {
      this._changed(true);
    }
  },

  /**
   * Moves the bounds so that the point p will be the new upper left corner.
   * @param {Point} p
   * or
   * @param {Number} x
   * @param {Number} y
   */
  moveTo: function () {

    var currentPosition = this.upperLeft();
    switch (arguments.length) {
      case 1:
        this.moveBy({
          x: arguments[0].x - currentPosition.x,
          y: arguments[0].y - currentPosition.y
        });
        break;
      case 2:
        this.moveBy({
          x: arguments[0] - currentPosition.x,
          y: arguments[1] - currentPosition.y
        });
        break;
      default:
      //TODO error
    }

  },

  /**
   * Moves the bounds relatively by p.
   * @param {Point} p
   * or
   * @param {Number} x
   * @param {Number} y
   *
   */
  moveBy: function () {
    var changed = false;

    switch (arguments.length) {
      case 1:
        var p = arguments[0];
        if (p.x !== 0 || p.y !== 0) {
          changed = true;
          this.a.x += p.x;
          this.b.x += p.x;
          this.a.y += p.y;
          this.b.y += p.y;
        }
        break;
      case 2:
        var x = arguments[0];
        var y = arguments[1];
        if (x !== 0 || y !== 0) {
          changed = true;
          this.a.x += x;
          this.b.x += x;
          this.a.y += y;
          this.b.y += y;
        }
        break;
      default:
      //TODO error
    }

    if (changed) {
      this._changed();
    }
  },

  /***
   * Includes the bounds b into the current bounds.
   * @param {Bounds} b
   */
  include: function (b) {

    if ((this.a.x === undefined) && (this.a.y === undefined) &&
      (this.b.x === undefined) && (this.b.y === undefined)) {
      return b;
    }
    ;

    var cx = Math.min(this.a.x, b.a.x);
    var cy = Math.min(this.a.y, b.a.y);

    var dx = Math.max(this.b.x, b.b.x);
    var dy = Math.max(this.b.y, b.b.y);


    this.set(cx, cy, dx, dy);
  },

  /**
   * Relatively extends the bounds by p.
   * @param {Point} p
   */
  extend: function (p) {

    if (p.x !== 0 || p.y !== 0) {
      // this is over cross for the case that a and b have same coordinates.
      //((this.a.x > this.b.x) ? this.a : this.b).x += p.x;
      //((this.b.y > this.a.y) ? this.b : this.a).y += p.y;
      this.b.x += p.x;
      this.b.y += p.y;

      this._changed(true);
    }
  },

  /**
   * Widens the scope of the bounds by x.
   * @param {Number} x
   */
  widen: function (x) {
    if (x !== 0) {
      this.suspendChange = true;
      this.moveBy({x: -x, y: -x});
      this.extend({x: 2 * x, y: 2 * x});
      this.suspendChange = false;
      if (this.changedWhileSuspend) {
        this._changed(true);
      }
    }
  },

  /**
   * Returns the upper left corner's point regardless of the
   * bound delimiter points.
   */
  upperLeft: function () {
    var result = {};
    result.x = this.a.x;
    result.y = this.a.y;
    return result;
  },

  /**
   * Returns the lower Right left corner's point regardless of the
   * bound delimiter points.
   */
  lowerRight: function () {
    var result = {};
    result.x = this.b.x;
    result.y = this.b.y;
    return result;
  },

  /**
   * @return {Number} Width of bounds.
   */
  width: function () {
    return this.b.x - this.a.x;
  },

  /**
   * @return {Number} Height of bounds.
   */
  height: function () {
    return this.b.y - this.a.y;
  },

  /**
   * @return {Point} The center point of this bounds.
   */
  center: function () {
    var center = {};
    center.x = (this.a.x + this.b.x) / 2.0;
    center.y = (this.a.y + this.b.y) / 2.0;
    return center;
  },


  /**
   * @return {Point} The center point of this bounds relative to upperLeft.
   */
  midPoint: function () {

    var midpoint = {};
    midpoint.x = (this.b.x - this.a.x) / 2.0;
    midpoint.y = (this.b.y - this.a.y) / 2.0;
    return midpoint;
  },

  /**
   * Moves the center point of this bounds to the new position.
   * @param p {Point}
   * or
   * @param x {Number}
   * @param y {Number}
   */
  centerMoveTo: function () {
    var currentPosition = this.center();

    switch (arguments.length) {

      case 1:
        this.moveBy(arguments[0].x - currentPosition.x,
          arguments[0].y - currentPosition.y);
        break;

      case 2:
        this.moveBy(arguments[0] - currentPosition.x,
          arguments[1] - currentPosition.y);
        break;
    }
  },

  isIncluded: function (point, offset) {

    var pointX, pointY, offset;

    // Get the the two Points
    switch (arguments.length) {
      case 1:
        pointX = arguments[0].x;
        pointY = arguments[0].y;
        offset = 0;

        break;
      case 2:
        if (arguments[0].x && arguments[0].y) {
          pointX = arguments[0].x;
          pointY = arguments[0].y;
          offset = Math.abs(arguments[1]);
        } else {
          pointX = arguments[0];
          pointY = arguments[1];
          offset = 0;
        }
        break;
      case 3:
        pointX = arguments[0];
        pointY = arguments[1];
        offset = Math.abs(arguments[2]);
        break;
      default:
        throw "isIncluded needs one, two or three arguments";
    }

    var ul = this.upperLeft();
    var lr = this.lowerRight();

    if (pointX >= ul.x - offset
      && pointX <= lr.x + offset && pointY >= ul.y - offset
      && pointY <= lr.y + offset)
      return true;
    else
      return false;
  },

  /**
   * @return {Bounds} A copy of this bounds.
   */
  clone: function () {

    //Returns a new bounds object without the callback
    // references of the original bounds
    return new ORYX.Core.Bounds(this);
  },

  toString: function () {

    return "( " + this.a.x + " | " + this.a.y + " )/( " + this.b.x + " | " + this.b.y + " )";
  },

  serializeForERDF: function () {

    return this.a.x + "," + this.a.y + "," + this.b.x + "," + this.b.y;
  }
};

ORYX.Core.Bounds = Clazz.extend(ORYX.Core.Bounds);


/**
 * @classDescription Abstract base class for all objects that have a graphical representation
 * within the editor.
 * @extends Clazz
 */
ORYX.Core.UIObject = {
  /**
   * Constructor of the UIObject class.
   */
  construct: function (options) {
    this.isChanged = true;			// Flag, if UIObject has been changed since last update.
    this.isResized = true;
    this.isVisible = true;			// Flag, if UIObject's display attribute is set to 'inherit' or 'none'
    this.isSelectable = false;		// Flag, if UIObject is selectable.
    this.isResizable = false;		// Flag, if UIObject is resizable.
    this.isMovable = false;			// Flag, if UIObject is movable.

    this.id = ORYX.Editor.provideId();	//get unique id
    this.parent = undefined;		//parent is defined, if this object is added to another uiObject.
    this.node = undefined;			//this is a reference to the SVG representation, either locally or in DOM.
    this.children = [];				//array for all add uiObjects

    this.bounds = new ORYX.Core.Bounds();		//bounds with undefined values

    this._changedCallback = this._changed.bind(this);	//callback reference for calling _changed
    this.bounds.registerCallback(this._changedCallback);	//set callback in bounds

    if (options && options.eventHandlerCallback) {
      this.eventHandlerCallback = options.eventHandlerCallback;
    }
  },

  /**
   * Sets isChanged flag to true. Callback for the bounds object.
   */
  _changed: function (bounds, isResized) {
    this.isChanged = true;
    if (this.bounds == bounds)
      this.isResized = isResized || this.isResized;
  },

  /**
   * If something changed, this method calls the refresh method that must be implemented by subclasses.
   */
  update: function () {
    if (this.isChanged) {
      this.refresh();
      this.isChanged = false;

      // call update of all children
      this.children.each(function (value) {
        value.update();
      });
    }
  },

  /**
   * Is called in update method, if isChanged is set to true. Sub classes should call the super class method.
   */
  refresh: function () {

  },

  /**
   * @return {Array} Array of all child UIObjects.
   */
  getChildren: function () {
    return this.children.clone();
  },

  /**
   * @return {Array} Array of all parent UIObjects.
   */
  getParents: function () {
    var parents = [];
    var parent = this.parent;
    while (parent) {
      parents.push(parent);
      parent = parent.parent;
    }
    return parents;
  },

  /**
   * Returns TRUE if the given parent is one of the UIObjects parents or the UIObject themselves, otherwise FALSE.
   * @param {UIObject} parent
   * @return {Boolean}
   */
  isParent: function (parent) {
    var cparent = this;
    while (cparent) {
      if (cparent === parent) {
        return true;
      }
      cparent = cparent.parent;
    }
    return false;
  },

  /**
   * @return {String} Id of this UIObject
   */
  getId: function () {
    return this.id;
  },

  /**
   * Method for accessing child uiObjects by id.
   * @param {String} id
   * @param {Boolean} deep
   *
   * @return {UIObject} If found, it returns the UIObject with id.
   */
  getChildById: function (id, deep) {
    return this.children.find(function (uiObj) {
      if (uiObj.getId() === id) {
        return uiObj;
      } else {
        if (deep) {
          var obj = uiObj.getChildById(id, deep);
          if (obj) {
            return obj;
          }
        }
      }
    });
  },

  /**
   * Adds an UIObject to this UIObject and sets the parent of the
   * added UIObject. It is also added to the SVG representation of this
   * UIObject.
   * @param {UIObject} uiObject
   */
  add: function (uiObject) {
    //add uiObject, if it is not already a child of this object
    if (!(this.children.member(uiObject))) {
      //if uiObject is child of another parent, remove it from that parent.
      if (uiObject.parent) {
        uiObject.remove(uiObject);
      }

      //add uiObject to children
      this.children.push(uiObject);

      //set parent reference
      uiObject.parent = this;

      //add uiObject.node to this.node
      uiObject.node = this.node.appendChild(uiObject.node);

      //register callback to get informed, if child is changed
      uiObject.bounds.registerCallback(this._changedCallback);

      //uiObject.update();
    } else {
      ORYX.Log.info("add: ORYX.Core.UIObject is already a child of this object.");
    }
  },

  /**
   * Removes UIObject from this UIObject. The SVG representation will also
   * be removed from this UIObject's SVG representation.
   * @param {UIObject} uiObject
   */
  remove: function (uiObject) {
    //if uiObject is a child of this object, remove it.
    if (this.children.member(uiObject)) {
      //remove uiObject from children
      this.children = this._uiObjects.without(uiObject);

      //delete parent reference of uiObject
      uiObject.parent = undefined;

      //delete uiObject.node from this.node
      uiObject.node = this.node.removeChild(uiObject.node);

      //unregister callback to get informed, if child is changed
      uiObject.bounds.unregisterCallback(this._changedCallback);
    } else {
      ORYX.Log.info("remove: ORYX.Core.UIObject is not a child of this object.");
    }

  },

  /**
   * Calculates absolute bounds of this UIObject.
   */
  absoluteBounds: function () {
    if (this.parent) {
      var absUL = this.absoluteXY();
      return new ORYX.Core.Bounds(absUL.x, absUL.y,
        absUL.x + this.bounds.width(),
        absUL.y + this.bounds.height());
    } else {
      return this.bounds.clone();
    }
  },

  /**
   * @return {Point} The absolute position of this UIObject.
   */
  absoluteXY: function () {
    if (this.parent) {
      var pXY = this.parent.absoluteXY();
      var result = {};
      result.x = pXY.x + this.bounds.upperLeft().x;
      result.y = pXY.y + this.bounds.upperLeft().y;
      return result;
    } else {
      var result = {};
      result.x = this.bounds.upperLeft().x;
      result.y = this.bounds.upperLeft().y;
      return result;
    }
  },

  /**
   * @return {Point} The absolute position from the Center of this UIObject.
   */
  absoluteCenterXY: function () {
    if (this.parent) {
      var pXY = this.parent.absoluteXY();
      var result = {};
      result.x = pXY.x + this.bounds.center().x;
      result.y = pXY.y + this.bounds.center().y;
      return result;

    } else {
      var result = {};
      result.x = this.bounds.center().x;
      result.y = this.bounds.center().y;
      return result;
    }
  },

  /**
   * Hides this UIObject and all its children.
   */
  hide: function () {
    this.node.setAttributeNS(null, 'display', 'none');
    this.isVisible = false;
    this.children.each(function (uiObj) {
      uiObj.hide();
    });
  },

  /**
   * Enables visibility of this UIObject and all its children.
   */
  show: function () {
    this.node.setAttributeNS(null, 'display', 'inherit');
    this.isVisible = true;
    this.children.each(function (uiObj) {
      uiObj.show();
    });
  },

  addEventHandlers: function (node) {
    node.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN, this._delegateEvent.bind(this), false);
    node.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this._delegateEvent.bind(this), false);
    node.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this._delegateEvent.bind(this), false);
    node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER, this._delegateEvent.bind(this), false);
    node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT, this._delegateEvent.bind(this), false);
    node.addEventListener('click', this._delegateEvent.bind(this), false);
    node.addEventListener(ORYX.CONFIG.EVENT_DBLCLICK, this._delegateEvent.bind(this), false);
  },

  _delegateEvent: function (event) {
    if (this.eventHandlerCallback) {
      this.eventHandlerCallback(event, this);
    }
  },

  toString: function () {
    return "UIObject " + this.id
  }
};
ORYX.Core.UIObject = Clazz.extend(ORYX.Core.UIObject);


/**
 * Top Level uiobject.
 * @class ORYX.Core.AbstractShape
 * @extends ORYX.Core.UIObject
 */

/** @lends ORYX.Core.AbstractShape.prototype */
ORYX.Core.AbstractShape = ORYX.Core.UIObject.extend({
  /**
   * Constructor
   */
  construct: function (options, stencil, facade) {

    arguments.callee.$.construct.apply(this, arguments);

    this.resourceId = ORYX.Editor.provideId(); //Id of resource in DOM

    // stencil reference
    this._stencil = stencil;
    // if the stencil defines a super stencil that should be used for its instances, set it.
    if (this._stencil._jsonStencil.superId) {
      stencilId = this._stencil.id()
      superStencilId = stencilId.substring(0, stencilId.indexOf("#") + 1) + stencil._jsonStencil.superId;
      stencilSet = this._stencil.stencilSet();
      this._stencil = stencilSet.stencil(superStencilId);
    }

    //Hash map for all properties. Only stores the values of the properties.
    this.properties = new Hash();
    this.propertiesChanged = new Hash();

    // List of properties which are not included in the stencilset,
    // but which gets (de)serialized
    this.hiddenProperties = new Hash();


    //Initialization of property map and initial value.
    this._stencil.properties().each((function (property) {
      var key = property.prefix() + "-" + property.id();
      this.properties.set(key, property.value());
      this.propertiesChanged.set(key, true);
    }).bind(this));

    // if super stencil was defined, also regard stencil's properties:
    if (stencil._jsonStencil.superId) {
      stencil.properties().each((function (property) {
        var key = property.prefix() + "-" + property.id();
        var value = property.value();
        var oldValue = this.properties.get(key);
        this.properties.set(key, value);
        this.propertiesChanged.set(key, true);

        // Raise an event, to show that the property has changed
        // required for plugins like processLink.js
        //window.setTimeout( function(){

        this._delegateEvent({
          type: ORYX.CONFIG.EVENT_PROPERTY_CHANGED,
          name: key,
          value: value,
          oldValue: oldValue
        });

        //}.bind(this), 10)

      }).bind(this));
    }

  },

  layout: function () {

  },

  /**
   * Returns the stencil object specifiing the type of the shape.
   */
  getStencil: function () {
    return this._stencil;
  },

  /**
   *
   * @param {Object} resourceId
   */
  getChildShapeByResourceId: function (resourceId) {

    resourceId = ERDF.__stripHashes(resourceId);

    return this.getChildShapes(true).find(function (shape) {
      return shape.resourceId == resourceId
    });
  },
  /**
   *
   * @param {Object} deep
   * @param {Object} iterator
   */
  getChildShapes: function (deep, iterator) {
    var result = [];

    this.children.each(function (uiObject) {
      if (uiObject instanceof ORYX.Core.Shape && uiObject.isVisible) {
        if (iterator) {
          iterator(uiObject);
        }
        result.push(uiObject);
        if (deep) {
          result = result.concat(uiObject.getChildShapes(deep, iterator));
        }
      }
    });

    return result;
  },

  /**
   * @param {Object} shape
   * @return {boolean} true if any of shape's childs is given shape
   */
  hasChildShape: function (shape) {
    return this.getChildShapes().any(function (child) {
      return (child === shape) || child.hasChildShape(shape);
    });
  },

  /**
   *
   * @param {Object} deep
   * @param {Object} iterator
   */
  getChildNodes: function (deep, iterator) {
    var result = [];

    this.children.each(function (uiObject) {
      if (uiObject instanceof ORYX.Core.Node && uiObject.isVisible) {
        if (iterator) {
          iterator(uiObject);
        }
        result.push(uiObject);
      }
      if (uiObject instanceof ORYX.Core.Shape) {
        if (deep) {
          result = result.concat(uiObject.getChildNodes(deep, iterator));
        }
      }
    });

    return result;
  },

  /**
   *
   * @param {Object} deep
   * @param {Object} iterator
   */
  getChildEdges: function (deep, iterator) {
    var result = [];

    this.children.each(function (uiObject) {
      if (uiObject instanceof ORYX.Core.Edge && uiObject.isVisible) {
        if (iterator) {
          iterator(uiObject);
        }
        result.push(uiObject);
      }
      if (uiObject instanceof ORYX.Core.Shape) {
        if (deep) {
          result = result.concat(uiObject.getChildEdges(deep, iterator));
        }
      }
    });

    return result;
  },

  /**
   * Returns a sorted array of ORYX.Core.Node objects.
   * Ordered in z Order, the last object has the highest z Order.
   */
  //TODO deep iterator
  getAbstractShapesAtPosition: function () {
    var x, y;
    switch (arguments.length) {
      case 1:
        x = arguments[0].x;
        y = arguments[0].y;
        break;
      case 2:	//two or more arguments
        x = arguments[0];
        y = arguments[1];
        break;
      default:
        throw "getAbstractShapesAtPosition needs 1 or 2 arguments!"
    }

    if (this.isPointIncluded(x, y)) {

      var result = [];
      result.push(this);

      //check, if one child is at that position


      var childNodes = this.getChildNodes();
      var childEdges = this.getChildEdges();

      [childNodes, childEdges].each(function (ne) {
        var nodesAtPosition = new Hash();

        ne.each(function (node) {
          if (!node.isVisible) {
            return
          }
          var candidates = node.getAbstractShapesAtPosition(x, y);
          if (candidates.length > 0) {
            var nodesInZOrder = $A(node.node.parentNode.childNodes);
            var zOrderIndex = nodesInZOrder.indexOf(node.node);
            nodesAtPosition.set(zOrderIndex, candidates);
          }
        });

        nodesAtPosition.keys().sort().each(function (key) {
          result = result.concat(nodesAtPosition.get(key));
        });
      });

      return result;

    } else {
      return [];
    }
  },

  /**
   *
   * @param key {String} Must be 'prefix-id' of property
   * @param value {Object} Can be of type String or Number according to property type.
   */
  setProperty: function (key, value, force) {
    var oldValue = this.properties.get(key);
    if (oldValue !== value || force === true) {
      this.properties.set(key, value);
      this.propertiesChanged.set(key, true);
      this._changed();

      // Raise an event, to show that the property has changed
      //window.setTimeout( function(){

      if (!this._isInSetProperty) {
        this._isInSetProperty = true;

        this._delegateEvent({
          type: ORYX.CONFIG.EVENT_PROPERTY_CHANGED,
          elements: [this],
          name: key,
          value: value,
          oldValue: oldValue
        });

        delete this._isInSetProperty;
      }
      //}.bind(this), 10)
    }
  },

  /**
   * Returns TRUE if one of the properties is flagged as dirty
   * @return {boolean}
   */
  isPropertyChanged: function () {
    return this.propertiesChanged.any(function (property) {
      return property.value
    });
  },

  /**
   *
   * @param {String} Must be 'prefix-id' of property
   * @param {Object} Can be of type String or Number according to property type.
   */
  setHiddenProperty: function (key, value) {
    // IF undefined, Delete
    if (value === undefined) {
      this.hiddenProperties.unset(key);
      return;
    }
    var oldValue = this.hiddenProperties.get(key);
    if (oldValue !== value) {
      this.hiddenProperties.set(key, value);
    }
  },
  /**
   * Calculate if the point is inside the Shape
   * @param {Point}
   */
  isPointIncluded: function (pointX, pointY, absoluteBounds) {
    var absBounds = absoluteBounds ? absoluteBounds : this.absoluteBounds();
    return absBounds.isIncluded(pointX, pointY);

  },

  /**
   * Get the serialized object
   * return Array with hash-entrees (prefix, name, value)
   * Following values will given:
   *    Type
   *    Properties
   */
  serialize: function () {
    var serializedObject = [];

    // Add the type
    serializedObject.push({name: 'type', prefix: 'oryx', value: this.getStencil().id(), type: 'literal'});

    // Add hidden properties
    this.hiddenProperties.each(function (prop) {
      serializedObject.push({
        name: prop.key.replace("oryx-", ""),
        prefix: "oryx",
        value: prop.value,
        type: 'literal'
      });
    }.bind(this));

    // Add all properties
    this.getStencil().properties().each((function (property) {

      var prefix = property.prefix();	// Get prefix
      var name = property.id();		// Get name

      //if(typeof this.properties[prefix+'-'+name] == 'boolean' || this.properties[prefix+'-'+name] != "")
      serializedObject.push({
        name: name,
        prefix: prefix,
        value: this.properties.get(prefix + '-' + name),
        type: 'literal'
      });

    }).bind(this));

    return serializedObject;
  },


  deserialize: function (serialize) {
    // Search in Serialize
    var initializedDocker = 0;

    // Sort properties so that the hidden properties are first in the list
    serialize = serialize.sort(function (a, b) {
      a = Number(this.properties.keys().member(a.prefix + "-" + a.name));
      b = Number(this.properties.keys().member(b.prefix + "-" + b.name));
      return a > b ? 1 : (a < b ? -1 : 0)
    }.bind(this));

    serialize.each((function (obj) {

      var name = obj.name;
      var prefix = obj.prefix;
      var value = obj.value;

      // Complex properties can be real json objects, encode them to a string
      if (Object.prototype.toString.call(value) === "Object") value = JSON.stringify(value);

      switch (prefix + "-" + name) {
        case 'raziel-parent':
          // Set parent
          if (!this.parent) {
            break
          }

          // Set outgoing Shape
          var parent = this.getCanvas().getChildShapeByResourceId(value);
          if (parent) {
            parent.add(this);
          }

          break;
        default:
          // If list, eval as an array
          var prop = this.getStencil().property(prefix + "-" + name);
          if (prop && prop.isList() && typeof value === "string") {
            if ((value || "").strip() && !value.startsWith("[") && !value.startsWith("]"))
              value = "[\"" + value.strip() + "\"]";
            value = ((value || "").strip() || "[]").evalJSON();
          }

          // Set property
          if (this.properties.keys().member(prefix + "-" + name)) {
            this.setProperty(prefix + "-" + name, value);
          } else if (!(name === "bounds" || name === "parent" || name === "target" || name === "dockers" || name === "docker" || name === "outgoing" || name === "incoming")) {
            this.setHiddenProperty(prefix + "-" + name, value);
          }

      }
    }).bind(this));
  },

  toString: function () {
    return "ORYX.Core.AbstractShape " + this.id
  },

  /**
   * Converts the shape to a JSON representation.
   * @return {Object} A JSON object with included ORYX.Core.AbstractShape.JSONHelper and getShape() method.
   */
  toJSON: function () {

    //upgrade to prototype 1.6/1.7 breaks the jquery extend call. rebuilding the properties here.
    var mergedProperties = this.properties.merge(this.hiddenProperties);
    var resultProperties = new Hash();
    mergedProperties.each(function (pair) {
      var key = pair.key;
      var value = pair.value;

      //If complex property, value should be a json object
      if (this.getStencil().property(key)
        && this.getStencil().property(key).type() === ORYX.CONFIG.TYPE_COMPLEX
        && Object.prototype.toString.call(value) === "String") {

        try {
          value = JSON.parse(value);
        } catch (error) {
        }

        // Parse date
      } else if (value instanceof Date && this.getStencil().property(key)) {
        try {
          value = value.format(this.getStencil().property(key).dateFormat());
        } catch (e) {
        }
      }

      // Takes "my_property" instead of "oryx-my_property" as key
      key = key.replace(/^[\w_]+-/, "");
      resultProperties.set(key, value);

    }.bind(this));

    var json = {
      resourceId: this.resourceId,
      properties: resultProperties.toObject(),
      stencil: {
        id: this.getStencil().idWithoutNs()
      },
      childShapes: this.getChildShapes().map(function (shape) {
        return shape.toJSON();
      })
    };

    if (this.getOutgoingShapes) {
      json.outgoing = this.getOutgoingShapes().map(function (shape) {
        return {
          resourceId: shape.resourceId
        };
      });
    }

    if (this.bounds) {
      json.bounds = {
        lowerRight: this.bounds.lowerRight(),
        upperLeft: this.bounds.upperLeft()
      };
    }

    if (this.dockers) {
      json.dockers = this.dockers.map(function (docker) {
        var d = docker.getDockedShape() && docker.referencePoint ? docker.referencePoint : docker.bounds.center();
        d.getDocker = function () {
          return docker;
        };
        return d;
      });
    }

    jQuery.extend(json, ORYX.Core.AbstractShape.JSONHelper);

    // do not pollute the json attributes (for serialization), so put the corresponding
    // shape is encapsulated in a method
    json.getShape = function () {
      return this;
    }.bind(this);

    return json;
  }
});

/**
 * @namespace Collection of methods which can be used on a shape json object (ORYX.Core.AbstractShape#toJSON()).
 * @example
 * jQuery.extend(shapeAsJson, ORYX.Core.AbstractShape.JSONHelper);
 */
ORYX.Core.AbstractShape.JSONHelper = {
  /**
   * Iterates over each child shape.
   * @param {Object} iterator Iterator function getting a child shape and his parent as arguments.
   * @param {boolean} [deep=false] Iterate recursively (childShapes of childShapes)
   * @param {boolean} [modify=false] If true, the result of the iterator function is taken as new shape, return false to delete it. This enables modifying the object while iterating through the child shapes.
   * @example
   * // Increases the lowerRight x value of each direct child shape by one.
   * myShapeAsJson.eachChild(function(shape, parentShape){
   *     shape.bounds.lowerRight.x = shape.bounds.lowerRight.x + 1;
   *     return shape;
   * }, false, true);
   */
  eachChild: function (iterator, deep, modify) {
    if (!this.childShapes) return;

    var newChildShapes = []; //needed if modify = true

    this.childShapes.each(function (shape) {
      if (!(shape.eachChild instanceof Function)) {
        jQuery.extend(shape, ORYX.Core.AbstractShape.JSONHelper);
      }
      var res = iterator(shape, this);
      if (res) newChildShapes.push(res); //if false is returned, and modify = true, current shape is deleted.

      if (deep) shape.eachChild(iterator, deep, modify);
    }.bind(this));

    if (modify) this.childShapes = newChildShapes;
  },

  getShape: function () {
    return null;
  },
  getChildShapes: function (deep) {
    var allShapes = this.childShapes;

    if (deep) {
      this.eachChild(function (shape) {
        if (!(shape.getChildShapes instanceof Function)) {
          jQuery.extend(shape, ORYX.Core.AbstractShape.JSONHelper);
        }
        allShapes = allShapes.concat(shape.getChildShapes(deep));
      }, true);
    }

    return allShapes;
  },

  /**
   * @return {String} Serialized JSON object
   */
  serialize: function () {
    return JSON.stringify(this);
  }
}


/**
 * @class Oryx canvas.
 * @extends ORYX.Core.AbstractShape
 *
 */
ORYX.Core.Canvas = ORYX.Core.AbstractShape.extend({
  /** @lends ORYX.Core.Canvas.prototype */

  /**
   * Defines the current zoom level
   */
  zoomLevel: 1,

  /**
   * Constructor
   */
  construct: function (options, stencil, facade) {
    arguments.callee.$.construct.apply(this, arguments);

    if (!(options && options.width && options.height)) {
      ORYX.Log.fatal("Canvas is missing mandatory parameters options.width and options.height.");
      return;
    }
    this.facade = facade;
    //TODO: set document resource id
    this.resourceId = options.id;

    this.nodes = [];

    this.edges = [];

    // Row highlighting states
    this.colHighlightState = 0;

    this.colHighlightEnabled = false;

    //init svg document
    this.rootNode = ORYX.Editor.graft("http://www.w3.org/2000/svg", options.parentNode,
      ['svg', {id: this.id, width: options.width, height: options.height},
        ['defs', {}]
      ]);

    this.rootNode.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    this.rootNode.setAttribute("xmlns:svg", "http://www.w3.org/2000/svg");

    this._htmlContainer = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", options.parentNode,
      ['div', {id: "oryx_canvas_htmlContainer", style: "position:absolute; top:5px"}]);

    // Additional SVG-node BELOW the stencils to allow underlays (if that is even a word) by plugins
    this.underlayNode = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.rootNode,
      ['svg', {id: "underlay-container"}]);

    // Create 2 svg-elements in the svg-container
    this.columnHightlight1 = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.underlayNode,
      ['rect', {
        x: 0,
        width: ORYX.CONFIG.FORM_ROW_WIDTH + 35,
        height: "100%",
        style: "fill: #fff6d5",
        visibility: "hidden"
      }]);

    this.columnHightlight2 = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.underlayNode,
      ['rect', {
        x: ORYX.CONFIG.FORM_ROW_WIDTH + 35,
        width: ORYX.CONFIG.FORM_ROW_WIDTH + 25,
        height: "100%",
        style: "fill: #fff6d5",
        visibility: "hidden"
      }]);

    this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.rootNode,
      ['g', {},
        ['g', {"class": "stencils"},
          ['g', {"class": "me"}],
          ['g', {"class": "children"}],
          ['g', {"class": "edge"}]
        ],
        ['g', {"class": "svgcontainer"}]
      ]);

    /*
		var off = 2 * ORYX.CONFIG.GRID_DISTANCE;
		var size = 3;
		var d = "";
		for(var i = 0; i <= options.width; i += off)
			for(var j = 0; j <= options.height; j += off)
				d = d + "M" + (i - size) + " " + j + " l" + (2*size) + " 0 m" + (-size) + " " + (-size) + " l0 " + (2*size) + " m0" + (-size) + " ";

		ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node.firstChild.firstChild,
			['path', {d:d , stroke:'#000000', 'stroke-width':'0.15px'},]);
		*/

    //Global definition of default font for shapes
    //Definitions in the SVG definition of a stencil will overwrite these settings for
    // that stencil.
    /*if(navigator.platform.indexOf("Mac") > -1) {
			this.node.setAttributeNS(null, 'stroke', 'black');
			this.node.setAttributeNS(null, 'stroke-width', '0.5px');
			this.node.setAttributeNS(null, 'font-family', 'Skia');
			//this.node.setAttributeNS(null, 'letter-spacing', '2px');
			this.node.setAttributeNS(null, 'font-size', ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT);
		} else {
			this.node.setAttributeNS(null, 'stroke', 'none');
			this.node.setAttributeNS(null, 'font-family', 'Verdana');
			this.node.setAttributeNS(null, 'font-size', ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT);
		}*/

    this.node.setAttributeNS(null, 'stroke', 'none');
    this.node.setAttributeNS(null, 'font-family', 'Verdana, sans-serif');
    this.node.setAttributeNS(null, 'font-size-adjust', 'none');
    this.node.setAttributeNS(null, 'font-style', 'normal');
    this.node.setAttributeNS(null, 'font-variant', 'normal');
    this.node.setAttributeNS(null, 'font-weight', 'normal');
    this.node.setAttributeNS(null, 'line-heigth', 'normal');

    this.node.setAttributeNS(null, 'font-size', ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT);

    this.bounds.set(0, 0, options.width, options.height);

    this.addEventHandlers(this.rootNode.parentNode);

    //disable context menu
    this.rootNode.oncontextmenu = function () {
      return false;
    };
  },

  focus: function () {

  },

  setHightlightState: function (state) {
    if (this.colHighlightEnabled && this.colHighlightState != state) {
      if (state == 0) {
        this.columnHightlight1.setAttribute("visibility", "hidden");
        this.columnHightlight2.setAttribute("visibility", "hidden");
      } else if (state == 1) {
        this.columnHightlight1.setAttribute("visibility", "visible");
        this.columnHightlight2.setAttribute("visibility", "hidden");
      } else if (state == 2) {
        this.columnHightlight1.setAttribute("visibility", "hidden");
        this.columnHightlight2.setAttribute("visibility", "visible");
      } else if (state == 3) {
        this.columnHightlight1.setAttribute("visibility", "visible");
        this.columnHightlight2.setAttribute("visibility", "visible");
      }
      this.colHighlightState = state;
    }
  },

  setHightlightStateBasedOnX: function (x) {
    if (x > ORYX.CONFIG.FORM_ROW_WIDTH + 30) {
      this.setHightlightState(2);
    } else {
      this.setHightlightState(1);
    }
  },

  update: function () {
    this.nodes.each(function (node) {
      this._traverseForUpdate(node);
    }.bind(this));

    // call stencil's layout callback
    var layoutEvents = this.getStencil().layout();

    if (layoutEvents) {
      layoutEvents.each(function (event) {

        // setup additional attributes
        event.shape = this;
        event.forceExecution = true;
        event.target = this.rootNode;

        // do layouting

        this._delegateEvent(event);
      }.bind(this))
    }

    this.nodes.invoke("_update");

    this.edges.invoke("_update", true);

    /*this.children.each(function(child) {
			child._update();
		});*/
  },

  _traverseForUpdate: function (shape) {
    var childRet = shape.isChanged;
    shape.getChildNodes(false, function (child) {
      if (this._traverseForUpdate(child)) {
        childRet = true;
      }
    }.bind(this));

    if (childRet) {
      shape.layout();
      return true;
    } else {
      return false;
    }
  },

  layout: function () {},

  /**
   *
   * @param {Object} deep
   * @param {Object} iterator
   */
  getChildNodes: function (deep, iterator) {
    if (!deep && !iterator) {
      return this.nodes.clone();
    } else {
      var result = [];
      this.nodes.each(function (uiObject) {
        if (iterator) {
          iterator(uiObject);
        }
        result.push(uiObject);

        if (deep && uiObject instanceof ORYX.Core.Shape) {
          result = result.concat(uiObject.getChildNodes(deep, iterator));
        }
      });

      return result;
    }
  },

  /**
   * buggy crap! use base class impl instead!
   * @param {Object} iterator
   */
  /*	getChildEdges: function(iterator) {
		if(iterator) {
			this.edges.each(function(edge) {
				iterator(edge);
			});
		}

		return this.edges.clone();
	},
*/
  /**
   * Overrides the UIObject.add method. Adds uiObject to the correct sub node.
   * @param {UIObject} uiObject
   */
  add: function (uiObject, index, silent) {
    // if uiObject is child of another UIObject, remove it.
    if (uiObject instanceof ORYX.Core.UIObject) {
      if (!(this.children.member(uiObject))) {
        //if uiObject is child of another parent, remove it from that parent.
        if (uiObject.parent) {
          uiObject.parent.remove(uiObject, true);
        }

        //add uiObject to the Canvas
        //add uiObject to this Shape
        if (index != undefined)
          this.children.splice(index, 0, uiObject);
        else
          this.children.push(uiObject);

        //set parent reference
        uiObject.parent = this;

        //add uiObject.node to this.node depending on the type of uiObject
        if (uiObject instanceof ORYX.Core.Shape) {
          if (uiObject instanceof ORYX.Core.Edge) {
            uiObject.addMarkers(this.rootNode.getElementsByTagNameNS(NAMESPACE_SVG, "defs")[0]);
            uiObject.node = this.node.childNodes[0].childNodes[2].appendChild(uiObject.node);
            this.edges.push(uiObject);
          } else {
            uiObject.node = this.node.childNodes[0].childNodes[1].appendChild(uiObject.node);
            this.nodes.push(uiObject);
          }
        } else {	//UIObject
          uiObject.node = this.node.appendChild(uiObject.node);
        }

        uiObject.bounds.registerCallback(this._changedCallback);

        if (this.eventHandlerCallback && silent !== true)
          this.eventHandlerCallback({type: ORYX.CONFIG.EVENT_SHAPEADDED, shape: uiObject})
      } else {
        ORYX.Log.warn("add: ORYX.Core.UIObject is already a child of this object.");
      }
    } else {
      ORYX.Log.fatal("add: Parameter is not of type ORYX.Core.UIObject.");
    }
  },

  /**
   * Overrides the UIObject.remove method. Removes uiObject.
   * @param {UIObject} uiObject
   */
  remove: function (uiObject, silent) {
    //if uiObject is a child of this object, remove it.
    if (this.children.member(uiObject)) {
      //remove uiObject from children
      var parent = uiObject.parent;

      this.children = this.children.without(uiObject);

      //delete parent reference of uiObject
      uiObject.parent = undefined;

      //delete uiObject.node from this.node
      if (uiObject instanceof ORYX.Core.Shape) {
        if (uiObject instanceof ORYX.Core.Edge) {
          uiObject.removeMarkers();
          uiObject.node = this.node.childNodes[0].childNodes[2].removeChild(uiObject.node);
          this.edges = this.edges.without(uiObject);
        } else {
          uiObject.node = this.node.childNodes[0].childNodes[1].removeChild(uiObject.node);
          this.nodes = this.nodes.without(uiObject);
        }
      } else {	//UIObject
        uiObject.node = this.node.removeChild(uiObject.node);
      }

      if (this.eventHandlerCallback && silent !== true)
        this.eventHandlerCallback({type: ORYX.CONFIG.EVENT_SHAPEREMOVED, shape: uiObject, parent: parent});

      uiObject.bounds.unregisterCallback(this._changedCallback);
    } else {

      ORYX.Log.warn("remove: ORYX.Core.UIObject is not a child of this object.");
    }
  },

  removeAll: function () {
    var childShapes = this.getChildShapes();
    for (var i = 0; i < childShapes.length; i++) {
      var childObject = childShapes[i];
      this.remove(childObject);
    }
  },

  /**
   * Creates shapes out of the given collection of shape objects and adds them to the canvas.
   * @example
   * canvas.addShapeObjects({
         bounds:{ lowerRight:{ y:510, x:633 }, upperLeft:{ y:146, x:210 } },
         resourceId:"oryx_F0715955-50F2-403D-9851-C08CFE70F8BD",
         childShapes:[],
         properties:{},
         stencil:{
           id:"Subprocess"
         },
         outgoing:[{resourceId: 'aShape'}],
         target: {resourceId: 'aShape'}
       });
   * @param {Object} shapeObjects
   * @param {Function} [eventHandler] An event handler passed to each newly created shape (as eventHandlerCallback)
   * @return {Array} A collection of ORYX.Core.Shape
   * @methodOf ORYX.Core.Canvas.prototype
   */
  addShapeObjects: function (shapeObjects, eventHandler) {
    if (!shapeObjects) return;

    this.initializingShapes = true;

    /* FIXME This implementation is very evil! At first, all shapes are created on
          canvas. In a second step, the attributes are applied. There must be a distinction
          between the configuration phase (where the outgoings, for example, are just named),
          and the creation phase (where the outgoings are evaluated). This must be reflected
          in code to provide a nicer API/ implementation!!! */

    var addShape = function (shape, parent) {
      // Create a new Stencil
      var stencil = ORYX.Core.StencilSet.stencil(this.getStencil().namespace() + shape.stencil.id);

      // Create a new Shape
      var ShapeClass = (stencil.type() == "node") ? ORYX.Core.Node : ORYX.Core.Edge;
      var newShape = new ShapeClass(
        {'eventHandlerCallback': eventHandler},
        stencil, this.facade);

      // Set the resource id
      newShape.resourceId = shape.resourceId;
      newShape.node.id = "svg-" + shape.resourceId;

      // Set parent to json object to be used later
      // Due to the nested json structure, normally shape.parent is not set/ must not be set.
      // In special cases, it can be easier to set this directly instead of a nested structure.
      shape.parent = "#" + ((shape.parent && shape.parent.resourceId) || parent.resourceId);

      // Add the shape to the canvas
      this.add(newShape);

      return {
        json: shape,
        object: newShape
      };
    }.bind(this);

    /** Builds up recursively a flatted array of shapes, including a javascript object and json representation
     * @param {Object} shape Any object that has Object#childShapes
     */
    var addChildShapesRecursively = function (shape) {
      var addedShapes = [];

      if (shape.childShapes && shape.childShapes.constructor == String) {
        shape.childShapes = JSON.parse(shape.childShapes);
      }

      shape.childShapes.each(function (childShape) {
        addedShapes.push(addShape(childShape, shape));
        addedShapes = addedShapes.concat(addChildShapesRecursively(childShape));
      });

      return addedShapes;
    }.bind(this);

    var shapes = addChildShapesRecursively({
      childShapes: shapeObjects,
      resourceId: this.resourceId
    });


    // prepare deserialisation parameter
    shapes.each(function (shape) {
        var properties = [];
        for (let field in shape.json.properties) {
          properties.push({
            prefix: 'oryx',
            name: field,
            value: shape.json.properties[field]
          });
        }

        // Outgoings
        shape.json.outgoing.each(function (out) {
          properties.push({
            prefix: 'raziel',
            name: 'outgoing',
            value: "#" + out.resourceId
          });
        });

        // Target
        // (because of a bug, the first outgoing is taken when there is no target,
        // can be removed after some time)
        if (shape.object instanceof ORYX.Core.Edge) {
          var target = shape.json.target || shape.json.outgoing[0];
          if (target) {
            properties.push({
              prefix: 'raziel',
              name: 'target',
              value: "#" + target.resourceId
            });
          }
        }

        // Bounds
        if (shape.json.bounds) {
          properties.push({
            prefix: 'oryx',
            name: 'bounds',
            value: shape.json.bounds.upperLeft.x + "," + shape.json.bounds.upperLeft.y + "," + shape.json.bounds.lowerRight.x + "," + shape.json.bounds.lowerRight.y
          });
        }

        // Dockers [{x:40, y:50}, {x:30, y:60}] => "40 50 30 60  #"
        if (shape.json.dockers) {
          properties.push({
            prefix: 'oryx',
            name: 'dockers',
            value: shape.json.dockers.inject("", function (dockersStr, docker) {
              return dockersStr + docker.x + " " + docker.y + " ";
            }) + " #"
          });
        }

        // Parent
        properties.push({
          prefix: 'raziel',
          name: 'parent',
          value: shape.json.parent
        });

        shape.__properties = properties;
      }.bind(this)
    );

    // Deserialize the properties from the shapes
    // This can't be done earlier because Shape#deserialize expects that all referenced nodes are already there

    // first, deserialize all nodes
    shapes.each(function (shape) {
      if (shape.object instanceof ORYX.Core.Node) {
        shape.object.deserialize(shape.__properties, shape.json);
      }
    });

    // second, deserialize all edges
    shapes.each(function (shape) {
      if (shape.object instanceof ORYX.Core.Edge) {
        shape.object.deserialize(shape.__properties, shape.json);
        shape.object._oldBounds = shape.object.bounds.clone();
        shape.object._update();
      }
    });

    delete this.initializingShapes;
    return shapes.pluck("object");
  },

  /**
   * Updates the size of the canvas, regarding to the containg shapes.
   */
  updateSize: function () {
    // Check the size for the canvas
    var maxWidth = 0;
    var maxHeight = 0;
    var offset = 100;
    this.getChildShapes(true, function (shape) {
      var b = shape.bounds;
      maxWidth = Math.max(maxWidth, b.lowerRight().x + offset)
      maxHeight = Math.max(maxHeight, b.lowerRight().y + offset)
    });

    if (this.bounds.width() < maxWidth || this.bounds.height() < maxHeight) {
      this.setSize({width: Math.max(this.bounds.width(), maxWidth), height: Math.max(this.bounds.height(), maxHeight)})
    }
  },

  getRootNode: function () {
    return this.rootNode;
  },

  getUnderlayNode: function () {
    return this.underlayNode;
  },

  getSvgContainer: function () {
    return this.node.childNodes[1];
  },

  getHTMLContainer: function () {
    return this._htmlContainer;
  },

  /**
   * Return all elements of the same highest level
   * @param {Object} elements
   */
  getShapesWithSharedParent: function (elements) {

    // If there is no elements, return []
    if (!elements || elements.length < 1) {
      return [];
    }
    // If there is one element, return this element
    if (elements.length == 1) {
      return elements;
    }

    return elements.findAll(function (value) {
      var parentShape = value.parent;
      while (parentShape) {
        if (elements.member(parentShape)) return false;
        parentShape = parentShape.parent;
      }
      return true;
    });

  },

  setSize: function (size, dontSetBounds) {
    if (!size || !size.width || !size.height) {
      return;
    }
    ;

    if (this.rootNode.parentNode) {
      this.rootNode.parentNode.style.width = size.width + 'px';
      this.rootNode.parentNode.style.height = size.height + 'px';
    }

    this.rootNode.setAttributeNS(null, 'width', size.width);
    this.rootNode.setAttributeNS(null, 'height', size.height);

    //this._htmlContainer.style.top = "-" + (size.height + 4) + 'px';
    if (!dontSetBounds) {
      this.bounds.set({a: {x: 0, y: 0}, b: {x: size.width / this.zoomLevel, y: size.height / this.zoomLevel}});
    }
  },

  /**
   * Returns an SVG document of the current process.
   * @param {Boolean} escapeText Use true, if you want to parse it with an XmlParser,
   *          false, if you want to use the SVG document in browser on client side.
   */
  getSVGRepresentation: function (escapeText) {
    // Get the serialized svg image source
    var svgClone = this.getRootNode().cloneNode(true);

    this._removeInvisibleElements(svgClone);

    var x1, y1, x2, y2;
    this.getChildShapes(true).each(function (shape) {
      var absBounds = shape.absoluteBounds();
      var ul = absBounds.upperLeft();
      var lr = absBounds.lowerRight();
      if (x1 == undefined) {
        x1 = ul.x;
        y1 = ul.y;
        x2 = lr.x;
        y2 = lr.y;
      } else {
        x1 = Math.min(x1, ul.x);
        y1 = Math.min(y1, ul.y);
        x2 = Math.max(x2, lr.x);
        y2 = Math.max(y2, lr.y);
      }
    });

    var margin = 50;
    var width, height, tx, ty;
    if (x1 == undefined) {
      width = 0;
      height = 0;
      tx = 0;
      ty = 0;
    } else {
      width = x2;
      height = y2;
      tx = -x1 + margin / 2;
      ty = -y1 + margin / 2;
    }

    // Set the width and height
    svgClone.setAttributeNS(null, 'width', width + margin);
    svgClone.setAttributeNS(null, 'height', height + margin);

    //remove scale factor
    svgClone.childNodes[1].removeAttributeNS(null, 'transform');

    try {
      var svgCont = svgClone.childNodes[1].childNodes[1];
      svgCont.parentNode.removeChild(svgCont);
    } catch (e) {
    }

    if (escapeText) {
      $A(svgClone.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'tspan')).each(function (elem) {
        elem.textContent = elem.textContent.escapeHTML();
      });

      $A(svgClone.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'text')).each(function (elem) {
        if (elem.childNodes.length == 0)
          elem.textContent = elem.textContent.escapeHTML();
      });
    }

    // generating absolute urls for the pdf-exporter
    $A(svgClone.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'image')).each(function (elem) {
      var href = elem.getAttributeNS("http://www.w3.org/1999/xlink", "href");

      if (!href.match("^(http|https)://")) {
        href = window.location.protocol + "//" + window.location.host + href;
        elem.setAttributeNS("http://www.w3.org/1999/xlink", "href", href);
      }
    });


    // escape all links
    $A(svgClone.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'a')).each(function (elem) {
      elem.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", (elem.getAttributeNS("http://www.w3.org/1999/xlink", "href") || "").escapeHTML());
    });

    return svgClone;
  },

  /**
   * Removes all nodes (and its children) that has the
   * attribute visibility set to "hidden"
   */
  _removeInvisibleElements: function (element) {
    var index = 0;
    while (index < element.childNodes.length) {
      var child = element.childNodes[index];
      if (child.getAttributeNS &&
        child.getAttributeNS(null, "visibility") === "hidden") {
        element.removeChild(child);
      } else {
        this._removeInvisibleElements(child);
        index++;
      }
    }

  },

  /**
   * This method checks all shapes on the canvas and removes all shapes that
   * contain invalid bounds values or dockers values(NaN)
   */
  /*cleanUp: function(parent) {
		if (!parent) {
			parent = this;
		}
		parent.getChildShapes().each(function(shape){
			var a = shape.bounds.a;
			var b = shape.bounds.b;
			if (isNaN(a.x) || isNaN(a.y) || isNaN(b.x) || isNaN(b.y)) {
				parent.remove(shape);
			}
			else {
				shape.getDockers().any(function(docker) {
					a = docker.bounds.a;
					b = docker.bounds.b;
					if (isNaN(a.x) || isNaN(a.y) || isNaN(b.x) || isNaN(b.y)) {
						parent.remove(shape);
						return true;
					}
					return false;
				});
				shape.getMagnets().any(function(magnet) {
					a = magnet.bounds.a;
					b = magnet.bounds.b;
					if (isNaN(a.x) || isNaN(a.y) || isNaN(b.x) || isNaN(b.y)) {
						parent.remove(shape);
						return true;
					}
					return false;
				});
				this.cleanUp(shape);
			}
		}.bind(this));
	},*/

  _delegateEvent: function (event) {
    if (this.eventHandlerCallback && (event.target == this.rootNode || event.target == this.rootNode.parentNode)) {
      this.eventHandlerCallback(event, this);
    }
  },

  toString: function () {
    return "Canvas " + this.id
  },

  /**
   * Calls {@link ORYX.Core.AbstractShape#toJSON} and adds some stencil set information.
   */
  toJSON: function () {
    var json = arguments.callee.$.toJSON.apply(this, arguments);

//		if(ORYX.CONFIG.STENCILSET_HANDLER.length > 0) {
//			json.stencilset = {
//				url: this.getStencil().stencilSet().namespace()
//	        };
//		} else {
    json.stencilset = {
      url: this.getStencil().stencilSet().source(),
      namespace: this.getStencil().stencilSet().namespace()
    };
//		}


    return json;
  }
});

ORYX.Core.UIEnableDrag = function (event, uiObj, option) {

  this.uiObj = uiObj;
  var upL = uiObj.bounds.upperLeft();

  var a = uiObj.node.getScreenCTM();
  this.faktorXY = {x: a.a, y: a.d};

  this.scrollNode = uiObj.node.ownerSVGElement.parentNode.parentNode;

  this.offSetPosition = {
    x: Event.pointerX(event) - (upL.x * this.faktorXY.x),
    y: Event.pointerY(event) - (upL.y * this.faktorXY.y)
  };

  this.offsetScroll = {x: this.scrollNode.scrollLeft, y: this.scrollNode.scrollTop};

  this.dragCallback = ORYX.Core.UIDragCallback.bind(this);
  this.disableCallback = ORYX.Core.UIDisableDrag.bind(this);

  this.movedCallback = option ? option.movedCallback : undefined;
  this.upCallback = option ? option.upCallback : undefined;

  document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.disableCallback, true);
  document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.dragCallback, false);

};

ORYX.Core.UIDragCallback = function (event) {

  var position = {
    x: Event.pointerX(event) - this.offSetPosition.x,
    y: Event.pointerY(event) - this.offSetPosition.y
  }

  position.x -= this.offsetScroll.x - this.scrollNode.scrollLeft;
  position.y -= this.offsetScroll.y - this.scrollNode.scrollTop;

  position.x /= this.faktorXY.x;
  position.y /= this.faktorXY.y;

  this.uiObj.bounds.moveTo(position);
  //this.uiObj.update();

  if (this.movedCallback)
    this.movedCallback(event);

  //Event.stop(event);

};

ORYX.Core.UIDisableDrag = function (event) {
  document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.dragCallback, false);
  document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.disableCallback, true);

  if (this.upCallback)
    this.upCallback(event);

  this.upCallback = undefined;
  this.movedCallback = undefined;

  Event.stop(event);
};


/**
 * Implements a command to move docker by an offset.
 *
 * @class ORYX.Core.MoveDockersCommand
 * @param {Object} object An object with the docker id as key and docker and offset as object value
 *
 */
ORYX.Core.MoveDockersCommand = ORYX.Core.Command.extend({
  construct: function (dockers) {
    this.dockers = new Hash(dockers);
    this.edges = new Hash();
  },
  execute: function () {
    if (this.changes) {
      this.executeAgain();
      return;
    } else {
      this.changes = new Hash();
    }

    this.dockers.values().each(function (docker) {
      var edge = docker.docker.parent;
      if (!edge) {
        return
      }

      if (!this.changes.get(edge.getId())) {
        this.changes.set(edge.getId(), {
          edge: edge,
          oldDockerPositions: edge.dockers.map(function (r) {
            return r.bounds.center()
          })
        });
      }
      docker.docker.bounds.moveBy(docker.offset);
      this.edges.set(edge.getId(), edge);
      docker.docker.update();
    }.bind(this));
    this.edges.each(function (edge) {
      this.updateEdge(edge.value);
      if (this.changes[edge.value.getId()])
        this.changes[edge.value.getId()].dockerPositions = edge.value.dockers.map(function (r) {
          return r.bounds.center()
        })
    }.bind(this));
  },
  updateEdge: function (edge) {
    edge._update(true);
    [edge.getOutgoingShapes(), edge.getIncomingShapes()].flatten().invoke("_update", [true])
  },
  executeAgain: function () {
    this.changes.values().each(function (change) {
      // Reset the dockers
      this.removeAllDocker(change.edge);
      change.dockerPositions.each(function (pos, i) {
        if (i == 0 || i == change.dockerPositions.length - 1) {
          return
        }
        var docker = change.edge.createDocker(undefined, pos);
        docker.bounds.centerMoveTo(pos);
        docker.update();
      }.bind(this));
      this.updateEdge(change.edge);
    }.bind(this));
  },
  rollback: function () {
    this.changes.values().each(function (change) {
      // Reset the dockers
      this.removeAllDocker(change.edge);
      change.oldDockerPositions.each(function (pos, i) {
        if (i == 0 || i == change.oldDockerPositions.length - 1) {
          return
        }
        var docker = change.edge.createDocker(undefined, pos);
        docker.bounds.centerMoveTo(pos);
        docker.update();
      }.bind(this));
      this.updateEdge(change.edge);
    }.bind(this));
  },
  removeAllDocker: function (edge) {
    edge.dockers.slice(1, edge.dockers.length - 1).each(function (docker) {
      edge.removeDocker(docker);
    })
  }
});

/**
 * @classDescription Base class for Shapes.
 * @extends ORYX.Core.AbstractShape
 */
ORYX.Core.Shape = {

  /**
   * Constructor
   */
  construct: function (options, stencil, facade) {
    // call base class constructor
    arguments.callee.$.construct.apply(this, arguments);

    this.facade = facade;
    this.dockers = [];
    this.magnets = [];

    this._defaultMagnet;

    this.incoming = [];
    this.outgoing = [];

    this.nodes = [];

    this._dockerChangedCallback = this._dockerChanged.bind(this);

    //Hash map for all labels. Labels are not treated as children of shapes.
    this._labels = new Hash();

    // create SVG node
    this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg",
      null,
      ['g', {id: "svg-" + this.resourceId},
        ['g', {"class": "stencils"},
          ['g', {"class": "me"}],
          ['g', {"class": "children", style: "overflow:hidden"}],
          ['g', {"class": "edge"}]
        ],
        ['g', {"class": "controls"},
          ['g', {"class": "dockers"}],
          ['g', {"class": "magnets"}]
        ]
      ]);
  },

  /**
   * If changed flag is set, refresh method is called.
   */
  update: function () {
    //if(this.isChanged) {
    //this.layout();
    //}
  },

  /**
   * !!!Not called from any sub class!!!
   */
  _update: function () {

  },

  /**
   * Calls the super class refresh method
   *  and updates the svg elements that are referenced by a property.
   */
  refresh: function () {
    // call base class refresh method
    arguments.callee.$.refresh.apply(this, arguments);
    if (this.node.ownerDocument) {
      // adjust SVG to properties' values
      var me = this;
      this.propertiesChanged.each((function (propChanged) {
        if (propChanged.value) {
          var prop = this.properties.get(propChanged.key);
          var property = this.getStencil().property(propChanged.key);
          if (property != undefined) {
            this.propertiesChanged.set(propChanged.key, false);

            console.log('property', propChanged.key)
            console.log('property.type', property.type())
            // handle choice properties
            if (property.type() == ORYX.CONFIG.TYPE_CHOICE) {
              //iterate all references to SVG elements
              property.refToView().each((function (ref) {
                //if property is referencing a label, update the label
                if (ref !== "") {
                  var label = this._labels.get(this.id + ref);
                  if (label && property.item(prop)) {
                    label.text(property.item(prop).title());
                  }
                }
              }).bind(this));

              //if the choice's items are referencing SVG elements
              // show the selected and hide all other referenced SVG
              // elements
              var refreshedSvgElements = new Hash();
              property.items().each((function (item) {
                item.refToView().each((function (itemRef) {
                  if (itemRef == "") {
                    return;
                  }

                  var svgElem = this.node.ownerDocument.getElementById(this.id + itemRef);

                  if (!svgElem) {
                    return;
                  }

                  /* Do not refresh the same svg element multiple times */
                  if (!refreshedSvgElements.get(svgElem.id) || prop == item.value()) {
                    svgElem.setAttributeNS(null, 'display', ((prop == item.value()) ? 'inherit' : 'none'));
                    refreshedSvgElements.set(svgElem.id, svgElem);
                  }

                  // Reload the href if there is an image-tag
                  if (ORYX.Editor.checkClassType(svgElem, SVGImageElement)) {
                    svgElem.setAttributeNS('http://www.w3.org/1999/xlink', 'href', svgElem.getAttributeNS('http://www.w3.org/1999/xlink', 'href'));
                  }
                }).bind(this));
              }).bind(this));

            } else {
              // handle properties that are not of type choice
              // iterate all references to SVG elements
              property.refToView().each((function (ref) {
                console.log('ref==========', ref)
                //if the property does not reference an SVG element,
                // do nothing
                if (ref === "") {
                  return;
                }

                var refId = this.id + ref;

                if (property.type() === ORYX.CONFIG.TYPE_FLOWABLE_MULTIINSTANCE) {
                  // flowable-multiinstance

                  if (ref === "multiinstance") {
                    var svgElemParallel = this.node.ownerDocument.getElementById(this.id + 'parallel');
                    if (svgElemParallel) {
                      if (prop === 'Parallel') {
                        svgElemParallel.setAttributeNS(null, 'display', 'inherit');
                      } else {
                        svgElemParallel.setAttributeNS(null, 'display', 'none');
                      }
                    }

                    var svgElemSequential = this.node.ownerDocument.getElementById(this.id + 'sequential');

                    if (svgElemSequential) {
                      if (prop === 'Sequential') {
                        svgElemSequential.setAttributeNS(null, 'display', 'inherit');
                      } else {
                        svgElemSequential.setAttributeNS(null, 'display', 'none');
                      }
                    }
                  }
                  return;

                } else if (property.type() === "cancelactivity") {
                  var svgElemFrame = this.node.ownerDocument.getElementById(this.id + 'frame');
                  var svgElemFrame2 = this.node.ownerDocument.getElementById(this.id + 'frame2');

                  if (prop === 'true') {
                    svgElemFrame.setAttributeNS(null, 'display', 'inherit');
                    svgElemFrame2.setAttributeNS(null, 'display', 'inherit');
                  } else {
                    svgElemFrame.setAttributeNS(null, 'display', 'none');
                    svgElemFrame2.setAttributeNS(null, 'display', 'none');
                  }
                }

                //get the SVG element
                var svgElem = this.node.ownerDocument.getElementById(refId);

                //if the SVG element can not be found
                if (!svgElem || !(svgElem.ownerSVGElement)) {
                  //if the referenced SVG element is a SVGAElement, it cannot
                  // be found with getElementById (Firefox bug).
                  // this is a work around
                  if (property.type() === ORYX.CONFIG.TYPE_URL ||
                    property.type() === ORYX.CONFIG.TYPE_DIAGRAM_LINK) {
                    var svgElems = this.node.ownerDocument.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'a');

                    svgElem = $A(svgElems).find(function (elem) {
                      return elem.getAttributeNS(null, 'id') === refId;
                    });

                    if (!svgElem) {
                      return;
                    }
                  } else {
                    //this.propertiesChanged[propChanged.key] = true;
                    return;
                  }
                }

                if (property.complexAttributeToView()) {
                  var label = this._labels.get(refId);
                  if (label) {
                    try {
                      propJson = prop.evalJSON();
                      var value = propJson[property.complexAttributeToView()]
                      label.text(value ? value : prop);
                    } catch (e) {
                      label.text(prop);
                    }
                  }

                } else {
                  switch (property.type()) {
                    case ORYX.CONFIG.TYPE_BOOLEAN: // boolean
                      if (typeof prop == "string")
                        prop = prop === "true"

                      svgElem.setAttributeNS(null, 'display', (!(prop === property.inverseBoolean())) ? 'inherit' : 'none');

                      break;
                    case ORYX.CONFIG.TYPE_COLOR: // color
                      if (property.fill()) {
                        if (svgElem.tagName.toLowerCase() === "stop") {
                          if (prop) {

                            if (property.lightness() && property.lightness() !== 1) {
                              prop = ORYX.Utils.adjustLightness(prop, property.lightness());
                            }

                            svgElem.setAttributeNS(null, "stop-color", prop);

                            // Adjust stop color of the others
                            if (svgElem.parentNode.tagName.toLowerCase() === "radialgradient") {
                              ORYX.Utils.adjustGradient(svgElem.parentNode, svgElem);
                            }
                          }

                          // If there is no value, set opaque
                          if (svgElem.parentNode.tagName.toLowerCase() === "radialgradient") {
                            $A(svgElem.parentNode.getElementsByTagName('stop')).each(function (stop) {
                              stop.setAttributeNS(null, "stop-opacity", prop ? stop.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, 'default-stop-opacity') || 1 : 0);
                            }.bind(this))
                          }
                        } else {
                          svgElem.setAttributeNS(null, 'fill', prop);
                        }
                      }
                      if (property.stroke()) {
                        svgElem.setAttributeNS(null, 'stroke', prop);
                      }
                      break;
                    case ORYX.CONFIG.TYPE_STRING: // string
                    case ORYX.CONFIG.TYPE_EXPRESSION:
                    case ORYX.CONFIG.TYPE_DATASOURCE:
                    case ORYX.CONFIG.TYPE_INTEGER:
                      var label = this._labels.get(refId);
                      if (label) {
                        label.text(prop);
                      }
                      break;
                    // case ORYX.CONFIG.TYPE_EXPRESSION:
                    //   var label = this._labels.get(refId);
                    //   if (label) {
                    //     label.text(prop);
                    //   }
                    //   break;
                    // case ORYX.CONFIG.TYPE_DATASOURCE:
                    //   var label = this._labels.get(refId);
                    //   if (label) {
                    //     label.text(prop);
                    //   }
                    //   break;
                    // case ORYX.CONFIG.TYPE_INTEGER:
                    //   var label = this._labels.get(refId);
                    //   if (label) {
                    //     label.text(prop);
                    //   }
                    //   break;
                    case ORYX.CONFIG.TYPE_FLOAT:
                      if (property.fillOpacity()) {
                        svgElem.setAttributeNS(null, 'fill-opacity', prop);
                      }
                      if (property.strokeOpacity()) {
                        svgElem.setAttributeNS(null, 'stroke-opacity', prop);
                      }
                      if (!property.fillOpacity() && !property.strokeOpacity()) {
                        var label = this._labels.get(refId);
                        if (label) {
                          label.text(prop);
                        }
                      }
                      break;

                    case ORYX.CONFIG.TYPE_SUB_PROCESS_LINK: // subprocess-link
                      if (ref == "subprocesslink") {
                        var onclickAttr = svgElem.getAttributeNodeNS('', 'onclick');
                        var styleAttr = svgElem.getAttributeNodeNS('', 'style');

                        if (onclickAttr) {
                          if (prop && prop.id) {
                            if (styleAttr) {
                              styleAttr.textContent = "cursor:pointer;"
                            }
                            onclickAttr.textContent = "FLOWABLE.TOOLBAR.ACTIONS.navigateToProcess(" + prop.id + ");return false;";
                          } else {
                            if (styleAttr) {
                              styleAttr.textContent = "cursor:default;"
                            }
                            onclickAttr.textContent = "return false;";
                          }
                        }
                      }
                      break;

                    case ORYX.CONFIG.TYPE_URL:
                      break;

                  }
                }
              }).bind(this));
            }
          }
          console.log('=====================')
        }
      }).bind(this));

      // update labels
      this._labels.values().each(function (label) {
        label.update();
      });
    }
  },

  layout: function () {
    var layoutEvents = this.getStencil().layout()
    if (layoutEvents) {
      layoutEvents.each(function (event) {
        // setup additional attributes
        event.shape = this;
        event.forceExecution = true;

        // do layouting
        this._delegateEvent(event);
      }.bind(this))

    }
  },

  /**
   * Returns an array of Label objects.
   */
  getLabels: function () {
    return this._labels.values();
  },

  /**
   * Returns the label for a given ref
   * @return {ORYX.Core.Label} Returns null if there is no label
   */
  getLabel: function (ref) {
    if (!ref) {
      return null;
    }
    return (this._labels.find(function (o) {
      return o.key.endsWith(ref);
    }) || {}).value || null;
  },

  /**
   * Hides all related labels
   *
   */
  hideLabels: function () {
    this.getLabels().invoke("hide");
  },

  /**
   * Shows all related labels
   *
   */
  showLabels: function () {
    var labels = this.getLabels();
    labels.invoke("show");
    labels.each(function (label) {
      label.update();
    });
  },

  setOpacity: function (value, animate) {

    value = Math.max(Math.min((typeof value == "number" ? value : 1.0), 1.0), 0.0);

    if (value !== 1.0) {
      value = String(value);
      this.node.setAttributeNS(null, "fill-opacity", value)
      this.node.setAttributeNS(null, "stroke-opacity", value)
    } else {
      this.node.removeAttributeNS(null, "fill-opacity");
      this.node.removeAttributeNS(null, "stroke-opacity");
    }
  },

  /**
   * Returns an array of dockers of this object.
   */
  getDockers: function () {
    return this.dockers;
  },

  getMagnets: function () {
    return this.magnets;
  },

  getDefaultMagnet: function () {
    if (this._defaultMagnet) {
      return this._defaultMagnet;
    } else if (this.magnets.length > 0) {
      return this.magnets[0];
    } else {
      return undefined;
    }
  },

  getParentShape: function () {
    return this.parent;
  },

  getIncomingShapes: function (iterator) {
    if (iterator) {
      this.incoming.each(iterator);
    }
    return this.incoming;
  },

  getIncomingNodes: function (iterator) {
    return this.incoming.select(function (incoming) {
      var isNode = (incoming instanceof ORYX.Core.Node);
      if (isNode && iterator) iterator(incoming);
      return isNode;
    });
  },


  getOutgoingShapes: function (iterator) {
    if (iterator) {
      this.outgoing.each(iterator);
    }
    return this.outgoing;
  },

  getOutgoingNodes: function (iterator) {
    return this.outgoing.select(function (out) {
      var isNode = (out instanceof ORYX.Core.Node);
      if (isNode && iterator) iterator(out);
      return isNode;
    });
  },

  getAllDockedShapes: function (iterator) {
    var result = this.incoming.concat(this.outgoing);
    if (iterator) {
      result.each(iterator);
    }
    return result
  },

  getCanvas: function () {
    if (this.parent instanceof ORYX.Core.Canvas) {
      return this.parent;
    } else if (this.parent instanceof ORYX.Core.Shape) {
      return this.parent.getCanvas();
    } else {
      return undefined;
    }
  },

  /**
   *
   * @param {Object} deep
   * @param {Object} iterator
   */
  getChildNodes: function (deep, iterator) {
    if (!deep && !iterator) {
      return this.nodes.clone();
    } else {
      var result = [];
      this.nodes.each(function (uiObject) {
        if (!uiObject.isVisible) {
          return
        }
        if (iterator) {
          iterator(uiObject);
        }
        result.push(uiObject);

        if (deep && uiObject instanceof ORYX.Core.Shape) {
          result = result.concat(uiObject.getChildNodes(deep, iterator));
        }
      });

      return result;
    }
  },

  /**
   * Overrides the UIObject.add method. Adds uiObject to the correct sub node.
   * @param {UIObject} uiObject
   * @param {Number} index
   */
  add: function (uiObject, index, silent) {
    //parameter has to be an UIObject, but
    // must not be an Edge.
    if (uiObject instanceof ORYX.Core.UIObject
      && !(uiObject instanceof ORYX.Core.Edge)) {

      if (!(this.children.member(uiObject))) {
        //if uiObject is child of another parent, remove it from that parent.
        if (uiObject.parent) {
          uiObject.parent.remove(uiObject, true);
        }

        //add uiObject to this Shape
        if (index != undefined)
          this.children.splice(index, 0, uiObject);
        else
          this.children.push(uiObject);

        //set parent reference
        uiObject.parent = this;

        //add uiObject.node to this.node depending on the type of uiObject
        var parent;
        if (uiObject instanceof ORYX.Core.Node) {
          parent = this.node.childNodes[0].childNodes[1];
          this.nodes.push(uiObject);
        } else if (uiObject instanceof ORYX.Core.Controls.Control) {
          var ctrls = this.node.childNodes[1];
          if (uiObject instanceof ORYX.Core.Controls.Docker) {
            parent = ctrls.childNodes[0];
            if (this.dockers.length >= 2) {
              this.dockers.splice(index !== undefined ? Math.min(index, this.dockers.length - 1) : this.dockers.length - 1, 0, uiObject);
            } else {
              this.dockers.push(uiObject);
            }
          } else if (uiObject instanceof ORYX.Core.Controls.Magnet) {
            parent = ctrls.childNodes[1];
            this.magnets.push(uiObject);
          } else {
            parent = ctrls;
          }
        } else {	//UIObject
          parent = this.node;
        }

        if (index != undefined && index < parent.childNodes.length)
          uiObject.node = parent.insertBefore(uiObject.node, parent.childNodes[index]);
        else
          uiObject.node = parent.appendChild(uiObject.node);

        this._changed();
        //uiObject.bounds.registerCallback(this._changedCallback);


        if (this.eventHandlerCallback && silent !== true)
          this.eventHandlerCallback({type: ORYX.CONFIG.EVENT_SHAPEADDED, shape: uiObject})

      } else {

        ORYX.Log.warn("add: ORYX.Core.UIObject is already a child of this object.");
      }
    } else {

      ORYX.Log.warn("add: Parameter is not of type ORYX.Core.UIObject.");
    }
  },

  /**
   * Overrides the UIObject.remove method. Removes uiObject.
   * @param {UIObject} uiObject
   */
  remove: function (uiObject, silent) {
    //if uiObject is a child of this object, remove it.
    if (this.children.member(uiObject)) {
      //remove uiObject from children
      var parent = uiObject.parent;

      this.children = this.children.without(uiObject);

      //delete parent reference of uiObject
      uiObject.parent = undefined;

      //delete uiObject.node from this.node
      if (uiObject instanceof ORYX.Core.Shape) {
        if (uiObject instanceof ORYX.Core.Edge) {
          uiObject.removeMarkers();
          uiObject.node = this.node.childNodes[0].childNodes[2].removeChild(uiObject.node);
        } else {
          uiObject.node = this.node.childNodes[0].childNodes[1].removeChild(uiObject.node);
          this.nodes = this.nodes.without(uiObject);
        }
      } else if (uiObject instanceof ORYX.Core.Controls.Control) {
        if (uiObject instanceof ORYX.Core.Controls.Docker) {
          uiObject.node = this.node.childNodes[1].childNodes[0].removeChild(uiObject.node);
          this.dockers = this.dockers.without(uiObject);
        } else if (uiObject instanceof ORYX.Core.Controls.Magnet) {
          uiObject.node = this.node.childNodes[1].childNodes[1].removeChild(uiObject.node);
          this.magnets = this.magnets.without(uiObject);
        } else {
          uiObject.node = this.node.childNodes[1].removeChild(uiObject.node);
        }
      }

      if (this.eventHandlerCallback && silent !== true)
        this.eventHandlerCallback({type: ORYX.CONFIG.EVENT_SHAPEREMOVED, shape: uiObject, parent: parent});

      this._changed();
      //uiObject.bounds.unregisterCallback(this._changedCallback);
    } else {

      ORYX.Log.warn("remove: ORYX.Core.UIObject is not a child of this object.");
    }
  },

  /**
   * Calculate the Border Intersection Point between two points
   * @param {PointA}
   * @param {PointB}
   */
  getIntersectionPoint: function () {

    var pointAX, pointAY, pointBX, pointBY;

    // Get the the two Points
    switch (arguments.length) {
      case 2:
        pointAX = arguments[0].x;
        pointAY = arguments[0].y;
        pointBX = arguments[1].x;
        pointBY = arguments[1].y;
        break;
      case 4:
        pointAX = arguments[0];
        pointAY = arguments[1];
        pointBX = arguments[2];
        pointBY = arguments[3];
        break;
      default:
        throw "getIntersectionPoints needs two or four arguments";
    }


    // Defined an include and exclude point
    var includePointX, includePointY, excludePointX, excludePointY;

    var bounds = this.absoluteBounds();

    if (this.isPointIncluded(pointAX, pointAY, bounds)) {
      includePointX = pointAX;
      includePointY = pointAY;
    } else {
      excludePointX = pointAX;
      excludePointY = pointAY;
    }

    if (this.isPointIncluded(pointBX, pointBY, bounds)) {
      includePointX = pointBX;
      includePointY = pointBY;
    } else {
      excludePointX = pointBX;
      excludePointY = pointBY;
    }

    // If there is no inclue or exclude Shape, than return
    if (!includePointX || !includePointY || !excludePointX || !excludePointY) {
      return undefined;
    }

    var midPointX = 0;
    var midPointY = 0;

    var refPointX, refPointY;

    var minDifferent = 1;
    // Get the UpperLeft and LowerRight
    //var ul = bounds.upperLeft();
    //var lr = bounds.lowerRight();

    var i = 0;

    while (true) {
      // Calculate the midpoint of the current to points
      var midPointX = Math.min(includePointX, excludePointX) + ((Math.max(includePointX, excludePointX) - Math.min(includePointX, excludePointX)) / 2.0);
      var midPointY = Math.min(includePointY, excludePointY) + ((Math.max(includePointY, excludePointY) - Math.min(includePointY, excludePointY)) / 2.0);


      // Set the new midpoint by the means of the include of the bounds
      if (this.isPointIncluded(midPointX, midPointY, bounds)) {
        includePointX = midPointX;
        includePointY = midPointY;
      } else {
        excludePointX = midPointX;
        excludePointY = midPointY;
      }

      // Calc the length of the line
      var length = Math.sqrt(Math.pow(includePointX - excludePointX, 2) + Math.pow(includePointY - excludePointY, 2))
      // Calc a point one step from the include point
      refPointX = includePointX + ((excludePointX - includePointX) / length),
        refPointY = includePointY + ((excludePointY - includePointY) / length)


      // If the reference point not in the bounds, break
      if (!this.isPointIncluded(refPointX, refPointY, bounds)) {
        break
      }


    }

    // Return the last includepoint
    return {x: refPointX, y: refPointY};
  },


  /**
   * Calculate if the point is inside the Shape
   * @param {PointX}
   * @param {PointY}
   */
  isPointIncluded: function () {
    return false
  },

  /**
   * Returns TRUE if the given node
   * is a child node of the shapes node
   * @param {Element} node
   * @return {Boolean}
   *
   */
  containsNode: function (node) {
    var me = this.node.firstChild.firstChild;
    while (node) {
      if (node == me) {
        return true;
      }
      node = node.parentNode;
    }
    return false
  },

  /**
   * Calculate if the point is over an special offset area
   * @param {Point}
   */
  isPointOverOffset: function () {
    return this.isPointIncluded.apply(this, arguments)
  },

  _dockerChanged: function () {

  },

  /**
   * Create a Docker for this Edge
   *
   */
  createDocker: function (index, position) {
    var docker = new ORYX.Core.Controls.Docker({eventHandlerCallback: this.eventHandlerCallback});
    docker.bounds.registerCallback(this._dockerChangedCallback);
    if (position) {
      docker.bounds.centerMoveTo(position);
    }
    this.add(docker, index);

    return docker
  },

  /**
   * Get the serialized object
   * return Array with hash-entrees (prefix, name, value)
   * Following values will given:
   *    Bounds
   *    Outgoing Shapes
   *    Parent
   */
  serialize: function () {
    var serializedObject = arguments.callee.$.serialize.apply(this);

    // Add the bounds
    serializedObject.push({name: 'bounds', prefix: 'oryx', value: this.bounds.serializeForERDF(), type: 'literal'});

    // Add the outgoing shapes
    this.getOutgoingShapes().each((function (followingShape) {
      serializedObject.push({
        name: 'outgoing',
        prefix: 'raziel',
        value: '#' + ERDF.__stripHashes(followingShape.resourceId),
        type: 'resource'
      });
    }).bind(this));

    // Add the parent shape, if the parent not the canvas
    //if(this.parent instanceof ORYX.Core.Shape){
    serializedObject.push({
      name: 'parent',
      prefix: 'raziel',
      value: '#' + ERDF.__stripHashes(this.parent.resourceId),
      type: 'resource'
    });
    //}

    return serializedObject;
  },


  deserialize: function (serialize, json) {
    arguments.callee.$.deserialize.apply(this, arguments);

    // Set the Bounds
    var bounds = serialize.find(function (ser) {
      return 'oryx-bounds' === (ser.prefix + "-" + ser.name)
    });
    if (bounds) {
      var b = bounds.value.replace(/,/g, " ").split(" ").without("");
      if (this instanceof ORYX.Core.Edge) {
        if (!this.dockers.first().isChanged)
          this.dockers.first().bounds.centerMoveTo(parseFloat(b[0]), parseFloat(b[1]));
        if (!this.dockers.last().isChanged)
          this.dockers.last().bounds.centerMoveTo(parseFloat(b[2]), parseFloat(b[3]));
      } else {
        this.bounds.set(parseFloat(b[0]), parseFloat(b[1]), parseFloat(b[2]), parseFloat(b[3]));
      }
    }

    if (json && json.labels instanceof Array) {
      json.labels.each(function (slabel) {
        var label = this.getLabel(slabel.ref);
        if (label) {
          label.deserialize(slabel, this);
        }
      }.bind(this))
    }
  },

  toJSON: function () {
    var json = arguments.callee.$.toJSON.apply(this, arguments);

    var labels = [], id = this.id;
    this._labels.each(function (obj) {
      var slabel = obj.value.serialize();
      if (slabel) {
        slabel.ref = obj.key.replace(id, '');
        labels.push(slabel);
      }
    });

    if (labels.length > 0) {
      json.labels = labels;
    }
    return json;
  },


  /**
   * Private methods.
   */

  /**
   * Child classes have to overwrite this method for initializing a loaded
   * SVG representation.
   * @param {SVGDocument} svgDocument
   */
  _init: function (svgDocument) {
    //adjust ids
    this._adjustIds(svgDocument, 0);
  },

  _adjustIds: function (element, idIndex) {
    if (element instanceof Element) {
      var eid = element.getAttributeNS(null, 'id');
      if (eid && eid !== "") {
        element.setAttributeNS(null, 'id', this.id + eid);
      } else {
        element.setAttributeNS(null, 'id', this.id + "_" + this.id + "_" + idIndex);
        idIndex++;
      }

      // Replace URL in fill attribute
      var fill = element.getAttributeNS(null, 'fill');
      if (fill && fill.include("url(#")) {
        fill = fill.replace(/url\(#/g, 'url(#' + this.id);
        element.setAttributeNS(null, 'fill', fill);
      }

      if (element.hasChildNodes()) {
        for (var i = 0; i < element.childNodes.length; i++) {
          idIndex = this._adjustIds(element.childNodes[i], idIndex);
        }
      }
    }
    return idIndex;
  },

  toString: function () {
    return "ORYX.Core.Shape " + this.getId()
  }
};
ORYX.Core.Shape = ORYX.Core.AbstractShape.extend(ORYX.Core.Shape);


/**
 * @classDescription Abstract base class for all Nodes.
 * @extends ORYX.Core.Shape
 */
ORYX.Core.Node = {
  /**
   * Constructor
   * @param options {Object} A container for arguments.
   * @param stencil {Stencil}
   */
  construct: function (options, stencil, facade) {
    arguments.callee.$.construct.apply(this, arguments);

    this.isSelectable = true;
    this.isMovable = true;
    this._dockerUpdated = false;
    this.facade = facade;

    this._oldBounds = new ORYX.Core.Bounds(); // init bounds with undefined values
    this._svgShapes = []; // array of all SVGShape objects of
    // SVG representation

    //TODO vielleicht in shape verschieben?
    this.minimumSize = undefined; // {width:..., height:...}
    this.maximumSize = undefined;

    //TODO vielleicht in shape oder uiobject verschieben?
    // vielleicht sogar isResizable ersetzen?
    this.isHorizontallyResizable = false;
    this.isVerticallyResizable = false;

    this.dataId = undefined;

    this._init(this._stencil.view());
    this.forcedHeight = -1;
  },

  /**
   * This method checks whether the shape is resized correctly and calls the
   * super class update method.
   */
  _update: function () {
    this.dockers.invoke("update");
    if (this.isChanged) {
      var bounds = this.bounds;
      var oldBounds = this._oldBounds;

      if (this.isResized) {
        var widthDelta = bounds.width() / oldBounds.width();
        var heightDelta = bounds.height() / oldBounds.height();

        // iterate over all relevant svg elements and resize them
        this._svgShapes.each(function (svgShape) {
          //adjust width
          if (svgShape.isHorizontallyResizable) {
            svgShape.width = svgShape.oldWidth * widthDelta;
          }
          //adjust height
          if (svgShape.isVerticallyResizable) {
            svgShape.height = svgShape.oldHeight * heightDelta;
          }

          //check, if anchors are set
          var anchorOffset;
          var leftIncluded = svgShape.anchorLeft;
          var rightIncluded = svgShape.anchorRight;

          if (rightIncluded) {
            anchorOffset = oldBounds.width() - (svgShape.oldX + svgShape.oldWidth);
            if (leftIncluded) {
              svgShape.width = bounds.width() - svgShape.x - anchorOffset;
            } else {
              svgShape.x = bounds.width() - (anchorOffset + svgShape.width);
            }
          } else if (!leftIncluded) {
            svgShape.x = widthDelta * svgShape.oldX;
            if (!svgShape.isHorizontallyResizable) {
              svgShape.x = svgShape.x + svgShape.width * widthDelta / 2 - svgShape.width / 2;
            }
          }

          var topIncluded = svgShape.anchorTop;
          var bottomIncluded = svgShape.anchorBottom;

          if (bottomIncluded) {
            anchorOffset = oldBounds.height() - (svgShape.oldY + svgShape.oldHeight);
            if (topIncluded) {
              svgShape.height = bounds.height() - svgShape.y - anchorOffset;
            } else {
              // Hack for choreography task layouting
              if (!svgShape._isYLocked) {
                svgShape.y = bounds.height() - (anchorOffset + svgShape.height);
              }
            }
          } else if (!topIncluded) {
            svgShape.y = heightDelta * svgShape.oldY;
            if (!svgShape.isVerticallyResizable) {
              svgShape.y = svgShape.y + svgShape.height * heightDelta / 2 - svgShape.height / 2;
            }
          }
        });

        //check, if the current bounds is unallowed horizontally or vertically resized
        var p = {
          x: 0,
          y: 0
        };
        if (!this.isHorizontallyResizable && bounds.width() !== oldBounds.width()) {
          p.x = oldBounds.width() - bounds.width();
        }
        if (!this.isVerticallyResizable && bounds.height() !== oldBounds.height()) {
          p.y = oldBounds.height() - bounds.height();
        }
        if (p.x !== 0 || p.y !== 0) {
          bounds.extend(p);
        }

        //check, if the current bounds are between maximum and minimum bounds
        p = {
          x: 0,
          y: 0
        };
        var widthDifference, heightDifference;
        if (this.minimumSize) {

          ORYX.Log.debug("Shape (%0)'s min size: (%1x%2)", this, this.minimumSize.width, this.minimumSize.height);
          widthDifference = this.minimumSize.width - bounds.width();
          if (widthDifference > 0) {
            p.x += widthDifference;
          }
          heightDifference = this.minimumSize.height - bounds.height();
          if (heightDifference > 0) {
            p.y += heightDifference;
          }
        }
        if (this.maximumSize) {

          ORYX.Log.debug("Shape (%0)'s max size: (%1x%2)", this, this.maximumSize.width, this.maximumSize.height);
          widthDifference = bounds.width() - this.maximumSize.width;
          if (widthDifference > 0) {
            p.x -= widthDifference;
          }
          heightDifference = bounds.height() - this.maximumSize.height;
          if (heightDifference > 0) {
            p.y -= heightDifference;
          }
        }
        if (p.x !== 0 || p.y !== 0) {
          bounds.extend(p);
        }

        var leftIncluded, rightIncluded, topIncluded, bottomIncluded, center, newX, newY;

        this.magnets.each(function (magnet) {
          leftIncluded = magnet.anchorLeft;
          rightIncluded = magnet.anchorRight;
          topIncluded = magnet.anchorTop;
          bottomIncluded = magnet.anchorBottom;

          center = magnet.bounds.center();

          if (leftIncluded) {
            newX = center.x;
          } else if (rightIncluded) {
            newX = bounds.width() - (oldBounds.width() - center.x)
          } else {
            newX = center.x * widthDelta;
          }

          if (topIncluded) {
            newY = center.y;
          } else if (bottomIncluded) {
            newY = bounds.height() - (oldBounds.height() - center.y);
          } else {
            newY = center.y * heightDelta;
          }

          if (center.x !== newX || center.y !== newY) {
            magnet.bounds.centerMoveTo(newX, newY);
          }
        });

        //set new position of labels
        this.getLabels().each(function (label) {
          // Set the position dependings on it anchor
          if (!label.isAnchorLeft()) {
            if (label.isAnchorRight()) {
              label.setX(bounds.width() - (oldBounds.width() - label.oldX))
            } else {
              label.setX((label.position ? label.position.x : label.x) * widthDelta);
            }
          }
          if (!label.isAnchorTop()) {
            if (label.isAnchorBottom()) {
              label.setY(bounds.height() - (oldBounds.height() - label.oldY));
            } else {
              label.setY((label.position ? label.position.y : label.y) * heightDelta);
            }
          }

          // If there is an position,
          // set the origin position as well
          if (label.position) {
            if (!label.isOriginAnchorLeft()) {
              if (label.isOriginAnchorRight()) {
                label.setOriginX(bounds.width() - (oldBounds.width() - label.oldX))
              } else {
                label.setOriginX(label.x * widthDelta);
              }
            }
            if (!label.isOriginAnchorTop()) {
              if (label.isOriginAnchorBottom()) {
                label.setOriginY(bounds.height() - (oldBounds.height() - label.oldY));
              } else {
                label.setOriginY(label.y * heightDelta);
              }
            }
          }
        });

        //update docker
        var docker = this.dockers[0];
        if (docker) {
          docker.bounds.unregisterCallback(this._dockerChangedCallback);
          if (!this._dockerUpdated) {
            docker.bounds.centerMoveTo(this.bounds.center());
            this._dockerUpdated = false;
          }

          docker.update();
          docker.bounds.registerCallback(this._dockerChangedCallback);
        }
        this.isResized = false;
      }

      this.refresh();

      this.isChanged = false;

      this._oldBounds = this.bounds.clone();
    }

    this.children.each(function (value) {
      if (!(value instanceof ORYX.Core.Controls.Docker)) {
        value._update();
      }
    });

    if (this.dockers.length > 0 && !this.dockers.first().getDockedShape()) {
      this.dockers.each(function (docker) {
        docker.bounds.centerMoveTo(this.bounds.center())
      }.bind(this))
    }

    /*this.incoming.each((function(edge) {
			if(!(this.dockers[0] && this.dockers[0].getDockedShape() instanceof ORYX.Core.Node))
				edge._update(true);
		}).bind(this));

		this.outgoing.each((function(edge) {
			if(!(this.dockers[0] && this.dockers[0].getDockedShape() instanceof ORYX.Core.Node))
				edge._update(true);
		}).bind(this)); */
  },

  /**
   * This method repositions and resizes the SVG representation
   * of the shape.
   */
  refresh: function () {
    arguments.callee.$.refresh.apply(this, arguments);

    /** Movement */
    var x = this.bounds.upperLeft().x;
    var y = this.bounds.upperLeft().y;

    // Move owner element
    this.node.firstChild.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")");
    // Move magnets
    this.node.childNodes[1].childNodes[1].setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")");

    /** Resize */

    //iterate over all relevant svg elements and update them
    this._svgShapes.each(function (svgShape) {
      svgShape.update();
    });
  },

  _dockerChanged: function () {
    var docker = this.dockers[0];

    //set the bounds of the the association
    this.bounds.centerMoveTo(docker.bounds.center());

    this._dockerUpdated = true;
    //this._update(true);
  },

  /**
   * This method traverses a tree of SVGElements and returns
   * all SVGShape objects. For each basic shape or path element
   * a SVGShape object is initialized.
   *
   * @param svgNode {SVGElement}
   * @return {Array} Array of SVGShape objects
   */
  _initSVGShapes: function (svgNode) {
    var svgShapes = [];
    try {
      var svgShape = new ORYX.Core.SVG.SVGShape(svgNode);
      svgShapes.push(svgShape);
    }
    catch (e) {
      //do nothing
    }

    if (svgNode.hasChildNodes()) {
      for (var i = 0; i < svgNode.childNodes.length; i++) {
        svgShapes = svgShapes.concat(this._initSVGShapes(svgNode.childNodes[i]));
      }
    }

    return svgShapes;
  },

  /**
   * Calculate if the point is inside the Shape
   * @param {PointX}
   * @param {PointY}
   * @param {absoluteBounds} optional: for performance
   */
  isPointIncluded: function (pointX, pointY, absoluteBounds) {
    // If there is an arguments with the absoluteBounds
    var absBounds = absoluteBounds && absoluteBounds instanceof ORYX.Core.Bounds ? absoluteBounds : this.absoluteBounds();

    if (!absBounds.isIncluded(pointX, pointY)) {
      return false;
    } else {

    }


    //point = Object.clone(point);
    var ul = absBounds.upperLeft();
    var x = pointX - ul.x;
    var y = pointY - ul.y;

    var i = 0;
    do {
      var isPointIncluded = this._svgShapes[i++].isPointIncluded(x, y);
    } while (!isPointIncluded && i < this._svgShapes.length)

    return isPointIncluded;

    /*return this._svgShapes.any(function(svgShape){
            return svgShape.isPointIncluded(point);
        });*/
  },

  /**
   * Calculate if the point is over an special offset area
   * @param {Point}
   */
  isPointOverOffset: function (pointX, pointY) {
    var isOverEl = arguments.callee.$.isPointOverOffset.apply(this, arguments);

    if (isOverEl) {

      // If there is an arguments with the absoluteBounds
      var absBounds = this.absoluteBounds();
      absBounds.widen(-ORYX.CONFIG.BORDER_OFFSET);

      if (!absBounds.isIncluded(pointX, pointY)) {
        return true;
      }
    }

    return false;

  },

  serialize: function () {
    var result = arguments.callee.$.serialize.apply(this);

    // Add the docker's bounds
    // nodes only have at most one docker!
    this.dockers.each((function (docker) {
      if (docker.getDockedShape()) {
        var center = docker.referencePoint;
        center = center ? center : docker.bounds.center();
        result.push({
          name: 'docker',
          prefix: 'oryx',
          value: $H(center).values().join(','),
          type: 'literal'
        });
      }
    }).bind(this));

    // Get the spezific serialized object from the stencil
    try {
      //result = this.getStencil().serialize(this, result);

      var serializeEvent = this.getStencil().serialize();

      /*
			 * call serialize callback by reference, result should be found
			 * in serializeEvent.result
			 */
      if (serializeEvent.type) {
        serializeEvent.shape = this;
        serializeEvent.data = result;
        serializeEvent.result = undefined;
        serializeEvent.forceExecution = true;

        this._delegateEvent(serializeEvent);

        if (serializeEvent.result) {
          result = serializeEvent.result;
        }
      }
    }
    catch (e) {
    }
    return result;
  },

  deserialize: function (data) {
    arguments.callee.$.deserialize.apply(this, arguments);
    try {
      var deserializeEvent = this.getStencil().deserialize();
      /*
			 * call serialize callback by reference, result should be found
			 * in serializeEventInfo.result
			 */
      if (deserializeEvent.type) {
        deserializeEvent.shape = this;
        deserializeEvent.data = data;
        deserializeEvent.result = undefined;
        deserializeEvent.forceExecution = true;

        this._delegateEvent(deserializeEvent);
        if (deserializeEvent.result) {
          data = deserializeEvent.result;
        }
      }
    }
    catch (e) {
    }

    // Set the outgoing shapes
    var outgoing = data.findAll(function (ser) {
      return (ser.prefix + "-" + ser.name) == 'raziel-outgoing'
    });
    outgoing.each((function (obj) {
      // TODO: Look at Canvas
      if (!this.parent) {
        return
      }

      // Set outgoing Shape
      var next = this.getCanvas().getChildShapeByResourceId(obj.value);

      if (next) {
        if (next instanceof ORYX.Core.Edge) {
          //Set the first docker of the next shape
          next.dockers.first().setDockedShape(this);
          next.dockers.first().setReferencePoint(next.dockers.first().bounds.center());
        } else if (next.dockers.length > 0) { //next is a node and next has a docker
          next.dockers.first().setDockedShape(this);
          //next.dockers.first().setReferencePoint({x: this.bounds.width() / 2.0, y: this.bounds.height() / 2.0});
        }
      }

    }).bind(this));

    if (this.dockers.length === 1) {
      var dockerPos;
      dockerPos = data.find(function (entry) {
        return (entry.prefix + "-" + entry.name === "oryx-dockers");
      });

      if (dockerPos) {
        var points = dockerPos.value.replace(/,/g, " ").split(" ").without("").without("#");
        if (points.length === 2 && this.dockers[0].getDockedShape()) {
          this.dockers[0].setReferencePoint({
            x: parseFloat(points[0]),
            y: parseFloat(points[1])
          });
        }
        else {
          this.dockers[0].bounds.centerMoveTo(parseFloat(points[0]), parseFloat(points[1]));
        }
      }
    }
  },

  /**
   * This method excepts the SVGDoucment that is the SVG representation
   * of this shape.
   * The bounds of the shape are calculated, the SVG representation's upper left point
   * is moved to 0,0 and it the method sets if this shape is resizable.
   *
   * @param {SVGDocument} svgDocument
   */
  _init: function (svgDocument) {
    arguments.callee.$._init.apply(this, arguments);
    var svgNode = svgDocument.getElementsByTagName("g")[0]; //outer most g node
    // set all required attributes
    var attributeTitle = svgDocument.ownerDocument.createAttribute("title");
    attributeTitle.nodeValue = this.getStencil().title();
    svgNode.setAttributeNode(attributeTitle);

    var attributeId = svgDocument.ownerDocument.createAttribute("id");
    attributeId.nodeValue = this.id;
    svgNode.setAttributeNode(attributeId);


    //
    var stencilTargetNode = this.node.childNodes[0].childNodes[0]; //<g class=me>"
    svgNode = stencilTargetNode.appendChild(svgNode);

    // Add to the EventHandler
    this.addEventHandlers(svgNode.parentNode);

    /**set minimum and maximum size*/
    var minSizeAttr = svgNode.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "minimumSize");
    if (minSizeAttr) {
      minSizeAttr = minSizeAttr.replace("/,/g", " ");
      var minSizeValues = minSizeAttr.split(" ");
      minSizeValues = minSizeValues.without("");

      if (minSizeValues.length > 1) {
        this.minimumSize = {
          width: parseFloat(minSizeValues[0]),
          height: parseFloat(minSizeValues[1])
        };
      }
      else {
        //set minimumSize to (1,1), so that width and height of the stencil can never be (0,0)
        this.minimumSize = {
          width: 1,
          height: 1
        };
      }
    }

    var maxSizeAttr = svgNode.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "maximumSize");
    if (maxSizeAttr) {
      maxSizeAttr = maxSizeAttr.replace("/,/g", " ");
      var maxSizeValues = maxSizeAttr.split(" ");
      maxSizeValues = maxSizeValues.without("");

      if (maxSizeValues.length > 1) {
        this.maximumSize = {
          width: parseFloat(maxSizeValues[0]),
          height: parseFloat(maxSizeValues[1])
        };
      }
    }

    if (this.minimumSize && this.maximumSize &&
      (this.minimumSize.width > this.maximumSize.width ||
        this.minimumSize.height > this.maximumSize.height)) {

      //TODO wird verschluckt!!!
      throw this + ": Minimum Size must be greater than maxiumSize.";
    }

    /**get current bounds and adjust it to upperLeft == (0,0)*/
    // initialize all SVGShape objects
    this._svgShapes = this._initSVGShapes(svgNode);

    // get upperLeft and lowerRight of stencil
    var upperLeft = {
      x: undefined,
      y: undefined
    };
    var lowerRight = {
      x: undefined,
      y: undefined
    };
    var me = this;
    this._svgShapes.each(function (svgShape) {
      upperLeft.x = (upperLeft.x !== undefined) ? Math.min(upperLeft.x, svgShape.x) : svgShape.x;
      upperLeft.y = (upperLeft.y !== undefined) ? Math.min(upperLeft.y, svgShape.y) : svgShape.y;
      lowerRight.x = (lowerRight.x !== undefined) ? Math.max(lowerRight.x, svgShape.x + svgShape.width) : svgShape.x + svgShape.width;
      lowerRight.y = (lowerRight.y !== undefined) ? Math.max(lowerRight.y, svgShape.y + svgShape.height) : svgShape.y + svgShape.height;

      /** set if resizing is enabled */
      //TODO isResizable durch die beiden anderen booleans ersetzen?
      if (svgShape.isHorizontallyResizable) {
        me.isHorizontallyResizable = true;
        me.isResizable = true;
      }
      if (svgShape.isVerticallyResizable) {
        me.isVerticallyResizable = true;
        me.isResizable = true;
      }
      if (svgShape.anchorTop && svgShape.anchorBottom) {
        me.isVerticallyResizable = true;
        me.isResizable = true;
      }
      if (svgShape.anchorLeft && svgShape.anchorRight) {
        me.isHorizontallyResizable = true;
        me.isResizable = true;
      }
    });

    // move all SVGShapes by -upperLeft
    this._svgShapes.each(function (svgShape) {
      svgShape.x -= upperLeft.x;
      svgShape.y -= upperLeft.y;
      svgShape.update();
    });

    // set bounds of shape
    // the offsets are also needed for positioning the magnets and the docker
    var offsetX = upperLeft.x;
    var offsetY = upperLeft.y;

    lowerRight.x -= offsetX;
    lowerRight.y -= offsetY;
    upperLeft.x = 0;
    upperLeft.y = 0;

    // prevent that width or height of initial bounds is 0
    if (lowerRight.x === 0) {
      lowerRight.x = 1;
    }
    if (lowerRight.y === 0) {
      lowerRight.y = 1;
    }

    this._oldBounds.set(upperLeft, lowerRight);
    this.bounds.set(upperLeft, lowerRight);

    /**initialize magnets */

    var magnets = svgDocument.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_ORYX, "magnets");

    if (magnets && magnets.length > 0) {

      magnets = $A(magnets[0].getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_ORYX, "magnet"));

      var me = this;
      magnets.each(function (magnetElem) {
        var magnet = new ORYX.Core.Controls.Magnet({
          eventHandlerCallback: me.eventHandlerCallback
        });
        var cx = parseFloat(magnetElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "cx"));
        var cy = parseFloat(magnetElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "cy"));
        magnet.bounds.centerMoveTo({
          x: cx - offsetX,
          y: cy - offsetY
        });

        //get anchors
        var anchors = magnetElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "anchors");
        if (anchors) {
          anchors = anchors.replace("/,/g", " ");
          anchors = anchors.split(" ").without("");
          for (var i = 0; i < anchors.length; i++) {
            switch (anchors[i].toLowerCase()) {
              case "left":
                magnet.anchorLeft = true;
                break;
              case "right":
                magnet.anchorRight = true;
                break;
              case "top":
                magnet.anchorTop = true;
                break;
              case "bottom":
                magnet.anchorBottom = true;
                break;
            }
          }
        }

        me.add(magnet);

        //check, if magnet is default magnet
        if (!this._defaultMagnet) {
          var defaultAttr = magnetElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "default");
          if (defaultAttr && defaultAttr.toLowerCase() === "yes") {
            me._defaultMagnet = magnet;
          }
        }
      });
    } else {
      // Add a Magnet in the Center of Shape
      var magnet = new ORYX.Core.Controls.Magnet();
      magnet.bounds.centerMoveTo(this.bounds.width() / 2, this.bounds.height() / 2);
      this.add(magnet);
    }

    /**initialize docker */
    var dockerElem = svgDocument.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_ORYX, "docker");

    if (dockerElem && dockerElem.length > 0) {
      dockerElem = dockerElem[0];
      var docker = this.createDocker();
      var cx = parseFloat(dockerElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "cx"));
      var cy = parseFloat(dockerElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "cy"));
      docker.bounds.centerMoveTo({
        x: cx - offsetX,
        y: cy - offsetY
      });

      //get anchors
      var anchors = dockerElem.getAttributeNS(ORYX.CONFIG.NAMESPACE_ORYX, "anchors");
      if (anchors) {
        anchors = anchors.replace("/,/g", " ");
        anchors = anchors.split(" ").without("");

        for (var i = 0; i < anchors.length; i++) {
          switch (anchors[i].toLowerCase()) {
            case "left":
              docker.anchorLeft = true;
              break;
            case "right":
              docker.anchorRight = true;
              break;
            case "top":
              docker.anchorTop = true;
              break;
            case "bottom":
              docker.anchorBottom = true;
              break;
          }
        }
      }
    }

    /**initialize labels*/
    var textElems = svgNode.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'text');
    $A(textElems).each((function (textElem) {
      var label = new ORYX.Core.SVG.Label({
        textElement: textElem,
        shapeId: this.id
      });
      label.x -= offsetX;
      label.y -= offsetY;
      this._labels.set(label.id, label);

      label.registerOnChange(this.layout.bind(this));

      // Only apply fitting on form-components
      if (this._stencil.id().indexOf(ORYX.CONFIG.FORM_ELEMENT_ID_PREFIX) == 0) {
        label.registerOnChange(this.fitToLabels.bind(this));
      }

    }).bind(this));
  },

  fitToLabels: function () {
    var y = 0;

    this.getLabels().each(function (label) {
      var lr = label.getY() + label.getHeight();
      if (lr > y) {
        y = lr;
      }
    });

    var bounds = this.bounds;
    var boundsChanged = false;

    if (this.minimumSize) {
      // Check if y-value exceeds the min-value. If not, stick to this value.
      var minHeight = this.minimumSize.height;
      if (y < minHeight && bounds.height() > minHeight && minHeight > this.forcedHeight) {
        bounds.set(bounds.upperLeft().x, bounds.upperLeft().y, bounds.lowerRight().x, bounds.upperLeft().y + minHeight);
        boundsChanged = true;
      } else if (y > minHeight && bounds.height() != y && y > this.forcedHeight) {
        bounds.set(bounds.upperLeft().x, bounds.upperLeft().y, bounds.lowerRight().x, bounds.upperLeft().y + y);
        boundsChanged = true;
      } else if (bounds.height() > this.forcedHeight && this.forcedHeight > 0) {
        bounds.set(bounds.upperLeft().x, bounds.upperLeft().y, bounds.lowerRight().x, bounds.upperLeft().y + this.forcedHeight);
        boundsChanged = true;
      }
    }

    if (boundsChanged) {
      // Force facade to re-layout since bounds are changed AFTER layout has been performed
      if (this.facade.getCanvas() != null) {
        this.facade.getCanvas().update();
      }

      // Re-select if needed to force the select
      if (this.facade.getSelection().member(this)) {
        var selectedNow = this.facade.getSelection();
        this.facade.setSelection([]);
        this.facade.setSelection(selectedNow);
      }
    }
  },

  /**
   * Override the Method, that a docker is not shown
   *
   */
  createDocker: function () {
    var docker = new ORYX.Core.Controls.Docker({eventHandlerCallback: this.eventHandlerCallback});
    docker.bounds.registerCallback(this._dockerChangedCallback);

    this.dockers.push(docker);
    docker.parent = this;
    docker.bounds.registerCallback(this._changedCallback);

    return docker
  },

  toString: function () {
    return this._stencil.title() + " " + this.id
  }
};
ORYX.Core.Node = ORYX.Core.Shape.extend(ORYX.Core.Node);

/**
 * @classDescription Abstract base class for all connections.
 * @extends {ORYX.Core.Shape}
 * @param options {Object}
 *
 * TODO da die verschiebung der Edge nicht ueber eine
 *  translation gemacht wird, die sich auch auf alle kind UIObjects auswirkt,
 *  muessen die kinder hier beim verschieben speziell betrachtet werden.
 *  Das sollte ueberarbeitet werden.
 *
 */
ORYX.Core.Edge = {
  /**
   * Constructor
   * @param {Object} options
   * @param {Stencil} stencil
   */
  construct: function (options, stencil, facade) {
    arguments.callee.$.construct.apply(this, arguments);

    this.isMovable = true;
    this.isSelectable = true;

    this._dockerUpdated = false;

    this._markers = new Hash(); //a hash map of SVGMarker objects where keys are the marker ids
    this._paths = [];
    this._interactionPaths = [];
    this._dockersByPath = new Hash();
    this._markersByPath = new Hash();

    /* Data structures to store positioning information of attached child nodes */
    this.attachedNodePositionData = new Hash();

    //TODO was muss hier initial erzeugt werden?
    var stencilNode = this.node.childNodes[0].childNodes[0];
    stencilNode = ORYX.Editor.graft("http://www.w3.org/2000/svg", stencilNode, ['g', {
      "pointer-events": "painted"
    }]);

    //Add to the EventHandler
    this.addEventHandlers(stencilNode.parentNode);


    this._oldBounds = this.bounds.clone();

    //load stencil
    this._init(this._stencil.view());

    if (stencil instanceof Array) {
      this.deserialize(stencil);
    }

  },

  _update: function (force) {
    if (this._dockerUpdated || this.isChanged || force) {

      this.dockers.invoke("update");

      if (false && (this.bounds.width() === 0 || this.bounds.height() === 0)) {
        var width = this.bounds.width();
        var height = this.bounds.height();
        this.bounds.extend({
          x: width === 0 ? 2 : 0,
          y: height === 0 ? 2 : 0
        });
        this.bounds.moveBy({
          x: width === 0 ? -1 : 0,
          y: height === 0 ? -1 : 0
        });

      }

      // TODO: Bounds muss abhaengig des Eltern-Shapes gesetzt werden
      var upL = this.bounds.upperLeft();
      var oldUpL = this._oldBounds.upperLeft();
      var oldWidth = this._oldBounds.width() === 0 ? this.bounds.width() : this._oldBounds.width();
      var oldHeight = this._oldBounds.height() === 0 ? this.bounds.height() : this._oldBounds.height();
      var diffX = upL.x - oldUpL.x;
      var diffY = upL.y - oldUpL.y;
      var diffWidth = (this.bounds.width() / oldWidth) || 1;
      var diffHeight = (this.bounds.height() / oldHeight) || 1;

      this.dockers.each((function (docker) {
        // Unregister on BoundsChangedCallback
        docker.bounds.unregisterCallback(this._dockerChangedCallback);

        // If there is any changes at the edge and is there is not an DockersUpdate
        // set the new bounds to the docker
        if (!this._dockerUpdated) {
          docker.bounds.moveBy(diffX, diffY);

          if (diffWidth !== 1 || diffHeight !== 1) {
            var relX = docker.bounds.upperLeft().x - upL.x;
            var relY = docker.bounds.upperLeft().y - upL.y;

            docker.bounds.moveTo(upL.x + relX * diffWidth, upL.y + relY * diffHeight);
          }
        }
        // Do Docker update and register on DockersBoundChange
        docker.update();
        docker.bounds.registerCallback(this._dockerChangedCallback);

      }).bind(this));

      if (this._dockerUpdated) {
        var a = this.dockers.first().bounds.center();
        var b = this.dockers.first().bounds.center();

        this.dockers.each((function (docker) {
          var center = docker.bounds.center();
          a.x = Math.min(a.x, center.x);
          a.y = Math.min(a.y, center.y);
          b.x = Math.max(b.x, center.x);
          b.y = Math.max(b.y, center.y);
        }).bind(this));

        //set the bounds of the the association
        this.bounds.set(Object.clone(a), Object.clone(b));
      }

      upL = this.bounds.upperLeft();
      oldUpL = this._oldBounds.upperLeft();
      diffWidth = (this.bounds.width() / (oldWidth || this.bounds.width()));
      diffHeight = (this.bounds.height() / (oldHeight || this.bounds.height()));
      diffX = upL.x - oldUpL.x;
      diffY = upL.y - oldUpL.y;

      //reposition labels
      this.getLabels().each(function (label) {

        if (label.getReferencePoint()) {
          var ref = label.getReferencePoint();
          var from = ref.segment.from, to = ref.segment.to;
          if (!from || !from.parent || !to || !to.parent) {
            return;
          }

          var fromPosition = from.bounds.center(), toPosition = to.bounds.center();

          if (fromPosition.x === ref.segment.fromPosition.x && fromPosition.y === ref.segment.fromPosition.y &&
            toPosition.x === ref.segment.toPosition.x && toPosition.y === ref.segment.toPosition.y && !ref.dirty) {
            return;
          }

          if (!this.parent.initializingShapes) {
            var oldDistance = ORYX.Core.Math.getDistanceBetweenTwoPoints(ref.segment.fromPosition, ref.segment.toPosition, ref.intersection);
            var newIntersection = ORYX.Core.Math.getPointBetweenTwoPoints(fromPosition, toPosition, isNaN(oldDistance) ? 0.5 : oldDistance);

            /**
             * Set position
             */
              // Get the orthogonal identity vector of the current segment
            var oiv = ORYX.Core.Math.getOrthogonalIdentityVector(fromPosition, toPosition);
            var isHor = Math.abs(oiv.y) === 1, isVer = Math.abs(oiv.x) === 1;
            oiv.x *= ref.distance;
            oiv.y *= ref.distance; 				// vector * distance
            oiv.x += newIntersection.x;
            oiv.y += newIntersection.y; 	// vector + the intersection point
            var mx = isHor && ref.orientation && (ref.iorientation || ref.orientation).endsWith("r") ? -label.getWidth() : 0;
            var my = isVer && ref.orientation && (ref.iorientation || ref.orientation).startsWith("l") ? -label.getHeight() + 2 : 0;
            label.setX(oiv.x + mx);
            label.setY(oiv.y + my);

            // Update the reference point
            this.updateReferencePointOfLabel(label, newIntersection, from, to);
          } else {
            var oiv = ORYX.Core.Math.getOrthogonalIdentityVector(fromPosition, toPosition);
            oiv.x *= ref.distance;
            oiv.y *= ref.distance; // vector * distance
            oiv.x += ref.intersection.x;
            oiv.y += ref.intersection.y; // vector + the intersection point
            label.setX(oiv.x);
            label.setY(oiv.y);
            ref.segment.fromPosition = fromPosition;
            ref.segment.toPosition = toPosition;
          }

          return;
        }

        // Update label position if no reference point is set
        if (label.position && !this.parent.initializingShapes) {
          var x = label.position.x + (diffX * (diffWidth || 1));
          if (x > this.bounds.lowerRight().x) {
            x += this.bounds.width() - (this.bounds.width() / (diffWidth || 1));
          }

          var y = label.position.y + (diffY * (diffHeight || 1));
          if (y > this.bounds.lowerRight().y) {
            y += this.bounds.height() - (this.bounds.height() / (diffHeight || 1));
          }
          label.setX(x);
          label.setY(y);
          return;
        }

        switch (label.getEdgePosition()) {
          case "starttop":
            var angle = this._getAngle(this.dockers[0], this.dockers[1]);
            var pos = this.dockers.first().bounds.center();

            if (angle <= 90 || angle > 270) {
              label.horizontalAlign("left");
              label.verticalAlign("bottom");
              label.x = pos.x + label.getOffsetTop();
              label.y = pos.y - label.getOffsetTop();
              label.rotate(360 - angle, pos);
            } else {
              label.horizontalAlign("right");
              label.verticalAlign("bottom");
              label.x = pos.x - label.getOffsetTop();
              label.y = pos.y - label.getOffsetTop();
              label.rotate(180 - angle, pos);
            }

            break;
          case "startmiddle":
            var angle = this._getAngle(this.dockers[0], this.dockers[1]);
            var pos = this.dockers.first().bounds.center();

            if (angle <= 90 || angle > 270) {
              label.horizontalAlign("left");
              label.verticalAlign("bottom");
              label.x = pos.x + 2;
              label.y = pos.y + 4;
              label.rotate(360 - angle, pos);
            } else {
              label.horizontalAlign("right");
              label.verticalAlign("bottom");
              label.x = pos.x + 1;
              label.y = pos.y + 4;
              label.rotate(180 - angle, pos);
            }

            break;
          case "startbottom":
            var angle = this._getAngle(this.dockers[0], this.dockers[1]);
            var pos = this.dockers.first().bounds.center();

            if (angle <= 90 || angle > 270) {
              label.horizontalAlign("left");
              label.verticalAlign("top");
              label.x = pos.x + label.getOffsetBottom();
              label.y = pos.y + label.getOffsetBottom();
              label.rotate(360 - angle, pos);
            } else {
              label.horizontalAlign("right");
              label.verticalAlign("top");
              label.x = pos.x - label.getOffsetBottom();
              label.y = pos.y + label.getOffsetBottom();
              label.rotate(180 - angle, pos);
            }

            break;
          case "midtop":
            var numOfDockers = this.dockers.length;
            if (numOfDockers % 2 == 0) {
              var angle = this._getAngle(this.dockers[numOfDockers / 2 - 1], this.dockers[numOfDockers / 2])
              var pos1 = this.dockers[numOfDockers / 2 - 1].bounds.center();
              var pos2 = this.dockers[numOfDockers / 2].bounds.center();
              var pos = {x: (pos1.x + pos2.x) / 2.0, y: (pos1.y + pos2.y) / 2.0};

              label.horizontalAlign("center");
              label.verticalAlign("bottom");
              label.x = pos.x;
              label.y = pos.y - label.getOffsetTop();

              if (angle <= 90 || angle > 270) {
                label.rotate(360 - angle, pos);
              } else {
                label.rotate(180 - angle, pos);
              }
            } else {
              var index = parseInt(numOfDockers / 2);
              var angle = this._getAngle(this.dockers[index], this.dockers[index + 1])
              var pos = this.dockers[index].bounds.center();

              if (angle <= 90 || angle > 270) {
                label.horizontalAlign("left");
                label.verticalAlign("bottom");
                label.x = pos.x + label.getOffsetTop();
                label.y = pos.y - label.getOffsetTop();
                label.rotate(360 - angle, pos);
              } else {
                label.horizontalAlign("right");
                label.verticalAlign("bottom");
                label.x = pos.x - label.getOffsetTop();
                label.y = pos.y - label.getOffsetTop();
                label.rotate(180 - angle, pos);
              }
            }

            break;
          case "midbottom":
            var numOfDockers = this.dockers.length;
            if (numOfDockers % 2 == 0) {
              var angle = this._getAngle(this.dockers[numOfDockers / 2 - 1], this.dockers[numOfDockers / 2])
              var pos1 = this.dockers[numOfDockers / 2 - 1].bounds.center();
              var pos2 = this.dockers[numOfDockers / 2].bounds.center();
              var pos = {x: (pos1.x + pos2.x) / 2.0, y: (pos1.y + pos2.y) / 2.0};

              label.horizontalAlign("center");
              label.verticalAlign("top");
              label.x = pos.x;
              label.y = pos.y + label.getOffsetTop();

              if (angle <= 90 || angle > 270) {
                label.rotate(360 - angle, pos);
              } else {
                label.rotate(180 - angle, pos);
              }
            } else {
              var index = parseInt(numOfDockers / 2);
              var angle = this._getAngle(this.dockers[index], this.dockers[index + 1])
              var pos = this.dockers[index].bounds.center();

              if (angle <= 90 || angle > 270) {
                label.horizontalAlign("left");
                label.verticalAlign("top");
                label.x = pos.x + label.getOffsetBottom();
                label.y = pos.y + label.getOffsetBottom();
                label.rotate(360 - angle, pos);
              } else {
                label.horizontalAlign("right");
                label.verticalAlign("top");
                label.x = pos.x - label.getOffsetBottom();
                label.y = pos.y + label.getOffsetBottom();
                label.rotate(180 - angle, pos);
              }
            }

            break;
          case "endtop":
            var length = this.dockers.length;
            var angle = this._getAngle(this.dockers[length - 2], this.dockers[length - 1]);
            var pos = this.dockers.last().bounds.center();

            if (angle <= 90 || angle > 270) {
              label.horizontalAlign("right");
              label.verticalAlign("bottom");
              label.x = pos.x - label.getOffsetTop();
              label.y = pos.y - label.getOffsetTop();
              label.rotate(360 - angle, pos);
            } else {
              label.horizontalAlign("left");
              label.verticalAlign("bottom");
              label.x = pos.x + label.getOffsetTop();
              label.y = pos.y - label.getOffsetTop();
              label.rotate(180 - angle, pos);
            }

            break;
          case "endbottom":
            var length = this.dockers.length;
            var angle = this._getAngle(this.dockers[length - 2], this.dockers[length - 1]);
            var pos = this.dockers.last().bounds.center();

            if (angle <= 90 || angle > 270) {
              label.horizontalAlign("right");
              label.verticalAlign("top");
              label.x = pos.x - label.getOffsetBottom();
              label.y = pos.y + label.getOffsetBottom();
              label.rotate(360 - angle, pos);
            } else {
              label.horizontalAlign("left");
              label.verticalAlign("top");
              label.x = pos.x + label.getOffsetBottom();
              label.y = pos.y + label.getOffsetBottom();
              label.rotate(180 - angle, pos);
            }

            break;
        }
      }.bind(this));

      this.children.each(function (value) {
        if (value instanceof ORYX.Core.Node) {
          this.calculatePositionOfAttachedChildNode.call(this, value);
        }
      }.bind(this));

      this.refreshAttachedNodes();
      this.refresh();

      this.isChanged = false;
      this._dockerUpdated = false;

      this._oldBounds = this.bounds.clone();
    }


    // IE10 specific fix, start and end-markes get left behind when moving path
    var userAgent = navigator.userAgent;
    if (navigator.appVersion.indexOf("MSIE 10") !== -1 || (userAgent.indexOf('Trident') !== -1 && userAgent.indexOf('rv:11') !== -1)) {
      this.node.parentNode.insertBefore(this.node, this.node);
    }
  },

  /**
   *  Moves a point to the upperLeft of a node's bounds.
   *
   *  @param {point} point
   *    The point to move
   *  @param {ORYX.Core.Bounds} bounds
   *    The Bounds of the related noe
   */
  movePointToUpperLeftOfNode: function (point, bounds) {
    point.x -= bounds.width() / 2;
    point.y -= bounds.height() / 2;
  },

  /**
   * Refreshes the visual representation of edge's attached nodes.
   */
  refreshAttachedNodes: function () {
    this.attachedNodePositionData.values().each(function (nodeData) {
      var startPoint = nodeData.segment.docker1.bounds.center();
      var endPoint = nodeData.segment.docker2.bounds.center();
      this.relativizePoint(startPoint);
      this.relativizePoint(endPoint);

      var newNodePosition = new Object();

      /* Calculate new x-coordinate */
      newNodePosition.x = startPoint.x
        + nodeData.relativDistanceFromDocker1
        * (endPoint.x - startPoint.x);

      /* Calculate new y-coordinate */
      newNodePosition.y = startPoint.y
        + nodeData.relativDistanceFromDocker1
        * (endPoint.y - startPoint.y);

      /* Convert new position to the upper left of the node */
      this.movePointToUpperLeftOfNode(newNodePosition, nodeData.node.bounds);

      /* Move node to its new position */
      nodeData.node.bounds.moveTo(newNodePosition);
      nodeData.node._update();

    }.bind(this));
  },

  /**
   * Calculates the position of an edge's child node. The node is placed on
   * the path of the edge.
   *
   * @param {node}
   *    The node to calculate the new position
   * @return {Point}
   *    The calculated upper left point of the node's shape.
   */
  calculatePositionOfAttachedChildNode: function (node) {
    /* Initialize position */
    var position = new Object();
    position.x = 0;
    position.y = 0;

    /* Case: Node was just added */
    if (!this.attachedNodePositionData.get(node.getId())) {
      this.attachedNodePositionData.set(node.getId(), new Object());
      this.attachedNodePositionData.get(node.getId()).relativDistanceFromDocker1 = 0;
      this.attachedNodePositionData.get(node.getId()).node = node;
      this.attachedNodePositionData.get(node.getId()).segment = new Object();
      this.findEdgeSegmentForNode(node);
    } else if (node.isChanged) {
      this.findEdgeSegmentForNode(node);
    }


  },

  /**
   * Finds the appropriate edge segement for a node.
   * The segment is choosen, which has the smallest distance to the node.
   *
   * @param {ORYX.Core.Node} node
   *    The concerning node
   */
  findEdgeSegmentForNode: function (node) {
    var length = this.dockers.length;
    var smallestDistance = undefined;

    for (i = 1; i < length; i++) {
      var lineP1 = this.dockers[i - 1].bounds.center();
      var lineP2 = this.dockers[i].bounds.center();
      this.relativizePoint(lineP1);
      this.relativizePoint(lineP2);

      var nodeCenterPoint = node.bounds.center();
      var distance = ORYX.Core.Math.distancePointLinie(
        lineP1,
        lineP2,
        nodeCenterPoint,
        true);

      if ((distance || distance == 0) && ((!smallestDistance && smallestDistance != 0)
        || distance < smallestDistance)) {

        smallestDistance = distance;

        this.attachedNodePositionData.get(node.getId()).segment.docker1 = this.dockers[i - 1];
        this.attachedNodePositionData.get(node.getId()).segment.docker2 = this.dockers[i];

      }

      /* Either the distance does not match the segment or the distance
			 * between docker1 and docker2 is 0
			 *
			 * In this case choose the nearest docker as attaching point.
			 *
			 */
      if (!distance && !smallestDistance && smallestDistance != 0) {
        var distanceCenterToLineOne = ORYX.Core.Math.getDistancePointToPoint(nodeCenterPoint, lineP1);
        var distanceCenterToLineTwo = ORYX.Core.Math.getDistancePointToPoint(nodeCenterPoint, lineP2);

        if (distanceCenterToLineOne < distanceCenterToLineTwo) {
          this.attachedNodePositionData.get(node.getId()).relativDistanceFromDocker1 = 0
        } else {
          this.attachedNodePositionData.get(node.getId()).relativDistanceFromDocker1 = 1;
        }
        this.attachedNodePositionData.get(node.getId()).segment.docker1 = this.dockers[i - 1];
        this.attachedNodePositionData.get(node.getId()).segment.docker2 = this.dockers[i];
      }
    }

    /* Calculate position on edge segment for the node */
    if (smallestDistance || smallestDistance == 0) {
      this.attachedNodePositionData.get(node.getId()).relativDistanceFromDocker1 =
        this.getLineParameterForPosition(
          this.attachedNodePositionData.get(node.getId()).segment.docker1,
          this.attachedNodePositionData.get(node.getId()).segment.docker2,
          node);
    }
  },


  /**
   *
   * @param {ORYX.Core.Node|Object} node or position
   * @return {Object} An object with the following attribute: {ORYX.Core.Docker} fromDocker, {ORYX.Core.Docker} toDocker, {X/Y} position, {int} distance
   */
  findSegment: function (node) {

    var length = this.dockers.length;
    var result;

    var nodeCenterPoint = node instanceof ORYX.Core.UIObject ? node.bounds.center() : node;

    for (i = 1; i < length; i++) {
      var lineP1 = this.dockers[i - 1].bounds.center();
      var lineP2 = this.dockers[i].bounds.center();

      var distance = ORYX.Core.Math.distancePointLinie(lineP1, lineP2, nodeCenterPoint, true);

      if (typeof distance == "number" && (result === undefined || distance < result.distance)) {
        result = {
          distance: distance,
          fromDocker: this.dockers[i - 1],
          toDocker: this.dockers[i]
        }

      }
    }
    return result;
  },

  /**
   * Returns the value of the scalar to determine the position of the node on
   * line defined by docker1 and docker2.
   *
   * @param {point} docker1
   *    The docker that defines the start of the line segment
   * @param {point} docker2
   *    The docker that defines the end of the line segment
   * @param {ORYX.Core.Node} node
   *    The concerning node
   *
   * @return {float} positionParameter
   *    The scalar value to determine the position on the line
   */
  getLineParameterForPosition: function (docker1, docker2, node) {
    var dockerPoint1 = docker1.bounds.center();
    var dockerPoint2 = docker2.bounds.center();
    this.relativizePoint(dockerPoint1);
    this.relativizePoint(dockerPoint2);

    var intersectionPoint = ORYX.Core.Math.getPointOfIntersectionPointLine(
      dockerPoint1,
      dockerPoint2,
      node.bounds.center(), true);
    if (!intersectionPoint) {
      return 0;
    }

    var relativeDistance =
      ORYX.Core.Math.getDistancePointToPoint(intersectionPoint, dockerPoint1) /
      ORYX.Core.Math.getDistancePointToPoint(dockerPoint1, dockerPoint2);

    return relativeDistance;
  },
  /**
   * Makes point relative to the upper left of the edge's bound.
   *
   * @param {point} point
   *    The point to relativize
   */
  relativizePoint: function (point) {
    point.x -= this.bounds.upperLeft().x;
    point.y -= this.bounds.upperLeft().y;
  },

  /**
   * Move the first and last docker and calls the refresh method.
   * Attention: This does not calculates intersection point between the
   * edge and the bounded nodes. This only works if only the nodes are
   * moves.
   *
   */
  optimizedUpdate: function () {

    var updateDocker = function (docker) {
      if (!docker._dockedShape || !docker._dockedShapeBounds)
        return;
      var off = {
        x: docker._dockedShape.bounds.a.x - docker._dockedShapeBounds.a.x,
        y: docker._dockedShape.bounds.a.y - docker._dockedShapeBounds.a.y
      };
      docker.bounds.moveBy(off);
      docker._dockedShapeBounds.moveBy(off);
    }

    updateDocker(this.dockers.first());
    updateDocker(this.dockers.last());

    this.refresh();
  },

  refresh: function () {
    //call base class refresh method
    arguments.callee.$.refresh.apply(this, arguments);

    //TODO consider points for marker mids
    var lastPoint;
    this._paths.each((function (path, index) {
      var dockers = this._dockersByPath.get(path.id);
      var c = undefined;
      var d = undefined;
      if (lastPoint) {
        d = "M" + lastPoint.x + " " + lastPoint.y;
      }
      else {
        c = dockers[0].bounds.center();
        lastPoint = c;

        d = "M" + c.x + " " + c.y;
      }

      for (var i = 1; i < dockers.length; i++) {
        // for each docker, draw a line to the center
        c = dockers[i].bounds.center();
        d = d + "L" + c.x + " " + c.y + " ";
        lastPoint = c;
      }

      path.setAttributeNS(null, "d", d);
      this._interactionPaths[index].setAttributeNS(null, "d", d);

    }).bind(this));


    /* move child shapes of an edge */
    if (this.getChildNodes().length > 0) {
      var x = this.bounds.upperLeft().x;
      var y = this.bounds.upperLeft().y;

      this.node.firstChild.childNodes[1].setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")");
    }

  },

  /**
   * Calculate the Border Intersection Point between two points
   * @param {PointA}
   * @param {PointB}
   */
  getIntersectionPoint: function () {

    var length = Math.floor(this.dockers.length / 2)

    return ORYX.Core.Math.midPoint(this.dockers[length - 1].bounds.center(), this.dockers[length].bounds.center())
  },

  /**
   * Returns TRUE if the bounds is over the edge
   * @param {Bounds}
   *
   */
  isBoundsIncluded: function (bounds) {
    var dockers = this.dockers, size = dockers.length;
    return dockers.any(function (docker, i) {
      if (i == size - 1) {
        return false;
      }
      var a = docker.bounds.center();
      var b = dockers[i + 1].bounds.center();

      return ORYX.Core.Math.isRectOverLine(a.x, a.y, b.x, b.y, bounds.a.x, bounds.a.y, bounds.b.x, bounds.b.y);
    });
  },

  /**
   * Calculate if the point is inside the Shape
   * @param {PointX}
   * @param {PointY}
   */
  isPointIncluded: function (pointX, pointY) {

    var isbetweenAB = this.absoluteBounds().isIncluded(pointX, pointY,
      ORYX.CONFIG.OFFSET_EDGE_BOUNDS);

    var isPointIncluded = undefined;

    if (isbetweenAB && this.dockers.length > 0) {

      var i = 0;
      var point1, point2;


      do {

        point1 = this.dockers[i].bounds.center();
        point2 = this.dockers[++i].bounds.center();

        isPointIncluded = ORYX.Core.Math.isPointInLine(pointX, pointY,
          point1.x, point1.y,
          point2.x, point2.y,
          ORYX.CONFIG.OFFSET_EDGE_BOUNDS);

      } while (!isPointIncluded && i < this.dockers.length - 1)

    }

    return isPointIncluded;

  },


  /**
   * Calculate if the point is over an special offset area
   * @param {Point}
   */
  isPointOverOffset: function () {
    return false
  },

  /**
   * Returns TRUE if the given node
   * is a child node of the shapes node
   * @param {Element} node
   * @return {Boolean}
   *
   */
  containsNode: function (node) {
    if (this._paths.include(node) ||
      this._interactionPaths.include(node)) {
      return true;
    }
    return false;
  },

  /**
   * Returns the angle of the line between two dockers
   * (0 - 359.99999999)
   */
  _getAngle: function (docker1, docker2) {
    var p1 = docker1 instanceof ORYX.Core.Controls.Docker ? docker1.absoluteCenterXY() : docker1;
    var p2 = docker2 instanceof ORYX.Core.Controls.Docker ? docker2.absoluteCenterXY() : docker2;

    return ORYX.Core.Math.getAngle(p1, p2);
  },

  alignDockers: function () {
    this._update(true);

    var firstPoint = this.dockers.first().bounds.center();
    var lastPoint = this.dockers.last().bounds.center();

    var deltaX = lastPoint.x - firstPoint.x;
    var deltaY = lastPoint.y - firstPoint.y;

    var numOfDockers = this.dockers.length - 1;

    this.dockers.each((function (docker, index) {
      var part = index / numOfDockers;
      docker.bounds.unregisterCallback(this._dockerChangedCallback);
      docker.bounds.moveTo(firstPoint.x + part * deltaX, firstPoint.y + part * deltaY);
      docker.bounds.registerCallback(this._dockerChangedCallback);
    }).bind(this));

    this._dockerChanged();
  },

  add: function (shape) {
    arguments.callee.$.add.apply(this, arguments);

    // If the new shape is a Docker which is not contained
    if (shape instanceof ORYX.Core.Controls.Docker && this.dockers.include(shape)) {
      // Add it to the dockers list ordered by paths
      var pathArray = this._dockersByPath.values()[0];
      if (pathArray) {
        pathArray.splice(this.dockers.indexOf(shape), 0, shape);
      }

      /* Perform nessary adjustments on the edge's child shapes */
      this.handleChildShapesAfterAddDocker(shape);
    }
  },

  /**
   * Performs nessary adjustments on the edge's child shapes.
   *
   * @param {ORYX.Core.Controls.Docker} docker
   *    The added docker
   */
  handleChildShapesAfterAddDocker: function (docker) {
    /* Ensure type of Docker */
    if (!docker instanceof ORYX.Core.Controls.Docker) {
      return undefined;
    }

    var index = this.dockers.indexOf(docker);
    if (!(0 < index && index < this.dockers.length - 1)) {
      /* Exception: Expect added docker between first and last node of the edge */
      return undefined;
    }

    /* Get child nodes concerning the segment of the new docker */
    var startDocker = this.dockers[index - 1];
    var endDocker = this.dockers[index + 1];

    /* Adjust the position of edge's child nodes */
    var segmentElements =
      this.getAttachedNodePositionDataForSegment(startDocker, endDocker);

    var lengthSegmentPart1 = ORYX.Core.Math.getDistancePointToPoint(
      startDocker.bounds.center(),
      docker.bounds.center());
    var lengthSegmentPart2 = ORYX.Core.Math.getDistancePointToPoint(
      endDocker.bounds.center(),
      docker.bounds.center());

    if (!(lengthSegmentPart1 + lengthSegmentPart2)) {
      return;
    }

    var relativDockerPosition = lengthSegmentPart1 / (lengthSegmentPart1 + lengthSegmentPart2);

    segmentElements.each(function (nodePositionData) {
      /* Assign child node to the new segment */
      if (nodePositionData.value.relativDistanceFromDocker1 < relativDockerPosition) {
        /* Case: before added Docker */
        nodePositionData.value.segment.docker2 = docker;
        nodePositionData.value.relativDistanceFromDocker1 =
          nodePositionData.value.relativDistanceFromDocker1 / relativDockerPosition;
      } else {
        /* Case: after added Docker */
        nodePositionData.value.segment.docker1 = docker;
        var newFullDistance = 1 - relativDockerPosition;
        var relativPartOfSegment =
          nodePositionData.value.relativDistanceFromDocker1
          - relativDockerPosition;

        nodePositionData.value.relativDistanceFromDocker1 =
          relativPartOfSegment / newFullDistance;

      }
    })


    // Update all labels reference points
    this.getLabels().each(function (label) {

      var ref = label.getReferencePoint();
      if (!ref) {
        return;
      }
      var index = this.dockers.indexOf(docker);
      if (index >= ref.segment.fromIndex && index <= ref.segment.toIndex) {

        var segment = this.findSegment(ref.intersection);
        if (!segment) {
          // Choose whether the first of the last segment
          segment.fromDocker = ref.segment.fromIndex >= (this.dockers.length / 2) ? this.dockers[0] : this.dockers[this.dockers.length - 2];
          segment.toDocker = this.dockers[this.dockers.indexOf(from) + 1]; // The next one if the to docker
        }

        var fromPosition = segment.fromDocker.bounds.center(), toPosition = segment.toDocker.bounds.center();

        var intersection = ORYX.Core.Math.getPointOfIntersectionPointLine(
          fromPosition, 		// P1 - Center of the first docker
          toPosition, 		// P2 - Center of the second docker
          ref.intersection, 	// P3 - Center of the label
          true);
        //var oldDistance = ORYX.Core.Math.getDistanceBetweenTwoPoints(ref.segment.fromPosition, ref.segment.toPosition, ref.intersection);
        //intersection = ORYX.Core.Math.getPointBetweenTwoPoints(fromPosition, toPosition, isNaN(oldDistance) ? 0.5 : (lengthOld*oldDistance)/lengthNew);

        // Update the reference point
        this.updateReferencePointOfLabel(label, intersection, segment.fromDocker, segment.toDocker, true);
      }
    }.bind(this));

    /* Update attached nodes visual representation */
    this.refreshAttachedNodes();
  },

  /**
   *  Returns elements from {@link attachedNodePositiondata} that match the
   *  segement defined by startDocker and endDocker.
   *
   *  @param {ORYX.Core.Controls.Docker} startDocker
   *    The docker defining the begin of the segment.
   *  @param {ORYX.Core.Controls.Docker} endDocker
   *    The docker defining the begin of the segment.
   *
   *  @return {Hash} attachedNodePositionData
   *    Child elements matching the segment
   */
  getAttachedNodePositionDataForSegment: function (startDocker, endDocker) {
    /* Ensure that the segment is defined correctly */
    if (!((startDocker instanceof ORYX.Core.Controls.Docker)
      && (endDocker instanceof ORYX.Core.Controls.Docker))) {
      return [];
    }

    /* Get elements of the segment */
    var elementsOfSegment =
      this.attachedNodePositionData.findAll(function (nodePositionData) {
        return nodePositionData.value.segment.docker1 === startDocker &&
          nodePositionData.value.segment.docker2 === endDocker;
      });

    /* Return a Hash in each case */
    if (!elementsOfSegment) {
      return [];
    }

    return elementsOfSegment;
  },

  /**
   * Removes an edge's child shape
   */
  remove: function (shape) {
    arguments.callee.$.remove.apply(this, arguments);

    if (this.attachedNodePositionData.get(shape.getId())) {
      this.attachedNodePositionData.unset[shape.getId()];
    }

    /* Adjust child shapes if neccessary */
    if (shape instanceof ORYX.Core.Controls.Docker) {
      this.handleChildShapesAfterRemoveDocker(shape);
    }
  },

  updateReferencePointOfLabel: function (label, intersection, from, to, dirty) {
    if (!label.getReferencePoint() || !label.isVisible) {
      return;
    }

    var ref = label.getReferencePoint();

    //
    if (ref.orientation && ref.orientation !== "ce") {
      var angle = this._getAngle(from, to);
      if (ref.distance >= 0) {
        if (angle == 0) {
          label.horizontalAlign("left");//ref.orientation == "lr" ? "right" : "left");
          label.verticalAlign("bottom");
        } else if (angle > 0 && angle < 90) {
          label.horizontalAlign("right");
          label.verticalAlign("bottom");
        } else if (angle == 90) {
          label.horizontalAlign("right");
          label.verticalAlign("top");//ref.orientation == "lr" ? "bottom" : "top");
        } else if (angle > 90 && angle < 180) {
          label.horizontalAlign("right");
          label.verticalAlign("top");
        } else if (angle == 180) {
          label.horizontalAlign("left");//ref.orientation == "ur" ? "right" : "left");
          label.verticalAlign("top");
        } else if (angle > 180 && angle < 270) {
          label.horizontalAlign("left");
          label.verticalAlign("top");
        } else if (angle == 270) {
          label.horizontalAlign("left");
          label.verticalAlign("top");//ref.orientation == "ll" ? "bottom" : "top");
        } else if (angle > 270 && angle <= 360) {
          label.horizontalAlign("left");
          label.verticalAlign("bottom");
        }
      } else {
        if (angle == 0) {
          label.horizontalAlign("left");//ref.orientation == "ur" ? "right" : "left");
          label.verticalAlign("top");
        } else if (angle > 0 && angle < 90) {
          label.horizontalAlign("left");
          label.verticalAlign("top");
        } else if (angle == 90) {
          label.horizontalAlign("left");
          label.verticalAlign("top");//ref.orientation == "ll" ? "bottom" : "top");
        } else if (angle > 90 && angle < 180) {
          label.horizontalAlign("left");
          label.verticalAlign("bottom");
        } else if (angle == 180) {
          label.horizontalAlign("left");//ref.orientation == "lr" ? "right" : "left");
          label.verticalAlign("bottom");
        } else if (angle > 180 && angle < 270) {
          label.horizontalAlign("right");
          label.verticalAlign("bottom");
        } else if (angle == 270) {
          label.horizontalAlign("right");
          label.verticalAlign("top");//ref.orientation == "lr" ? "bottom" : "top");
        } else if (angle > 270 && angle <= 360) {
          label.horizontalAlign("right");
          label.verticalAlign("top");
        }
      }
      ref.iorientation = ref.iorientation || ref.orientation;
      ref.orientation = (label.verticalAlign() == "top" ? "u" : "l") + (label.horizontalAlign() == "left" ? "l" : "r");
    }

    label.setReferencePoint(jQuery.extend({}, {
      intersection: intersection,
      segment: {
        from: from,
        fromIndex: this.dockers.indexOf(from),
        fromPosition: from.bounds.center(),
        to: to,
        toIndex: this.dockers.indexOf(to),
        toPosition: to.bounds.center()
      },
      dirty: dirty || false
    }, ref))
  },
  /**
   *  Adjusts the child shapes of an edges after a docker was removed.
   *
   *  @param{ORYX.Core.Controls.Docker} docker
   *    The removed docker.
   */
  handleChildShapesAfterRemoveDocker: function (docker) {
    /* Ensure docker type */
    if (!(docker instanceof ORYX.Core.Controls.Docker)) {
      return;
    }

    this.attachedNodePositionData.each(function (nodePositionData) {
      if (nodePositionData.value.segment.docker1 === docker) {
        /* The new start of the segment is the predecessor of docker2. */
        var index = this.dockers.indexOf(nodePositionData.value.segment.docker2);
        if (index == -1) {
          return;
        }
        nodePositionData.value.segment.docker1 = this.dockers[index - 1];
      }
      else if (nodePositionData.value.segment.docker2 === docker) {
        /* The new end of the segment is the successor of docker1. */
        var index = this.dockers.indexOf(nodePositionData.value.segment.docker1);
        if (index == -1) {
          return;
        }
        nodePositionData.value.segment.docker2 = this.dockers[index + 1];
      }
    }.bind(this));

    // Update all labels reference points
    this.getLabels().each(function (label) {

      var ref = label.getReferencePoint();
      if (!ref) {
        return;
      }
      var from = ref.segment.from;
      var to = ref.segment.to;

      if (from !== docker && to !== docker) {
        return;
      }

      var segment = this.findSegment(ref.intersection);
      if (!segment) {
        from = segment.fromDocker;
        to = segment.toDocker;
      } else {
        from = from === docker ? this.dockers[this.dockers.indexOf(to) - 1] : from;
        to = this.dockers[this.dockers.indexOf(from) + 1];
      }

      var intersection = ORYX.Core.Math.getPointOfIntersectionPointLine(from.bounds.center(), to.bounds.center(), ref.intersection, true);
      // Update the reference point
      this.updateReferencePointOfLabel(label, intersection, from, to, true);
    }.bind(this));

    /* Update attached nodes visual representation */
    this.refreshAttachedNodes();
  },

  /**
   *@deprecated Use the .createDocker() Method and set the point via the bounds
   */
  addDocker: function (position, exDocker) {
    var lastDocker;
    var result;
    this._dockersByPath.any((function (pair) {
      return pair.value.any((function (docker, index) {
        if (!lastDocker) {
          lastDocker = docker;
          return false;
        }
        else {
          var point1 = lastDocker.bounds.center();
          var point2 = docker.bounds.center();

          var additionalIEZoom = 1;
          if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
            var ua = navigator.userAgent;
            if (ua.indexOf('MSIE') >= 0) {
              //IE 10 and below
              var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
              if (zoom !== 100) {
                additionalIEZoom = zoom / 100
              }
            }
          }

          if (additionalIEZoom !== 1) {
            position.x = position.x / additionalIEZoom;
            position.y = position.y / additionalIEZoom;
          }

          if (ORYX.Core.Math.isPointInLine(position.x, position.y, point1.x, point1.y, point2.x, point2.y, 10)) {
            var path = this._paths.find(function (path) {
              return path.id === pair.key;
            });
            if (path) {
              var allowAttr = path.getAttributeNS(NAMESPACE_ORYX, 'allowDockers');
              if (allowAttr && allowAttr.toLowerCase() === "no") {
                return true;
              }
            }

            var newDocker = (exDocker) ? exDocker : this.createDocker(this.dockers.indexOf(lastDocker) + 1, position);
            newDocker.bounds.centerMoveTo(position);
            if (exDocker)
              this.add(newDocker, this.dockers.indexOf(lastDocker) + 1);
            result = newDocker;
            return true;
          }
          else {
            lastDocker = docker;
            return false;
          }
        }
      }).bind(this));
    }).bind(this));
    return result;
  },

  removeDocker: function (docker) {
    if (this.dockers.length > 2 && !(this.dockers.first() === docker)) {
      this._dockersByPath.any((function (pair) {
        if (pair.value.member(docker)) {
          if (docker === pair.value.last()) {
            return true;
          } else {
            this.remove(docker);
            this._dockersByPath.set(pair.key, pair.value.without(docker));
            this.isChanged = true;
            this._dockerChanged();
            return true;
          }
        }
        return false;
      }).bind(this));
    }
  },

  /**
   * Removes all dockers from the edge which are on
   * the line between two dockers
   * @return {Object} Removed dockers in an indicied array
   * (key is the removed position of the docker, value is docker themselve)
   */
  removeUnusedDockers: function () {
    var marked = new Hash();

    this.dockers.each(function (docker, i) {
      if (i == 0 || i == this.dockers.length - 1) {
        return
      }
      var previous = this.dockers[i - 1];

      /* Do not consider already removed dockers */
      if (marked.values().indexOf(previous) != -1 && this.dockers[i - 2]) {
        previous = this.dockers[i - 2];
      }
      var next = this.dockers[i + 1];

      var cp = previous.getDockedShape() && previous.referencePoint ? previous.getAbsoluteReferencePoint() : previous.bounds.center();
      var cn = next.getDockedShape() && next.referencePoint ? next.getAbsoluteReferencePoint() : next.bounds.center();
      var cd = docker.bounds.center();

      if (ORYX.Core.Math.isPointInLine(cd.x, cd.y, cp.x, cp.y, cn.x, cn.y, 1)) {
        marked.set(i, docker);
      }
    }.bind(this))

    marked.each(function (docker) {
      this.removeDocker(docker.value);
    }.bind(this))

    if (marked.values().length > 0) {
      this._update(true);
    }

    return marked;
  },

  /**
   * Initializes the Edge after loading the SVG representation of the edge.
   * @param {SVGDocument} svgDocument
   */
  _init: function (svgDocument) {
    arguments.callee.$._init.apply(this, arguments);

    var minPointX, minPointY, maxPointX, maxPointY;

    //init markers
    var defs = svgDocument.getElementsByTagNameNS(NAMESPACE_SVG, "defs");
    if (defs.length > 0) {
      defs = defs[0];
      var markerElements = $A(defs.getElementsByTagNameNS(NAMESPACE_SVG, "marker"));
      var marker;
      var me = this;
      markerElements.each(function (markerElement) {
        try {
          marker = new ORYX.Core.SVG.SVGMarker(markerElement.cloneNode(true));
          me._markers.set(marker.id, marker);
          var textElements = $A(marker.element.getElementsByTagNameNS(NAMESPACE_SVG, "text"));
          var label;
          textElements.each(function (textElement) {
            label = new ORYX.Core.SVG.Label({
              textElement: textElement,
              shapeId: this.id
            });
            me._labels.set(label.id, label);
          });
        }
        catch (e) {
        }
      });
    }


    var gs = svgDocument.getElementsByTagNameNS(NAMESPACE_SVG, "g");
    if (gs.length <= 0) {
      throw "Edge: No g element found.";
    }
    var g = gs[0];


    g.setAttributeNS(null, "id", null);

    var isFirst = true;

    $A(g.childNodes).each((function (path, index) {
      if (ORYX.Editor.checkClassType(path, SVGPathElement)) {
        path = path.cloneNode(false);

        var pathId = this.id + "_" + index;
        path.setAttributeNS(null, "id", pathId);
        this._paths.push(path);

        //check, if markers are set and update the id
        var markersByThisPath = [];
        var markerUrl = path.getAttributeNS(null, "marker-start");

        if (markerUrl && markerUrl !== "") {
          markerUrl = markerUrl.strip();
          markerUrl = markerUrl.replace(/^url\(#/, '');

          var markerStartId = this.getValidMarkerId(markerUrl);
          path.setAttributeNS(null, "marker-start", "url(#" + markerStartId + ")");

          markersByThisPath.push(this._markers.get(markerStartId));
        }

        markerUrl = path.getAttributeNS(null, "marker-mid");

        if (markerUrl && markerUrl !== "") {
          markerUrl = markerUrl.strip();
          markerUrl = markerUrl.replace(/^url\(#/, '');
          var markerMidId = this.getValidMarkerId(markerUrl);
          path.setAttributeNS(null, "marker-mid", "url(#" + markerMidId + ")");

          markersByThisPath.push(this._markers.get(markerMidId));
        }

        markerUrl = path.getAttributeNS(null, "marker-end");

        if (markerUrl && markerUrl !== "") {
          markerUrl = markerUrl.strip();

          var markerEndId = this.getValidMarkerId(markerUrl);
          path.setAttributeNS(null, "marker-end", "url(#" + markerEndId + ")");

          markersByThisPath.push(this._markers.get(markerEndId));
        }

        this._markersByPath[pathId] = markersByThisPath;

        //init dockers
        var parser = new PathParser();
        var handler = new ORYX.Core.SVG.PointsPathHandler();
        parser.setHandler(handler);
        parser.parsePath(path);

        if (handler.points.length < 4) {
          throw "Edge: Path has to have two or more points specified.";
        }

        this._dockersByPath.set(pathId, []);

        for (var i = 0; i < handler.points.length; i += 2) {
          //handler.points.each((function(point, pIndex){
          var x = handler.points[i];
          var y = handler.points[i + 1];
          if (isFirst || i > 0) {
            var docker = new ORYX.Core.Controls.Docker({
              eventHandlerCallback: this.eventHandlerCallback
            });
            docker.bounds.centerMoveTo(x, y);
            docker.bounds.registerCallback(this._dockerChangedCallback);
            this.add(docker, this.dockers.length);

            //this._dockersByPath[pathId].push(docker);

            //calculate minPoint and maxPoint
            if (minPointX) {
              minPointX = Math.min(x, minPointX);
              minPointY = Math.min(y, minPointY);
            }
            else {
              minPointX = x;
              minPointY = y;
            }

            if (maxPointX) {
              maxPointX = Math.max(x, maxPointX);
              maxPointY = Math.max(y, maxPointY);
            }
            else {
              maxPointX = x;
              maxPointY = y;
            }
          }
          //}).bind(this));
        }
        isFirst = false;
      }
    }).bind(this));

    this.bounds.set(minPointX, minPointY, maxPointX, maxPointY);

    if (false && (this.bounds.width() === 0 || this.bounds.height() === 0)) {
      var width = this.bounds.width();
      var height = this.bounds.height();

      this.bounds.extend({
        x: width === 0 ? 2 : 0,
        y: height === 0 ? 2 : 0
      });

      this.bounds.moveBy({
        x: width === 0 ? -1 : 0,
        y: height === 0 ? -1 : 0
      });

    }

    this._oldBounds = this.bounds.clone();

    //add paths to this.node
    this._paths.reverse();
    var paths = [];
    this._paths.each((function (path) {
      paths.push(this.node.childNodes[0].childNodes[0].childNodes[0].appendChild(path));
    }).bind(this));

    this._paths = paths;

    //init interaction path
    this._paths.each((function (path) {
      var iPath = path.cloneNode(false);
      iPath.setAttributeNS(null, "id", undefined);
      iPath.setAttributeNS(null, "stroke-width", 10);
      iPath.setAttributeNS(null, "visibility", "hidden");
      iPath.setAttributeNS(null, "stroke-dasharray", null);
      iPath.setAttributeNS(null, "stroke", "black");
      iPath.setAttributeNS(null, "fill", "none");
      iPath.setAttributeNS(null, "title", this.getStencil().title());
      this._interactionPaths.push(this.node.childNodes[0].childNodes[0].childNodes[0].appendChild(iPath));
    }).bind(this));

    this._paths.reverse();
    this._interactionPaths.reverse();

    /**initialize labels*/
    var textElems = svgDocument.getElementsByTagNameNS(ORYX.CONFIG.NAMESPACE_SVG, 'text');

    $A(textElems).each((function (textElem) {
      var label = new ORYX.Core.SVG.Label({
        textElement: textElem,
        shapeId: this.id
      });
      this.node.childNodes[0].childNodes[0].appendChild(label.node);
      this._labels.set(label.id, label);

      label.registerOnChange(this.layout.bind(this));
    }).bind(this));


    this.propertiesChanged.each(function (pair) {
      pair.value = true;
    });


    //if(this.dockers.length == 2) {


    //  }

    //this._update(true);
  },

  getValidMarkerId: function (markerUrl) {
    if (markerUrl.indexOf("url(\"#") >= 0) {
      // Fix for IE9, additional quotes are added to the <id
      var rawId = markerUrl.replace(/^url\(\"#/, "").replace(/\"\)$/, '');
      return this.id + rawId;
    } else {
      markerUrl = markerUrl.replace(/^url\(#/, '');
      return this.id.concat(markerUrl.replace(/\)$/, ''));
    }
  },

  /**
   * Adds all necessary markers of this Edge to the SVG document.
   * Has to be called, while this.node is part of DOM.
   */
  addMarkers: function (defs) {
    this._markers.each(function (marker) {
      if (!defs.ownerDocument.getElementById(marker.value.id)) {
        marker.value.element = defs.appendChild(marker.value.element);
      }
    });
  },

  /**
   * Removes all necessary markers of this Edge from the SVG document.
   * Has to be called, while this.node is part of DOM.
   */
  removeMarkers: function () {
    var svgElement = this.node.ownerSVGElement;
    if (svgElement) {
      var defs = svgElement.getElementsByTagNameNS(NAMESPACE_SVG, "defs");
      if (defs.length > 0) {
        defs = defs[0];
        this._markers.each(function (marker) {
          var foundMarker = defs.ownerDocument.getElementById(marker.value.id);
          if (foundMarker) {
            marker.value.element = defs.removeChild(marker.value.element);
          }
        });
      }
    }
  },

  /**
   * Calls when a docker has changed
   */
  _dockerChanged: function () {

    //this._update(true);
    this._dockerUpdated = true;

  },

  serialize: function () {
    var result = arguments.callee.$.serialize.apply(this);

    //add dockers triple
    var value = "";
    this._dockersByPath.each((function (pair) {
      pair.value.each(function (docker) {
        var position = docker.getDockedShape() && docker.referencePoint ? docker.referencePoint : docker.bounds.center();
        value = value.concat(position.x + " " + position.y + " ");
      });

      value += " # ";
    }).bind(this));
    result.push({
      name: 'dockers',
      prefix: 'oryx',
      value: value,
      type: 'literal'
    });

    //add parent triple dependant on the dockedShapes
    //TODO change this when canvas becomes a resource
    /*        var source = this.dockers.first().getDockedShape();
        var target = this.dockers.last().getDockedShape();
        var sharedParent;
        if (source && target) {
            //get shared parent
            while (source.parent) {
                source = source.parent;
                if (source instanceof ORYX.Core.Canvas) {
                    sharedParent = source;
                    break;
                }
                else {
                    var targetParent = target.parent;
                    var found;
                    while (targetParent) {
                        if (source === targetParent) {
                            sharedParent = source;
                            found = true;
                            break;
                        }
                        else {
                            targetParent = targetParent.parent;
                        }
                    }
                    if (found) {
                        break;
                    }
                }
            }
        }
        else
            if (source) {
                sharedParent = source.parent;
            }
            else
                if (target) {
                    sharedParent = target.parent;
                }
*/
    //if (sharedParent) {
    /*            result.push({
                name: 'parent',
                prefix: 'raziel',
                //value: '#' + ERDF.__stripHashes(sharedParent.resourceId),
                value: '#' + ERDF.__stripHashes(this.getCanvas().resourceId),
                type: 'resource'
            });*/
    //}

    //serialize target and source
    var lastDocker = this.dockers.last();

    var target = lastDocker.getDockedShape();

    if (target) {
      result.push({
        name: 'target',
        prefix: 'raziel',
        value: '#' + ERDF.__stripHashes(target.resourceId),
        type: 'resource'
      });
    }

    try {
      //result = this.getStencil().serialize(this, result);
      var serializeEvent = this.getStencil().serialize();

      /*
			 * call serialize callback by reference, result should be found
			 * in serializeEvent.result
			 */
      if (serializeEvent.type) {
        serializeEvent.shape = this;
        serializeEvent.data = result;
        serializeEvent.result = undefined;
        serializeEvent.forceExecution = true;

        this._delegateEvent(serializeEvent);

        if (serializeEvent.result) {
          result = serializeEvent.result;
        }
      }
    }
    catch (e) {
    }
    return result;
  },

  deserialize: function (data) {
    try {
      //data = this.getStencil().deserialize(this, data);

      var deserializeEvent = this.getStencil().deserialize();

      /*
			 * call serialize callback by reference, result should be found
			 * in serializeEventInfo.result
			 */
      if (deserializeEvent.type) {
        deserializeEvent.shape = this;
        deserializeEvent.data = data;
        deserializeEvent.result = undefined;
        deserializeEvent.forceExecution = true;

        this._delegateEvent(deserializeEvent);
        if (deserializeEvent.result) {
          data = deserializeEvent.result;
        }
      }
    }
    catch (e) {
    }

    // Set the outgoing shapes
    var target = data.find(function (ser) {
      return (ser.prefix + "-" + ser.name) == 'raziel-target'
    });
    var targetShape;
    if (target) {
      targetShape = this.getCanvas().getChildShapeByResourceId(target.value);
    }

    var outgoing = data.findAll(function (ser) {
      return (ser.prefix + "-" + ser.name) == 'raziel-outgoing'
    });
    outgoing.each((function (obj) {
      // TODO: Look at Canvas
      if (!this.parent) {
        return
      }
      ;

      // Set outgoing Shape
      var next = this.getCanvas().getChildShapeByResourceId(obj.value);

      if (next) {
        if (next == targetShape) {
          // If this is an edge, set the last docker to the next shape
          this.dockers.last().setDockedShape(next);
          this.dockers.last().setReferencePoint({x: next.bounds.width() / 2.0, y: next.bounds.height() / 2.0});
        } else if (next instanceof ORYX.Core.Edge) {
          //Set the first docker of the next shape
          next.dockers.first().setDockedShape(this);
          //next.dockers.first().setReferencePoint({x: this.bounds.width() / 2.0, y: this.bounds.height() / 2.0});
        }
        /*else if(next.dockers.length > 0) { //next is a node and next has a docker
					next.dockers.first().setDockedShape(this);
					next.dockers.first().setReferencePoint({x: this.bounds.width() / 2.0, y: this.bounds.height() / 2.0});
				}*/
      }

    }).bind(this));


    var oryxDockers = data.find(function (obj) {
      return (obj.prefix === "oryx" &&
        obj.name === "dockers");
    });

    if (oryxDockers) {
      var dataByPath = oryxDockers.value.split("#").without("").without(" ");

      dataByPath.each((function (data, index) {
        var values = data.replace(/,/g, " ").split(" ").without("");

        //for each docker two values must be defined
        if (values.length % 2 === 0) {
          var path = this._paths[index];

          if (path) {
            if (index === 0) {
              while (this._dockersByPath.get(path.id).length > 2) {
                this.removeDocker(this._dockersByPath.get(path.id)[1]);
              }
            }
            else {
              while (this._dockersByPath.get(path.id).length > 1) {
                this.removeDocker(this._dockersByPath.get(path.id)[0]);
              }
            }

            var dockersByPath = this._dockersByPath.get(path.id);

            if (index === 0) {
              //set position of first docker
              var x = parseFloat(values.shift());
              var y = parseFloat(values.shift());

              if (dockersByPath.first().getDockedShape()) {
                dockersByPath.first().setReferencePoint({
                  x: x,
                  y: y
                });
              }
              else {
                dockersByPath.first().bounds.centerMoveTo(x, y);
              }
            }

            //set position of last docker
            y = parseFloat(values.pop());
            x = parseFloat(values.pop());

            if (dockersByPath.last().getDockedShape()) {
              dockersByPath.last().setReferencePoint({
                x: x,
                y: y
              });
            } else {
              dockersByPath.last().bounds.centerMoveTo(x, y);
            }

            //add additional dockers
            for (var i = 0; i < values.length; i++) {
              x = parseFloat(values[i]);
              y = parseFloat(values[++i]);

              var newDocker = this.createDocker();
              newDocker.bounds.centerMoveTo(x, y);

              //this.dockers = this.dockers.without(newDocker);
              //this.dockers.splice(this.dockers.indexOf(dockersByPath.last()), 0, newDocker);
              //dockersByPath.splice(this.dockers.indexOf(dockersByPath.last()), 0, newDocker);
            }
          }
        }
      }).bind(this));
    } else {
      this.alignDockers();
    }

    arguments.callee.$.deserialize.apply(this, arguments);

    this._changed();
  },

  toString: function () {
    return this.getStencil().title() + " " + this.id;
  },

  /**
   * @return {ORYX.Core.Shape} Returns last docked shape or null.
   */
  getTarget: function () {
    return this.dockers.last() ? this.dockers.last().getDockedShape() : null;
  },

  /**
   * @return {ORYX.Core.Shape} Returns the first docked shape or null
   */
  getSource: function () {
    return this.dockers.first() ? this.dockers.first().getDockedShape() : null;
  },

  /**
   * Checks whether the edge is at least docked to one shape.
   *
   * @return {boolean} True if edge is docked
   */
  isDocked: function () {
    var isDocked = false;
    this.dockers.each(function (docker) {
      if (docker.isDocked()) {
        isDocked = true;
        throw $break;
      }
    });
    return isDocked;
  },

  /**
   * Calls {@link ORYX.Core.AbstractShape#toJSON} and add a some stencil set information.
   */
  toJSON: function () {
    var json = arguments.callee.$.toJSON.apply(this, arguments);

    if (this.getTarget()) {
      json.target = {
        resourceId: this.getTarget().resourceId
      };
    }

    return json;
  }
};
ORYX.Core.Edge = ORYX.Core.Shape.extend(ORYX.Core.Edge);

/**
 * Implements a Command to move shapes
 *
 */
ORYX.Core.Command.Move = ORYX.Core.Command.extend({
  construct: function (moveShapes, offset, parent, selectedShapes, plugin) {
    this.moveShapes = moveShapes;
    this.selectedShapes = selectedShapes;
    this.offset = offset;
    this.plugin = plugin;
    // Defines the old/new parents for the particular shape
    this.newParents = moveShapes.collect(function (t) {
      return parent || t.parent
    });
    this.oldParents = moveShapes.collect(function (shape) {
      return shape.parent
    });
    this.dockedNodes = moveShapes.findAll(function (shape) {
      return shape instanceof ORYX.Core.Node && shape.dockers.length == 1
    }).collect(function (shape) {
      return {
        docker: shape.dockers[0],
        dockedShape: shape.dockers[0].getDockedShape(),
        refPoint: shape.dockers[0].referencePoint
      }
    });
  },
  execute: function () {
    this.dockAllShapes()
    // Moves by the offset
    this.move(this.offset);
    // Addes to the new parents
    this.addShapeToParent(this.newParents);
    // Set the selection to the current selection
    this.selectCurrentShapes();
    this.plugin.facade.getCanvas().update();
    this.plugin.facade.updateSelection();
  },
  rollback: function () {
    // Moves by the inverted offset
    var offset = {x: -this.offset.x, y: -this.offset.y};
    this.move(offset);
    // Addes to the old parents
    this.addShapeToParent(this.oldParents);
    this.dockAllShapes(true)

    // Set the selection to the current selection
    this.selectCurrentShapes();
    this.plugin.facade.getCanvas().update();
    this.plugin.facade.updateSelection();

  },
  move: function (offset, doLayout) {

    // Move all Shapes by these offset
    for (var i = 0; i < this.moveShapes.length; i++) {
      var value = this.moveShapes[i];
      value.bounds.moveBy(offset);

      if (value instanceof ORYX.Core.Node) {

        (value.dockers || []).each(function (d) {
          d.bounds.moveBy(offset);
        })

        // Update all Dockers of Child shapes
        /*var childShapesNodes = value.getChildShapes(true).findAll(function(shape){ return shape instanceof ORYX.Core.Node });
				var childDockedShapes = childShapesNodes.collect(function(shape){ return shape.getAllDockedShapes() }).flatten().uniq();
				var childDockedEdge = childDockedShapes.findAll(function(shape){ return shape instanceof ORYX.Core.Edge });
				childDockedEdge = childDockedEdge.findAll(function(shape){ return shape.getAllDockedShapes().all(function(dsh){ return childShapesNodes.include(dsh) }) });
				var childDockedDockers = childDockedEdge.collect(function(shape){ return shape.dockers }).flatten();

				for (var j = 0; j < childDockedDockers.length; j++) {
					var docker = childDockedDockers[j];
					if (!docker.getDockedShape() && !this.moveShapes.include(docker)) {
						//docker.bounds.moveBy(offset);
						//docker.update();
					}
				}*/


        var allEdges = [].concat(value.getIncomingShapes())
          .concat(value.getOutgoingShapes())
          // Remove all edges which are included in the selection from the list
          .findAll(function (r) {
            return r instanceof ORYX.Core.Edge && !this.moveShapes.any(function (d) {
              return d == r || (d instanceof ORYX.Core.Controls.Docker && d.parent == r)
            })
          }.bind(this))
          // Remove all edges which are between the node and a node contained in the selection from the list
          .findAll(function (r) {
            return (r.dockers.first().getDockedShape() == value || !this.moveShapes.include(r.dockers.first().getDockedShape())) &&
              (r.dockers.last().getDockedShape() == value || !this.moveShapes.include(r.dockers.last().getDockedShape()))
          }.bind(this))

        // Layout all outgoing/incoming edges
        this.plugin.layoutEdges(value, allEdges, offset);


        var allSameEdges = [].concat(value.getIncomingShapes())
          .concat(value.getOutgoingShapes())
          // Remove all edges which are included in the selection from the list
          .findAll(function (r) {
            return r instanceof ORYX.Core.Edge && r.dockers.first().isDocked() && r.dockers.last().isDocked() && !this.moveShapes.include(r) && !this.moveShapes.any(function (d) {
              return d == r || (d instanceof ORYX.Core.Controls.Docker && d.parent == r)
            })
          }.bind(this))
          // Remove all edges which are included in the selection from the list
          .findAll(function (r) {
            return this.moveShapes.indexOf(r.dockers.first().getDockedShape()) > i || this.moveShapes.indexOf(r.dockers.last().getDockedShape()) > i
          }.bind(this))

        for (var j = 0; j < allSameEdges.length; j++) {
          for (var k = 1; k < allSameEdges[j].dockers.length - 1; k++) {
            var docker = allSameEdges[j].dockers[k];
            if (!docker.getDockedShape() && !this.moveShapes.include(docker)) {
              docker.bounds.moveBy(offset);
            }
          }
        }

        /*var i=-1;
				var nodes = value.getChildShapes(true);
				var allEdges = [];
				while(++i<nodes.length){
					var edges = [].concat(nodes[i].getIncomingShapes())
						.concat(nodes[i].getOutgoingShapes())
						// Remove all edges which are included in the selection from the list
						.findAll(function(r){ return r instanceof ORYX.Core.Edge && !allEdges.include(r) && r.dockers.any(function(d){ return !value.bounds.isIncluded(d.bounds.center)})})
					allEdges = allEdges.concat(edges);
					if (edges.length <= 0){ continue }
					//this.plugin.layoutEdges(nodes[i], edges, offset);
				}*/
      }
    }

  },
  dockAllShapes: function (shouldDocked) {
    // Undock all Nodes
    for (var i = 0; i < this.dockedNodes.length; i++) {
      var docker = this.dockedNodes[i].docker;

      docker.setDockedShape(shouldDocked ? this.dockedNodes[i].dockedShape : undefined)
      if (docker.getDockedShape()) {
        docker.setReferencePoint(this.dockedNodes[i].refPoint);
        //docker.update();
      }
    }
  },

  addShapeToParent: function (parents) {

    // For every Shape, add this and reset the position
    for (var i = 0; i < this.moveShapes.length; i++) {
      var currentShape = this.moveShapes[i];
      if (currentShape instanceof ORYX.Core.Node &&
        currentShape.parent !== parents[i]) {

        // Calc the new position
        var unul = parents[i].absoluteXY();
        var csul = currentShape.absoluteXY();
        var x = csul.x - unul.x;
        var y = csul.y - unul.y;

        // Add the shape to the new contained shape
        parents[i].add(currentShape);
        // Add all attached shapes as well
        currentShape.getOutgoingShapes((function (shape) {
          if (shape instanceof ORYX.Core.Node && !this.moveShapes.member(shape)) {
            parents[i].add(shape);
          }
        }).bind(this));

        // Set the new position
        if (currentShape instanceof ORYX.Core.Node && currentShape.dockers.length == 1) {
          var b = currentShape.bounds;
          x += b.width() / 2;
          y += b.height() / 2
          currentShape.dockers.first().bounds.centerMoveTo(x, y);
        } else {
          currentShape.bounds.moveTo(x, y);
        }

      }

      // Update the shape
      //currentShape.update();

    }
  },
  selectCurrentShapes: function () {
    this.plugin.facade.setSelection(this.selectedShapes);
  }
});