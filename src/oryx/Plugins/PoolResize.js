import AbstractPlugin from './AbstractPlugin'
import Resizer from './Resizer'
import ORYX_Edge from '../core/Edge'
import ORYX_Node from '../core/Node'
import ORYX_Command from '../core/Command'
import ORYX_Command_Move from '../core/Move'
import ORYX_Config from '../CONFIG'

export default class DragDropResize extends AbstractPlugin {
  UI_CONFIG = ORYX_Config.CustomConfigs.UI_CONFIG

  /**
   *  @param {Object} Facade: The Facade of the Editor
   */
  constructor (facade) {
    super(facade)
    this.facade = facade
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

    this.facade.registerOnEvent(ORYX_Config.EVENT_CANVAS_SCROLL, this.hideResizers.bind(this))
    this.facade.registerOnEvent('canvas.scrollEnd', this.setResizes.bind(this))
  }

  hideResizers () {
    this.resizerSouth.hide()
    this.resizerNorth.hide()
    this.resizerEast.hide()
    this.resizerWest.hide()
  }
  /**
   * On the Selection-Changed
   */
  setResizes () {
    if (!this.currentShape) return

    let shape =  this.currentShape
    let type = shape.getStencil().idWithoutNs()

    if (type === 'Pool' || type === 'Lane' || type === 'V-Lane') {
      this.dragBounds = shape.absoluteBounds()
      let aspectRatio = shape.getStencil().fixedAspectRatio() ?
        shape.bounds.width() / shape.bounds.height() : undefined
      switch (type) {
        case 'Lane':
          this.resizerSouth.setBounds(this.dragBounds, shape.minimumSize, shape.maximumSize, aspectRatio)
          this.resizerSouth.show()
          this.resizerNorth.setBounds(this.dragBounds, shape.minimumSize, shape.maximumSize, aspectRatio)
          this.resizerNorth.show()
          break
        case 'V-Lane':
          this.resizerEast.setBounds(this.dragBounds, shape.minimumSize, shape.maximumSize, aspectRatio)
          this.resizerEast.show()
          this.resizerWest.setBounds(this.dragBounds, shape.minimumSize, shape.maximumSize, aspectRatio)
          this.resizerWest.show()
          break
        case 'Pool':
          this.resizerSouth.setBounds(this.dragBounds, shape.minimumSize, shape.maximumSize, aspectRatio)
          this.resizerSouth.show()
          this.resizerNorth.setBounds(this.dragBounds, shape.minimumSize, shape.maximumSize, aspectRatio)
          this.resizerNorth.show()
          this.resizerEast.setBounds(this.dragBounds, shape.minimumSize, shape.maximumSize, aspectRatio)
          this.resizerEast.show()
          break
      }
    }
  }
  onSelectionChanged (event) {
    this.hideResizers()
    let elements = event.elements
    if (elements.length === 0) {
      this.currentShape = null
    } else if (elements.length === 1 && elements[0].isResizable) {
      let shape = elements[0]
      this.currentShape = shape
      this.setResizes()
    }
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
    this.facade.raiseEvent({ type: ORYX_Config.EVENT_RESIZE_START })
  }

  onResizeEnd () {
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
