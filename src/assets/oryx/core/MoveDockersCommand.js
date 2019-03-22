/**
 * Implements a command to move docker by an offset.
 *
 * @class ORYX.Core.MoveDockersCommand
 * @param {Object} object An object with the docker id as key and docker and offset as object value
 *
 */

import Command from './Command'

export default class MoveDockersCommand extends Command {
  constructor (dockers) {
    super()
    this.dockers = new Hash(dockers)
    this.edges = new Hash()
  }

  execute () {
    if (this.changes) {
      this.executeAgain()
      return
    } else {
      this.changes = new Hash()
    }

    this.dockers.values().each(function (docker) {
      var edge = docker.docker.parent
      if (!edge) {
        return
      }

      if (!this.changes.get(edge.getId())) {
        this.changes.set(edge.getId(), {
          edge: edge,
          oldDockerPositions: edge.dockers.map(function (r) {
            return r.bounds.center()
          })
        })
      }
      docker.docker.bounds.moveBy(docker.offset)
      this.edges.set(edge.getId(), edge)
      docker.docker.update()
    }.bind(this))
    this.edges.each(function (edge) {
      this.updateEdge(edge.value)
      if (this.changes[edge.value.getId()])
        this.changes[edge.value.getId()].dockerPositions = edge.value.dockers.map(function (r) {
          return r.bounds.center()
        })
    }.bind(this))
  }

  updateEdge (edge) {
    edge._update(true);
    [edge.getOutgoingShapes(), edge.getIncomingShapes()].flatten().invoke('_update', [true])
  }

  executeAgain () {
    this.changes.values().each(function (change) {
      // Reset the dockers
      this.removeAllDocker(change.edge)
      change.dockerPositions.each(function (pos, i) {
        if (i == 0 || i == change.dockerPositions.length - 1) {
          return
        }
        var docker = change.edge.createDocker(undefined, pos)
        docker.bounds.centerMoveTo(pos)
        docker.update()
      }.bind(this))
      this.updateEdge(change.edge)
    }.bind(this))
  }

  rollback () {
    this.changes.values().each(function (change) {
      // Reset the dockers
      this.removeAllDocker(change.edge)
      change.oldDockerPositions.each(function (pos, i) {
        if (i == 0 || i == change.oldDockerPositions.length - 1) {
          return
        }
        var docker = change.edge.createDocker(undefined, pos)
        docker.bounds.centerMoveTo(pos)
        docker.update()
      }.bind(this))
      this.updateEdge(change.edge)
    }.bind(this))
  }

  removeAllDocker (edge) {
    edge.dockers.slice(1, edge.dockers.length - 1).each(function (docker) {
      edge.removeDocker(docker)
    })
  }
}