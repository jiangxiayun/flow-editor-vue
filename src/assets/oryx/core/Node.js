import Shape from './Shape'
import ORYX_Bounds from './Bounds'
import ORYX_SVG from './SVG'
import ORYX_Edge from './Edge'
import ORYX_Controls from './Controls'
import ORYX_Config from '../CONFIG'
import ORYX_Log from '../Log'

/**
 * @classDescription Abstract base class for all Nodes.
 * @extends ORYX.Core.Shape
 */
export default class Node extends Shape {
  /**
   * Constructor
   * @param options {Object} A container for arguments.
   * @param stencil {Stencil}
   */
  constructor (options, stencil, facade) {
    // arguments.callee.$.construct.apply(this, arguments);
    super(...arguments)
    this.isSelectable = true
    this.isMovable = true
    this._dockerUpdated = false
    this.facade = facade

    this._oldBounds = new ORYX_Bounds() // init bounds with undefined values
    this._svgShapes = [] // array of all SVGShape objects of
    // SVG representation

    //TODO vielleicht in shape verschieben?
    this.minimumSize = undefined // {width:..., height:...}
    this.maximumSize = undefined

    //TODO vielleicht in shape oder uiobject verschieben?
    // vielleicht sogar isResizable ersetzen?
    this.isHorizontallyResizable = false
    this.isVerticallyResizable = false

    this.dataId = undefined
    this._init(this._stencil.view())
    this.forcedHeight = -1
  }

