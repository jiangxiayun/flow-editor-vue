import ORYX from 'src/oryx'

export default class CommandClass extends ORYX.Core.Command {
  constructor (option, dockedShape, canAttach, position, facade) {
    super()
    this.option = option
    this.docker = null
    this.dockedShape = dockedShape
    this.dockedShapeParent = dockedShape.parent || facade.getCanvas()
    this.position = position
    this.facade = facade
    this.selection = this.facade.getSelection()
    this.shape = null
    this.parent = null
    this.canAttach = canAttach
  }

  execute () {
    if (!this.shape) {
      this.shape = this.facade.createShape(this.option)
      this.parent = this.shape.parent
      this.facade.handleEvents({
        type: 'newshape_addin_canvas',
        shape: this.shape
      })
    } else if (this.parent) {
      this.parent.add(this.shape)
    }

    if (this.canAttach && this.shape.dockers && this.shape.dockers.length) {
      this.docker = this.shape.dockers[0]

      this.dockedShapeParent.add(this.docker.parent)

      // Set the Docker to the new Shape
      this.docker.setDockedShape(undefined)
      this.docker.bounds.centerMoveTo(this.position)
      if (this.dockedShape !== this.facade.getCanvas()) {
        this.docker.setDockedShape(this.dockedShape)
      }
      this.facade.setSelection([this.docker.parent])
    }

    this.facade.getCanvas().update()
    this.facade.updateSelection()

  }

  rollback () {
    if (this.shape) {
      this.facade.setSelection(this.selection.without(this.shape))
      this.facade.deleteShape(this.shape)
    }
    if (this.canAttach && this.docker) {
      this.docker.setDockedShape(undefined)
    }
    this.facade.getCanvas().update()
    this.facade.updateSelection()

  }
}

