/**
 * Copyright (c) 2006
 *
 * Philipp Berger, Martin Czuchra, Gero Decker, Ole Eckermann, Lutz Gericke,
 * Alexander Hold, Alexander Koglin, Oliver Kopp, Stefan Krumnow,
 * Matthias Kunze, Philipp Maschke, Falko Menge, Christoph Neijenhuis,
 * Hagen Overdick, Zhen Peng, Nicolas Peters, Kerstin Pfitzner, Daniel Polak,
 * Steffen Ryll, Kai Schlichting, Jan-Felix Schwarz, Daniel Taschik,
 * Willi Tscheschner, Björn Wagner, Sven Wagner-Boysen, Matthias Weidlich
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 **/

/**
 * @namespace Oryx name space for different utility methods
 * @name ORYX.Utils
 */

if (!ORYX) var ORYX = {};

ORYX.Utils = {
  /**
   * General helper method for parsing a param out of current location url
   * 获取当前url上的参数
   * @example
   * // Current url in Browser => "http://oryx.org?param=value"
   * ORYX.Utils.getParamFromUrl("param") // => "value"
   * @param {Object} name
   */
  getParamFromUrl: function (name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) {
      return null;
    }
    else {
      return results[1];
    }
  },

  adjustLightness: function () {
    return arguments[0];
  },

  adjustGradient: function (gradient, reference) {

    if (ORYX.CONFIG.DISABLE_GRADIENT && gradient) {

      var col = reference.getAttributeNS(null, "stop-color") || "#ffffff";

      $A(gradient.getElementsByTagName("stop")).each(function (stop) {
        if (stop == reference) {
          return;
        }
        stop.setAttributeNS(null, "stop-color", col);
      });
    }
  }
}

XMLNS = {
  ATOM: "http://www.w3.org/2005/Atom",
  XHTML: "http://www.w3.org/1999/xhtml",
  ERDF: "http://purl.org/NET/erdf/profile",
  RDFS: "http://www.w3.org/2000/01/rdf-schema#",
  RDF: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  RAZIEL: "http://b3mn.org/Raziel",

  SCHEMA: ""
};

//TODO kann kickstart sich vielleicht auch um die erzeugung von paketen/
// namespaces k�mmern? z.b. requireNamespace("ORYX.Core.SVG");
var Kickstart = {
  started: false,
  callbacks: [],
  alreadyLoaded: [],
  PATH: '',

  load: function () {
    Kickstart.kick();
  },

  kick: function () {
    //console.profile("loading");
    if (!Kickstart.started) {
      Kickstart.started = true;
      Kickstart.callbacks.each(function (callback) {
        // call the registered callback asynchronously.
        window.setTimeout(callback, 1);
      });
    }
  },

  register: function (callback) {
    //TODO Add some mutual exclusion between kick and register calls.
    with (Kickstart) {
      if (started) window.setTimeout(callback, 1);
      else Kickstart.callbacks.push(callback)
    }
  },

  /**
   * Loads a js, assuring that it has only been downloaded once.
   * 加载JS，确保只下载一次
   * @param {String} url the script to load.
   */
  require: function (url) {
    // if not already loaded, include it.
    if (Kickstart.alreadyLoaded.member(url))
      return false;
    return Kickstart.include(url);
  },

  /**
   * Loads a js, regardless of whether it has only been already downloaded.
   * 加载JS，不管它是否已经下载。
   * @param {String} url the script to load.
   */
  include: function (url) {
    // prepare a script tag and place it in html head.
    var head = document.getElementsByTagNameNS(XMLNS.XHTML, 'head')[0];
    var s = document.createElementNS(XMLNS.XHTML, "script");
    s.setAttributeNS(XMLNS.XHTML, 'type', 'text/javascript');
    s.src = Kickstart.PATH + url;

    //TODO macht es sinn, dass neue skript als letztes kind in den head
    // einzubinden (stichwort reihenfolge der skript tags)?
    head.appendChild(s);

    // remember this url.
    Kickstart.alreadyLoaded.push(url);

    return true;
  }
}

// register kickstart as the new onload event listener on current window.
// 在当前窗口上将kickstart注册为新的onload事件侦听器。
// previous listener(s) are triggered to launch with kickstart.
Event.observe(window, 'load', Kickstart.load);

