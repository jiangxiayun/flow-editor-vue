import ORYX from 'src/oryx'
import ORYX_Config from '../../oryx/CONFIG'

export default class DeleteCommand extends ORYX.Core.Command {
  constructor (clipboard, facade) {
    super()
    this.clipboard = clipboard
    this.shapesAsJson = clipboard.shapesAsJson
    this.facade = facade

    // Store dockers of deleted shapes to restore connections
    this.dockers = this.shapesAsJson.map(function (shapeAsJson) {
      let shape = shapeAsJson.getShape()
      let incomingDockers = shape.getIncomingShapes().map(function (s) {
        return s.getDockers().last()
      })
      let outgoingDockers = shape.getOutgoingShapes().map(function (s) {
        return s.getDockers().first()
      })
      let dockers = shape.getDockers().concat(incomingDockers, outgoingDockers).compact().map(function (docker) {
        return {
          object: docker,
          referencePoint: docker.referencePoint,
          dockedShape: docker.getDockedShape()
        }
      })
      return dockers
    }).flatten()
  }

  execute () {
    this.shapesAsJson.each(function (shapeAsJson) {
      // Delete shape
      this.facade.deleteShape(shapeAsJson.getShape())
    }.bind(this))

    this.facade.setSelection([])
    this.facade.getCanvas().update()
    this.facade.updateSelection()
    this.facade.handleEvents({ type: ORYX_Config.ACTION_DELETE_COMPLETED })

  }

  rollback () {
    this.shapesAsJson.each(function (shapeAsJson) {
      let shape = shapeAsJson.getShape()
      let parent = this.facade.getCanvas().getChildShapeByResourceId(shapeAsJson.parent.resourceId) || this.facade.getCanvas()
      parent.add(shape, shape.parentIndex)
    }.bind(this))

    //reconnect shapes
    this.dockers.each(function (d) {
      d.object.setDockedShape(d.dockedShape)
      console.log('setDockedShape')
      d.object.setReferencePoint(d.referencePoint)
    }.bind(this))

    this.facade.setSelection(this.selectedShapes)
    this.facade.getCanvas().update()
    this.facade.updateSelection()

  }
}
