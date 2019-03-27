import ERDF from './ERDF'
import ORYX_CONFIG from './CONFIG'

//TODO kann kickstart sich vielleicht auch um die erzeugung von paketen/
// namespaces k�mmern? z.b. requireNamespace("ORYX.Core.SVG");
const Kickstart = {
  started: false,
  callbacks: [],
  alreadyLoaded: [],
  PATH: '',

  load: function () {
    Kickstart.kick()
  },

  kick: function () {
    //console.profile("loading");
    if (!Kickstart.started) {
      Kickstart.started = true
      Kickstart.callbacks.each(function (callback) {
        // call the registered callback asynchronously.
        window.setTimeout(callback, 1)
      })
    }
  },

  register: function (callback) {
    //TODO Add some mutual exclusion between kick and register calls.
    // with (Kickstart) {
    //   if (started) window.setTimeout(callback, 1);
    //   else Kickstart.callbacks.push(callback)
    // }

    if (Kickstart.started) {
      window.setTimeout(callback, 1)
    } else {
      Kickstart.callbacks.push(callback)
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
      return false
    return Kickstart.include(url)
  },

  /**
   * Loads a js, regardless of whether it has only been already downloaded.
   * 加载JS，不管它是否已经下载。
   * @param {String} url the script to load.
   */
  include: function (url) {
    // prepare a script tag and place it in html head.
    var head = document.getElementsByTagNameNS(ORYX_CONFIG.XMLNS.XHTML, 'head')[0]
    var s = document.createElementNS(ORYX_CONFIG.XMLNS.XHTML, 'script')
    s.setAttributeNS(ORYX_CONFIG.XMLNS.XHTML, 'type', 'text/javascript')
    s.src = Kickstart.PATH + url

    //TODO macht es sinn, dass neue skript als letztes kind in den head
    // einzubinden (stichwort reihenfolge der skript tags)?
    head.appendChild(s)

    // remember this url.
    Kickstart.alreadyLoaded.push(url)

    return true
  }
}

const idCounter = 0
const ID_PREFIX = 'resource'
const PROCESSDATA_REF = 'processdata'
/*
 * Back end specific workarounds.
 */
const USE_ARESS_WORKAROUNDS = true
const SHOW_DEBUG_ALERTS_WHEN_SAVING = false
const SHOW_EXTENDED_DEBUG_INFORMATION = false
/*
 * Save and triple generation behaviour. Use this area to configure
 * data management to your needs.
 */
const USE_ASYNCHRONOUS_REQUESTS = true
const DISCARD_UNUSED_TRIPLES = true
const PREFER_SPANS_OVER_DIVS = true
const PREFER_TITLE_OVER_TEXTNODE = false
const RESOURCE_ID_PREFIX = 'resource'
// Resource constants
const RESOURCE_CREATED = 0x01
const RESOURCE_REMOVED = 0x02
const RESOURCE_SAVED = 0x04
const RESOURCE_RELOADED = 0x08
const RESOURCE_SYNCHRONIZED = 0x10

const ResourceManager = {
  __corrupt: false,
  __latelyCreatedResource: undefined,
  __listeners: $H(),
  __token: 1,

  addListener: function (listener, mask) {
    if (!(listener instanceof Function))
      throw 'Resource event listener is not a function!'
    if (!(mask))
      throw 'Invalid mask for resource event listener registration.'

    // construct controller and token.
    let controller = { listener: listener, mask: mask }
    let token = ResourceManager.__token++

    // add new listener.
    ResourceManager.__listeners[token] = controller

    // return the token generated.
    return token
  },

  removeListener: function (token) {
    // remove the listener with the token and return it.
    return ResourceManager.__listners.remove(token)
  },

  __Event: function (action, resourceId) {
    this.action = action
    this.resourceId = resourceId
  },

  __dispatchEvent: function (event) {
    // get all listeners. for each listener, ...
    ResourceManager.__listeners.values().each(function (controller) {

      // .. if listener subscribed to this type of event ...
      if (event.action & controller.mask)
        return controller.listener(event)
    })
  },

  getResource: function (id) {
    // get all possible resources for this.
    id = ERDF.__stripHashes(id)
    let resources = DataManager.query(
      new ERDF.Resource('#' + id),
      { prefix: 'raziel', name: 'entry' },
      undefined
    )

    // check for consistency.
    if ((resources.length == 1) && (resources[0].object.isResource())) {
      let entryUrl = resources[0].object.value
      return new ResourceManager.__Resource(id, entryUrl)
    }

    // else throw an error message.
    throw ('Resource with id ' + id + ' not recognized as such. ' +
      ((resources.length > 1) ?
        ' There is more than one raziel:entry URL.' :
        ' There is no raziel:entry URL.'))

    return false
  },

  __createResource: function (alternativeDiv) {
    let collectionUrls = DataManager.query(
      new ERDF.Resource(''),
      // TODO This will become raziel:collection in near future.
      { prefix: 'raziel', name: 'collection' },
      undefined
    )

    // check for consistency.

    if ((collectionUrls.length == 1) &&
      (collectionUrls[0].object.isResource())) {
      // get the collection url.
      let collectionUrl = collectionUrls[0].object.value
      let resource = undefined

      // if there is an old id, serialize the dummy div from there,
      // otherwise create a dummy div on the fly.

      let serialization = alternativeDiv ? alternativeDiv :
        '<div xmlns="http://www.w3.org/1999/xhtml"></div>'

      ResourceManager.__request(
        'POST', collectionUrl, serialization,
        // on success
        function () {
          // get div and id that have been generated by the server.
          let response = (this.responseXML)
          let div = response.childNodes[0]
          let id = div.getAttribute('id')

          // store div in DOM
          if (!$$('.' + PROCESSDATA_REF)[0])
            DataManager.graft(ORYX_CONFIG.XMLNS.XHTML,
              document.getElementsByTagNameNS(ORYX_CONFIG.XMLNS.XHTML, 'body').item(0), ['div', {
                'class': PROCESSDATA_REF,
                'style': 'display:none;'
              }])

          $$('.' + PROCESSDATA_REF)[0].appendChild(div.cloneNode(true))

          // parse local erdf data once more.

          DataManager.__synclocal()

          // get new resource object.

          resource = new ResourceManager.getResource(id)

          // set up an action informing of the creation.

          ResourceManager.__resourceActionSucceeded(
            this, RESOURCE_CREATED, undefined)
        },

        function () {
          ResourceManager.__resourceActionFailed(
            this, RESOURCE_CREATED, undefined)
        },
        false
      )

      return resource
    }

    // else
    throw 'Could not create resource! raziel:collection URL is missing!'
    return false

  },

  __Resource: function (id, url) {
    this.__id = id
    this.__url = url

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
      return this.__id
    }

    // convenience finction for getting the entry url.
    this.url = function () {
      return this.__url
    }

    this.reload = function () {
      let _url = this.__url
      let _id = this.__id
      ResourceManager.__request(
        'GET', _url, null,
        function () {
          ResourceManager.__resourceActionSucceeded(
            this, RESOURCE_RELOADED, _id)
        },
        function () {
          ResourceManager.__resourceActionFailed(
            this, RESURCE_RELOADED, _id)
        },
        USE_ASYNCHRONOUS_REQUESTS
      )
    }

    this.save = function (synchronize) {
      let _url = this.__url
      let _id = this.__id
      let data = DataManager.serialize($(_id))
      ResourceManager.__request(
        'PUT', _url, data,
        function () {
          ResourceManager.__resourceActionSucceeded(
            this, synchronize ? RESOURCE_SAVED | RESOURCE_SYNCHRONIZED : RESOURCE_SAVED, _id)
        },
        function () {
          ResourceManager.__resourceActionFailed(
            this, synchronize ? RESOURCE_SAVED | RESOURCE_SYNCHRONIZED : RESOURCE.SAVED, _id)
        },
        USE_ASYNCHRONOUS_REQUESTS
      )
    }

    this.remove = function () {
      let _url = this.__url
      let _id = this.__id
      ResourceManager.__request(
        'DELETE', _url, null,
        function () {
          ResourceManager.__resourceActionSucceeded(
            this, RESOURCE_REMOVED, _id)
        },
        function () {
          ResourceManager.__resourceActionFailed(
            this, RESOURCE_REMOVED, _id)
        },
        USE_ASYNCHRONOUS_REQUESTS
      )
    }
  },

  request: function (url, requestOptions) {
    let options = {
      method: 'get',
      asynchronous: true,
      parameters: {}
    }

    Object.extend(options, requestOptions || {})

    let params = Hash.toQueryString(options.parameters)
    if (params)
      url += (url.include('?') ? '&' : '?') + params

    return ResourceManager.__request(
      options.method,
      url,
      options.data,
      (options.onSuccess instanceof Function ? function () {
        options.onSuccess(this)
      } : undefined),
      (options.onFailure instanceof Function ? function () {
        options.onFailure(this)
      } : undefined),
      options.asynchronous && USE_ASYNCHRONOUS_REQUESTS,
      options.headers)
  },

  __request: function (method, url, data, success, error, async, headers) {
    // get a request object
    let httpRequest = Try.these(
      /* do the Mozilla/Safari/Opera stuff */
      function () {
        return new XMLHttpRequest()
      },

      /* do the IE stuff */
      function () {
        return new ActiveXObject('Msxml2.XMLHTTP')
      },
      function () {
        return new ActiveXObject('Microsoft.XMLHTTP')
      }
    )

    // if there is no request object ...
    if (!httpRequest) {
      if (!this.__corrupt)
        throw 'This browser does not provide any AJAX functionality. You will not be able to use the software provided with the page you are viewing. Please consider installing appropriate extensions.'
      this.__corrupt = true
      return false
    }

    if (success instanceof Function)
      httpRequest.onload = success
    if (error instanceof Function) {
      httpRequest.onerror = error
    }

    let h = $H(headers)
    h.keys().each(function (key) {
      httpRequest.setRequestHeader(key, h[key])
    })

    try {
      if (SHOW_DEBUG_ALERTS_WHEN_SAVING)
        alert(method + ' ' + url + '\n' +
        SHOW_EXTENDED_DEBUG_INFORMATION ? data : '')

      // TODO Remove synchronous calls to the server as soon as xenodot
      // handles asynchronous requests without failure.
      httpRequest.open(method, url, !async ? false : true)
      httpRequest.send(data)

    } catch (e) {
      return false
    }
    return true
  },

  __resourceActionSucceeded: function (transport, action, id) {
    let status = transport.status
    let response = transport.responseText

    if (SHOW_DEBUG_ALERTS_WHEN_SAVING) {
      alert(status + ' ' + url + '\n' +
      SHOW_EXTENDED_DEBUG_INFORMATION ? data : '')
    }

    // if the status code is not in 2xx, throw an error.
    if (status >= 300) {
      throw 'The server responded with an error: ' + status + '\n' + (SHOW_EXTENDED_DEBUG_INFORMATION ? +data : 'If you need additional information here, including the data sent by the server, consider setting SHOW_EXTENDED_DEBUG_INFORMATION to true.')
    }

    let response_s, div, localDiv
    switch (action) {
      case RESOURCE_REMOVED:
        // get div and id
        response_s = (transport.responseXML)
        div = response_s.childNodes[0]
        id = div.getAttribute('id')

        // remove the resource from DOM
        localDiv = document.getElementById(id)
        localDiv.parentNode.removeChild(localDiv)
        break

      case RESOURCE_CREATED:
        // nothing remains to be done.
        break
      case RESOURCE_SAVED | RESOURCE_SYNCHRONIZED:
        DataManager.__synclocal()
      case RESOURCE_SAVED:
        // nothing remains to be done.
        break
      case RESOURCE_RELOADED:
        // get div and id
        response_s = (transport.responseXML)
        div = response_s.childNodes[0]
        id = div.getAttribute('id')

        // remove the local resource representation from DOM
        localDiv = document.getElementById(id)
        localDiv.parentNode.removeChild(localDiv)

        // store div in DOM
        if (!$$(PROCESSDATA_REF)[0]) {
          DataManager.graft(ORYX_CONFIG.XMLNS.XHTML,
            document.getElementsByTagNameNS(ORYX_CONFIG.XMLNS.XHTML, 'body').item(0), ['div', {
              'class': PROCESSDATA_REF,
              'style': 'display:none;'
            }])
        }

        $$(PROCESSDATA_REF)[0].appendChild(div.cloneNode(true))
        DataManager.__synclocal()
        break

      default:
        DataManager.__synclocal()

    }

    // dispatch to all listeners ...
    ResourceManager.__dispatchEvent(
      // ... an event describing the change that happened here.
      new ResourceManager.__Event(action, id)
    )
  },

  __resourceActionFailed: function (transport, action, id) {
    throw 'Fatal: Resource action failed. There is something horribly ' +
    'wrong with either the server, the transport protocol or your ' +
    'online status. Sure you\'re online?'
  }
}


