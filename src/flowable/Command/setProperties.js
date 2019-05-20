import ORYX from 'src/oryx'

export default class setProperties extends ORYX.Core.Command {
  constructor (values, shape, facade) {
    super()
    this.values = values
    this.shape = shape
    this.facade = facade
  }
  execute () {
    this.values.map(item => {
      let { key, newValue } = item
      this.shape.setProperty(key, newValue)
    })

    this.facade.getCanvas().update()
    this.facade.updateSelection()
  }
  rollback () {
    this.values.map(item => {
      let { key, oldValue } = item
      this.shape.setProperty(key, oldValue)
    })
    this.facade.getCanvas().update()
    this.facade.updateSelection()
  }
}
