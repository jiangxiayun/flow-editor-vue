import ORYX_Node from './Node'
import ORYX_Edge from './Edge'
import ORYX_Controls from './Controls'

/**
 * Implements a Command to move shapes
 *
 */

import Command from './Command'

export default class Move extends  Command {
  constructor (moveShapes, offset, parent, selectedShapes, plugin) {
    super()
    this.moveShapes = moveShapes
    this.selectedShapes = selectedShapes
    this.offset = offset
    this.plugin = plugin
    // Defines the old/new parents for the particular shape
    this.newParents = moveShapes.collect(function (t) {
      return parent || t.parent
    })
    this.oldParents = moveShapes.collect(function (shape) {
      return shape.parent
    })
    this.dockedNodes = moveShapes.findAll(function (shape) {
      return shape instanceof ORYX_Node && shape.dockers.length == 1
    }).collect(function (shape) {
      return {
        docker: shape.dockers[0],
        dockedShape: shape.dockers[0].getDockedShape(),
        refPoint: shape.dockers[0].referencePoint
      }
    })
  }
  execute () {
    this.dockAllShapes()
    // Moves by the offset
    this.move(this.offset)
    // Addes to the new parents
    this.addShapeToParent(this.newParents)
    // Set the selection to the current selection
    this.selectCurrentShapes()
    this.plugin.facade.getCanvas().update()
    this.plugin.facade.updateSelection()
  }
  rollback () {
    // Moves by the inverted offset
    let offset = { x: -this.offset.x, y: -this.offset.y }
    this.move(offset)
    // Addes to the old parents
    this.addShapeToParent(this.oldParents)
    this.dockAllShapes(true)

    // Set the selection to the current selection
    this.selectCurrentShapes()
    this.plugin.facade.getCanvas().update()
    this.plugin.facade.updateSelection()

  }
  move (offset, doLayout) {
    // Move all Shapes by these offset
    for (let i = 0; i < this.moveShapes.length; i++) {
      let value = this.moveShapes[i]
      value.bounds.moveBy(offset)

      if (value instanceof ORYX_Node) {
        (value.dockers || []).each(function (d) {
          d.bounds.moveBy(offset)
        })

        // Update all Dockers of Child shapes
        /*var childShapesNodes = value.getChildShapes(true).findAll(function(shape){ return shape instanceof ORYX.Core.Node });
         var childDockedShapes = childShapesNodes.collect(function(shape){ return shape.getAllDockedShapes() }).flatten().uniq();
         var childDockedEdge = childDockedShapes.findAll(function(shape){ return shape instanceof ORYX.Core.Edge });
         childDockedEdge = childDockedEdge.findAll(function(shape){ return shape.getAllDockedShapes().all(function(dsh){ return childShapesNodes.include(dsh) }) });
         var childDockedDockers = childDockedEdge.collect(function(shape){ return shape.dockers }).flatten();

         for (var j = 0; j < childDockedDockers.length; j++) {
         var docker = childDockedDockers[j];
         if (!docker.getDockedShape() && !this.moveShapes.include(docker)) {
         //docker.bounds.moveBy(offset);
         //docker.update();
         }
         }*/


        let allEdges = [].concat(value.getIncomingShapes())
          .concat(value.getOutgoingShapes())
          // Remove all edges which are included in the selection from the list
          .findAll(function (r) {
            return r instanceof ORYX_Edge && !this.moveShapes.any(function (d) {
              return d == r || (d instanceof ORYX_Controls.Docker && d.parent == r)
            })
          }.bind(this))
          // Remove all edges which are between the node and a node contained in the selection from the list
          .findAll(function (r) {
            return (r.dockers.first().getDockedShape() == value || !this.moveShapes.include(r.dockers.first().getDockedShape())) &&
              (r.dockers.last().getDockedShape() == value || !this.moveShapes.include(r.dockers.last().getDockedShape()))
          }.bind(this))

        // Layout all outgoing/incoming edges
        this.plugin.layoutEdges(value, allEdges, offset)


        let allSameEdges = [].concat(value.getIncomingShapes())
          .concat(value.getOutgoingShapes())
          // Remove all edges which are included in the selection from the list
          .findAll(function (r) {
            return r instanceof ORYX_Edge && r.dockers.first().isDocked() && r.dockers.last().isDocked() && !this.moveShapes.include(r) && !this.moveShapes.any(function (d) {
              return d == r || (d instanceof ORYX_Controls.Docker && d.parent == r)
            })
          }.bind(this))
          // Remove all edges which are included in the selection from the list
          .findAll(function (r) {
            return this.moveShapes.indexOf(r.dockers.first().getDockedShape()) > i || this.moveShapes.indexOf(r.dockers.last().getDockedShape()) > i
          }.bind(this))

        for (let j = 0; j < allSameEdges.length; j++) {
          for (let k = 1; k < allSameEdges[j].dockers.length - 1; k++) {
            let docker = allSameEdges[j].dockers[k]
            if (!docker.getDockedShape() && !this.moveShapes.include(docker)) {
              docker.bounds.moveBy(offset)
            }
          }
        }

        /*var i=-1;
         var nodes = value.getChildShapes(true);
         var allEdges = [];
         while(++i<nodes.length){
         var edges = [].concat(nodes[i].getIncomingShapes())
         .concat(nodes[i].getOutgoingShapes())
         // Remove all edges which are included in the selection from the list
         .findAll(function(r){ return r instanceof ORYX.Core.Edge && !allEdges.include(r) && r.dockers.any(function(d){ return !value.bounds.isIncluded(d.bounds.center)})})
         allEdges = allEdges.concat(edges);
         if (edges.length <= 0){ continue }
         //this.plugin.layoutEdges(nodes[i], edges, offset);
         }*/
      }
    }

  }
  dockAllShapes (shouldDocked) {
    // Undock all Nodes
    for (let i = 0; i < this.dockedNodes.length; i++) {
      let docker = this.dockedNodes[i].docker

      docker.setDockedShape(shouldDocked ? this.dockedNodes[i].dockedShape : undefined)
      if (docker.getDockedShape()) {
        docker.setReferencePoint(this.dockedNodes[i].refPoint)
        //docker.update();
      }
    }
  }
  addShapeToParent (parents) {

    // For every Shape, add this and reset the position
    for (let i = 0; i < this.moveShapes.length; i++) {
      let currentShape = this.moveShapes[i]
      if (currentShape instanceof ORYX_Node &&
        currentShape.parent !== parents[i]) {

        // Calc the new position
        let unul = parents[i].absoluteXY()
        let csul = currentShape.absoluteXY()
        let x = csul.x - unul.x
        let y = csul.y - unul.y

        // Add the shape to the new contained shape
        parents[i].add(currentShape)
        // Add all attached shapes as well
        currentShape.getOutgoingShapes((function (shape) {
          if (shape instanceof ORYX_Node && !this.moveShapes.member(shape)) {
            parents[i].add(shape)
          }
        }).bind(this))

        // Set the new position
        if (currentShape instanceof ORYX_Node && currentShape.dockers.length == 1) {
          let b = currentShape.bounds
          x += b.width() / 2
          y += b.height() / 2
          currentShape.dockers.first().bounds.centerMoveTo(x, y)
        } else {
          currentShape.bounds.moveTo(x, y)
        }

      }

      // Update the shape
      //currentShape.update();

    }
  }
  selectCurrentShapes () {
    this.plugin.facade.setSelection(this.selectedShapes)
  }
}