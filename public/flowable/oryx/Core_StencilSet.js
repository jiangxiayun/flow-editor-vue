if (!ORYX) {
  var ORYX = {};
}
if (!ORYX.Core) {
  ORYX.Core = {};
}
if (!ORYX.Core.StencilSet) {
  ORYX.Core.StencilSet = {};
}

/**
 * Class Stencil
 * uses Prototpye 1.5.0
 * uses Inheritance
 *
 * This class represents one stencil of a stencil set.
 */
ORYX.Core.StencilSet.Stencil = {
  /**
   * Constructor
   */
  construct: function (jsonStencil, namespace, source, stencilSet, propertyPackages, defaultPosition) {
    arguments.callee.$.construct.apply(this, arguments); // super();

    // check arguments and set defaults.
    if (!jsonStencil) throw "Stencilset seems corrupt.";
    if (!namespace) throw "Stencil does not provide namespace.";
    if (!source) throw "Stencil does not provide SVG source.";
    if (!stencilSet) throw "Fatal internal error loading stencilset.";
    //if(!propertyPackages) throw "Fatal internal error loading stencilset.";

    this._source = source;
    this._jsonStencil = jsonStencil;
    this._stencilSet = stencilSet;
    this._namespace = namespace;
    this._propertyPackages = propertyPackages;

    if (defaultPosition && !this._jsonStencil.position)
      this._jsonStencil.position = defaultPosition;

    this._view;
    this._properties = new Hash();

    //init all JSON values
    if (!this._jsonStencil.type || !(this._jsonStencil.type === "edge" || this._jsonStencil.type === "node")) {
      throw "ORYX.Core.StencilSet.Stencil(construct): Type is not defined.";
    }
    if (!this._jsonStencil.id || this._jsonStencil.id === "") {
      throw "ORYX.Core.StencilSet.Stencil(construct): Id is not defined.";
    }
    if (!this._jsonStencil.title || this._jsonStencil.title === "") {
      throw "ORYX.Core.StencilSet.Stencil(construct): Title is not defined.";
    }

    if (!this._jsonStencil.description) {
      this._jsonStencil.description = "";
    }
    ;
    if (!this._jsonStencil.groups) {
      this._jsonStencil.groups = [];
    }
    if (!this._jsonStencil.roles) {
      this._jsonStencil.roles = [];
    }

    //add id of stencil to its roles
    this._jsonStencil.roles.push(this._jsonStencil.id);

    //prepend namespace to each role
    this._jsonStencil.roles.each((function (role, index) {
      this._jsonStencil.roles[index] = namespace + role;
    }).bind(this));

    //delete duplicate roles
    this._jsonStencil.roles = this._jsonStencil.roles.uniq();

    //make id unique by prepending namespace of stencil set
    this._jsonStencil.id = namespace + this._jsonStencil.id;

    this.postProcessProperties();

    // init serialize callback
    if (!this._jsonStencil.serialize) {
      this._jsonStencil.serialize = {};
      //this._jsonStencil.serialize = function(shape, data) { return data;};
    }

    // init deserialize callback
    if (!this._jsonStencil.deserialize) {
      this._jsonStencil.deserialize = {};
      //this._jsonStencil.deserialize = function(shape, data) { return data;};
    }

    // init layout callback
    if (!this._jsonStencil.layout) {
      this._jsonStencil.layout = []
      //this._jsonStencil.layout = function() {return true;}
    }

    //TODO does not work correctly, if the url does not exist
    //How to guarantee that the view is loaded correctly before leaving the constructor???
    var url = source + "view/" + jsonStencil.view;
    // override content type when this is webkit.

    /*
		if(Prototype.Browser.WebKit) {

			var req = new XMLHttpRequest;
			req.open("GET", url, false);
			req.overrideMimeType('text/xml');
			req.send(null);
			req.onload = (function() { _loadSVGOnSuccess(req.responseXML); }).bind(this);

		// else just do it.
		} else
		*/

    if (this._jsonStencil.view.trim().match(/</)) {
      var parser = new DOMParser();
      var xml = parser.parseFromString(this._jsonStencil.view, "text/xml");

      //check if result is a SVG document
      if (ORYX.Editor.checkClassType(xml.documentElement, SVGSVGElement)) {

        this._view = xml.documentElement;

      } else {
        throw "ORYX.Core.StencilSet.Stencil(_loadSVGOnSuccess): The response is not a valid SVG document."
      }
    } else {
      new Ajax.Request(
        url, {
          asynchronous: false, method: 'get',
          onSuccess: this._loadSVGOnSuccess.bind(this),
          onFailure: this._loadSVGOnFailure.bind(this)
        });
    }
  },

  postProcessProperties: function () {
    // add image path to icon
    this._jsonStencil.icon = ORYX.CONFIG.SERVER_HANDLER_ROOT + "/stencilsetitem/" + this._jsonStencil.objectId + "/image";

    // init property packages
    if (this._jsonStencil.propertyPackages && this._jsonStencil.propertyPackages instanceof Array) {

      var hiddenPropertyPackages = this._jsonStencil.hiddenPropertyPackages;

      this._jsonStencil.propertyPackages.each((function (ppId) {
        var pp = this._propertyPackages.get(ppId);

        if (pp) {
          pp.each((function (prop) {
            var oProp = new ORYX.Core.StencilSet.Property(prop, this._namespace, this);
            var key = oProp.prefix() + "-" + oProp.id();
            this._properties.set(key, oProp);

            // Check if we need to hide this property (ie it is there for display purposes,
            // if the user has filled it in, but it can no longer be edited)
            if (hiddenPropertyPackages.indexOf(oProp.id()) > -1) {
              oProp.hide();
            }

          }).bind(this));
        }
      }).bind(this));
    }

    // init properties
    if (this._jsonStencil.properties && this._jsonStencil.properties instanceof Array) {
      this._jsonStencil.properties.each((function (prop) {
        var oProp = new ORYX.Core.StencilSet.Property(prop, this._namespace, this);
        var key = oProp.prefix() + "-" + oProp.id();
        this._properties.set(key, oProp);
      }).bind(this));
    }


  },
  /**
   * @param {ORYX.Core.StencilSet.Stencil} stencil
   * @return {Boolean} True, if stencil has the same namespace and type.
   */
  equals: function (stencil) {
    return (this.id() === stencil.id());
  },

  stencilSet: function () {
    return this._stencilSet;
  },

  type: function () {
    return this._jsonStencil.type;
  },

  namespace: function () {
    return this._namespace;
  },

  id: function () {
    return this._jsonStencil.id;
  },

  idWithoutNs: function () {
    return this.id().replace(this.namespace(), "");
  },

  title: function () {
    return ORYX.Core.StencilSet.getTranslation(this._jsonStencil, "title");
  },

  description: function () {
    return ORYX.Core.StencilSet.getTranslation(this._jsonStencil, "description");
  },

  groups: function () {
    return ORYX.Core.StencilSet.getTranslation(this._jsonStencil, "groups");
  },

  position: function () {
    return (isNaN(this._jsonStencil.position) ? 0 : this._jsonStencil.position);
  },

  view: function () {
    return this._view.cloneNode(true) || this._view;
  },

  icon: function () {
    return this._jsonStencil.icon;
  },

  fixedAspectRatio: function () {
    return this._jsonStencil.fixedAspectRatio === true;
  },

  hasMultipleRepositoryEntries: function () {
    return (this.getRepositoryEntries().length > 0);
  },

  getRepositoryEntries: function () {
    return (this._jsonStencil.repositoryEntries) ?
      $A(this._jsonStencil.repositoryEntries) : $A([]);
  },

  properties: function () {
    return this._properties.values();
  },

  property: function (id) {
    return this._properties.get(id);
  },

  roles: function () {
    return this._jsonStencil.roles;
  },

  defaultAlign: function () {
    if (!this._jsonStencil.defaultAlign)
      return "east";
    return this._jsonStencil.defaultAlign;
  },

  serialize: function (shape, data) {
    return this._jsonStencil.serialize;
    //return this._jsonStencil.serialize(shape, data);
  },

  deserialize: function (shape, data) {
    return this._jsonStencil.deserialize;
    //return this._jsonStencil.deserialize(shape, data);
  },

  // in which case is targetShape used?
//	layout: function(shape, targetShape) {
//		return this._jsonStencil.layout(shape, targetShape);
//	},
  // layout property to store events for layouting in plugins
  layout: function (shape) {
    return this._jsonStencil.layout
  },

  addProperty: function (property, namespace) {
    if (property && namespace) {
      var oProp = new ORYX.Core.StencilSet.Property(property, namespace, this);
      this._properties[oProp.prefix() + "-" + oProp.id()] = oProp;
    }
  },

  removeProperty: function (propertyId) {
    if (propertyId) {
      var oProp = this._properties.values().find(function (prop) {
        return (propertyId == prop.id());
      });
      if (oProp)
        delete this._properties[oProp.prefix() + "-" + oProp.id()];
    }
  },

  _loadSVGOnSuccess: function (result) {

    var xml = null;

    /*
		 * We want to get a dom object for the requested file. Unfortunately,
		 * safari has some issues here. this is meant as a fallback for all
		 * browsers that don't recognize the svg mimetype as XML but support
		 * data: urls on Ajax calls.
		 */

    // responseXML != undefined.
    // if(!(result.responseXML))

    // get the dom by data: url.
    // xml = _evenMoreEvilHack(result.responseText, 'text/xml');

    // else

    // get it the usual way.
    xml = result.responseXML;

    //check if result is a SVG document
    if (ORYX.Editor.checkClassType(xml.documentElement, SVGSVGElement)) {

      this._view = xml.documentElement;

    } else {
      throw "ORYX.Core.StencilSet.Stencil(_loadSVGOnSuccess): The response is not a SVG document."
    }
  },

  _loadSVGOnFailure: function (result) {
    throw "ORYX.Core.StencilSet.Stencil(_loadSVGOnFailure): Loading SVG document failed."
  },

  toString: function () {
    return "Stencil " + this.title() + " (" + this.id() + ")";
  }
};

