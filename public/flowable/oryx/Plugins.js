
if (!ORYX) {
  var ORYX = {}
}
if (!ORYX.Plugins) {
  ORYX.Plugins = {}
}


/**
 This abstract plugin class can be used to build plugins on.
 It provides some more basic functionality like registering events (on*-handlers)...
 @example
 ORYX.Plugins.MyPlugin = ORYX.Plugins.AbstractPlugin.extend({
        construct: function() {
            // Call super class constructor
            arguments.callee.$.construct.apply(this, arguments);

            [...]
        },
        [...]
    });

 @class ORYX.Plugins.AbstractPlugin
 @constructor Creates a new instance
 @author Willi Tscheschner
 */
ORYX.Plugins.AbstractPlugin = Clazz.extend({
  /**
   * The facade which offer editor-specific functionality
   * @type Facade
   * @memberOf ORYX.Plugins.AbstractPlugin.prototype
   */
  facade: null,

  construct: function (facade) {
    this.facade = facade;

    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED, this.onLoaded.bind(this));
  },

  /**
   Overwrite to handle load event. TODO: Document params!!!
   @methodOf ORYX.Plugins.AbstractPlugin.prototype
   */
  onLoaded: function () {
  },

  /**
   Overwrite to handle selection changed event. TODO: Document params!!!
   @methodOf ORYX.Plugins.AbstractPlugin.prototype
   */
  onSelectionChanged: function () {
  },

  /**
   Show overlay on given shape.
   @methodOf ORYX.Plugins.AbstractPlugin.prototype
   @example
   showOverlay(
   myShape,
   { stroke: "green" },
   ORYX.Editor.graft("http://www.w3.org/2000/svg", null, ['path', {
               "title": "Click the element to execute it!",
               "stroke-width": 2.0,
               "stroke": "black",
               "d": "M0,-5 L5,0 L0,5 Z",
               "line-captions": "round"
           }])
   )
   @param {Oryx.XXX.Shape[]} shapes One shape or array of shapes the overlay should be put on
   @param {Oryx.XXX.Attributes} attributes some attributes...
   @param {Oryx.svg.node} svgNode The svg node which should be used as overlay
   @param {String} [svgNode="NW"] The svg node position where the overlay should be placed
   */
  showOverlay: function (shapes, attributes, svgNode, svgNodePosition) {

    if (!(shapes instanceof Array)) {
      shapes = [shapes]
    }

    // Define Shapes
    shapes = shapes.map(function (shape) {
      var el = shape;
      if (typeof shape == "string") {
        el = this.facade.getCanvas().getChildShapeByResourceId(shape);
        el = el || this.facade.getCanvas().getChildById(shape, true);
      }
      return el;
    }.bind(this)).compact();

    // Define unified id
    if (!this.overlayID) {
      this.overlayID = this.type + ORYX.Editor.provideId();
    }

    this.facade.raiseEvent({
      type: ORYX.CONFIG.EVENT_OVERLAY_SHOW,
      id: this.overlayID,
      shapes: shapes,
      attributes: attributes,
      node: svgNode,
      nodePosition: svgNodePosition || "NW"
    });

  },

  /**
   Hide current overlay.
   @methodOf ORYX.Plugins.AbstractPlugin.prototype
   */
  hideOverlay: function () {
    this.facade.raiseEvent({
      type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
      id: this.overlayID
    });
  },

  /**
   Does a transformation with the given xslt stylesheet.
   @methodOf ORYX.Plugins.AbstractPlugin.prototype
   @param {String} data The data (e.g. eRDF) which should be transformed
   @param {String} stylesheet URL of a stylesheet which should be used for transforming data.
   */
  doTransform: function (data, stylesheet) {

    if (!stylesheet || !data) {
      return ""
    }

    var parser = new DOMParser();
    var parsedData = parser.parseFromString(data, "text/xml");
    source = stylesheet;
    new Ajax.Request(source, {
      asynchronous: false,
      method: 'get',
      onSuccess: function (transport) {
        xsl = transport.responseText
      }.bind(this),
      onFailure: (function (transport) {
        ORYX.Log.error("XSL load failed" + transport);
      }).bind(this)
    });
    var xsltProcessor = new XSLTProcessor();
    var domParser = new DOMParser();
    var xslObject = domParser.parseFromString(xsl, "text/xml");
    xsltProcessor.importStylesheet(xslObject);

    try {

      var newData = xsltProcessor.transformToFragment(parsedData, document);
      var serializedData = (new XMLSerializer()).serializeToString(newData);

      /* Firefox 2 to 3 problem?! */
      serializedData = !serializedData.startsWith("<?xml") ? "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + serializedData : serializedData;

      return serializedData;

    } catch (error) {
      return -1;
    }

  },

  /**
   * Opens a new window that shows the given XML content.
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   * @param {Object} content The XML content to be shown.
   * @example
   * openDownloadWindow( "my.xml", "<exampleXML />" );
   */
  openXMLWindow: function (content) {
    var win = window.open(
      'data:application/xml,' + encodeURIComponent(
      content
      ),
      '_blank', "resizable=yes,width=600,height=600,toolbar=0,scrollbars=yes"
    );
  },

  /**
   * Opens a download window for downloading the given content.
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   * @param {String} filename The content's file name
   * @param {String} content The content to download
   */
  openDownloadWindow: function (filename, content) {
    var win = window.open("");
    if (win != null) {
      win.document.open();
      win.document.write("<html><body>");
      var submitForm = win.document.createElement("form");
      win.document.body.appendChild(submitForm);

      var createHiddenElement = function (name, value) {
        var newElement = document.createElement("input");
        newElement.name = name;
        newElement.type = "hidden";
        newElement.value = value;
        return newElement
      }

      submitForm.appendChild(createHiddenElement("download", content));
      submitForm.appendChild(createHiddenElement("file", filename));


      submitForm.method = "POST";
      win.document.write("</body></html>");
      win.document.close();
      submitForm.action = ORYX.PATH + "/download";
      submitForm.submit();
    }
  },

  /**
   * Serializes DOM.
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   * @type {String} Serialized DOM
   */
  getSerializedDOM: function () {
    // Force to set all resource IDs
    var serializedDOM = DataManager.serializeDOM(this.facade);

    //add namespaces
    serializedDOM = '<?xml version="1.0" encoding="utf-8"?>' +
      '<html xmlns="http://www.w3.org/1999/xhtml" ' +
      'xmlns:b3mn="http://b3mn.org/2007/b3mn" ' +
      'xmlns:ext="http://b3mn.org/2007/ext" ' +
      'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ' +
      'xmlns:atom="http://b3mn.org/2007/atom+xhtml">' +
      '<head profile="http://purl.org/NET/erdf/profile">' +
      '<link rel="schema.dc" href="http://purl.org/dc/elements/1.1/" />' +
      '<link rel="schema.dcTerms" href="http://purl.org/dc/terms/ " />' +
      '<link rel="schema.b3mn" href="http://b3mn.org" />' +
      '<link rel="schema.oryx" href="http://oryx-editor.org/" />' +
      '<link rel="schema.raziel" href="http://raziel.org/" />' +
      '<base href="' +
      location.href.split("?")[0] +
      '" />' +
      '</head><body>' +
      serializedDOM +
      '</body></html>';

    return serializedDOM;
  },

  /**
   * Sets the editor in read only mode: Edges/ dockers cannot be moved anymore,
   * shapes cannot be selected anymore.
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   */
  enableReadOnlyMode: function () {
    //Edges cannot be moved anymore
    this.facade.disableEvent(ORYX.CONFIG.EVENT_MOUSEDOWN);

    // Stop the user from editing the diagram while the plugin is active
    this._stopSelectionChange = function () {
      if (this.facade.getSelection().length > 0) {
        this.facade.setSelection([]);
      }
    };
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, this._stopSelectionChange.bind(this));
  },
  /**
   * Disables read only mode, see @see
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   * @see ORYX.Plugins.AbstractPlugin.prototype.enableReadOnlyMode
   */
  disableReadOnlyMode: function () {
    // Edges can be moved now again
    this.facade.enableEvent(ORYX.CONFIG.EVENT_MOUSEDOWN);

    if (this._stopSelectionChange) {
      this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, this._stopSelectionChange.bind(this));
      this._stopSelectionChange = undefined;
    }
  },

  /**
   * Extracts RDF from DOM.
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   * @type {String} Extracted RFD. Null if there are transformation errors.
   */
  getRDFFromDOM: function () {
    //convert to RDF
    try {
      var xsl = "";
      source = ORYX.PATH + "lib/extract-rdf.xsl";
      new Ajax.Request(source, {
        asynchronous: false,
        method: 'get',
        onSuccess: function (transport) {
          xsl = transport.responseText
        }.bind(this),
        onFailure: (function (transport) {
          ORYX.Log.error("XSL load failed" + transport);
        }).bind(this)
      });

      var domParser = new DOMParser();
      var xmlObject = domParser.parseFromString(this.getSerializedDOM(), "text/xml");
      var xslObject = domParser.parseFromString(xsl, "text/xml");
      var xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(xslObject);
      var result = xsltProcessor.transformToFragment(xmlObject, document);

      var serializer = new XMLSerializer();

      return serializer.serializeToString(result);
    } catch (e) {
      console.log("error serializing " + e);
      return "";
    }


  },

  /**
   * Checks if a certain stencil set is loaded right now.
   *
   */
  isStencilSetExtensionLoaded: function (stencilSetExtensionNamespace) {
    return this.facade.getStencilSets().values().any(
      function (ss) {
        return ss.extensions().keys().any(
          function (extensionKey) {
            return extensionKey == stencilSetExtensionNamespace;
          }.bind(this)
        );
      }.bind(this)
    );
  },

  /**
   * Raises an event so that registered layouters does
   * have the posiblility to layout the given shapes
   * For further reading, have a look into the AbstractLayouter
   * class
   * @param {Object} shapes
   */
  doLayout: function (shapes) {
    // Raises a do layout event
    if (this.facade.raiseEvent) {
      this.facade.raiseEvent({
        type: ORYX.CONFIG.EVENT_LAYOUT,
        shapes: shapes
      });
    }
    else {
      this.facade.handleEvents({
        type: ORYX.CONFIG.EVENT_LAYOUT,
        shapes: shapes
      });
    }
  },


  /**
   * Does a primitive layouting with the incoming/outgoing
   * edges (set the dockers to the right position) and if
   * necessary, it will be called the real layouting
   * @param {ORYX.Core.Node} node
   * @param {Array} edges
   */
  layoutEdges: function (node, allEdges, offset) {

    if (!this.facade.isExecutingCommands()) {
      return
    }

    var Command = ORYX.Core.Command.extend({
      construct: function (edges, node, offset, plugin) {
        this.edges = edges;
        this.node = node;
        this.plugin = plugin;
        this.offset = offset;

        // Get the new absolute center
        var center = node.absoluteXY();
        this.ulo = {x: center.x - offset.x, y: center.y - offset.y};


      },
      execute: function () {

        if (this.changes) {
          this.executeAgain();
          return;
        } else {
          this.changes = [];
          this.edges.each(function (edge) {
            this.changes.push({
              edge: edge,
              oldDockerPositions: edge.dockers.map(function (r) {
                return r.bounds.center()
              })
            })
          }.bind(this));
        }

        // Find all edges, which are related to the node and
        // have more than two dockers
        this.edges
        // Find all edges with more than two dockers
          .findAll(function (r) {
            return r.dockers.length > 2
          }.bind(this))
          // For every edge, check second and one before last docker
          // if there are horizontal/vertical on the same level
          // and if so, align the the bounds
          .each(function (edge) {
            if (edge.dockers.first().getDockedShape() === this.node) {
              var second = edge.dockers[1];
              if (this.align(second.bounds, edge.dockers.first())) {
                second.update();
              }
            } else if (edge.dockers.last().getDockedShape() === this.node) {
              var beforeLast = edge.dockers[edge.dockers.length - 2];
              if (this.align(beforeLast.bounds, edge.dockers.last())) {
                beforeLast.update();
              }
            }
            edge._update(true);
            edge.removeUnusedDockers();
            if (this.isBendPointIncluded(edge)) {
              this.plugin.doLayout(edge);
              return;
            }
          }.bind(this));


        // Find all edges, which have only to dockers
        // and is located horizontal/vertical.
        // Do layout with those edges
        this.edges
        // Find all edges with exactly two dockers
          .each(function (edge) {
            if (edge.dockers.length == 2) {
              var p1 = edge.dockers.first().getAbsoluteReferencePoint() || edge.dockers.first().bounds.center();
              var p2 = edge.dockers.last().getAbsoluteReferencePoint() || edge.dockers.first().bounds.center();
              // Find all horizontal/vertical edges
              if (Math.abs(-Math.abs(p1.x - p2.x) + Math.abs(this.offset.x)) < 2 || Math.abs(-Math.abs(p1.y - p2.y) + Math.abs(this.offset.y)) < 2) {
                this.plugin.doLayout(edge);
              }
            }
          }.bind(this));

        this.edges.each(function (edge, i) {
          this.changes[i].dockerPositions = edge.dockers.map(function (r) {
            return r.bounds.center()
          });
        }.bind(this));

      },
      /**
       * Align the bounds if the center is
       * the same than the old center
       * @params {Object} bounds
       * @params {Object} bounds2
       */
      align: function (bounds, refDocker) {

        var abRef = refDocker.getAbsoluteReferencePoint() || refDocker.bounds.center();

        var xdif = bounds.center().x - abRef.x;
        var ydif = bounds.center().y - abRef.y;
        if (Math.abs(-Math.abs(xdif) + Math.abs(this.offset.x)) < 3 && this.offset.xs === undefined) {
          bounds.moveBy({x: -xdif, y: 0})
        }
        if (Math.abs(-Math.abs(ydif) + Math.abs(this.offset.y)) < 3 && this.offset.ys === undefined) {
          bounds.moveBy({y: -ydif, x: 0})
        }

        if (this.offset.xs !== undefined || this.offset.ys !== undefined) {
          var absPXY = refDocker.getDockedShape().absoluteXY();
          xdif = bounds.center().x - (absPXY.x + ((abRef.x - absPXY.x) / this.offset.xs));
          ydif = bounds.center().y - (absPXY.y + ((abRef.y - absPXY.y) / this.offset.ys));

          if (Math.abs(-Math.abs(xdif) + Math.abs(this.offset.x)) < 3) {
            bounds.moveBy({x: -(bounds.center().x - abRef.x), y: 0})
          }

          if (Math.abs(-Math.abs(ydif) + Math.abs(this.offset.y)) < 3) {
            bounds.moveBy({y: -(bounds.center().y - abRef.y), x: 0})
          }
        }
      },

      /**
       * Returns a TRUE if there are bend point which overlay the shape
       */
      isBendPointIncluded: function (edge) {
        // Get absolute bounds
        var ab = edge.dockers.first().getDockedShape();
        var bb = edge.dockers.last().getDockedShape();

        if (ab) {
          ab = ab.absoluteBounds();
          ab.widen(5);
        }

        if (bb) {
          bb = bb.absoluteBounds();
          bb.widen(20); // Wide with 20 because of the arrow from the edge
        }

        return edge.dockers
          .any(function (docker, i) {
            var c = docker.bounds.center();
            // Dont count first and last
            return i != 0 && i != edge.dockers.length - 1 &&
              // Check if the point is included to the absolute bounds
              ((ab && ab.isIncluded(c)) || (bb && bb.isIncluded(c)))
          })
      },

      removeAllDocker: function (edge) {
        edge.dockers.slice(1, edge.dockers.length - 1).each(function (docker) {
          edge.removeDocker(docker);
        })
      },
      executeAgain: function () {
        this.changes.each(function (change) {
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
          change.edge._update(true);
        }.bind(this));
      },
      rollback: function () {
        this.changes.each(function (change) {
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
          change.edge._update(true);
        }.bind(this));
      }
    });

    this.facade.executeCommands([new Command(allEdges, node, offset, this)]);

  }
});

/**
 This abstract plugin implements the core behaviour of layout

 @class ORYX.Plugins.AbstractLayouter
 @constructor Creates a new instance
 @author Willi Tscheschner
 */
ORYX.Plugins.AbstractLayouter = ORYX.Plugins.AbstractPlugin.extend({
  /**
   * 'layouted' defined all types of shapes which will be layouted.
   * It can be one value or an array of values. The value
   * can be a Stencil ID (as String) or an class type of either
   * a ORYX.Core.Node or ORYX.Core.Edge
   * @type Array|String|Object
   * @memberOf ORYX.Plugins.AbstractLayouter.prototype
   */
  layouted: [],

  /**
   * Constructor
   * @param {Object} facade
   * @memberOf ORYX.Plugins.AbstractLayouter.prototype
   */
  construct: function (facade) {
    arguments.callee.$.construct.apply(this, arguments);

    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LAYOUT, this._initLayout.bind(this));
  },

  /**
   * Proofs if this shape should be layouted or not
   * @param {Object} shape
   * @memberOf ORYX.Plugins.AbstractLayouter.prototype
   */
  isIncludedInLayout: function (shape) {
    if (!(this.layouted instanceof Array)) {
      this.layouted = [this.layouted].compact();
    }

    // If there are no elements
    if (this.layouted.length <= 0) {
      // Return TRUE
      return true;
    }

    // Return TRUE if there is any correlation between
    // the 'layouted' attribute and the shape themselve.
    return this.layouted.any(function (s) {
      if (typeof s == "string") {
        return shape.getStencil().id().include(s);
      } else {
        return shape instanceof s;
      }
    })
  },

  /**
   * Callback to start the layouting
   * @param {Object} event Layout event
   * @param {Object} shapes Given shapes
   * @memberOf ORYX.Plugins.AbstractLayouter.prototype
   */
  _initLayout: function (event) {

    // Get the shapes
    var shapes = [event.shapes].flatten().compact();

    // Find all shapes which should be layouted
    var toLayout = shapes.findAll(function (shape) {
      return this.isIncludedInLayout(shape)
    }.bind(this))

    // If there are shapes left
    if (toLayout.length > 0) {
      // Do layout
      this.layout(toLayout);
    }
  },

  /**
   * Implementation of layouting a set on shapes
   * @param {Object} shapes Given shapes
   * @memberOf ORYX.Plugins.AbstractLayouter.prototype
   */
  layout: function (shapes) {
    throw new Error("Layouter has to implement the layout function.")
  }
});

