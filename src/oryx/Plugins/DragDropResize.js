import AbstractPlugin from './AbstractPlugin'
import SelectedRect from './SelectedRect'
import GridLine from './GridLine'
import Resizer from './Resizer'
import ORYX_Edge from '../core/Edge'
import ORYX_Node from '../core/Node'
import ORYX_Shape from '../core/Shape'
import ORYX_Canvas from '../core/Canvas'
import ORYX_Command from '../core/Command'
import ORYX_Command_Move from '../core/Move'
import ORYX_Controls from '../core/Controls/index'
import ORYX_Config from '../CONFIG'
import ORYX_Utils from '../Utils'

export default class DragDropResize extends AbstractPlugin {
  UI_CONFIG = ORYX_Config.CustomConfigs.UI_CONFIG
  /**
   *  @param {Object} Facade: The Facade of the Editor
   */
  constructor (facade) {
    super(facade)
    this.facade = facade
    // Initialize variables
    this.currentShapes = []			// Current selected Shapes
    //this.pluginsData 		= [];			// Available Plugins
    this.toMoveShapes = []			// Shapes there will be moved
    this.distPoints = []			// Distance Points for Snap on Grid
    this.isResizing = false		// Flag: If there was currently resized
    this.dragEnable = false		// Flag: If Dragging is enabled
    this.dragIntialized = false		// Flag: If the Dragging is initialized
    this.edgesMovable = true			// Flag: If an edge is docked it is not movable
    this.offSetPosition = { x: 0, y: 0 }	// Offset of the Dragging
    this.faktorXY = { x: 1, y: 1 }	// The Current Zoom-Faktor
    this.containmentParentNode				// the current future parent node for the dragged shapes
    this.isAddingAllowed = false		// flag, if adding current selected shapes to containmentParentNode is allowed
    this.isAttachingAllowed = false		// flag, if attaching to the current shape is allowed

    this.callbackMouseMove = this.handleMouseMove.bind(this)
    this.callbackMouseUp = this.handleMouseUp.bind(this)

    // Get the SVG-Containernode
    let containerNode = this.facade.getCanvas().getSvgContainer()
    // Create the Selected Rectangle in the SVG
    this.selectedRect = new SelectedRect(containerNode)

    // Show grid line if enabled
    if (ORYX_Config.SHOW_GRIDLINE) {
      this.vLine = new GridLine(containerNode, 'ver')
      this.hLine = new GridLine(containerNode, 'hor')
    }

    this.scrollNode = this.facade.getCanvas().rootNode.parentNode.parentNode

    // Get a HTML-ContainerNode
    containerNode = this.facade.getCanvas().getHTMLContainer()
    // Create the southeastern button for resizing
    this.resizerSE = new Resizer(containerNode, 'southeast', this.facade)
    this.resizerSE.registerOnResize(this.onResize.bind(this)) // register the resize callback
    this.resizerSE.registerOnResizeEnd(this.onResizeEnd.bind(this)) // register the resize end callback
    this.resizerSE.registerOnResizeStart(this.onResizeStart.bind(this)) // register the resize start callback

    // Create the northwestern button for resizing
    this.resizerNW = new Resizer(containerNode, 'northwest', this.facade)
    this.resizerNW.registerOnResize(this.onResize.bind(this)) // register the resize callback
    this.resizerNW.registerOnResizeEnd(this.onResizeEnd.bind(this)) // register the resize end callback
    this.resizerNW.registerOnResizeStart(this.onResizeStart.bind(this)) // register the resize start callback

    this.resizerSouth = new Resizer(containerNode, 'south', this.facade)
    this.resizerSouth.registerOnResize(this.onResize.bind(this))
    this.resizerSouth.registerOnResizeEnd(this.onResizeEnd.bind(this))
    this.resizerSouth.registerOnResizeStart(this.onResizeStart.bind(this))
    this.resizerNorth = new Resizer(containerNode, 'north', this.facade)
    this.resizerNorth.registerOnResize(this.onResize.bind(this))
    this.resizerNorth.registerOnResizeEnd(this.onResizeEnd.bind(this))
    this.resizerNorth.registerOnResizeStart(this.onResizeStart.bind(this))
    this.resizerEast = new Resizer(containerNode, 'east', this.facade)
    this.resizerEast.registerOnResize(this.onResize.bind(this))
    this.resizerEast.registerOnResizeEnd(this.onResizeEnd.bind(this))
    this.resizerEast.registerOnResizeStart(this.onResizeStart.bind(this))
    this.resizerWest = new Resizer(containerNode, 'west', this.facade)
    this.resizerWest.registerOnResize(this.onResize.bind(this))
    this.resizerWest.registerOnResizeEnd(this.onResizeEnd.bind(this))
    this.resizerWest.registerOnResizeStart(this.onResizeStart.bind(this))

    // For the Drag and Drop
    // Register on MouseDown-Event on a Shape
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this))
  }

  /**
   * On the Selection-Changed
   */
  onSelectionChanged (event) {
    let elements = event.elements

    // Reset the drag-variables
    this.dragEnable = false
    this.dragIntialized = false
    this.resizerSE.hide()
    this.resizerNW.hide()
    this.resizerSouth.hide()
    this.resizerNorth.hide()
    this.resizerEast.hide()
    this.resizerWest.hide()

    // If there is no elements
    if (!elements || elements.length == 0) {
      // Hide all things and reset all variables
      this.selectedRect.hide()
      this.currentShapes = []
      this.toMoveShapes = []
      this.dragBounds = undefined
      this.oldDragBounds = undefined
    } else {
      // Set the current Shapes
      this.currentShapes = elements

      // Get all shapes with the highest parent in object hierarchy (canvas is the top most parent)
      let topLevelElements = this.facade.getCanvas().getShapesWithSharedParent(elements)
      this.toMoveShapes = topLevelElements

      this.toMoveShapes = this.toMoveShapes.findAll(function (shape) {
        return shape instanceof ORYX_Node &&
          (shape.dockers.length === 0 || !elements.member(shape.dockers.first().getDockedShape())) &&
          !shape.getStencil().id().endsWith('Lane')
      })

      elements.each((function (shape) {
        if (!(shape instanceof ORYX_Edge)) {
          return
        }

        let dks = shape.getDockers()

        let hasF = elements.member(dks.first().getDockedShape())
        let hasL = elements.member(dks.last().getDockedShape())

        //				if(!hasL) {
        //					this.toMoveShapes.push(dks.last());
        //				}
        //				if(!hasF){
        //					this.toMoveShapes.push(dks.first())
        //				}
        /* Enable movement of undocked edges */
        if (!hasF && !hasL) {
          let isUndocked = !dks.first().getDockedShape() && !dks.last().getDockedShape()
          if (isUndocked) {
            this.toMoveShapes = this.toMoveShapes.concat(dks)
          }
        }

        if (shape.dockers.length > 2 && hasF && hasL) {
          this.toMoveShapes = this.toMoveShapes.concat(dks.findAll(function (el, index) {
            return index > 0 && index < dks.length - 1
          }))
        }

      }).bind(this))

      // Calculate the new area-bounds of the selection
      let newBounds = undefined
      this.toMoveShapes.each(function (value) {
        let shape = value
        if (value instanceof ORYX_Controls.Docker) {
          /* Get the Shape */
          shape = value.parent
        }

        if (!newBounds) {
          newBounds = shape.absoluteBounds()
        } else {
          newBounds.include(shape.absoluteBounds())
        }
      }.bind(this))

      if (!newBounds) {
        elements.each(function (value) {
          if (!newBounds) {
            newBounds = value.absoluteBounds()
          } else {
            newBounds.include(value.absoluteBounds())
          }
        })
      }

      let elementInLane = []
      this.toMoveShapes.map((shape) => {
        if (shape instanceof ORYX_Node) {
          let box = {a: {}, b: {}}
          if (shape.getStencil().idWithoutNs() === 'Pool') {
            box = shape.bounds.clone()
            box.a.x += 30
            elementInLane = this.findChindsInBound(box)
          } else if (shape.getStencil().idWithoutNs() === 'V-Pool') {
            box = shape.bounds.clone()
            box.a.y += 30
            elementInLane = this.findChindsInBound(box)
          } else if (shape.getStencil().id().endsWith('Lane')) {
            box = shape.bounds.clone()
            elementInLane = this.findChindsInBound(box)
          }
        }
      })
      this.toMoveShapes = this.toMoveShapes.concat(elementInLane)

      // Set the new bounds
      this.dragBounds = newBounds
      this.oldDragBounds = newBounds.clone()

      // Update and show the rectangle
      this.resizeRectangle(newBounds)
      this.selectedRect.show()

      // Show the resize button, if there is only one element and this is resizeable
      if (elements.length === 1 && elements[0].isResizable) {
        let aspectRatio = elements[0].getStencil().fixedAspectRatio() ?
          elements[0].bounds.width() / elements[0].bounds.height() : undefined
        let id = elements[0].getStencil().idWithoutNs()
        // .getStencil().stencilSet().namespace()
        if (id === 'Pool' || id === 'Lane') {
          this.resizerSouth.setBounds(this.dragBounds, elements[0].minimumSize, elements[0].maximumSize, aspectRatio)
          // this.resizerSouth.setFullLineBounds(this.dragBounds)
          this.resizerSouth.show()
          this.resizerNorth.setBounds(this.dragBounds, elements[0].minimumSize, elements[0].maximumSize, aspectRatio)
          // this.resizerNorth.setFullLineBounds(this.dragBounds)
          this.resizerNorth.show()
        } else if (id === 'V-Pool' || id === 'V-Lane') {
          this.resizerEast.setBounds(this.dragBounds, elements[0].minimumSize, elements[0].maximumSize, aspectRatio)
          this.resizerEast.show()
          this.resizerWest.setBounds(this.dragBounds, elements[0].minimumSize, elements[0].maximumSize, aspectRatio)
          this.resizerWest.show()
        } else {
          // this.resizerSE.setBounds(this.dragBounds, elements[0].minimumSize, elements[0].maximumSize, aspectRatio)
          // this.resizerSE.show()
          // this.resizerNW.setBounds(this.dragBounds, elements[0].minimumSize, elements[0].maximumSize, aspectRatio)
          // this.resizerNW.show()
        }
      } else {
        this.resizerSE.setBounds(undefined)
        this.resizerNW.setBounds(undefined)
        this.resizerSouth.setBounds(undefined)
        this.resizerNorth.setBounds(undefined)
        this.resizerEast.setBounds(undefined)
        this.resizerWest.setBounds(undefined)
      }

      // If Snap-To-Grid is enabled, the Snap-Point will be calculate
      if (this.UI_CONFIG.GRID_ENABLED) {
        // Reset all points
        this.distPoints = []

        if (this.distPointTimeout) {
          window.clearTimeout(this.distPointTimeout)
        }

        this.distPointTimeout = window.setTimeout(function () {
          // Get all the shapes, there will consider at snapping
          // Consider only those elements who shares the same parent element
          let distShapes = this.facade.getCanvas().getChildShapes(true).findAll(function (value) {
            let parentShape = value.parent
            while (parentShape) {
              if (elements.member(parentShape)) return false
              parentShape = parentShape.parent
            }
            return true
          })

          // The current selection will delete from this array
          //elements.each(function(shape) {
          //	distShapes = distShapes.without(shape);
          //});

          // For all these shapes
          distShapes.each((function (value) {
            if (!(value instanceof ORYX_Edge)) {
              let ul = value.absoluteXY()
              let width = value.bounds.width()
              let height = value.bounds.height()

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
              })
            }
          }).bind(this))

        }.bind(this), 10)
      }
    }
  }

  /**
   * On Mouse Down
   */
  handleMouseDown (event, uiObj) {
    // If the selection Bounds not intialized and the uiObj is not member of current selectio
    // then return
    if (!this.dragBounds || !this.currentShapes.member(uiObj) || !this.toMoveShapes.length) {
      return
    }

    // Start Dragging
    this.dragEnable = true
    this.dragIntialized = true
    this.edgesMovable = true

    // Calculate the current zoom factor
    let a = this.facade.getCanvas().node.getScreenCTM()
    this.faktorXY.x = a.a
    this.faktorXY.y = a.d

    let eventX = Event.pointerX(event)
    let eventY = Event.pointerY(event)

    // Set the offset position of dragging
    let upL = this.dragBounds.upperLeft()
    this.offSetPosition = {
      x: eventX - (upL.x * this.faktorXY.x),
      y: eventY - (upL.y * this.faktorXY.y)
    }

    this.offsetScroll = { x: this.scrollNode.scrollLeft, y: this.scrollNode.scrollTop }

    // Register on Global Mouse-MOVE Event
    document.documentElement.addEventListener(ORYX_Config.EVENT_MOUSEMOVE, this.callbackMouseMove, false)
    // Register on Global Mouse-UP Event
    document.documentElement.addEventListener(ORYX_Config.EVENT_MOUSEUP, this.callbackMouseUp, true)

    return
  }

  /**
   * On Key Mouse Move
   */
  handleMouseMove (event) {
    // If dragging is not enabled, go return
    if (!this.dragEnable) {
      return
    }

    // If Dragging is initialized
    if (this.dragIntialized) {
      // Raise Event: Drag will be started
      this.facade.raiseEvent({ type: ORYX_Config.EVENT_DRAGDROP_START })
      this.dragIntialized = false

      // And hide the resizers and the highlighting
      this.resizerSE.hide()
      this.resizerNW.hide()
      this.resizerSouth.hide()
      this.resizerNorth.hide()
      this.resizerEast.hide()
      this.resizerWest.hide()

      // if only edges are selected, containmentParentNode must be the canvas
      this._onlyEdges = this.currentShapes.all(function (currentShape) {
        return (currentShape instanceof ORYX_Edge)
      })

      // Do method before Drag
      this.beforeDrag()
      this._currentUnderlyingNodes = []
    }

    // Calculate the new position
    let position = {
      x: Event.pointerX(event) - this.offSetPosition.x,
      y: Event.pointerY(event) - this.offSetPosition.y
    }

    position.x -= this.offsetScroll.x - this.scrollNode.scrollLeft
    position.y -= this.offsetScroll.y - this.scrollNode.scrollTop

    // If not the Control-Key are pressed
    let modifierKeyPressed = event.shiftKey || event.ctrlKey
    if (this.UI_CONFIG.GRID_ENABLED && !modifierKeyPressed) {
      // Snap the current position to the nearest Snap-Point 辅助线吸附
      position = this.snapToGrid(position)
    } else {
      this.vLine && this.vLine.hide()
      this.hLine && this.hLine.hide()
    }

    // Adjust the point by the zoom faktor
    position.x /= this.faktorXY.x
    position.y /= this.faktorXY.y

    // Set that the position is not lower than zero
    position.x = Math.max(0, position.x)
    position.y = Math.max(0, position.y)

    // Set that the position is not bigger than the canvas
    let c = this.facade.getCanvas()
    position.x = Math.min(c.bounds.width() - this.dragBounds.width(), position.x)
    position.y = Math.min(c.bounds.height() - this.dragBounds.height(), position.y)

    // Drag this bounds
    this.dragBounds.moveTo(position)

    // Update all selected shapes and the selection rectangle
    this.resizeRectangle(this.dragBounds)

    this.isAttachingAllowed = false

    // check, if a node can be added to the underlying node
    let eventCoordinates = this.facade.eventCoordinates(event)

    let additionalIEZoom = 1
    additionalIEZoom = ORYX_Utils.IEZoomBelow10(additionalIEZoom)

    if (additionalIEZoom !== 1) {
      eventCoordinates.x = eventCoordinates.x / additionalIEZoom
      eventCoordinates.y = eventCoordinates.y / additionalIEZoom
    }

    let underlyingNodes = $A(this.facade.getCanvas().getAbstractShapesAtPosition(eventCoordinates))

    let checkIfAttachable = this.toMoveShapes.length === 1 &&
      this.toMoveShapes[0] instanceof ORYX_Node &&
      this.toMoveShapes[0].dockers.length > 0
    // console.log(233, checkIfAttachable, underlyingNodes, this._currentUnderlyingNodes)

    checkIfAttachable = checkIfAttachable && underlyingNodes.length != 1

    if (!checkIfAttachable &&
      underlyingNodes.length === this._currentUnderlyingNodes.length &&
      underlyingNodes.all(function (node, index) {
        return this._currentUnderlyingNodes[index] === node
      }.bind(this))) {

      return

    } else if (this._onlyEdges) {
      this.isAddingAllowed = true
      this.containmentParentNode = this.facade.getCanvas()
    } else {
      /* Check the containment and connection rules */
      let options = {
        event: event,
        underlyingNodes: underlyingNodes,
        checkIfAttachable: checkIfAttachable
      }
      this.checkRules(options)
    }

    this._currentUnderlyingNodes = underlyingNodes.reverse()

    // visualize the containment result
    if (this.isAttachingAllowed) {
      this.facade.raiseEvent({
        type: ORYX_Config.EVENT_HIGHLIGHT_SHOW,
        highlightId: 'dragdropresize.attached',
        elements: [this.containmentParentNode],
        style: ORYX_Config.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
        color: ORYX_Config.SELECTION_VALID_COLOR
      })

    } else {
      this.facade.raiseEvent({
        type: ORYX_Config.EVENT_HIGHLIGHT_HIDE,
        highlightId: 'dragdropresize.attached'
      })
    }

    if (!this.isAttachingAllowed) {
      if (this.isAddingAllowed) {
        this.facade.raiseEvent({
          type: ORYX_Config.EVENT_HIGHLIGHT_SHOW,
          highlightId: 'dragdropresize.contain',
          elements: [this.containmentParentNode],
          color: ORYX_Config.SELECTION_VALID_COLOR
        })

      } else {
        this.facade.raiseEvent({
          type: ORYX_Config.EVENT_HIGHLIGHT_SHOW,
          highlightId: 'dragdropresize.contain',
          elements: [this.containmentParentNode],
          color: ORYX_Config.SELECTION_INVALID_COLOR
        })
      }
    } else {
      this.facade.raiseEvent({
        type: ORYX_Config.EVENT_HIGHLIGHT_HIDE,
        highlightId: 'dragdropresize.contain'
      })
    }

    // Stop the Event
    // Event.stop(event);
    return
  }
  /**
   * On Key Mouse Up
   */
  handleMouseUp (event) {
    // disable containment highlighting
    this.facade.raiseEvent({
      type: ORYX_Config.EVENT_HIGHLIGHT_HIDE,
      highlightId: 'dragdropresize.contain'
    })

    this.facade.raiseEvent({
      type: ORYX_Config.EVENT_HIGHLIGHT_HIDE,
      highlightId: 'dragdropresize.attached'
    })

    // If Dragging is finished
    if (this.dragEnable) {
      // and update the current selection
      if (!this.dragIntialized) {
        // Do Method after Dragging
        this.afterDrag()

        // Check if the Shape is allowed to dock to the other Shape
        if (this.isAttachingAllowed &&
          this.toMoveShapes.length == 1 && this.toMoveShapes[0] instanceof ORYX_Node &&
          this.toMoveShapes[0].dockers.length > 0) {

          // Get the position and the docker
          let position = this.facade.eventCoordinates(event)
          let docker = this.toMoveShapes[0].dockers[0]


          // Command-Pattern for dragging several Shapes
          class dockCommand extends ORYX_Command{
            constructor (docker, position, newDockedShape, facade) {
              super()
              this.docker = docker
              this.newPosition = position
              this.newDockedShape = newDockedShape
              this.newParent = newDockedShape.parent || facade.getCanvas()
              this.oldPosition = docker.parent.bounds.center()
              this.oldDockedShape = docker.getDockedShape()
              this.oldParent = docker.parent.parent || facade.getCanvas()
              this.facade = facade

              if (this.oldDockedShape) {
                this.oldPosition = docker.parent.absoluteBounds().center()
              }
            }
            execute() {
              this.dock(this.newDockedShape, this.newParent, this.newPosition)
              // Raise Event for having the docked shape on top of the other shape
              this.facade.raiseEvent({ type: ORYX_Config.EVENT_ARRANGEMENT_TOP, excludeCommand: true })
            }
            rollback () {
              this.dock(this.oldDockedShape, this.oldParent, this.oldPosition)
            }
            dock (toDockShape, parent, pos) {
              // Add to the same parent Shape
              parent.add(this.docker.parent)
              // Set the Docker to the new Shape
              this.docker.setDockedShape(undefined)
              this.docker.bounds.centerMoveTo(pos)
              this.docker.setDockedShape(toDockShape)
              // this.docker.update();

              this.facade.setSelection([this.docker.parent])
              this.facade.getCanvas().update()
              this.facade.updateSelection()
            }
          }
          // Instanziate the dockCommand
          const commands = [new dockCommand(docker, position, this.containmentParentNode, this.facade)]
          this.facade.executeCommands(commands)
          // Check if adding is allowed to the other Shape
        } else if (this.isAddingAllowed) {
          // Refresh all Shapes --> Set the new Bounds
          this.refreshSelectedShapes()
        }

        this.facade.updateSelection()

        // this.currentShapes.each(function(shape) {shape.update()})
        // Raise Event: Dragging is finished
        this.facade.raiseEvent({ type: ORYX_Config.EVENT_DRAGDROP_END })
      }
      if (this.vLine)
        this.vLine.hide()
      if (this.hLine)
        this.hLine.hide()
    }

    // Disable
    this.dragEnable = false

    // UnRegister on Global Mouse-UP/-Move Event
    document.documentElement.removeEventListener(ORYX_Config.EVENT_MOUSEUP, this.callbackMouseUp, true)
    document.documentElement.removeEventListener(ORYX_Config.EVENT_MOUSEMOVE, this.callbackMouseMove, false)

    return
  }


  //	/**
  //	 * Rollbacks the docked shape of an edge, if the edge is not movable.
  //	 */
  //	redockEdges: function() {
  //		this._undockedEdgesCommand.dockers.each(function(el){
  //			el.docker.setDockedShape(el.dockedShape);
  //			el.docker.setReferencePoint(el.refPoint);
  //		})
  //	},

  findChindsInBound (bound) {
    // Calculate the elements from the childs of the canvas
    let elements = this.facade.getCanvas().getChildShapes(true).findAll(function (value) {
      if (value instanceof ORYX_Node) {
        let absBounds = value.absoluteBounds()
        let bA = absBounds.upperLeft()
        let bB = absBounds.lowerRight()
        if (bA.x > bound.a.x && bA.y > bound.a.y && bB.x < bound.b.x && bB.y < bound.b.y) {
          return true
        }
      }

      return false
    })

    return elements
  }
  /**
   *  Checks the containment and connection rules for the selected shapes.
   */
  checkRules (options) {
    let event = options.event
    let underlyingNodes = options.underlyingNodes
    let checkIfAttachable = options.checkIfAttachable
    let noEdges = options.noEdges

    // get underlying node that is not the same than one of the currently selected shapes or
    // a child of one of the selected shapes with the highest z Order.
    // The result is a shape or the canvas
    this.containmentParentNode = underlyingNodes.reverse().find((function (node) {
      return (node instanceof ORYX_Canvas) ||
        (((node instanceof ORYX_Node) || ((node instanceof ORYX_Edge) && !noEdges))
          && (!(this.currentShapes.member(node) ||
            this.currentShapes.any(function (shape) {
              return (shape.children.length > 0 && shape.getChildNodes(true).member(node))
            }))) && !(node.getStencil().id().endsWith('Lane') || node.getStencil().id().endsWith('Pool')))
        // && !(node.getStencil().id().endsWith('Lane') || node.getStencil().id().endsWith('Pool'))
    }).bind(this))

    if (checkIfAttachable) {
      this.isAttachingAllowed = this.facade.getRules().canConnect({
        sourceShape: this.containmentParentNode,
        edgeShape: this.toMoveShapes[0],
        targetShape: this.toMoveShapes[0]
      })

      if (this.isAttachingAllowed) {
        let point = this.facade.eventCoordinates(event)
        this.isAttachingAllowed = this.containmentParentNode.isPointOverOffset(point.x, point.y)
      }
    }

    if (!this.isAttachingAllowed) {
      // check all selected shapes, if they can be added to containmentParentNode
      this.isAddingAllowed = this.toMoveShapes.all((function (currentShape) {
        if (currentShape instanceof ORYX_Edge ||
          currentShape instanceof ORYX_Controls.Docker ||
          this.containmentParentNode === currentShape.parent) {
          return true
        } else if (this.containmentParentNode !== currentShape) {
          if (!(this.containmentParentNode instanceof ORYX_Edge) || !noEdges) {
            if (this.facade.getRules().canContain({
              containingShape: this.containmentParentNode,
              containedShape: currentShape
            })) {
              return true
            }
          }
        }
        return false
      }).bind(this))
    }

    if (!this.isAttachingAllowed && !this.isAddingAllowed &&
      (this.containmentParentNode instanceof ORYX_Edge)) {
      options.noEdges = true
      options.underlyingNodes.reverse()
      this.checkRules(options)
    }
  }

  /**
   * Redraw the selected Shapes.
   */
  refreshSelectedShapes () {
    // If the selection bounds not initialized, return
    if (!this.dragBounds) {
      return
    }

    // Calculate the offset between the bounds and the old bounds
    let upL = this.dragBounds.upperLeft()
    let oldUpL = this.oldDragBounds.upperLeft()
    let offset = {
      x: upL.x - oldUpL.x,
      y: upL.y - oldUpL.y
    }

    console.log('toMoveShapes', this.toMoveShapes, offset, this.containmentParentNode, this.currentShapes)
    // Instanciate the dragCommand
    const commands = [new ORYX_Command_Move(
      this.toMoveShapes, offset, this.containmentParentNode, this.currentShapes, this
    )]
    // this.toMoveShapes.concat(this.elementsMoveWithLane)
    // If the undocked edges command is setted, add this command
    if (this._undockedEdgesCommand instanceof ORYX_Command) {
      commands.unshift(this._undockedEdgesCommand)
    }
    // Execute the commands
    this.facade.executeCommands(commands)

    // copy the bounds to the old bounds
    if (this.dragBounds) {
      this.oldDragBounds = this.dragBounds.clone()
    }
  }

  /**
   * Callback for Resize
   */
  onResize (bounds) {
    // If the selection bounds not initialized, return
    if (!this.dragBounds) {
      return
    }

    this.dragBounds = bounds
    this.isResizing = true

    // Update the rectangle
    this.resizeRectangle(this.dragBounds)
  }

  onResizeStart () {
    this.facade.raiseEvent({ type: ORYX_Config.EVENT_RESIZE_START })
  }

  onResizeEnd () {
    if (!(this.currentShapes instanceof Array) || this.currentShapes.length <= 0) {
      return
    }

    // If Resizing finished, the Shapes will be resize
    if (this.isResizing) {
      class commandClass extends ORYX_Command{
        constructor (shape, newBounds, plugin) {
          super()
          this.shape = shape
          this.oldBounds = shape.bounds.clone()
          this.newBounds = newBounds
          this.plugin = plugin
        }
        execute () {
          this.shape.bounds.set(this.newBounds.a, this.newBounds.b)
          this.update(this.getOffset(this.oldBounds, this.newBounds))
        }
        rollback () {
          this.shape.bounds.set(this.oldBounds.a, this.oldBounds.b)
          this.update(this.getOffset(this.newBounds, this.oldBounds))
        }
        getOffset(b1, b2) {
          return {
            x: b2.a.x - b1.a.x,
            y: b2.a.y - b1.a.y,
            xs: b2.width() / b1.width(),
            ys: b2.height() / b1.height()
          }
        }
        update (offset) {
          this.shape.getLabels().each(function (label) {
            label.changed()
          })

          let allEdges = [].concat(this.shape.getIncomingShapes())
            .concat(this.shape.getOutgoingShapes())
            // Remove all edges which are included in the selection from the list
            .findAll(function (r) {
              return r instanceof ORYX_Edge
            }.bind(this))

          this.plugin.layoutEdges(this.shape, allEdges, offset)
          this.plugin.facade.setSelection([this.shape])
          this.plugin.facade.getCanvas().update()
          this.plugin.facade.updateSelection()
        }
      }

      let bounds = this.dragBounds.clone()
      let shape = this.currentShapes[0]

      if (shape.parent) {
        let parentPosition = shape.parent.absoluteXY()
        bounds.moveBy(-parentPosition.x, -parentPosition.y)
      }

      let command = new commandClass(shape, bounds, this)

      this.facade.executeCommands([command])
      this.isResizing = false
      this.facade.raiseEvent({ type: ORYX_Config.EVENT_RESIZE_END })
    }
  }

  /**
   * Prepare the Dragging
   */
  beforeDrag () {
    class undockEdgeCommand extends ORYX_Command{
      constructor (moveShapes) {
        super()
        this.dockers = moveShapes.collect(function (shape) {
          return shape instanceof ORYX_Controls.Docker ? {
            docker: shape,
            dockedShape: shape.getDockedShape(),
            refPoint: shape.referencePoint
          } : undefined
        }).compact()
      }
      execute () {
        this.dockers.each(function (el) {
          el.docker.setDockedShape(undefined)
        })
      }
      rollback () {
        this.dockers.each(function (el) {
          el.docker.setDockedShape(el.dockedShape)
          el.docker.setReferencePoint(el.refPoint)
          //el.docker.update();
        })
      }
    }

    this._undockedEdgesCommand = new undockEdgeCommand(this.toMoveShapes)
    this._undockedEdgesCommand.execute()
  }

  hideAllLabels (shape) {
    // Hide all labels from the shape
    shape.getLabels().each(function (label) {
      label.hide()
    })
    // Hide all labels from docked shapes
    shape.getAllDockedShapes().each(function (dockedShape) {
      let labels = dockedShape.getLabels()
      if (labels.length > 0) {
        labels.each(function (label) {
          label.hide()
        })
      }
    })

    // Do this recursive for all child shapes
    // EXP-NICO use getShapes
    shape.getChildren().each((function (value) {
      if (value instanceof ORYX_Shape)
        this.hideAllLabels(value)
    }).bind(this))
  }

  /**
   * Finished the Dragging
   */
  afterDrag () {}

  /**
   * Show all Labels at these shape
   */
  showAllLabels (shape) {
    // Show the label of these shape
    //shape.getLabels().each(function(label) {
    for (let i = 0; i < shape.length; i++) {
      let label = shape[i]
      label.show()
    }//);
    // Show all labels at docked shapes
    //shape.getAllDockedShapes().each(function(dockedShape) {
    let allDockedShapes = shape.getAllDockedShapes()
    for (let i = 0; i < allDockedShapes.length; i++) {
      let dockedShape = allDockedShapes[i]
      let labels = dockedShape.getLabels()
      if (labels.length > 0) {
        labels.each(function (label) {
          label.show()
        })
      }
    }//);

    // Do this recursive
    //shape.children.each((function(value) {
    for (let i = 0; i < shape.children.length; i++) {
      var value = shape.children[i]
      if (value instanceof ORYX_Shape)
        this.showAllLabels(value)
    }//).bind(this));
  }

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
   * Adjust an Point to the Snap Points
   * 将点调整到捕捉点
   */
  snapToGrid (position) {
    // Get the current Bounds
    let bounds = this.dragBounds

    let point = {}
    let ulThres = 6
    let cThres = 10
    let lrThres = 6

    let scale = this.vLine ? this.vLine.getScale() : 1

    let ul = { x: (position.x / scale), y: (position.y / scale) }
    let c = { x: (position.x / scale) + (bounds.width() / 2), y: (position.y / scale) + (bounds.height() / 2) }
    let lr = { x: (position.x / scale) + (bounds.width()), y: (position.y / scale) + (bounds.height()) }

    let offsetX, offsetY
    let gridX, gridY

    // For each distant point
    this.distPoints.each(function (value) {
      let x, y, gx, gy
      if (Math.abs(value.c.x - c.x) < cThres) {
        x = value.c.x - c.x
        gx = value.c.x
      }
      /* else if (Math.abs(value.ul.x-ul.x) < ulThres){
       x = value.ul.x-ul.x;
       gx = value.ul.x;
       } else if (Math.abs(value.lr.x-lr.x) < lrThres){
       x = value.lr.x-lr.x;
       gx = value.lr.x;
       } */

      if (Math.abs(value.c.y - c.y) < cThres) {
        y = value.c.y - c.y
        gy = value.c.y
      }
      /* else if (Math.abs(value.ul.y-ul.y) < ulThres){
       y = value.ul.y-ul.y;
       gy = value.ul.y;
       } else if (Math.abs(value.lr.y-lr.y) < lrThres){
       y = value.lr.y-lr.y;
       gy = value.lr.y;
       } */

      if (x !== undefined) {
        offsetX = offsetX === undefined ? x : (Math.abs(x) < Math.abs(offsetX) ? x : offsetX)
        if (offsetX === x)
          gridX = gx
      }

      if (y !== undefined) {
        offsetY = offsetY === undefined ? y : (Math.abs(y) < Math.abs(offsetY) ? y : offsetY)
        if (offsetY === y)
          gridY = gy
      }
    })

    if (offsetX !== undefined) {
      ul.x += offsetX
      ul.x *= scale
      if (this.vLine && gridX)
        this.vLine.update(gridX)
    } else {
      ul.x = (position.x - (position.x % (this.UI_CONFIG.GRID_DISTANCE / 2)))
      if (this.vLine)
        this.vLine.hide()
    }

    if (offsetY !== undefined) {
      ul.y += offsetY
      ul.y *= scale
      if (this.hLine && gridY)
        this.hLine.update(gridY)
    } else {
      ul.y = (position.y - (position.y % (this.UI_CONFIG.GRID_DISTANCE / 2)))
      if (this.hLine)
        this.hLine.hide()
    }

    return ul
  }

  showGridLine () {}

  /**
   * 重新绘制所选区域的矩形
   * @param {Object} bounds
   */
  resizeRectangle (bounds) {
    this.selectedRect.resize(bounds)
  }

}
