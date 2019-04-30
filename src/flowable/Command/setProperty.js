import ORYX from 'src/oryx'

export default class SetProperty extends ORYX.Core.Command {
  constructor (key, oldValue, newValue, shape, facade) {
    super()
    this.key = key
    this.oldValue = oldValue
    this.newValue = newValue
    this.shape = shape
    this.facade = facade
  }
  execute () {
    this.shape.setProperty(this.key, this.newValue)
    this.facade.getCanvas().update()
    this.facade.updateSelection()
  }
  rollback () {
    this.shape.setProperty(this.key, this.oldValue)
    this.facade.getCanvas().update()
    this.facade.updateSelection()
  }
}
