import ORYX_Command from 'src/oryx/core/Command'

// Command-Pattern for dragging one docker
export default class DragDockerCommand extends ORYX_Command {
  constructor (docker, newPos, oldPos, newDockedShape, oldDockedShape, facade) {
    super()
    this.docker = docker
    this.index = docker.parent.dockers.indexOf(docker)
    this.newPosition = newPos
    this.newDockedShape = newDockedShape
    this.oldPosition = oldPos
    this.oldDockedShape = oldDockedShape
    this.facade = facade
    this.index = docker.parent.dockers.indexOf(docker)
    this.shape = docker.parent
  }
  execute () {
    if (!this.docker.parent) {
      this.docker = this.shape.dockers[this.index]
    }
    this.dock(this.newDockedShape, this.newPosition)
    this.removedDockers = this.shape.removeUnusedDockers()
    this.facade.updateSelection()
  }
  rollback () {
    this.dock(this.oldDockedShape, this.oldPosition);
    (this.removedDockers || []).each(function (d) {
      this.shape.add(d.value, Number(d.key))
      this.shape._update(true)
    }.bind(this))
    this.facade.updateSelection()
  }
  dock (toDockShape, pos) {
    // Set the Docker to the new Shape
    this.docker.setDockedShape(undefined)
    if (toDockShape) {
      this.docker.setDockedShape(toDockShape)
      this.docker.setReferencePoint(pos)
      // this.docker.update();
      // this.docker.parent._update();
    } else {
      this.docker.bounds.centerMoveTo(pos)
    }
    this.facade.getCanvas().update()
  }
}
