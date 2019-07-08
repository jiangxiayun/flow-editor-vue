import ORYX_Command from 'src/oryx/core/Command'

export default class layoutEdgesCommand extends ORYX_Command {
  constructor (edges, node, offset, plugin) {
    console.log(233, node)
    super()
    this.edges = edges
    this.node = node
    this.plugin = plugin
    this.offset = offset

    // Get the new absolute center
    let center = node.absoluteXY()
    this.ulo = { x: center.x - offset.x, y: center.y - offset.y }
  }

  execute () {
    if (this.changes) {
      this.executeAgain()
      return
    } else {
      this.changes = []
      this.edges.each(function (edge) {
        this.changes.push({
          edge: edge,
          oldDockerPositions: edge.dockers.map(function (r) {
            return r.bounds.center()
          })
        })
      }.bind(this))
    }

    // Find all edges, which are related to the node and have more than two dockers
    this.edges
    // Find all edges with more than two dockers
      .findAll(function (r) {
        return r.dockers.length > 2
      }.bind(this))
      //  对每条边检测其第二个和倒数第二个 docker，如果在同一水平/垂直线上，则对齐 bounds
      .each((edge) => {
        let firstDockedShape = edge.dockers.first().getDockedShape()
        let lastDockedShape = edge.dockers.last().getDockedShape()
        if (firstDockedShape === this.node) {
          const second = edge.dockers[1]
          if (this.align(second.bounds, edge.dockers.first())) {
            second.update()
          }
        } else if (lastDockedShape === this.node) {
          const beforeLast = edge.dockers[edge.dockers.length - 2]
          if (this.align(beforeLast.bounds, edge.dockers.last())) {
            beforeLast.update()
          }
        }
        edge._update(true)
        edge.removeUnusedDockers()
        if (this.plugin.edgeLayoutByDragDocker) {
          console.log('edgeLayoutByDragDocker')
          this.plugin.doLayout(edge)
          return
        }
        if (edge.isBoundsIncluded(firstDockedShape.bounds)
          || edge.isBoundsIncluded(lastDockedShape.bounds)) {
          console.log('BoundsIncluded')
          this.plugin.doLayout(edge)
          return
        }
        if (this.isBendPointIncluded(edge)) {
          console.log('BendPointIncluded')
          this.plugin.doLayout(edge)
          return
        }
      })


    // Find all edges, which have only to dockers
    // and is located horizontal/vertical.
    // Do layout with those edges
    this.edges
    // Find all edges with exactly two dockers
      .each(function (edge) {
        if (edge.dockers.length === 2) {
          this.plugin.doLayout(edge)

          // const p1 = edge.dockers.first().getAbsoluteReferencePoint() || edge.dockers.first().bounds.center()
          // const p2 = edge.dockers.last().getAbsoluteReferencePoint() || edge.dockers.first().bounds.center()
          // // Find all horizontal/vertical edges
          // if (Math.abs(-Math.abs(p1.x - p2.x) + Math.abs(this.offset.x)) < 2
          //   || Math.abs(-Math.abs(p1.y - p2.y) + Math.abs(this.offset.y)) < 2) {
          //   console.log(888)
          //   this.plugin.doLayout(edge)
          // }
        }
      }.bind(this))

    this.edges.each(function (edge, i) {
      this.changes[i].dockerPositions = edge.dockers.map(function (r) {
        return r.bounds.center()
      })
    }.bind(this))

  }

  /**
   * Align the bounds if the center is
   * the same than the old center
   * @params {Object} bounds
   * @params {Object} bounds2
   */
  align (bounds, refDocker) {
    let abRef = refDocker.getAbsoluteReferencePoint() || refDocker.bounds.center()
    let xdif = bounds.center().x - abRef.x
    let ydif = bounds.center().y - abRef.y
    if (Math.abs(-Math.abs(xdif) + Math.abs(this.offset.x)) < 3 && this.offset.xs === undefined) {
      bounds.moveBy({ x: -xdif, y: 0 })
    }
    if (Math.abs(-Math.abs(ydif) + Math.abs(this.offset.y)) < 3 && this.offset.ys === undefined) {
      bounds.moveBy({ y: -ydif, x: 0 })
    }

    if (this.offset.xs !== undefined || this.offset.ys !== undefined) {
      let absPXY = refDocker.getDockedShape().absoluteXY()
      xdif = bounds.center().x - (absPXY.x + ((abRef.x - absPXY.x) / this.offset.xs))
      ydif = bounds.center().y - (absPXY.y + ((abRef.y - absPXY.y) / this.offset.ys))

      if (Math.abs(-Math.abs(xdif) + Math.abs(this.offset.x)) < 3) {
        bounds.moveBy({ x: -(bounds.center().x - abRef.x), y: 0 })
      }

      if (Math.abs(-Math.abs(ydif) + Math.abs(this.offset.y)) < 3) {
        bounds.moveBy({ y: -(bounds.center().y - abRef.y), x: 0 })
      }
    }
  }

  /**
   * Returns a TRUE if there are bend point which overlay the shape
   * 如果存在覆盖形状的折弯点，则返回true。
   */
  isBendPointIncluded (edge) {
    // Get absolute bounds
    let ab = edge.dockers.first().getDockedShape()
    let bb = edge.dockers.last().getDockedShape()

    if (ab) {
      ab = ab.absoluteBounds()
      ab.widen(5)
    }

    if (bb) {
      bb = bb.absoluteBounds()
      bb.widen(20) // Wide with 20 because of the arrow from the edge
    }

    return edge.dockers.any(function (docker, i) {
      let c = docker.bounds.center()
      // Dont count first and last
      if (i !== 0 && i !== edge.dockers.length - 1) {
        // Check if the point is included to the absolute bounds
        return ((ab && ab.isIncluded(c)) || (bb && bb.isIncluded(c)))
      }
      return false

      // return i !== 0 && i !== edge.dockers.length - 1 &&
      //   // Check if the point is included to the absolute bounds
      //   ((ab && ab.isIncluded(c)) || (bb && bb.isIncluded(c)))
    })
  }

  removeAllDocker (edge) {
    edge.dockers.slice(1, edge.dockers.length - 1).each(function (docker) {
      edge.removeDocker(docker)
    })
  }

  executeAgain () {
    this.changes.each(function (change) {
      // Reset the dockers
      this.removeAllDocker(change.edge)
      change.dockerPositions.each(function (pos, i) {
        if (i === 0 || i === change.dockerPositions.length - 1) {
          return
        }
        let docker = change.edge.createDocker(undefined, pos)
        docker.bounds.centerMoveTo(pos)
        docker.update()
      }.bind(this))
      change.edge._update(true)
    }.bind(this))
  }

  rollback () {
    this.changes.each(function (change) {
      // Reset the dockers
      this.removeAllDocker(change.edge)
      change.oldDockerPositions.each(function (pos, i) {
        if (i === 0 || i === change.oldDockerPositions.length - 1) {
          return
        }
        let docker = change.edge.createDocker(undefined, pos)
        docker.bounds.centerMoveTo(pos)
        docker.update()
      }.bind(this))
      change.edge._update(true)
    }.bind(this))
  }
}
