import AbstractShape from './AbstractShape'
import UIObject from './UIObject'
import ORYX_Canvas from './Canvas'
import ORYX_Controls from './Controls'

import ERDF from '../ERDF'
import ORYX_Utils from '../Utils'
import ORYX_Log from '../Log'
import ORYX_Config from '../CONFIG'

/**
 * @classDescription Base class for Shapes.
 * @extends ORYX.Core.AbstractShape
 */
export default class Shape extends AbstractShape {
  constructor (options, stencil, facade) {
    super(...arguments)
    this.facade = facade
    this.dockers = []
    this.magnets = []

    this._defaultMagnet

    this.incoming = []
    this.outgoing = []
    this.nodes = []
    this._dockerChangedCallback = this._dockerChanged.bind(this)

    // Hash map for all labels. Labels are not treated as children of shapes.
    this._labels = new Hash()

    // create SVG node
    this.node = ORYX_Utils.graft('http://www.w3.org/2000/svg',
      null,
      ['g', { id: 'svg-' + this.resourceId },
        ['g', { 'class': 'stencils' },
          ['g', { 'class': 'me' }],
          ['g', { 'class': 'children', style: 'overflow:hidden' }],
          ['g', { 'class': 'edge' }]
        ],
        ['g', { 'class': 'controls' },
          ['g', { 'class': 'dockers' }],
          ['g', { 'class': 'magnets' }]
        ]
      ])
  }

  /**
   * If changed flag is set, refresh method is called.
   */
  update () {
    //if(this.isChanged) {
    //this.layout();
    //}
  }

  /**
   * !!!Not called from any sub class!!!
   */
  _update () {

  }