var ERDF = {
  LITERAL: 0x01,
  RESOURCE: 0x02,
  DELIMITERS: ['.', '-'],
  HASH: '#',
  HYPHEN: "-",

  schemas: [],
  callback: undefined,
  log: undefined,

  init: function (callback) {

    // init logging.
    //ERDF.log = Log4js.getLogger("oryx");
    //ERDF.log.setLevel(Log4js.Level.ALL);
    //ERDF.log.addAppender(new ConsoleAppender(ERDF.log, false));

    //if(ERDF.log.isTraceEnabled())
    //	ERDF.log.trace("ERDF Parser is initialized.");

    // register callbacks and default schemas.
    ERDF.callback = callback;
    ERDF.registerSchema('schema', XMLNS.SCHEMA);
    ERDF.registerSchema('rdfs', XMLNS.RDFS);
  },

  run: function () {
    //if(ERDF.log.isTraceEnabled())
    //	ERDF.log.trace("ERDF Parser is running.");

    // do the work.
    return ERDF._checkProfile() && ERDF.parse();
  },

  parse: function () {
    //(ERDF.log.isDebugEnabled())
    //	ERDF.log.debug("Begin parsing document metadata.");

    // time measuring
    ERDF.__startTime = new Date();

    var bodies = document.getElementsByTagNameNS(XMLNS.XHTML, 'body');
    var subject = {type: ERDF.RESOURCE, value: ''};

    var result = ERDF._parseDocumentMetadata() &&
      ERDF._parseFromTag(bodies[0], subject);

    // time measuring
    ERDF.__stopTime = new Date();

    var duration = (ERDF.__stopTime - ERDF.__startTime) / 1000.;
    //alert('ERDF parsing took ' + duration + ' s.');

    return result;
  },

  _parseDocumentMetadata: function () {

    // get links from head element.
    var heads = document.getElementsByTagNameNS(XMLNS.XHTML, 'head');
    var links = heads[0].getElementsByTagNameNS(XMLNS.XHTML, 'link');
    var metas = heads[0].getElementsByTagNameNS(XMLNS.XHTML, 'meta');

    // process links first, since they could contain schema definitions.
    $A(links).each(function (link) {
      var properties = link.getAttribute('rel');
      var reversedProperties = link.getAttribute('rev');
      var value = link.getAttribute('href');

      ERDF._parseTriplesFrom(
        ERDF.RESOURCE, '',
        properties,
        ERDF.RESOURCE, value);

      ERDF._parseTriplesFrom(
        ERDF.RESOURCE, value,
        reversedProperties,
        ERDF.RESOURCE, '');
    });

    // continue with metas.
    $A(metas).each(function (meta) {
      var property = meta.getAttribute('name');
      var value = meta.getAttribute('content');

      ERDF._parseTriplesFrom(
        ERDF.RESOURCE, '',
        property,
        ERDF.LITERAL, value);
    });

    return true;
  },

  _parseFromTag: function (node, subject, depth) {

    // avoid parsing non-xhtml content.
    if (!node || !node.namespaceURI || node.namespaceURI != XMLNS.XHTML) {
      return;
    }

    // housekeeping.
    if (!depth) depth = 0;
    var id = node.getAttribute('id');

    // some logging.
    //if(ERDF.log.isTraceEnabled())
    //	ERDF.log.trace(">".times(depth) + " Parsing " + node.nodeName + " ("+node.nodeType+") for data on " +
    //		((subject.type == ERDF.RESOURCE) ? ('&lt;' + subject.value + '&gt;') : '') +
    //		((subject.type == ERDF.LITERAL) ? '"' + subject.value + '"' : ''));

    /* triple finding! */

    // in a-tags...
    if (node.nodeName.endsWith(':a') || node.nodeName == 'a') {
      var properties = node.getAttribute('rel');
      var reversedProperties = node.getAttribute('rev');
      var value = node.getAttribute('href');
      var title = node.getAttribute('title');
      var content = node.textContent;

      // rel triples
      ERDF._parseTriplesFrom(
        subject.type, subject.value,
        properties,
        ERDF.RESOURCE, value,
        function (triple) {
          var label = title ? title : content;

          // label triples
          ERDF._parseTriplesFrom(
            triple.object.type, triple.object.value,
            'rdfs.label',
            ERDF.LITERAL, label);
        });

      // rev triples
      ERDF._parseTriplesFrom(
        subject.type, subject.value,
        reversedProperties,
        ERDF.RESOURCE, '');

      // type triples
      ERDF._parseTypeTriplesFrom(
        subject.type, subject.value,
        properties);

      // in img-tags...
    } else if (node.nodeName.endsWith(':img') || node.nodeName == 'img') {
      var properties = node.getAttribute('class');
      var value = node.getAttribute('src');
      var alt = node.getAttribute('alt');

      ERDF._parseTriplesFrom(
        subject.type, subject.value,
        properties,
        ERDF.RESOURCE, value,
        function (triple) {
          var label = alt;

          // label triples
          ERDF._parseTriplesFrom(
            triple.object.type, triple.object.value,
            'rdfs.label',
            ERDF.LITERAL, label);
        });

    }

    // in every tag
    var properties = node.getAttribute('class');
    var title = node.getAttribute('title');
    var content = node.textContent;
    var label = title ? title : content;

    // regular triples
    ERDF._parseTriplesFrom(
      subject.type, subject.value,
      properties,
      ERDF.LITERAL, label);

    if (id) subject = {type: ERDF.RESOURCE, value: ERDF.HASH + id};

    // type triples
    ERDF._parseTypeTriplesFrom(
      subject.type, subject.value,
      properties);

    // parse all children that are element nodes.
    var children = node.childNodes;
    if (children) $A(children).each(function (_node) {
      if (_node.nodeType == _node.ELEMENT_NODE)
        ERDF._parseFromTag(_node, subject, depth + 1);
    });
  },

  _parseTriplesFrom: function (subjectType, subject, properties,
                               objectType, object, callback) {

    if (!properties) return;
    properties.toLowerCase().split(' ').each(function (property) {

      //if(ERDF.log.isTraceEnabled())
      //	ERDF.log.trace("Going for property " + property);

      var schema = ERDF.schemas.find(function (schema) {
        return false || ERDF.DELIMITERS.find(function (delimiter) {
          return property.startsWith(schema.prefix + delimiter);
        });
      });

      if (schema && object) {
        property = property.substring(
          schema.prefix.length + 1, property.length);
        var triple = ERDF.registerTriple(
          new ERDF.Resource(subject),
          {prefix: schema.prefix, name: property},
          (objectType == ERDF.RESOURCE) ?
            new ERDF.Resource(object) :
            new ERDF.Literal(object));

        if (callback) callback(triple);
      }
    });
  },

  _parseTypeTriplesFrom: function (subjectType, subject, properties, callback) {

    if (!properties) return;
    properties.toLowerCase().split(' ').each(function (property) {

      //if(ERDF.log.isTraceEnabled())
      //	ERDF.log.trace("Going for property " + property);

      var schema = ERDF.schemas.find(function (schema) {
        return false || ERDF.DELIMITERS.find(function (delimiter) {
          return property.startsWith(ERDF.HYPHEN + schema.prefix + delimiter);
        });
      });

      if (schema && subject) {
        property = property.substring(schema.prefix.length + 2, property.length);
        var triple = ERDF.registerTriple(
          (subjectType == ERDF.RESOURCE) ?
            new ERDF.Resource(subject) :
            new ERDF.Literal(subject),
          {prefix: 'rdf', name: 'type'},
          new ERDF.Resource(schema.namespace + property));
        if (callback) callback(triple);
      }
    });
  },

  /**
   * Checks for ERDF profile declaration in head of document.
   */
  _checkProfile: function () {

    // get profiles from head element.
    var heads = document.getElementsByTagNameNS(XMLNS.XHTML, 'head');
    var profiles = heads[0].getAttribute("profile");
    var found = false;

    // if erdf profile is contained.
    if (profiles && profiles.split(" ").member(XMLNS.ERDF)) {

      // pass check.
      //if(ERDF.log.isTraceEnabled())
      //	ERDF.log.trace("Found ERDF profile " + XMLNS.ERDF);
      return true;

    } else {

      // otherwise fail check.
      //if(ERDF.log.isFatalEnabled())
      //	ERDF.log.fatal("No ERDF profile found.");
      return false;
    }
  },

  __stripHashes: function (s) {
    return (s && (typeof s.substring == 'function') && s.substring(0, 1) == '#') ? s.substring(1, s.length) : s;
  },

  registerSchema: function (prefix, namespace) {

    // TODO check whether already registered, if so, complain.
    ERDF.schemas.push({
      prefix: prefix,
      namespace: namespace
    });

    //if(ERDF.log.isDebugEnabled())
    //	ERDF.log.debug("Prefix '"+prefix+"' for '"+namespace+"' registered.");
  },

  registerTriple: function (subject, predicate, object) {

    // if prefix is schema, this is a schema definition.
    if (predicate.prefix.toLowerCase() == 'schema')
      this.registerSchema(predicate.name, object.value);

    var triple = new ERDF.Triple(subject, predicate, object);
    ERDF.callback(triple);

    //if(ERDF.log.isInfoEnabled())
    //	ERDF.log.info(triple)

    // return the registered triple.
    return triple;
  },

  __enhanceObject: function () {

    /* Resource state querying methods */
    this.isResource = function () {
      return this.type == ERDF.RESOURCE
    };
    this.isLocal = function () {
      return this.isResource() && this.value.startsWith('#')
    };
    this.isCurrentDocument = function () {
      return this.isResource() && (this.value == '')
    };

    /* Resource getter methods.*/
    this.getId = function () {
      return this.isLocal() ? ERDF.__stripHashes(this.value) : false;
    };

    /* Liiteral state querying methods  */
    this.isLiteral = function () {
      return this.type == ERDF.LIITERAL
    };
  },

  serialize: function (literal) {

    if (!literal) {
      return "";
    } else if (literal.constructor == String) {
      return literal;
    } else if (literal.constructor == Boolean) {
      return literal ? 'true' : 'false';
    } else {
      return literal.toString();
    }
  }
};