ORYX.Plugins.Edit = Clazz.extend({
  construct: function (facade) {

    this.facade = facade;
    this.clipboard = new ORYX.Plugins.Edit.ClipBoard();

    //this.facade.registerOnEvent(ORYX.CONFIG.EVENT_KEYDOWN, this.keyHandler.bind(this));

    this.facade.offer({
      name: ORYX.I18N.Edit.cut,
      description: ORYX.I18N.Edit.cutDesc,
      icon: ORYX.PATH + "images/cut.png",
      keyCodes: [{
        metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
        keyCode: 88,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.callEdit.bind(this, this.editCut),
      group: ORYX.I18N.Edit.group,
      index: 1,
      minShape: 1
    });

    this.facade.offer({
      name: ORYX.I18N.Edit.copy,
      description: ORYX.I18N.Edit.copyDesc,
      icon: ORYX.PATH + "images/page_copy.png",
      keyCodes: [{
        metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
        keyCode: 67,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.callEdit.bind(this, this.editCopy, [true, false]),
      group: ORYX.I18N.Edit.group,
      index: 2,
      minShape: 1
    });

    this.facade.offer({
      name: ORYX.I18N.Edit.paste,
      description: ORYX.I18N.Edit.pasteDesc,
      icon: ORYX.PATH + "images/page_paste.png",
      keyCodes: [{
        metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
        keyCode: 86,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.callEdit.bind(this, this.editPaste),
      isEnabled: this.clipboard.isOccupied.bind(this.clipboard),
      group: ORYX.I18N.Edit.group,
      index: 3,
      minShape: 0,
      maxShape: 0
    });

    this.facade.offer({
      name: ORYX.I18N.Edit.del,
      description: ORYX.I18N.Edit.delDesc,
      icon: ORYX.PATH + "images/cross.png",
      keyCodes: [{
        metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
        keyCode: 8,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      },
        {
          keyCode: 46,
          keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
        }
      ],
      functionality: this.callEdit.bind(this, this.editDelete),
      group: ORYX.I18N.Edit.group,
      index: 4,
      minShape: 1
    });
  },

  callEdit: function (fn, args) {
    window.setTimeout(function () {
      fn.apply(this, (args instanceof Array ? args : []));
    }.bind(this), 1);
  },

  /**
   * Handles the mouse down event and starts the copy-move-paste action, if
   * control or meta key is pressed.
   */
  handleMouseDown: function (event) {
    if (this._controlPressed) {
      this._controlPressed = false;
      this.editCopy();
//			console.log("copiedEle: %0",this.clipboard.shapesAsJson)
//			console.log("mousevent: %o",event)
      this.editPaste();
      event.forceExecution = true;
      this.facade.raiseEvent(event, this.clipboard.shapesAsJson);

    }
  },

  /**
   * The key handler for this plugin. Every action from the set of cut, copy,
   * paste and delete should be accessible trough simple keyboard shortcuts.
   * This method checks whether any event triggers one of those actions.
   *
   * @param {Object} event The keyboard event that should be analysed for
   *     triggering of this plugin.
   */
//    keyHandler: function(event){
//        //TODO document what event.which is.
//
//        ORYX.Log.debug("edit.js handles a keyEvent.");
//
//        // assure we have the current event.
//        if (!event)
//            event = window.event;
//
//
//        // get the currently pressed key and state of control key.
//        var pressedKey = event.which || event.keyCode;
//        var ctrlPressed = event.ctrlKey;
//
//        // if the object is to be deleted, do so, and return immediately.
//        if ((pressedKey == ORYX.CONFIG.KEY_CODE_DELETE) ||
//        ((pressedKey == ORYX.CONFIG.KEY_CODE_BACKSPACE) &&
//        (event.metaKey || event.appleMetaKey))) {
//
//            ORYX.Log.debug("edit.js deletes the shape.");
//            this.editDelete();
//            return;
//        }
//
//         // if control key is not pressed, we're not interested anymore.
//         if (!ctrlPressed)
//         return;
//
//         // when ctrl is pressed, switch trough the possibilities.
//         switch (pressedKey) {
//
//	         // cut.
//	         case ORYX.CONFIG.KEY_CODE_X:
//	         this.editCut();
//	         break;
//
//	         // copy.
//	         case ORYX.CONFIG.KEY_CODE_C:
//	         this.editCopy();
//	         break;
//
//	         // paste.
//	         case ORYX.CONFIG.KEY_CODE_V:
//	         this.editPaste();
//	         break;
//         }
//    },

  /**
   * Returns a list of shapes which should be considered while copying.
   * Besides the shapes of given ones, edges and attached nodes are added to the result set.
   * If one of the given shape is a child of another given shape, it is not put into the result.
   */
  getAllShapesToConsider: function (shapes) {
    var shapesToConsider = []; // only top-level shapes
    var childShapesToConsider = []; // all child shapes of top-level shapes

    shapes.each(function (shape) {
      //Throw away these shapes which have a parent in given shapes
      isChildShapeOfAnother = shapes.any(function (s2) {
        return s2.hasChildShape(shape);
      });
      if (isChildShapeOfAnother) return;

      // This shape should be considered
      shapesToConsider.push(shape);
      // Consider attached nodes (e.g. intermediate events)
      if (shape instanceof ORYX.Core.Node) {
        var attached = shape.getOutgoingNodes();
        attached = attached.findAll(function (a) {
          return !shapes.include(a)
        });
        shapesToConsider = shapesToConsider.concat(attached);
      }

      childShapesToConsider = childShapesToConsider.concat(shape.getChildShapes(true));
    }.bind(this));

    // All edges between considered child shapes should be considered
    // Look for these edges having incoming and outgoing in childShapesToConsider
    var edgesToConsider = this.facade.getCanvas().getChildEdges().select(function (edge) {
      // Ignore if already added
      if (shapesToConsider.include(edge)) return false;
      // Ignore if there are no docked shapes
      if (edge.getAllDockedShapes().size() === 0) return false;
      // True if all docked shapes are in considered child shapes
      return edge.getAllDockedShapes().all(function (shape) {
        // Remember: Edges can have other edges on outgoing, that is why edges must not be included in childShapesToConsider
        return shape instanceof ORYX.Core.Edge || childShapesToConsider.include(shape);
      });
    });
    shapesToConsider = shapesToConsider.concat(edgesToConsider);

    return shapesToConsider;
  },

  /**
   * Performs the cut operation by first copy-ing and then deleting the
   * current selection.
   */
  editCut: function () {
    //TODO document why this returns false.
    //TODO document what the magic boolean parameters are supposed to do.

    this.editCopy(false, true);
    this.editDelete(true);
    return false;
  },

  /**
   * Performs the copy operation.
   * @param {Object} will_not_update ??
   */
  editCopy: function (will_update, useNoOffset) {
    var selection = this.facade.getSelection();

    //if the selection is empty, do not remove the previously copied elements
    if (selection.length == 0) return;

    this.clipboard.refresh(selection, this.getAllShapesToConsider(selection), this.facade.getCanvas().getStencil().stencilSet().namespace(), useNoOffset);

    if (will_update) this.facade.updateSelection();
  },

  /**
   * Performs the paste operation.
   */
  editPaste: function () {
    // Create a new canvas with childShapes
    //and stencilset namespace to be JSON Import conform
    var canvas = {
      childShapes: this.clipboard.shapesAsJson,
      stencilset: {
        namespace: this.clipboard.SSnamespace
      }
    };
    // Apply json helper to iterate over json object
    jQuery.extend(canvas, ORYX.Core.AbstractShape.JSONHelper);

    var childShapeResourceIds = canvas.getChildShapes(true).pluck("resourceId");
    var outgoings = {};
    // Iterate over all shapes
    canvas.eachChild(function (shape, parent) {
      // Throw away these references where referenced shape isn't copied
      shape.outgoing = shape.outgoing.select(function (out) {
        return childShapeResourceIds.include(out.resourceId);
      });
      shape.outgoing.each(function (out) {
        if (!outgoings[out.resourceId]) {
          outgoings[out.resourceId] = [];
        }
        outgoings[out.resourceId].push(shape);
      });

      return shape;
    }.bind(this), true, true);


    // Iterate over all shapes
    canvas.eachChild(function (shape, parent) {

      // Check if there has a valid target
      if (shape.target && !(childShapeResourceIds.include(shape.target.resourceId))) {
        shape.target = undefined;
        shape.targetRemoved = true;
      }

      // Check if the first docker is removed
      if (shape.dockers &&
        shape.dockers.length >= 1 &&
        shape.dockers[0].getDocker &&
        ((shape.dockers[0].getDocker().getDockedShape() &&
          !childShapeResourceIds.include(shape.dockers[0].getDocker().getDockedShape().resourceId)) ||
          !shape.getShape().dockers[0].getDockedShape() && !outgoings[shape.resourceId])) {

        shape.sourceRemoved = true;
      }

      return shape;
    }.bind(this), true, true);


    // Iterate over top-level shapes
    canvas.eachChild(function (shape, parent) {
      // All top-level shapes should get an offset in their bounds
      // Move the shape occording to COPY_MOVE_OFFSET
      if (this.clipboard.useOffset) {
        shape.bounds = {
          lowerRight: {
            x: shape.bounds.lowerRight.x + ORYX.CONFIG.COPY_MOVE_OFFSET,
            y: shape.bounds.lowerRight.y + ORYX.CONFIG.COPY_MOVE_OFFSET
          },
          upperLeft: {
            x: shape.bounds.upperLeft.x + ORYX.CONFIG.COPY_MOVE_OFFSET,
            y: shape.bounds.upperLeft.y + ORYX.CONFIG.COPY_MOVE_OFFSET
          }
        };
      }
      // Only apply offset to shapes with a target
      if (shape.dockers) {
        shape.dockers = shape.dockers.map(function (docker, i) {
          // If shape had a target but the copied does not have anyone anymore,
          // migrate the relative dockers to absolute ones.
          if ((shape.targetRemoved === true && i == shape.dockers.length - 1 && docker.getDocker) ||
            (shape.sourceRemoved === true && i == 0 && docker.getDocker)) {

            docker = docker.getDocker().bounds.center();
          }

          // If it is the first docker and it has a docked shape,
          // just return the coordinates
          if ((i == 0 && docker.getDocker instanceof Function &&
            shape.sourceRemoved !== true && (docker.getDocker().getDockedShape() || ((outgoings[shape.resourceId] || []).length > 0 && (!(shape.getShape() instanceof ORYX.Core.Node) || outgoings[shape.resourceId][0].getShape() instanceof ORYX.Core.Node)))) ||
            (i == shape.dockers.length - 1 && docker.getDocker instanceof Function &&
              shape.targetRemoved !== true && (docker.getDocker().getDockedShape() || shape.target))) {

            return {
              x: docker.x,
              y: docker.y,
              getDocker: docker.getDocker
            }
          } else if (this.clipboard.useOffset) {
            return {
              x: docker.x + ORYX.CONFIG.COPY_MOVE_OFFSET,
              y: docker.y + ORYX.CONFIG.COPY_MOVE_OFFSET,
              getDocker: docker.getDocker
            };
          } else {
            return {
              x: docker.x,
              y: docker.y,
              getDocker: docker.getDocker
            };
          }
        }.bind(this));

      } else if (shape.getShape() instanceof ORYX.Core.Node && shape.dockers && shape.dockers.length > 0 && (!shape.dockers.first().getDocker || shape.sourceRemoved === true || !(shape.dockers.first().getDocker().getDockedShape() || outgoings[shape.resourceId]))) {

        shape.dockers = shape.dockers.map(function (docker, i) {

          if ((shape.sourceRemoved === true && i == 0 && docker.getDocker)) {
            docker = docker.getDocker().bounds.center();
          }

          if (this.clipboard.useOffset) {
            return {
              x: docker.x + ORYX.CONFIG.COPY_MOVE_OFFSET,
              y: docker.y + ORYX.CONFIG.COPY_MOVE_OFFSET,
              getDocker: docker.getDocker
            };
          } else {
            return {
              x: docker.x,
              y: docker.y,
              getDocker: docker.getDocker
            };
          }
        }.bind(this));
      }

      return shape;
    }.bind(this), false, true);

    this.clipboard.useOffset = true;
    this.facade.importJSON(canvas);
  },

  /**
   * Performs the delete operation. No more asking.
   */
  editDelete: function () {
    var selection = this.facade.getSelection();

    if (selection.length > 0) {
      //only update the command stack if something was performed...
      var clipboard = new ORYX.Plugins.Edit.ClipBoard();
      clipboard.refresh(selection, this.getAllShapesToConsider(selection));

      var command = new ORYX.Plugins.Edit.DeleteCommand(clipboard, this.facade);

      this.facade.executeCommands([command]);
    }
  }
});

ORYX.Plugins.Edit.ClipBoard = Clazz.extend({
  construct: function () {
    this.shapesAsJson = [];
    this.selection = [];
    this.SSnamespace = "";
    this.useOffset = true;
  },
  isOccupied: function () {
    return this.shapesAsJson.length > 0;
  },
  refresh: function (selection, shapes, namespace, useNoOffset) {
    this.selection = selection;
    this.SSnamespace = namespace;
    // Store outgoings, targets and parents to restore them later on
    this.outgoings = {};
    this.parents = {};
    this.targets = {};
    this.useOffset = useNoOffset !== true;

    this.shapesAsJson = shapes.map(function (shape) {
      var s = shape.toJSON();
      s.parent = {resourceId: shape.getParentShape().resourceId};
      s.parentIndex = shape.getParentShape().getChildShapes().indexOf(shape)
      return s;
    });
  }
});

ORYX.Plugins.Edit.DeleteCommand = ORYX.Core.Command.extend({
  construct: function (clipboard, facade) {
    this.clipboard = clipboard;
    this.shapesAsJson = clipboard.shapesAsJson;
    this.facade = facade;

    // Store dockers of deleted shapes to restore connections
    this.dockers = this.shapesAsJson.map(function (shapeAsJson) {
      var shape = shapeAsJson.getShape();
      var incomingDockers = shape.getIncomingShapes().map(function (s) {
        return s.getDockers().last();
      });
      var outgoingDockers = shape.getOutgoingShapes().map(function (s) {
        return s.getDockers().first();
      });
      var dockers = shape.getDockers().concat(incomingDockers, outgoingDockers).compact().map(function (docker) {
        return {
          object: docker,
          referencePoint: docker.referencePoint,
          dockedShape: docker.getDockedShape()
        };
      });
      return dockers;
    }).flatten();
  },
  execute: function () {
    this.shapesAsJson.each(function (shapeAsJson) {
      // Delete shape
      this.facade.deleteShape(shapeAsJson.getShape());
    }.bind(this));

    this.facade.setSelection([]);
    this.facade.getCanvas().update();
    this.facade.updateSelection();
    this.facade.handleEvents({type: ORYX.CONFIG.ACTION_DELETE_COMPLETED});

  },
  rollback: function () {
    this.shapesAsJson.each(function (shapeAsJson) {
      var shape = shapeAsJson.getShape();
      var parent = this.facade.getCanvas().getChildShapeByResourceId(shapeAsJson.parent.resourceId) || this.facade.getCanvas();
      parent.add(shape, shape.parentIndex);
    }.bind(this));

    //reconnect shapes
    this.dockers.each(function (d) {
      d.object.setDockedShape(d.dockedShape);
      d.object.setReferencePoint(d.referencePoint);
    }.bind(this));

    this.facade.setSelection(this.selectedShapes);
    this.facade.getCanvas().update();
    this.facade.updateSelection();

  }
});

/**
 * @namespace Oryx name space for plugins
 * @name ORYX.Plugins
 */


/**
 * The view plugin offers all of zooming functionality accessible over the
 * tool bar. This are zoom in, zoom out, zoom to standard, zoom fit to model.
 *
 * @class ORYX.Plugins.View
 * @extends Clazz
 * @param {Object} facade The editor facade for plugins.
 */
ORYX.Plugins.View = {
  /** @lends ORYX.Plugins.View.prototype */
  facade: undefined,

  construct: function (facade, ownPluginData) {
    this.facade = facade;
    //Standard Values
    this.zoomLevel = 1.0;
    this.maxFitToScreenLevel = 1.5;
    this.minZoomLevel = 0.1;
    this.maxZoomLevel = 2.5;
    this.diff = 5; //difference between canvas and view port, s.th. like toolbar??

    //Read properties
    if (ownPluginData !== undefined && ownPluginData !== null) {
      ownPluginData.get('properties').each(function (property) {
        if (property.zoomLevel) {
          this.zoomLevel = Number(1.0);
        }
        if (property.maxFitToScreenLevel) {
          this.maxFitToScreenLevel = Number(property.maxFitToScreenLevel);
        }
        if (property.minZoomLevel) {
          this.minZoomLevel = Number(property.minZoomLevel);
        }
        if (property.maxZoomLevel) {
          this.maxZoomLevel = Number(property.maxZoomLevel);
        }
      }.bind(this));
    }


    /* Register zoom in */
    this.facade.offer({
      'name': ORYX.I18N.View.zoomIn,
      'functionality': this.zoom.bind(this, [1.0 + ORYX.CONFIG.ZOOM_OFFSET]),
      'group': ORYX.I18N.View.group,
      'icon': ORYX.PATH + "images/magnifier_zoom_in.png",
      'description': ORYX.I18N.View.zoomInDesc,
      'index': 1,
      'minShape': 0,
      'maxShape': 0,
      'isEnabled': function () {
        return this.zoomLevel < this.maxZoomLevel
      }.bind(this)
    });

    /* Register zoom out */
    this.facade.offer({
      'name': ORYX.I18N.View.zoomOut,
      'functionality': this.zoom.bind(this, [1.0 - ORYX.CONFIG.ZOOM_OFFSET]),
      'group': ORYX.I18N.View.group,
      'icon': ORYX.PATH + "images/magnifier_zoom_out.png",
      'description': ORYX.I18N.View.zoomOutDesc,
      'index': 2,
      'minShape': 0,
      'maxShape': 0,
      'isEnabled': function () {
        return this._checkSize()
      }.bind(this)
    });

    /* Register zoom standard */
    this.facade.offer({
      'name': ORYX.I18N.View.zoomStandard,
      'functionality': this.setAFixZoomLevel.bind(this, 1),
      'group': ORYX.I18N.View.group,
      'icon': ORYX.PATH + "images/zoom_standard.png",
      'cls': 'icon-large',
      'description': ORYX.I18N.View.zoomStandardDesc,
      'index': 3,
      'minShape': 0,
      'maxShape': 0,
      'isEnabled': function () {
        return this.zoomLevel != 1
      }.bind(this)
    });

    /* Register zoom fit to model */
    this.facade.offer({
      'name': ORYX.I18N.View.zoomFitToModel,
      'functionality': this.zoomFitToModel.bind(this),
      'group': ORYX.I18N.View.group,
      'icon': ORYX.PATH + "images/image.png",
      'description': ORYX.I18N.View.zoomFitToModelDesc,
      'index': 4,
      'minShape': 0,
      'maxShape': 0
    });
  },

  /**
   * It sets the zoom level to a fix value and call the zooming function.
   *
   * @param {Number} zoomLevel
   *      the zoom level
   */
  setAFixZoomLevel: function (zoomLevel) {
    this.zoomLevel = zoomLevel;
    this._checkZoomLevelRange();
    this.zoom(1);
  },

  /**
   * It does the actual zooming. It changes the viewable size of the canvas
   * and all to its child elements.
   *
   * @param {Number} factor
   *    the factor to adjust the zoom level
   */
  zoom: function (factor) {
    // TODO: Zoomen auf allen Objekten im SVG-DOM

    this.zoomLevel *= factor;
    var scrollNode = this.facade.getCanvas().getHTMLContainer().parentNode.parentNode;
    var canvas = this.facade.getCanvas();
    var newWidth = canvas.bounds.width() * this.zoomLevel;
    var newHeight = canvas.bounds.height() * this.zoomLevel;

    /* Set new top offset */
    var offsetTop = (canvas.node.parentNode.parentNode.parentNode.offsetHeight - newHeight) / 2.0;
    offsetTop = offsetTop > 20 ? offsetTop - 20 : 0;
    canvas.node.parentNode.parentNode.style.marginTop = offsetTop + "px";
    offsetTop += 5;
    canvas.getHTMLContainer().style.top = offsetTop + "px";

    /*readjust scrollbar*/
    var newScrollTop = scrollNode.scrollTop - Math.round((canvas.getHTMLContainer().parentNode.getHeight() - newHeight) / 2) + this.diff;
    var newScrollLeft = scrollNode.scrollLeft - Math.round((canvas.getHTMLContainer().parentNode.getWidth() - newWidth) / 2) + this.diff;

    /* Set new Zoom-Level */
    canvas.setSize({width: newWidth, height: newHeight}, true);

    /* Set Scale-Factor */
    canvas.node.setAttributeNS(null, "transform", "scale(" + this.zoomLevel + ")");

    /* Refresh the Selection */
    this.facade.updateSelection();
    scrollNode.scrollTop = newScrollTop;
    scrollNode.scrollLeft = newScrollLeft;

    /* Update the zoom-level*/
    canvas.zoomLevel = this.zoomLevel;
  },


  /**
   * It calculates the zoom level to fit whole model into the visible area
   * of the canvas. Than the model gets zoomed and the position of the
   * scroll bars are adjusted.
   *
   */
  zoomFitToModel: function () {

    /* Get the size of the visible area of the canvas */
    var scrollNode = this.facade.getCanvas().getHTMLContainer().parentNode.parentNode;
    var visibleHeight = scrollNode.getHeight() - 30;
    var visibleWidth = scrollNode.getWidth() - 30;

    var nodes = this.facade.getCanvas().getChildShapes();

    if (!nodes || nodes.length < 1) {
      return false;
    }

    /* Calculate size of canvas to fit the model */
    var bounds = nodes[0].absoluteBounds().clone();
    nodes.each(function (node) {
      bounds.include(node.absoluteBounds().clone());
    });


    /* Set new Zoom Level */
    var scaleFactorWidth = visibleWidth / bounds.width();
    var scaleFactorHeight = visibleHeight / bounds.height();

    /* Choose the smaller zoom level to fit the whole model */
    var zoomFactor = scaleFactorHeight < scaleFactorWidth ? scaleFactorHeight : scaleFactorWidth;

    /*Test if maximum zoom is reached*/
    if (zoomFactor > this.maxFitToScreenLevel) {
      zoomFactor = this.maxFitToScreenLevel
    }
    /* Do zooming */
    this.setAFixZoomLevel(zoomFactor);

    /* Set scroll bar position */
    scrollNode.scrollTop = Math.round(bounds.upperLeft().y * this.zoomLevel) - 5;
    scrollNode.scrollLeft = Math.round(bounds.upperLeft().x * this.zoomLevel) - 5;

  },

  /**
   * It checks if the zoom level is less or equal to the level, which is required
   * to schow the whole canvas.
   *
   * @private
   */
  _checkSize: function () {
    var canvasParent = this.facade.getCanvas().getHTMLContainer().parentNode;
    var minForCanvas = Math.min((canvasParent.parentNode.getWidth() / canvasParent.getWidth()), (canvasParent.parentNode.getHeight() / canvasParent.getHeight()));
    return 1.05 > minForCanvas;

  },
  /**
   * It checks if the zoom level is included in the definined zoom
   * level range.
   *
   * @private
   */
  _checkZoomLevelRange: function () {
    /*var canvasParent=this.facade.getCanvas().getHTMLContainer().parentNode;
		var maxForCanvas= Math.max((canvasParent.parentNode.getWidth()/canvasParent.getWidth()),(canvasParent.parentNode.getHeight()/canvasParent.getHeight()));
		if(this.zoomLevel > maxForCanvas) {
			this.zoomLevel = maxForCanvas;
		}*/
    if (this.zoomLevel < this.minZoomLevel) {
      this.zoomLevel = this.minZoomLevel;
    }

    if (this.zoomLevel > this.maxZoomLevel) {
      this.zoomLevel = this.maxZoomLevel;
    }
  }
};

ORYX.Plugins.View = Clazz.extend(ORYX.Plugins.View);


/**
 * This plugin is responsible for displaying loading indicators and to prevent
 * the user from accidently unloading the page by, e.g., pressing the backspace
 * button and returning to the previous site in history.
 * @param {Object} facade The editor plugin facade to register enhancements with.
 */
ORYX.Plugins.Loading = {

  construct: function (facade) {

    this.facade = facade;

    // The parent Node
    this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", this.facade.getCanvas().getHTMLContainer().parentNode, ['div', {
      'class': 'LoadingIndicator'
    }, '']);

    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADING_ENABLE, this.enableLoading.bind(this));
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADING_DISABLE, this.disableLoading.bind(this));
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADING_STATUS, this.showStatus.bind(this));

    this.disableLoading();
  },

  enableLoading: function (options) {
    if (options.text)
      this.node.innerHTML = options.text + "...";
    else
      this.node.innerHTML = ORYX.I18N.Loading.waiting;
    this.node.removeClassName('StatusIndicator');
    this.node.addClassName('LoadingIndicator');
    this.node.style.display = "block";

    var pos = this.facade.getCanvas().rootNode.parentNode.parentNode.parentNode.parentNode;

    this.node.style.top = pos.offsetTop + 'px';
    this.node.style.left = pos.offsetLeft + 'px';

  },

  disableLoading: function () {
    this.node.style.display = "none";
  },

  showStatus: function (options) {
    if (options.text) {
      this.node.innerHTML = options.text;
      this.node.addClassName('StatusIndicator');
      this.node.removeClassName('LoadingIndicator');
      this.node.style.display = 'block';

      var pos = this.facade.getCanvas().rootNode.parentNode.parentNode.parentNode.parentNode;

      this.node.style.top = pos.offsetTop + 'px';
      this.node.style.left = pos.offsetLeft + 'px';

      var tout = options.timeout ? options.timeout : 2000;

      window.setTimeout((function () {

        this.disableLoading();

      }).bind(this), tout);
    }

  }
}

ORYX.Plugins.Loading = Clazz.extend(ORYX.Plugins.Loading);

/**
 * This plugin is responsible for resizing the canvas.
 * @param {Object} facade The editor plugin facade to register enhancements with.
 */
ORYX.Plugins.CanvasResize = Clazz.extend({
  construct: function (facade) {

    this.facade = facade;
    new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(), "N", this.resize.bind(this));
    new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(), "W", this.resize.bind(this));
    new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(), "E", this.resize.bind(this));
    new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(), "S", this.resize.bind(this));

    window.setTimeout(function () {
      jQuery(window).trigger('resize');
    });

  },

  resize: function (position, shrink) {

    resizeCanvas = function (position, extentionSize, facade) {
      var canvas = facade.getCanvas();
      var b = canvas.bounds;
      var scrollNode = facade.getCanvas().getHTMLContainer().parentNode.parentNode;

      if (position == "E" || position == "W") {
        canvas.setSize({width: (b.width() + extentionSize) * canvas.zoomLevel, height: (b.height()) * canvas.zoomLevel})

      } else if (position == "S" || position == "N") {
        canvas.setSize({width: (b.width()) * canvas.zoomLevel, height: (b.height() + extentionSize) * canvas.zoomLevel})
      }

      if (position == "N" || position == "W") {

        var move = position == "N" ? {x: 0, y: extentionSize} : {x: extentionSize, y: 0};

        // Move all children
        canvas.getChildNodes(false, function (shape) {
          shape.bounds.moveBy(move)
        })
        // Move all dockers, when the edge has at least one docked shape
        var edges = canvas.getChildEdges().findAll(function (edge) {
          return edge.getAllDockedShapes().length > 0
        })
        var dockers = edges.collect(function (edge) {
          return edge.dockers.findAll(function (docker) {
            return !docker.getDockedShape()
          })
        }).flatten();
        dockers.each(function (docker) {
          docker.bounds.moveBy(move)
        })
      } else if (position == "S") {
        scrollNode.scrollTop += extentionSize;
      } else if (position == "E") {
        scrollNode.scrollLeft += extentionSize;
      }

      jQuery(window).trigger('resize');

      canvas.update();
      facade.updateSelection();
    }

    var commandClass = ORYX.Core.Command.extend({
      construct: function (position, extentionSize, facade) {
        this.position = position;
        this.extentionSize = extentionSize;
        this.facade = facade;
      },
      execute: function () {
        resizeCanvas(this.position, this.extentionSize, this.facade);
      },
      rollback: function () {
        resizeCanvas(this.position, -this.extentionSize, this.facade);
      },
      update: function () {
      }
    });

    var extentionSize = ORYX.CONFIG.CANVAS_RESIZE_INTERVAL;
    if (shrink) extentionSize = -extentionSize;
    var command = new commandClass(position, extentionSize, this.facade);

    this.facade.executeCommands([command]);

  }

});

ORYX.Plugins.CanvasResizeButton = Clazz.extend({
  construct: function (canvas, position, callback) {
    this.canvas = canvas;
    var parentNode = canvas.getHTMLContainer().parentNode;

    window.myParent = parentNode;

    var actualScrollNode = jQuery('#canvasSection')[0];
    var scrollNode = actualScrollNode;
    var canvasNode = $$("#canvasSection .ORYX_Editor")[0];
    var svgRootNode = canvasNode.children[0];

    var iconClass = 'glyphicon glyphicon-chevron-';
    var iconClassShrink = 'glyphicon glyphicon-chevron-';
    if (position == 'N') {
      iconClass += 'up';
      iconClassShrink += 'down';
    } else if (position == 'S') {
      iconClass += 'down';
      iconClassShrink += 'up';
    } else if (position == 'E') {
      iconClass += 'right';
      iconClassShrink += 'left';
    } else if (position == 'W') {
      iconClass += 'left';
      iconClassShrink += 'right';
    }

    // The buttons
    var idGrow = 'canvas-shrink-' + position;
    var idShrink = 'canvas-grow-' + position;

    var buttonGrow = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", parentNode, ['div', {
      'class': 'canvas_resize_indicator canvas_resize_indicator_grow' + ' ' + position,
      'id': idGrow,
      'title': ORYX.I18N.RESIZE.tipGrow + ORYX.I18N.RESIZE[position]
    },
      ['i', {'class': iconClass}]
    ]);
    var buttonShrink = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", parentNode, ['div', {
      'class': 'canvas_resize_indicator canvas_resize_indicator_shrink' + ' ' + position,
      'id': idShrink,
      'title': ORYX.I18N.RESIZE.tipGrow + ORYX.I18N.RESIZE[position]
    },
      ['i', {'class': iconClassShrink}]
    ]);
    // Defines a callback which gives back
    // a boolean if the current mouse event
    // is over the particular button area
    var offSetWidth = 60;
    var isOverOffset = function (event) {

      var isOverButton = event.target.id.indexOf("canvas-shrink") != -1
        || event.target.id.indexOf("canvas-grow") != -1
        || event.target.parentNode.id.indexOf("canvas-shrink") != -1
        || event.target.parentNode.id.indexOf("canvas-grow") != -1;
      if (isOverButton) {
        if (event.target.id == idGrow || event.target.id == idShrink ||
          event.target.parentNode.id == idGrow || event.target.parentNode.id == idShrink) {
          return true;
        } else {
          return false;
        }
      }

      if (event.target != parentNode && event.target != scrollNode && event.target != scrollNode.firstChild && event.target != svgRootNode && event.target != scrollNode) {
        return false;
      }

      //if(inCanvas){offSetWidth=30}else{offSetWidth=30*2}
      //Safari work around
      var X = event.offsetX !== undefined ? event.offsetX : event.layerX;
      var Y = event.offsetY !== undefined ? event.offsetY : event.layerY;

      var canvasOffset = 0;
      if (canvasNode.clientWidth < actualScrollNode.clientWidth) {
        var widthDiff = actualScrollNode.clientWidth - canvasNode.clientWidth;
        canvasOffset = widthDiff / 2;
      }

      // Adjust to relative location to the actual viewport
      Y = Y - actualScrollNode.scrollTop;
      X = X - actualScrollNode.scrollLeft;


      if (position == "N") {
        return Y < offSetWidth;
      } else if (position == "W") {
        return X < offSetWidth + canvasOffset;
      } else if (position == "E") {
        return actualScrollNode.clientWidth - X < offSetWidth + canvasOffset;
      } else if (position == "S") {
        return actualScrollNode.clientHeight - Y < offSetWidth;
      }

      return false;
    };

    var showButtons = (function () {
      buttonGrow.show();

      var w = canvas.bounds.width();
      var h = canvas.bounds.height();

      if (position == "N" && (h - ORYX.CONFIG.CANVAS_RESIZE_INTERVAL > ORYX.CONFIG.CANVAS_MIN_HEIGHT)) buttonShrink.show();
      else if (position == "E" && (w - ORYX.CONFIG.CANVAS_RESIZE_INTERVAL > ORYX.CONFIG.CANVAS_MIN_WIDTH)) buttonShrink.show();
      else if (position == "S" && (h - ORYX.CONFIG.CANVAS_RESIZE_INTERVAL > ORYX.CONFIG.CANVAS_MIN_HEIGHT)) buttonShrink.show();
      else if (position == "W" && (w - ORYX.CONFIG.CANVAS_RESIZE_INTERVAL > ORYX.CONFIG.CANVAS_MIN_WIDTH)) buttonShrink.show();
      else buttonShrink.hide();


    }).bind(this);

    var hideButtons = function () {
      buttonGrow.hide();
      buttonShrink.hide();
    };

    // If the mouse move is over the button area, show the button
    parentNode.parentNode.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, function (event) {
      if (isOverOffset(event)) {
        showButtons();
      } else {
        hideButtons()
      }
    }, false);
    // If the mouse is over the button, show them
    buttonGrow.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER, function (event) {
      showButtons();
    }, true);
    buttonShrink.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER, function (event) {
      showButtons();
    }, true);
    // If the mouse is out, hide the button
    //scrollNode.addEventListener(		ORYX.CONFIG.EVENT_MOUSEOUT, 	function(event){button.hide()}, true )
    parentNode.parentNode.addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT, function (event) {
      hideButtons()
    }, true);
    //svgRootNode.addEventListener(	ORYX.CONFIG.EVENT_MOUSEOUT, 	function(event){ inCanvas = false } , true );

    // Hide the button initialy
    hideButtons();

    // Add the callbacks
    buttonGrow.addEventListener('click', function () {
      callback(position);
      showButtons();
    }, true);
    buttonShrink.addEventListener('click', function () {
      callback(position, true);
      showButtons();
    }, true);

  }


});

