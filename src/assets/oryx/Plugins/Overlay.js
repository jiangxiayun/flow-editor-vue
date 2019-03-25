import ORYX_Config from '../CONFIG'
import ORYX_Edge from '../core/Edge'
import ORYX_Node from '../core/Node'
import ORYX_Shape from '../core/Shape'

export default class Overlay {
  constructor (facade) {
    this.facade = facade
    this.changes = []
    this.facade.registerOnEvent(ORYX_Config.EVENT_OVERLAY_SHOW, this.show.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_OVERLAY_HIDE, this.hide.bind(this))

    this.styleNode = document.createElement('style')
    this.styleNode.setAttributeNS(null, 'type', 'text/css')

    document.getElementsByTagName('head')[0].appendChild(this.styleNode)
  }

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
  show (options) {
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
        if (!el instanceof ORYX_Shape) {
          return
        }

        this.setAttributes(el.node, options.attributes)

      }.bind(this))

    }

    var isSVG = true
    try {
      isSVG = options.node && options.node instanceof SVGElement
    } catch (e) {
    }

    // Checks if node is setted and if this is an SVGElement
    if (options.node && isSVG) {

      options['_temps'] = []

      // FOR EACH - Node
      options.shapes.each(function (el, index) {

        // Checks if the node is a Shape
        if (!el instanceof ORYX_Shape) {
          return
        }

        var _temp = {}
        _temp.svg = options.dontCloneNode ? options.node : options.node.cloneNode(true)

        // Add the svg node to the ORYX-Shape
        el.node.firstChild.appendChild(_temp.svg)

        // If
        if (el instanceof ORYX_Edge && !options.nodePosition) {
          options['nodePosition'] = 'START'
        }

        // If the node position is setted, it has to be transformed
        if (options.nodePosition) {

          var b = el.bounds
          var p = options.nodePosition.toUpperCase()

          // Check the values of START and END
          if (el instanceof ORYX_Node && p == 'START') {
            p = 'NW'
          } else if (el instanceof ORYX_Node && p == 'END') {
            p = 'SE'
          } else if (el instanceof ORYX_Edge && p == 'START') {
            b = el.getDockers().first().bounds
          } else if (el instanceof ORYX_Edge && p == 'END') {
            b = el.getDockers().last().bounds
          }

          // Create a callback for the changing the position
          // depending on the position string
          _temp.callback = function () {

            var x = 0
            var y = 0

            if (p == 'NW') {
              // Do Nothing
            } else if (p == 'N') {
              x = b.width() / 2
            } else if (p == 'NE') {
              x = b.width()
            } else if (p == 'E') {
              x = b.width()
              y = b.height() / 2
            } else if (p == 'SE') {
              x = b.width()
              y = b.height()
            } else if (p == 'S') {
              x = b.width() / 2
              y = b.height()
            } else if (p == 'SW') {
              y = b.height()
            } else if (p == 'W') {
              y = b.height() / 2
            } else if (p == 'START' || p == 'END') {
              x = b.width() / 2
              y = b.height() / 2
            } else {
              return
            }

            if (el instanceof ORYX_Edge) {
              x += b.upperLeft().x
              y += b.upperLeft().y
            }

            _temp.svg.setAttributeNS(null, 'transform', 'translate(' + x + ', ' + y + ')')

          }.bind(this)

          _temp.element = el
          _temp.callback()

          b.registerCallback(_temp.callback)

        }


        options._temps.push(_temp)

      }.bind(this))


    }


    // Store the changes
    if (!this.changes[options.id]) {
      this.changes[options.id] = []
    }

    this.changes[options.id].push(options)

  }

  /**
   * Hide the overlay with the spefic id
   * @param {Object} options
   */
  hide (options) {
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
        if (!el instanceof ORYX_Shape) {
          return
        }

        this.deleteAttributes(el.node)

      }.bind(this))


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


    }.bind(this))


    this.changes[options.id] = null


  }

  /**
   * Set the given css attributes to that node
   * @param {HTMLElement} node
   * @param {Object} attributes
   */
  setAttributes (node, attributes) {
    // Get all the childs from ME
    let childs = this.getAllChilds(node.firstChild.firstChild)
    let ids = []

    // Add all Attributes which have relation to another node in this document and concate the pure id out of it
    // This is for example important for the markers of a edge
    childs.each(function (e) {
      ids.push($A(e.attributes).findAll(function (attr) {
        return attr.nodeValue.startsWith('url(#')
      }))
    })
    ids = ids.flatten().compact()
    ids = ids.collect(function (s) {
      return s.nodeValue
    }).uniq()
    ids = ids.collect(function (s) {
      return s.slice(5, s.length - 1)
    })

    // Add the node ID to the id
    ids.unshift(node.id + ' .me')

    let attr = $H(attributes)
    let attrValue = attr.toJSON().gsub(',', ';').gsub('"', '')
    let attrMarkerValue = attributes.stroke ? attrValue.slice(0, attrValue.length - 1) + '; fill:' + attributes.stroke + ';}' : attrValue
    let attrTextValue
    if (attributes.fill) {
      let copyAttr = Object.clone(attributes)
      copyAttr.fill = 'black'
      attrTextValue = $H(copyAttr).toJSON().gsub(',', ';').gsub('"', '')
    }

    // Create the CSS-Tags Style out of the ids and the attributes
    let csstags = ids.collect(function (s, i) {
      return '#' + s + ' * ' + (!i ? attrValue : attrMarkerValue) + '' + (attrTextValue ? ' #' + s + ' text * ' + attrTextValue : '')
    })

    // Join all the tags
    let s = csstags.join(' ') + '\n'

    // And add to the end of the style tag
    this.styleNode.appendChild(document.createTextNode(s))
  }

  /**
   * Deletes all attributes which are
   * added in a special style sheet for that node
   * @param {HTMLElement} node
   */
  deleteAttributes (node) {
    // Get all children which contains the node id
    let delEl = $A(this.styleNode.childNodes)
      .findAll(function (e) {
        return e.textContent.include('#' + node.id)
      })

    // Remove all of them
    delEl.each(function (el) {
      el.parentNode.removeChild(el)
    })
  }

  getAllChilds (node) {
    let childs = $A(node.childNodes)

    $A(node.childNodes).each(function (e) {
      childs.push(this.getAllChilds(e))
    }.bind(this))

    return childs.flatten()
  }

}