ORYX.Core.StencilSet.Stencil = Clazz.extend(ORYX.Core.StencilSet.Stencil);

/**
 * Transform a string into an xml document, the Safari way, as long as
 * the nightlies are broken. Even more evil version.
 * @param {Object} str
 * @param {Object} contentType
 */
function _evenMoreEvilHack(str, contentType) {
  /*
	 * This even more evil hack was taken from
	 * http://web-graphics.com/mtarchive/001606.php#chatty004999
	 */

  if (window.ActiveXObject) {
    var d = new ActiveXObject("MSXML.DomDocument");
    d.loadXML(str);
    return d;
  } else if (window.XMLHttpRequest) {
    var req = new XMLHttpRequest;
    req.open("GET", "data:" + (contentType || "application/xml") +
      ";charset=utf-8," + encodeURIComponent(str), false);
    if (req.overrideMimeType) {
      req.overrideMimeType(contentType);
    }
    req.send(null);
    return req.responseXML;
  }
}

/**
 * Transform a string into an xml document, the Safari way, as long as
 * the nightlies are broken.
 * @param {Object} result the xml document object.
 */
function _evilSafariHack(serializedXML) {
  /*
	 *  The Dave way. Taken from:
	 *  http://web-graphics.com/mtarchive/001606.php
	 *
	 *  There is another possibility to parse XML in Safari, by implementing
	 *  the DOMParser in javascript. However, in the latest nightlies of
	 *  WebKit, DOMParser is already available, but still buggy. So, this is
	 *  the best compromise for the time being.
	 */

  var xml = serializedXML;
  var url = "data:text/xml;charset=utf-8," + encodeURIComponent(xml);
  var dom = null;

  // your standard AJAX stuff
  var req = new XMLHttpRequest();
  req.open("GET", url);
  req.onload = function () {
    dom = req.responseXML;
  }
  req.send(null);

  return dom;
}

/**
 * Class Property
 * uses Prototpye 1.5.0
 * uses Inheritance
 */
ORYX.Core.StencilSet.Property = Clazz.extend({
  /**
   * Constructor
   */
  construct: function (jsonProp, namespace, stencil) {
    arguments.callee.$.construct.apply(this, arguments);

    this._jsonProp = jsonProp || ORYX.Log.error("Parameter jsonProp is not defined.");
    this._namespace = namespace || ORYX.Log.error("Parameter namespace is not defined.");
    this._stencil = stencil || ORYX.Log.error("Parameter stencil is not defined.");

    this._items = {};
    this._complexItems = {};

    // Flag to indicate whether or not the property should be hidden
    // This can be for example when the stencil set is upgraded, but the model
    // has a value for that specific property filled in which we still want to show.
    // If the value is missing, the property can simply be not shown.
    this._hidden = false;

    jsonProp.id = jsonProp.id || ORYX.Log.error("ORYX.Core.StencilSet.Property(construct): Id is not defined.");
    jsonProp.id = jsonProp.id.toLowerCase();

    if (!jsonProp.type) {
      ORYX.Log.info("Type is not defined for stencil '%0', id '%1'. Falling back to 'String'.", stencil, jsonProp.id);
      jsonProp.type = "string";
    }
    else {
      jsonProp.type = jsonProp.type.toLowerCase();
    }

    jsonProp.prefix = jsonProp.prefix || "oryx";
    jsonProp.title = jsonProp.title || "";
    jsonProp.value = jsonProp.value || "";
    jsonProp.description = jsonProp.description || "";
    jsonProp.readonly = jsonProp.readonly || false;
    jsonProp.optional = jsonProp.optional !== false;

    //init refToView
    if (this._jsonProp.refToView) {
      if (!(this._jsonProp.refToView instanceof Array)) {
        this._jsonProp.refToView = [this._jsonProp.refToView];
      }
    }
    else {
      this._jsonProp.refToView = [];
    }

    var globalMin = this.getMinForType(jsonProp.type);
    if (jsonProp.min === undefined || jsonProp.min === null) {
      jsonProp.min = globalMin;
    } else if (jsonProp.min < globalMin) {
      jsonProp.min = globalMin;
    }

    var globalMax = this.getMaxForType(jsonProp.type);
    if (jsonProp.max === undefined || jsonProp.max === null) {
      jsonProp.max = globalMax;
    } else if (jsonProp.max > globalMax) {
      jsonProp.min = globalMax;
    }

    if (!jsonProp.fillOpacity) {
      jsonProp.fillOpacity = false;
    }

    if ("number" != typeof jsonProp.lightness) {
      jsonProp.lightness = 1;
    } else {
      jsonProp.lightness = Math.max(0, Math.min(1, jsonProp.lightness));
    }

    if (!jsonProp.strokeOpacity) {
      jsonProp.strokeOpacity = false;
    }

    if (jsonProp.length === undefined || jsonProp.length === null) {
      jsonProp.length = Number.MAX_VALUE;
    }

    if (!jsonProp.wrapLines) {
      jsonProp.wrapLines = false;
    }

    if (!jsonProp.dateFormat) {
      jsonProp.dateFormat = ORYX.I18N.PropertyWindow.dateFormat || "m/d/y";
    }

    if (!jsonProp.fill) {
      jsonProp.fill = false;
    }

    if (!jsonProp.stroke) {
      jsonProp.stroke = false;
    }

    if (!jsonProp.inverseBoolean) {
      jsonProp.inverseBoolean = false;
    }

    if (!jsonProp.directlyEditable && jsonProp.directlyEditable != false) {
      jsonProp.directlyEditable = true;
    }

    if (jsonProp.visible !== false) {
      jsonProp.visible = true;
    }

    if (jsonProp.isList !== true) {
      jsonProp.isList = false;

      if (!jsonProp.list || !(jsonProp.list instanceof Array)) {
        jsonProp.list = [];
      }
    }

    if (!jsonProp.category) {
      if (jsonProp.popular) {
        jsonProp.category = "popular";
      } else {
        jsonProp.category = "others";
      }
    }

    if (!jsonProp.alwaysAppearInMultiselect) {
      jsonProp.alwaysAppearInMultiselect = false;
    }

    if (jsonProp.type === ORYX.CONFIG.TYPE_CHOICE) {
      if (jsonProp.items && jsonProp.items instanceof Array) {
        jsonProp.items.each((function (jsonItem) {
          // why is the item's value used as the key???
          this._items[jsonItem.value.toLowerCase()] = new ORYX.Core.StencilSet.PropertyItem(jsonItem, namespace, this);
        }).bind(this));
      }
      else {
        throw "ORYX.Core.StencilSet.Property(construct): No property items defined."
      }
      // extended by Kerstin (start)
    }
    else if (jsonProp.type === ORYX.CONFIG.TYPE_COMPLEX || jsonProp.type == ORYX.CONFIG.TYPE_MULTIPLECOMPLEX) {
      if (jsonProp.complexItems && jsonProp.complexItems instanceof Array) {
        jsonProp.complexItems.each((function (jsonComplexItem) {
          this._complexItems[jsonComplexItem.id.toLowerCase()] = new ORYX.Core.StencilSet.ComplexPropertyItem(jsonComplexItem, namespace, this);
        }).bind(this));
      }
    }
    // extended by Kerstin (end)
  },

  getMinForType: function (type) {
    if (type.toLowerCase() == ORYX.CONFIG.TYPE_INTEGER) {
      return -Math.pow(2, 31)
    } else {
      return -Number.MAX_VALUE + 1;
    }
  },
  getMaxForType: function (type) {
    if (type.toLowerCase() == ORYX.CONFIG.TYPE_INTEGER) {
      return Math.pow(2, 31) - 1
    } else {
      return Number.MAX_VALUE;
    }
  },

  /**
   * @param {ORYX.Core.StencilSet.Property} property
   * @return {Boolean} True, if property has the same namespace and id.
   */
  equals: function (property) {
    return (this._namespace === property.namespace() &&
      this.id() === property.id()) ? true : false;
  },

  namespace: function () {
    return this._namespace;
  },

  stencil: function () {
    return this._stencil;
  },

  id: function () {
    return this._jsonProp.id;
  },

  prefix: function () {
    return this._jsonProp.prefix;
  },

  type: function () {
    return this._jsonProp.type;
  },

  inverseBoolean: function () {
    return this._jsonProp.inverseBoolean;
  },

  category: function () {
    return this._jsonProp.category;
  },

  setCategory: function (value) {
    this._jsonProp.category = value;
  },

  directlyEditable: function () {
    return this._jsonProp.directlyEditable;
  },

  visible: function () {
    return this._jsonProp.visible;
  },

  title: function () {
    return ORYX.Core.StencilSet.getTranslation(this._jsonProp, "title");
  },

  value: function () {
    return this._jsonProp.value;
  },

  readonly: function () {
    return this._jsonProp.readonly;
  },

  optional: function () {
    return this._jsonProp.optional;
  },

  description: function () {
    return ORYX.Core.StencilSet.getTranslation(this._jsonProp, "description");
  },

  /**
   * An optional link to a SVG element so that the property affects the
   * graphical representation of the stencil.
   */
  refToView: function () {
    return this._jsonProp.refToView;
  },

  /**
   * If type is integer or float, min is the lower bounds of value.
   */
  min: function () {
    return this._jsonProp.min;
  },

  /**
   * If type ist integer or float, max is the upper bounds of value.
   */
  max: function () {
    return this._jsonProp.max;
  },

  /**
   * If type is float, this method returns if the fill-opacity property should
   *  be set.
   *  @return {Boolean}
   */
  fillOpacity: function () {
    return this._jsonProp.fillOpacity;
  },

  /**
   * If type is float, this method returns if the stroke-opacity property should
   *  be set.
   *  @return {Boolean}
   */
  strokeOpacity: function () {
    return this._jsonProp.strokeOpacity;
  },

  /**
   * If type is string or richtext, length is the maximum length of the text.
   * TODO how long can a string be.
   */
  length: function () {
    return this._jsonProp.length ? this._jsonProp.length : Number.MAX_VALUE;
  },

  wrapLines: function () {
    return this._jsonProp.wrapLines;
  },

  /**
   * If type is date, dateFormat specifies the format of the date. The format
   * specification of the ext library is used:
   *
   * Format  Output      Description
   *  ------  ----------  --------------------------------------------------------------
   *    d      10         Day of the month, 2 digits with leading zeros
   *    D      Wed        A textual representation of a day, three letters
   *    j      10         Day of the month without leading zeros
   *    l      Wednesday  A full textual representation of the day of the week
   *    S      th         English ordinal day of month suffix, 2 chars (use with j)
   *    w      3          Numeric representation of the day of the week
   *    z      9          The julian date, or day of the year (0-365)
   *    W      01         ISO-8601 2-digit week number of year, weeks starting on Monday (00-52)
   *    F      January    A full textual representation of the month
   *    m      01         Numeric representation of a month, with leading zeros
   *    M      Jan        Month name abbreviation, three letters
   *    n      1          Numeric representation of a month, without leading zeros
   *    t      31         Number of days in the given month
   *    L      0          Whether its a leap year (1 if it is a leap year, else 0)
   *    Y      2007       A full numeric representation of a year, 4 digits
   *    y      07         A two digit representation of a year
   *    a      pm         Lowercase Ante meridiem and Post meridiem
   *    A      PM         Uppercase Ante meridiem and Post meridiem
   *    g      3          12-hour format of an hour without leading zeros
   *    G      15         24-hour format of an hour without leading zeros
   *    h      03         12-hour format of an hour with leading zeros
   *    H      15         24-hour format of an hour with leading zeros
   *    i      05         Minutes with leading zeros
   *    s      01         Seconds, with leading zeros
   *    O      -0600      Difference to Greenwich time (GMT) in hours
   *    T      CST        Timezone setting of the machine running the code
   *    Z      -21600     Timezone offset in seconds (negative if west of UTC, positive if east)
   *
   * Example:
   *  F j, Y, g:i a  ->  January 10, 2007, 3:05 pm
   */
  dateFormat: function () {
    return this._jsonProp.dateFormat;
  },

  /**
   * If type is color, this method returns if the fill property should
   *  be set.
   *  @return {Boolean}
   */
  fill: function () {
    return this._jsonProp.fill;
  },

  /**
   * Lightness defines the satiation of the color
   * 0 is the pure color
   * 1 is white
   * @return {Integer} lightness
   */
  lightness: function () {
    return this._jsonProp.lightness;
  },

  /**
   * If type is color, this method returns if the stroke property should
   *  be set.
   *  @return {Boolean}
   */
  stroke: function () {
    return this._jsonProp.stroke;
  },

  /**
   * If type is choice, items is a hash map with all alternative values
   * (PropertyItem objects) with id as keys.
   */
  items: function () {
    return $H(this._items).values();
  },

  item: function (value) {
    if (value) {
      return this._items[value.toLowerCase()];
    } else {
      return null;
    }
  },

  toString: function () {
    return "Property " + this.title() + " (" + this.id() + ")";
  },

  complexItems: function () {
    return $H(this._complexItems).values();
  },

  complexItem: function (id) {
    if (id) {
      return this._complexItems[id.toLowerCase()];
    } else {
      return null;
    }

  },

  complexAttributeToView: function () {
    return this._jsonProp.complexAttributeToView || "";
  },

  isList: function () {
    return !!this._jsonProp.isList;
  },

  getListItems: function () {
    return this._jsonProp.list;
  },

  /**
   * If type is glossary link, the
   * type of category can be defined where
   * the link only can go to.
   * @return {String} The glossary category id
   */
  linkableType: function () {
    return this._jsonProp.linkableType || "";
  },

  alwaysAppearInMultiselect: function () {
    return this._jsonProp.alwaysAppearInMultiselect;
  },

  popular: function () {
    return this._jsonProp.popular || false;
  },

  setPopular: function () {
    this._jsonProp.popular = true;
  },

  hide: function () {
    this._hidden = true;
  },

  isHidden: function () {
    return this._hidden;
  }

});

