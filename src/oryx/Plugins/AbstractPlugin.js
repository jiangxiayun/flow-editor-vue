import ORYX_Command from '../core/Command'
import ORYX_Config from '../CONFIG'
import ORYX_Log from '../Log'
import ORYX_Editor from '../Editor'
import { DataManager } from '../Kickstart'
import ORYX_Node from '../core/Node'

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
export default class AbstractPlugin {
  /**
   * The facade which offer editor-specific functionality
   * @type Facade
   * @memberOf ORYX.Plugins.AbstractPlugin.prototype
   */
  constructor (facade) {
    this.facade = facade
    this.facade.registerOnEvent(ORYX_Config.EVENT_LOADED, this.onLoaded.bind(this))
  }

  /**
   Overwrite to handle load event. TODO: Document params!!!
   @methodOf ORYX.Plugins.AbstractPlugin.prototype
   */
  onLoaded () {
  }

  /**
   Overwrite to handle selection changed event. TODO: Document params!!!
   @methodOf ORYX.Plugins.AbstractPlugin.prototype
   */
  onSelectionChanged () {
  }

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
  showOverlay (shapes, attributes, svgNode, svgNodePosition) {

    if (!(shapes instanceof Array)) {
      shapes = [shapes]
    }

    // Define Shapes
    shapes = shapes.map(function (shape) {
      let el = shape
      if (typeof shape == 'string') {
        el = this.facade.getCanvas().getChildShapeByResourceId(shape)
        el = el || this.facade.getCanvas().getChildById(shape, true)
      }
      return el
    }.bind(this)).compact()

    // Define unified id
    if (!this.overlayID) {
      this.overlayID = this.type + ORYX_Editor.provideId()
    }

    this.facade.raiseEvent({
      type: ORYX_Config.EVENT_OVERLAY_SHOW,
      id: this.overlayID,
      shapes: shapes,
      attributes: attributes,
      node: svgNode,
      nodePosition: svgNodePosition || 'NW'
    })

  }

  /**
   Hide current overlay.
   @methodOf ORYX.Plugins.AbstractPlugin.prototype
   */
  hideOverlay () {
    this.facade.raiseEvent({
      type: ORYX_Config.EVENT_OVERLAY_HIDE,
      id: this.overlayID
    })
  }

  /**
   Does a transformation with the given xslt stylesheet.
   @methodOf ORYX.Plugins.AbstractPlugin.prototype
   @param {String} data The data (e.g. eRDF) which should be transformed
   @param {String} stylesheet URL of a stylesheet which should be used for transforming data.
   */
  doTransform (data, stylesheet) {

    if (!stylesheet || !data) {
      return ''
    }

    let parser = new DOMParser()
    let parsedData = parser.parseFromString(data, 'text/xml')
    let source = stylesheet
    let xsl
    new Ajax.Request(source, {
      asynchronous: false,
      method: 'get',
      onSuccess: function (transport) {
        xsl = transport.responseText
      }.bind(this),
      onFailure: (function (transport) {
        ORYX_Log.error('XSL load failed' + transport)
      }).bind(this)
    })
    let xsltProcessor = new XSLTProcessor()
    let domParser = new DOMParser()
    let xslObject = domParser.parseFromString(xsl, 'text/xml')
    xsltProcessor.importStylesheet(xslObject)

    try {
      let newData = xsltProcessor.transformToFragment(parsedData, document)
      let serializedData = (new XMLSerializer()).serializeToString(newData)

      /* Firefox 2 to 3 problem?! */
      serializedData = !serializedData.startsWith('<?xml') ? '<?xml version="1.0" encoding="UTF-8"?>' + serializedData : serializedData

      return serializedData

    } catch (error) {
      return -1
    }

  }

  /**
   * Opens a new window that shows the given XML content.
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   * @param {Object} content The XML content to be shown.
   * @example
   * openDownloadWindow( "my.xml", "<exampleXML />" );
   */
  openXMLWindow (content) {
    let win = window.open(
      'data:application/xml,' + encodeURIComponent(
      content
      ),
      '_blank', 'resizable=yes,width=600,height=600,toolbar=0,scrollbars=yes'
    )
  }

  /**
   * Opens a download window for downloading the given content.
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   * @param {String} filename The content's file name
   * @param {String} content The content to download
   */
  openDownloadWindow (filename, content) {
    let win = window.open('')
    if (win != null) {
      win.document.open()
      win.document.write('<html><body>')
      let submitForm = win.document.createElement('form')
      win.document.body.appendChild(submitForm)

      let createHiddenElement = function (name, value) {
        let newElement = document.createElement('input')
        newElement.name = name
        newElement.type = 'hidden'
        newElement.value = value
        return newElement
      }

      submitForm.appendChild(createHiddenElement('download', content))
      submitForm.appendChild(createHiddenElement('file', filename))


      submitForm.method = 'POST'
      win.document.write('</body></html>')
      win.document.close()
      submitForm.action = ORYX_Config.PATH + '/download'
      submitForm.submit()
    }
  }