ORYX.Plugins.RenameShapes = Clazz.extend({

  facade: undefined,

  construct: function (facade) {

    this.facade = facade;

    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_CANVAS_SCROLL, this.hideField.bind(this));
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK, this.actOnDBLClick.bind(this));
    this.facade.offer({
      keyCodes: [{
        keyCode: 113, // F2-Key
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.renamePerF2.bind(this)
    });


    document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN, this.hide.bind(this), true);
  },

  /**
   * This method handles the "F2" key down event. The selected shape are looked
   * up and the editing of title/name of it gets started.
   */
  renamePerF2: function () {
    var selectedShapes = this.facade.getSelection();
    this.actOnDBLClick(undefined, selectedShapes.first());
  },

  actOnDBLClick: function (evt, shape) {

    if (!(shape instanceof ORYX.Core.Shape)) {
      return;
    }

    // Destroys the old input, if there is one
    this.destroy();

    // Get all properties which where at least one ref to view is set
    var props = shape.getStencil().properties().findAll(function (item) {
      return (item.refToView()
        && item.refToView().length > 0
        && item.directlyEditable());
    });
    // from these, get all properties where write access are and the type is String or Expression
    props = props.findAll(function (item) {
      return !item.readonly() && (item.type() == ORYX.CONFIG.TYPE_STRING || item.type() == ORYX.CONFIG.TYPE_EXPRESSION || item.type() == ORYX.CONFIG.TYPE_DATASOURCE);
    });

    // Get all ref ids
    var allRefToViews = props.collect(function (prop) {
      return prop.refToView();
    }).flatten().compact();
    // Get all labels from the shape with the ref ids
    var labels = shape.getLabels().findAll(function (label) {
      return allRefToViews.any(function (toView) {
        return label.id.endsWith(toView);
      });
    });

    // If there are no referenced labels --> return
    if (labels.length == 0) {
      return;
    }

    // Define the nearest label
    var nearestLabel = labels.length <= 1 ? labels[0] : null;
    if (!nearestLabel) {
      nearestLabel = labels.find(function (label) {
        return label.node == evt.target || label.node == evt.target.parentNode;
      });
      if (!nearestLabel) {

        var evtCoord = this.facade.eventCoordinates(evt);

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
          evtCoord.x = evtCoord.x / additionalIEZoom;
          evtCoord.y = evtCoord.y / additionalIEZoom;
        }

        evtCoord.y += $("editor-header").clientHeight - $("canvasSection").scrollTop - 5;
        if (FLOWABLE.HEADER_CONFIG.showAppTitle == false) {
          evtCoord.y += 61;
        }

        evtCoord.x -= $("canvasSection").scrollLeft;

        var trans = this.facade.getCanvas().rootNode.lastChild.getScreenCTM();
        evtCoord.x *= trans.a;
        evtCoord.y *= trans.d;

        var diff = labels.collect(function (label) {
          var center = this.getCenterPosition(label.node);
          var len = Math.sqrt(Math.pow(center.x - evtCoord.x, 2) + Math.pow(center.y - evtCoord.y, 2));
          return {diff: len, label: label};
        }.bind(this));

        diff.sort(function (a, b) {
          return a.diff > b.diff;
        });

        nearestLabel = diff[0].label;

      }
    }
    // Get the particular property for the label
    var prop = props.find(function (item) {
      return item.refToView().any(function (toView) {
        return nearestLabel.id == shape.id + toView;
      });
    });

    // Get the center position from the nearest label
    var width = Math.min(Math.max(100, shape.bounds.width()), 200);
    var center = this.getCenterPosition(nearestLabel.node, shape);
    center.x -= (width / 2);
    var propId = prop.prefix() + "-" + prop.id();
    var textInput = document.createElement("textarea");
    textInput.id = 'shapeTextInput';
    textInput.style.position = 'absolute';
    textInput.style.width = width + 'px';
    textInput.style.left = (center.x < 10) ? 10 : center.x + 'px';
    textInput.style.top = (center.y - 15) + 'px';
    textInput.className = 'x-form-textarea x-form-field x_form_text_set_absolute';
    textInput.value = shape.properties.get(propId);
    this.oldValueText = shape.properties.get(propId);
    document.getElementById('canvasSection').appendChild(textInput);
    this.shownTextField = textInput;


    // Value change listener needs to be defined now since we reference it in the text field
    this.updateValueFunction = function (newValue, oldValue) {
      var currentEl = shape;
      var facade = this.facade;

      if (oldValue != newValue) {
        // Implement the specific command for property change
        var commandClass = ORYX.Core.Command.extend({
          construct: function () {
            this.el = currentEl;
            this.propId = propId;
            this.oldValue = oldValue;
            this.newValue = newValue;
            this.facade = facade;
          },
          execute: function () {
            this.el.setProperty(this.propId, this.newValue);
            //this.el.update();
            this.facade.setSelection([this.el]);
            this.facade.getCanvas().update();
            this.facade.updateSelection();
          },
          rollback: function () {
            this.el.setProperty(this.propId, this.oldValue);
            //this.el.update();
            this.facade.setSelection([this.el]);
            this.facade.getCanvas().update();
            this.facade.updateSelection();
          }
        });
        // Instantiated the class
        var command = new commandClass();

        // Execute the command
        this.facade.executeCommands([command]);
      }
    }.bind(this);

    jQuery("#shapeTextInput").focus();

    jQuery("#shapeTextInput").autogrow();

    // Disable the keydown in the editor (that when hitting the delete button, the shapes not get deleted)
    this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);

  },

  getCenterPosition: function (svgNode, shape) {

    if (!svgNode) {
      return {x: 0, y: 0};
    }

    var scale = this.facade.getCanvas().node.getScreenCTM();
    var absoluteXY = shape.bounds.upperLeft();

    var hasParent = true;
    var searchShape = shape;
    while (hasParent) {
      if (searchShape.getParentShape().getStencil().idWithoutNs() === 'BPMNDiagram' || searchShape.getParentShape().getStencil().idWithoutNs() === 'CMMNDiagram') {
        hasParent = false;
      }
      else {
        var parentXY = searchShape.getParentShape().bounds.upperLeft();
        absoluteXY.x += parentXY.x;
        absoluteXY.y += parentXY.y;
        searchShape = searchShape.getParentShape();
      }
    }

    var center = shape.bounds.midPoint();
    center.x += absoluteXY.x + scale.e;
    center.y += absoluteXY.y + scale.f;

    center.x *= scale.a;
    center.y *= scale.d;

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

    if (additionalIEZoom === 1) {
      center.y = center.y - jQuery("#canvasSection").offset().top + 5;
      center.x -= jQuery("#canvasSection").offset().left;

    } else {
      var canvasOffsetLeft = jQuery("#canvasSection").offset().left;
      var canvasScrollLeft = jQuery("#canvasSection").scrollLeft();
      var canvasScrollTop = jQuery("#canvasSection").scrollTop();

      var offset = scale.e - (canvasOffsetLeft * additionalIEZoom);
      var additionaloffset = 0;
      if (offset > 10) {
        additionaloffset = (offset / additionalIEZoom) - offset;
      }
      center.y = center.y - (jQuery("#canvasSection").offset().top * additionalIEZoom) + 5 + ((canvasScrollTop * additionalIEZoom) - canvasScrollTop);
      center.x = center.x - (canvasOffsetLeft * additionalIEZoom) + additionaloffset + ((canvasScrollLeft * additionalIEZoom) - canvasScrollLeft);
    }


    return center;
  },

  hide: function (e) {
    if (this.shownTextField && (!e || e.target !== this.shownTextField)) {
      var newValue = this.shownTextField.value;
      if (newValue !== this.oldValueText) {
        this.updateValueFunction(newValue, this.oldValueText);
      }
      this.destroy();
    }
  },

  hideField: function (e) {
    if (this.shownTextField) {
      this.destroy();
    }
  },

  destroy: function (e) {
    var textInputComp = jQuery("#shapeTextInput");
    if (textInputComp) {
      textInputComp.remove();
      delete this.shownTextField;

      this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
    }
  }
});

/**
 * Supports EPCs by offering a syntax check and export and import ability..
 *
 *
 */
ORYX.Plugins.ProcessLink = Clazz.extend({

  facade: undefined,

  /**
   * Offers the plugin functionality:
   *
   */
  construct: function (facade) {

    this.facade = facade;

    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPERTY_CHANGED, this.propertyChanged.bind(this));

  },


  /**
   *
   * @param {Object} option
   */
  propertyChanged: function (option, node) {

    if (option.name !== "oryx-refuri" || !node instanceof ORYX.Core.Node) {
      return
    }


    if (option.value && option.value.length > 0 && option.value != "undefined") {

      this.show(node, option.value);

    } else {

      this.hide(node);

    }

  },

  /**
   * Shows the Link for a particular shape with a specific url
   *
   * @param {Object} shape
   * @param {Object} url
   */
  show: function (shape, url) {


    // Generate the svg-representation of a link
    var link = ORYX.Editor.graft("http://www.w3.org/2000/svg", null,
      ['a',
        {'target': '_blank'},
        ['path',
          {
            "stroke-width": 1.0,
            "stroke": "#00DD00",
            "fill": "#00AA00",
            "d": "M3,3 l0,-2.5 l7.5,0 l0,-2.5 l7.5,4.5 l-7.5,3.5 l0,-2.5 l-8,0",
            "line-captions": "round"
          }
        ]
      ]);

    var link = ORYX.Editor.graft("http://www.w3.org/2000/svg", null,
      ['a',
        {'target': '_blank'},
        ['path', {
          "style": "fill:#92BFFC;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.72",
          "d": "M0 1.44 L0 15.05 L11.91 15.05 L11.91 5.98 L7.37 1.44 L0 1.44 Z"
        }],
        ['path', {
          "style": "stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.72;fill:none;",
          "transform": "translate(7.5, -8.5)",
          "d": "M0 10.51 L0 15.05 L4.54 15.05"
        }],
        ['path', {
          "style": "fill:#f28226;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.72",
          "transform": "translate(-3, -1)",
          "d": "M0 8.81 L0 13.06 L5.95 13.06 L5.95 15.05 A50.2313 50.2313 -175.57 0 0 10.77 11.08 A49.9128 49.9128 -1.28 0 0 5.95 6.54 L5.95 8.81 L0 8.81 Z"
        }],
      ]);

    /*
	 *
	 * 					[ 'a',
						{'target': '_blank'},
						['path', { "style": "fill:none;stroke-width:0.5px; stroke:#000000", "d": "M7,4 l0,2"}],
						['path', { "style": "fill:none;stroke-width:0.5px; stroke:#000000", "d": "M4,8 l-2,0 l0,6"}],
						['path', { "style": "fill:none;stroke-width:0.5px; stroke:#000000", "d": "M10,8 l2,0 l0,6"}],
						['rect', { "style": "fill:#96ff96;stroke:#000000;stroke-width:1", "width": 6, "height": 4, "x": 4, "y": 0}],
						['rect', { "style": "fill:#ffafff;stroke:#000000;stroke-width:1", "width": 6, "height": 4, "x": 4, "y": 6}],
						['rect', { "style": "fill:#96ff96;stroke:#000000;stroke-width:1", "width": 6, "height": 4, "x": 0, "y": 12}],
						['rect', { "style": "fill:#96ff96;stroke:#000000;stroke-width:1", "width": 6, "height": 4, "x": 8, "y": 12}],
						['rect', { "style": "fill:none;stroke:none;pointer-events:all", "width": 14, "height": 16, "x": 0, "y": 0}]
					]);
	 */

    // Set the link with the special namespace
    link.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", url);


    // Shows the link in the overlay
    this.facade.raiseEvent({
      type: ORYX.CONFIG.EVENT_OVERLAY_SHOW,
      id: "arissupport.urlref_" + shape.id,
      shapes: [shape],
      node: link,
      nodePosition: "SE"
    });

  },

  /**
   * Hides the Link for a particular shape
   *
   * @param {Object} shape
   */
  hide: function (shape) {

    this.facade.raiseEvent({
      type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
      id: "arissupport.urlref_" + shape.id
    });

  }
});

Array.prototype.insertFrom = function (from, to) {
  to = Math.max(0, to);
  from = Math.min(Math.max(0, from), this.length - 1);

  var el = this[from];
  var old = this.without(el);
  var newA = old.slice(0, to);
  newA.push(el);
  if (old.length > to) {
    newA = newA.concat(old.slice(to))
  }
  ;
  return newA;
}

ORYX.Plugins.Arrangement = ORYX.Plugins.AbstractPlugin.extend({

  facade: undefined,

  construct: function (facade) {
    this.facade = facade;

    // Z-Ordering
    /** Hide for SIGNAVIO

     this.facade.offer({
			'name':ORYX.I18N.Arrangement.btf,
			'functionality': this.setZLevel.bind(this, this.setToTop),
			'group': ORYX.I18N.Arrangement.groupZ,
			'icon': ORYX.PATH + "images/shape_move_front.png",
			'description': ORYX.I18N.Arrangement.btfDesc,
			'index': 1,
			'minShape': 1});

     this.facade.offer({
			'name':ORYX.I18N.Arrangement.btb,
			'functionality': this.setZLevel.bind(this, this.setToBack),
			'group': ORYX.I18N.Arrangement.groupZ,
			'icon': ORYX.PATH + "images/shape_move_back.png",
			'description': ORYX.I18N.Arrangement.btbDesc,
			'index': 2,
			'minShape': 1});

     this.facade.offer({
			'name':ORYX.I18N.Arrangement.bf,
			'functionality': this.setZLevel.bind(this, this.setForward),
			'group': ORYX.I18N.Arrangement.groupZ,
			'icon': ORYX.PATH + "images/shape_move_forwards.png",
			'description': ORYX.I18N.Arrangement.bfDesc,
			'index': 3,
			'minShape': 1});

     this.facade.offer({
			'name':ORYX.I18N.Arrangement.bb,
			'functionality': this.setZLevel.bind(this, this.setBackward),
			'group': ORYX.I18N.Arrangement.groupZ,
			'icon': ORYX.PATH + "images/shape_move_backwards.png",
			'description': ORYX.I18N.Arrangement.bbDesc,
			'index': 4,
			'minShape': 1});

     // Aligment
     this.facade.offer({
			'name':ORYX.I18N.Arrangement.ab,
			'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_BOTTOM]),
			'group': ORYX.I18N.Arrangement.groupA,
			'icon': ORYX.PATH + "images/shape_align_bottom.png",
			'description': ORYX.I18N.Arrangement.abDesc,
			'index': 1,
			'minShape': 2});



     this.facade.offer({
			'name':ORYX.I18N.Arrangement.at,
			'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_TOP]),
			'group': ORYX.I18N.Arrangement.groupA,
			'icon': ORYX.PATH + "images/shape_align_top.png",
			'description': ORYX.I18N.Arrangement.atDesc,
			'index': 3,
			'minShape': 2});

     this.facade.offer({
			'name':ORYX.I18N.Arrangement.al,
			'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_LEFT]),
			'group': ORYX.I18N.Arrangement.groupA,
			'icon': ORYX.PATH + "images/shape_align_left.png",
			'description': ORYX.I18N.Arrangement.alDesc,
			'index': 4,
			'minShape': 2});

     this.facade.offer({
			'name':ORYX.I18N.Arrangement.ar,
			'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_RIGHT]),
			'group': ORYX.I18N.Arrangement.groupA,
			'icon': ORYX.PATH + "images/shape_align_right.png",
			'description': ORYX.I18N.Arrangement.arDesc,
			'index': 6,
			'minShape': 2});

     **/

    this.facade.offer({
      'name': ORYX.I18N.Arrangement.am,
      'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_MIDDLE]),
      'group': ORYX.I18N.Arrangement.groupA,
      'icon': ORYX.PATH + "images/shape_align_middle.png",
      'description': ORYX.I18N.Arrangement.amDesc,
      'index': 1,
      'minShape': 2
    });

    this.facade.offer({
      'name': ORYX.I18N.Arrangement.ac,
      'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_CENTER]),
      'group': ORYX.I18N.Arrangement.groupA,
      'icon': ORYX.PATH + "images/shape_align_center.png",
      'description': ORYX.I18N.Arrangement.acDesc,
      'index': 2,
      'minShape': 2
    });


    this.facade.offer({
      'name': ORYX.I18N.Arrangement.as,
      'functionality': this.alignShapes.bind(this, [ORYX.CONFIG.EDITOR_ALIGN_SIZE]),
      'group': ORYX.I18N.Arrangement.groupA,
      'icon': ORYX.PATH + "images/shape_align_size.png",
      'description': ORYX.I18N.Arrangement.asDesc,
      'index': 3,
      'minShape': 2
    });


    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_TOP, this.setZLevel.bind(this, this.setToTop));
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_BACK, this.setZLevel.bind(this, this.setToBack));
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_FORWARD, this.setZLevel.bind(this, this.setForward));
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_BACKWARD, this.setZLevel.bind(this, this.setBackward));


  },

  onSelectionChanged: function (elemnt) {
    var selection = this.facade.getSelection();
    if (selection.length === 1 && selection[0] instanceof ORYX.Core.Edge) {
      this.setToTop(selection);
    }
  },

  setZLevel: function (callback, event) {

    //Command-Pattern for dragging one docker
    var zLevelCommand = ORYX.Core.Command.extend({
      construct: function (callback, elements, facade) {
        this.callback = callback;
        this.elements = elements;
        // For redo, the previous elements get stored
        this.elAndIndex = elements.map(function (el) {
          return {el: el, previous: el.parent.children[el.parent.children.indexOf(el) - 1]}
        })
        this.facade = facade;
      },
      execute: function () {

        // Call the defined z-order callback with the elements
        this.callback(this.elements)
        this.facade.setSelection(this.elements)
      },
      rollback: function () {

        // Sort all elements on the index of there containment
        var sortedEl = this.elAndIndex.sortBy(function (el) {
          var value = el.el;
          var t = $A(value.node.parentNode.childNodes);
          return t.indexOf(value.node);
        });

        // Every element get setted back bevor the old previous element
        for (var i = 0; i < sortedEl.length; i++) {
          var el = sortedEl[i].el;
          var p = el.parent;
          var oldIndex = p.children.indexOf(el);
          var newIndex = p.children.indexOf(sortedEl[i].previous);
          newIndex = newIndex || 0
          p.children = p.children.insertFrom(oldIndex, newIndex)
          el.node.parentNode.insertBefore(el.node, el.node.parentNode.childNodes[newIndex + 1]);
        }

        // Reset the selection
        this.facade.setSelection(this.elements)
      }
    });

    // Instanziate the dockCommand
    var command = new zLevelCommand(callback, this.facade.getSelection(), this.facade);
    if (event.excludeCommand) {
      command.execute();
    } else {
      this.facade.executeCommands([command]);
    }

  },

  setToTop: function (elements) {

    // Sortieren des Arrays nach dem Index des SVGKnotens im Bezug auf dem Elternknoten.
    var tmpElem = elements.sortBy(function (value, index) {
      var t = $A(value.node.parentNode.childNodes);
      return t.indexOf(value.node);
    });
    // Sortiertes Array wird nach oben verschoben.
    tmpElem.each(function (value) {
      var p = value.parent;
      if (p.children.last() === value) {
        return;
      }
      p.children = p.children.without(value)
      p.children.push(value);
      value.node.parentNode.appendChild(value.node);
    });
  },

  setToBack: function (elements) {
    // Sortieren des Arrays nach dem Index des SVGKnotens im Bezug auf dem Elternknoten.
    var tmpElem = elements.sortBy(function (value, index) {
      var t = $A(value.node.parentNode.childNodes);
      return t.indexOf(value.node);
    });

    tmpElem = tmpElem.reverse();

    // Sortiertes Array wird nach unten verschoben.
    tmpElem.each(function (value) {
      var p = value.parent
      p.children = p.children.without(value)
      p.children.unshift(value);
      value.node.parentNode.insertBefore(value.node, value.node.parentNode.firstChild);
    });


  },

  setBackward: function (elements) {
    // Sortieren des Arrays nach dem Index des SVGKnotens im Bezug auf dem Elternknoten.
    var tmpElem = elements.sortBy(function (value, index) {
      var t = $A(value.node.parentNode.childNodes);
      return t.indexOf(value.node);
    });

    // Reverse the elements
    tmpElem = tmpElem.reverse();

    // Delete all Nodes who are the next Node in the nodes-Array
    var compactElem = tmpElem.findAll(function (el) {
      return !tmpElem.some(function (checkedEl) {
        return checkedEl.node == el.node.previousSibling
      })
    });

    // Sortiertes Array wird nach eine Ebene nach oben verschoben.
    compactElem.each(function (el) {
      if (el.node.previousSibling === null) {
        return;
      }
      var p = el.parent;
      var index = p.children.indexOf(el);
      p.children = p.children.insertFrom(index, index - 1)
      el.node.parentNode.insertBefore(el.node, el.node.previousSibling);
    });


  },

  setForward: function (elements) {
    // Sortieren des Arrays nach dem Index des SVGKnotens im Bezug auf dem Elternknoten.
    var tmpElem = elements.sortBy(function (value, index) {
      var t = $A(value.node.parentNode.childNodes);
      return t.indexOf(value.node);
    });


    // Delete all Nodes who are the next Node in the nodes-Array
    var compactElem = tmpElem.findAll(function (el) {
      return !tmpElem.some(function (checkedEl) {
        return checkedEl.node == el.node.nextSibling
      })
    });


    // Sortiertes Array wird eine Ebene nach unten verschoben.
    compactElem.each(function (el) {
      var nextNode = el.node.nextSibling
      if (nextNode === null) {
        return;
      }
      var index = el.parent.children.indexOf(el);
      var p = el.parent;
      p.children = p.children.insertFrom(index, index + 1)
      el.node.parentNode.insertBefore(nextNode, el.node);
    });
  },


  alignShapes: function (way) {

    var elements = this.facade.getSelection();

    // Set the elements to all Top-Level elements
    elements = this.facade.getCanvas().getShapesWithSharedParent(elements);
    // Get only nodes
    elements = elements.findAll(function (value) {
      return (value instanceof ORYX.Core.Node)
    });
    // Delete all attached intermediate events from the array
    elements = elements.findAll(function (value) {
      var d = value.getIncomingShapes()
      return d.length == 0 || !elements.include(d[0])
    });
    if (elements.length < 2) {
      return;
    }

    // get bounds of all shapes.
    var bounds = elements[0].absoluteBounds().clone();
    elements.each(function (shape) {
      bounds.include(shape.absoluteBounds().clone());
    });

    // get biggest width and heigth
    var maxWidth = 0;
    var maxHeight = 0;
    elements.each(function (shape) {
      maxWidth = Math.max(shape.bounds.width(), maxWidth);
      maxHeight = Math.max(shape.bounds.height(), maxHeight);
    });

    var commandClass = ORYX.Core.Command.extend({
      construct: function (elements, bounds, maxHeight, maxWidth, way, plugin) {
        this.elements = elements;
        this.bounds = bounds;
        this.maxHeight = maxHeight;
        this.maxWidth = maxWidth;
        this.way = way;
        this.facade = plugin.facade;
        this.plugin = plugin;
        this.orgPos = [];
      },
      setBounds: function (shape, maxSize) {
        if (!maxSize)
          maxSize = {width: ORYX.CONFIG.MAXIMUM_SIZE, height: ORYX.CONFIG.MAXIMUM_SIZE};

        if (!shape.bounds) {
          throw "Bounds not definined."
        }

        var newBounds = {
          a: {
            x: shape.bounds.upperLeft().x - (this.maxWidth - shape.bounds.width()) / 2,
            y: shape.bounds.upperLeft().y - (this.maxHeight - shape.bounds.height()) / 2
          },
          b: {
            x: shape.bounds.lowerRight().x + (this.maxWidth - shape.bounds.width()) / 2,
            y: shape.bounds.lowerRight().y + (this.maxHeight - shape.bounds.height()) / 2
          }
        }

        /* If the new width of shape exceeds the maximum width, set width value to maximum. */
        if (this.maxWidth > maxSize.width) {
          newBounds.a.x = shape.bounds.upperLeft().x -
            (maxSize.width - shape.bounds.width()) / 2;

          newBounds.b.x = shape.bounds.lowerRight().x + (maxSize.width - shape.bounds.width()) / 2
        }

        /* If the new height of shape exceeds the maximum height, set height value to maximum. */
        if (this.maxHeight > maxSize.height) {
          newBounds.a.y = shape.bounds.upperLeft().y -
            (maxSize.height - shape.bounds.height()) / 2;

          newBounds.b.y = shape.bounds.lowerRight().y + (maxSize.height - shape.bounds.height()) / 2
        }

        /* set bounds of shape */
        shape.bounds.set(newBounds);

      },
      execute: function () {
        // align each shape according to the way that was specified.
        this.elements.each(function (shape, index) {
          this.orgPos[index] = shape.bounds.upperLeft();

          var relBounds = this.bounds.clone();
          var newCoordinates;
          if (shape.parent && !(shape.parent instanceof ORYX.Core.Canvas)) {
            var upL = shape.parent.absoluteBounds().upperLeft();
            relBounds.moveBy(-upL.x, -upL.y);
          }

          switch (this.way) {
            // align the shapes in the requested way.
            case ORYX.CONFIG.EDITOR_ALIGN_BOTTOM:
              newCoordinates = {
                x: shape.bounds.upperLeft().x,
                y: relBounds.b.y - shape.bounds.height()
              };
              break;

            case ORYX.CONFIG.EDITOR_ALIGN_MIDDLE:
              newCoordinates = {
                x: shape.bounds.upperLeft().x,
                y: (relBounds.a.y + relBounds.b.y - shape.bounds.height()) / 2
              };
              break;

            case ORYX.CONFIG.EDITOR_ALIGN_TOP:
              newCoordinates = {
                x: shape.bounds.upperLeft().x,
                y: relBounds.a.y
              };
              break;

            case ORYX.CONFIG.EDITOR_ALIGN_LEFT:
              newCoordinates = {
                x: relBounds.a.x,
                y: shape.bounds.upperLeft().y
              };
              break;

            case ORYX.CONFIG.EDITOR_ALIGN_CENTER:
              newCoordinates = {
                x: (relBounds.a.x + relBounds.b.x - shape.bounds.width()) / 2,
                y: shape.bounds.upperLeft().y
              };
              break;

            case ORYX.CONFIG.EDITOR_ALIGN_RIGHT:
              newCoordinates = {
                x: relBounds.b.x - shape.bounds.width(),
                y: shape.bounds.upperLeft().y
              };
              break;

            case ORYX.CONFIG.EDITOR_ALIGN_SIZE:
              if (shape.isResizable) {
                this.orgPos[index] = {a: shape.bounds.upperLeft(), b: shape.bounds.lowerRight()};
                this.setBounds(shape, shape.maximumSize);
              }
              break;
          }

          if (newCoordinates) {
            var offset = {
              x: shape.bounds.upperLeft().x - newCoordinates.x,
              y: shape.bounds.upperLeft().y - newCoordinates.y
            }
            // Set the new position
            shape.bounds.moveTo(newCoordinates);
            this.plugin.layoutEdges(shape, shape.getAllDockedShapes(), offset);
            //shape.update()
          }
        }.bind(this));

        //this.facade.getCanvas().update();
        //this.facade.updateSelection();
      },
      rollback: function () {
        this.elements.each(function (shape, index) {
          if (this.way == ORYX.CONFIG.EDITOR_ALIGN_SIZE) {
            if (shape.isResizable) {
              shape.bounds.set(this.orgPos[index]);
            }
          } else {
            shape.bounds.moveTo(this.orgPos[index]);
          }
        }.bind(this));

        //this.facade.getCanvas().update();
        //this.facade.updateSelection();
      }
    })

    var command = new commandClass(elements, bounds, maxHeight, maxWidth, parseInt(way), this);

    this.facade.executeCommands([command]);
  }
});

ORYX.Plugins.Save = Clazz.extend({

  facade: undefined,

  processURI: undefined,

  changeSymbol: "*",

  construct: function (facade) {
    this.facade = facade;

    document.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.keyCode === 83) {
        Event.stop(e);
      }
    }, false);

    window.onbeforeunload = this.onUnLoad.bind(this);

    this.changeDifference = 0;

    // Register on event for executing commands --> store all commands in a stack
    // --> Execute
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE, function () {
      this.changeDifference++;
      this.updateTitle();
    }.bind(this));
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS, function () {
      this.changeDifference++;
      this.updateTitle();
    }.bind(this));
    // --> Saved from other places in the editor
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SAVED, function () {
      this.changeDifference = 0;
      this.updateTitle();
    }.bind(this));

    // --> Rollback
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK, function () {
      this.changeDifference--;
      this.updateTitle();
    }.bind(this));

    //TODO very critical for load time performance!!!
    //this.serializedDOM = DataManager.__persistDOM(this.facade);

    this.hasChanges = this._hasChanges.bind(this);
  },

  updateTitle: function () {

    var value = window.document.title || document.getElementsByTagName("title")[0].childNodes[0].nodeValue;

    if (this.changeDifference === 0 && value.startsWith(this.changeSymbol)) {
      window.document.title = value.slice(1);
    } else if (this.changeDifference !== 0 && !value.startsWith(this.changeSymbol)) {
      window.document.title = this.changeSymbol + "" + value;
    }
  },

  _hasChanges: function () {
    return this.changeDifference !== 0 || (this.facade.getModelMetaData()['new'] && this.facade.getCanvas().getChildShapes().size() > 0);
  },

  onUnLoad: function () {
    if (this._hasChanges()) {
      return ORYX.I18N.Save.unsavedData;
    }
  }
});

