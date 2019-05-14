import ORYX_Config from '../CONFIG'

import ORYX_Command from '../core/Command'
import ORYX_Controls from '../core/Controls/index'
import ORYX_Edge from '../core/Edge'

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
    if (!options.edge)
      return

    class commandClass extends ORYX_Command{
      constructor(addEnabled, deleteEnabled, edge, docker, pos, facade) {
        super()
        this.addEnabled = addEnabled
        this.deleteEnabled = deleteEnabled
        this.edge = edge
        this.docker = docker
        this.pos = pos
        this.facade = facade
      }
      execute() {
        if (this.addEnabled) {
          if (!this.docker) {
            this.docker = this.edge.addDocker(this.pos)
            this.index = this.edge.dockers.indexOf(this.docker)
          } else {
            this.edge.add(this.docker, this.index)
          }
        }
        else if (this.deleteEnabled) {
          this.index = this.edge.dockers.indexOf(this.docker)
          this.pos = this.docker.bounds.center()
          this.edge.removeDocker(this.docker)
        }
        this.edge.getLabels().invoke('show')
        this.facade.getCanvas().update()
        this.facade.updateSelection()
      }
      rollback () {
        if (this.addEnabled) {
          if (this.docker instanceof ORYX_Controls.Docker) {
            this.edge.removeDocker(this.docker)
          }
        } else if (this.deleteEnabled) {
          this.edge.add(this.docker, this.index)
        }
        this.edge.getLabels().invoke('show')
        this.facade.getCanvas().update()
        this.facade.updateSelection()
      }
    }

    let command = new commandClass(this.enabledAdd(), this.enabledRemove(), options.edge, options.docker, options.position, this.facade)

    this.facade.executeCommands([command])
  }
}