/**
 * Class Stencil
 * uses Prototpye 1.5.0
 * uses Inheritance
 */
ORYX.Core.StencilSet.PropertyItem = Clazz.extend({
  /**
   * Constructor
   */
  construct: function (jsonItem, namespace, property) {
    arguments.callee.$.construct.apply(this, arguments);

    if (!jsonItem) {
      throw "ORYX.Core.StencilSet.PropertyItem(construct): Parameter jsonItem is not defined.";
    }
    if (!namespace) {
      throw "ORYX.Core.StencilSet.PropertyItem(construct): Parameter namespace is not defined.";
    }
    if (!property) {
      throw "ORYX.Core.StencilSet.PropertyItem(construct): Parameter property is not defined.";
    }

    this._jsonItem = jsonItem;
    this._namespace = namespace;
    this._property = property;

    //init all values
    if (!jsonItem.value) {
      throw "ORYX.Core.StencilSet.PropertyItem(construct): Value is not defined.";
    }

    if (this._jsonItem.refToView) {
      if (!(this._jsonItem.refToView instanceof Array)) {
        this._jsonItem.refToView = [this._jsonItem.refToView];
      }
    } else {
      this._jsonItem.refToView = [];
    }
  },

  /**
   * @param {ORYX.Core.StencilSet.PropertyItem} item
   * @return {Boolean} True, if item has the same namespace and id.
   */
  equals: function (item) {
    return (this.property().equals(item.property()) &&
      this.value() === item.value());
  },

  namespace: function () {
    return this._namespace;
  },

  property: function () {
    return this._property;
  },

  value: function () {
    return this._jsonItem.value;
  },

  title: function () {
    return ORYX.Core.StencilSet.getTranslation(this._jsonItem, "title");
  },

  refToView: function () {
    return this._jsonItem.refToView;
  },

  icon: function () {
    return (this._jsonItem.icon) ? this.property().stencil()._source + "icons/" + this._jsonItem.icon : "";
  },

  toString: function () {
    return "PropertyItem " + this.property() + " (" + this.value() + ")";
  }
});

/**
 * Class Stencil
 * uses Prototpye 1.5.0
 * uses Inheritance
 */
ORYX.Core.StencilSet.ComplexPropertyItem = Clazz.extend({
  /**
   * Constructor
   */
  construct: function (jsonItem, namespace, property) {
    arguments.callee.$.construct.apply(this, arguments);

    if (!jsonItem) {
      throw "ORYX.Core.StencilSet.ComplexPropertyItem(construct): Parameter jsonItem is not defined.";
    }
    if (!namespace) {
      throw "ORYX.Core.StencilSet.ComplexPropertyItem(construct): Parameter namespace is not defined.";
    }
    if (!property) {
      throw "ORYX.Core.StencilSet.ComplexPropertyItem(construct): Parameter property is not defined.";
    }

    this._jsonItem = jsonItem;
    this._namespace = namespace;
    this._property = property;
    this._items = new Hash();
    this._complexItems = new Hash();

    //init all values
    if (!jsonItem.name) {
      throw "ORYX.Core.StencilSet.ComplexPropertyItem(construct): Name is not defined.";
    }

    if (!jsonItem.type) {
      throw "ORYX.Core.StencilSet.ComplexPropertyItem(construct): Type is not defined.";
    } else {
      jsonItem.type = jsonItem.type.toLowerCase();
    }

    if (jsonItem.type === ORYX.CONFIG.TYPE_CHOICE) {
      if (jsonItem.items && jsonItem.items instanceof Array) {
        jsonItem.items.each((function (item) {
          this._items[item.value] = new ORYX.Core.StencilSet.PropertyItem(item, namespace, this);
        }).bind(this));
      } else {
        throw "ORYX.Core.StencilSet.Property(construct): No property items defined."
      }
    } else if (jsonItem.type === ORYX.CONFIG.TYPE_COMPLEX) {
      if (jsonItem.complexItems && jsonItem.complexItems instanceof Array) {
        jsonItem.complexItems.each((function (complexItem) {
          this._complexItems[complexItem.id] = new ORYX.Core.StencilSet.ComplexPropertyItem(complexItem, namespace, this);
        }).bind(this));
      } else {
        throw "ORYX.Core.StencilSet.Property(construct): No property items defined."
      }
    }
  },

  /**
   * @param {ORYX.Core.StencilSet.PropertyItem} item
   * @return {Boolean} True, if item has the same namespace and id.
   */
  equals: function (item) {
    return (this.property().equals(item.property()) &&
      this.name() === item.name());
  },

  namespace: function () {
    return this._namespace;
  },

  property: function () {
    return this._property;
  },

  name: function () {
    return ORYX.Core.StencilSet.getTranslation(this._jsonItem, "name");
  },

  id: function () {
    return this._jsonItem.id;
  },

  type: function () {
    return this._jsonItem.type;
  },

  optional: function () {
    return this._jsonItem.optional;
  },

  width: function () {
    return this._jsonItem.width;
  },

  value: function () {
    return this._jsonItem.value;
  },

  items: function () {
    return this._items.values();
  },

  complexItems: function () {
    return this._complexItems.values();
  },

  disable: function () {
    return this._jsonItem.disable;
  }
});

/**
 * Class Rules uses Prototpye 1.5.0 uses Inheritance
 *
 * This class implements the API to check the stencil sets' rules.
 */