  /**
   * Serializes DOM.
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   * @type {String} Serialized DOM
   */
  getSerializedDOM () {
    // Force to set all resource IDs
    let serializedDOM = DataManager.serializeDOM(this.facade)

    // add namespaces
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
      location.href.split('?')[0] +
      '" />' +
      '</head><body>' +
      serializedDOM +
      '</body></html>'

    return serializedDOM
  }

  /**
   * Sets the editor in read only mode: Edges/ dockers cannot be moved anymore,
   * shapes cannot be selected anymore.
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   */
  enableReadOnlyMode () {
    // Edges cannot be moved anymore
    this.facade.disableEvent(ORYX_Config.EVENT_MOUSEDOWN)

    // Stop the user from editing the diagram while the plugin is active
    this._stopSelectionChange = function () {
      if (this.facade.getSelection().length > 0) {
        this.facade.setSelection([])
      }
    }
    this.facade.registerOnEvent(ORYX_Config.EVENT_SELECTION_CHANGED, this._stopSelectionChange.bind(this))
  }

  /**
   * Disables read only mode, see @see
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   * @see ORYX.Plugins.AbstractPlugin.prototype.enableReadOnlyMode
   */
  disableReadOnlyMode () {
    // Edges can be moved now again
    this.facade.enableEvent(ORYX_Config.EVENT_MOUSEDOWN)

    if (this._stopSelectionChange) {
      this.facade.unregisterOnEvent(ORYX_Config.EVENT_SELECTION_CHANGED, this._stopSelectionChange.bind(this))
      this._stopSelectionChange = undefined
    }
  }

  /**
   * Extracts RDF from DOM.
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   * @type {String} Extracted RFD. Null if there are transformation errors.
   */
  getRDFFromDOM () {
    //convert to RDF
    try {
      let xsl = ''
      let source = ORYX_Config.PATH + 'lib/extract-rdf.xsl'
      new Ajax.Request(source, {
        asynchronous: false,
        method: 'get',
        onSuccess: function (transport) {
          xsl = transport.responseText
        }.bind(this),
        onFailure: (function (transport) {
          ORYX_Log.error('XSL load failed' + transport)
        }).bind(this)
      })

      let domParser = new DOMParser()
      let xmlObject = domParser.parseFromString(this.getSerializedDOM(), 'text/xml')
      let xslObject = domParser.parseFromString(xsl, 'text/xml')
      let xsltProcessor = new XSLTProcessor()
      xsltProcessor.importStylesheet(xslObject)
      let result = xsltProcessor.transformToFragment(xmlObject, document)
      let serializer = new XMLSerializer()

      return serializer.serializeToString(result)
    } catch (e) {
      console.log('error serializing ' + e)
      return ''
    }
  }

  /**
   * Checks if a certain stencil set is loaded right now.
   *
   */
  isStencilSetExtensionLoaded (stencilSetExtensionNamespace) {
    return this.facade.getStencilSets().values().any(
      function (ss) {
        return ss.extensions().keys().any(
          function (extensionKey) {
            return extensionKey == stencilSetExtensionNamespace
          }.bind(this)
        )
      }.bind(this)
    )
  }

  /**
   * Raises an event so that registered layouters does
   * have the posiblility to layout the given shapes
   * For further reading, have a look into the AbstractLayouter
   * class
   * @param {Object} shapes
   */
  doLayout (shapes) {
    // Raises a do layout event
    if (this.facade.raiseEvent) {
      this.facade.raiseEvent({
        type: ORYX_Config.EVENT_LAYOUT,
        shapes: shapes
      })
    } else {
      this.facade.handleEvents({
        type: ORYX_Config.EVENT_LAYOUT,
        shapes: shapes
      })
    }
  }