ORYX.Plugins.DragDropResize = ORYX.Plugins.AbstractPlugin.extend({

  /**
   *  Constructor
   *  @param {Object} Facade: The Facade of the Editor
   */
  construct: function (facade) {
    this.facade = facade;

    // Initialize variables
    this.currentShapes = [];			// Current selected Shapes
    //this.pluginsData 		= [];			// Available Plugins
    this.toMoveShapes = [];			// Shapes there will be moved
    this.distPoints = [];			// Distance Points for Snap on Grid
    this.isResizing = false;		// Flag: If there was currently resized
    this.dragEnable = false;		// Flag: If Dragging is enabled
    this.dragIntialized = false;		// Flag: If the Dragging is initialized
    this.edgesMovable = true;			// Flag: If an edge is docked it is not movable
    this.offSetPosition = {x: 0, y: 0};	// Offset of the Dragging
    this.faktorXY = {x: 1, y: 1};	// The Current Zoom-Faktor
    this.containmentParentNode;				// the current future parent node for the dragged shapes
    this.isAddingAllowed = false;		// flag, if adding current selected shapes to containmentParentNode is allowed
    this.isAttachingAllowed = false;		// flag, if attaching to the current shape is allowed

    this.callbackMouseMove = this.handleMouseMove.bind(this);
    this.callbackMouseUp = this.handleMouseUp.bind(this);

    // Get the SVG-Containernode
    var containerNode = this.facade.getCanvas().getSvgContainer();

    // Create the Selected Rectangle in the SVG
    this.selectedRect = new ORYX.Plugins.SelectedRect(containerNode);

    // Show grid line if enabled
    if (ORYX.CONFIG.SHOW_GRIDLINE) {
      this.vLine = new ORYX.Plugins.GridLine(containerNode, ORYX.Plugins.GridLine.DIR_VERTICAL);
      this.hLine = new ORYX.Plugins.GridLine(containerNode, ORYX.Plugins.GridLine.DIR_HORIZONTAL);
    }

    // Get a HTML-ContainerNode
    containerNode = this.facade.getCanvas().getHTMLContainer();

    this.scrollNode = this.facade.getCanvas().rootNode.parentNode.parentNode;

    // Create the southeastern button for resizing
    this.resizerSE = new ORYX.Plugins.Resizer(containerNode, "southeast", this.facade);
    this.resizerSE.registerOnResize(this.onResize.bind(this)); // register the resize callback
    this.resizerSE.registerOnResizeEnd(this.onResizeEnd.bind(this)); // register the resize end callback
    this.resizerSE.registerOnResizeStart(this.onResizeStart.bind(this)); // register the resize start callback

    // Create the northwestern button for resizing
    this.resizerNW = new ORYX.Plugins.Resizer(containerNode, "northwest", this.facade);
    this.resizerNW.registerOnResize(this.onResize.bind(this)); // register the resize callback
    this.resizerNW.registerOnResizeEnd(this.onResizeEnd.bind(this)); // register the resize end callback
    this.resizerNW.registerOnResizeStart(this.onResizeStart.bind(this)); // register the resize start callback

    // For the Drag and Drop
    // Register on MouseDown-Event on a Shape
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));
  },

  /**
   * On Mouse Down
   *
   */
  handleMouseDown: function (event, uiObj) {
    // If the selection Bounds not intialized and the uiObj is not member of current selectio
    // then return
    if (!this.dragBounds || !this.currentShapes.member(uiObj) || !this.toMoveShapes.length) {
      return;
    }
    ;

    // Start Dragging
    this.dragEnable = true;
    this.dragIntialized = true;
    this.edgesMovable = true;

    // Calculate the current zoom factor
    var a = this.facade.getCanvas().node.getScreenCTM();
    this.faktorXY.x = a.a;
    this.faktorXY.y = a.d;

    var eventX = Event.pointerX(event);
    var eventY = Event.pointerY(event);

    // Set the offset position of dragging
    var upL = this.dragBounds.upperLeft();
    this.offSetPosition = {
      x: eventX - (upL.x * this.faktorXY.x),
      y: eventY - (upL.y * this.faktorXY.y)
    };

    this.offsetScroll = {x: this.scrollNode.scrollLeft, y: this.scrollNode.scrollTop};

    // Register on Global Mouse-MOVE Event
    document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.callbackMouseMove, false);
    // Register on Global Mouse-UP Event
    document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.callbackMouseUp, true);

    return;
  },

  /**
   * On Key Mouse Up
   *
   */
  handleMouseUp: function (event) {

    //disable containment highlighting
    this.facade.raiseEvent({
      type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
      highlightId: "dragdropresize.contain"
    });

    this.facade.raiseEvent({
      type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
      highlightId: "dragdropresize.attached"
    });

    // If Dragging is finished
    if (this.dragEnable) {

      // and update the current selection
      if (!this.dragIntialized) {

        // Do Method after Dragging
        this.afterDrag();

        // Check if the Shape is allowed to dock to the other Shape
        if (this.isAttachingAllowed &&
          this.toMoveShapes.length == 1 && this.toMoveShapes[0] instanceof ORYX.Core.Node &&
          this.toMoveShapes[0].dockers.length > 0) {

          // Get the position and the docker
          var position = this.facade.eventCoordinates(event);
          var docker = this.toMoveShapes[0].dockers[0];


          //Command-Pattern for dragging several Shapes
          var dockCommand = ORYX.Core.Command.extend({
            construct: function (docker, position, newDockedShape, facade) {
              this.docker = docker;
              this.newPosition = position;
              this.newDockedShape = newDockedShape;
              this.newParent = newDockedShape.parent || facade.getCanvas();
              this.oldPosition = docker.parent.bounds.center();
              this.oldDockedShape = docker.getDockedShape();
              this.oldParent = docker.parent.parent || facade.getCanvas();
              this.facade = facade;

              if (this.oldDockedShape) {
                this.oldPosition = docker.parent.absoluteBounds().center();
              }

            },
            execute: function () {
              this.dock(this.newDockedShape, this.newParent, this.newPosition);

              // Raise Event for having the docked shape on top of the other shape
              this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_ARRANGEMENT_TOP, excludeCommand: true})
            },
            rollback: function () {
              this.dock(this.oldDockedShape, this.oldParent, this.oldPosition);
            },
            dock: function (toDockShape, parent, pos) {
              // Add to the same parent Shape
              parent.add(this.docker.parent)


              // Set the Docker to the new Shape
              this.docker.setDockedShape(undefined);
              this.docker.bounds.centerMoveTo(pos)
              this.docker.setDockedShape(toDockShape);
              //this.docker.update();

              this.facade.setSelection([this.docker.parent]);
              this.facade.getCanvas().update();
              this.facade.updateSelection();


            }
          });

          // Instanziate the dockCommand
          var commands = [new dockCommand(docker, position, this.containmentParentNode, this.facade)];
          this.facade.executeCommands(commands);


          // Check if adding is allowed to the other Shape
        } else if (this.isAddingAllowed) {


          // Refresh all Shapes --> Set the new Bounds
          this.refreshSelectedShapes();

        }

        this.facade.updateSelection();

        //this.currentShapes.each(function(shape) {shape.update()})
        // Raise Event: Dragging is finished
        this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_DRAGDROP_END});
      }

      if (this.vLine)
        this.vLine.hide();
      if (this.hLine)
        this.hLine.hide();
    }

    // Disable
    this.dragEnable = false;


    // UnRegister on Global Mouse-UP/-Move Event
    document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.callbackMouseUp, true);
    document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.callbackMouseMove, false);

    return;
  },

  /**
   * On Key Mouse Move
   *
   */
  handleMouseMove: function (event) {
    // If dragging is not enabled, go return
    if (!this.dragEnable) {
      return
    }
    ;
    // If Dragging is initialized
    if (this.dragIntialized) {
      // Raise Event: Drag will be started
      this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_DRAGDROP_START});
      this.dragIntialized = false;

      // And hide the resizers and the highlighting
      this.resizerSE.hide();
      this.resizerNW.hide();

      // if only edges are selected, containmentParentNode must be the canvas
      this._onlyEdges = this.currentShapes.all(function (currentShape) {
        return (currentShape instanceof ORYX.Core.Edge);
      });

      // Do method before Drag
      this.beforeDrag();

      this._currentUnderlyingNodes = [];

    }


    // Calculate the new position
    var position = {
      x: Event.pointerX(event) - this.offSetPosition.x,
      y: Event.pointerY(event) - this.offSetPosition.y
    }

    position.x -= this.offsetScroll.x - this.scrollNode.scrollLeft;
    position.y -= this.offsetScroll.y - this.scrollNode.scrollTop;

    // If not the Control-Key are pressed
    var modifierKeyPressed = event.shiftKey || event.ctrlKey;
    if (ORYX.CONFIG.GRID_ENABLED && !modifierKeyPressed) {
      // Snap the current position to the nearest Snap-Point
      position = this.snapToGrid(position);
    } else {
      if (this.vLine)
        this.vLine.hide();
      if (this.hLine)
        this.hLine.hide();
    }

    // Adjust the point by the zoom faktor
    position.x /= this.faktorXY.x;
    position.y /= this.faktorXY.y;

    // Set that the position is not lower than zero
    position.x = Math.max(0, position.x)
    position.y = Math.max(0, position.y)

    // Set that the position is not bigger than the canvas
    var c = this.facade.getCanvas();
    position.x = Math.min(c.bounds.width() - this.dragBounds.width(), position.x)
    position.y = Math.min(c.bounds.height() - this.dragBounds.height(), position.y)


    // Drag this bounds
    this.dragBounds.moveTo(position);

    // Update all selected shapes and the selection rectangle
    //this.refreshSelectedShapes();
    this.resizeRectangle(this.dragBounds);

    this.isAttachingAllowed = false;

    //check, if a node can be added to the underlying node
    var eventCoordinates = this.facade.eventCoordinates(event);

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
      eventCoordinates.x = eventCoordinates.x / additionalIEZoom;
      eventCoordinates.y = eventCoordinates.y / additionalIEZoom;
    }

    var underlyingNodes = $A(this.facade.getCanvas().getAbstractShapesAtPosition(eventCoordinates));

    var checkIfAttachable = this.toMoveShapes.length == 1 && this.toMoveShapes[0] instanceof ORYX.Core.Node && this.toMoveShapes[0].dockers.length > 0
    checkIfAttachable = checkIfAttachable && underlyingNodes.length != 1


    if (!checkIfAttachable &&
      underlyingNodes.length === this._currentUnderlyingNodes.length &&
      underlyingNodes.all(function (node, index) {
        return this._currentUnderlyingNodes[index] === node
      }.bind(this))) {

      return

    } else if (this._onlyEdges) {

      this.isAddingAllowed = true;
      this.containmentParentNode = this.facade.getCanvas();

    } else {

      /* Check the containment and connection rules */
      var options = {
        event: event,
        underlyingNodes: underlyingNodes,
        checkIfAttachable: checkIfAttachable
      };
      this.checkRules(options);

    }

    this._currentUnderlyingNodes = underlyingNodes.reverse();

    //visualize the containment result
    if (this.isAttachingAllowed) {

      this.facade.raiseEvent({
        type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
        highlightId: "dragdropresize.attached",
        elements: [this.containmentParentNode],
        style: ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
        color: ORYX.CONFIG.SELECTION_VALID_COLOR
      });

    } else {

      this.facade.raiseEvent({
        type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
        highlightId: "dragdropresize.attached"
      });
    }

    if (!this.isAttachingAllowed) {
      if (this.isAddingAllowed) {

        this.facade.raiseEvent({
          type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
          highlightId: "dragdropresize.contain",
          elements: [this.containmentParentNode],
          color: ORYX.CONFIG.SELECTION_VALID_COLOR
        });

      } else {

        this.facade.raiseEvent({
          type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
          highlightId: "dragdropresize.contain",
          elements: [this.containmentParentNode],
          color: ORYX.CONFIG.SELECTION_INVALID_COLOR
        });

      }
    } else {
      this.facade.raiseEvent({
        type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
        highlightId: "dragdropresize.contain"
      });
    }

    // Stop the Event
    //Event.stop(event);
    return;
  },

//	/**
//	 * Rollbacks the docked shape of an edge, if the edge is not movable.
//	 */
//	redockEdges: function() {
//		this._undockedEdgesCommand.dockers.each(function(el){
//			el.docker.setDockedShape(el.dockedShape);
//			el.docker.setReferencePoint(el.refPoint);
//		})
//	},

  /**
   *  Checks the containment and connection rules for the selected shapes.
   */
  checkRules: function (options) {
    var event = options.event;
    var underlyingNodes = options.underlyingNodes;
    var checkIfAttachable = options.checkIfAttachable;
    var noEdges = options.noEdges;

    //get underlying node that is not the same than one of the currently selected shapes or
    // a child of one of the selected shapes with the highest z Order.
    // The result is a shape or the canvas
    this.containmentParentNode = underlyingNodes.reverse().find((function (node) {
      return (node instanceof ORYX.Core.Canvas) ||
        (((node instanceof ORYX.Core.Node) || ((node instanceof ORYX.Core.Edge) && !noEdges))
          && (!(this.currentShapes.member(node) ||
            this.currentShapes.any(function (shape) {
              return (shape.children.length > 0 && shape.getChildNodes(true).member(node));
            }))));
    }).bind(this));

    if (checkIfAttachable) {

      this.isAttachingAllowed = this.facade.getRules().canConnect({
        sourceShape: this.containmentParentNode,
        edgeShape: this.toMoveShapes[0],
        targetShape: this.toMoveShapes[0]
      });

      if (this.isAttachingAllowed) {
        var point = this.facade.eventCoordinates(event);
        this.isAttachingAllowed = this.containmentParentNode.isPointOverOffset(point.x, point.y);
      }
    }

    if (!this.isAttachingAllowed) {
      //check all selected shapes, if they can be added to containmentParentNode
      this.isAddingAllowed = this.toMoveShapes.all((function (currentShape) {
        if (currentShape instanceof ORYX.Core.Edge ||
          currentShape instanceof ORYX.Core.Controls.Docker ||
          this.containmentParentNode === currentShape.parent) {
          return true;
        } else if (this.containmentParentNode !== currentShape) {

          if (!(this.containmentParentNode instanceof ORYX.Core.Edge) || !noEdges) {

            if (this.facade.getRules().canContain({
              containingShape: this.containmentParentNode,
              containedShape: currentShape
            })) {
              return true;
            }
          }
        }
        return false;
      }).bind(this));
    }

    if (!this.isAttachingAllowed && !this.isAddingAllowed &&
      (this.containmentParentNode instanceof ORYX.Core.Edge)) {
      options.noEdges = true;
      options.underlyingNodes.reverse();
      this.checkRules(options);
    }
  },

  /**
   * Redraw the selected Shapes.
   *
   */
  refreshSelectedShapes: function () {
    // If the selection bounds not initialized, return
    if (!this.dragBounds) {
      return
    }

    // Calculate the offset between the bounds and the old bounds
    var upL = this.dragBounds.upperLeft();
    var oldUpL = this.oldDragBounds.upperLeft();
    var offset = {
      x: upL.x - oldUpL.x,
      y: upL.y - oldUpL.y
    };

    // Instanciate the dragCommand
    var commands = [new ORYX.Core.Command.Move(this.toMoveShapes, offset, this.containmentParentNode, this.currentShapes, this)];
    // If the undocked edges command is setted, add this command
    if (this._undockedEdgesCommand instanceof ORYX.Core.Command) {
      commands.unshift(this._undockedEdgesCommand);
    }
    // Execute the commands
    this.facade.executeCommands(commands);

    // copy the bounds to the old bounds
    if (this.dragBounds)
      this.oldDragBounds = this.dragBounds.clone();

  },

  /**
   * Callback for Resize
   *
   */
  onResize: function (bounds) {
    // If the selection bounds not initialized, return
    if (!this.dragBounds) {
      return
    }

    this.dragBounds = bounds;
    this.isResizing = true;

    // Update the rectangle
    this.resizeRectangle(this.dragBounds);
  },

  onResizeStart: function () {
    this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_RESIZE_START});
  },

  onResizeEnd: function () {

    if (!(this.currentShapes instanceof Array) || this.currentShapes.length <= 0) {
      return;
    }

    // If Resizing finished, the Shapes will be resize
    if (this.isResizing) {

      var commandClass = ORYX.Core.Command.extend({
        construct: function (shape, newBounds, plugin) {
          this.shape = shape;
          this.oldBounds = shape.bounds.clone();
          this.newBounds = newBounds;
          this.plugin = plugin;
        },
        execute: function () {
          this.shape.bounds.set(this.newBounds.a, this.newBounds.b);
          this.update(this.getOffset(this.oldBounds, this.newBounds));

        },
        rollback: function () {
          this.shape.bounds.set(this.oldBounds.a, this.oldBounds.b);
          this.update(this.getOffset(this.newBounds, this.oldBounds))
        },

        getOffset: function (b1, b2) {
          return {
            x: b2.a.x - b1.a.x,
            y: b2.a.y - b1.a.y,
            xs: b2.width() / b1.width(),
            ys: b2.height() / b1.height()
          }
        },
        update: function (offset) {
          this.shape.getLabels().each(function (label) {
            label.changed();
          });

          var allEdges = [].concat(this.shape.getIncomingShapes())
            .concat(this.shape.getOutgoingShapes())
            // Remove all edges which are included in the selection from the list
            .findAll(function (r) {
              return r instanceof ORYX.Core.Edge
            }.bind(this))

          this.plugin.layoutEdges(this.shape, allEdges, offset);

          this.plugin.facade.setSelection([this.shape]);
          this.plugin.facade.getCanvas().update();
          this.plugin.facade.updateSelection();
        }
      });

      var bounds = this.dragBounds.clone();
      var shape = this.currentShapes[0];

      if (shape.parent) {
        var parentPosition = shape.parent.absoluteXY();
        bounds.moveBy(-parentPosition.x, -parentPosition.y);
      }

      var command = new commandClass(shape, bounds, this);

      this.facade.executeCommands([command]);

      this.isResizing = false;

      this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_RESIZE_END});
    }
  },


  /**
   * Prepare the Dragging
   *
   */
  beforeDrag: function () {

    var undockEdgeCommand = ORYX.Core.Command.extend({
      construct: function (moveShapes) {
        this.dockers = moveShapes.collect(function (shape) {
          return shape instanceof ORYX.Core.Controls.Docker ? {
            docker: shape,
            dockedShape: shape.getDockedShape(),
            refPoint: shape.referencePoint
          } : undefined
        }).compact();
      },
      execute: function () {
        this.dockers.each(function (el) {
          el.docker.setDockedShape(undefined);
        })
      },
      rollback: function () {
        this.dockers.each(function (el) {
          el.docker.setDockedShape(el.dockedShape);
          el.docker.setReferencePoint(el.refPoint);
          //el.docker.update();
        })
      }
    });

    this._undockedEdgesCommand = new undockEdgeCommand(this.toMoveShapes);
    this._undockedEdgesCommand.execute();

  },

  hideAllLabels: function (shape) {

    // Hide all labels from the shape
    shape.getLabels().each(function (label) {
      label.hide();
    });
    // Hide all labels from docked shapes
    shape.getAllDockedShapes().each(function (dockedShape) {
      var labels = dockedShape.getLabels();
      if (labels.length > 0) {
        labels.each(function (label) {
          label.hide();
        });
      }
    });

    // Do this recursive for all child shapes
    // EXP-NICO use getShapes
    shape.getChildren().each((function (value) {
      if (value instanceof ORYX.Core.Shape)
        this.hideAllLabels(value);
    }).bind(this));
  },

  /**
   * Finished the Dragging
   *
   */
  afterDrag: function () {

  },

  /**
   * Show all Labels at these shape
   *
   */
  showAllLabels: function (shape) {

    // Show the label of these shape
    //shape.getLabels().each(function(label) {
    for (var i = 0; i < shape.length; i++) {
      var label = shape[i];
      label.show();
    }//);
    // Show all labels at docked shapes
    //shape.getAllDockedShapes().each(function(dockedShape) {
    var allDockedShapes = shape.getAllDockedShapes()
    for (var i = 0; i < allDockedShapes.length; i++) {
      var dockedShape = allDockedShapes[i];
      var labels = dockedShape.getLabels();
      if (labels.length > 0) {
        labels.each(function (label) {
          label.show();
        });
      }
    }//);

    // Do this recursive
    //shape.children.each((function(value) {
    for (var i = 0; i < shape.children.length; i++) {
      var value = shape.children[i];
      if (value instanceof ORYX.Core.Shape)
        this.showAllLabels(value);
    }//).bind(this));
  },

  /**
   * Intialize Method, if there are new Plugins
   *
   */
  /*registryChanged: function(pluginsData) {
		// Save all new Plugin, sorted by group and index
		this.pluginsData = pluginsData.sortBy( function(value) {
			return (value.group + "" + value.index);
		});
	},*/

  /**
   * On the Selection-Changed
   *
   */
  onSelectionChanged: function (event) {
    var elements = event.elements;

    // Reset the drag-variables
    this.dragEnable = false;
    this.dragIntialized = false;
    this.resizerSE.hide();
    this.resizerNW.hide();

    // If there is no elements
    if (!elements || elements.length == 0) {
      // Hide all things and reset all variables
      this.selectedRect.hide();
      this.currentShapes = [];
      this.toMoveShapes = [];
      this.dragBounds = undefined;
      this.oldDragBounds = undefined;
    } else {

      // Set the current Shapes
      this.currentShapes = elements;

      // Get all shapes with the highest parent in object hierarchy (canvas is the top most parent)
      var topLevelElements = this.facade.getCanvas().getShapesWithSharedParent(elements);
      this.toMoveShapes = topLevelElements;

      this.toMoveShapes = this.toMoveShapes.findAll(function (shape) {
        return shape instanceof ORYX.Core.Node &&
          (shape.dockers.length === 0 || !elements.member(shape.dockers.first().getDockedShape()))
      });

      elements.each((function (shape) {
        if (!(shape instanceof ORYX.Core.Edge)) {
          return;
        }

        var dks = shape.getDockers();

        var hasF = elements.member(dks.first().getDockedShape());
        var hasL = elements.member(dks.last().getDockedShape());

//				if(!hasL) {
//					this.toMoveShapes.push(dks.last());
//				}
//				if(!hasF){
//					this.toMoveShapes.push(dks.first())
//				}
        /* Enable movement of undocked edges */
        if (!hasF && !hasL) {
          var isUndocked = !dks.first().getDockedShape() && !dks.last().getDockedShape();
          if (isUndocked) {
            this.toMoveShapes = this.toMoveShapes.concat(dks);
          }
        }

        if (shape.dockers.length > 2 && hasF && hasL) {
          this.toMoveShapes = this.toMoveShapes.concat(dks.findAll(function (el, index) {
            return index > 0 && index < dks.length - 1
          }));
        }

      }).bind(this));

      // Calculate the new area-bounds of the selection
      var newBounds = undefined;
      this.toMoveShapes.each(function (value) {
        var shape = value;
        if (value instanceof ORYX.Core.Controls.Docker) {
          /* Get the Shape */
          shape = value.parent;
        }

        if (!newBounds) {
          newBounds = shape.absoluteBounds();
        }
        else {
          newBounds.include(shape.absoluteBounds());
        }
      }.bind(this));

      if (!newBounds) {
        elements.each(function (value) {
          if (!newBounds) {
            newBounds = value.absoluteBounds();
          } else {
            newBounds.include(value.absoluteBounds());
          }
        });
      }

      // Set the new bounds
      this.dragBounds = newBounds;
      this.oldDragBounds = newBounds.clone();

      // Update and show the rectangle
      this.resizeRectangle(newBounds);
      this.selectedRect.show();

      // Show the resize button, if there is only one element and this is resizeable
      if (elements.length == 1 && elements[0].isResizable) {
        var aspectRatio = elements[0].getStencil().fixedAspectRatio() ? elements[0].bounds.width() / elements[0].bounds.height() : undefined;
        this.resizerSE.setBounds(this.dragBounds, elements[0].minimumSize, elements[0].maximumSize, aspectRatio);
        this.resizerSE.show();
        this.resizerNW.setBounds(this.dragBounds, elements[0].minimumSize, elements[0].maximumSize, aspectRatio);
        this.resizerNW.show();
      } else {
        this.resizerSE.setBounds(undefined);
        this.resizerNW.setBounds(undefined);
      }

      // If Snap-To-Grid is enabled, the Snap-Point will be calculate
      if (ORYX.CONFIG.GRID_ENABLED) {

        // Reset all points
        this.distPoints = [];

        if (this.distPointTimeout)
          window.clearTimeout(this.distPointTimeout)

        this.distPointTimeout = window.setTimeout(function () {
          // Get all the shapes, there will consider at snapping
          // Consider only those elements who shares the same parent element
          var distShapes = this.facade.getCanvas().getChildShapes(true).findAll(function (value) {
            var parentShape = value.parent;
            while (parentShape) {
              if (elements.member(parentShape)) return false;
              parentShape = parentShape.parent
            }
            return true;
          })

          // The current selection will delete from this array
          //elements.each(function(shape) {
          //	distShapes = distShapes.without(shape);
          //});

          // For all these shapes
          distShapes.each((function (value) {
            if (!(value instanceof ORYX.Core.Edge)) {
              var ul = value.absoluteXY();
              var width = value.bounds.width();
              var height = value.bounds.height();

              // Add the upperLeft, center and lowerRight - Point to the distancePoints
              this.distPoints.push({
                ul: {
                  x: ul.x,
                  y: ul.y
                },
                c: {
                  x: ul.x + (width / 2),
                  y: ul.y + (height / 2)
                },
                lr: {
                  x: ul.x + width,
                  y: ul.y + height
                }
              });
            }
          }).bind(this));

        }.bind(this), 10)


      }
    }
  },

  /**
   * Adjust an Point to the Snap Points
   *
   */
  snapToGrid: function (position) {

    // Get the current Bounds
    var bounds = this.dragBounds;

    var point = {};

    var ulThres = 6;
    var cThres = 10;
    var lrThres = 6;

    var scale = this.vLine ? this.vLine.getScale() : 1;

    var ul = {x: (position.x / scale), y: (position.y / scale)};
    var c = {x: (position.x / scale) + (bounds.width() / 2), y: (position.y / scale) + (bounds.height() / 2)};
    var lr = {x: (position.x / scale) + (bounds.width()), y: (position.y / scale) + (bounds.height())};

    var offsetX, offsetY;
    var gridX, gridY;

    // For each distant point
    this.distPoints.each(function (value) {

      var x, y, gx, gy;
      if (Math.abs(value.c.x - c.x) < cThres) {
        x = value.c.x - c.x;
        gx = value.c.x;
      }
      /* else if (Math.abs(value.ul.x-ul.x) < ulThres){
				x = value.ul.x-ul.x;
				gx = value.ul.x;
			} else if (Math.abs(value.lr.x-lr.x) < lrThres){
				x = value.lr.x-lr.x;
				gx = value.lr.x;
			} */


      if (Math.abs(value.c.y - c.y) < cThres) {
        y = value.c.y - c.y;
        gy = value.c.y;
      }
      /* else if (Math.abs(value.ul.y-ul.y) < ulThres){
				y = value.ul.y-ul.y;
				gy = value.ul.y;
			} else if (Math.abs(value.lr.y-lr.y) < lrThres){
				y = value.lr.y-lr.y;
				gy = value.lr.y;
			} */

      if (x !== undefined) {
        offsetX = offsetX === undefined ? x : (Math.abs(x) < Math.abs(offsetX) ? x : offsetX);
        if (offsetX === x)
          gridX = gx;
      }

      if (y !== undefined) {
        offsetY = offsetY === undefined ? y : (Math.abs(y) < Math.abs(offsetY) ? y : offsetY);
        if (offsetY === y)
          gridY = gy;
      }
    });


    if (offsetX !== undefined) {
      ul.x += offsetX;
      ul.x *= scale;
      if (this.vLine && gridX)
        this.vLine.update(gridX);
    } else {
      ul.x = (position.x - (position.x % (ORYX.CONFIG.GRID_DISTANCE / 2)));
      if (this.vLine)
        this.vLine.hide()
    }

    if (offsetY !== undefined) {
      ul.y += offsetY;
      ul.y *= scale;
      if (this.hLine && gridY)
        this.hLine.update(gridY);
    } else {
      ul.y = (position.y - (position.y % (ORYX.CONFIG.GRID_DISTANCE / 2)));
      if (this.hLine)
        this.hLine.hide();
    }

    return ul;
  },

  showGridLine: function () {

  },


  /**
   * Redraw of the Rectangle of the SelectedArea
   * @param {Object} bounds
   */
  resizeRectangle: function (bounds) {
    // Resize the Rectangle
    this.selectedRect.resize(bounds);
  }

});

ORYX.Plugins.SelectedRect = Clazz.extend({

  construct: function (parentId) {

    this.parentId = parentId;

    this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", $(parentId),
      ['g']);

    this.dashedArea = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node,
      ['rect', {
        x: 0, y: 0,
        'stroke-width': 1, stroke: '#777777', fill: 'none',
        'stroke-dasharray': '2,2',
        'pointer-events': 'none'
      }]);

    this.hide();

  },

  hide: function () {
    this.node.setAttributeNS(null, 'display', 'none');
  },

  show: function () {
    this.node.setAttributeNS(null, 'display', '');
  },

  resize: function (bounds) {
    var upL = bounds.upperLeft();

    var padding = ORYX.CONFIG.SELECTED_AREA_PADDING;

    this.dashedArea.setAttributeNS(null, 'width', bounds.width() + 2 * padding);
    this.dashedArea.setAttributeNS(null, 'height', bounds.height() + 2 * padding);
    this.node.setAttributeNS(null, 'transform', "translate(" + (upL.x - padding) + ", " + (upL.y - padding) + ")");
  }


});