ORYX.Core.StencilSet.Rules = {
  /**
   * Constructor
   */
  construct: function () {
    arguments.callee.$.construct.apply(this, arguments);

    this._stencilSets = [];
    this._stencils = [];
    this._containerStencils = [];

    this._cachedConnectSET = new Hash();
    this._cachedConnectSE = new Hash();
    this._cachedConnectTE = new Hash();
    this._cachedCardSE = new Hash();
    this._cachedCardTE = new Hash();
    this._cachedContainPC = new Hash();
    this._cachedMorphRS = new Hash();

    this._connectionRules = new Hash();
    this._cardinalityRules = new Hash();
    this._containmentRules = new Hash();
    this._morphingRules = new Hash();
    this._layoutRules = new Hash();
  },

  /**
   * Call this method to initialize the rules for a stencil set and all of its
   * active extensions.
   *
   * @param {Object}
   *            stencilSet
   */
  initializeRules: function (stencilSet) {

    var existingSS = this._stencilSets.find(function (ss) {
      return (ss.namespace() == stencilSet.namespace());
    });
    if (existingSS) {
      // reinitialize all rules
      var stencilsets = this._stencilSets.clone();
      stencilsets = stencilsets.without(existingSS);
      stencilsets.push(stencilSet);

      this._stencilSets = [];
      this._stencils = [];
      this._containerStencils = [];

      this._cachedConnectSET = new Hash();
      this._cachedConnectSE = new Hash();
      this._cachedConnectTE = new Hash();
      this._cachedCardSE = new Hash();
      this._cachedCardTE = new Hash();
      this._cachedContainPC = new Hash();
      this._cachedMorphRS = new Hash();

      this._connectionRules = new Hash();
      this._cardinalityRules = new Hash();
      this._containmentRules = new Hash();
      this._morphingRules = new Hash();
      this._layoutRules = new Hash();

      stencilsets.each(function (ss) {
        this.initializeRules(ss);
      }.bind(this));
      return;
    }
    else {
      this._stencilSets.push(stencilSet);

      var jsonRules = new Hash(stencilSet.jsonRules());
      var namespace = stencilSet.namespace();
      var stencils = stencilSet.stencils();

      stencilSet.extensions().values().each(function (extension) {
        if (extension.rules) {
          if (extension.rules.connectionRules)
            jsonRules.connectionRules = jsonRules.connectionRules.concat(extension.rules.connectionRules);
          if (extension.rules.cardinalityRules)
            jsonRules.cardinalityRules = jsonRules.cardinalityRules.concat(extension.rules.cardinalityRules);
          if (extension.rules.containmentRules)
            jsonRules.containmentRules = jsonRules.containmentRules.concat(extension.rules.containmentRules);
          if (extension.rules.morphingRules)
            jsonRules.morphingRules = jsonRules.morphingRules.concat(extension.rules.morphingRules);
        }
        if (extension.stencils)
          stencils = stencils.concat(extension.stencils);
      });

      this._stencils = this._stencils.concat(stencilSet.stencils());

      // init connection rules
      var cr = this._connectionRules;
      if (jsonRules.get('connectionRules')) {
        jsonRules.get('connectionRules').each((function (rules) {
          if (this._isRoleOfOtherNamespace(rules.role)) {
            if (!cr.get(rules.role)) {
              cr.set(rules.role, new Hash());
            }
          }
          else {
            if (!cr.get(namespace + rules.role))
              cr.set(namespace + rules.role, new Hash());
          }

          rules.connects.each((function (connect) {
            var toRoles = [];
            if (connect.to) {
              if (!(connect.to instanceof Array)) {
                connect.to = [connect.to];
              }
              connect.to.each((function (to) {
                if (this._isRoleOfOtherNamespace(to)) {
                  toRoles.push(to);
                }
                else {
                  toRoles.push(namespace + to);
                }
              }).bind(this));
            }

            var role, from;
            if (this._isRoleOfOtherNamespace(rules.role))
              role = rules.role;
            else
              role = namespace + rules.role;

            if (this._isRoleOfOtherNamespace(connect.from))
              from = connect.from;
            else
              from = namespace + connect.from;

            if (!cr.get(role).get(from))
              cr.get(role).set(from, toRoles);
            else
              cr.get(role).set(from, cr.get(role).get(from).concat(toRoles));

          }).bind(this));
        }).bind(this));
      }

      // init cardinality rules
      var cardr = this._cardinalityRules;
      if (jsonRules.get('cardinalityRules')) {
        jsonRules.get('cardinalityRules').each((function (rules) {
          var cardrKey;
          if (this._isRoleOfOtherNamespace(rules.role)) {
            cardrKey = rules.role;
          }
          else {
            cardrKey = namespace + rules.role;
          }

          if (!cardr.get(cardrKey)) {
            cardr.set(cardrKey, {});
            for (i in rules) {
              cardr.get(cardrKey)[i] = rules[i];
            }
          }

          var oe = new Hash();
          if (rules.outgoingEdges) {
            rules.outgoingEdges.each((function (rule) {
              if (this._isRoleOfOtherNamespace(rule.role)) {
                oe.set(rule.role, rule);
              }
              else {
                oe.set(namespace + rule.role, rule);
              }
            }).bind(this));
          }
          cardr.get(cardrKey).outgoingEdges = oe;
          var ie = new Hash();
          if (rules.incomingEdges) {
            rules.incomingEdges.each((function (rule) {
              if (this._isRoleOfOtherNamespace(rule.role)) {
                ie.set(rule.role, rule);
              }
              else {
                ie.set(namespace + rule.role, rule);
              }
            }).bind(this));
          }
          cardr.get(cardrKey).incomingEdges = ie;
        }).bind(this));
      }

      // init containment rules
      var conr = this._containmentRules;
      if (jsonRules.get('containmentRules')) {
        jsonRules.get('containmentRules').each((function (rules) {
          var conrKey;
          if (this._isRoleOfOtherNamespace(rules.role)) {
            conrKey = rules.role;
          }
          else {
            this._containerStencils.push(namespace + rules.role);
            conrKey = namespace + rules.role;
          }
          if (!conr.get(conrKey)) {
            conr.set(conrKey, []);
          }
          (rules.contains || []).each((function (containRole) {
            if (this._isRoleOfOtherNamespace(containRole)) {
              conr.get(conrKey).push(containRole);
            }
            else {
              conr.get(conrKey).push(namespace + containRole);
            }
          }).bind(this));
        }).bind(this));
      }

      // init morphing rules
      var morphr = this._morphingRules;
      if (jsonRules.get('morphingRules')) {
        jsonRules.get('morphingRules').each((function (rules) {
          var morphrKey;
          if (this._isRoleOfOtherNamespace(rules.role)) {
            morphrKey = rules.role;
          }
          else {
            morphrKey = namespace + rules.role;
          }
          if (!morphr.get(morphrKey)) {
            morphr.set(morphrKey, []);
          }
          if (!rules.preserveBounds) {
            rules.preserveBounds = false;
          }
          rules.baseMorphs.each((function (baseMorphStencilId) {
            var morphStencil = this._getStencilById(namespace + baseMorphStencilId);
            if (morphStencil) {
              morphr.get(morphrKey).push(morphStencil);
            }
          }).bind(this));
        }).bind(this));
      }

      // init layouting rules
      var layoutRules = this._layoutRules;
      if (jsonRules.get('layoutRules')) {

        var getDirections = function (o) {
          return {
            "edgeRole": o.edgeRole || undefined,
            "t": o["t"] || 1,
            "r": o["r"] || 1,
            "b": o["b"] || 1,
            "l": o["l"] || 1
          }
        }

        jsonRules.get('layoutRules').each(function (rules) {
          var layoutKey;
          if (this._isRoleOfOtherNamespace(rules.role)) {
            layoutKey = rules.role;
          }
          else {
            layoutKey = namespace + rules.role;
          }
          if (!layoutRules.get(layoutKey)) {
            layoutRules.set(layoutKey, {});
          }
          if (rules["in"]) {
            layoutRules.get(layoutKey)["in"] = getDirections(rules["in"]);
          }
          if (rules["ins"]) {
            layoutRules.get(layoutKey)["ins"] = (rules["ins"] || []).map(function (e) {
              return getDirections(e)
            })
          }
          if (rules["out"]) {
            layoutRules.get(layoutKey)["out"] = getDirections(rules["out"]);
          }
          if (rules["outs"]) {
            layoutRules.get(layoutKey)["outs"] = (rules["outs"] || []).map(function (e) {
              return getDirections(e)
            })
          }
        }.bind(this));
      }
    }
  },

  _getStencilById: function (id) {
    return this._stencils.find(function (stencil) {
      return stencil.id() == id;
    });
  },

  _cacheConnect: function (args) {
    result = this._canConnect(args);

    if (args.sourceStencil && args.targetStencil) {
      var source = this._cachedConnectSET[args.sourceStencil.id()];

      if (!source) {
        source = new Hash();
        this._cachedConnectSET[args.sourceStencil.id()] = source;
      }

      var edge = source[args.edgeStencil.id()];

      if (!edge) {
        edge = new Hash();
        source[args.edgeStencil.id()] = edge;
      }

      edge[args.targetStencil.id()] = result;

    } else if (args.sourceStencil) {
      var source = this._cachedConnectSE[args.sourceStencil.id()];

      if (!source) {
        source = new Hash();
        this._cachedConnectSE[args.sourceStencil.id()] = source;
      }

      source[args.edgeStencil.id()] = result;

    } else {
      var target = this._cachedConnectTE[args.targetStencil.id()];

      if (!target) {
        target = new Hash();
        this._cachedConnectTE[args.targetStencil.id()] = target;
      }

      target[args.edgeStencil.id()] = result;
    }

    return result;
  },

  _cacheCard: function (args) {

    if (args.sourceStencil) {
      var source = this._cachedCardSE[args.sourceStencil.id()]

      if (!source) {
        source = new Hash();
        this._cachedCardSE[args.sourceStencil.id()] = source;
      }

      var max = this._getMaximumNumberOfOutgoingEdge(args);
      if (max == undefined)
        max = -1;

      source[args.edgeStencil.id()] = max;
    }

    if (args.targetStencil) {
      var target = this._cachedCardTE[args.targetStencil.id()]

      if (!target) {
        target = new Hash();
        this._cachedCardTE[args.targetStencil.id()] = target;
      }

      var max = this._getMaximumNumberOfIncomingEdge(args);
      if (max == undefined)
        max = -1;

      target[args.edgeStencil.id()] = max;
    }
  },

  _cacheContain: function (args) {

    var result = [this._canContain(args),
      this._getMaximumOccurrence(args.containingStencil, args.containedStencil)]

    if (result[1] == undefined)
      result[1] = -1;

    var children = this._cachedContainPC[args.containingStencil.id()];

    if (!children) {
      children = new Hash();
      this._cachedContainPC[args.containingStencil.id()] = children;
    }

    children[args.containedStencil.id()] = result;

    return result;
  },

  /**
   * Returns all stencils belonging to a morph group. (calculation result is
   * cached)
   */
  _cacheMorph: function (role) {

    var morphs = this._cachedMorphRS[role];

    if (!morphs) {
      morphs = [];

      if (this._morphingRules.keys().include(role)) {
        morphs = this._stencils.select(function (stencil) {
          return stencil.roles().include(role);
        });
      }

      this._cachedMorphRS[role] = morphs;
    }
    return morphs;
  },

  /** Begin connection rules' methods */

  /**
   *
   * @param {Object}
   *            args sourceStencil: ORYX.Core.StencilSet.Stencil | undefined
   *            sourceShape: ORYX.Core.Shape | undefined
   *
   * At least sourceStencil or sourceShape has to be specified
   *
   * @return {Array} Array of stencils of edges that can be outgoing edges of
   *         the source.
   */
  outgoingEdgeStencils: function (args) {
    // check arguments
    if (!args.sourceShape && !args.sourceStencil) {
      return [];
    }

    // init arguments
    if (args.sourceShape) {
      args.sourceStencil = args.sourceShape.getStencil();
    }

    var _edges = [];

    // test each edge, if it can connect to source
    this._stencils.each((function (stencil) {
      if (stencil.type() === "edge") {
        var newArgs = Object.clone(args);
        newArgs.edgeStencil = stencil;
        if (this.canConnect(newArgs)) {
          _edges.push(stencil);
        }
      }
    }).bind(this));

    return _edges;
  },

  /**
   *
   * @param {Object}
   *            args targetStencil: ORYX.Core.StencilSet.Stencil | undefined
   *            targetShape: ORYX.Core.Shape | undefined
   *
   * At least targetStencil or targetShape has to be specified
   *
   * @return {Array} Array of stencils of edges that can be incoming edges of
   *         the target.
   */
  incomingEdgeStencils: function (args) {
    // check arguments
    if (!args.targetShape && !args.targetStencil) {
      return [];
    }

    // init arguments
    if (args.targetShape) {
      args.targetStencil = args.targetShape.getStencil();
    }

    var _edges = [];

    // test each edge, if it can connect to source
    this._stencils.each((function (stencil) {
      if (stencil.type() === "edge") {
        var newArgs = Object.clone(args);
        newArgs.edgeStencil = stencil;
        if (this.canConnect(newArgs)) {
          _edges.push(stencil);
        }
      }
    }).bind(this));

    return _edges;
  },

  /**
   *
   * @param {Object}
   *            args edgeStencil: ORYX.Core.StencilSet.Stencil | undefined
   *            edgeShape: ORYX.Core.Edge | undefined targetStencil:
   *            ORYX.Core.StencilSet.Stencil | undefined targetShape:
   *            ORYX.Core.Node | undefined
   *
   * At least edgeStencil or edgeShape has to be specified!!!
   *
   * @return {Array} Returns an array of stencils that can be source of the
   *         specified edge.
   */
  sourceStencils: function (args) {
    // check arguments
    if (!args ||
      !args.edgeShape && !args.edgeStencil) {
      return [];
    }

    // init arguments
    if (args.targetShape) {
      args.targetStencil = args.targetShape.getStencil();
    }

    if (args.edgeShape) {
      args.edgeStencil = args.edgeShape.getStencil();
    }

    var _sources = [];

    // check each stencil, if it can be a source
    this._stencils.each((function (stencil) {
      var newArgs = Object.clone(args);
      newArgs.sourceStencil = stencil;
      if (this.canConnect(newArgs)) {
        _sources.push(stencil);
      }
    }).bind(this));

    return _sources;
  },

  /**
   *
   * @param {Object}
   *            args edgeStencil: ORYX.Core.StencilSet.Stencil | undefined
   *            edgeShape: ORYX.Core.Edge | undefined sourceStencil:
   *            ORYX.Core.StencilSet.Stencil | undefined sourceShape:
   *            ORYX.Core.Node | undefined
   *
   * At least edgeStencil or edgeShape has to be specified!!!
   *
   * @return {Array} Returns an array of stencils that can be target of the
   *         specified edge.
   */
  targetStencils: function (args) {
    // check arguments
    if (!args ||
      !args.edgeShape && !args.edgeStencil) {
      return [];
    }

    // init arguments
    if (args.sourceShape) {
      args.sourceStencil = args.sourceShape.getStencil();
    }

    if (args.edgeShape) {
      args.edgeStencil = args.edgeShape.getStencil();
    }

    var _targets = [];

    // check stencil, if it can be a target
    this._stencils.each((function (stencil) {
      var newArgs = Object.clone(args);
      newArgs.targetStencil = stencil;
      if (this.canConnect(newArgs)) {
        _targets.push(stencil);
      }
    }).bind(this));

    return _targets;
  },

  /**
   *
   * @param {Object}
   *            args edgeStencil: ORYX.Core.StencilSet.Stencil edgeShape:
   *            ORYX.Core.Edge |undefined sourceStencil:
   *            ORYX.Core.StencilSet.Stencil | undefined sourceShape:
   *            ORYX.Core.Node |undefined targetStencil:
   *            ORYX.Core.StencilSet.Stencil | undefined targetShape:
   *            ORYX.Core.Node |undefined
   *
   * At least source or target has to be specified!!!
   *
   * @return {Boolean} Returns, if the edge can connect source and target.
   */
  canConnect: function (args) {
    // check arguments
    if (!args ||
      (!args.sourceShape && !args.sourceStencil &&
        !args.targetShape && !args.targetStencil) ||
      !args.edgeShape && !args.edgeStencil) {
      return false;
    }

    // init arguments
    if (args.sourceShape) {
      args.sourceStencil = args.sourceShape.getStencil();
    }
    if (args.targetShape) {
      args.targetStencil = args.targetShape.getStencil();
    }
    if (args.edgeShape) {
      args.edgeStencil = args.edgeShape.getStencil();
    }

    var result;

    if (args.sourceStencil && args.targetStencil) {
      var source = this._cachedConnectSET[args.sourceStencil.id()];

      if (!source)
        result = this._cacheConnect(args);
      else {
        var edge = source[args.edgeStencil.id()];

        if (!edge)
          result = this._cacheConnect(args);
        else {
          var target = edge[args.targetStencil.id()];

          if (target == undefined)
            result = this._cacheConnect(args);
          else
            result = target;
        }
      }
    } else if (args.sourceStencil) {
      var source = this._cachedConnectSE[args.sourceStencil.id()];

      if (!source)
        result = this._cacheConnect(args);
      else {
        var edge = source[args.edgeStencil.id()];

        if (edge == undefined)
          result = this._cacheConnect(args);
        else
          result = edge;
      }
    } else { // args.targetStencil
      var target = this._cachedConnectTE[args.targetStencil.id()];

      if (!target)
        result = this._cacheConnect(args);
      else {
        var edge = target[args.edgeStencil.id()];

        if (edge == undefined)
          result = this._cacheConnect(args);
        else
          result = edge;
      }
    }

    // check cardinality
    if (result) {
      if (args.sourceShape) {
        var source = this._cachedCardSE[args.sourceStencil.id()];

        if (!source) {
          this._cacheCard(args);
          source = this._cachedCardSE[args.sourceStencil.id()];
        }

        var max = source[args.edgeStencil.id()];

        if (max == undefined) {
          this._cacheCard(args);
        }

        max = source[args.edgeStencil.id()];

        if (max != -1) {
          result = args.sourceShape.getOutgoingShapes().all(function (cs) {
            if ((cs.getStencil().id() === args.edgeStencil.id()) &&
              ((args.edgeShape) ? cs !== args.edgeShape : true)) {
              max--;
              return (max > 0) ? true : false;
            } else {
              return true;
            }
          });
        }
      }

      if (args.targetShape) {
        var target = this._cachedCardTE[args.targetStencil.id()];

        if (!target) {
          this._cacheCard(args);
          target = this._cachedCardTE[args.targetStencil.id()];
        }

        var max = target[args.edgeStencil.id()];

        if (max == undefined) {
          this._cacheCard(args);
        }

        max = target[args.edgeStencil.id()];

        if (max != -1) {
          result = args.targetShape.getIncomingShapes().all(function (cs) {
            if ((cs.getStencil().id() === args.edgeStencil.id()) &&
              ((args.edgeShape) ? cs !== args.edgeShape : true)) {
              max--;
              return (max > 0) ? true : false;
            }
            else {
              return true;
            }
          });
        }
      }
    }

    return result;
  },

  /**
   *
   * @param {Object}
   *            args edgeStencil: ORYX.Core.StencilSet.Stencil edgeShape:
   *            ORYX.Core.Edge |undefined sourceStencil:
   *            ORYX.Core.StencilSet.Stencil | undefined sourceShape:
   *            ORYX.Core.Node |undefined targetStencil:
   *            ORYX.Core.StencilSet.Stencil | undefined targetShape:
   *            ORYX.Core.Node |undefined
   *
   * At least source or target has to be specified!!!
   *
   * @return {Boolean} Returns, if the edge can connect source and target.
   */
  _canConnect: function (args) {
    // check arguments
    if (!args ||
      (!args.sourceShape && !args.sourceStencil &&
        !args.targetShape && !args.targetStencil) ||
      !args.edgeShape && !args.edgeStencil) {
      return false;
    }

    // init arguments
    if (args.sourceShape) {
      args.sourceStencil = args.sourceShape.getStencil();
    }
    if (args.targetShape) {
      args.targetStencil = args.targetShape.getStencil();
    }
    if (args.edgeShape) {
      args.edgeStencil = args.edgeShape.getStencil();
    }

    // 1. check connection rules
    var resultCR;

    // get all connection rules for this edge
    var edgeRules = this._getConnectionRulesOfEdgeStencil(args.edgeStencil);

    // check connection rules, if the source can be connected to the target
    // with the specified edge.
    if (edgeRules.keys().length === 0) {
      resultCR = false;
    } else {
      if (args.sourceStencil) {
        resultCR = args.sourceStencil.roles().any(function (sourceRole) {
          var targetRoles = edgeRules.get(sourceRole);

          if (!targetRoles) {
            return false;
          }

          if (args.targetStencil) {
            return (targetRoles.any(function (targetRole) {
              return args.targetStencil.roles().member(targetRole);
            }));
          } else {
            return true;
          }
        });
      } else { // !args.sourceStencil -> there is args.targetStencil
        resultCR = edgeRules.values().any(function (targetRoles) {
          return args.targetStencil.roles().any(function (targetRole) {
            return targetRoles.member(targetRole);
          });
        });
      }
    }

    return resultCR;
  },

  /** End connection rules' methods */


  /** Begin containment rules' methods */

  isContainer: function (shape) {
    return this._containerStencils.member(shape.getStencil().id());
  },

  /**
   *
   * @param {Object}
   *            args containingStencil: ORYX.Core.StencilSet.Stencil
   *            containingShape: ORYX.Core.AbstractShape containedStencil:
   *            ORYX.Core.StencilSet.Stencil containedShape: ORYX.Core.Shape
   */
  canContain: function (args) {
    if (!args ||
      !args.containingStencil && !args.containingShape ||
      !args.containedStencil && !args.containedShape) {
      return false;
    }

    // init arguments
    if (args.containedShape) {
      args.containedStencil = args.containedShape.getStencil();
    }

    if (args.containingShape) {
      args.containingStencil = args.containingShape.getStencil();
    }

    //if(args.containingStencil.type() == 'edge' || args.containedStencil.type() == 'edge')
    //	return false;
    if (args.containedStencil.type() == 'edge')
      return false;

    var childValues;

    var parent = this._cachedContainPC[args.containingStencil.id()];

    if (!parent)
      childValues = this._cacheContain(args);
    else {
      childValues = parent[args.containedStencil.id()];

      if (!childValues)
        childValues = this._cacheContain(args);
    }

    if (!childValues[0])
      return false;
    else if (childValues[1] == -1)
      return true;
    else {
      if (args.containingShape) {
        var max = childValues[1];
        return args.containingShape.getChildShapes(false).all(function (as) {
          if (as.getStencil().id() === args.containedStencil.id()) {
            max--;
            return (max > 0) ? true : false;
          } else {
            return true;
          }
        });
      } else {
        return true;
      }
    }
  },

  /**
   *
   * @param {Object}
   *            args containingStencil: ORYX.Core.StencilSet.Stencil
   *            containingShape: ORYX.Core.AbstractShape containedStencil:
   *            ORYX.Core.StencilSet.Stencil containedShape: ORYX.Core.Shape
   */
  _canContain: function (args) {
    if (!args ||
      !args.containingStencil && !args.containingShape ||
      !args.containedStencil && !args.containedShape) {
      return false;
    }

    // init arguments
    if (args.containedShape) {
      args.containedStencil = args.containedShape.getStencil();
    }

    if (args.containingShape) {
      args.containingStencil = args.containingShape.getStencil();
    }

//		if(args.containingShape) {
//			if(args.containingShape instanceof ORYX.Core.Edge) {
//				// edges cannot contain other shapes
//				return false;
//			}
//		}


    var result;

    // check containment rules
    result = args.containingStencil.roles().any((function (role) {
      var roles = this._containmentRules.get(role);
      if (roles) {
        return roles.any(function (role) {
          return args.containedStencil.roles().member(role);
        });
      } else {
        return false;
      }
    }).bind(this));

    return result;
  },

  /** End containment rules' methods */


  /** Begin morphing rules' methods */

  /**
   *
   * @param {Object}
   *           args
   *            stencil: ORYX.Core.StencilSet.Stencil | undefined
   *            shape: ORYX.Core.Shape | undefined
   *
   * At least stencil or shape has to be specified
   *
   * @return {Array} Array of stencils that the passed stencil/shape can be
   *         transformed to (including the current stencil itself)
   */
  morphStencils: function (args) {
    // check arguments
    if (!args.stencil && !args.shape) {
      return [];
    }

    // init arguments
    if (args.shape) {
      args.stencil = args.shape.getStencil();
    }

    var _morphStencils = [];
    args.stencil.roles().each(function (role) {
      this._cacheMorph(role).each(function (stencil) {
        _morphStencils.push(stencil);
      })
    }.bind(this));


    var baseMorphs = this.baseMorphs();
    // BaseMorphs should be in the front of the array
    _morphStencils = _morphStencils.uniq().sort(function (a, b) {
      return baseMorphs.include(a) && !baseMorphs.include(b) ? -1 : (baseMorphs.include(b) && !baseMorphs.include(a) ? 1 : 0)
    })
    return _morphStencils;
  },

  /**
   * @return {Array} An array of all base morph stencils
   */
  baseMorphs: function () {
    var _baseMorphs = [];
    this._morphingRules.each(function (pair) {
      pair.value.each(function (baseMorph) {
        _baseMorphs.push(baseMorph);
      });
    });
    return _baseMorphs;
  },

  /**
   * Returns true if there are morphing rules defines
   * @return {boolean}
   */
  containsMorphingRules: function () {
    return this._stencilSets.any(function (ss) {
      return !!ss.jsonRules().morphingRules
    });
  },

  /**
   *
   * @param {Object}
   *            args
   *            sourceStencil:
   *            ORYX.Core.StencilSet.Stencil | undefined
   *            sourceShape:
   *            ORYX.Core.Node |undefined
   *            targetStencil:
   *            ORYX.Core.StencilSet.Stencil | undefined
   *            targetShape:
   *            ORYX.Core.Node |undefined
   *
   *
   * @return {Stencil} Returns, the stencil for the connecting edge
   * or null if connection is not possible
   */
  connectMorph: function (args) {
    // check arguments
    if (!args ||
      (!args.sourceShape && !args.sourceStencil &&
        !args.targetShape && !args.targetStencil)) {
      return false;
    }

    // init arguments
    if (args.sourceShape) {
      args.sourceStencil = args.sourceShape.getStencil();
    }
    if (args.targetShape) {
      args.targetStencil = args.targetShape.getStencil();
    }

    var incoming = this.incomingEdgeStencils(args);
    var outgoing = this.outgoingEdgeStencils(args);

    var edgeStencils = incoming.select(function (e) {
      return outgoing.member(e);
    }); // intersection of sets
    var baseEdgeStencils = this.baseMorphs().select(function (e) {
      return edgeStencils.member(e);
    }); // again: intersection of sets

    if (baseEdgeStencils.size() > 0)
      return baseEdgeStencils[0]; // return any of the possible base morphs
    else if (edgeStencils.size() > 0)
      return edgeStencils[0];	// return any of the possible stencils

    return null; //connection not possible
  },

  /**
   * Return true if the stencil should be located in the shape menu
   * @param {ORYX.Core.StencilSet.Stencil} morph
   * @return {Boolean} Returns true if the morphs in the morph group of the
   * specified morph shall be displayed in the shape menu
   */
  showInShapeMenu: function (stencil) {
    return this._stencilSets.any(function (ss) {
      return ss.jsonRules().morphingRules
        .any(function (r) {
          return stencil.roles().include(ss.namespace() + r.role)
            && r.showInShapeMenu !== false;
        })
    });
  },

  preserveBounds: function (stencil) {
    return this._stencilSets.any(function (ss) {
      return ss.jsonRules().morphingRules.any(function (r) {


        return stencil.roles().include(ss.namespace() + r.role)
          && r.preserveBounds;
      })
    })
  },

  /** End morphing rules' methods */


  /** Begin layouting rules' methods */

  /**
   * Returns a set on "in" and "out" layouting rules for a given shape
   * @param {Object} shape
   * @param {Object} edgeShape (Optional)
   * @return {Object} "in" and "out" with a default value of {"t":1, "r":1, "b":1, "r":1} if not specified in the json
   */
  getLayoutingRules: function (shape, edgeShape) {

    if (!shape || !(shape instanceof ORYX.Core.Shape)) {
      return
    }

    var layout = {"in": {}, "out": {}};

    var parseValues = function (o, v) {
      if (o && o[v]) {
        ["t", "r", "b", "l"].each(function (d) {
          layout[v][d] = Math.max(o[v][d], layout[v][d] || 0);
        });
      }
      if (o && o[v + "s"] instanceof Array) {
        ["t", "r", "b", "l"].each(function (d) {
          var defaultRule = o[v + "s"].find(function (e) {
            return !e.edgeRole
          });
          var edgeRule;
          if (edgeShape instanceof ORYX.Core.Edge) {
            edgeRule = o[v + "s"].find(function (e) {
              return this._hasRole(edgeShape, e.edgeRole)
            }.bind(this));
          }
          layout[v][d] = Math.max(edgeRule ? edgeRule[d] : defaultRule[d], layout[v][d] || 0);
        }.bind(this));
      }
    }.bind(this)

    // For each role
    shape.getStencil().roles().each(function (role) {
      // check if there are layout information
      if (this._layoutRules[role]) {
        // if so, parse those information to the 'layout' variable
        parseValues(this._layoutRules[role], "in");
        parseValues(this._layoutRules[role], "out");
      }
    }.bind(this));

    // Make sure, that every attribute has an value,
    // otherwise set 1
    ["in", "out"].each(function (v) {
      ["t", "r", "b", "l"].each(function (d) {
        layout[v][d] = layout[v][d] !== undefined ? layout[v][d] : 1;
      });
    })

    return layout;
  },

  /** End layouting rules' methods */

  /** Helper methods */

  /**
   * Checks wether a shape contains the given role or the role is equal the stencil id
   * @param {ORYX.Core.Shape} shape
   * @param {String} role
   */
  _hasRole: function (shape, role) {
    if (!(shape instanceof ORYX.Core.Shape) || !role) {
      return
    }
    var isRole = shape.getStencil().roles().any(function (r) {
      return r == role
    });

    return isRole || shape.getStencil().id() == (shape.getStencil().namespace() + role);
  },

  /**
   *
   * @param {String}
   *            role
   *
   * @return {Array} Returns an array of stencils that can act as role.
   */
  _stencilsWithRole: function (role) {
    return this._stencils.findAll(function (stencil) {
      return (stencil.roles().member(role)) ? true : false;
    });
  },

  /**
   *
   * @param {String}
   *            role
   *
   * @return {Array} Returns an array of stencils that can act as role and
   *         have the type 'edge'.
   */
  _edgesWithRole: function (role) {
    return this._stencils.findAll(function (stencil) {
      return (stencil.roles().member(role) && stencil.type() === "edge") ? true : false;
    });
  },

  /**
   *
   * @param {String}
   *            role
   *
   * @return {Array} Returns an array of stencils that can act as role and
   *         have the type 'node'.
   */
  _nodesWithRole: function (role) {
    return this._stencils.findAll(function (stencil) {
      return (stencil.roles().member(role) && stencil.type() === "node") ? true : false;
    });
  },

  /**
   *
   * @param {ORYX.Core.StencilSet.Stencil}
   *            parent
   * @param {ORYX.Core.StencilSet.Stencil}
   *            child
   *
   * @returns {Boolean} Returns the maximum occurrence of shapes of the
   *          stencil's type inside the parent.
   */
  _getMaximumOccurrence: function (parent, child) {
    var max;
    child.roles().each((function (role) {
      var cardRule = this._cardinalityRules.get(role);
      if (cardRule && cardRule.maximumOccurrence) {
        if (max) {
          max = Math.min(max, cardRule.maximumOccurrence);
        } else {
          max = cardRule.maximumOccurrence;
        }
      }
    }).bind(this));

    return max;
  },


  /**
   *
   * @param {Object}
   *            args sourceStencil: ORYX.Core.Node edgeStencil:
   *            ORYX.Core.StencilSet.Stencil
   *
   * @return {Boolean} Returns, the maximum number of outgoing edges of the
   *         type specified by edgeStencil of the sourceShape.
   */
  _getMaximumNumberOfOutgoingEdge: function (args) {
    if (!args ||
      !args.sourceStencil ||
      !args.edgeStencil) {
      return false;
    }

    var max;
    args.sourceStencil.roles().each((function (role) {
      var cardRule = this._cardinalityRules.get(role);

      if (cardRule && cardRule.outgoingEdges) {
        args.edgeStencil.roles().each(function (edgeRole) {
          var oe = cardRule.outgoingEdges[edgeRole];

          if (oe && oe.maximum) {
            if (max) {
              max = Math.min(max, oe.maximum);
            } else {
              max = oe.maximum;
            }
          }
        });
      }
    }).bind(this));

    return max;
  },

  /**
   *
   * @param {Object}
   *            args targetStencil: ORYX.Core.StencilSet.Stencil edgeStencil:
   *            ORYX.Core.StencilSet.Stencil
   *
   * @return {Boolean} Returns the maximum number of incoming edges of the
   *         type specified by edgeStencil of the targetShape.
   */
  _getMaximumNumberOfIncomingEdge: function (args) {
    if (!args ||
      !args.targetStencil ||
      !args.edgeStencil) {
      return false;
    }

    var max;
    args.targetStencil.roles().each((function (role) {
      var cardRule = this._cardinalityRules[role];
      if (cardRule && cardRule.incomingEdges) {
        args.edgeStencil.roles().each(function (edgeRole) {
          var ie = cardRule.incomingEdges[edgeRole];
          if (ie && ie.maximum) {
            if (max) {
              max = Math.min(max, ie.maximum);
            } else {
              max = ie.maximum;
            }
          }
        });
      }
    }).bind(this));

    return max;
  },

  /**
   *
   * @param {ORYX.Core.StencilSet.Stencil}
   *            edgeStencil
   *
   * @return {Hash} Returns a hash map of all connection rules for
   *         edgeStencil.
   */
  _getConnectionRulesOfEdgeStencil: function (edgeStencil) {
    var edgeRules = new Hash();
    edgeStencil.roles().each((function (role) {
      if (this._connectionRules.get(role)) {
        this._connectionRules.get(role).each(function (cr) {
          if (edgeRules.get(cr.key)) {
            edgeRules.set(cr.key, edgeRules.get([cr.key]).concat(cr.value));
          } else {
            edgeRules.set(cr.key, cr.value);
          }
        });
      }
    }).bind(this));

    return edgeRules;
  },

  _isRoleOfOtherNamespace: function (role) {
    return (role.indexOf("#") > 0);
  },

  toString: function () {
    return "Rules";
  }
}
ORYX.Core.StencilSet.Rules = Clazz.extend(ORYX.Core.StencilSet.Rules);