ERDF.Triple = function (subject, predicate, object) {

  this.subject = subject;
  this.predicate = predicate;
  this.object = object;

  this.toString = function () {

    return "[ERDF.Triple] " +
      this.subject.toString() + ' ' +
      this.predicate.prefix + ':' + this.predicate.name + ' ' +
      this.object.toString();
  };
};

ERDF.Resource = function (uri) {

  this.type = ERDF.RESOURCE;
  this.value = uri;
  ERDF.__enhanceObject.apply(this);

  this.toString = function () {
    return '&lt;' + this.value + '&gt;';
  }

};

ERDF.Literal = function (literal) {

  this.type = ERDF.LITERAL;
  this.value = ERDF.serialize(literal);
  ERDF.__enhanceObject.apply(this);

  this.toString = function () {
    return '"' + this.value + '"';
  }
};


/**
 * The Data Management object. Use this one when interacting with page internal
 * 数据管理对象。与页面内部交互时使用此选项
 * data. Initialize data management by DataManager.init();
 * @class DataManager
 */
var DataManager = {

  /**
   * The init method should be called once in the DataManagers lifetime.
   * It causes the DataManager to initialize itself, the erdf parser, do all
   * neccessary registrations and configurations, to run the parser and
   * from then on deliver all resulting triples.
   * No parameters needed are needed in a call to this method.
   */
  init: function () {
    ERDF.init(DataManager._registerTriple);
    DataManager.__synclocal();
  },

  /**
   * This triple array is meant to be the whole knowledge of the DataManager.
   */
  _triples: [],

  /**
   * This method is meant for callback from erdf parsing. It is not to be
   * used in another way than to add triples to the triple store.
   * @param {Object} triple the triple to add to the triple store.
   */
  _registerTriple: function (triple) {
    DataManager._triples.push(triple)
  },

  /**
   * The __synclocal method is for internal usage only.
   * It performs synchronization with the local document, that is, the triple
   * store is adjustet to the content of the document, which could have been
   * changed by any other applications running on the same page.
   */
  __synclocal: function () {
    DataManager._triples = [];
    ERDF.run();
  },

  /**
   * Makes the shape passed into this method synchronize itself with the DOM.
   * This method returns the shapes resource object for further manipulation.
   * @param {Object} shape
   */
  __synchronizeShape: function (shape) {

    var r = ResourceManager.getResource(shape.resourceId);
    var serialize = shape.serialize();

    // store all serialize values
    serialize.each(function (ser) {

      var resource = (ser.type == 'resource');
      var _triple = new ERDF.Triple(
        new ERDF.Resource(shape.resourceId),
        {prefix: ser.prefix, name: ser.name},
        resource ?
          new ERDF.Resource(ser.value) :
          new ERDF.Literal(ser.value)
      );
      DataManager.setObject(_triple);
    });

    return r;
  },

  __storeShape: function (shape) {

    // first synchronize the shape,
    var resource = DataManager.__synchronizeShape(shape);

    // then save the synchronized dom.
    resource.save();
  },

  __forceExistance: function (shape) {

    if (!$(shape.resourceId)) {

      if (!$$('.' + PROCESSDATA_REF)[0])
        DataManager.graft(XMLNS.XHTML,
          document.getElementsByTagNameNS(XMLNS.XHTML, 'body').item(0), ['div', {
            'class': PROCESSDATA_REF,
            'style': 'display:none;'
          }]);

      // object is literal
      DataManager.graft(XMLNS.XHTML,
        $$('.' + PROCESSDATA_REF)[0], [

          'div', {
            'id': shape.resourceId,
            //This should be done in a more dynamic way!!!!!
            'class': (shape instanceof ORYX.Core.Canvas) ? "-oryx-canvas" : undefined
          }
        ]);

    } else {
      var resource = $(shape.resourceId)
      var children = $A(resource.childNodes)
      children.each(function (child) {
        resource.removeChild(child);
      });
    }
    ;
  },

  __persistShape: function (shape) {

    // a shape serialization.
    var shapeData = shape.serialize();

    // initialize a triple array and construct a shape resource
    // to be used in triple generation.
    var triplesArray = [];
    var shapeResource = new ERDF.Resource(shape.resourceId);

    // remove all triples for this particular shape's resource
    DataManager.removeTriples(DataManager.query(
      shapeResource, undefined, undefined));

    // for each data set in the shape's serialization
    shapeData.each(function (data) {

      // construct a triple's value
      var value = (data.type == 'resource') ?
        new ERDF.Resource(data.value) :
        new ERDF.Literal(data.value);

      // construct triple and add it to the DOM.
      DataManager.addTriple(new ERDF.Triple(
        shapeResource,
        {prefix: data.prefix, name: data.name},
        value
      ));
    });
  },

  __persistDOM: function (facade) {

    // getChildShapes gets all shapes (nodes AND edges), deep flag
    // makes it return a flattened child hierarchy.

    var canvas = facade.getCanvas();
    var shapes = canvas.getChildShapes(true);
    var result = '';

    // persist all shapes.
    shapes.each(function (shape) {
      DataManager.__forceExistance(shape);
    });
    //DataManager.__synclocal();

    DataManager.__renderCanvas(facade);
    result += DataManager.serialize(
      $(ERDF.__stripHashes(facade.getCanvas().resourceId)), true);

    shapes.each(function (shape) {

      DataManager.__persistShape(shape);
      result += DataManager.serialize(
        $(ERDF.__stripHashes(shape.resourceId)), true);
    });

    //result += DataManager.__renderCanvas(facade);

    return result;
  },

  __renderCanvas: function (facade) {

    var canvas = facade.getCanvas();
    var stencilSets = facade.getStencilSets();
    var shapes = canvas.getChildShapes(true);

    DataManager.__forceExistance(canvas);

    DataManager.__persistShape(canvas);

    var shapeResource = new ERDF.Resource(canvas.resourceId);

    // remove all triples for this particular shape's resource
    DataManager.removeTriples(DataManager.query(
      shapeResource, undefined, undefined));

    DataManager.addTriple(new ERDF.Triple(
      shapeResource,
      {prefix: "oryx", name: "mode"},
      new ERDF.Literal("writable")
    ));

    DataManager.addTriple(new ERDF.Triple(
      shapeResource,
      {prefix: "oryx", name: "mode"},
      new ERDF.Literal("fullscreen")
    ));

    stencilSets.values().each(function (stencilset) {
      DataManager.addTriple(new ERDF.Triple(
        shapeResource,
        {prefix: "oryx", name: "stencilset"},
        new ERDF.Resource(stencilset.source().replace(/&/g, "%26"))
      ));

      DataManager.addTriple(new ERDF.Triple(
        shapeResource,
        {prefix: "oryx", name: "ssnamespace"},
        new ERDF.Resource(stencilset.namespace())
      ));

      stencilset.extensions().keys().each(function (extension) {
        DataManager.addTriple(new ERDF.Triple(
          shapeResource,
          {prefix: "oryx", name: "ssextension"},
          new ERDF.Literal(extension)
        ));
      });
    });

    shapes.each(function (shape) {
      DataManager.addTriple(new ERDF.Triple(
        shapeResource,
        {prefix: "oryx", name: "render"},
        new ERDF.Resource("#" + shape.resourceId)
      ));
    });
  },

  __counter: 0,
  __provideId: function () {

    while ($(RESOURCE_ID_PREFIX + DataManager.__counter))
      DataManager.__counter++;

    return RESOURCE_ID_PREFIX + DataManager.__counter;
  },

  serializeDOM: function (facade) {

    return DataManager.__persistDOM(facade);
  },

  syncGlobal: function (facade) {

    return DataManager.__syncglobal(facade);
  },

  /**
   * This method is used to synchronize local DOM with remote resources.
   * Local changes are commited to the server, and remote changes are
   * performed to the local document.
   * @param {Object} facade The facade of the editor that holds certain
   * resource representations as shapes.
   */
  __syncglobal: function (facade) {

    // getChildShapes gets all shapes (nodes AND edges), deep flag
    // makes it return a flattened child hierarchy.

    var canvas = facade.getCanvas();
    var shapes = canvas.getChildShapes(true);

    // create dummy resource representations in the dom
    // for all shapes that were newly created.

    shapes.select(function (shape) {

      // select shapes without resource id.

      return !($(shape.resourceId));

    }).each(function (shape) {

      // create new resources for them.
      if (USE_ARESS_WORKAROUNDS) {

        /*
				 * This is a workaround due to a bug in aress. Resources are
				 * ignoring changes to raziel:type property once they are
				 * created. As long as this is not fixed, the resource is now
				 * being created using a randomly guessed id, this temporary id
				 * is then used in references and the appropriate div is being
				 * populated with properties.
				 *
				 * AFTER THIS PHASE THE DATA IS INCONSISTENT AS REFERENCES POINT
				 * TO IDS THAT ARE UNKNOWN TO THE BACK END.
				 *
				 * After the resource is actually created in aress, it gets an id
				 * that is persistent. All shapes are then being populated with the
				 * correct id references and stored on the server.
				 *
				 * AFTER THE SAVE PROCESS HAS RETURNED, THE DATA IS CONSISTENT
				 * REGARDING THE ID REFERENCES AGAIN.
				 */

        var razielType = shape.properties['raziel-type'];

        var div = '<div xmlns="http://www.w3.org/1999/xhtml">' +
          '<span class="raziel-type">' + razielType + '</span></div>';

        var r = ResourceManager.__createResource(div);
        shape.resourceId = r.id();

      } else {

        var r = ResourceManager.__createResource();
        shape.resourceId = r.id();
      }

    });

    shapes.each(function (shape) {

      // store all shapes.
      DataManager.__storeShape(shape);
    });
  },

  /**
   * This method serializes a single div into a string that satisfies the
   * client/server communication protocol. It ingnores all elements that have
   * an attribute named class that includes 'transient'.
   * @param {Object} node the element to serialize.
   * @param {Object} preserveNamespace whether to preserve the parent's
   *                 namespace. If you are not sure about namespaces, provide
   *                 just the element to be serialized.
   */
  serialize: function (node, preserveNamespace) {

    if (node.nodeType == node.ELEMENT_NODE) {
      // serialize an element node.

      var children = $A(node.childNodes);
      var attributes = $A(node.attributes);
      var clazz = new String(node.getAttribute('class'));
      var ignore = clazz.split(' ').member('transient');

      // ignore transients.

      if (ignore)
        return '';

      // start serialization.

      var result = '<' + node.nodeName;

      // preserve namespace?
      if (!preserveNamespace)
        result += ' xmlns="' + (node.namespaceURI ? node.namespaceURI : XMLNS.XHTML) + '" xmlns:oryx="http://oryx-editor.org"';

      // add all attributes.

      attributes.each(function (attribute) {
        result += ' ' + attribute.nodeName + '="' +
          attribute.nodeValue + '"';
      });

      // close if no children.

      if (children.length == 0)
        result += '/>';

      else {

        // serialize all children.

        result += '>';
        children.each(function (_node) {
          result += DataManager.serialize(_node, true)
        });
        result += '</' + node.nodeName + '>'
      }

      return result;

    } else if (node.nodeType == node.TEXT_NODE) {

      // serialize a text node.
      return node.nodeValue;
    }

    //TODO serialize cdata areas also.
    //TODO work on namespace awareness.
  },

  addTriple: function (triple) {

    // assert the subject is a resource

    if (!triple.subject.type == ERDF.LITERAL)
      throw 'Cannot add the triple ' + triple.toString() +
      ' because the subject is not a resource.'

    // get the element which represents this triple's subject.
    var elementId = ERDF.__stripHashes(triple.subject.value);
    var element = $(elementId);

    // assert the subject is inside this document.
    if (!element)
      throw 'Cannot add the triple ' + triple.toString() +
      ' because the subject "' + elementId + '" is not in the document.';

    if (triple.object.type == ERDF.LITERAL)

    // object is literal
      DataManager.graft(XMLNS.XHTML, element, [
        'span', {
          'class': (triple.predicate.prefix + "-" +
            triple.predicate.name)
        }, triple.object.value.escapeHTML()
      ]);

    else {

      // object is resource
      DataManager.graft(XMLNS.XHTML, element, [
        'a', {
          'rel': (triple.predicate.prefix + "-" +
            triple.predicate.name), 'href': triple.object.value
        }
      ]);

    }

    return true;
  },

  removeTriples: function (triples) {

    // alert('Removing ' +triples.length+' triples.');

    // from all the triples select those ...
    var removed = triples.select(
      function (triple) {

        // TODO remove also from triple store.
        // ... that were actually removed.
        return DataManager.__removeTriple(triple);
      });

    // sync and return removed triples.
    // DataManager.__synclocal();
    return removed;
  },

  removeTriple: function (triple) {

    // remember whether the triple was actually removed.
    var result = DataManager.__removeTriple(triple);

    // sync and return removed triples.
    // DataManager.__synclocal();
    return result;
  },

  __removeTriple: function (triple) {

    // assert the subject is a resource
    if (!triple.subject.type == ERDF.LITERAL)

      throw 'Cannot remove the triple ' + triple.toString() +
      ' because the subject is not a resource.';

    // get the element which represents this triple's subject.
    var elementId = ERDF.__stripHashes(triple.subject.value);
    var element = $(elementId);

    // assert the subject is inside this document.
    if (!element)

      throw 'Cannot remove the triple ' + triple.toString() +
      ' because the subject is not in the document.';

    if (triple.object.type == ERDF.LITERAL) {

      // continue searching actively for the triple.
      var result = DataManager.__removeTripleRecursively(triple, element);
      return result;
    }
  },

  __removeTripleRecursively: function (triple, continueFrom) {

    // return when this node is not an element node.
    if (continueFrom.nodeType != continueFrom.ELEMENT_NODE)
      return false;

    var classes = new String(continueFrom.getAttribute('class'));
    var children = $A(continueFrom.childNodes);

    if (classes.include(triple.predicate.prefix + '-' + triple.predicate.name)) {

      var content = continueFrom.textContent;
      if ((triple.object.type == ERDF.LITERAL) &&
        (triple.object.value == content))

        continueFrom.parentNode.removeChild(continueFrom);

      return true;

    } else {

      children.each(function (_node) {
        DataManager.__removeTripleRecursively(triple, _node)
      });
      return false;
    }

  },

  /**
   * graft() function
   * Originally by Sean M. Burke from interglacial.com, altered for usage with
   * SVG and namespace (xmlns) support. Be sure you understand xmlns before
   * using this funtion, as it creates all grafted elements in the xmlns
   * provided by you and all element's attribures in default xmlns. If you
   * need to graft elements in a certain xmlns and wish to assign attributes
   * in both that and another xmlns, you will need to do stepwise grafting,
   * adding non-default attributes yourself or you'll have to enhance this
   * function. Latter, I would appreciate: martin�apfelfabrik.de
   * @param {Object} namespace The namespace in which
   *          elements should be grafted.
   * @param {Object} parent The element that should contain the grafted
   *          structure after the function returned.
   * @param {Object} t the crafting structure.
   * @param {Object} doc the document in which grafting is performed.
   */
  graft: function (namespace, parent, t, doc) {

    doc = (doc || (parent && parent.ownerDocument) || document);
    var e;
    if (t === undefined) {
      echo("Can't graft an undefined value");
    } else if (t.constructor == String) {
      e = doc.createTextNode(t);
    } else {
      for (var i = 0; i < t.length; i++) {
        if (i === 0 && t[i].constructor == String) {
          var snared = t[i].match(/^([a-z][a-z0-9]*)\.([^\s\.]+)$/i);
          if (snared) {
            e = doc.createElementNS(namespace, snared[1]);
            e.setAttributeNS(null, 'class', snared[2]);
            continue;
          }
          snared = t[i].match(/^([a-z][a-z0-9]*)$/i);
          if (snared) {
            e = doc.createElementNS(namespace, snared[1]);  // but no class
            continue;
          }

          // Otherwise:
          e = doc.createElementNS(namespace, "span");
          e.setAttribute(null, "class", "namelessFromLOL");
        }

        if (t[i] === undefined) {
          echo("Can't graft an undefined value in a list!");
        } else if (t[i].constructor == String || t[i].constructor == Array) {
          this.graft(namespace, e, t[i], doc);
        } else if (t[i].constructor == Number) {
          this.graft(namespace, e, t[i].toString(), doc);
        } else if (t[i].constructor == Object) {
          // hash's properties => element's attributes
          for (var k in t[i]) {
            e.setAttributeNS(null, k, t[i][k]);
          }
        } else if (t[i].constructor == Boolean) {
          this.graft(namespace, e, t[i] ? 'true' : 'false', doc);
        } else
          throw "Object " + t[i] + " is inscrutable as an graft arglet.";
      }
    }

    if (parent) parent.appendChild(e);

    return Element.extend(e); // return the topmost created node
  },

  setObject: function (triple) {

    /**
     * Erwartungen von Arvid an diese Funktion:
     * - Es existiert genau ein triple mit dem Subjekt und Praedikat,
     *   das uebergeben wurde, und dieses haelt uebergebenes Objekt.
     */

    var triples = DataManager.query(
      triple.subject,
      triple.predicate,
      undefined
    );

    DataManager.removeTriples(triples);

    DataManager.addTriple(triple);

    return true;
  },

  query: function (subject, predicate, object) {

    /*
		 * Typical triple.
		 *	{value: subject, type: subjectType},
		 *	{prefix: schema.prefix, name: property},
		 *	{value: object, type: objectType});
		 */

    return DataManager._triples.select(function (triple) {

      var select = ((subject) ?
        (triple.subject.type == subject.type) &&
        (triple.subject.value == subject.value) : true);
      if (predicate) {
        select = select && ((predicate.prefix) ?
          (triple.predicate.prefix == predicate.prefix) : true);
        select = select && ((predicate.name) ?
          (triple.predicate.name == predicate.name) : true);
      }
      select = select && ((object) ?
        (triple.object.type == object.type) &&
        (triple.object.value == object.value) : true);
      return select;
    });
  }
}