ORYX.Plugins.GridLine = Clazz.extend({

  construct: function (parentId, direction) {

    if (ORYX.Plugins.GridLine.DIR_HORIZONTAL !== direction && ORYX.Plugins.GridLine.DIR_VERTICAL !== direction) {
      direction = ORYX.Plugins.GridLine.DIR_HORIZONTAL
    }


    this.parent = $(parentId);
    this.direction = direction;
    this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.parent,
      ['g']);

    this.line = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node,
      ['path', {
        'stroke-width': 1, stroke: 'silver', fill: 'none',
        'stroke-dasharray': '5,5',
        'pointer-events': 'none'
      }]);

    this.hide();

  },

  hide: function () {
    this.node.setAttributeNS(null, 'display', 'none');
  },

  show: function () {
    this.node.setAttributeNS(null, 'display', '');
  },

  getScale: function () {
    try {
      return this.parent.parentNode.transform.baseVal.getItem(0).matrix.a;
    } catch (e) {
      return 1;
    }
  },

  update: function (pos) {

    if (this.direction === ORYX.Plugins.GridLine.DIR_HORIZONTAL) {
      var y = pos instanceof Object ? pos.y : pos;
      var cWidth = this.parent.parentNode.parentNode.width.baseVal.value / this.getScale();
      this.line.setAttributeNS(null, 'd', 'M 0 ' + y + ' L ' + cWidth + ' ' + y);
    } else {
      var x = pos instanceof Object ? pos.x : pos;
      var cHeight = this.parent.parentNode.parentNode.height.baseVal.value / this.getScale();
      this.line.setAttributeNS(null, 'd', 'M' + x + ' 0 L ' + x + ' ' + cHeight);
    }

    this.show();
  }


});

ORYX.Plugins.GridLine.DIR_HORIZONTAL = "hor";
ORYX.Plugins.GridLine.DIR_VERTICAL = "ver";

ORYX.Plugins.Resizer = Clazz.extend({

  construct: function (parentId, orientation, facade) {

    this.parentId = parentId;
    this.orientation = orientation;
    this.facade = facade;

    this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", $('canvasSection'),
      ['div', {'class': 'resizer_' + this.orientation, style: 'left:0px; top:0px;position:absolute;'}]);

    this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this), true);
    document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.handleMouseUp.bind(this), true);
    document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.handleMouseMove.bind(this), false);

    this.dragEnable = false;
    this.offSetPosition = {x: 0, y: 0};
    this.bounds = undefined;

    this.canvasNode = this.facade.getCanvas().node;

    this.minSize = undefined;
    this.maxSize = undefined;

    this.aspectRatio = undefined;

    this.resizeCallbacks = [];
    this.resizeStartCallbacks = [];
    this.resizeEndCallbacks = [];
    this.hide();

    // Calculate the Offset
    this.scrollNode = this.node.parentNode.parentNode.parentNode;

  },

  handleMouseDown: function (event) {
    this.dragEnable = true;

    this.offsetScroll = {x: this.scrollNode.scrollLeft, y: this.scrollNode.scrollTop};

    this.offSetPosition = {
      x: Event.pointerX(event) - this.position.x,
      y: Event.pointerY(event) - this.position.y
    };

    this.resizeStartCallbacks.each((function (value) {
      value(this.bounds);
    }).bind(this));

  },

  handleMouseUp: function (event) {
    this.dragEnable = false;
    this.containmentParentNode = null;
    this.resizeEndCallbacks.each((function (value) {
      value(this.bounds);
    }).bind(this));

  },

  handleMouseMove: function (event) {
    if (!this.dragEnable) {
      return
    }

    if (event.shiftKey || event.ctrlKey) {
      this.aspectRatio = this.bounds.width() / this.bounds.height();
    } else {
      this.aspectRatio = undefined;
    }

    var position = {
      x: Event.pointerX(event) - this.offSetPosition.x,
      y: Event.pointerY(event) - this.offSetPosition.y
    };


    position.x -= this.offsetScroll.x - this.scrollNode.scrollLeft;
    position.y -= this.offsetScroll.y - this.scrollNode.scrollTop;

    position.x = Math.min(position.x, this.facade.getCanvas().bounds.width());
    position.y = Math.min(position.y, this.facade.getCanvas().bounds.height());

    var offset = {
      x: position.x - this.position.x,
      y: position.y - this.position.y
    };

    if (this.aspectRatio) {
      // fixed aspect ratio
      newAspectRatio = (this.bounds.width() + offset.x) / (this.bounds.height() + offset.y);
      if (newAspectRatio > this.aspectRatio) {
        offset.x = this.aspectRatio * (this.bounds.height() + offset.y) - this.bounds.width();
      } else if (newAspectRatio < this.aspectRatio) {
        offset.y = (this.bounds.width() + offset.x) / this.aspectRatio - this.bounds.height();
      }
    }

    // respect minimum and maximum sizes of stencil
    if (this.orientation === "northwest") {

      if (this.bounds.width() - offset.x > this.maxSize.width) {
        offset.x = -(this.maxSize.width - this.bounds.width());
        if (this.aspectRatio)
          offset.y = this.aspectRatio * offset.x;
      }
      if (this.bounds.width() - offset.x < this.minSize.width) {
        offset.x = -(this.minSize.width - this.bounds.width());
        if (this.aspectRatio)
          offset.y = this.aspectRatio * offset.x;
      }
      if (this.bounds.height() - offset.y > this.maxSize.height) {
        offset.y = -(this.maxSize.height - this.bounds.height());
        if (this.aspectRatio)
          offset.x = offset.y / this.aspectRatio;
      }
      if (this.bounds.height() - offset.y < this.minSize.height) {
        offset.y = -(this.minSize.height - this.bounds.height());
        if (this.aspectRatio)
          offset.x = offset.y / this.aspectRatio;
      }

    } else { // defaults to southeast
      if (this.bounds.width() + offset.x > this.maxSize.width) {
        offset.x = this.maxSize.width - this.bounds.width();
        if (this.aspectRatio)
          offset.y = this.aspectRatio * offset.x;
      }
      if (this.bounds.width() + offset.x < this.minSize.width) {
        offset.x = this.minSize.width - this.bounds.width();
        if (this.aspectRatio)
          offset.y = this.aspectRatio * offset.x;
      }
      if (this.bounds.height() + offset.y > this.maxSize.height) {
        offset.y = this.maxSize.height - this.bounds.height();
        if (this.aspectRatio)
          offset.x = offset.y / this.aspectRatio;
      }
      if (this.bounds.height() + offset.y < this.minSize.height) {
        offset.y = this.minSize.height - this.bounds.height();
        if (this.aspectRatio)
          offset.x = offset.y / this.aspectRatio;
      }
    }

    if (this.orientation === "northwest") {
      this.bounds.extend({x: -offset.x, y: -offset.y});
      this.bounds.moveBy(offset);
    } else { // defaults to southeast
      this.bounds.extend(offset);
    }

    this.update();

    this.resizeCallbacks.each((function (value) {
      value(this.bounds);
    }).bind(this));

    Event.stop(event);

  },

  registerOnResizeStart: function (callback) {
    if (!this.resizeStartCallbacks.member(callback)) {
      this.resizeStartCallbacks.push(callback);
    }
  },

  unregisterOnResizeStart: function (callback) {
    if (this.resizeStartCallbacks.member(callback)) {
      this.resizeStartCallbacks = this.resizeStartCallbacks.without(callback);
    }
  },

  registerOnResizeEnd: function (callback) {
    if (!this.resizeEndCallbacks.member(callback)) {
      this.resizeEndCallbacks.push(callback);
    }
  },

  unregisterOnResizeEnd: function (callback) {
    if (this.resizeEndCallbacks.member(callback)) {
      this.resizeEndCallbacks = this.resizeEndCallbacks.without(callback);
    }
  },

  registerOnResize: function (callback) {
    if (!this.resizeCallbacks.member(callback)) {
      this.resizeCallbacks.push(callback);
    }
  },

  unregisterOnResize: function (callback) {
    if (this.resizeCallbacks.member(callback)) {
      this.resizeCallbacks = this.resizeCallbacks.without(callback);
    }
  },

  hide: function () {
    this.node.style.display = "none";
  },

  show: function () {
    if (this.bounds)
      this.node.style.display = "";
  },

  setBounds: function (bounds, min, max, aspectRatio) {
    this.bounds = bounds;

    if (!min)
      min = {width: ORYX.CONFIG.MINIMUM_SIZE, height: ORYX.CONFIG.MINIMUM_SIZE};

    if (!max)
      max = {width: ORYX.CONFIG.MAXIMUM_SIZE, height: ORYX.CONFIG.MAXIMUM_SIZE};

    this.minSize = min;
    this.maxSize = max;

    this.aspectRatio = aspectRatio;

    this.update();
  },

  update: function () {
    if (!this.bounds) {
      return;
    }

    var upL = this.bounds.upperLeft();

    if (this.bounds.width() < this.minSize.width) {
      this.bounds.set(upL.x, upL.y, upL.x + this.minSize.width, upL.y + this.bounds.height());
    }
    ;
    if (this.bounds.height() < this.minSize.height) {
      this.bounds.set(upL.x, upL.y, upL.x + this.bounds.width(), upL.y + this.minSize.height);
    }
    ;
    if (this.bounds.width() > this.maxSize.width) {
      this.bounds.set(upL.x, upL.y, upL.x + this.maxSize.width, upL.y + this.bounds.height());
    }
    ;
    if (this.bounds.height() > this.maxSize.height) {
      this.bounds.set(upL.x, upL.y, upL.x + this.bounds.width(), upL.y + this.maxSize.height);
    }
    ;

    var a = this.canvasNode.getScreenCTM();

    upL.x *= a.a;
    upL.y *= a.d;

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

    if (additionalIEZoom === 1) {
      upL.y = upL.y - jQuery("#canvasSection").offset().top + a.f;
      upL.x = upL.x - jQuery("#canvasSection").offset().left + a.e;

    } else {
      var canvasOffsetLeft = jQuery("#canvasSection").offset().left;
      var canvasScrollLeft = jQuery("#canvasSection").scrollLeft();
      var canvasScrollTop = jQuery("#canvasSection").scrollTop();

      var offset = a.e - (canvasOffsetLeft * additionalIEZoom);
      var additionaloffset = 0;
      if (offset > 10) {
        additionaloffset = (offset / additionalIEZoom) - offset;
      }
      upL.y = upL.y - (jQuery("#canvasSection").offset().top * additionalIEZoom) + ((canvasScrollTop * additionalIEZoom) - canvasScrollTop) + a.f;
      upL.x = upL.x - (canvasOffsetLeft * additionalIEZoom) + additionaloffset + ((canvasScrollLeft * additionalIEZoom) - canvasScrollLeft) + a.e;
    }

    if (this.orientation === "northwest") {
      upL.x -= 13;
      upL.y -= 13;
    } else { // defaults to southeast
      upL.x += (a.a * this.bounds.width()) + 3;
      upL.y += (a.d * this.bounds.height()) + 3;
    }

    this.position = upL;

    this.node.style.left = this.position.x + "px";
    this.node.style.top = this.position.y + "px";
  }
});

ORYX.Plugins.DragDocker = Clazz.extend({

  /**
   *  Constructor
   *  @param {Object} Facade: The Facade of the Editor
   */
  construct: function (facade) {
    this.facade = facade;

    // Set the valid and invalid color
    this.VALIDCOLOR = ORYX.CONFIG.SELECTION_VALID_COLOR;
    this.INVALIDCOLOR = ORYX.CONFIG.SELECTION_INVALID_COLOR;

    // Define Variables
    this.shapeSelection = undefined;
    this.docker = undefined;
    this.dockerParent = undefined;
    this.dockerSource = undefined;
    this.dockerTarget = undefined;
    this.lastUIObj = undefined;
    this.isStartDocker = undefined;
    this.isEndDocker = undefined;
    this.undockTreshold = 10;
    this.initialDockerPosition = undefined;
    this.outerDockerNotMoved = undefined;
    this.isValid = false;

    // For the Drag and Drop
    // Register on MouseDown-Event on a Docker
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DOCKERDRAG, this.handleDockerDrag.bind(this));


    // Register on over/out to show / hide a docker
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER, this.handleMouseOver.bind(this));
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT, this.handleMouseOut.bind(this));


  },

  /**
   * MouseOut Handler
   *
   */
  handleMouseOut: function (event, uiObj) {
    // If there is a Docker, hide this
    if (!this.docker && uiObj instanceof ORYX.Core.Controls.Docker) {
      uiObj.hide();
    } else if (!this.docker && uiObj instanceof ORYX.Core.Edge) {
      uiObj.dockers.each(function (docker) {
        docker.hide();
      });
    }
  },

  /**
   * MouseOver Handler
   *
   */
  handleMouseOver: function (event, uiObj) {
    // If there is a Docker, show this
    if (!this.docker && uiObj instanceof ORYX.Core.Controls.Docker) {
      uiObj.show();
    } else if (!this.docker && uiObj instanceof ORYX.Core.Edge) {
      uiObj.dockers.each(function (docker) {
        docker.show();
      });
    }
  },
  /**
   * DockerDrag Handler
   * delegates the uiEvent of the drag event to the mouseDown function
   */
  handleDockerDrag: function (event, uiObj) {
    this.handleMouseDown(event.uiEvent, uiObj);
  },

  /**
   * MouseDown Handler
   *
   */
  handleMouseDown: function (event, uiObj) {
    // If there is a Docker
    if (uiObj instanceof ORYX.Core.Controls.Docker && uiObj.isMovable) {

      /* Buffering shape selection and clear selection*/
      this.shapeSelection = this.facade.getSelection();
      this.facade.setSelection();

      this.docker = uiObj;
      this.initialDockerPosition = this.docker.bounds.center();
      this.outerDockerNotMoved = false;
      this.dockerParent = uiObj.parent;

      // Define command arguments
      this._commandArg = {
        docker: uiObj,
        dockedShape: uiObj.getDockedShape(),
        refPoint: uiObj.referencePoint || uiObj.bounds.center()
      };

      // Show the Docker
      this.docker.show();

      // If the Dockers Parent is an Edge,
      //  and the Docker is either the first or last Docker of the Edge
      if (uiObj.parent instanceof ORYX.Core.Edge &&
        (uiObj.parent.dockers.first() == uiObj || uiObj.parent.dockers.last() == uiObj)) {

        // Get the Edge Source or Target
        if (uiObj.parent.dockers.first() == uiObj && uiObj.parent.dockers.last().getDockedShape()) {
          this.dockerTarget = uiObj.parent.dockers.last().getDockedShape();
        } else if (uiObj.parent.dockers.last() == uiObj && uiObj.parent.dockers.first().getDockedShape()) {
          this.dockerSource = uiObj.parent.dockers.first().getDockedShape();
        }

      } else {
        // If there parent is not an Edge, undefined the Source and Target
        this.dockerSource = undefined;
        this.dockerTarget = undefined;
      }

      this.isStartDocker = this.docker.parent.dockers.first() === this.docker;
      this.isEndDocker = this.docker.parent.dockers.last() === this.docker;

      // add to canvas while dragging
      this.facade.getCanvas().add(this.docker.parent);

      // Hide all Labels from Docker
      this.docker.parent.getLabels().each(function (label) {
        label.hide();
      });

      var eventCoordinates = this.facade.eventCoordinates(event);
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
        eventCoordinates.x = eventCoordinates.x / additionalIEZoom;
        eventCoordinates.y = eventCoordinates.y / additionalIEZoom;
      }

      // Undocked the Docker from current Shape
      if ((!this.isStartDocker && !this.isEndDocker) || !this.docker.isDocked()) {

        this.docker.setDockedShape(undefined);
        // Set the Docker to the center of the mouse pointer
        this.docker.bounds.centerMoveTo(eventCoordinates);
        this.dockerParent._update();
      } else {
        this.outerDockerNotMoved = true;
      }

      var option = {movedCallback: this.dockerMoved.bind(this), upCallback: this.dockerMovedFinished.bind(this)};

      this.startEventPos = eventCoordinates;

      // Enable the Docker for Drag'n'Drop, give the mouseMove and mouseUp-Callback with
      ORYX.Core.UIEnableDrag(event, uiObj, option);
    }
  },

  /**
   * Docker MouseMove Handler
   *
   */
  dockerMoved: function (event) {
    this.outerDockerNotMoved = false;
    var snapToMagnet = undefined;

    if (this.docker.parent) {
      if (this.isStartDocker || this.isEndDocker) {

        // Get the EventPosition and all Shapes on these point
        var evPos = this.facade.eventCoordinates(event);

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
          evPos.x = evPos.x / additionalIEZoom;
          evPos.y = evPos.y / additionalIEZoom;
        }

        if (this.docker.isDocked()) {
          /* Only consider start/end dockers if they are moved over a treshold */
          var distanceDockerPointer =
            ORYX.Core.Math.getDistancePointToPoint(evPos, this.initialDockerPosition);
          if (distanceDockerPointer < this.undockTreshold) {
            this.outerDockerNotMoved = true;
            return;
          }

          /* Undock the docker */
          this.docker.setDockedShape(undefined);
          // Set the Docker to the center of the mouse pointer
          //this.docker.bounds.centerMoveTo(evPos);
          this.dockerParent._update();
        }

        var shapes = this.facade.getCanvas().getAbstractShapesAtPosition(evPos);

        // Get the top level Shape on these, but not the same as Dockers parent
        var uiObj = shapes.pop();
        if (this.docker.parent === uiObj) {
          uiObj = shapes.pop();
        }

        // If the top level Shape the same as the last Shape, then return
        if (this.lastUIObj == uiObj) {
          //return;

          // If the top level uiObj instance of Shape and this isn't the parent of the docker
        }
        else if (uiObj instanceof ORYX.Core.Shape) {

          // Ask by the StencilSet if the source, the edge and the target valid connections.
          if (this.docker.parent instanceof ORYX.Core.Edge) {

            var highestParent = this.getHighestParentBeforeCanvas(uiObj);
            /* Ensure that the shape to dock is not a child shape
							 * of the same edge.
							 */
            if (highestParent instanceof ORYX.Core.Edge && this.docker.parent === highestParent) {
              this.isValid = false;
              this.dockerParent._update();
              return;
            }
            this.isValid = false;
            var curObj = uiObj, orgObj = uiObj;
            while (!this.isValid && curObj && !(curObj instanceof ORYX.Core.Canvas)) {
              uiObj = curObj;
              this.isValid = this.facade.getRules().canConnect({
                sourceShape: this.dockerSource ? // Is there a docked source
                  this.dockerSource : // than set this
                  (this.isStartDocker ? // if not and if the Docker is the start docker
                    uiObj : // take the last uiObj
                    undefined), // if not set it to undefined;
                edgeShape: this.docker.parent,
                targetShape: this.dockerTarget ? // Is there a docked target
                  this.dockerTarget : // than set this
                  (this.isEndDocker ? // if not and if the Docker is not the start docker
                    uiObj : // take the last uiObj
                    undefined) // if not set it to undefined;
              });
              curObj = curObj.parent;
            }

            // Reset uiObj if no
            // valid parent is found
            if (!this.isValid) {
              uiObj = orgObj;
            }

          }
          else {
            this.isValid = this.facade.getRules().canConnect({
              sourceShape: uiObj,
              edgeShape: this.docker.parent,
              targetShape: this.docker.parent
            });
          }

          // If there is a lastUIObj, hide the magnets
          if (this.lastUIObj) {
            this.hideMagnets(this.lastUIObj);
          }

          // If there is a valid connection, show the magnets
          if (this.isValid) {
            this.showMagnets(uiObj);
          }

          // Set the Highlight Rectangle by these value
          this.showHighlight(uiObj, this.isValid ? this.VALIDCOLOR : this.INVALIDCOLOR);

          // Buffer the current Shape
          this.lastUIObj = uiObj;
        }
        else {
          // If there is no top level Shape, then hide the highligting of the last Shape
          this.hideHighlight();
          this.lastUIObj ? this.hideMagnets(this.lastUIObj) : null;
          this.lastUIObj = undefined;
          this.isValid = false;
        }

        // Snap to the nearest Magnet
        if (this.lastUIObj && this.isValid && !(event.shiftKey || event.ctrlKey)) {
          snapToMagnet = this.lastUIObj.magnets.find(function (magnet) {
            return magnet.absoluteBounds().isIncluded(evPos);
          });

          if (snapToMagnet) {
            this.docker.bounds.centerMoveTo(snapToMagnet.absoluteCenterXY());
            //this.docker.update()
          }
        }
      }
    }
    // Snap to on the nearest Docker of the same parent
    if (!(event.shiftKey || event.ctrlKey) && !snapToMagnet) {
      var minOffset = ORYX.CONFIG.DOCKER_SNAP_OFFSET;
      var nearestX = minOffset + 1;
      var nearestY = minOffset + 1;

      var dockerCenter = this.docker.bounds.center();

      if (this.docker.parent) {

        this.docker.parent.dockers.each((function (docker) {
          if (this.docker == docker) {
            return
          }
          ;

          var center = docker.referencePoint ? docker.getAbsoluteReferencePoint() : docker.bounds.center();

          nearestX = Math.abs(nearestX) > Math.abs(center.x - dockerCenter.x) ? center.x - dockerCenter.x : nearestX;
          nearestY = Math.abs(nearestY) > Math.abs(center.y - dockerCenter.y) ? center.y - dockerCenter.y : nearestY;


        }).bind(this));

        if (Math.abs(nearestX) < minOffset || Math.abs(nearestY) < minOffset) {
          nearestX = Math.abs(nearestX) < minOffset ? nearestX : 0;
          nearestY = Math.abs(nearestY) < minOffset ? nearestY : 0;

          this.docker.bounds.centerMoveTo(dockerCenter.x + nearestX, dockerCenter.y + nearestY);
          //this.docker.update()
        } else {


          var previous = this.docker.parent.dockers[Math.max(this.docker.parent.dockers.indexOf(this.docker) - 1, 0)];
          var next = this.docker.parent.dockers[Math.min(this.docker.parent.dockers.indexOf(this.docker) + 1, this.docker.parent.dockers.length - 1)];

          if (previous && next && previous !== this.docker && next !== this.docker) {
            var cp = previous.bounds.center();
            var cn = next.bounds.center();
            var cd = this.docker.bounds.center();

            // Checks if the point is on the line between previous and next
            if (ORYX.Core.Math.isPointInLine(cd.x, cd.y, cp.x, cp.y, cn.x, cn.y, 10)) {
              // Get the rise
              var raise = (Number(cn.y) - Number(cp.y)) / (Number(cn.x) - Number(cp.x));
              // Calculate the intersection point
              var intersecX = ((cp.y - (cp.x * raise)) - (cd.y - (cd.x * (-Math.pow(raise, -1))))) / ((-Math.pow(raise, -1)) - raise);
              var intersecY = (cp.y - (cp.x * raise)) + (raise * intersecX);

              if (isNaN(intersecX) || isNaN(intersecY)) {
                return;
              }

              this.docker.bounds.centerMoveTo(intersecX, intersecY);
            }
          }

        }
      }
    }
    //this.facade.getCanvas().update();
    this.dockerParent._update();
  },

  /**
   * Docker MouseUp Handler
   *
   */
  dockerMovedFinished: function (event) {

    /* Reset to buffered shape selection */
    this.facade.setSelection(this.shapeSelection);

    // Hide the border
    this.hideHighlight();

    // Show all Labels from Docker
    this.dockerParent.getLabels().each(function (label) {
      label.show();
      //label.update();
    });

    // If there is a last top level Shape
    if (this.lastUIObj && (this.isStartDocker || this.isEndDocker)) {
      // If there is a valid connection, the set as a docked Shape to them
      if (this.isValid) {

        this.docker.setDockedShape(this.lastUIObj);

        this.facade.raiseEvent({
          type: ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED,
          docker: this.docker,
          parent: this.docker.parent,
          target: this.lastUIObj
        });
      }

      this.hideMagnets(this.lastUIObj);
    }

    // Hide the Docker
    this.docker.hide();

    if (this.outerDockerNotMoved) {
      // Get the EventPosition and all Shapes on these point
      var evPos = this.facade.eventCoordinates(event);
      var shapes = this.facade.getCanvas().getAbstractShapesAtPosition(evPos);

      /* Remove edges from selection */
      var shapeWithoutEdges = shapes.findAll(function (node) {
        return node instanceof ORYX.Core.Node;
      });
      shapes = shapeWithoutEdges.length ? shapeWithoutEdges : shapes;
      this.facade.setSelection(shapes);
    } else {
      //Command-Pattern for dragging one docker
      var dragDockerCommand = ORYX.Core.Command.extend({
        construct: function (docker, newPos, oldPos, newDockedShape, oldDockedShape, facade) {
          this.docker = docker;
          this.index = docker.parent.dockers.indexOf(docker);
          this.newPosition = newPos;
          this.newDockedShape = newDockedShape;
          this.oldPosition = oldPos;
          this.oldDockedShape = oldDockedShape;
          this.facade = facade;
          this.index = docker.parent.dockers.indexOf(docker);
          this.shape = docker.parent;

        },
        execute: function () {
          if (!this.docker.parent) {
            this.docker = this.shape.dockers[this.index];
          }
          this.dock(this.newDockedShape, this.newPosition);
          this.removedDockers = this.shape.removeUnusedDockers();
          this.facade.updateSelection();
        },
        rollback: function () {
          this.dock(this.oldDockedShape, this.oldPosition);
          (this.removedDockers || $H({})).each(function (d) {
            this.shape.add(d.value, Number(d.key));
            this.shape._update(true);
          }.bind(this));
          this.facade.updateSelection();
        },
        dock: function (toDockShape, pos) {
          // Set the Docker to the new Shape
          this.docker.setDockedShape(undefined);
          if (toDockShape) {
            this.docker.setDockedShape(toDockShape);
            this.docker.setReferencePoint(pos);
            //this.docker.update();
            //this.docker.parent._update();
          } else {
            this.docker.bounds.centerMoveTo(pos);
          }

          this.facade.getCanvas().update();
        }
      });


      if (this.docker.parent) {
        // Instanziate the dockCommand
        var command = new dragDockerCommand(this.docker, this.docker.getDockedShape() ? this.docker.referencePoint : this.docker.bounds.center(), this._commandArg.refPoint, this.docker.getDockedShape(), this._commandArg.dockedShape, this.facade);
        this.facade.executeCommands([command]);
      }
    }

    // Update all Shapes
    //this.facade.updateSelection();

    // Undefined all variables
    this.docker = undefined;
    this.dockerParent = undefined;
    this.dockerSource = undefined;
    this.dockerTarget = undefined;
    this.lastUIObj = undefined;
  },

  /**
   * Hide the highlighting
   */
  hideHighlight: function () {
    this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId: 'validDockedShape'});
  },

  /**
   * Show the highlighting
   *
   */
  showHighlight: function (uiObj, color) {

    this.facade.raiseEvent({
      type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
      highlightId: 'validDockedShape',
      elements: [uiObj],
      color: color
    });
  },

  showMagnets: function (uiObj) {
    uiObj.magnets.each(function (magnet) {
      magnet.show();
    });
  },

  hideMagnets: function (uiObj) {
    uiObj.magnets.each(function (magnet) {
      magnet.hide();
    });
  },

  getHighestParentBeforeCanvas: function (shape) {
    if (!(shape instanceof ORYX.Core.Shape)) {
      return undefined;
    }

    var parent = shape.parent;
    while (parent && !(parent.parent instanceof ORYX.Core.Canvas)) {
      parent = parent.parent;
    }

    return parent;
  }

});