/**
 * This class represents a stencil set. It offers methods for accessing
 *  the attributes of the stencil set description JSON file and the stencil set's
 *  stencils.
 */
ORYX.Core.StencilSet.StencilSet = Clazz.extend({
  /**
   * Constructor
   * @param source {URL} A reference to the stencil set specification.
   *
   */
  construct: function (baseUrl, data) {

    this._extensions = new Hash();

    this._baseUrl = baseUrl;
    this._jsonObject = {};

    this._stencils = new Hash();
    this._availableStencils = new Hash();
    this._init(data);
  },

  /**
   * Finds a root stencil in this stencil set. There may be many of these. If
   * there are, the first one found will be used. In Firefox, this is the
   * topmost definition in the stencil set description file.
   */
  findRootStencilName: function () {

    // find any stencil that may be root.
    var rootStencil = this._stencils.values().find(function (stencil) {
      return stencil._jsonStencil.mayBeRoot
    });

    // if there is none, just guess the first.
    if (!rootStencil) {
      ORYX.Log.warn("Did not find any stencil that may be root. Taking a guess.");
      rootStencil = this._stencils.values()[0];
    }

    // return its id.
    return rootStencil.id();
  },

  /**
   * @param {ORYX.Core.StencilSet.StencilSet} stencilSet
   * @return {Boolean} True, if stencil set has the same namespace.
   */
  equals: function (stencilSet) {
    return (this.namespace() === stencilSet.namespace());
  },

  /**
   *
   * @param {Oryx.Core.StencilSet.Stencil} rootStencil If rootStencil is defined, it only returns stencils
   *      that could be (in)direct child of that stencil.
   */
  stencils: function (rootStencil, rules, sortByGroup) {
    if (rootStencil && rules) {
      var stencils = this._availableStencils.values();
      var containers = [rootStencil];
      var checkedContainers = [];

      var result = [];

      while (containers.size() > 0) {
        var container = containers.pop();
        checkedContainers.push(container);
        var children = stencils.findAll(function (stencil) {
          var args = {
            containingStencil: container,
            containedStencil: stencil
          };
          return rules.canContain(args);
        });
        for (var i = 0; i < children.size(); i++) {
          if (!checkedContainers.member(children[i])) {
            containers.push(children[i]);
          }
        }
        result = result.concat(children).uniq();
      }

      // Sort the result to the origin order
      result = result.sortBy(function (stencil) {
        return stencils.indexOf(stencil);
      });


      if (sortByGroup) {
        result = result.sortBy(function (stencil) {
          return stencil.groups().first();
        });
      }

      var edges = stencils.findAll(function (stencil) {
        return stencil.type() == "edge";
      });
      result = result.concat(edges);

      return result;

    } else {
      if (sortByGroup) {
        return this._availableStencils.values().sortBy(function (stencil) {
          return stencil.groups().first();
        });
      } else {
        return this._availableStencils.values();
      }
    }
  },

  nodes: function () {
    return this._availableStencils.values().findAll(function (stencil) {
      return (stencil.type() === 'node')
    });
  },

  edges: function () {
    return this._availableStencils.values().findAll(function (stencil) {
      return (stencil.type() === 'edge')
    });
  },

  stencil: function (id) {
    return this._stencils.get(id);
  },

  title: function () {
    return ORYX.Core.StencilSet.getTranslation(this._jsonObject, "title");
  },

  description: function () {
    return ORYX.Core.StencilSet.getTranslation(this._jsonObject, "description");
  },

  namespace: function () {
    return this._jsonObject ? this._jsonObject.namespace : null;
  },

  jsonRules: function () {
    return this._jsonObject ? this._jsonObject.rules : null;
  },

  source: function () {
    return this._source;
  },

  extensions: function () {
    return this._extensions;
  },

  addExtension: function (url) {

    new Ajax.Request(url, {
      method: 'GET',
      asynchronous: false,
      onSuccess: (function (transport) {
        this.addExtensionDirectly(transport.responseText);
      }).bind(this),
      onFailure: (function (transport) {
        ORYX.Log.debug("Loading stencil set extension file failed. The request returned an error." + transport);
      }).bind(this),
      onException: (function (transport) {
        ORYX.Log.debug("Loading stencil set extension file failed. The request returned an error." + transport);
      }).bind(this)

    });
  },

  addExtensionDirectly: function (str) {

    try {
      eval("var jsonExtension = " + str);

      if (!(jsonExtension["extends"].endsWith("#")))
        jsonExtension["extends"] += "#";

      if (jsonExtension["extends"] == this.namespace()) {
        this._extensions.set(jsonExtension.namespace, jsonExtension);

        var defaultPosition = this._stencils.keys().size();
        //load new stencils
        if (jsonExtension.stencils) {
          $A(jsonExtension.stencils).each(function (stencil) {
            defaultPosition++;
            var oStencil = new ORYX.Core.StencilSet.Stencil(stencil, this.namespace(), this._baseUrl, this, undefined, defaultPosition);
            this._stencils.set(oStencil.id(), oStencil);
            this._availableStencils.set(oStencil.id(), oStencil);
          }.bind(this));
        }

        //load additional properties
        if (jsonExtension.properties) {
          var stencils = this._stencils.values();

          stencils.each(function (stencil) {
            var roles = stencil.roles();

            jsonExtension.properties.each(function (prop) {
              prop.roles.any(function (role) {
                role = jsonExtension["extends"] + role;
                if (roles.member(role)) {
                  prop.properties.each(function (property) {
                    stencil.addProperty(property, jsonExtension.namespace);
                  });

                  return true;
                }
                else
                  return false;
              })
            })
          }.bind(this));
        }

        //remove stencil properties
        if (jsonExtension.removeproperties) {
          jsonExtension.removeproperties.each(function (remprop) {
            var stencil = this.stencil(jsonExtension["extends"] + remprop.stencil);
            if (stencil) {
              remprop.properties.each(function (propId) {
                stencil.removeProperty(propId);
              });
            }
          }.bind(this));
        }

        //remove stencils
        if (jsonExtension.removestencils) {
          $A(jsonExtension.removestencils).each(function (remstencil) {
            delete this._availableStencils[jsonExtension["extends"] + remstencil];
          }.bind(this));
        }
      }
    } catch (e) {
      ORYX.Log.debug("StencilSet.addExtension: Something went wrong when initialising the stencil set extension. " + e);
    }
  },

  removeExtension: function (namespace) {
    var jsonExtension = this._extensions[namespace];
    if (jsonExtension) {

      //unload extension's stencils
      if (jsonExtension.stencils) {
        $A(jsonExtension.stencils).each(function (stencil) {
          var oStencil = new ORYX.Core.StencilSet.Stencil(stencil, this.namespace(), this._baseUrl, this);
          this._stencils.unset(oStencil.id());
          this._availableStencils.unset(oStencil.id());
        }.bind(this));
      }

      //unload extension's properties
      if (jsonExtension.properties) {
        var stencils = this._stencils.values();

        stencils.each(function (stencil) {
          var roles = stencil.roles();

          jsonExtension.properties.each(function (prop) {
            prop.roles.any(function (role) {
              role = jsonExtension["extends"] + role;
              if (roles.member(role)) {
                prop.properties.each(function (property) {
                  stencil.removeProperty(property.id);
                });

                return true;
              }
              else
                return false;
            })
          })
        }.bind(this));
      }

      //restore removed stencil properties
      if (jsonExtension.removeproperties) {
        jsonExtension.removeproperties.each(function (remprop) {
          var stencil = this.stencil(jsonExtension["extends"] + remprop.stencil);
          if (stencil) {
            var stencilJson = $A(this._jsonObject.stencils).find(function (s) {
              return s.id == stencil.id()
            });
            remprop.properties.each(function (propId) {
              var propertyJson = $A(stencilJson.properties).find(function (p) {
                return p.id == propId
              });
              stencil.addProperty(propertyJson, this.namespace());
            }.bind(this));
          }
        }.bind(this));
      }

      //restore removed stencils
      if (jsonExtension.removestencils) {
        $A(jsonExtension.removestencils).each(function (remstencil) {
          var sId = jsonExtension["extends"] + remstencil;
          this._availableStencils.set(sId, this._stencils.get(sId));
        }.bind(this));
      }
    }
    delete this._extensions[namespace];
  },

  __handleStencilset: function (response) {

    this._jsonObject = response;

    // assert it was parsed.
    if (!this._jsonObject) {
      throw "Error evaluating stencilset. It may be corrupt.";
    }

    with (this._jsonObject) {

      // assert there is a namespace.
      if (!namespace || namespace === "")
        throw "Namespace definition missing in stencilset.";

      if (!(stencils instanceof Array))
        throw "Stencilset corrupt.";

      // assert namespace ends with '#'.
      if (!namespace.endsWith("#"))
        namespace = namespace + "#";

      // assert title and description are strings.
      if (!title)
        title = "";
      if (!description)
        description = "";
    }
  },

  /**
   * This method is called when the HTTP request to get the requested stencil
   * set succeeds. The response is supposed to be a JSON representation
   * according to the stencil set specification.
   * @param {Object} response The JSON representation according to the
   *      stencil set specification.
   */
  _init: function (response) {

    // init and check consistency.
    this.__handleStencilset(response);

    var pps = new Hash();

    // init property packages
    if (this._jsonObject.propertyPackages) {
      $A(this._jsonObject.propertyPackages).each((function (pp) {
        pps.set(pp.name, pp.properties);
      }).bind(this));
    }

    var defaultPosition = 0;

    // init each stencil
    $A(this._jsonObject.stencils).each((function (stencil) {
      defaultPosition++;

      // instantiate normally.
      var oStencil = new ORYX.Core.StencilSet.Stencil(stencil, this.namespace(), this._baseUrl, this, pps, defaultPosition);
      this._stencils.set(oStencil.id(), oStencil);
      this._availableStencils.set(oStencil.id(), oStencil);

    }).bind(this));
  },

  _cancelInit: function (response) {
    this.errornous = true;
  },

  toString: function () {
    return "StencilSet " + this.title() + " (" + this.namespace() + ")";
  }
});