  /**
   * Calls the super class refresh method
   *  and updates the svg elements that are referenced by a property.
   */
  refresh () {
    // call base class refresh method
    // arguments.callee.$.refresh.apply(this, arguments);
    super.refresh()

    if (this.node.ownerDocument) {
      // adjust SVG to properties' values
      const me = this
      this.propertiesChanged.each((function (propChanged) {
        if (propChanged.value) {
          let prop = this.properties.get(propChanged.key)
          let property = this.getStencil().property(propChanged.key)
          if (property != undefined) {
            this.propertiesChanged.set(propChanged.key, false)

            // console.log('property', propChanged.key)
            // console.log('property.type', property.type())
            // handle choice properties
            if (property.type() == ORYX_Config.TYPE_CHOICE) {
              //iterate all references to SVG elements
              property.refToView().each((function (ref) {
                //if property is referencing a label, update the label
                if (ref !== '') {
                  let label = this._labels.get(this.id + ref)
                  if (label && property.item(prop)) {
                    label.text(property.item(prop).title())
                  }
                }
              }).bind(this))

              //if the choice's items are referencing SVG elements
              // show the selected and hide all other referenced SVG
              // elements
              let refreshedSvgElements = new Hash()
              property.items().each((function (item) {
                item.refToView().each((function (itemRef) {
                  if (itemRef == '') {
                    return
                  }

                  let svgElem = this.node.ownerDocument.getElementById(this.id + itemRef)

                  if (!svgElem) {
                    return
                  }

                  /* Do not refresh the same svg element multiple times */
                  if (!refreshedSvgElements.get(svgElem.id) || prop == item.value()) {
                    svgElem.setAttributeNS(null, 'display', ((prop == item.value()) ? 'inherit' : 'none'))
                    refreshedSvgElements.set(svgElem.id, svgElem)
                  }

                  // Reload the href if there is an image-tag
                  if (ORYX_Utils.checkClassType(svgElem, SVGImageElement)) {
                    svgElem.setAttributeNS('http://www.w3.org/1999/xlink', 'href', svgElem.getAttributeNS('http://www.w3.org/1999/xlink', 'href'))
                  }
                }).bind(this))
              }).bind(this))

            } else {
              // handle properties that are not of type choice
              // iterate all references to SVG elements
              property.refToView().each((function (ref) {
                // console.log('ref==========', ref)
                //if the property does not reference an SVG element,
                // do nothing
                if (ref === '') {
                  return
                }

                let refId = this.id + ref

                // console.log(555, ref, refId, property.type())
                if (property.type() === ORYX_Config.TYPE_FLOWABLE_MULTIINSTANCE) {
                  // flowable-multiinstance

                  if (ref === 'multiinstance') {
                    let svgElemParallel = this.node.ownerDocument.getElementById(this.id + 'parallel')
                    if (svgElemParallel) {
                      if (prop === 'Parallel') {
                        svgElemParallel.setAttributeNS(null, 'display', 'inherit')
                      } else {
                        svgElemParallel.setAttributeNS(null, 'display', 'none')
                      }
                    }

                    let svgElemSequential = this.node.ownerDocument.getElementById(this.id + 'sequential')

                    if (svgElemSequential) {
                      if (prop === 'Sequential') {
                        svgElemSequential.setAttributeNS(null, 'display', 'inherit')
                      } else {
                        svgElemSequential.setAttributeNS(null, 'display', 'none')
                      }
                    }
                  }
                  return

                } else if (property.type() === 'cancelactivity') {
                  let svgElemFrame = this.node.ownerDocument.getElementById(this.id + 'frame')
                  let svgElemFrame2 = this.node.ownerDocument.getElementById(this.id + 'frame2')

                  if (prop === 'true') {
                    svgElemFrame.setAttributeNS(null, 'display', 'inherit')
                    svgElemFrame2.setAttributeNS(null, 'display', 'inherit')
                  } else {
                    svgElemFrame.setAttributeNS(null, 'display', 'none')
                    svgElemFrame2.setAttributeNS(null, 'display', 'none')
                  }
                } else if (property.type() === 'select') {
                  if (ref === 'important_sign') {
                    let svgElemParallel = this.node.ownerDocument.getElementById(this.id + 'important_sign')
                    if (svgElemParallel) {
                      if (prop === 'Parallel') {
                        svgElemParallel.setAttributeNS(null, 'display', 'inherit')
                        svgElemParallel.setAttributeNS(null, 'fill', 'red')
                      } else if (prop === 'Sequential') {
                        svgElemParallel.setAttributeNS(null, 'display', 'inherit')
                        svgElemParallel.setAttributeNS(null, 'fill', 'orange')
                      } else {
                        svgElemParallel.setAttributeNS(null, 'display', 'none')
                      }
                    }
                  }
                  return
                }

                //get the SVG element
                let svgElem = this.node.ownerDocument.getElementById(refId)

                //if the SVG element can not be found
                if (!svgElem || !(svgElem.ownerSVGElement)) {
                  //if the referenced SVG element is a SVGAElement, it cannot
                  // be found with getElementById (Firefox bug).
                  // this is a work around
                  if (property.type() === ORYX_Config.TYPE_URL ||
                    property.type() === ORYX_Config.TYPE_DIAGRAM_LINK) {
                    let svgElems = this.node.ownerDocument.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'a')

                    svgElem = $A(svgElems).find(function (elem) {
                      return elem.getAttributeNS(null, 'id') === refId
                    })

                    if (!svgElem) {
                      return
                    }
                  } else {
                    //this.propertiesChanged[propChanged.key] = true;
                    return
                  }
                }

                if (property.complexAttributeToView()) {
                  let label = this._labels.get(refId)

                  if (label) {
                    try {
                      let propJson = prop.evalJSON()
                      let value = propJson[property.complexAttributeToView()]
                      label.text(value ? value : prop)
                    } catch (e) {
                      label.text(prop)
                    }
                  }

                } else {
                  switch (property.type()) {
                    case ORYX_Config.TYPE_BOOLEAN: // boolean
                      if (typeof prop == 'string') {
                        prop = prop === 'true'
                      }

                      svgElem.setAttributeNS(null, 'display', (!(prop === property.inverseBoolean())) ? 'inherit' : 'none')

                      break
                    case ORYX_Config.TYPE_COLOR: // color
                      if (property.fill()) {
                        if (svgElem.tagName.toLowerCase() === 'stop') {
                          if (prop) {
                            if (property.lightness() && property.lightness() !== 1) {
                              prop = ORYX_Utils.adjustLightness(prop, property.lightness())
                            }

                            svgElem.setAttributeNS(null, 'stop-color', prop)

                            // Adjust stop color of the others
                            if (svgElem.parentNode.tagName.toLowerCase() === 'radialgradient') {
                              ORYX_Utils.adjustGradient(svgElem.parentNode, svgElem)
                            }
                          }

                          // If there is no value, set opaque
                          if (svgElem.parentNode.tagName.toLowerCase() === 'radialgradient') {
                            $A(svgElem.parentNode.getElementsByTagName('stop')).each(function (stop) {
                              stop.setAttributeNS(null, 'stop-opacity', prop ? stop.getAttributeNS(ORYX_Config.NAMESPACE_ORYX, 'default-stop-opacity') || 1 : 0)
                            }.bind(this))
                          }
                        } else {
                          svgElem.setAttributeNS(null, 'fill', prop)
                        }
                      }
                      if (property.stroke()) {
                        svgElem.setAttributeNS(null, 'stroke', prop)
                      }
                      break
                    case ORYX_Config.TYPE_STRING: // string
                    case ORYX_Config.TYPE_EXPRESSION:
                    case ORYX_Config.TYPE_DATASOURCE:
                    case ORYX_Config.TYPE_INTEGER:
                      let label = this._labels.get(refId)
                      if (label) {
                        label.text(prop)
                      }
                      break
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
                    case ORYX_Config.TYPE_FLOAT:
                      if (property.fillOpacity()) {
                        svgElem.setAttributeNS(null, 'fill-opacity', prop)
                      }
                      if (property.strokeOpacity()) {
                        svgElem.setAttributeNS(null, 'stroke-opacity', prop)
                      }
                      if (!property.fillOpacity() && !property.strokeOpacity()) {
                        let label = this._labels.get(refId)
                        if (label) {
                          label.text(prop)
                        }
                      }
                      break

                    case ORYX_Config.TYPE_SUB_PROCESS_LINK: // subprocess-link
                      if (ref == 'subprocesslink') {
                        let onclickAttr = svgElem.getAttributeNodeNS('', 'onclick')
                        let styleAttr = svgElem.getAttributeNodeNS('', 'style')

                        if (onclickAttr) {
                          if (prop && prop.id) {
                            if (styleAttr) {
                              styleAttr.textContent = 'cursor:pointer;'
                            }
                            onclickAttr.textContent = 'FLOWABLE.TOOLBAR.ACTIONS.navigateToProcess(' + prop.id + ');return false;'
                          } else {
                            if (styleAttr) {
                              styleAttr.textContent = 'cursor:default;'
                            }
                            onclickAttr.textContent = 'return false;'
                          }
                        }
                      }
                      break

                    case ORYX_Config.TYPE_URL:
                      break

                  }
                }
              }).bind(this))
            }
          }
        }
      }).bind(this))

      // update labels
      this._labels.values().each(function (label) {
        label.update()
      })
    }
  }

  layout () {
    let layoutEvents = this.getStencil().layout()
    if (layoutEvents) {
      layoutEvents.each(function (event) {
        // setup additional attributes
        event.shape = this
        event.forceExecution = true

        // do layouting
        this._delegateEvent(event)
      }.bind(this))
    }
  }

  /**
   * Returns an array of Label objects.
   */
  getLabels () {
    return this._labels.values()
  }

  /**
   * Returns the label for a given ref
   * @return {ORYX.Core.Label} Returns null if there is no label
   */
  getLabel (ref) {
    if (!ref) {
      return null
    }
    return (this._labels.find(function (o) {
      return o.key.endsWith(ref)
    }) || {}).value || null
  }

  /**
   * Hides all related labels
   *
   */
  hideLabels () {
    this.getLabels().invoke('hide')
  }

  /**
   * Shows all related labels
   *
   */
  showLabels () {
    let labels = this.getLabels()
    labels.invoke('show')
    labels.each(function (label) {
      label.update()
    })
  }

  setOpacity (value, animate) {
    value = Math.max(Math.min((typeof value == 'number' ? value : 1.0), 1.0), 0.0)

    if (value !== 1.0) {
      value = String(value)
      this.node.setAttributeNS(null, 'fill-opacity', value)
      this.node.setAttributeNS(null, 'stroke-opacity', value)
    } else {
      this.node.removeAttributeNS(null, 'fill-opacity')
      this.node.removeAttributeNS(null, 'stroke-opacity')
    }
  }

  /**
   * Returns an array of dockers of this object.
   */
  getDockers () {
    return this.dockers
  }

  getMagnets () {
    return this.magnets
  }

  getDefaultMagnet () {
    if (this._defaultMagnet) {
      return this._defaultMagnet
    } else if (this.magnets.length > 0) {
      return this.magnets[0]
    } else {
      return undefined
    }
  }

  getParentShape () {
    return this.parent
  }

  getIncomingShapes (iterator) {
    if (iterator) {
      this.incoming.each(iterator)
    }
    return this.incoming
  }

  getIncomingNodes (iterator) {
    return this.incoming.select(function (incoming) {
      let isNode = incoming.getInstanceofType().includes('Node')
      if (isNode && iterator) iterator(incoming)
      return isNode
    })
  }

  getOutgoingShapes (iterator) {
    if (iterator) {
      this.outgoing.each(iterator)
    }
    return this.outgoing
  }

  getOutgoingNodes (iterator) {
    return this.outgoing.select(function (out) {
      let isNode = out.getInstanceofType().includes('Node')
      if (isNode && iterator) iterator(out)
      return isNode
    })
  }

  getAllDockedShapes (iterator) {
    let result = this.incoming.concat(this.outgoing)
    if (iterator) {
      result.each(iterator)
    }
    return result
  }

  getCanvas () {
    if (this.parent instanceof ORYX_Canvas) {
      return this.parent
    } else if (this.parent instanceof Shape) {
      return this.parent.getCanvas()
    } else {
      return undefined
    }
  }

  /**
   *
   * @param {Object} deep
   * @param {Object} iterator
   */
  getChildNodes (deep, iterator) {
    if (!deep && !iterator) {
      return this.nodes.clone()
    } else {
      let result = []
      this.nodes.each(function (uiObject) {
        if (!uiObject.isVisible) {
          return
        }
        if (iterator) {
          iterator(uiObject)
        }
        result.push(uiObject)

        if (deep && uiObject instanceof Shape) {
          result = result.concat(uiObject.getChildNodes(deep, iterator))
        }
      })

      return result
    }
  }

  /**
   * Overrides the UIObject.add method. Adds uiObject to the correct sub node.
   * @param {UIObject} uiObject
   * @param {Number} index
   */
  add (uiObject, index, silent) {
    // parameter has to be an UIObject, but
    // must not be an Edge.
    if (uiObject instanceof UIObject && !(uiObject.getInstanceofType().includes('Edge'))) {

      if (!(this.children.member(uiObject))) {
        //if uiObject is child of another parent, remove it from that parent.
        if (uiObject.parent) {
          uiObject.parent.remove(uiObject, true)
        }

        // add uiObject to this Shape
        if (index != undefined) {
          this.children.splice(index, 0, uiObject)
        } else {
          this.children.push(uiObject)
        }

        //set parent reference
        uiObject.parent = this

        // add uiObject.node to this.node depending on the type of uiObject
        let parent
        let type = uiObject.getInstanceofType()
        if (type.includes('Node')) {
          parent = this.node.childNodes[0].childNodes[1]
          this.nodes.push(uiObject)
        } else if (uiObject instanceof ORYX_Controls.Control) {
          let ctrls = this.node.childNodes[1]
          if (uiObject instanceof ORYX_Controls.Docker) {
            parent = ctrls.childNodes[0]
            if (this.dockers.length >= 2) {
              this.dockers.splice(index !== undefined ? Math.min(index, this.dockers.length - 1) :
                this.dockers.length - 1, 0, uiObject)
            } else {
              this.dockers.push(uiObject)
            }
          } else if (uiObject instanceof ORYX_Controls.Magnet) {
            parent = ctrls.childNodes[1]
            this.magnets.push(uiObject)
          } else {
            parent = ctrls
          }
        } else {	// UIObject
          parent = this.node
        }

        if (index != undefined && index < parent.childNodes.length)
          uiObject.node = parent.insertBefore(uiObject.node, parent.childNodes[index])
        else
          uiObject.node = parent.appendChild(uiObject.node)

        this._changed()
        //uiObject.bounds.registerCallback(this._changedCallback);


        if (this.eventHandlerCallback && silent !== true)
          this.eventHandlerCallback({ type: ORYX_Config.EVENT_SHAPEADDED, shape: uiObject })

      } else {
        ORYX_Log.warn('add: ORYX.Core.UIObject is already a child of this object.')
      }
    } else {
      ORYX_Log.warn('add: Parameter is not of type ORYX.Core.UIObject.')
    }
  }

  /**
   * Overrides the UIObject.remove method. Removes uiObject.
   * @param {UIObject} uiObject
   */
  remove (uiObject, silent) {
    //if uiObject is a child of this object, remove it.
    if (this.children.member(uiObject)) {
      //remove uiObject from children
      let parent = uiObject.parent

      this.children = this.children.without(uiObject)

      //delete parent reference of uiObject
      uiObject.parent = undefined

      //delete uiObject.node from this.node
      if (uiObject instanceof Shape) {
        let type = uiObject.getInstanceofType()
        if (type.includes('Edge')) {
          uiObject.removeMarkers()
          uiObject.node = this.node.childNodes[0].childNodes[2].removeChild(uiObject.node)
        } else {
          uiObject.node = this.node.childNodes[0].childNodes[1].removeChild(uiObject.node)
          this.nodes = this.nodes.without(uiObject)
        }
      } else if (uiObject instanceof ORYX_Controls.Control) {
        if (uiObject instanceof ORYX_Controls.Docker) {
          uiObject.node = this.node.childNodes[1].childNodes[0].removeChild(uiObject.node)
          this.dockers = this.dockers.without(uiObject)
        } else if (uiObject instanceof ORYX_Controls.Magnet) {
          uiObject.node = this.node.childNodes[1].childNodes[1].removeChild(uiObject.node)
          this.magnets = this.magnets.without(uiObject)
        } else {
          uiObject.node = this.node.childNodes[1].removeChild(uiObject.node)
        }
      }

      if (this.eventHandlerCallback && silent !== true)
        this.eventHandlerCallback({ type: ORYX_Config.EVENT_SHAPEREMOVED, shape: uiObject, parent: parent })

      this._changed()
      //uiObject.bounds.unregisterCallback(this._changedCallback);
    } else {
      ORYX_Log.warn('remove: ORYX.Core.UIObject is not a child of this object.')
    }
  }

  /**
   * Calculate the Border Intersection Point between two points
   * @param {PointA}
   * @param {PointB}
   */
  getIntersectionPoint () {
    let pointAX, pointAY, pointBX, pointBY

    // Get the the two Points
    switch (arguments.length) {
      case 2:
        pointAX = arguments[0].x
        pointAY = arguments[0].y
        pointBX = arguments[1].x
        pointBY = arguments[1].y
        break
      case 4:
        pointAX = arguments[0]
        pointAY = arguments[1]
        pointBX = arguments[2]
        pointBY = arguments[3]
        break
      default:
        throw 'getIntersectionPoints needs two or four arguments'
    }

    // Defined an include and exclude point
    let includePointX, includePointY, excludePointX, excludePointY
    let bounds = this.absoluteBounds()

    if (this.isPointIncluded(pointAX, pointAY, bounds)) {
      includePointX = pointAX
      includePointY = pointAY
    } else {
      excludePointX = pointAX
      excludePointY = pointAY
    }

    if (this.isPointIncluded(pointBX, pointBY, bounds)) {
      includePointX = pointBX
      includePointY = pointBY
    } else {
      excludePointX = pointBX
      excludePointY = pointBY
    }

    // If there is no inclue or exclude Shape, than return
    if (!includePointX || !includePointY || !excludePointX || !excludePointY) {
      return undefined
    }

    let midPointX = 0
    let midPointY = 0
    let refPointX, refPointY
    // Get the UpperLeft and LowerRight
    //var ul = bounds.upperLeft();
    //var lr = bounds.lowerRight();


    while (true) {
      // Calculate the midpoint of the current to points
      let midPointX = Math.min(includePointX, excludePointX) +
        ((Math.max(includePointX, excludePointX) - Math.min(includePointX, excludePointX)) / 2.0)
      let midPointY = Math.min(includePointY, excludePointY) +
        ((Math.max(includePointY, excludePointY) - Math.min(includePointY, excludePointY)) / 2.0)

      // Set the new midpoint by the means of the include of the bounds
      if (this.isPointIncluded(midPointX, midPointY, bounds)) {
        includePointX = midPointX
        includePointY = midPointY
      } else {
        excludePointX = midPointX
        excludePointY = midPointY
      }

      // Calc the length of the line
      let length = Math.sqrt(Math.pow(includePointX - excludePointX, 2) + Math.pow(includePointY - excludePointY, 2))
      // Calc a point one step from the include point
      refPointX = includePointX + ((excludePointX - includePointX) / length)
      refPointY = includePointY + ((excludePointY - includePointY) / length)

      // If the reference point not in the bounds, break
      if (!this.isPointIncluded(refPointX, refPointY, bounds)) {
        break
      }

    }

    // Return the last includepoint
    return { x: refPointX, y: refPointY }
  }

  /**
   * Calculate if the point is inside the Shape
   * @param {PointX}
   * @param {PointY}
   */
  isPointIncluded () {
    return false
  }

  /**
   * Returns TRUE if the given node
   * is a child node of the shapes node
   * @param {Element} node
   * @return {Boolean}
   *
   */
  containsNode (node) {
    let me = this.node.firstChild.firstChild
    while (node) {
      if (node == me) {
        return true
      }
      node = node.parentNode
    }
    return false
  }

  /**
   * Calculate if the point is over an special offset area
   * @param {Point}
   */
  isPointOverOffset () {
    return this.isPointIncluded.apply(this, arguments)
  }

  _dockerChanged () {

  }

  /**
   * Create a Docker for this Edge
   *
   */
  createDocker (index, position) {
    let docker = new ORYX_Controls.Docker({ eventHandlerCallback: this.eventHandlerCallback })
    docker.bounds.registerCallback(this._dockerChangedCallback)
    if (position) {
      docker.bounds.centerMoveTo(position)
    }
    this.add(docker, index)

    return docker
  }

  /**
   * Get the serialized object
   * return Array with hash-entrees (prefix, name, value)
   * Following values will given:
   *    Bounds
   *    Outgoing Shapes
   *    Parent
   */
  serialize () {
    // var serializedObject = arguments.callee.$.serialize.apply(this);
    let serializedObject = super.serialize()

    // Add the bounds
    serializedObject.push({ name: 'bounds', prefix: 'oryx', value: this.bounds.serializeForERDF(), type: 'literal' })

    // Add the outgoing shapes
    this.getOutgoingShapes().each((function (followingShape) {
      serializedObject.push({
        name: 'outgoing',
        prefix: 'raziel',
        value: '#' + ERDF.__stripHashes(followingShape.resourceId),
        type: 'resource'
      })
    }).bind(this))

    // Add the parent shape, if the parent not the canvas
    //if(this.parent instanceof ORYX.Core.Shape){
    serializedObject.push({
      name: 'parent',
      prefix: 'raziel',
      value: '#' + ERDF.__stripHashes(this.parent.resourceId),
      type: 'resource'
    })
    //}

    return serializedObject
  }

  deserialize (serialize, json) {
    // arguments.callee.$.deserialize.apply(this, arguments);
    super.deserialize(serialize, json)
    // Set the Bounds
    let bounds = serialize.find(function (ser) {
      return 'oryx-bounds' === (ser.prefix + '-' + ser.name)
    })
    if (bounds) {
      let b = bounds.value.replace(/,/g, ' ').split(' ').without('')
      let type = this.getInstanceofType()
      if (type.includes('Edge')) {
        if (!this.dockers.first().isChanged)
          this.dockers.first().bounds.centerMoveTo(parseFloat(b[0]), parseFloat(b[1]))
        if (!this.dockers.last().isChanged)
          this.dockers.last().bounds.centerMoveTo(parseFloat(b[2]), parseFloat(b[3]))
      } else {
        this.bounds.set(parseFloat(b[0]), parseFloat(b[1]), parseFloat(b[2]), parseFloat(b[3]))
      }
    }

    if (json && json.labels instanceof Array) {
      json.labels.each(function (slabel) {
        let label = this.getLabel(slabel.ref)
        if (label) {
          label.deserialize(slabel, this)
        }
      }.bind(this))
    }
  }

  toJSON () {
    // var json = arguments.callee.$.toJSON.apply(this, arguments);
    let json = super.toJSON()

    let labels = [], id = this.id
    this._labels.each(function (obj) {
      let slabel = obj.value.serialize()
      if (slabel) {
        slabel.ref = obj.key.replace(id, '')
        labels.push(slabel)
      }
    })

    if (labels.length > 0) {
      json.labels = labels
    }
    return json
  }

  /**
   * Private methods.
   */

  /**
   * Child classes have to overwrite this method for initializing a loaded
   * SVG representation.
   * @param {SVGDocument} svgDocument
   */
  _init (svgDocument) {
    // adjust ids
    this._adjustIds(svgDocument, 0)
  }

  _adjustIds(element, idIndex) {
    if (element instanceof Element) {
      let eid = element.getAttributeNS(null, 'id')
      if (eid && eid !== '') {
        element.setAttributeNS(null, 'id', this.id + eid)
      } else {
        element.setAttributeNS(null, 'id', this.id + '_' + this.id + '_' + idIndex)
        idIndex++
      }

      // Replace URL in fill attribute
      let fill = element.getAttributeNS(null, 'fill')
      if (fill && fill.include('url(#')) {
        fill = fill.replace(/url\(#/g, 'url(#' + this.id)
        element.setAttributeNS(null, 'fill', fill)
      }

      if (element.hasChildNodes()) {
        for (let i = 0; i < element.childNodes.length; i++) {
          idIndex = this._adjustIds(element.childNodes[i], idIndex)
        }
      }
    }
    return idIndex
  }

  toString() {
    return 'ORYX.Core.Shape ' + this.getId()
  }
  getInstanceofType () {
    return 'Shape'
  }
}