  /**
   * This method checks whether the shape is resized correctly and calls the
   * super class update method.
   */
  _update () {
    this.dockers.invoke('update')
    if (this.isChanged) {
      let bounds = this.bounds
      let oldBounds = this._oldBounds

      if (this.isResized) {
        let widthDelta = bounds.width() / oldBounds.width()
        let heightDelta = bounds.height() / oldBounds.height()

        // iterate over all relevant svg elements and resize them
        this._svgShapes.each(function (svgShape) {
          //adjust width
          if (svgShape.isHorizontallyResizable) {
            svgShape.width = svgShape.oldWidth * widthDelta
          }
          //adjust height
          if (svgShape.isVerticallyResizable) {
            svgShape.height = svgShape.oldHeight * heightDelta
          }

          //check, if anchors are set
          let anchorOffset
          let leftIncluded = svgShape.anchorLeft
          let rightIncluded = svgShape.anchorRight

          if (rightIncluded) {
            anchorOffset = oldBounds.width() - (svgShape.oldX + svgShape.oldWidth)
            if (leftIncluded) {
              svgShape.width = bounds.width() - svgShape.x - anchorOffset
            } else {
              svgShape.x = bounds.width() - (anchorOffset + svgShape.width)
            }
          } else if (!leftIncluded) {
            svgShape.x = widthDelta * svgShape.oldX
            if (!svgShape.isHorizontallyResizable) {
              svgShape.x = svgShape.x + svgShape.width * widthDelta / 2 - svgShape.width / 2
            }
          }

          let topIncluded = svgShape.anchorTop
          let bottomIncluded = svgShape.anchorBottom

          if (bottomIncluded) {
            anchorOffset = oldBounds.height() - (svgShape.oldY + svgShape.oldHeight)
            if (topIncluded) {
              svgShape.height = bounds.height() - svgShape.y - anchorOffset
            } else {
              // Hack for choreography task layouting
              if (!svgShape._isYLocked) {
                svgShape.y = bounds.height() - (anchorOffset + svgShape.height)
              }
            }
          } else if (!topIncluded) {
            svgShape.y = heightDelta * svgShape.oldY
            if (!svgShape.isVerticallyResizable) {
              svgShape.y = svgShape.y + svgShape.height * heightDelta / 2 - svgShape.height / 2
            }
          }
        })

        //check, if the current bounds is unallowed horizontally or vertically resized
        let p = {
          x: 0,
          y: 0
        }
        if (!this.isHorizontallyResizable && bounds.width() !== oldBounds.width()) {
          p.x = oldBounds.width() - bounds.width()
        }
        if (!this.isVerticallyResizable && bounds.height() !== oldBounds.height()) {
          p.y = oldBounds.height() - bounds.height()
        }
        if (p.x !== 0 || p.y !== 0) {
          bounds.extend(p)
        }

        //check, if the current bounds are between maximum and minimum bounds
        p = {
          x: 0,
          y: 0
        }
        let widthDifference, heightDifference
        if (this.minimumSize) {
          ORYX_Log.debug('Shape (%0)\'s min size: (%1x%2)', this, this.minimumSize.width, this.minimumSize.height)
          widthDifference = this.minimumSize.width - bounds.width()
          if (widthDifference > 0) {
            p.x += widthDifference
          }
          heightDifference = this.minimumSize.height - bounds.height()
          if (heightDifference > 0) {
            p.y += heightDifference
          }
        }
        if (this.maximumSize) {
          ORYX_Log.debug('Shape (%0)\'s max size: (%1x%2)', this, this.maximumSize.width, this.maximumSize.height)
          widthDifference = bounds.width() - this.maximumSize.width
          if (widthDifference > 0) {
            p.x -= widthDifference
          }
          heightDifference = bounds.height() - this.maximumSize.height
          if (heightDifference > 0) {
            p.y -= heightDifference
          }
        }
        if (p.x !== 0 || p.y !== 0) {
          bounds.extend(p)
        }

        let leftIncluded, rightIncluded, topIncluded, bottomIncluded, center, newX, newY

        this.magnets.each(function (magnet) {
          leftIncluded = magnet.anchorLeft
          rightIncluded = magnet.anchorRight
          topIncluded = magnet.anchorTop
          bottomIncluded = magnet.anchorBottom

          center = magnet.bounds.center()

          if (leftIncluded) {
            newX = center.x
          } else if (rightIncluded) {
            newX = bounds.width() - (oldBounds.width() - center.x)
          } else {
            newX = center.x * widthDelta
          }

          if (topIncluded) {
            newY = center.y
          } else if (bottomIncluded) {
            newY = bounds.height() - (oldBounds.height() - center.y)
          } else {
            newY = center.y * heightDelta
          }

          if (center.x !== newX || center.y !== newY) {
            magnet.bounds.centerMoveTo(newX, newY)
          }
        })

        //set new position of labels
        this.getLabels().each(function (label) {
          // Set the position dependings on it anchor
          if (!label.isAnchorLeft()) {
            if (label.isAnchorRight()) {
              label.setX(bounds.width() - (oldBounds.width() - label.oldX))
            } else {
              label.setX((label.position ? label.position.x : label.x) * widthDelta)
            }
          }
          if (!label.isAnchorTop()) {
            if (label.isAnchorBottom()) {
              label.setY(bounds.height() - (oldBounds.height() - label.oldY))
            } else {
              label.setY((label.position ? label.position.y : label.y) * heightDelta)
            }
          }

          // If there is an position,
          // set the origin position as well
          if (label.position) {
            if (!label.isOriginAnchorLeft()) {
              if (label.isOriginAnchorRight()) {
                label.setOriginX(bounds.width() - (oldBounds.width() - label.oldX))
              } else {
                label.setOriginX(label.x * widthDelta)
              }
            }
            if (!label.isOriginAnchorTop()) {
              if (label.isOriginAnchorBottom()) {
                label.setOriginY(bounds.height() - (oldBounds.height() - label.oldY))
              } else {
                label.setOriginY(label.y * heightDelta)
              }
            }
          }
        })

        //update docker
        let docker = this.dockers[0]
        if (docker) {
          docker.bounds.unregisterCallback(this._dockerChangedCallback)
          if (!this._dockerUpdated) {
            docker.bounds.centerMoveTo(this.bounds.center())
            this._dockerUpdated = false
          }

          docker.update()
          docker.bounds.registerCallback(this._dockerChangedCallback)
        }
        this.isResized = false
      }

      this.refresh()

      this.isChanged = false

      this._oldBounds = this.bounds.clone()
    }

    this.children.each(function (value) {
      if (!(value instanceof ORYX_Controls.Docker)) {
        value._update()
      }
    })

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
  }

  /**
   * This method repositions and resizes the SVG representation
   * of the shape.
   */
  refresh () {
    // arguments.callee.$.refresh.apply(this, arguments)
    super.refresh()

    /** Movement */
    let x = this.bounds.upperLeft().x
    let y = this.bounds.upperLeft().y

    // Move owner element
    this.node.firstChild.setAttributeNS(null, 'transform', 'translate(' + x + ', ' + y + ')')
    // Move magnets
    this.node.childNodes[1].childNodes[1].setAttributeNS(null, 'transform', 'translate(' + x + ', ' + y + ')')

    /** Resize */

    //iterate over all relevant svg elements and update them
    this._svgShapes.each(function (svgShape) {
      svgShape.update()
    })
  }