/**
 * Class StencilSets
 * uses Prototpye 1.5.0
 * uses Inheritance
 *
 * Singleton
 */
//storage for loaded stencil sets by namespace
ORYX.Core.StencilSet._stencilSetsByNamespace = new Hash();

//storage for stencil sets by url
ORYX.Core.StencilSet._stencilSetsByUrl = new Hash();

//storage for stencil set namespaces by editor instances
ORYX.Core.StencilSet._StencilSetNSByEditorInstance = new Hash();

//storage for rules by editor instances
ORYX.Core.StencilSet._rulesByEditorInstance = new Hash();

/**
 *
 * @param {String} editorId
 *
 * @return {Hash} Returns a hash map with all stencil sets that are loaded by
 *          the editor with the editorId.
 */
ORYX.Core.StencilSet.stencilSets = function (editorId) {
  var stencilSetNSs = ORYX.Core.StencilSet._StencilSetNSByEditorInstance.get(editorId);

  var stencilSets = new Hash();
  if (stencilSetNSs) {
    stencilSetNSs.each(function (stencilSetNS) {
      var stencilSet = ORYX.Core.StencilSet.stencilSet(stencilSetNS)
      stencilSets.set(stencilSet.namespace(), stencilSet);
    });
  }
  return stencilSets;
};