Kickstart.register(DataManager.init);

function assert(expr, m) {
  if (!expr) throw m;
};

function DMCommand(action, triple) {

  // store action and triple.
  this.action = action;
  this.triple = triple;

  this.toString = function () {
    return 'Command(' + action + ', ' + triple + ')';
  };
}

function DMCommandHandler(nextHandler) {

  /**
   * Private method to set the next handler in the Chain of Responsibility
   * (see http://en.wikipedia.org/wiki/Chain-of-responsibility_pattern for
   * details).
   * @param {DMCommandHandler} handler The handler that is next in the chain.
   */
  this.__setNext = function (handler) {
    var _next = this.__next;
    this.__next = nextHandler;
    return _next ? _next : true;
  };
  this.__setNext(nextHandler);

  /**
   * Invokes the next handler. If there is no next handler, this method
   * returns false, otherwise it forwards the result of the handling.
   * @param {Object} command The command object to be processed.
   */
  this.__invokeNext = function (command) {
    return this.__next ? this.__next.handle(command) : false;
  };

  /**
   * Handles a command. The abstract method process() is called with the
   * command object that has been passed. If the process method catches the
   * command (returns true on completion), the handle() method returns true.
   * If the process() method doesn't catch the command, the next handler will
   * be invoked.
   * @param {Object} command The command object to be processed.
   */
  this.handle = function (command) {
    return this.process(command) ? true : this.__invokeNext(command);
  }

  /**
   * Empty process() method returning false. If javascript knew abstract
   * class members, this would be one.
   * @param {Object} command The command object to process.
   */
  this.process = function (command) {
    return false;
  };
};