  _dockerChanged () {
    let docker = this.dockers[0]

    //set the bounds of the the association
    this.bounds.centerMoveTo(docker.bounds.center())

    this._dockerUpdated = true
    //this._update(true);
  }

  /**
   * This method traverses a tree of SVGElements and returns
   * all SVGShape objects. For each basic shape or path element
   * a SVGShape object is initialized.
   *
   * @param svgNode {SVGElement}
   * @return {Array} Array of SVGShape objects
   */
  _initSVGShapes (svgNode) {
    let svgShapes = []
    try {
      let svgShape = new ORYX_SVG.SVGShape(svgNode)
      svgShapes.push(svgShape)
    }
    catch (e) {

    }

    if (svgNode.hasChildNodes()) {
      for (let i = 0; i < svgNode.childNodes.length; i++) {
        svgShapes = svgShapes.concat(this._initSVGShapes(svgNode.childNodes[i]))
      }
    }

    return svgShapes
  }

  /**
   * Calculate if the point is inside the Shape
   * @param {PointX}
   * @param {PointY}
   * @param {absoluteBounds} optional: for performance
   */
  isPointIncluded (pointX, pointY, absoluteBounds) {
    // If there is an arguments with the absoluteBounds
    let absBounds = absoluteBounds && absoluteBounds instanceof ORYX_Bounds ?
      absoluteBounds : this.absoluteBounds()

    if (!absBounds.isIncluded(pointX, pointY)) {
      return false
    }
    // point = Object.clone(point);
    let ul = absBounds.upperLeft()
    let x = pointX - ul.x
    let y = pointY - ul.y

    let i = 0
    let isPointIncluded = false
    do {
      isPointIncluded = this._svgShapes[i++].isPointIncluded(x, y)
    } while (!isPointIncluded && i < this._svgShapes.length)

    return isPointIncluded

    /*return this._svgShapes.any(function(svgShape){
     return svgShape.isPointIncluded(point);
     });*/
  }

  /**
   * Calculate if the point is over an special offset area
   * @param {Point}
   */
  isPointOverOffset (pointX, pointY) {
    // var isOverEl = arguments.callee.$.isPointOverOffset.apply(this, arguments)
    let isOverEl = super.isPointOverOffset.apply(pointX, pointY)

    if (isOverEl) {
      // If there is an arguments with the absoluteBounds
      let absBounds = this.absoluteBounds()
      absBounds.widen(ORYX_Config.BORDER_OFFSET)

      if (!absBounds.isIncluded(pointX, pointY)) {
        return true
      }
    }

    return false

  }

  serialize () {
    // var result = arguments.callee.$.serialize.apply(this)
    let result = super.serialize()

    // Add the docker's bounds
    // nodes only have at most one docker!
    this.dockers.each((function (docker) {
      if (docker.getDockedShape()) {
        let center = docker.referencePoint
        center = center ? center : docker.bounds.center()
        result.push({
          name: 'docker',
          prefix: 'oryx',
          value: $H(center).values().join(','),
          type: 'literal'
        })
      }
    }).bind(this))

    // Get the spezific serialized object from the stencil
    try {
      //result = this.getStencil().serialize(this, result);

      let serializeEvent = this.getStencil().serialize()

      /*
       * call serialize callback by reference, result should be found
       * in serializeEvent.result
       */
      if (serializeEvent.type) {
        serializeEvent.shape = this
        serializeEvent.data = result
        serializeEvent.result = undefined
        serializeEvent.forceExecution = true

        this._delegateEvent(serializeEvent)

        if (serializeEvent.result) {
          result = serializeEvent.result
        }
      }
    }
    catch (e) {
    }
    return result
  }