  /**
   * Does a primitive layouting with the incoming/outgoing
   * edges (set the dockers to the right position) and if
   * necessary, it will be called the real layouting
   * @param {ORYX.Core.Node} node
   * @param {Array} edges
   */
  layoutEdges (node, allEdges, offset) {
    if (!this.facade.isExecutingCommands()) {
      return
    }

    class Command extends ORYX_Command{
      constructor (edges, node, offset, plugin) {
        super()
        this.edges = edges
        this.node = node
        this.plugin = plugin
        this.offset = offset

        // Get the new absolute center
        let center = node.absoluteXY()
        this.ulo = { x: center.x - offset.x, y: center.y - offset.y }
      }
      execute () {
        if (this.changes) {
          this.executeAgain()
          return
        } else {
          this.changes = []
          this.edges.each(function (edge) {
            this.changes.push({
              edge: edge,
              oldDockerPositions: edge.dockers.map(function (r) {
                return r.bounds.center()
              })
            })
          }.bind(this))
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
              var second = edge.dockers[1]
              if (this.align(second.bounds, edge.dockers.first())) {
                second.update()
              }
            } else if (edge.dockers.last().getDockedShape() === this.node) {
              var beforeLast = edge.dockers[edge.dockers.length - 2]
              if (this.align(beforeLast.bounds, edge.dockers.last())) {
                beforeLast.update()
              }
            }
            edge._update(true)
            edge.removeUnusedDockers()
            if (this.isBendPointIncluded(edge)) {
              this.plugin.doLayout(edge)
              return
            }
          }.bind(this))


        // Find all edges, which have only to dockers
        // and is located horizontal/vertical.
        // Do layout with those edges
        this.edges
        // Find all edges with exactly two dockers
          .each(function (edge) {
            if (edge.dockers.length == 2) {
              var p1 = edge.dockers.first().getAbsoluteReferencePoint() || edge.dockers.first().bounds.center()
              var p2 = edge.dockers.last().getAbsoluteReferencePoint() || edge.dockers.first().bounds.center()
              // Find all horizontal/vertical edges
              if (Math.abs(-Math.abs(p1.x - p2.x) + Math.abs(this.offset.x)) < 2 || Math.abs(-Math.abs(p1.y - p2.y) + Math.abs(this.offset.y)) < 2) {
                this.plugin.doLayout(edge)
              }
            }
          }.bind(this))

        this.edges.each(function (edge, i) {
          this.changes[i].dockerPositions = edge.dockers.map(function (r) {
            return r.bounds.center()
          })
        }.bind(this))

      }
      /**
       * Align the bounds if the center is
       * the same than the old center
       * @params {Object} bounds
       * @params {Object} bounds2
       */
      align (bounds, refDocker) {
        let abRef = refDocker.getAbsoluteReferencePoint() || refDocker.bounds.center()
        let xdif = bounds.center().x - abRef.x
        let ydif = bounds.center().y - abRef.y
        if (Math.abs(-Math.abs(xdif) + Math.abs(this.offset.x)) < 3 && this.offset.xs === undefined) {
          bounds.moveBy({ x: -xdif, y: 0 })
        }
        if (Math.abs(-Math.abs(ydif) + Math.abs(this.offset.y)) < 3 && this.offset.ys === undefined) {
          bounds.moveBy({ y: -ydif, x: 0 })
        }

        if (this.offset.xs !== undefined || this.offset.ys !== undefined) {
          let absPXY = refDocker.getDockedShape().absoluteXY()
          xdif = bounds.center().x - (absPXY.x + ((abRef.x - absPXY.x) / this.offset.xs))
          ydif = bounds.center().y - (absPXY.y + ((abRef.y - absPXY.y) / this.offset.ys))

          if (Math.abs(-Math.abs(xdif) + Math.abs(this.offset.x)) < 3) {
            bounds.moveBy({ x: -(bounds.center().x - abRef.x), y: 0 })
          }

          if (Math.abs(-Math.abs(ydif) + Math.abs(this.offset.y)) < 3) {
            bounds.moveBy({ y: -(bounds.center().y - abRef.y), x: 0 })
          }
        }
      }
      /**
       * Returns a TRUE if there are bend point which overlay the shape
       */
      isBendPointIncluded (edge) {
        // Get absolute bounds
        let ab = edge.dockers.first().getDockedShape()
        let bb = edge.dockers.last().getDockedShape()

        if (ab) {
          ab = ab.absoluteBounds()
          ab.widen(5)
        }

        if (bb) {
          bb = bb.absoluteBounds()
          bb.widen(20) // Wide with 20 because of the arrow from the edge
        }

        return edge.dockers
          .any(function (docker, i) {
            let c = docker.bounds.center()
            // Dont count first and last
            return i != 0 && i != edge.dockers.length - 1 &&
              // Check if the point is included to the absolute bounds
              ((ab && ab.isIncluded(c)) || (bb && bb.isIncluded(c)))
          })
      }

      removeAllDocker(edge) {
        edge.dockers.slice(1, edge.dockers.length - 1).each(function (docker) {
          edge.removeDocker(docker)
        })
      }
      executeAgain () {
        this.changes.each(function (change) {
          // Reset the dockers
          this.removeAllDocker(change.edge)
          change.dockerPositions.each(function (pos, i) {
            if (i == 0 || i == change.dockerPositions.length - 1) {
              return
            }
            let docker = change.edge.createDocker(undefined, pos)
            docker.bounds.centerMoveTo(pos)
            docker.update()
          }.bind(this))
          change.edge._update(true)
        }.bind(this))
      }
      rollback () {
        this.changes.each(function (change) {
          // Reset the dockers
          this.removeAllDocker(change.edge)
          change.oldDockerPositions.each(function (pos, i) {
            if (i == 0 || i == change.oldDockerPositions.length - 1) {
              return
            }
            let docker = change.edge.createDocker(undefined, pos)
            docker.bounds.centerMoveTo(pos)
            docker.update()
          }.bind(this))
          change.edge._update(true)
        }.bind(this))
      }
    }

    this.facade.executeCommands([new Command(allEdges, node, offset, this)])
  }

}