/**
 * This Handler manages the addition and the removal of meta elements in the
 * head of the document.
 * @param {DMCommandHandler} next The handler that is next in the chain.
 */
function MetaTagHandler(next) {

  DMCommandHandler.apply(this, [next]);
  this.process = function (command) {

    with (command.triple) {

      /* assert prerequisites */
      if (!(
        (subject instanceof ERDF.Resource) &&
        (subject.isCurrentDocument()) &&
        (object instanceof ERDF.Literal)
      )) return false;
    }

  };
};

var chain = new MetaTagHandler();
var command = new DMCommand(TRIPLE_ADD, new ERDF.Triple(
  new ERDF.Resource(''),
  'rdf:tool',
  new ERDF.Literal('')
));

/*
if(chain.handle(command))
	alert('Handled!');
*/

ResourceManager = {

  __corrupt: false,
  __latelyCreatedResource: undefined,
  __listeners: $H(),
  __token: 1,

  addListener: function (listener, mask) {

    if (!(listener instanceof Function))
      throw 'Resource event listener is not a function!';
    if (!(mask))
      throw 'Invalid mask for resource event listener registration.';

    // construct controller and token.
    var controller = {listener: listener, mask: mask};
    var token = ResourceManager.__token++;

    // add new listener.
    ResourceManager.__listeners[token] = controller;

    // return the token generated.
    return token;
  },

  removeListener: function (token) {

    // remove the listener with the token and return it.
    return ResourceManager.__listners.remove(token);
  },

  __Event: function (action, resourceId) {
    this.action = action;
    this.resourceId = resourceId;
  },

  __dispatchEvent: function (event) {

    // get all listeners. for each listener, ...
    ResourceManager.__listeners.values().each(function (controller) {

      // .. if listener subscribed to this type of event ...
      if (event.action & controller.mask)
        return controller.listener(event);
    });
  },

  getResource: function (id) {

    // get all possible resources for this.
    id = ERDF.__stripHashes(id);
    var resources = DataManager.query(
      new ERDF.Resource('#' + id),
      {prefix: 'raziel', name: 'entry'},
      undefined
    );

    // check for consistency.
    if ((resources.length == 1) && (resources[0].object.isResource())) {
      var entryUrl = resources[0].object.value;
      return new ResourceManager.__Resource(id, entryUrl);
    }

    // else throw an error message.
    throw ('Resource with id ' + id + ' not recognized as such. ' +
      ((resources.length > 1) ?
        ' There is more than one raziel:entry URL.' :
        ' There is no raziel:entry URL.'));

    return false;
  },

  __createResource: function (alternativeDiv) {

    var collectionUrls = DataManager.query(
      new ERDF.Resource(''),
      // TODO This will become raziel:collection in near future.
      {prefix: 'raziel', name: 'collection'},
      undefined
    );

    // check for consistency.

    if ((collectionUrls.length == 1) &&
      (collectionUrls[0].object.isResource())) {

      // get the collection url.

      var collectionUrl = collectionUrls[0].object.value;
      var resource = undefined;

      // if there is an old id, serialize the dummy div from there,
      // otherwise create a dummy div on the fly.

      var serialization = alternativeDiv ? alternativeDiv :
        '<div xmlns="http://www.w3.org/1999/xhtml"></div>';

      ResourceManager.__request(
        'POST', collectionUrl, serialization,

        // on success
        function () {

          // get div and id that have been generated by the server.

          var response = (this.responseXML);
          var div = response.childNodes[0];
          var id = div.getAttribute('id');

          // store div in DOM
          if (!$$('.' + PROCESSDATA_REF)[0])
            DataManager.graft(XMLNS.XHTML,
              document.getElementsByTagNameNS(XMLNS.XHTML, 'body').item(0), ['div', {
                'class': PROCESSDATA_REF,
                'style': 'display:none;'
              }]);

          $$('.' + PROCESSDATA_REF)[0].appendChild(div.cloneNode(true));

          // parse local erdf data once more.

          DataManager.__synclocal();

          // get new resource object.

          resource = new ResourceManager.getResource(id);

          // set up an action informing of the creation.

          ResourceManager.__resourceActionSucceeded(
            this, RESOURCE_CREATED, undefined);
        },

        function () {
          ResourceManager.__resourceActionFailed(
            this, RESOURCE_CREATED, undefined);
        },
        false
      );

      return resource;
    }

    // else
    throw 'Could not create resource! raziel:collection URL is missing!';
    return false;

  },

  __Resource: function (id, url) {

    this.__id = id;
    this.__url = url;

    /*
		 * Process URL is no longer needed to refer to the shape element on the
		 * canvas. AReSS uses the id's to gather information on fireing
		 * behaviour now.
		 */

//		// find the process url.
//		var processUrl = undefined;
//
//		var urls = DataManager.query(
//			new ERDF.Resource('#'+this.__id),
//			{prefix: 'raziel', name: 'process'},
//			undefined
//		);
//
//		if(urls.length == 0) { throw 'The resource with the id ' +id+ ' has no process url.'};
//
//		urls.each( function(triple) {
//
//			// if there are more urls, use the last one.
//			processUrl = triple.object.value;
//		});
//
//		this.__processUrl = processUrl;
//
//		// convenience function for getting the process url.
//		this.processUrl = function() {
//			return this.__processUrl;
//		}


    // convenience finction for getting the id.
    this.id = function () {
      return this.__id;
    }

    // convenience finction for getting the entry url.
    this.url = function () {
      return this.__url;
    }

    this.reload = function () {
      var _url = this.__url;
      var _id = this.__id;
      ResourceManager.__request(
        'GET', _url, null,
        function () {
          ResourceManager.__resourceActionSucceeded(
            this, RESOURCE_RELOADED, _id);
        },
        function () {
          ResourceManager.__resourceActionFailed(
            this, RESURCE_RELOADED, _id);
        },
        USE_ASYNCHRONOUS_REQUESTS
      );
    };

    this.save = function (synchronize) {
      var _url = this.__url;
      var _id = this.__id;
      data = DataManager.serialize($(_id));
      ResourceManager.__request(
        'PUT', _url, data,
        function () {
          ResourceManager.__resourceActionSucceeded(
            this, synchronize ? RESOURCE_SAVED | RESOURCE_SYNCHRONIZED : RESOURCE_SAVED, _id);
        },
        function () {
          ResourceManager.__resourceActionFailed(
            this, synchronize ? RESOURCE_SAVED | RESOURCE_SYNCHRONIZED : RESOURCE.SAVED, _id);
        },
        USE_ASYNCHRONOUS_REQUESTS
      );
    };

    this.remove = function () {
      var _url = this.__url;
      var _id = this.__id;
      ResourceManager.__request(
        'DELETE', _url, null,
        function () {
          ResourceManager.__resourceActionSucceeded(
            this, RESOURCE_REMOVED, _id);
        },
        function () {
          ResourceManager.__resourceActionFailed(
            this, RESOURCE_REMOVED, _id);
        },
        USE_ASYNCHRONOUS_REQUESTS
      );
    };
  },

  request: function (url, requestOptions) {

    var options = {
      method: 'get',
      asynchronous: true,
      parameters: {}
    };

    Object.extend(options, requestOptions || {});

    var params = Hash.toQueryString(options.parameters);
    if (params)
      url += (url.include('?') ? '&' : '?') + params;

    return ResourceManager.__request(
      options.method,
      url,
      options.data,
      (options.onSuccess instanceof Function ? function () {
        options.onSuccess(this);
      } : undefined),
      (options.onFailure instanceof Function ? function () {
        options.onFailure(this);
      } : undefined),
      options.asynchronous && USE_ASYNCHRONOUS_REQUESTS,
      options.headers);
  },

  __request: function (method, url, data, success, error, async, headers) {

    // get a request object
    var httpRequest = Try.these(
      /* do the Mozilla/Safari/Opera stuff */
      function () {
        return new XMLHttpRequest();
      },

      /* do the IE stuff */
      function () {
        return new ActiveXObject("Msxml2.XMLHTTP");
      },
      function () {
        return new ActiveXObject("Microsoft.XMLHTTP")
      }
    );

    // if there is no request object ...
    if (!httpRequest) {
      if (!this.__corrupt)
        throw 'This browser does not provide any AJAX functionality. You will not be able to use the software provided with the page you are viewing. Please consider installing appropriate extensions.';
      this.__corrupt = true;
      return false;
    }

    if (success instanceof Function)
      httpRequest.onload = success;
    if (error instanceof Function) {
      httpRequest.onerror = error;
    }

    var h = $H(headers)
    h.keys().each(function (key) {

      httpRequest.setRequestHeader(key, h[key]);
    });

    try {

      if (SHOW_DEBUG_ALERTS_WHEN_SAVING)

        alert(method + ' ' + url + '\n' +
        SHOW_EXTENDED_DEBUG_INFORMATION ? data : '');

      // TODO Remove synchronous calls to the server as soon as xenodot
      // handles asynchronous requests without failure.
      httpRequest.open(method, url, !async ? false : true);
      httpRequest.send(data);

    } catch (e) {
      return false;
    }
    return true;
  },

  __resourceActionSucceeded: function (transport, action, id) {

    var status = transport.status;
    var response = transport.responseText;

    if (SHOW_DEBUG_ALERTS_WHEN_SAVING)

      alert(status + ' ' + url + '\n' +
      SHOW_EXTENDED_DEBUG_INFORMATION ? data : '');

    // if the status code is not in 2xx, throw an error.
    if (status >= 300)
      throw 'The server responded with an error: ' + status + '\n' + (SHOW_EXTENDED_DEBUG_INFORMATION ? +data : 'If you need additional information here, including the data sent by the server, consider setting SHOW_EXTENDED_DEBUG_INFORMATION to true.');

    switch (action) {

      case RESOURCE_REMOVED:

        // get div and id
        var response = (transport.responseXML);
        var div = response.childNodes[0];
        var id = div.getAttribute('id');

        // remove the resource from DOM
        var localDiv = document.getElementById(id);
        localDiv.parentNode.removeChild(localDiv);
        break;

      case RESOURCE_CREATED:

        // nothing remains to be done.
        break;

      case RESOURCE_SAVED | RESOURCE_SYNCHRONIZED:

        DataManager.__synclocal();

      case RESOURCE_SAVED:

        // nothing remains to be done.
        break;

      case RESOURCE_RELOADED:

        // get div and id
        var response = (transport.responseXML);
        var div = response.childNodes[0];
        var id = div.getAttribute('id');

        // remove the local resource representation from DOM
        var localDiv = document.getElementById(id)
        localDiv.parentNode.removeChild(localDiv);

        // store div in DOM
        if (!$$(PROCESSDATA_REF)[0])
          DataManager.graft(XMLNS.XHTML,
            document.getElementsByTagNameNS(XMLNS.XHTML, 'body').item(0), ['div', {
              'class': PROCESSDATA_REF,
              'style': 'display:none;'
            }]);

        $$(PROCESSDATA_REF)[0].appendChild(div.cloneNode(true));
        DataManager.__synclocal();
        break;

      default:
        DataManager.__synclocal();

    }

    // dispatch to all listeners ...
    ResourceManager.__dispatchEvent(
      // ... an event describing the change that happened here.
      new ResourceManager.__Event(action, id)
    );
  },

  __resourceActionFailed: function (transport, action, id) {
    throw "Fatal: Resource action failed. There is something horribly " +
    "wrong with either the server, the transport protocol or your " +
    "online status. Sure you're online?";
  }
}