/**
 *
 * @param {String} namespace
 *
 * @return {ORYX.Core.StencilSet.StencilSet} Returns the stencil set with the specified
 *                    namespace.
 *
 * The method can handle namespace strings like
 *  http://www.example.org/stencilset
 *  http://www.example.org/stencilset#
 *  http://www.example.org/stencilset#ANode
 */
ORYX.Core.StencilSet.stencilSet = function (namespace) {
  ORYX.Log.trace("Getting stencil set %0", namespace);
  var splitted = namespace.split("#", 1);
  if (splitted.length === 1) {
    ORYX.Log.trace("Getting stencil set %0", splitted[0]);
    return ORYX.Core.StencilSet._stencilSetsByNamespace.get(splitted[0] + "#");
  } else {
    return undefined;
  }
};

/**
 *
 * @param {String} id
 *
 * @return {ORYX.Core.StencilSet.Stencil} Returns the stencil specified by the id.
 *
 * The id must be unique and contains the namespace of the stencil's stencil set.
 * e.g. http://www.example.org/stencilset#ANode
 */
ORYX.Core.StencilSet.stencil = function (id) {
  ORYX.Log.trace("Getting stencil for %0", id);
  var ss = ORYX.Core.StencilSet.stencilSet(id);
  if (ss) {
    return ss.stencil(id);
  } else {

    ORYX.Log.trace("Cannot fild stencil for %0", id);
    return undefined;
  }
};

