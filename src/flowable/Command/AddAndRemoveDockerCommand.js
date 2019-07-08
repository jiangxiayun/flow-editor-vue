import ORYX_Command from 'src/oryx/core/Command'
import ORYX_Controls from '../../oryx/core/Controls'

export default class AddAndRemoveDockerCommand extends ORYX_Command {
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
    } else if (this.deleteEnabled) {
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