/**
 * The super class for all classes in ORYX. Adds some OOP feeling to javascript.
 * See article "Object Oriented Super Class Method Calling with JavaScript" on
 * http://truecode.blogspot.com/2006/08/object-oriented-super-class-method.html
 * for a documentation on this. Fairly good article that points out errors in
 * Douglas Crockford's inheritance and super method calling approach.
 * Worth reading.
 * @class Clazz
 */
var Clazz = function () {};

/**
 * Empty constructor.
 * @methodOf Clazz.prototype
 */
Clazz.prototype.construct = function () {};

/**
 * Can be used to build up inheritances of classes.
 * @example
 * var MyClass = Clazz.extend({
 *   construct: function(myParam){
 *     // Do sth.
 *   }
 * });
 * var MySubClass = MyClass.extend({
 *   construct: function(myParam){
 *     // Use this to call constructor of super class
 *     arguments.callee.$.construct.apply(this, arguments);
 *     // Do sth.
 *   }
 * });
 * @param {Object} def The definition of the new class.
 */
Clazz.extend = function (def) {
  var classDef = function () {
    if (arguments[0] !== Clazz) {
      this.construct.apply(this, arguments);
    }
  };

  var proto = new this(Clazz);
  var superClass = this.prototype;

  for (var n in def) {
    var item = def[n];
    if (item instanceof Function) item.$ = superClass;
    proto[n] = item;
  }

  classDef.prototype = proto;

  //Give this new class the same static extend method
  classDef.extend = this.extend;
  return classDef;
};


