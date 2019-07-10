import ORYX_Command from 'src/oryx/core/Command'

export default class DragVisualCommand extends ORYX_Command {
  constructor (visual, newPos, oldPos, facade) {
    super()
    this.visual = visual
    this.newPosition = newPos
    this.oldPosition = oldPos
    this.facade = facade
    this.startDock = visual.segmentStartDocker
    this.endDock = visual.segmentEndDocker
    this.shape = this.startDock.parent
  }
  execute () {
    this.dock(this.newPosition, this.visual.isStraightLine)
    this.removedDockers = this.shape.removeUnusedDockers()
    this.facade.updateSelection()
  }
  rollback () {
    this.dock(this.oldPosition, this.visual.isStraightLine);
    (this.removedDockers || []).each(function (d) {
      this.shape.add(d.value, Number(d.key))
      this.shape._update(true)
    }.bind(this))
    this.facade.updateSelection()
  }
  dock (pos, dir) {
    let a1 = this.startDock.bounds.center()
    let a2 = this.endDock.bounds.center()
    if (dir === 'ver') {
      this.startDock.bounds.centerMoveTo(pos, a1.y)
      this.endDock.bounds.centerMoveTo(pos, a2.y)
    } else {
      this.startDock.bounds.centerMoveTo(a1.x, pos)
      this.endDock.bounds.centerMoveTo(a2.x, pos)
    }
    this.facade.getCanvas().update()
  }
}
