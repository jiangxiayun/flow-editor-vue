import ORYX_Command from 'src/oryx/core/Command'

export default class DragVisualCommand extends ORYX_Command {
  constructor (visual, newPos, oldPos, facade) {
    super()
    this.visual = visual
    this.newPosition = newPos
    this.oldPosition = oldPos
    this.facade = facade
    this.shape = visual.parent
  }
  execute () {
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
  dock (startDock, endDock, pos, dir) {
    if (dir === 'ver') {
      this.startDock.bounds.moveBy(pos, 0)
      this.endDock.bounds.moveBy(pos, 0)
    } else {
      this.startDock.bounds.moveBy(0, pos)
      this.endDock.bounds.moveBy(0, pos)
    }
    this.facade.getCanvas().update()
  }
}