  deserialize (data) {
    // arguments.callee.$.deserialize.apply(this, arguments)
    super.deserialize(data)
    try {
      let deserializeEvent = this.getStencil().deserialize()
      /*
       * call serialize callback by reference, result should be found
       * in serializeEventInfo.result
       */
      if (deserializeEvent.type) {
        deserializeEvent.shape = this
        deserializeEvent.data = data
        deserializeEvent.result = undefined
        deserializeEvent.forceExecution = true

        this._delegateEvent(deserializeEvent)
        if (deserializeEvent.result) {
          data = deserializeEvent.result
        }
      }
    }
    catch (e) {
    }

    // Set the outgoing shapes
    let outgoing = data.findAll(function (ser) {
      return (ser.prefix + '-' + ser.name) == 'raziel-outgoing'
    })
    outgoing.each((function (obj) {
      // TODO: Look at Canvas
      if (!this.parent) {
        return
      }

      // Set outgoing Shape
      let next = this.getCanvas().getChildShapeByResourceId(obj.value)

      if (next) {
        if (next instanceof ORYX_Edge) {
          //Set the first docker of the next shape
          next.dockers.first().setDockedShape(this)
          next.dockers.first().setReferencePoint(next.dockers.first().bounds.center())
        } else if (next.dockers.length > 0) { //next is a node and next has a docker
          next.dockers.first().setDockedShape(this)
          //next.dockers.first().setReferencePoint({x: this.bounds.width() / 2.0, y: this.bounds.height() / 2.0});
        }
      }

    }).bind(this))

    if (this.dockers.length === 1) {
      let dockerPos
      dockerPos = data.find(function (entry) {
        return (entry.prefix + '-' + entry.name === 'oryx-dockers')
      })

      if (dockerPos) {
        let points = dockerPos.value.replace(/,/g, ' ').split(' ').without('').without('#')
        if (points.length === 2 && this.dockers[0].getDockedShape()) {
          this.dockers[0].setReferencePoint({
            x: parseFloat(points[0]),
            y: parseFloat(points[1])
          })
        } else {
          this.dockers[0].bounds.centerMoveTo(parseFloat(points[0]), parseFloat(points[1]))
        }
      }
    }
  }