function printf() {

  var result = arguments[0];
  for (var i = 1; i < arguments.length; i++)
    result = result.replace('%' + (i - 1), arguments[i]);
  return result;
}


ORYX = Object.extend(ORYX, {
  //set the path in the config.js file!!!!
  PATH: ORYX.CONFIG.ROOT_PATH,
  //CONFIGURATION: "config.js",

  URLS: [],

  alreadyLoaded: [],

  configrationRetries: 0,

  Version: '0.1.1',

  availablePlugins: [],

  /**
   * The ORYX.Log logger.
   */
  Log: {
    __appenders: [
      {
        append: function (message) {
          if (typeof(console) !== "undefined" && console.log !== undefined) {
            console.log(message);
          }
        }
      }
    ],

    trace: function () {
      if (ORYX_LOGLEVEL >= ORYX_LOGLEVEL_TRACE)
        ORYX.Log.__log('TRACE', arguments);
    },
    debug: function () {
      if (ORYX_LOGLEVEL >= ORYX_LOGLEVEL_DEBUG)
        ORYX.Log.__log('DEBUG', arguments);
    },
    info: function () {
      if (ORYX_LOGLEVEL >= ORYX_LOGLEVEL_INFO)
        ORYX.Log.__log('INFO', arguments);
    },
    warn: function () {
      if (ORYX_LOGLEVEL >= ORYX_LOGLEVEL_WARN)
        ORYX.Log.__log('WARN', arguments);
    },
    error: function () {
      if (ORYX_LOGLEVEL >= ORYX_LOGLEVEL_ERROR)
        ORYX.Log.__log('ERROR', arguments);
    },
    fatal: function () {
      if (ORYX_LOGLEVEL >= ORYX_LOGLEVEL_FATAL)
        ORYX.Log.__log('FATAL', arguments);
    },

    __log: function (prefix, messageParts) {

      messageParts[0] = (new Date()).getTime() + " "
        + prefix + " " + messageParts[0];
      var message = printf.apply(null, messageParts);

      ORYX.Log.__appenders.each(function (appender) {
        appender.append(message);
      });
    },

    addAppender: function (appender) {
      ORYX.Log.__appenders.push(appender);
    }
  },

  /**
   * First bootstrapping layer. The Oryx loading procedure begins. In this
   * step, all preliminaries that are not in the responsibility of Oryx to be
   * met have to be checked here, such as the existance of the prototpe
   * library in the current execution environment. After that, the second
   * bootstrapping layer is being invoked. Failing to ensure that any
   * preliminary condition is not met has to fail with an error.
   *
   * 第一个引导层。Oryx开始加载，在这步骤，所有不属于Oryx责任的准备工作必须在这里检查MET，例如Prototpe的存在
   * 当前执行环境中的库。之后，第二个正在调用引导层。未能确保不满足初步条件就必须失败并出现错误。
   */
  load: function () {
    ORYX.Log.debug("Oryx begins loading procedure.");

    // check for prototype
    if ((typeof Prototype == 'undefined') ||
      (typeof Element == 'undefined') ||
      (typeof Element.Methods == 'undefined') ||
      parseFloat(Prototype.Version.split(".")[0] + "." +
        Prototype.Version.split(".")[1]) < 1.5)

      throw("Application requires the Prototype JavaScript framework >= 1.5.3");

    ORYX.Log.debug("Prototype > 1.5 found.");

    // continue loading.
    ORYX._load();
  },

  /**
   * Second bootstrapping layer. The oryx configuration is checked. When not
   * yet loaded, config.js is being requested from the server. A repeated
   * error in retrieving the configuration will result in an error to be
   * thrown after a certain time of retries. Once the configuration is there,
   * all urls that are registered with oryx loading are being requested from
   * the server. Once everything is loaded, the third layer is being invoked.
   */
  _load: function () {
    ORYX.loadPlugins();
  },

  /**
   * Third bootstrapping layer. This is where first the plugin coniguration
   * file is loaded into oryx, analyzed, and where all plugins are being
   * requested by the server. Afterwards, all editor instances will be
   * initialized.
   */
  loadPlugins: function () {
    // load plugins if enabled.
    if (ORYX.CONFIG.PLUGINS_ENABLED)
      ORYX._loadPlugins()
    else
      ORYX.Log.warn("Ignoring plugins, loading Core only.");

    // init the editor instances.
    init();
  },

  _loadPlugins: function (plugins) {
    ORYX.availablePlugins.length = 0;

    var resultXml = plugins
    // get plugins.xml content
    // var resultXml = jQuery.parseXML(plugins); //jquery parser

    // TODO: Describe how properties are handled.
    // Get the globale Properties
    var globalProperties = [];
    var preferences = $A(resultXml.getElementsByTagName("properties"));
    preferences.each(function (p) {
      var props = $A(p.childNodes);
      props.each(function (prop) {
        var property = new Hash();

        // get all attributes from the node and set to global properties
        var attributes = $A(prop.attributes)
        attributes.each(function (attr) {
          property.set(attr.nodeName, attr.nodeValue);
        });
        if (attributes.length > 0) {
          globalProperties.push(property)
        }
        ;
      });
    });

    // TODO Why are we using XML if we don't respect structure anyway?
    // for each plugin element in the configuration..
    var plugin = resultXml.getElementsByTagName("plugin");
    $A(plugin).each(function (node) {
      // get all element's attributes.
      // TODO: What about: var pluginData = $H(node.attributes) !?
      var pluginData = new Hash();
      $A(node.attributes).each(function (attr) {
        pluginData.set(attr.nodeName, attr.nodeValue);
      });

      // ensure there's a name attribute.
      if (!pluginData.get('name')) {
        ORYX.Log.error("A plugin is not providing a name. Ingnoring this plugin.");
        return;
      }

      // ensure there's a source attribute.
      if (!pluginData.get('source')) {
        ORYX.Log.error("Plugin with name '%0' doesn't provide a source attribute.", pluginData.get('name'));
        return;
      }

      // Get all private Properties
      var propertyNodes = node.getElementsByTagName("property");
      var properties = [];
      $A(propertyNodes).each(function (prop) {
        var property = new Hash();

        // Get all Attributes from the Node
        var attributes = $A(prop.attributes)
        attributes.each(function (attr) {
          property.set(attr.nodeName, attr.nodeValue);
        });

        if (attributes.length > 0) {
          properties.push(property)
        }

      });

      // Set all Global-Properties to the Properties
      properties = properties.concat(globalProperties);

      // Set Properties to Plugin-Data
      pluginData.set('properties', properties);

      // Get the RequieredNodes
      var requireNodes = node.getElementsByTagName("requires");
      var requires;
      $A(requireNodes).each(function (req) {
        var namespace = $A(req.attributes).find(function (attr) {
          return attr.name == "namespace"
        })
        if (namespace && namespace.nodeValue) {
          if (!requires) {
            requires = {namespaces: []}
          }

          requires.namespaces.push(namespace.nodeValue)
        }
      });

      // Set Requires to the Plugin-Data, if there is one
      if (requires) {
        pluginData.set('requires', requires);
      }

      // Get the RequieredNodes
      var notUsesInNodes = node.getElementsByTagName("notUsesIn");
      var notUsesIn;
      $A(notUsesInNodes).each(function (not) {
        var namespace = $A(not.attributes).find(function (attr) {
          return attr.name == "namespace"
        })
        if (namespace && namespace.nodeValue) {
          if (!notUsesIn) {
            notUsesIn = {namespaces: []}
          }

          notUsesIn.namespaces.push(namespace.nodeValue)
        }
      });

      // Set Requires to the Plugin-Data, if there is one
      if (notUsesIn) {
        pluginData.set('notUsesIn', notUsesIn);
      }


      var url = ORYX.PATH + ORYX.CONFIG.PLUGINS_FOLDER + pluginData.get('source');

      ORYX.Log.debug("Requireing '%0'", url);

      // Add the Script-Tag to the Site
      //Kickstart.require(url);

      // 加载成功log
      // ORYX.Log.info("Plugin '%0' successfully loaded.", pluginData.get('name'));

      // Add the Plugin-Data to all available Plugins
      ORYX.availablePlugins.push(pluginData);
    });
  },

  _loadPluginsOnFails: function (result) {
    ORYX.Log.error("Plugin configuration file not available.");
  }
});


var idCounter = 0;
var ID_PREFIX = "resource";

/**
 * Main initialization method. To be called when loading
 * of the document, including all scripts, is completed.
 */
function init() {

  ORYX.Log.debug("Querying editor instances");

  // Hack for WebKit to set the SVGElement-Classes
  ORYX.Editor.setMissingClasses();

  // If someone wants to create the editor instance himself
  if (window.onOryxResourcesLoaded) {
    window.onOryxResourcesLoaded();
  }
  // Else fetch the model from server and display editor
  else {
    var modelId = window.location.search.substring(4);
    var modelUrl = "./service/model/" + modelId + "/json";

    ORYX.Editor.createByUrl(modelUrl);
  }
}

if (!Signavio) {
  var Signavio = {}
}
;
if (!Signavio.Core) {
  Signavio.Core = {}
}

Signavio.Core.Version = "1.0";


if (!Signavio.Plugins) {
  Signavio.Plugins = {};
}

if (!Signavio.Plugins.Utils) {
  Signavio.Plugins.Utils = {};
}

if (!Signavio.Helper) {
  Signavio.Helper = {};
}
