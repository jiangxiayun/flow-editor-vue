import ORYX from 'src/oryx'
import ORYX_Config from '../../oryx/CONFIG'

export default class CreateCommand extends ORYX.Core.Command {
  UI_CONFIG = ORYX_Config.CustomConfigs.UI_CONFIG

  constructor (option, currentReference, position, facade) {
    super()
    this.option = option
    this.currentReference = currentReference
    this.position = position
    this.facade = facade
    this.shape
    this.edge
    this.targetRefPos
    this.sourceRefPos
    /*
     * clone options parameters
     */
    this.connectedShape = option.connectedShape
    this.connectingType = option.connectingType
    this.namespace = option.namespace
    this.type = option.type
    this.containedStencil = option.containedStencil
    this.parent = option.parent
    this.currentReference = currentReference
    this.shapeOptions = option.shapeOptions
  }

  execute () {
    if (this.shape) {
      if (this.shape instanceof ORYX.Core.Node) {
        this.parent.add(this.shape)
        if (this.edge) {
          this.facade.getCanvas().add(this.edge)
          this.edge.dockers.first().setDockedShape(this.connectedShape)
          this.edge.dockers.first().setReferencePoint(this.sourceRefPos)
          this.edge.dockers.last().setDockedShape(this.shape)
          this.edge.dockers.last().setReferencePoint(this.targetRefPos)
        }

        this.facade.setSelection([this.shape])

      } else if (this.shape instanceof ORYX.Core.Edge) {
        this.facade.getCanvas().add(this.shape)
        this.shape.dockers.first().setDockedShape(this.connectedShape)
        this.shape.dockers.first().setReferencePoint(this.sourceRefPos)
      }
    } else {
      this.shape = this.facade.createShape(this.option)
      this.edge = (!(this.shape instanceof ORYX.Core.Edge)) ?
        this.shape.getIncomingShapes().first() : undefined
    }

    if (this.currentReference && this.position) {
      if (this.shape instanceof ORYX.Core.Edge) {

        if (!(this.currentReference instanceof ORYX.Core.Canvas)) {
          this.shape.dockers.last().setDockedShape(this.currentReference)

          if (this.currentReference.getStencil().idWithoutNs() === 'TextAnnotation') {
            let midpoint = {}
            midpoint.x = 0
            midpoint.y = this.currentReference.bounds.height() / 2
            this.shape.dockers.last().setReferencePoint(midpoint)
          } else {
            this.shape.dockers.last().setReferencePoint(this.currentReference.bounds.midPoint())
          }
        } else {
          this.shape.dockers.last().bounds.centerMoveTo(this.position)
        }
        this.sourceRefPos = this.shape.dockers.first().referencePoint
        this.targetRefPos = this.shape.dockers.last().referencePoint

        console.log(445, this.shape.dockers)
        let sourceCenterPoint = this.shape.dockers.first().getAbsoluteReferencePoint()
        let targetCenterPoint = this.shape.dockers.last().getAbsoluteReferencePoint()
        this.facade.handleEvents({
          type: 'add_edge_layout',
          node: this.currentReference,
          edge: this.shape,
          offset: {
            x: targetCenterPoint.x - sourceCenterPoint.x,
            y: targetCenterPoint.y - sourceCenterPoint.y,
          }
        })
      } else if (this.edge) {
        this.sourceRefPos = this.edge.dockers.first().referencePoint
        this.targetRefPos = this.edge.dockers.last().referencePoint
      }
    } else {
      var containedStencil = this.containedStencil
      var connectedShape = this.connectedShape
      var bc = connectedShape.bounds
      var bs = this.shape.bounds

      var pos = bc.center()
      if (containedStencil.defaultAlign() === 'north') {
        pos.y -= (bc.height() / 2) + this.UI_CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height() / 2)
      } else if (containedStencil.defaultAlign() === 'northeast') {
        pos.x += (bc.width() / 2) + this.UI_CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2)
        pos.y -= (bc.height() / 2) + this.UI_CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2)
      } else if (containedStencil.defaultAlign() === 'southeast') {
        pos.x += (bc.width() / 2) + this.UI_CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2)
        pos.y += (bc.height() / 2) + this.UI_CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2)
      } else if (containedStencil.defaultAlign() === 'south') {
        pos.y += (bc.height() / 2) + this.UI_CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height() / 2)
      } else if (containedStencil.defaultAlign() === 'southwest') {
        pos.x -= (bc.width() / 2) + this.UI_CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2)
        pos.y += (bc.height() / 2) + this.UI_CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2)
      } else if (containedStencil.defaultAlign() === 'west') {
        pos.x -= (bc.width() / 2) + this.UI_CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.width() / 2)
      } else if (containedStencil.defaultAlign() === 'northwest') {
        pos.x -= (bc.width() / 2) + this.UI_CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2)
        pos.y -= (bc.height() / 2) + this.UI_CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2)
      } else {
        pos.x += (bc.width() / 2) + this.UI_CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.width() / 2)
      }

      // Move shape to the new position
      this.shape.bounds.centerMoveTo(pos)

      // Move all dockers of a node to the position
      if (this.shape instanceof ORYX.Core.Node) {
        (this.shape.dockers || []).each(function (docker) {
          docker.bounds.centerMoveTo(pos)
        })
      }

      //this.shape.update();
      this.position = pos

      if (this.edge) {
        this.sourceRefPos = this.edge.dockers.first().referencePoint
        this.targetRefPos = this.edge.dockers.last().referencePoint
      }
    }

    this.facade.getCanvas().update()
    // this.facade.raiseEvent({ type: 'newshape_addin_canvas', shape: this.shape })
    this.facade.handleEvents({
      type: 'newshape_addin_canvas',
      shape: this.shape
    })
    this.facade.updateSelection()
  }

  rollback () {
    this.facade.deleteShape(this.shape)
    if (this.edge) {
      this.facade.deleteShape(this.edge)
    }
    // this.currentParent.update();
    this.facade.setSelection(this.facade.getSelection().without(this.shape, this.edge))
  }
}