/**
 *
 * @param {String} editorId
 *
 * @return {ORYX.Core.StencilSet.Rules} Returns the rules object for the editor
 *                  specified by its editor id.
 */
ORYX.Core.StencilSet.rules = function (editorId) {
  if (!ORYX.Core.StencilSet._rulesByEditorInstance.get(editorId)) {
    ORYX.Core.StencilSet._rulesByEditorInstance.set(editorId, new ORYX.Core.StencilSet.Rules());
  }
  return ORYX.Core.StencilSet._rulesByEditorInstance.get(editorId);
};

/**
 *
 * @param {String} url
 * @param {String} editorId
 *
 * Loads a stencil set from url, if it is not already loaded.
 * It also stores which editor instance loads the stencil set and
 * initializes the Rules object for the editor instance.
 */
ORYX.Core.StencilSet.loadStencilSet = function (url, stencilSet, editorId) {

  //store stencil set
  ORYX.Core.StencilSet._stencilSetsByNamespace.set(stencilSet.namespace(), stencilSet);

  //store stencil set by url
  ORYX.Core.StencilSet._stencilSetsByUrl.set(url, stencilSet);

  var namespace = stencilSet.namespace();

  //store which editorInstance loads the stencil set
  if (ORYX.Core.StencilSet._StencilSetNSByEditorInstance.get(editorId)) {
    ORYX.Core.StencilSet._StencilSetNSByEditorInstance.get(editorId).push(namespace);
  } else {
    ORYX.Core.StencilSet._StencilSetNSByEditorInstance.set(editorId, [namespace]);
  }

  //store the rules for the editor instance
  if (ORYX.Core.StencilSet._rulesByEditorInstance.get(editorId)) {
    ORYX.Core.StencilSet._rulesByEditorInstance.get(editorId).initializeRules(stencilSet);
  } else {
    var rules = new ORYX.Core.StencilSet.Rules();
    rules.initializeRules(stencilSet);
    ORYX.Core.StencilSet._rulesByEditorInstance.set(editorId, rules);
  }
};

/**
 * Returns the translation of an attribute in jsonObject specified by its name
 * according to navigator.language
 */
ORYX.Core.StencilSet.getTranslation = function (jsonObject, name) {
  var lang = ORYX.I18N.Language.toLowerCase();

  var result = jsonObject[name + "_" + lang];

  if (result)
    return result;

  result = jsonObject[name + "_" + lang.substr(0, 2)];

  if (result)
    return result;

  return jsonObject[name];
};
