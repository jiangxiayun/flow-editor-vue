
XMLNS = {
  ATOM: "http://www.w3.org/2005/Atom",
  XHTML: "http://www.w3.org/1999/xhtml",
  ERDF: "http://purl.org/NET/erdf/profile",
  RDFS: "http://www.w3.org/2000/01/rdf-schema#",
  RDF: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  RAZIEL: "http://b3mn.org/Raziel",

  SCHEMA: ""
};


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



function printf() {

  var result = arguments[0];
  for (var i = 1; i < arguments.length; i++)
    result = result.replace('%' + (i - 1), arguments[i]);
  return result;
}


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
  } else {
    // Else fetch the model from server and display editor
    var modelId = window.location.search.substring(4);
    var modelUrl = "./service/model/" + modelId + "/json";

    ORYX.Editor.createByUrl(modelUrl);
  }
}

