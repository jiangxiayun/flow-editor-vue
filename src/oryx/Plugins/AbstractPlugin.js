import layoutEdgesCommand from '../../flowable/Command/layoutEdgesCommand'
import ORYX_Config from '../CONFIG'
import ORYX_Log from '../Log'
import ORYX_Editor from '../Editor'
import { DataManager } from '../Kickstart'

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
  onLoaded () {}

  /**
   Overwrite to handle selection changed event. TODO: Document params!!!
   @methodOf ORYX.Plugins.AbstractPlugin.prototype
   */
  onSelectionChanged () {}

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
   * 从DOM中提取RDF。
   * @methodOf ORYX.Plugins.AbstractPlugin.prototype
   * @type {String} Extracted RFD. Null if there are transformation errors.
   */
  getRDFFromDOM () {
    // convert to RDF
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
    this.facade.executeCommands([new layoutEdgesCommand(allEdges, node, offset, this)])
  }
}
