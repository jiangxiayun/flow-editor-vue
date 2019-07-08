import ORYX_Config from '../CONFIG'
import ORYX_Controls from '../core/Controls/index'
import ORYX_Edge from '../core/Edge'
import AddAndRemoveDockerCommand from '../../flowable/Command/AddAndRemoveDockerCommand'

export default class AddDocker {

  /**
   *  Constructor
   *  @param {Object} Facade: The Facade of the Editor
   */
  constructor (facade) {
    this.facade = facade
    this.enableAdd = false
    this.enableRemove = false

    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this))
  }

  setEnableAdd (enable) {
    this.enableAdd = enable

    if (this.enableAdd) {
      jQuery('#add-bendpoint-button').addClass('pressed')
    } else {
      jQuery('#add-bendpoint-button').removeClass('pressed')
      jQuery('#add-bendpoint-button').blur()
    }
  }

  setEnableRemove (enable) {
    this.enableRemove = enable

    if (this.enableRemove) {
      jQuery('#remove-bendpoint-button').addClass('pressed')
    } else {
      jQuery('#remove-bendpoint-button').removeClass('pressed')
      jQuery('#remove-bendpoint-button').blur()
    }
  }

  enabledAdd (enable) {
    return this.enableAdd
  }

  enabledRemove () {
    return this.enableRemove
  }

  /**
   * MouseDown Handler
   *
   */
  handleMouseDown (event, uiObj) {
    if (this.enabledAdd() && uiObj instanceof ORYX_Edge) {
      this.newDockerCommand({
        edge: uiObj,
        position: this.facade.eventCoordinates(event)
      })
      this.setEnableAdd(false)
    } else if (this.enabledRemove() &&
      uiObj instanceof ORYX_Controls.Docker &&
      uiObj.parent instanceof ORYX_Edge) {
      this.newDockerCommand({
        edge: uiObj.parent,
        docker: uiObj
      })
      this.setEnableRemove(false)
    }
    document.body.style.cursor = 'default'
  }

  // Options: edge (required), position (required if add), docker (required if delete)
  newDockerCommand (options) {
    if (!options.edge) {
      return
    }

    let command = new AddAndRemoveDockerCommand(
      this.enabledAdd(),
      this.enabledRemove(),
      options.edge,
      options.docker,
      options.position,
      this.facade)

    this.facade.executeCommands([command])
  }
}