  /**
   * This method excepts the SVGDoucment that is the SVG representation
   * of this shape.
   * The bounds of the shape are calculated, the SVG representation's upper left point
   * is moved to 0,0 and it the method sets if this shape is resizable.
   *
   * @param {SVGDocument} svgDocument
   */
  _init (svgDocument) {
    // arguments.callee.$._init.apply(this, arguments)
    super._init(svgDocument)
    //outer most g node
    let svgNode = svgDocument.getElementsByTagName('g')[0]

    // set all required attributes
    let attributeTitle = svgDocument.ownerDocument.createAttribute('title')
    attributeTitle.nodeValue = this.getStencil().title()
    svgNode.setAttributeNode(attributeTitle)

    let attributeId = svgDocument.ownerDocument.createAttribute('id')
    attributeId.nodeValue = this.id
    svgNode.setAttributeNode(attributeId)

    let stencilTargetNode = this.node.childNodes[0].childNodes[0] //<g class=me>"
    svgNode = stencilTargetNode.appendChild(svgNode)

    // Add to the EventHandler
    this.addEventHandlers(svgNode.parentNode)

    /**set minimum and maximum size*/
    let minSizeAttr = svgNode.getAttributeNS(ORYX_Config.NAMESPACE_ORYX, 'minimumSize')
    if (minSizeAttr) {
      minSizeAttr = minSizeAttr.replace('/,/g', ' ')
      let minSizeValues = minSizeAttr.split(' ')
      minSizeValues = minSizeValues.without('')

      if (minSizeValues.length > 1) {
        this.minimumSize = {
          width: parseFloat(minSizeValues[0]),
          height: parseFloat(minSizeValues[1])
        }
      }
      else {
        //set minimumSize to (1,1), so that width and height of the stencil can never be (0,0)
        this.minimumSize = {
          width: 1,
          height: 1
        }
      }
    }

    let maxSizeAttr = svgNode.getAttributeNS(ORYX_Config.NAMESPACE_ORYX, 'maximumSize')
    if (maxSizeAttr) {
      maxSizeAttr = maxSizeAttr.replace('/,/g', ' ')
      let maxSizeValues = maxSizeAttr.split(' ')
      maxSizeValues = maxSizeValues.without('')

      if (maxSizeValues.length > 1) {
        this.maximumSize = {
          width: parseFloat(maxSizeValues[0]),
          height: parseFloat(maxSizeValues[1])
        }
      }
    }

    if (this.minimumSize && this.maximumSize &&
      (this.minimumSize.width > this.maximumSize.width ||
        this.minimumSize.height > this.maximumSize.height)) {
      //TODO wird verschluckt!!!
      throw this + ': Minimum Size must be greater than maxiumSize.'
    }

    /**get current bounds and adjust it to upperLeft == (0,0)*/
    // initialize all SVGShape objects
    this._svgShapes = this._initSVGShapes(svgNode)

    // get upperLeft and lowerRight of stencil
    let upperLeft = {
      x: undefined,
      y: undefined
    }
    let lowerRight = {
      x: undefined,
      y: undefined
    }
    const me = this
    this._svgShapes.each(function (svgShape) {
      upperLeft.x = (upperLeft.x !== undefined) ? Math.min(upperLeft.x, svgShape.x) : svgShape.x
      upperLeft.y = (upperLeft.y !== undefined) ? Math.min(upperLeft.y, svgShape.y) : svgShape.y
      lowerRight.x = (lowerRight.x !== undefined) ? Math.max(lowerRight.x, svgShape.x + svgShape.width) : svgShape.x + svgShape.width
      lowerRight.y = (lowerRight.y !== undefined) ? Math.max(lowerRight.y, svgShape.y + svgShape.height) : svgShape.y + svgShape.height

      /** set if resizing is enabled */
      //TODO isResizable durch die beiden anderen booleans ersetzen?
      if (svgShape.isHorizontallyResizable) {
        me.isHorizontallyResizable = true
        me.isResizable = true
      }
      if (svgShape.isVerticallyResizable) {
        me.isVerticallyResizable = true
        me.isResizable = true
      }
      if (svgShape.anchorTop && svgShape.anchorBottom) {
        me.isVerticallyResizable = true
        me.isResizable = true
      }
      if (svgShape.anchorLeft && svgShape.anchorRight) {
        me.isHorizontallyResizable = true
        me.isResizable = true
      }
    })

    // move all SVGShapes by -upperLeft
    this._svgShapes.each(function (svgShape) {
      svgShape.x -= upperLeft.x
      svgShape.y -= upperLeft.y
      svgShape.update()
    })

    // set bounds of shape
    // the offsets are also needed for positioning the magnets and the docker
    let offsetX = upperLeft.x
    let offsetY = upperLeft.y

    lowerRight.x -= offsetX
    lowerRight.y -= offsetY
    upperLeft.x = 0
    upperLeft.y = 0

    // prevent that width or height of initial bounds is 0
    if (lowerRight.x === 0) {
      lowerRight.x = 1
    }
    if (lowerRight.y === 0) {
      lowerRight.y = 1
    }

    this._oldBounds.set(upperLeft, lowerRight)
    this.bounds.set(upperLeft, lowerRight)

    /**initialize magnets */
    let magnets = svgDocument.getElementsByTagNameNS(ORYX_Config.NAMESPACE_ORYX, 'magnets')
    if (magnets && magnets.length > 0) {
      magnets = $A(magnets[0].getElementsByTagNameNS(ORYX_Config.NAMESPACE_ORYX, 'magnet'))
      const me = this
      magnets.each(function (magnetElem) {
        let magnet = new ORYX_Controls.Magnet({
          eventHandlerCallback: me.eventHandlerCallback
        })
        let cx = parseFloat(magnetElem.getAttributeNS(ORYX_Config.NAMESPACE_ORYX, 'cx'))
        let cy = parseFloat(magnetElem.getAttributeNS(ORYX_Config.NAMESPACE_ORYX, 'cy'))
        magnet.bounds.centerMoveTo({
          x: cx - offsetX,
          y: cy - offsetY
        })

        // get anchors
        let anchors = magnetElem.getAttributeNS(ORYX_Config.NAMESPACE_ORYX, 'anchors')
        if (anchors) {
          anchors = anchors.replace('/,/g', ' ')
          anchors = anchors.split(' ').without('')
          for (let i = 0; i < anchors.length; i++) {
            switch (anchors[i].toLowerCase()) {
              case 'left':
                magnet.anchorLeft = true
                break
              case 'right':
                magnet.anchorRight = true
                break
              case 'top':
                magnet.anchorTop = true
                break
              case 'bottom':
                magnet.anchorBottom = true
                break
            }
          }
        }

        me.add(magnet)

        // check, if magnet is default magnet
        if (!me._defaultMagnet) {
          let defaultAttr = magnetElem.getAttributeNS(ORYX_Config.NAMESPACE_ORYX, 'default')
          if (defaultAttr && defaultAttr.toLowerCase() === 'yes') {
            me._defaultMagnet = magnet
          }
        }
      })
    } else {
      // Add a Magnet in the Center of Shape
      let magnet = new ORYX_Controls.Magnet()
      magnet.bounds.centerMoveTo(this.bounds.width() / 2, this.bounds.height() / 2)
      this.add(magnet)
    }

    /**initialize docker */
    let dockerElem = svgDocument.getElementsByTagNameNS(ORYX_Config.NAMESPACE_ORYX, 'docker')

    if (dockerElem && dockerElem.length > 0) {
      dockerElem = dockerElem[0]
      let docker = this.createDocker()
      let cx = parseFloat(dockerElem.getAttributeNS(ORYX_Config.NAMESPACE_ORYX, 'cx'))
      let cy = parseFloat(dockerElem.getAttributeNS(ORYX_Config.NAMESPACE_ORYX, 'cy'))
      docker.bounds.centerMoveTo({
        x: cx - offsetX,
        y: cy - offsetY
      })

      // get anchors
      let anchors = dockerElem.getAttributeNS(ORYX_Config.NAMESPACE_ORYX, 'anchors')
      if (anchors) {
        anchors = anchors.replace('/,/g', ' ')
        anchors = anchors.split(' ').without('')

        for (let i = 0; i < anchors.length; i++) {
          switch (anchors[i].toLowerCase()) {
            case 'left':
              docker.anchorLeft = true
              break
            case 'right':
              docker.anchorRight = true
              break
            case 'top':
              docker.anchorTop = true
              break
            case 'bottom':
              docker.anchorBottom = true
              break
          }
        }
      }
    }

    /**initialize labels*/
    let textElems = svgNode.getElementsByTagNameNS(ORYX_Config.NAMESPACE_SVG, 'text')

    $A(textElems).each((function (textElem) {
      let label = new ORYX_SVG.Label({
        textElement: textElem,
        shapeId: this.id
      })
      label.x -= offsetX
      label.y -= offsetY
      this._labels.set(label.id, label)
      label.registerOnChange(this.layout.bind(this))

      // Only apply fitting on form-components
      if (this._stencil.id().indexOf(ORYX_Config.FORM_ELEMENT_ID_PREFIX) == 0) {
        label.registerOnChange(this.fitToLabels.bind(this))
      }
    }).bind(this))
  }