ORYX.Plugins.AddDocker = Clazz.extend({

  /**
   *  Constructor
   *  @param {Object} Facade: The Facade of the Editor
   */
  construct: function (facade) {
    this.facade = facade;
    this.enableAdd = false;
    this.enableRemove = false;

    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));
  },

  setEnableAdd: function (enable) {
    this.enableAdd = enable;

    if (this.enableAdd) {
      jQuery("#add-bendpoint-button").addClass('pressed');
    } else {
      jQuery("#add-bendpoint-button").removeClass('pressed');
      jQuery("#add-bendpoint-button").blur();
    }
  },
  setEnableRemove: function (enable) {
    this.enableRemove = enable;

    if (this.enableRemove) {
      jQuery("#remove-bendpoint-button").addClass('pressed');
    } else {
      jQuery("#remove-bendpoint-button").removeClass('pressed');
      jQuery("#remove-bendpoint-button").blur();
    }
  },

  enabledAdd: function (enable) {
    return this.enableAdd;
  },
  enabledRemove: function () {
    return this.enableRemove;
  },

  /**
   * MouseDown Handler
   *
   */
  handleMouseDown: function (event, uiObj) {
    if (this.enabledAdd() && uiObj instanceof ORYX.Core.Edge) {
      this.newDockerCommand({
        edge: uiObj,
        position: this.facade.eventCoordinates(event)
      });
      this.setEnableAdd(false);

    } else if (this.enabledRemove() &&
      uiObj instanceof ORYX.Core.Controls.Docker &&
      uiObj.parent instanceof ORYX.Core.Edge) {
      this.newDockerCommand({
        edge: uiObj.parent,
        docker: uiObj
      });
      this.setEnableRemove(false);
    }
    document.body.style.cursor = 'default';
  },

  // Options: edge (required), position (required if add), docker (required if delete)
  newDockerCommand: function (options) {
    if (!options.edge)
      return;

    var commandClass = ORYX.Core.Command.extend({
      construct: function (addEnabled, deleteEnabled, edge, docker, pos, facade) {
        this.addEnabled = addEnabled;
        this.deleteEnabled = deleteEnabled;
        this.edge = edge;
        this.docker = docker;
        this.pos = pos;
        this.facade = facade;
      },
      execute: function () {
        if (this.addEnabled) {
          if (!this.docker) {
            this.docker = this.edge.addDocker(this.pos);
            this.index = this.edge.dockers.indexOf(this.docker);
          } else {
            this.edge.add(this.docker, this.index);
          }
        }
        else if (this.deleteEnabled) {
          this.index = this.edge.dockers.indexOf(this.docker);
          this.pos = this.docker.bounds.center();
          this.edge.removeDocker(this.docker);
        }
        this.edge.getLabels().invoke("show");
        this.facade.getCanvas().update();
        this.facade.updateSelection();
      },
      rollback: function () {
        if (this.addEnabled) {
          if (this.docker instanceof ORYX.Core.Controls.Docker) {
            this.edge.removeDocker(this.docker);
          }
        }
        else if (this.deleteEnabled) {
          this.edge.add(this.docker, this.index);
        }
        this.edge.getLabels().invoke("show");
        this.facade.getCanvas().update();
        this.facade.updateSelection();
      }
    })

    var command = new commandClass(this.enabledAdd(), this.enabledRemove(), options.edge, options.docker, options.position, this.facade);

    this.facade.executeCommands([command]);
  }
});

ORYX.Plugins.SelectionFrame = Clazz.extend({

  construct: function (facade) {
    this.facade = facade;

    // Register on MouseEvents
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));
    document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.handleMouseUp.bind(this), true);

    // Some initiale variables
    this.position = {x: 0, y: 0};
    this.size = {width: 0, height: 0};
    this.offsetPosition = {x: 0, y: 0};

    // (Un)Register Mouse-Move Event
    this.moveCallback = undefined;
    this.offsetScroll = {x: 0, y: 0};
    // HTML-Node of Selection-Frame
    this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", $('canvasSection'),
      ['div', {'class': 'Oryx_SelectionFrame'}]);

    this.hide();
  },

  handleMouseDown: function (event, uiObj) {
    // If there is the Canvas
    if (uiObj instanceof ORYX.Core.Canvas) {
      // Calculate the Offset
      var scrollNode = uiObj.rootNode.parentNode.parentNode;

      var a = this.facade.getCanvas().node.getScreenCTM();
      this.offsetPosition = {
        x: a.e,
        y: a.f
      };

      // Set the new Position
      this.setPos({
        x: Event.pointerX(event) - jQuery("#canvasSection").offset().left,
        y: Event.pointerY(event) - jQuery("#canvasSection").offset().top + 5
      });

      // Reset the size
      this.resize({width: 0, height: 0});
      this.moveCallback = this.handleMouseMove.bind(this);

      // Register Mouse-Move Event
      document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.moveCallback, false);

      this.offsetScroll = {x: scrollNode.scrollLeft, y: scrollNode.scrollTop};

      // Show the Frame
      this.show();
    }

    Event.stop(event);
  },

  handleMouseUp: function (event) {
    // If there was an MouseMoving
    if (this.moveCallback) {
      // Hide the Frame
      this.hide();

      // Unregister Mouse-Move
      document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.moveCallback, false);

      this.moveCallback = undefined;

      var corrSVG = this.facade.getCanvas().node.getScreenCTM();

      // Calculate the positions of the Frame
      var a = {
        x: this.size.width > 0 ? this.position.x : this.position.x + this.size.width,
        y: this.size.height > 0 ? this.position.y : this.position.y + this.size.height
      };

      var b = {
        x: a.x + Math.abs(this.size.width),
        y: a.y + Math.abs(this.size.height)
      };

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

      if (additionalIEZoom === 1) {
        a.x = a.x - (corrSVG.e - jQuery("#canvasSection").offset().left);
        a.y = a.y - (corrSVG.f - jQuery("#canvasSection").offset().top);
        b.x = b.x - (corrSVG.e - jQuery("#canvasSection").offset().left);
        b.y = b.y - (corrSVG.f - jQuery("#canvasSection").offset().top);

      } else {
        var canvasOffsetLeft = jQuery("#canvasSection").offset().left;
        var canvasScrollLeft = jQuery("#canvasSection").scrollLeft();
        var canvasScrollTop = jQuery("#canvasSection").scrollTop();

        var offset = a.e - (canvasOffsetLeft * additionalIEZoom);
        var additionaloffset = 0;
        if (offset > 10) {
          additionaloffset = (offset / additionalIEZoom) - offset;
        }

        a.x = a.x - (corrSVG.e - (canvasOffsetLeft * additionalIEZoom) + additionaloffset + ((canvasScrollLeft * additionalIEZoom) - canvasScrollLeft));
        a.y = a.y - (corrSVG.f - (jQuery("#canvasSection").offset().top * additionalIEZoom) + ((canvasScrollTop * additionalIEZoom) - canvasScrollTop));
        b.x = b.x - (corrSVG.e - (canvasOffsetLeft * additionalIEZoom) + additionaloffset + ((canvasScrollLeft * additionalIEZoom) - canvasScrollLeft));
        b.y = b.y - (corrSVG.f - (jQuery("#canvasSection").offset().top * additionalIEZoom) + ((canvasScrollTop * additionalIEZoom) - canvasScrollTop));
      }


      // Fit to SVG-Coordinates
      a.x /= corrSVG.a;
      a.y /= corrSVG.d;
      b.x /= corrSVG.a;
      b.y /= corrSVG.d;

      // Calculate the elements from the childs of the canvas
      var elements = this.facade.getCanvas().getChildShapes(true).findAll(function (value) {
        var absBounds = value.absoluteBounds();

        var bA = absBounds.upperLeft();
        var bB = absBounds.lowerRight();

        if (bA.x > a.x && bA.y > a.y && bB.x < b.x && bB.y < b.y)
          return true;
        return false;
      });

      // Set the selection
      this.facade.setSelection(elements);
    }
  },

  handleMouseMove: function (event) {
    // Calculate the size
    var size = {
      width: Event.pointerX(event) - this.position.x - jQuery("#canvasSection").offset().left,
      height: Event.pointerY(event) - this.position.y - jQuery("#canvasSection").offset().top + 5
    };

    var scrollNode = this.facade.getCanvas().rootNode.parentNode.parentNode;
    size.width -= this.offsetScroll.x - scrollNode.scrollLeft;
    size.height -= this.offsetScroll.y - scrollNode.scrollTop;

    // Set the size
    this.resize(size);

    Event.stop(event);
  },

  hide: function () {
    this.node.style.display = "none";
  },

  show: function () {
    this.node.style.display = "";
  },

  setPos: function (pos) {
    // Set the Position
    this.node.style.top = pos.y + "px";
    this.node.style.left = pos.x + "px";
    this.position = pos;
  },

  resize: function (size) {

    // Calculate the negative offset
    this.setPos(this.position);
    this.size = Object.clone(size);

    if (size.width < 0) {
      this.node.style.left = (this.position.x + size.width) + "px";
      size.width = -size.width;
    }
    if (size.height < 0) {
      this.node.style.top = (this.position.y + size.height) + "px";
      size.height = -size.height;
    }

    // Set the size
    this.node.style.width = size.width + "px";
    this.node.style.height = size.height + "px";
  }

});

ORYX.Plugins.ShapeHighlighting = Clazz.extend({

  construct: function (facade) {

    this.parentNode = facade.getCanvas().getSvgContainer();

    // The parent Node
    this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.parentNode,
      ['g']);

    this.highlightNodes = {};

    facade.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, this.setHighlight.bind(this));
    facade.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, this.hideHighlight.bind(this));

  },

  setHighlight: function (options) {
    if (options && options.highlightId) {
      var node = this.highlightNodes[options.highlightId];

      if (!node) {
        node = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node,
          ['path', {
            "stroke-width": 2.0, "fill": "none"
          }]);

        this.highlightNodes[options.highlightId] = node;
      }

      if (options.elements && options.elements.length > 0) {

        this.setAttributesByStyle(node, options);
        this.show(node);

      } else {

        this.hide(node);

      }

    }
  },

  hideHighlight: function (options) {
    if (options && options.highlightId && this.highlightNodes[options.highlightId]) {
      this.hide(this.highlightNodes[options.highlightId]);
    }
  },

  hide: function (node) {
    node.setAttributeNS(null, 'display', 'none');
  },

  show: function (node) {
    node.setAttributeNS(null, 'display', '');
  },

  setAttributesByStyle: function (node, options) {

    // If the style say, that it should look like a rectangle
    if (options.style && options.style == ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE) {

      // Set like this
      var bo = options.elements[0].absoluteBounds();

      var strWidth = options.strokewidth ? options.strokewidth : ORYX.CONFIG.BORDER_OFFSET

      node.setAttributeNS(null, "d", this.getPathRectangle(bo.a, bo.b, strWidth));
      node.setAttributeNS(null, "stroke", options.color ? options.color : ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
      node.setAttributeNS(null, "stroke-opacity", options.opacity ? options.opacity : 0.2);
      node.setAttributeNS(null, "stroke-width", strWidth);

    } else if (options.elements.length == 1
      && options.elements[0] instanceof ORYX.Core.Edge &&
      options.highlightId != "selection") {

      /* Highlight containment of edge's childs */
      var path = this.getPathEdge(options.elements[0].dockers);
      if (path && path.length > 0) {
        node.setAttributeNS(null, "d", path);
      }
      node.setAttributeNS(null, "stroke", options.color ? options.color : ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
      node.setAttributeNS(null, "stroke-opacity", options.opacity ? options.opacity : 0.2);
      node.setAttributeNS(null, "stroke-width", ORYX.CONFIG.OFFSET_EDGE_BOUNDS);

    } else {
      // If not, set just the corners
      var path = this.getPathByElements(options.elements);
      if (path && path.length > 0) {
        node.setAttributeNS(null, "d", path);
      }
      node.setAttributeNS(null, "stroke", options.color ? options.color : ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
      node.setAttributeNS(null, "stroke-opacity", options.opacity ? options.opacity : 1.0);
      node.setAttributeNS(null, "stroke-width", options.strokewidth ? options.strokewidth : 2.0);

    }
  },

  getPathByElements: function (elements) {
    if (!elements || elements.length <= 0) {
      return undefined
    }

    // Get the padding and the size
    var padding = ORYX.CONFIG.SELECTED_AREA_PADDING;

    var path = ""

    // Get thru all Elements
    elements.each((function (element) {
      if (!element) {
        return
      }
      // Get the absolute Bounds and the two Points
      var bounds = element.absoluteBounds();
      bounds.widen(padding)
      var a = bounds.upperLeft();
      var b = bounds.lowerRight();

      path = path + this.getPath(a, b);

    }).bind(this));

    return path;

  },

  getPath: function (a, b) {

    return this.getPathCorners(a, b);

  },

  getPathCorners: function (a, b) {

    var size = ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;

    var path = ""

    // Set: Upper left
    path = path + "M" + a.x + " " + (a.y + size) + " l0 -" + size + " l" + size + " 0 ";
    // Set: Lower left
    path = path + "M" + a.x + " " + (b.y - size) + " l0 " + size + " l" + size + " 0 ";
    // Set: Lower right
    path = path + "M" + b.x + " " + (b.y - size) + " l0 " + size + " l-" + size + " 0 ";
    // Set: Upper right
    path = path + "M" + b.x + " " + (a.y + size) + " l0 -" + size + " l-" + size + " 0 ";

    return path;
  },

  getPathRectangle: function (a, b, strokeWidth) {

    var size = ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;

    var path = ""
    var offset = strokeWidth / 2.0;

    // Set: Upper left
    path = path + "M" + (a.x + offset) + " " + (a.y);
    path = path + " L" + (a.x + offset) + " " + (b.y - offset);
    path = path + " L" + (b.x - offset) + " " + (b.y - offset);
    path = path + " L" + (b.x - offset) + " " + (a.y + offset);
    path = path + " L" + (a.x + offset) + " " + (a.y + offset);

    return path;
  },

  getPathEdge: function (edgeDockers) {
    var length = edgeDockers.length;
    var path = "M" + edgeDockers[0].bounds.center().x + " "
      + edgeDockers[0].bounds.center().y;

    for (i = 1; i < length; i++) {
      var dockerPoint = edgeDockers[i].bounds.center();
      path = path + " L" + dockerPoint.x + " " + dockerPoint.y;
    }

    return path;
  }

});

ORYX.Plugins.HighlightingSelectedShapes = Clazz.extend({

  construct: function (facade) {
    this.facade = facade;
    this.opacityFull = 0.9;
    this.opacityLow = 0.4;

    // Register on Dragging-Events for show/hide of ShapeMenu
    //this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_START, this.hide.bind(this));
    //this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_END,  this.show.bind(this));
  },

  /**
   * On the Selection-Changed
   *
   */
  onSelectionChanged: function (event) {
    if (event.elements && event.elements.length > 1) {
      this.facade.raiseEvent({
        type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
        highlightId: 'selection',
        elements: event.elements.without(event.subSelection),
        color: ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,
        opacity: !event.subSelection ? this.opacityFull : this.opacityLow
      });

      if (event.subSelection) {
        this.facade.raiseEvent({
          type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
          highlightId: 'subselection',
          elements: [event.subSelection],
          color: ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,
          opacity: this.opacityFull
        });
      } else {
        this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId: 'subselection'});
      }

    } else {
      this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId: 'selection'});
      this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId: 'subselection'});
    }
  }
});

ORYX.Plugins.Overlay = Clazz.extend({

  facade: undefined,

  styleNode: undefined,

  construct: function (facade) {

    this.facade = facade;

    this.changes = [];

    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_SHOW, this.show.bind(this));
    this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_HIDE, this.hide.bind(this));

    this.styleNode = document.createElement('style')
    this.styleNode.setAttributeNS(null, 'type', 'text/css')

    document.getElementsByTagName('head')[0].appendChild(this.styleNode)

  },

  /**
   * Show the overlay for specific nodes
   * @param {Object} options
   *
   *  String        options.id    - MUST - Define the id of the overlay (is needed for the hiding of this overlay)
   *  ORYX.Core.Shape[]  options.shapes  - MUST - Define the Shapes for the changes
   *  attr-name:value    options.changes  - Defines all the changes which should be shown
   *
   *
   */
  show: function (options) {

    // Checks if all arguments are available
    if (!options ||
      !options.shapes || !options.shapes instanceof Array ||
      !options.id || !options.id instanceof String || options.id.length == 0) {

      return

    }

    //if( this.changes[options.id]){
    //	this.hide( options )
    //}


    // Checked if attributes are setted
    if (options.attributes) {

      // FOR EACH - Shape
      options.shapes.each(function (el) {

        // Checks if the node is a Shape
        if (!el instanceof ORYX.Core.Shape) {
          return
        }

        this.setAttributes(el.node, options.attributes)

      }.bind(this))

    }

    var isSVG = true
    try {
      isSVG = options.node && options.node instanceof SVGElement;
    } catch (e) {
    }

    // Checks if node is setted and if this is an SVGElement
    if (options.node && isSVG) {

      options["_temps"] = []

      // FOR EACH - Node
      options.shapes.each(function (el, index) {

        // Checks if the node is a Shape
        if (!el instanceof ORYX.Core.Shape) {
          return
        }

        var _temp = {}
        _temp.svg = options.dontCloneNode ? options.node : options.node.cloneNode(true);

        // Add the svg node to the ORYX-Shape
        el.node.firstChild.appendChild(_temp.svg)

        // If
        if (el instanceof ORYX.Core.Edge && !options.nodePosition) {
          options['nodePosition'] = "START"
        }

        // If the node position is setted, it has to be transformed
        if (options.nodePosition) {

          var b = el.bounds;
          var p = options.nodePosition.toUpperCase();

          // Check the values of START and END
          if (el instanceof ORYX.Core.Node && p == "START") {
            p = "NW";
          } else if (el instanceof ORYX.Core.Node && p == "END") {
            p = "SE";
          } else if (el instanceof ORYX.Core.Edge && p == "START") {
            b = el.getDockers().first().bounds
          } else if (el instanceof ORYX.Core.Edge && p == "END") {
            b = el.getDockers().last().bounds
          }

          // Create a callback for the changing the position
          // depending on the position string
          _temp.callback = function () {

            var x = 0;
            var y = 0;

            if (p == "NW") {
              // Do Nothing
            } else if (p == "N") {
              x = b.width() / 2;
            } else if (p == "NE") {
              x = b.width();
            } else if (p == "E") {
              x = b.width();
              y = b.height() / 2;
            } else if (p == "SE") {
              x = b.width();
              y = b.height();
            } else if (p == "S") {
              x = b.width() / 2;
              y = b.height();
            } else if (p == "SW") {
              y = b.height();
            } else if (p == "W") {
              y = b.height() / 2;
            } else if (p == "START" || p == "END") {
              x = b.width() / 2;
              y = b.height() / 2;
            } else {
              return
            }

            if (el instanceof ORYX.Core.Edge) {
              x += b.upperLeft().x;
              y += b.upperLeft().y;
            }

            _temp.svg.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")")

          }.bind(this)

          _temp.element = el;
          _temp.callback();

          b.registerCallback(_temp.callback);

        }


        options._temps.push(_temp)

      }.bind(this))


    }


    // Store the changes
    if (!this.changes[options.id]) {
      this.changes[options.id] = [];
    }

    this.changes[options.id].push(options);

  },

  /**
   * Hide the overlay with the spefic id
   * @param {Object} options
   */
  hide: function (options) {

    // Checks if all arguments are available
    if (!options ||
      !options.id || !options.id instanceof String || options.id.length == 0 ||
      !this.changes[options.id]) {

      return

    }


    // Delete all added attributes
    // FOR EACH - Shape
    this.changes[options.id].each(function (option) {

      option.shapes.each(function (el, index) {

        // Checks if the node is a Shape
        if (!el instanceof ORYX.Core.Shape) {
          return
        }

        this.deleteAttributes(el.node)

      }.bind(this));


      if (option._temps) {

        option._temps.each(function (tmp) {
          // Delete the added Node, if there is one
          if (tmp.svg && tmp.svg.parentNode) {
            tmp.svg.parentNode.removeChild(tmp.svg)
          }

          // If
          if (tmp.callback && tmp.element) {
            // It has to be unregistered from the edge
            tmp.element.bounds.unregisterCallback(tmp.callback)
          }

        }.bind(this))

      }


    }.bind(this));


    this.changes[options.id] = null;


  },


  /**
   * Set the given css attributes to that node
   * @param {HTMLElement} node
   * @param {Object} attributes
   */
  setAttributes: function (node, attributes) {


    // Get all the childs from ME
    var childs = this.getAllChilds(node.firstChild.firstChild)

    var ids = []

    // Add all Attributes which have relation to another node in this document and concate the pure id out of it
    // This is for example important for the markers of a edge
    childs.each(function (e) {
      ids.push($A(e.attributes).findAll(function (attr) {
        return attr.nodeValue.startsWith('url(#')
      }))
    })
    ids = ids.flatten().compact();
    ids = ids.collect(function (s) {
      return s.nodeValue
    }).uniq();
    ids = ids.collect(function (s) {
      return s.slice(5, s.length - 1)
    })

    // Add the node ID to the id
    ids.unshift(node.id + ' .me')

    var attr = $H(attributes);
    var attrValue = attr.toJSON().gsub(',', ';').gsub('"', '');
    var attrMarkerValue = attributes.stroke ? attrValue.slice(0, attrValue.length - 1) + "; fill:" + attributes.stroke + ";}" : attrValue;
    var attrTextValue;
    if (attributes.fill) {
      var copyAttr = Object.clone(attributes);
      copyAttr.fill = "black";
      attrTextValue = $H(copyAttr).toJSON().gsub(',', ';').gsub('"', '');
    }

    // Create the CSS-Tags Style out of the ids and the attributes
    csstags = ids.collect(function (s, i) {
      return "#" + s + " * " + (!i ? attrValue : attrMarkerValue) + "" + (attrTextValue ? " #" + s + " text * " + attrTextValue : "")
    })

    // Join all the tags
    var s = csstags.join(" ") + "\n"

    // And add to the end of the style tag
    this.styleNode.appendChild(document.createTextNode(s));


  },

  /**
   * Deletes all attributes which are
   * added in a special style sheet for that node
   * @param {HTMLElement} node
   */
  deleteAttributes: function (node) {

    // Get all children which contains the node id
    var delEl = $A(this.styleNode.childNodes)
      .findAll(function (e) {
        return e.textContent.include('#' + node.id)
      });

    // Remove all of them
    delEl.each(function (el) {
      el.parentNode.removeChild(el);
    });
  },

  getAllChilds: function (node) {

    var childs = $A(node.childNodes)

    $A(node.childNodes).each(function (e) {
      childs.push(this.getAllChilds(e))
    }.bind(this))

    return childs.flatten();
  }


});