/**
 * The Data Management object. Use this one when interacting with page internal
 * 数据管理对象。与页面内部交互时使用此选项
 * data. Initialize data management by DataManager.init();
 * @class DataManager
 */
const DataManager = {

  /**
   * The init method should be called once in the DataManagers lifetime.
   * It causes the DataManager to initialize itself, the erdf parser, do all
   * neccessary registrations and configurations, to run the parser and
   * from then on deliver all resulting triples.
   * No parameters needed are needed in a call to this method.
   */
  init: function () {
    ERDF.init(DataManager._registerTriple)
    DataManager.__synclocal()
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
    DataManager._triples = []
    ERDF.run()
  },

  /**
   * Makes the shape passed into this method synchronize itself with the DOM.
   * This method returns the shapes resource object for further manipulation.
   * @param {Object} shape
   */
  __synchronizeShape: function (shape) {

    var r = ResourceManager.getResource(shape.resourceId)
    var serialize = shape.serialize()

    // store all serialize values
    serialize.each(function (ser) {

      var resource = (ser.type == 'resource')
      var _triple = new ERDF.Triple(
        new ERDF.Resource(shape.resourceId),
        { prefix: ser.prefix, name: ser.name },
        resource ?
          new ERDF.Resource(ser.value) :
          new ERDF.Literal(ser.value)
      )
      DataManager.setObject(_triple)
    })

    return r
  },

  __storeShape: function (shape) {

    // first synchronize the shape,
    var resource = DataManager.__synchronizeShape(shape)

    // then save the synchronized dom.
    resource.save()
  },

  __forceExistance: function (shape) {

    if (!$(shape.resourceId)) {

      if (!$$('.' + PROCESSDATA_REF)[0])
        DataManager.graft(ORYX_CONFIG.XMLNS.XHTML,
          document.getElementsByTagNameNS(ORYX_CONFIG.XMLNS.XHTML, 'body').item(0), ['div', {
            'class': PROCESSDATA_REF,
            'style': 'display:none;'
          }])

      // object is literal
      DataManager.graft(ORYX_CONFIG.XMLNS.XHTML,
        $$('.' + PROCESSDATA_REF)[0], [

          'div', {
            'id': shape.resourceId,
            //This should be done in a more dynamic way!!!!!
            'class': (shape instanceof ORYX.Core.Canvas) ? '-oryx-canvas' : undefined
          }
        ])

    } else {
      var resource = $(shape.resourceId)
      var children = $A(resource.childNodes)
      children.each(function (child) {
        resource.removeChild(child)
      })
    }

  },

  __persistShape: function (shape) {

    // a shape serialization.
    var shapeData = shape.serialize()

    // initialize a triple array and construct a shape resource
    // to be used in triple generation.
    var triplesArray = []
    var shapeResource = new ERDF.Resource(shape.resourceId)

    // remove all triples for this particular shape's resource
    DataManager.removeTriples(DataManager.query(
      shapeResource, undefined, undefined))

    // for each data set in the shape's serialization
    shapeData.each(function (data) {

      // construct a triple's value
      var value = (data.type == 'resource') ?
        new ERDF.Resource(data.value) :
        new ERDF.Literal(data.value)

      // construct triple and add it to the DOM.
      DataManager.addTriple(new ERDF.Triple(
        shapeResource,
        { prefix: data.prefix, name: data.name },
        value
      ))
    })
  },

  __persistDOM: function (facade) {

    // getChildShapes gets all shapes (nodes AND edges), deep flag
    // makes it return a flattened child hierarchy.

    var canvas = facade.getCanvas()
    var shapes = canvas.getChildShapes(true)
    var result = ''

    // persist all shapes.
    shapes.each(function (shape) {
      DataManager.__forceExistance(shape)
    })
    //DataManager.__synclocal();

    DataManager.__renderCanvas(facade)
    result += DataManager.serialize(
      $(ERDF.__stripHashes(facade.getCanvas().resourceId)), true)

    shapes.each(function (shape) {

      DataManager.__persistShape(shape)
      result += DataManager.serialize(
        $(ERDF.__stripHashes(shape.resourceId)), true)
    })

    //result += DataManager.__renderCanvas(facade);

    return result
  },

  __renderCanvas: function (facade) {

    var canvas = facade.getCanvas()
    var stencilSets = facade.getStencilSets()
    var shapes = canvas.getChildShapes(true)

    DataManager.__forceExistance(canvas)

    DataManager.__persistShape(canvas)

    var shapeResource = new ERDF.Resource(canvas.resourceId)

    // remove all triples for this particular shape's resource
    DataManager.removeTriples(DataManager.query(
      shapeResource, undefined, undefined))

    DataManager.addTriple(new ERDF.Triple(
      shapeResource,
      { prefix: 'oryx', name: 'mode' },
      new ERDF.Literal('writable')
    ))

    DataManager.addTriple(new ERDF.Triple(
      shapeResource,
      { prefix: 'oryx', name: 'mode' },
      new ERDF.Literal('fullscreen')
    ))

    stencilSets.values().each(function (stencilset) {
      DataManager.addTriple(new ERDF.Triple(
        shapeResource,
        { prefix: 'oryx', name: 'stencilset' },
        new ERDF.Resource(stencilset.source().replace(/&/g, '%26'))
      ))

      DataManager.addTriple(new ERDF.Triple(
        shapeResource,
        { prefix: 'oryx', name: 'ssnamespace' },
        new ERDF.Resource(stencilset.namespace())
      ))

      stencilset.extensions().keys().each(function (extension) {
        DataManager.addTriple(new ERDF.Triple(
          shapeResource,
          { prefix: 'oryx', name: 'ssextension' },
          new ERDF.Literal(extension)
        ))
      })
    })

    shapes.each(function (shape) {
      DataManager.addTriple(new ERDF.Triple(
        shapeResource,
        { prefix: 'oryx', name: 'render' },
        new ERDF.Resource('#' + shape.resourceId)
      ))
    })
  },

  __counter: 0,
  __provideId: function () {

    while ($(RESOURCE_ID_PREFIX + DataManager.__counter))
      DataManager.__counter++

    return RESOURCE_ID_PREFIX + DataManager.__counter
  },

  serializeDOM: function (facade) {

    return DataManager.__persistDOM(facade)
  },

  syncGlobal: function (facade) {

    return DataManager.__syncglobal(facade)
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

    var canvas = facade.getCanvas()
    var shapes = canvas.getChildShapes(true)

    // create dummy resource representations in the dom
    // for all shapes that were newly created.

    shapes.select(function (shape) {

      // select shapes without resource id.

      return !($(shape.resourceId))

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

        var razielType = shape.properties['raziel-type']

        var div = '<div xmlns="http://www.w3.org/1999/xhtml">' +
          '<span class="raziel-type">' + razielType + '</span></div>'

        var r = ResourceManager.__createResource(div)
        shape.resourceId = r.id()

      } else {

        var r = ResourceManager.__createResource()
        shape.resourceId = r.id()
      }

    })

    shapes.each(function (shape) {

      // store all shapes.
      DataManager.__storeShape(shape)
    })
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

      var children = $A(node.childNodes)
      var attributes = $A(node.attributes)
      var clazz = new String(node.getAttribute('class'))
      var ignore = clazz.split(' ').member('transient')

      // ignore transients.

      if (ignore)
        return ''

      // start serialization.

      var result = '<' + node.nodeName

      // preserve namespace?
      if (!preserveNamespace)
        result += ' xmlns="' + (node.namespaceURI ? node.namespaceURI : ORYX_CONFIG.XMLNS.XHTML) + '" xmlns:oryx="http://oryx-editor.org"'

      // add all attributes.

      attributes.each(function (attribute) {
        result += ' ' + attribute.nodeName + '="' +
          attribute.nodeValue + '"'
      })

      // close if no children.

      if (children.length == 0)
        result += '/>'

      else {

        // serialize all children.

        result += '>'
        children.each(function (_node) {
          result += DataManager.serialize(_node, true)
        })
        result += '</' + node.nodeName + '>'
      }

      return result

    } else if (node.nodeType == node.TEXT_NODE) {

      // serialize a text node.
      return node.nodeValue
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
    var elementId = ERDF.__stripHashes(triple.subject.value)
    var element = $(elementId)

    // assert the subject is inside this document.
    if (!element)
      throw 'Cannot add the triple ' + triple.toString() +
      ' because the subject "' + elementId + '" is not in the document.'

    if (triple.object.type == ERDF.LITERAL)

    // object is literal
      DataManager.graft(ORYX_CONFIG.XMLNS.XHTML, element, [
        'span', {
          'class': (triple.predicate.prefix + '-' +
            triple.predicate.name)
        }, triple.object.value.escapeHTML()
      ])

    else {

      // object is resource
      DataManager.graft(ORYX_CONFIG.XMLNS.XHTML, element, [
        'a', {
          'rel': (triple.predicate.prefix + '-' +
            triple.predicate.name), 'href': triple.object.value
        }
      ])

    }

    return true
  },

  removeTriples: function (triples) {

    // alert('Removing ' +triples.length+' triples.');

    // from all the triples select those ...
    var removed = triples.select(
      function (triple) {

        // TODO remove also from triple store.
        // ... that were actually removed.
        return DataManager.__removeTriple(triple)
      })

    // sync and return removed triples.
    // DataManager.__synclocal();
    return removed
  },

  removeTriple: function (triple) {

    // remember whether the triple was actually removed.
    var result = DataManager.__removeTriple(triple)

    // sync and return removed triples.
    // DataManager.__synclocal();
    return result
  },

  __removeTriple: function (triple) {

    // assert the subject is a resource
    if (!triple.subject.type == ERDF.LITERAL)

      throw 'Cannot remove the triple ' + triple.toString() +
      ' because the subject is not a resource.'

    // get the element which represents this triple's subject.
    var elementId = ERDF.__stripHashes(triple.subject.value)
    var element = $(elementId)

    // assert the subject is inside this document.
    if (!element)

      throw 'Cannot remove the triple ' + triple.toString() +
      ' because the subject is not in the document.'

    if (triple.object.type == ERDF.LITERAL) {

      // continue searching actively for the triple.
      var result = DataManager.__removeTripleRecursively(triple, element)
      return result
    }
  },

  __removeTripleRecursively: function (triple, continueFrom) {

    // return when this node is not an element node.
    if (continueFrom.nodeType != continueFrom.ELEMENT_NODE)
      return false

    var classes = new String(continueFrom.getAttribute('class'))
    var children = $A(continueFrom.childNodes)

    if (classes.include(triple.predicate.prefix + '-' + triple.predicate.name)) {

      var content = continueFrom.textContent
      if ((triple.object.type == ERDF.LITERAL) &&
        (triple.object.value == content))

        continueFrom.parentNode.removeChild(continueFrom)

      return true

    } else {

      children.each(function (_node) {
        DataManager.__removeTripleRecursively(triple, _node)
      })
      return false
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

    doc = (doc || (parent && parent.ownerDocument) || document)
    var e
    if (t === undefined) {
      echo('Can\'t graft an undefined value')
    } else if (t.constructor == String) {
      e = doc.createTextNode(t)
    } else {
      for (let i = 0; i < t.length; i++) {
        if (i === 0 && t[i].constructor == String) {
          var snared = t[i].match(/^([a-z][a-z0-9]*)\.([^\s\.]+)$/i)
          if (snared) {
            e = doc.createElementNS(namespace, snared[1])
            e.setAttributeNS(null, 'class', snared[2])
            continue
          }
          snared = t[i].match(/^([a-z][a-z0-9]*)$/i)
          if (snared) {
            e = doc.createElementNS(namespace, snared[1])  // but no class
            continue
          }

          // Otherwise:
          e = doc.createElementNS(namespace, 'span')
          e.setAttribute(null, 'class', 'namelessFromLOL')
        }

        if (t[i] === undefined) {
          echo('Can\'t graft an undefined value in a list!')
        } else if (t[i].constructor == String || t[i].constructor == Array) {
          this.graft(namespace, e, t[i], doc)
        } else if (t[i].constructor == Number) {
          this.graft(namespace, e, t[i].toString(), doc)
        } else if (t[i].constructor == Object) {
          // hash's properties => element's attributes
          for (var k in t[i]) {
            e.setAttributeNS(null, k, t[i][k])
          }
        } else if (t[i].constructor == Boolean) {
          this.graft(namespace, e, t[i] ? 'true' : 'false', doc)
        } else
          throw 'Object ' + t[i] + ' is inscrutable as an graft arglet.'
      }
    }

    if (parent) parent.appendChild(e)

    return Element.extend(e) // return the topmost created node
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
    )

    DataManager.removeTriples(triples)

    DataManager.addTriple(triple)

    return true
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
        (triple.subject.value == subject.value) : true)
      if (predicate) {
        select = select && ((predicate.prefix) ?
          (triple.predicate.prefix == predicate.prefix) : true)
        select = select && ((predicate.name) ?
          (triple.predicate.name == predicate.name) : true)
      }
      select = select && ((object) ?
        (triple.object.type == object.type) &&
        (triple.object.value == object.value) : true)
      return select
    })
  }
}

// register kickstart as the new onload event listener on current window.
// 在当前窗口上将kickstart注册为新的onload事件侦听器。
// previous listener(s) are triggered to launch with kickstart.
Event.observe(window, 'load', Kickstart.load)


Kickstart.register(DataManager.init)

export {
  DataManager
}