  fitToLabels () {
    let y = 0
    this.getLabels().each(function (label) {
      let lr = label.getY() + label.getHeight()
      if (lr > y) {
        y = lr
      }
    })

    let bounds = this.bounds
    let boundsChanged = false

    if (this.minimumSize) {
      // Check if y-value exceeds the min-value. If not, stick to this value.
      let minHeight = this.minimumSize.height
      if (y < minHeight && bounds.height() > minHeight && minHeight > this.forcedHeight) {
        bounds.set(bounds.upperLeft().x, bounds.upperLeft().y, bounds.lowerRight().x, bounds.upperLeft().y + minHeight)
        boundsChanged = true
      } else if (y > minHeight && bounds.height() != y && y > this.forcedHeight) {
        bounds.set(bounds.upperLeft().x, bounds.upperLeft().y, bounds.lowerRight().x, bounds.upperLeft().y + y)
        boundsChanged = true
      } else if (bounds.height() > this.forcedHeight && this.forcedHeight > 0) {
        bounds.set(bounds.upperLeft().x, bounds.upperLeft().y, bounds.lowerRight().x, bounds.upperLeft().y + this.forcedHeight)
        boundsChanged = true
      }
    }

    if (boundsChanged) {
      // Force facade to re-layout since bounds are changed AFTER layout has been performed
      if (this.facade.getCanvas() != null) {
        this.facade.getCanvas().update()
      }

      // Re-select if needed to force the select
      if (this.facade.getSelection().member(this)) {
        let selectedNow = this.facade.getSelection()
        this.facade.setSelection([])
        this.facade.setSelection(selectedNow)
      }
    }
  }

  /**
   * Override the Method, that a docker is not shown
   *
   */
  createDocker () {
    let docker = new ORYX_Controls.Docker({ eventHandlerCallback: this.eventHandlerCallback })
    docker.bounds.registerCallback(this._dockerChangedCallback)

    this.dockers.push(docker)
    docker.parent = this
    docker.bounds.registerCallback(this._changedCallback)

    return docker
  }

  toString () {
    return this._stencil.title() + ' ' + this.id
  }
  getInstanceofType () {
    return 'Node, Shape'
  }
}