ORYX.Plugins.KeysMove = ORYX.Plugins.AbstractPlugin.extend({

  facade: undefined,

  construct: function (facade) {

    this.facade = facade;
    this.copyElements = [];

    //this.facade.registerOnEvent(ORYX.CONFIG.EVENT_KEYDOWN, this.keyHandler.bind(this));

    // SELECT ALL
    this.facade.offer({
      keyCodes: [{
        metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
        keyCode: 65,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.selectAll.bind(this)
    });

    // MOVE LEFT SMALL
    this.facade.offer({
      keyCodes: [{
        metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
        keyCode: ORYX.CONFIG.KEY_CODE_LEFT,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_LEFT, false)
    });

    // MOVE LEFT
    this.facade.offer({
      keyCodes: [{
        keyCode: ORYX.CONFIG.KEY_CODE_LEFT,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_LEFT, true)
    });

    // MOVE RIGHT SMALL
    this.facade.offer({
      keyCodes: [{
        metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
        keyCode: ORYX.CONFIG.KEY_CODE_RIGHT,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_RIGHT, false)
    });

    // MOVE RIGHT
    this.facade.offer({
      keyCodes: [{
        keyCode: ORYX.CONFIG.KEY_CODE_RIGHT,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_RIGHT, true)
    });

    // MOVE UP SMALL
    this.facade.offer({
      keyCodes: [{
        metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
        keyCode: ORYX.CONFIG.KEY_CODE_UP,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_UP, false)
    });

    // MOVE UP
    this.facade.offer({
      keyCodes: [{
        keyCode: ORYX.CONFIG.KEY_CODE_UP,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_UP, true)
    });

    // MOVE DOWN SMALL
    this.facade.offer({
      keyCodes: [{
        metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
        keyCode: ORYX.CONFIG.KEY_CODE_DOWN,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_DOWN, false)
    });

    // MOVE DOWN
    this.facade.offer({
      keyCodes: [{
        keyCode: ORYX.CONFIG.KEY_CODE_DOWN,
        keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
      }
      ],
      functionality: this.move.bind(this, ORYX.CONFIG.KEY_CODE_DOWN, true)
    });


  },

  /**
   * Select all shapes in the editor
   *
   */
  selectAll: function (e) {
    Event.stop(e.event);
    this.facade.setSelection(this.facade.getCanvas().getChildShapes(true))
  },

  move: function (key, far, e) {

    Event.stop(e.event);

    // calculate the distance to move the objects and get the selection.
    var distance = far ? 20 : 5;
    var selection = this.facade.getSelection();
    var currentSelection = this.facade.getSelection();
    var p = {x: 0, y: 0};

    // switch on the key pressed and populate the point to move by.
    switch (key) {

      case ORYX.CONFIG.KEY_CODE_LEFT:
        p.x = -1 * distance;
        break;
      case ORYX.CONFIG.KEY_CODE_RIGHT:
        p.x = distance;
        break;
      case ORYX.CONFIG.KEY_CODE_UP:
        p.y = -1 * distance;
        break;
      case ORYX.CONFIG.KEY_CODE_DOWN:
        p.y = distance;
        break;
    }

    // move each shape in the selection by the point calculated and update it.
    selection = selection.findAll(function (shape) {
      // Check if this shape is docked to an shape in the selection
      if (shape instanceof ORYX.Core.Node && shape.dockers.length == 1 && selection.include(shape.dockers.first().getDockedShape())) {
        return false
      }

      // Check if any of the parent shape is included in the selection
      var s = shape.parent;
      do {
        if (selection.include(s)) {
          return false
        }
      } while (s = s.parent);

      // Otherwise, return true
      return true;

    });

    /* Edges must not be movable, if only edges are selected and at least
		 * one of them is docked.
		 */
    var edgesMovable = true;
    var onlyEdgesSelected = selection.all(function (shape) {
      if (shape instanceof ORYX.Core.Edge) {
        if (shape.isDocked()) {
          edgesMovable = false;
        }
        return true;
      }
      return false;
    });

    if (onlyEdgesSelected && !edgesMovable) {
      /* Abort moving shapes */
      return;
    }

    selection = selection.map(function (shape) {
      if (shape instanceof ORYX.Core.Node) {
        /*if( shape.dockers.length == 1 ){
					return shape.dockers.first()
				} else {*/
        return shape
        //}
      } else if (shape instanceof ORYX.Core.Edge) {

        var dockers = shape.dockers;

        if (selection.include(shape.dockers.first().getDockedShape())) {
          dockers = dockers.without(shape.dockers.first())
        }

        if (selection.include(shape.dockers.last().getDockedShape())) {
          dockers = dockers.without(shape.dockers.last())
        }

        return dockers

      } else {
        return null
      }

    }).flatten().compact();

    if (selection.size() > 0) {

      //Stop moving at canvas borders
      var selectionBounds = [this.facade.getCanvas().bounds.lowerRight().x,
        this.facade.getCanvas().bounds.lowerRight().y,
        0,
        0];
      selection.each(function (s) {
        selectionBounds[0] = Math.min(selectionBounds[0], s.bounds.upperLeft().x);
        selectionBounds[1] = Math.min(selectionBounds[1], s.bounds.upperLeft().y);
        selectionBounds[2] = Math.max(selectionBounds[2], s.bounds.lowerRight().x);
        selectionBounds[3] = Math.max(selectionBounds[3], s.bounds.lowerRight().y);
      });
      if (selectionBounds[0] + p.x < 0)
        p.x = -selectionBounds[0];
      if (selectionBounds[1] + p.y < 0)
        p.y = -selectionBounds[1];
      if (selectionBounds[2] + p.x > this.facade.getCanvas().bounds.lowerRight().x)
        p.x = this.facade.getCanvas().bounds.lowerRight().x - selectionBounds[2];
      if (selectionBounds[3] + p.y > this.facade.getCanvas().bounds.lowerRight().y)
        p.y = this.facade.getCanvas().bounds.lowerRight().y - selectionBounds[3];

      if (p.x != 0 || p.y != 0) {
        // Instantiate the moveCommand
        var commands = [new ORYX.Core.Command.Move(selection, p, null, currentSelection, this)];
        // Execute the commands
        this.facade.executeCommands(commands);
      }

    }
  },

  getUndockedCommant: function (shapes) {

    var undockEdgeCommand = ORYX.Core.Command.extend({
      construct: function (moveShapes) {
        this.dockers = moveShapes.collect(function (shape) {
          return shape instanceof ORYX.Core.Controls.Docker ? {
            docker: shape,
            dockedShape: shape.getDockedShape(),
            refPoint: shape.referencePoint
          } : undefined
        }).compact();
      },
      execute: function () {
        this.dockers.each(function (el) {
          el.docker.setDockedShape(undefined);
        })
      },
      rollback: function () {
        this.dockers.each(function (el) {
          el.docker.setDockedShape(el.dockedShape);
          el.docker.setReferencePoint(el.refPoint);
          //el.docker.update();
        })
      }
    });

    command = new undockEdgeCommand(shapes);
    command.execute();
    return command;
  },

//    /**
//     * The key handler for this plugin. Every action from the set of cut, copy,
//     * paste and delete should be accessible trough simple keyboard shortcuts.
//     * This method checks whether any event triggers one of those actions.
//     *
//     * @param {Object} event The keyboard event that should be analysed for
//     *     triggering of this plugin.
//     */
//    keyHandler: function(event){
//        //TODO document what event.which is.
//
//        ORYX.Log.debug("keysMove.js handles a keyEvent.");
//
//        // assure we have the current event.
//        if (!event)
//            event = window.event;
//
//        // get the currently pressed key and state of control key.
//        var pressedKey = event.which || event.keyCode;
//        var ctrlPressed = event.ctrlKey;
//
//		// if the key is one of the arrow keys, forward to move and return.
//		if ([ORYX.CONFIG.KEY_CODE_LEFT, ORYX.CONFIG.KEY_CODE_RIGHT,
//			ORYX.CONFIG.KEY_CODE_UP, ORYX.CONFIG.KEY_CODE_DOWN].include(pressedKey)) {
//
//			this.move(pressedKey, !ctrlPressed);
//			return;
//		}
//
//    }

});

if (!ORYX.Plugins.Layouter) {
  ORYX.Plugins.Layouter = {}
}

/**
 * Edge layouter is an implementation to layout an edge
 * @class ORYX.Plugins.Layouter.EdgeLayouter
 * @author Willi Tscheschner
 */
ORYX.Plugins.Layouter.EdgeLayouter = ORYX.Plugins.AbstractLayouter.extend({

  /**
   * Layout only Edges
   */
  layouted: ["http://b3mn.org/stencilset/bpmn1.1#SequenceFlow",
    "http://b3mn.org/stencilset/bpmn1.1#MessageFlow",
    "http://b3mn.org/stencilset/timjpdl3#SequenceFlow",
    "http://b3mn.org/stencilset/jbpm4#SequenceFlow",
    "http://b3mn.org/stencilset/bpmn2.0#MessageFlow",
    "http://b3mn.org/stencilset/bpmn2.0#SequenceFlow",
    "http://b3mn.org/stencilset/bpmn2.0choreography#MessageFlow",
    "http://b3mn.org/stencilset/bpmn2.0choreography#SequenceFlow",
    "http://b3mn.org/stencilset/bpmn2.0conversation#ConversationLink",
    "http://b3mn.org/stencilset/epc#ControlFlow",
    "http://www.signavio.com/stencilsets/processmap#ProcessLink",
    "http://www.signavio.com/stencilsets/organigram#connection"],

  /**
   * Layout a set on edges
   * @param {Object} edges
   */
  layout: function (edges) {
    edges.each(function (edge) {
      this.doLayout(edge)
    }.bind(this))
  },

  /**
   * Layout one edge
   * @param {Object} edge
   */
  doLayout: function (edge) {
    // Get from and to node
    var from = edge.getIncomingNodes()[0];
    var to = edge.getOutgoingNodes()[0];

    // Return if one is null
    if (!from || !to) {
      return
    }

    var positions = this.getPositions(from, to, edge);

    if (positions.length > 0) {
      this.setDockers(edge, positions[0].a, positions[0].b);
    }

  },

  /**
   * Returns a set on positions which are not containt either
   * in the bounds in from or to.
   * @param {Object} from Shape where the edge is come from
   * @param {Object} to Shape where the edge is leading to
   * @param {Object} edge Edge between from and to
   */
  getPositions: function (from, to, edge) {

    // Get absolute bounds
    var ab = from.absoluteBounds();
    var bb = to.absoluteBounds();

    // Get center from and to
    var a = ab.center();
    var b = bb.center();

    var am = ab.midPoint();
    var bm = bb.midPoint();

    // Get first and last reference point
    var first = Object.clone(edge.dockers.first().referencePoint);
    var last = Object.clone(edge.dockers.last().referencePoint);
    // Get the absolute one
    var aFirst = edge.dockers.first().getAbsoluteReferencePoint();
    var aLast = edge.dockers.last().getAbsoluteReferencePoint();

    // IF ------>
    // or  |
    //     V
    // Do nothing
    if (Math.abs(aFirst.x - aLast.x) < 1 || Math.abs(aFirst.y - aLast.y) < 1) {
      return []
    }

    // Calc center position, between a and b
    // depending on there weight
    var m = {}
    m.x = a.x < b.x ?
      (((b.x - bb.width() / 2) - (a.x + ab.width() / 2)) / 2) + (a.x + ab.width() / 2) :
      (((a.x - ab.width() / 2) - (b.x + bb.width() / 2)) / 2) + (b.x + bb.width() / 2);

    m.y = a.y < b.y ?
      (((b.y - bb.height() / 2) - (a.y + ab.height() / 2)) / 2) + (a.y + ab.height() / 2) :
      (((a.y - ab.height() / 2) - (b.y + bb.height() / 2)) / 2) + (b.y + bb.height() / 2);


    // Enlarge both bounds with 10
    ab.widen(5); // Wide the from less than
    bb.widen(20);// the to because of the arrow from the edge

    var positions = [];
    var off = this.getOffset.bind(this);

    // Checks ----+
    //            |
    //            V
    if (!ab.isIncluded(b.x, a.y) && !bb.isIncluded(b.x, a.y)) {
      positions.push({
        a: {x: b.x + off(last, bm, "x"), y: a.y + off(first, am, "y")},
        z: this.getWeight(from, a.x < b.x ? "r" : "l", to, a.y < b.y ? "t" : "b", edge)
      });
    }

    // Checks |
    //        +--->
    if (!ab.isIncluded(a.x, b.y) && !bb.isIncluded(a.x, b.y)) {
      positions.push({
        a: {x: a.x + off(first, am, "x"), y: b.y + off(last, bm, "y")},
        z: this.getWeight(from, a.y < b.y ? "b" : "t", to, a.x < b.x ? "l" : "r", edge)
      });
    }

    // Checks  --+
    //           |
    //           +--->
    if (!ab.isIncluded(m.x, a.y) && !bb.isIncluded(m.x, b.y)) {
      positions.push({
        a: {x: m.x, y: a.y + off(first, am, "y")},
        b: {x: m.x, y: b.y + off(last, bm, "y")},
        z: this.getWeight(from, "r", to, "l", edge, a.x > b.x)
      });
    }

    // Checks |
    //        +---+
    //            |
    //            V
    if (!ab.isIncluded(a.x, m.y) && !bb.isIncluded(b.x, m.y)) {
      positions.push({
        a: {x: a.x + off(first, am, "x"), y: m.y},
        b: {x: b.x + off(last, bm, "x"), y: m.y},
        z: this.getWeight(from, "b", to, "t", edge, a.y > b.y)
      });
    }

    // Sort DESC of weights
    return positions.sort(function (a, b) {
      return a.z < b.z ? 1 : (a.z == b.z ? -1 : -1)
    });
  },

  /**
   * Returns a offset for the pos to the center of the bounds
   *
   * @param {Object} val
   * @param {Object} pos2
   * @param {String} dir Direction x|y
   */
  getOffset: function (pos, pos2, dir) {
    return pos[dir] - pos2[dir];
  },

  /**
   * Returns a value which shows the weight for this configuration
   *
   * @param {Object} from Shape which is coming from
   * @param {String} d1 Direction where is goes
   * @param {Object} to Shape which goes to
   * @param {String} d2 Direction where it comes to
   * @param {Object} edge Edge between from and to
   * @param {Boolean} reverse Reverse the direction (e.g. "r" -> "l")
   */
  getWeight: function (from, d1, to, d2, edge, reverse) {

    d1 = (d1 || "").toLowerCase();
    d2 = (d2 || "").toLowerCase();

    if (!["t", "r", "b", "l"].include(d1)) {
      d1 = "r"
    }
    if (!["t", "r", "b", "l"].include(d2)) {
      d1 = "l"
    }

    // If reverse is set
    if (reverse) {
      // Reverse d1 and d2
      d1 = d1 == "t" ? "b" : (d1 == "r" ? "l" : (d1 == "b" ? "t" : (d1 == "l" ? "r" : "r")))
      d2 = d2 == "t" ? "b" : (d2 == "r" ? "l" : (d2 == "b" ? "t" : (d2 == "l" ? "r" : "r")))
    }


    var weight = 0;
    // Get rules for from "out" and to "in"
    var dr1 = this.facade.getRules().getLayoutingRules(from, edge)["out"];
    var dr2 = this.facade.getRules().getLayoutingRules(to, edge)["in"];

    var fromWeight = dr1[d1];
    var toWeight = dr2[d2];


    /**
     * Return a true if the center 1 is in the same direction than center 2
     * @param {Object} direction
     * @param {Object} center1
     * @param {Object} center2
     */
    var sameDirection = function (direction, center1, center2) {
      switch (direction) {
        case "t":
          return Math.abs(center1.x - center2.x) < 2 && center1.y < center2.y
        case "r":
          return center1.x > center2.x && Math.abs(center1.y - center2.y) < 2
        case "b":
          return Math.abs(center1.x - center2.x) < 2 && center1.y > center2.y
        case "l":
          return center1.x < center2.x && Math.abs(center1.y - center2.y) < 2
        default:
          return false;
      }
    }

    // Check if there are same incoming edges from 'from'
    var sameIncomingFrom = from
      .getIncomingShapes()
      .findAll(function (a) {
        return a instanceof ORYX.Core.Edge
      })
      .any(function (e) {
        return sameDirection(d1, e.dockers[e.dockers.length - 2].bounds.center(), e.dockers.last().bounds.center());
      });

    // Check if there are same outgoing edges from 'to'
    var sameOutgoingTo = to
      .getOutgoingShapes()
      .findAll(function (a) {
        return a instanceof ORYX.Core.Edge
      })
      .any(function (e) {
        return sameDirection(d2, e.dockers[1].bounds.center(), e.dockers.first().bounds.center());
      });

    // If there are equivalent edges, set 0
    //fromWeight = sameIncomingFrom ? 0 : fromWeight;
    //toWeight = sameOutgoingTo ? 0 : toWeight;

    // Get the sum of "out" and the direction plus "in" and the direction
    return (sameIncomingFrom || sameOutgoingTo ? 0 : fromWeight + toWeight);
  },

  /**
   * Removes all current dockers from the node
   * (except the start and end) and adds two new
   * dockers, on the position a and b.
   * @param {Object} edge
   * @param {Object} a
   * @param {Object} b
   */
  setDockers: function (edge, a, b) {
    if (!edge) {
      return
    }

    // Remove all dockers (implicit,
    // start and end dockers will not removed)
    edge.dockers.each(function (r) {
      edge.removeDocker(r);
    });

    // For a and b (if exists), create
    // a new docker and set position
    [a, b].compact().each(function (pos) {
      var docker = edge.createDocker(undefined, pos);
      docker.bounds.centerMoveTo(pos);
    });

    // Update all dockers from the edge
    edge.dockers.each(function (docker) {
      docker.update()
    })

    // Update edge
    //edge.refresh();
    edge._update(true);

  }
});


new function () {

  ORYX.Plugins.BPMN2_0 = {

    /**
     *  Constructor
     *  @param {Object} Facade: The Facade of the Editor
     */
    construct: function (facade) {
      this.facade = facade;

      this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED, this.handleDockerDocked.bind(this));
      this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED, this.handlePropertyChanged.bind(this));
      this.facade.registerOnEvent('layout.bpmn2_0.pool', this.handleLayoutPool.bind(this));
      this.facade.registerOnEvent('layout.bpmn2_0.subprocess', this.handleSubProcess.bind(this));
      this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHAPEREMOVED, this.handleShapeRemove.bind(this));

      this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED, this.afterLoad.bind(this));


      this.namespace = undefined;
    },

    /**
     * Force to update every pool
     */
    afterLoad: function () {
      this.facade.getCanvas().getChildNodes().each(function (shape) {
        if (shape.getStencil().id().endsWith("Pool")) {
          this.handleLayoutPool({
            shape: shape
          });
        }
      }.bind(this))
    },

    /**
     * If a pool is selected and contains no lane,
     * a lane is created automagically
     */
    onSelectionChanged: function (event) {
      var selection = event.elements;

      if (selection && selection.length === 1) {
        var namespace = this.getNamespace();
        var shape = selection[0];
        if (shape.getStencil().idWithoutNs() === "Pool") {
          if (shape.getChildNodes().length === 0) {
            // create a lane inside the selected pool
            var option = {
              type: namespace + "Lane",
              position: {x: 0, y: 0},
              namespace: shape.getStencil().namespace(),
              parent: shape
            };
            this.facade.createShape(option);
            this.facade.getCanvas().update();
            this.facade.setSelection([shape]);
          }
        }
      }

      // Preventing selection of all lanes but not the pool
      if (selection.any(function (s) {
        return s instanceof ORYX.Core.Node && s.getStencil().id().endsWith("Lane")
      })) {
        var lanes = selection.findAll(function (s) {
          return s instanceof ORYX.Core.Node && s.getStencil().id().endsWith("Lane")
        });

        var pools = [];
        var unselectLanes = [];
        lanes.each(function (lane) {
          pools.push(this.getParentPool(lane))
        }.bind(this));

        pools = pools.uniq().findAll(function (pool) {
          var childLanes = this.getLanes(pool, true);
          if (childLanes.all(function (lane) {
            return lanes.include(lane)
          })) {
            unselectLanes = unselectLanes.concat(childLanes);
            return true;
          } else if (selection.include(pool) && childLanes.any(function (lane) {
            return lanes.include(lane)
          })) {
            unselectLanes = unselectLanes.concat(childLanes);
            return true;
          } else {
            return false;
          }
        }.bind(this))

        if (unselectLanes.length > 0 && pools.length > 0) {
          selection = selection.without.apply(selection, unselectLanes);
          selection = selection.concat(pools);
          this.facade.setSelection(selection.uniq());
        }
      }
    },

    handleShapeRemove: function (option) {

      var sh = option.shape;
      var parent = option.parent;

      if (sh instanceof ORYX.Core.Node && sh.getStencil().idWithoutNs() === "Lane" && this.facade.isExecutingCommands()) {

        var pool = this.getParentPool(parent);
        if (pool && pool.parent) {

          var isLeafFn = function (leaf) {
            return !leaf.getChildNodes().any(function (r) {
              return r.getStencil().idWithoutNs() === "Lane"
            });
          }

          var isLeaf = isLeafFn(sh);
          var parentHasMoreLanes = parent.getChildNodes().any(function (r) {
            return r.getStencil().idWithoutNs() === "Lane"
          });

          if (isLeaf && parentHasMoreLanes) {

            var command = new ResizeLanesCommand(sh, parent, pool, this);
            this.facade.executeCommands([command]);

          } else if (!isLeaf &&
            !this.facade.getSelection().any(function (select) { // Find one of the selection, which is a lane and child of "sh" and is a leaf lane
              return select instanceof ORYX.Core.Node && select.getStencil().idWithoutNs() === "Lane" &&
                select.isParent(sh) && isLeafFn(select);
            })) {

            var Command = ORYX.Core.Command.extend({
              construct: function (shape, facade) {
                this.children = shape.getChildNodes(true);
                this.facade = facade;
              },
              execute: function () {
                this.children.each(function (child) {
                  child.bounds.moveBy(30, 0)
                });
                //this.facade.getCanvas().update();
              },
              rollback: function () {
                this.children.each(function (child) {
                  child.bounds.moveBy(-30, 0)
                })
                //this.facade.getCanvas().update();
              }
            });
            this.facade.executeCommands([new Command(sh, this.facade)]);

          } else if (isLeaf && !parentHasMoreLanes && parent == pool) {
            parent.add(sh);
          }
        }

      }

    },


    hashedSubProcesses: {},

    hashChildShapes: function (shape) {
      var children = shape.getChildNodes();
      children.each(function (child) {
        if (this.hashedSubProcesses[child.id]) {
          this.hashedSubProcesses[child.id] = child.absoluteXY();
          this.hashedSubProcesses[child.id].width = child.bounds.width();
          this.hashedSubProcesses[child.id].height = child.bounds.height();
          this.hashChildShapes(child);
        }
      }.bind(this));
    },

    /**
     * Handle the layouting of a sub process.
     * Mainly to adjust the child dockers of a sub process.
     *
     */
    handleSubProcess: function (option) {

      var sh = option.shape;

      if (!this.hashedSubProcesses[sh.id]) {
        this.hashedSubProcesses[sh.id] = sh.absoluteXY();
        this.hashedSubProcesses[sh.id].width = sh.bounds.width();
        this.hashedSubProcesses[sh.id].height = sh.bounds.height();
        return;
      }

      var offset = sh.absoluteXY();
      offset.x -= this.hashedSubProcesses[sh.id].x;
      offset.y -= this.hashedSubProcesses[sh.id].y;

      var resized = this.hashedSubProcesses[sh.id].width !== sh.bounds.width() || this.hashedSubProcesses[sh.id].height !== sh.bounds.height();

      this.hashedSubProcesses[sh.id] = sh.absoluteXY();
      this.hashedSubProcesses[sh.id].width = sh.bounds.width();
      this.hashedSubProcesses[sh.id].height = sh.bounds.height();
      this.hashChildShapes(sh);


      // Move dockers only if currently is not resizing
      if (this.facade.isExecutingCommands() && !resized) {
        this.moveChildDockers(sh, offset);
      }
    },

    moveChildDockers: function (shape, offset) {

      if (!offset.x && !offset.y) {
        return;
      }

      var children = shape.getChildNodes(true);

      // Get all nodes
      var dockers = children
      // Get all incoming and outgoing edges
        .map(function (node) {
          return [].concat(node.getIncomingShapes())
            .concat(node.getOutgoingShapes())
        })
        // Flatten all including arrays into one
        .flatten()
        // Get every edge only once
        .uniq()
        // Get all dockers
        .map(function (edge) {
          return edge.dockers.length > 2 ?
            edge.dockers.slice(1, edge.dockers.length - 1) :
            [];
        })
        // Flatten the dockers lists
        .flatten();

      var abs = shape.absoluteBounds();
      abs.moveBy(-offset.x, -offset.y)
      var obj = {};
      dockers.each(function (docker) {

        if (docker.isChanged) {
          return;
        }

        var off = Object.clone(offset);

        if (!abs.isIncluded(docker.bounds.center())) {
          var index = docker.parent.dockers.indexOf(docker);
          var size = docker.parent.dockers.length;
          var from = docker.parent.getSource();
          var to = docker.parent.getTarget();

          var bothAreIncluded = children.include(from) && children.include(to);

          if (!bothAreIncluded) {
            var previousIsOver = index !== 0 ? abs.isIncluded(docker.parent.dockers[index - 1].bounds.center()) : false;
            var nextIsOver = index !== size - 1 ? abs.isIncluded(docker.parent.dockers[index + 1].bounds.center()) : false;

            if (!previousIsOver && !nextIsOver) {
              return;
            }

            var ref = docker.parent.dockers[previousIsOver ? index - 1 : index + 1];
            if (Math.abs(-Math.abs(ref.bounds.center().x - docker.bounds.center().x)) < 2) {
              off.y = 0;
            } else if (Math.abs(-Math.abs(ref.bounds.center().y - docker.bounds.center().y)) < 2) {
              off.x = 0;
            } else {
              return;
            }
          }

        }

        obj[docker.getId()] = {
          docker: docker,
          offset: off
        }
      })

      // Set dockers
      this.facade.executeCommands([new ORYX.Core.MoveDockersCommand(obj)]);

    },

    /**
     * DragDocker.Docked Handler
     *
     */
    handleDockerDocked: function (options) {
      var namespace = this.getNamespace();

      var edge = options.parent;
      var edgeSource = options.target;

      if (edge.getStencil().id() === namespace + "SequenceFlow") {
        var isGateway = edgeSource.getStencil().groups().find(function (group) {
          if (group == "Gateways")
            return group;
        });
        if (!isGateway && (edge.properties["oryx-conditiontype"] == "Expression"))
        // show diamond on edge source
          edge.setProperty("oryx-showdiamondmarker", true);
        else
        // do not show diamond on edge source
          edge.setProperty("oryx-showdiamondmarker", false);

        // update edge rendering
        //edge.update();

        this.facade.getCanvas().update();
      }
    },

    /**
     * PropertyWindow.PropertyChanged Handler
     */
    handlePropertyChanged: function (option) {
      var namespace = this.getNamespace();

      var shapes = option.elements;
      var propertyKey = option.key;
      var propertyValue = option.value;

      var changed = false;
      shapes.each(function (shape) {
        if ((shape.getStencil().id() === namespace + "SequenceFlow") &&
          (propertyKey === "oryx-conditiontype")) {

          if (propertyValue != "Expression")
          // Do not show the Diamond
            shape.setProperty("oryx-showdiamondmarker", false);
          else {
            var incomingShapes = shape.getIncomingShapes();

            if (!incomingShapes) {
              shape.setProperty("oryx-showdiamondmarker", true);
            }

            var incomingGateway = incomingShapes.find(function (aShape) {
              var foundGateway = aShape.getStencil().groups().find(function (group) {
                if (group == "Gateways")
                  return group;
              });
              if (foundGateway)
                return foundGateway;
            });

            if (!incomingGateway)
            // show diamond on edge source
              shape.setProperty("oryx-showdiamondmarker", true);
            else
            // do not show diamond
              shape.setProperty("oryx-showdiamondmarker", false);
          }

          changed = true;
        }
      }.bind(this));

      if (changed) {
        this.facade.getCanvas().update();
      }

    },

    hashedPoolPositions: {},
    hashedLaneDepth: {},
    hashedBounds: {},
    hashedPositions: {},

    /**
     * Handler for layouting event 'layout.bpmn2_0.pool'
     * @param {Object} event
     */
    handleLayoutPool: function (event) {


      var pool = event.shape;
      var selection = this.facade.getSelection();
      var currentShape = selection.include(pool) ? pool : selection.first();

      currentShape = currentShape || pool;

      this.currentPool = pool;

      // Check if it is a pool or a lane
      if (!(currentShape.getStencil().id().endsWith("Pool") || currentShape.getStencil().id().endsWith("Lane"))) {
        return;
      }

      // Check if the lane is within the pool and is not removed lately
      if (currentShape !== pool && !currentShape.isParent(pool) && !this.hashedBounds[pool.id][currentShape.id]) {
        return;
      }


      if (!this.hashedBounds[pool.id]) {
        this.hashedBounds[pool.id] = {};
      }

      // Find all child lanes
      var lanes = this.getLanes(pool);

      if (lanes.length <= 0) {
        return
      }

      var allLanes = this.getLanes(pool, true), hp;
      var considerForDockers = allLanes.clone();

      var hashedPositions = new Hash();
      allLanes.each(function (lane) {
        hashedPositions.set(lane.id, lane.bounds.upperLeft());
      })


      // Show/hide caption regarding the number of lanes
      if (lanes.length === 1 && this.getLanes(lanes.first()).length <= 0) {
        // TRUE if there is a caption
        var caption = lanes.first().properties.get("oryx-name").trim().length > 0;
        lanes.first().setProperty("oryx-showcaption", caption);
        var rect = lanes.first().node.getElementsByTagName("rect");
        rect[0].setAttributeNS(null, "display", "none");
      } else {
        allLanes.invoke("setProperty", "oryx-showcaption", true);
        allLanes.each(function (lane) {
          var rect = lane.node.getElementsByTagName("rect");
          rect[0].removeAttributeNS(null, "display");
        })
      }

      var deletedLanes = [];
      var addedLanes = [];

      // Get all new lanes
      var i = -1;
      while (++i < allLanes.length) {
        if (!this.hashedBounds[pool.id][allLanes[i].id]) {
          addedLanes.push(allLanes[i])
        }
      }

      if (addedLanes.length > 0) {
        currentShape = addedLanes.first();
      }


      // Get all deleted lanes
      var resourceIds = $H(this.hashedBounds[pool.id]).keys();
      var i = -1;
      while (++i < resourceIds.length) {
        if (!allLanes.any(function (lane) {
          return lane.id == resourceIds[i]
        })) {
          deletedLanes.push(this.hashedBounds[pool.id][resourceIds[i]]);
          selection = selection.without(function (r) {
            return r.id == resourceIds[i]
          });
        }
      }

      var height, width, x, y;

      if (deletedLanes.length > 0 || addedLanes.length > 0) {

        if (addedLanes.length === 1 && this.getLanes(addedLanes[0].parent).length === 1) {
          // Set height from the pool
          height = this.adjustHeight(lanes, addedLanes[0].parent);
        } else {
          // Set height from the pool
          height = this.updateHeight(pool);
        }
        // Set width from the pool
        width = this.adjustWidth(lanes, pool.bounds.width());

        pool.update();
      }

      /**
       * Set width/height depending on the pool
       */
      else if (pool == currentShape) {

        if (selection.length === 1 && this.isResized(pool, this.hashedPoolPositions[pool.id])) {
          var oldXY = this.hashedPoolPositions[pool.id].upperLeft();
          var xy = pool.bounds.upperLeft();
          var scale = 0;
          if (this.shouldScale(pool)) {
            var old = this.hashedPoolPositions[pool.id];
            scale = old.height() / pool.bounds.height();
          }

          this.adjustLanes(pool, allLanes, oldXY.x - xy.x, oldXY.y - xy.y, scale);
        }

        // Set height from the pool
        height = this.adjustHeight(lanes, undefined, pool.bounds.height());
        // Set width from the pool
        width = this.adjustWidth(lanes, pool.bounds.width());
      }

      /**‚
       * Set width/height depending on containing lanes
       */
      else {

        // Reposition the pool if one shape is selected and the upperleft has changed
        if (selection.length === 1 && this.isResized(currentShape, this.hashedBounds[pool.id][currentShape.id])) {
          var oldXY = this.hashedBounds[pool.id][currentShape.id].upperLeft();
          var xy = currentShape.absoluteXY();
          x = oldXY.x - xy.x;
          y = oldXY.y - xy.y;

          // Adjust all other lanes beneath this lane
          if (x || y) {
            considerForDockers = considerForDockers.without(currentShape);
            this.adjustLanes(pool, this.getAllExcludedLanes(pool, currentShape), x, 0);
          }

          // Adjust all child lanes
          var childLanes = this.getLanes(currentShape, true);
          if (childLanes.length > 0) {
            if (this.shouldScale(currentShape)) {
              var old = this.hashedBounds[pool.id][currentShape.id];
              var scale = old.height() / currentShape.bounds.height();
              this.adjustLanes(pool, childLanes, x, y, scale);
            } else {
              this.adjustLanes(pool, childLanes, x, y, 0);
            }
          }
        }

        // Cache all bounds
        var changes = allLanes.map(function (lane) {
          return {
            shape: lane,
            bounds: lane.bounds.clone()
          }
        });

        // Get height and adjust child heights
        height = this.adjustHeight(lanes, currentShape);
        // Check if something has changed and maybe create a command
        this.checkForChanges(allLanes, changes);

        // Set width from the current shape
        width = this.adjustWidth(lanes, currentShape.bounds.width() + (this.getDepth(currentShape, pool) * 30));
      }

      this.setDimensions(pool, width, height, x, y);


      if (this.facade.isExecutingCommands() && (deletedLanes.length === 0 || addedLanes.length !== 0)) {
        // Update all dockers
        this.updateDockers(considerForDockers, pool);

        // Check if the order has changed
        var poolHashedPositions = this.hashedPositions[pool.id];
        if (poolHashedPositions && poolHashedPositions.keys().any(function (key, i) {
          return (allLanes[i] || {}).id !== key;
        })) {

          var LanesHasBeenReordered = ORYX.Core.Command.extend({
            construct: function (originPosition, newPosition, lanes, plugin, poolId) {
              this.originPosition = Object.clone(originPosition);
              this.newPosition = Object.clone(newPosition);
              this.lanes = lanes;
              this.plugin = plugin;
              this.pool = poolId;
            },
            execute: function () {
              if (!this.executed) {
                this.executed = true;
                this.lanes.each(function (lane) {
                  if (this.newPosition[lane.id])
                    lane.bounds.moveTo(this.newPosition[lane.id])
                }.bind(this));
                this.plugin.hashedPositions[this.pool] = Object.clone(this.newPosition);
              }
            },
            rollback: function () {
              this.lanes.each(function (lane) {
                if (this.originPosition[lane.id])
                  lane.bounds.moveTo(this.originPosition[lane.id])
              }.bind(this));
              this.plugin.hashedPositions[this.pool] = Object.clone(this.originPosition);
            }
          });

          var hp2 = new Hash();
          allLanes.each(function (lane) {
            hp2.set(lane.id, lane.bounds.upperLeft());
          })

          var command = new LanesHasBeenReordered(hashedPositions, hp2, allLanes, this, pool.id);
          this.facade.executeCommands([command]);

        }
      }

      this.hashedBounds[pool.id] = {};
      this.hashedPositions[pool.id] = hashedPositions;

      var i = -1;
      while (++i < allLanes.length) {
        // Cache positions
        this.hashedBounds[pool.id][allLanes[i].id] = allLanes[i].absoluteBounds();

        // Cache also the bounds of child shapes, mainly for child subprocesses
        this.hashChildShapes(allLanes[i]);

        this.hashedLaneDepth[allLanes[i].id] = this.getDepth(allLanes[i], pool);

        this.forceToUpdateLane(allLanes[i]);
      }

      this.hashedPoolPositions[pool.id] = pool.bounds.clone();


      // Update selection
      //this.facade.setSelection(selection);
    },

    shouldScale: function (element) {
      var childLanes = element.getChildNodes().findAll(function (shape) {
        return shape.getStencil().id().endsWith("Lane")
      })
      return childLanes.length > 1 || childLanes.any(function (lane) {
        return this.shouldScale(lane)
      }.bind(this))
    },

    /**
     * Lookup if some bounds has changed
     * @param {Object} lanes
     * @param {Object} changes
     */
    checkForChanges: function (lanes, changes) {
      // Check if something has changed
      if (this.facade.isExecutingCommands() && changes.any(function (change) {
        return change.shape.bounds.toString() !== change.bounds.toString();
      })) {

        var Command = ORYX.Core.Command.extend({
          construct: function (changes) {
            this.oldState = changes;
            this.newState = changes.map(function (s) {
              return {shape: s.shape, bounds: s.bounds.clone()}
            });
          },
          execute: function () {
            if (this.executed) {
              this.applyState(this.newState);
            }
            this.executed = true;
          },
          rollback: function () {
            this.applyState(this.oldState);
          },
          applyState: function (state) {
            state.each(function (s) {
              s.shape.bounds.set(s.bounds.upperLeft(), s.bounds.lowerRight());
            })
          }
        });

        this.facade.executeCommands([new Command(changes)]);
      }
    },

    isResized: function (shape, bounds) {

      if (!bounds || !shape) {
        return false;
      }

      var oldB = bounds;
      //var oldXY = oldB.upperLeft();
      //var xy = shape.absoluteXY();
      return Math.round(oldB.width() - shape.bounds.width()) !== 0 || Math.round(oldB.height() - shape.bounds.height()) !== 0
    },

    adjustLanes: function (pool, lanes, x, y, scale) {

      scale = scale || 0;

      // For every lane, adjust the child nodes with the offset
      lanes.each(function (l) {
        l.getChildNodes().each(function (child) {
          if (!child.getStencil().id().endsWith("Lane")) {
            var cy = scale ? child.bounds.center().y - (child.bounds.center().y / scale) : -y;
            child.bounds.moveBy((x || 0), -cy);

            if (scale && child.getStencil().id().endsWith("Subprocess")) {
              this.moveChildDockers(child, {x: (0), y: -cy});
            }

          }
        }.bind(this));
        this.hashedBounds[pool.id][l.id].moveBy(-(x || 0), !scale ? -y : 0);
        if (scale) {
          l.isScaled = true;
        }
      }.bind(this))

    },

    getAllExcludedLanes: function (parent, lane) {
      var lanes = [];
      parent.getChildNodes().each(function (shape) {
        if ((!lane || shape !== lane) && shape.getStencil().id().endsWith("Lane")) {
          lanes.push(shape);
          lanes = lanes.concat(this.getAllExcludedLanes(shape, lane));
        }
      }.bind(this));
      return lanes;
    },


    forceToUpdateLane: function (lane) {

      if (lane.bounds.height() !== lane._svgShapes[0].height) {
        lane.isChanged = true;
        lane.isResized = true;
        lane._update();
      }
    },

    getDepth: function (child, parent) {

      var i = 0;
      while (child && child.parent && child !== parent) {
        child = child.parent;
        ++i
      }
      return i;
    },

    updateDepth: function (lane, fromDepth, toDepth) {

      var xOffset = (fromDepth - toDepth) * 30;

      lane.getChildNodes().each(function (shape) {
        shape.bounds.moveBy(xOffset, 0);

        [].concat(children[j].getIncomingShapes())
          .concat(children[j].getOutgoingShapes())

      })

    },

    setDimensions: function (shape, width, height, x, y) {
      var isLane = shape.getStencil().id().endsWith("Lane");
      // Set the bounds
      shape.bounds.set(
        isLane ? 30 : (shape.bounds.a.x - (x || 0)),
        isLane ? shape.bounds.a.y : (shape.bounds.a.y - (y || 0)),
        width ? shape.bounds.a.x + width - (isLane ? 30 : (x || 0)) : shape.bounds.b.x,
        height ? shape.bounds.a.y + height - (isLane ? 0 : (y || 0)) : shape.bounds.b.y
      );
    },

    setLanePosition: function (shape, y) {

      shape.bounds.moveTo(30, y);

    },

    adjustWidth: function (lanes, width) {

      // Set width to each lane
      (lanes || []).each(function (lane) {
        this.setDimensions(lane, width);
        this.adjustWidth(this.getLanes(lane), width - 30);
      }.bind(this));

      return width;
    },


    adjustHeight: function (lanes, changedLane, propagateHeight) {

      var oldHeight = 0;
      if (!changedLane && propagateHeight) {
        var i = -1;
        while (++i < lanes.length) {
          oldHeight += lanes[i].bounds.height();
        }
      }

      var i = -1;
      var height = 0;

      // Iterate trough every lane
      while (++i < lanes.length) {

        if (lanes[i] === changedLane) {
          // Propagate new height down to the children
          this.adjustHeight(this.getLanes(lanes[i]), undefined, lanes[i].bounds.height());

          lanes[i].bounds.set({x: 30, y: height}, {
            x: lanes[i].bounds.width() + 30,
            y: lanes[i].bounds.height() + height
          })

        } else if (!changedLane && propagateHeight) {

          var tempHeight = (lanes[i].bounds.height() * propagateHeight) / oldHeight;
          // Propagate height
          this.adjustHeight(this.getLanes(lanes[i]), undefined, tempHeight);
          // Set height propotional to the propagated and old height
          this.setDimensions(lanes[i], null, tempHeight);
          this.setLanePosition(lanes[i], height);
        } else {
          // Get height from children
          var tempHeight = this.adjustHeight(this.getLanes(lanes[i]), changedLane, propagateHeight);
          if (!tempHeight) {
            tempHeight = lanes[i].bounds.height();
          }
          this.setDimensions(lanes[i], null, tempHeight);
          this.setLanePosition(lanes[i], height);
        }

        height += lanes[i].bounds.height();
      }

      return height;

    },


    updateHeight: function (root) {

      var lanes = this.getLanes(root);

      if (lanes.length == 0) {
        return root.bounds.height();
      }

      var height = 0;
      var i = -1;
      while (++i < lanes.length) {
        this.setLanePosition(lanes[i], height);
        height += this.updateHeight(lanes[i]);
      }

      this.setDimensions(root, null, height);

      return height;
    },

    getOffset: function (lane, includePool, pool) {

      var offset = {x: 0, y: 0};


      /*var parent = lane;
                 while(parent) {


                        var offParent = this.hashedBounds[pool.id][parent.id] ||(includePool === true ? this.hashedPoolPositions[parent.id] : undefined);
                        if (offParent){
                                var ul = parent.bounds.upperLeft();
                                var ulo = offParent.upperLeft();
                                offset.x += ul.x-ulo.x;
                                offset.y += ul.y-ulo.y;
                        }

                        if (parent.getStencil().id().endsWith("Pool")) {
                                break;
                        }

                        parent = parent.parent;
                }       */

      var offset = lane.absoluteXY();

      var hashed = this.hashedBounds[pool.id][lane.id] || (includePool === true ? this.hashedPoolPositions[lane.id] : undefined);
      if (hashed) {
        offset.x -= hashed.upperLeft().x;
        offset.y -= hashed.upperLeft().y;
      } else {
        return {x: 0, y: 0}
      }
      return offset;
    },

    getNextLane: function (shape) {
      while (shape && !shape.getStencil().id().endsWith("Lane")) {
        if (shape instanceof ORYX.Core.Canvas) {
          return null;
        }
        shape = shape.parent;
      }
      return shape;
    },

    getParentPool: function (shape) {
      while (shape && !shape.getStencil().id().endsWith("Pool")) {
        if (shape instanceof ORYX.Core.Canvas) {
          return null;
        }
        shape = shape.parent;
      }
      return shape;
    },

    updateDockers: function (lanes, pool) {

      var absPool = pool.absoluteBounds(), movedShapes = [];
      var oldPool = (this.hashedPoolPositions[pool.id] || absPool).clone();

      var i = -1, j = -1, k = -1, l = -1, docker;
      var dockers = {};

      while (++i < lanes.length) {

        if (!this.hashedBounds[pool.id][lanes[i].id]) {
          continue;
        }

        var isScaled = lanes[i].isScaled;
        delete lanes[i].isScaled;
        var children = lanes[i].getChildNodes();
        var absBounds = lanes[i].absoluteBounds();
        var oldBounds = (this.hashedBounds[pool.id][lanes[i].id] || absBounds);
        //oldBounds.moveBy((absBounds.upperLeft().x-lanes[i].bounds.upperLeft().x), (absBounds.upperLeft().y-lanes[i].bounds.upperLeft().y));
        var offset = this.getOffset(lanes[i], true, pool);
        var xOffsetDepth = 0;

        var depth = this.getDepth(lanes[i], pool);
        if (this.hashedLaneDepth[lanes[i].id] !== undefined && this.hashedLaneDepth[lanes[i].id] !== depth) {
          xOffsetDepth = (this.hashedLaneDepth[lanes[i].id] - depth) * 30;
          offset.x += xOffsetDepth;
        }

        j = -1;

        while (++j < children.length) {

          if (xOffsetDepth && !children[j].getStencil().id().endsWith("Lane")) {
            movedShapes.push({xOffset: xOffsetDepth, shape: children[j]});
            children[j].bounds.moveBy(xOffsetDepth, 0);
          }

          if (children[j].getStencil().id().endsWith("Subprocess")) {
            this.moveChildDockers(children[j], offset);
          }

          var edges = [].concat(children[j].getIncomingShapes())
            .concat(children[j].getOutgoingShapes())
            // Remove all edges which are included in the selection from the list
            .findAll(function (r) {
              return r instanceof ORYX.Core.Edge
            })

          k = -1;
          while (++k < edges.length) {

            if (edges[k].getStencil().id().endsWith("MessageFlow")) {
              this.layoutEdges(children[j], [edges[k]], offset);
              continue;
            }

            l = -1;
            while (++l < edges[k].dockers.length) {

              docker = edges[k].dockers[l];

              if (docker.getDockedShape() || docker.isChanged) {
                continue;
              }


              pos = docker.bounds.center();

              // Check if the modified center included the new position
              var isOverLane = oldBounds.isIncluded(pos);
              // Check if the original center is over the pool
              var isOutSidePool = !oldPool.isIncluded(pos);
              var previousIsOverLane = l == 0 ? isOverLane : oldBounds.isIncluded(edges[k].dockers[l - 1].bounds.center());
              var nextIsOverLane = l == edges[k].dockers.length - 1 ? isOverLane : oldBounds.isIncluded(edges[k].dockers[l + 1].bounds.center());
              var off = Object.clone(offset);

              // If the
              if (isScaled && isOverLane && this.isResized(lanes[i], this.hashedBounds[pool.id][lanes[i].id])) {
                var relY = (pos.y - absBounds.upperLeft().y + off.y);
                off.y -= (relY - (relY * (absBounds.height() / oldBounds.height())));
              }

              // Check if the previous dockers docked shape is from this lane
              // Otherwise, check if the docker is over the lane OR is outside the lane
              // but the previous/next was over this lane
              if (isOverLane) {
                dockers[docker.id] = {docker: docker, offset: off};
              }
              /*else if (l == 1 && edges[k].dockers.length>2 && edges[k].dockers[l-1].isDocked()){
                                                        var dockedLane = this.getNextLane(edges[k].dockers[l-1].getDockedShape());
                                                        if (dockedLane != lanes[i])
                                                                continue;
                                                        dockers[docker.id] = {docker: docker, offset:offset};
                                                }
                                                // Check if the next dockers docked shape is from this lane
                                                else if (l == edges[k].dockers.length-2 && edges[k].dockers.length>2 && edges[k].dockers[l+1].isDocked()){
                                                        var dockedLane = this.getNextLane(edges[k].dockers[l+1].getDockedShape());
                                                        if (dockedLane != lanes[i])
                                                                continue;
                                                        dockers[docker.id] = {docker: docker, offset:offset};
                                                }

                                                else if (isOutSidePool) {
                                                        dockers[docker.id] = {docker: docker, offset:this.getOffset(lanes[i], true, pool)};
                                                }*/


            }
          }

        }
      }

      // Move the moved children
      var MoveChildCommand = ORYX.Core.Command.extend({
        construct: function (state) {
          this.state = state;
        },
        execute: function () {
          if (this.executed) {
            this.state.each(function (s) {
              s.shape.bounds.moveBy(s.xOffset, 0);
            });
          }
          this.executed = true;
        },
        rollback: function () {
          this.state.each(function (s) {
            s.shape.bounds.moveBy(-s.xOffset, 0);
          });
        }
      })


      // Set dockers
      this.facade.executeCommands([new ORYX.Core.MoveDockersCommand(dockers), new MoveChildCommand(movedShapes)]);

    },

    moveBy: function (pos, offset) {
      pos.x += offset.x;
      pos.y += offset.y;
      return pos;
    },

    getHashedBounds: function (shape) {
      return this.currentPool && this.hashedBounds[this.currentPool.id][shape.id] ? this.hashedBounds[this.currentPool.id][shape.id] : shape.absoluteBounds();
    },

    /**
     * Returns a set on all child lanes for the given Shape. If recursive is TRUE, also indirect children will be returned (default is FALSE)
     * The set is sorted with first child the lowest y-coordinate and the last one the highest.
     * @param {ORYX.Core.Shape} shape
     * @param {boolean} recursive
     */
    getLanes: function (shape, recursive) {
      var namespace = this.getNamespace();

      // Get all the child lanes
      var lanes = shape.getChildNodes(recursive || false).findAll(function (node) {
        return (node.getStencil().id() === namespace + "Lane");
      });

      // Sort all lanes by there y coordinate
      lanes = lanes.sort(function (a, b) {

        // Get y coordinates for upper left and lower right
        var auy = Math.round(a.bounds.upperLeft().y);
        var buy = Math.round(b.bounds.upperLeft().y);
        var aly = Math.round(a.bounds.lowerRight().y);
        var bly = Math.round(b.bounds.lowerRight().y);

        var ha = this.getHashedBounds(a);
        var hb = this.getHashedBounds(b);

        // Get the old y coordinates
        var oauy = Math.round(ha.upperLeft().y);
        var obuy = Math.round(hb.upperLeft().y);
        var oaly = Math.round(ha.lowerRight().y);
        var obly = Math.round(hb.lowerRight().y);

        // If equal, than use the old one
        if (auy == buy && aly == bly) {
          auy = oauy;
          buy = obuy;
          aly = oaly;
          bly = obly;
        }

        if (Math.round(a.bounds.height() - ha.height()) === 0 && Math.round(b.bounds.height() - hb.height()) === 0) {
          return auy < buy ? -1 : (auy > buy ? 1 : 0);
        }

        // Check if upper left and lower right is completely above/below
        var above = auy < buy && aly < bly;
        var below = auy > buy && aly > bly;
        // Check if a is above b including the old values
        var slightlyAboveBottom = auy < buy && aly >= bly && oaly < obly;
        var slightlyAboveTop = auy >= buy && aly < bly && oauy < obuy;
        // Check if a is below b including the old values
        var slightlyBelowBottom = auy > buy && aly <= bly && oaly > obly;
        var slightlyBelowTop = auy <= buy && aly > bly && oauy > obuy;

        // Return -1 if a is above b, 1 if b is above a, or 0 otherwise
        return (above || slightlyAboveBottom || slightlyAboveTop ? -1 : (below || slightlyBelowBottom || slightlyBelowTop ? 1 : 0))
      }.bind(this));

      // Return lanes
      return lanes;
    },

    getNamespace: function () {
      if (!this.namespace) {
        var stencilsets = this.facade.getStencilSets();
        if (stencilsets.keys()) {
          this.namespace = stencilsets.keys()[0];
        } else {
          return undefined;
        }
      }
      return this.namespace;
    }
  };

  var ResizeLanesCommand = ORYX.Core.Command.extend({

    construct: function (shape, parent, pool, plugin) {

      this.facade = plugin.facade;
      this.plugin = plugin;
      this.shape = shape;
      this.changes;

      this.pool = pool;

      this.parent = parent;


      this.shapeChildren = [];

      /*
                 * The Bounds have to be stored
                 * separate because they would
                 * otherwise also be influenced
                 */
      this.shape.getChildShapes().each(function (childShape) {
        this.shapeChildren.push({
          shape: childShape,
          bounds: {
            a: {
              x: childShape.bounds.a.x,
              y: childShape.bounds.a.y
            },
            b: {
              x: childShape.bounds.b.x,
              y: childShape.bounds.b.y
            }
          }
        });
      }.bind(this));

      this.shapeUpperLeft = this.shape.bounds.upperLeft();

      // If there is no parent,
      // correct the abs position with the parents abs.
      /*if (!this.shape.parent) {
                        var pAbs = parent.absoluteXY();
                        this.shapeUpperLeft.x += pAbs.x;
                        this.shapeUpperLeft.y += pAbs.y;
                }*/
      this.parentHeight = this.parent.bounds.height();

    },

    getLeafLanes: function (lane) {
      var childLanes = this.plugin.getLanes(lane).map(function (child) {
        return this.getLeafLanes(child);
      }.bind(this)).flatten();
      return childLanes.length > 0 ? childLanes : [lane];
    },

    findNewLane: function () {

      var lanes = this.plugin.getLanes(this.parent);

      var leafLanes = this.getLeafLanes(this.parent);
      /*leafLanes = leafLanes.sort(function(a,b){
                        var aupl = a.absoluteXY().y;
                        var bupl = b.absoluteXY().y;
                        return aupl < bupl ? -1 : (aupl > bupl ? 1 : 0)
                })*/
      this.lane = leafLanes.find(function (l) {
        return l.bounds.upperLeft().y >= this.shapeUpperLeft.y
      }.bind(this)) || leafLanes.last();
      this.laneUpperLeft = this.lane.bounds.upperLeft();
    },

    execute: function () {

      if (this.changes) {
        this.executeAgain();
        return;
      }

      /*
                 * Rescue all ChildShapes of the deleted
                 * Shape into the lane that takes its
                 * place
                 */

      if (!this.lane) {
        this.findNewLane();
      }

      if (this.lane) {

        var laUpL = this.laneUpperLeft;
        var shUpL = this.shapeUpperLeft;

        var depthChange = this.plugin.getDepth(this.lane, this.parent) - 1;

        this.changes = $H({});

        // Selected lane is BELOW the removed lane
        if (laUpL.y >= shUpL.y) {
          this.lane.getChildShapes().each(function (childShape) {

            /*
                                         * Cache the changes for rollback
                                         */
            if (!this.changes[childShape.getId()]) {
              this.changes[childShape.getId()] = this.computeChanges(childShape, this.lane, this.lane, this.shape.bounds.height());
            }

            childShape.bounds.moveBy(0, this.shape.bounds.height());
          }.bind(this));

          this.plugin.hashChildShapes(this.lane);

          this.shapeChildren.each(function (shapeChild) {
            shapeChild.shape.bounds.set(shapeChild.bounds);
            shapeChild.shape.bounds.moveBy((shUpL.x - 30) - (depthChange * 30), 0);

            /*
                                         * Cache the changes for rollback
                                         */
            if (!this.changes[shapeChild.shape.getId()]) {
              this.changes[shapeChild.shape.getId()] = this.computeChanges(shapeChild.shape, this.shape, this.lane, 0);
            }

            this.lane.add(shapeChild.shape);

          }.bind(this));

          this.lane.bounds.moveBy(0, shUpL.y - laUpL.y);

          // Selected lane is ABOVE the removed lane
        } else if (shUpL.y > laUpL.y) {

          this.shapeChildren.each(function (shapeChild) {
            shapeChild.shape.bounds.set(shapeChild.bounds);
            shapeChild.shape.bounds.moveBy((shUpL.x - 30) - (depthChange * 30), this.lane.bounds.height());

            /*
                                         * Cache the changes for rollback
                                         */
            if (!this.changes[shapeChild.shape.getId()]) {
              this.changes[shapeChild.shape.getId()] = this.computeChanges(shapeChild.shape, this.shape, this.lane, 0);
            }

            this.lane.add(shapeChild.shape);

          }.bind(this));
        }


      }

      /*
                 * Adjust the height of the lanes
                 */
      // Get the height values
      var oldHeight = this.lane.bounds.height();
      var newHeight = this.lane.length === 1 ? this.parentHeight : this.lane.bounds.height() + this.shape.bounds.height();

      // Set height
      this.setHeight(newHeight, oldHeight, this.parent, this.parentHeight, true);

      // Cache all sibling lanes
      //this.changes[this.shape.getId()] = this.computeChanges(this.shape, this.parent, this.parent, 0);
      this.plugin.getLanes(this.parent).each(function (childLane) {
        if (!this.changes[childLane.getId()] && childLane !== this.lane && childLane !== this.shape) {
          this.changes[childLane.getId()] = this.computeChanges(childLane, this.parent, this.parent, 0);
        }
      }.bind(this))

      // Update
      this.update();
    },

    setHeight: function (newHeight, oldHeight, parent, parentHeight, store) {

      // Set heigh of the lane
      this.plugin.setDimensions(this.lane, this.lane.bounds.width(), newHeight);
      this.plugin.hashedBounds[this.pool.id][this.lane.id] = this.lane.absoluteBounds();

      // Adjust child lanes
      this.plugin.adjustHeight(this.plugin.getLanes(parent), this.lane);

      if (store === true) {
        // Store changes
        this.changes[this.shape.getId()] = this.computeChanges(this.shape, parent, parent, 0, oldHeight, newHeight);
      }

      // Set parents height
      this.plugin.setDimensions(parent, parent.bounds.width(), parentHeight);

      if (parent !== this.pool) {
        this.plugin.setDimensions(this.pool, this.pool.bounds.width(), this.pool.bounds.height() + (newHeight - oldHeight));
      }
    },

    update: function () {

      // Hack to prevent the updating of the dockers
      this.plugin.hashedBounds[this.pool.id]["REMOVED"] = true;
      // Update
      //this.facade.getCanvas().update();
    },

    rollback: function () {

      var laUpL = this.laneUpperLeft;
      var shUpL = this.shapeUpperLeft;

      this.changes.each(function (pair) {

        var parent = pair.value.oldParent;
        var shape = pair.value.shape;
        var parentHeight = pair.value.parentHeight;
        var oldHeight = pair.value.oldHeight;
        var newHeight = pair.value.newHeight;

        // Move siblings
        if (shape.getStencil().id().endsWith("Lane")) {
          shape.bounds.moveTo(pair.value.oldPosition);
        }

        // If lane
        if (oldHeight) {
          this.setHeight(oldHeight, newHeight, parent, parent.bounds.height() + (oldHeight - newHeight));
          if (laUpL.y >= shUpL.y) {
            this.lane.bounds.moveBy(0, this.shape.bounds.height() - 1);
          }
        } else {
          parent.add(shape);
          shape.bounds.moveTo(pair.value.oldPosition);

        }


      }.bind(this));

      // Update
      //this.update();

    },

    executeAgain: function () {

      this.changes.each(function (pair) {
        var parent = pair.value.newParent;
        var shape = pair.value.shape;
        var newHeight = pair.value.newHeight;
        var oldHeight = pair.value.oldHeight;

        // If lane
        if (newHeight) {
          var laUpL = this.laneUpperLeft.y;
          var shUpL = this.shapeUpperLeft.y;

          if (laUpL >= shUpL) {
            this.lane.bounds.moveBy(0, shUpL - laUpL);
          }
          this.setHeight(newHeight, oldHeight, parent, parent.bounds.height() + (newHeight - oldHeight));
        } else {
          parent.add(shape);
          shape.bounds.moveTo(pair.value.newPosition);
        }

      }.bind(this));

      // Update
      this.update();
    },

    computeChanges: function (shape, oldParent, parent, yOffset, oldHeight, newHeight) {

      oldParent = this.changes[shape.getId()] ? this.changes[shape.getId()].oldParent : oldParent;
      var oldPosition = this.changes[shape.getId()] ? this.changes[shape.getId()].oldPosition : shape.bounds.upperLeft();

      var sUl = shape.bounds.upperLeft();

      var pos = {x: sUl.x, y: sUl.y + yOffset};

      var changes = {
        shape: shape,
        parentHeight: oldParent.bounds.height(),
        oldParent: oldParent,
        oldPosition: oldPosition,
        oldHeight: oldHeight,
        newParent: parent,
        newPosition: pos,
        newHeight: newHeight
      };

      return changes;
    }

  });

  ORYX.Plugins.BPMN2_0 = ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.BPMN2_0);

}()