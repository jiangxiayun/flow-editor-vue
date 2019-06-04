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
    this.currentShape = null			// Current selected Shapes
    this.isResizing = false		// Flag: If there was currently resized
    this.offSetPosition = { x: 0, y: 0 }	// Offset of the Dragging
    this.faktorXY = { x: 1, y: 1 }	// The Current Zoom-Faktor

    this.scrollNode = this.facade.getCanvas().rootNode.parentNode.parentNode
    // Get a HTML-ContainerNode
    let containerNode = this.facade.getCanvas().getHTMLContainer()

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
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEOVER, this.handleMouseOver.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEOUT, this.handleMouseOut.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEMOVE, this.handleMouseMove.bind(this))
    // this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this))
  }

  handleMouseOver (event, uiObj) {
    console.log(77777, uiObj)
    if (!(uiObj instanceof ORYX_Node)) {
      return
    }

    let type = uiObj.getStencil().idWithoutNs()
    if (type === 'Pool' || type === 'Lane' || type === 'V-Lane') {
      this.currentShape = uiObj
      this.dragBounds = uiObj.absoluteBounds()
      let eventCoordinates = this.facade.eventCoordinates(event)
      console.log(eventCoordinates)

      let aspectRatio = uiObj.getStencil().fixedAspectRatio() ?
        uiObj.bounds.width() / uiObj.bounds.height() : undefined
      this.resizerSouth.setBounds(this.dragBounds, uiObj.minimumSize, uiObj.maximumSize, aspectRatio)
      this.resizerNorth.setBounds(this.dragBounds, uiObj.minimumSize, uiObj.maximumSize, aspectRatio)
      this.resizerEast.setBounds(this.dragBounds, uiObj.minimumSize, uiObj.maximumSize, aspectRatio)
      this.resizerWest.setBounds(this.dragBounds, uiObj.minimumSize, uiObj.maximumSize, aspectRatio)
      let positionSouth = this.resizerSouth.position
      let positionNorth = this.resizerNorth.position
      let positionEast = this.resizerEast.position
      let positionWest = this.resizerWest.position

      let offset = jQuery('#canvasSection').offset()
      let eventPoint = {
        x: event.clientX - offset.left,
        y: event.clientY - offset.top
      }

      switch (type) {
        case 'Lane':
          console.log(113, eventPoint)

          console.log(11, positionSouth)
          console.log(22, positionNorth)
          console.log(33, positionSouth.y, eventPoint.y)
          console.log(44,positionSouth.y - eventPoint.y)
          if (Math.abs(positionSouth.y - eventPoint.y) < 20){
            this.resizerSouth.show()
          } else if (Math.abs(positionNorth.y - eventPoint.y) < 20){
            this.resizerNorth.show()
          }
          break
        case 'V-Lane':
          if (Math.abs(positionEast.x - eventPoint.x) < 20){
            this.resizerEast.show()
          } else if (Math.abs(positionWest.x - eventPoint.x) < 20){
            this.resizerWest.show()
          }
          break
        case 'Pool':
          if (Math.abs(positionEast.x - eventPoint.x) < 20){
            this.resizerEast.show()
          }
          break
      }
    }
  }
  handleMouseOut (event, uiObj) {
    if (!this.resizeWorking) {
      setTimeout(() => {
        if (uiObj instanceof ORYX_Node) {
          // console.log('handleMouseOut!!!!!', uiObj)
          this.hideResizers()
        }
      }, 500)
    }
  }
  hideResizers () {
    !this.resizerSouth.mouseOver && this.resizerSouth.hide()
    !this.resizerNorth.mouseOver && this.resizerNorth.hide()
    !this.resizerEast.mouseOver && this.resizerEast.hide()
    !this.resizerWest.mouseOver && this.resizerWest.hide()
  }
  /**
   * On the Selection-Changed
   */
  onSelectionChanged (event) {
    this.hideResizers()
  }

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
    // this.resizeRectangle(this.dragBounds)
  }

  onResizeStart () {
    this.resizeWorking = true
    this.facade.raiseEvent({ type: ORYX_Config.EVENT_RESIZE_START })
  }

  onResizeEnd () {
    this.resizeWorking = false
    if (!this.currentShape) {
      return
    }
    // If Resizing finished, the Shapes will be resize
    if (this.isResizing) {
      class commandClass extends ORYX_Command {
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

        getOffset (b1, b2) {
          return {
            x: b2.a.x - b1.a.x,
            y: b2.a.y - b1.a.y,
            xs: b2.width() / b1.width(),
            ys: b2.height() / b1.height()
          }
        }

        update (offset) {
          this.shape.getLabels().each((label) => {
            label.changed()
          })

          let allEdges = [].concat(this.shape.getIncomingShapes())
            .concat(this.shape.getOutgoingShapes())
            // Remove all edges which are included in the selection from the list
            .findAll((r) => r instanceof ORYX_Edge)

          this.plugin.layoutEdges(this.shape, allEdges, offset)
          this.plugin.facade.setSelection([this.shape])
          this.plugin.facade.getCanvas().update()
          this.plugin.facade.updateSelection()
        }
      }

      let bounds = this.dragBounds.clone()
      let shape = this.currentShape

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
}
