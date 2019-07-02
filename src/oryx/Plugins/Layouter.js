/**
 * Edge layouter is an implementation to layout an edge
 * @class ORYX.Plugins.Layouter.EdgeLayouter
 */

import AbstractLayouter from './AbstractLayouter'
import ORYX_Edge from '../core/Edge'
import ORYX_Config from '../CONFIG'

class EdgeLayouter extends AbstractLayouter {
  /**
   * Layout only Edges
   */
  layouted = ['http://b3mn.org/stencilset/bpmn1.1#SequenceFlow',
    'http://b3mn.org/stencilset/bpmn1.1#MessageFlow',
    'http://b3mn.org/stencilset/timjpdl3#SequenceFlow',
    'http://b3mn.org/stencilset/jbpm4#SequenceFlow',
    'http://b3mn.org/stencilset/bpmn2.0#MessageFlow',
    'http://b3mn.org/stencilset/bpmn2.0#SequenceFlow',
    'http://b3mn.org/stencilset/bpmn2.0choreography#MessageFlow',
    'http://b3mn.org/stencilset/bpmn2.0choreography#SequenceFlow',
    'http://b3mn.org/stencilset/bpmn2.0conversation#ConversationLink',
    'http://b3mn.org/stencilset/epc#ControlFlow',
    'http://www.signavio.com/stencilsets/processmap#ProcessLink',
    'http://www.signavio.com/stencilsets/organigram#connection']

  constructor (facade) {
    super(facade)
    this.facade.registerOnEvent('add_edge_layout', this.doAddEdgeLayout.bind(this))
  }

  doAddEdgeLayout ({node, edge, offset}) {
    this.layoutEdges(node, [edge], offset)
  }
  /**
   * Layout a set on edges
   * @param {Object} edges
   */
  layout (edges) {
    edges.each((edge) => {
      this.doLayout(edge)
    })
  }

  /**
   * Layout one edge
   * @param {Object} edge
   */
  doLayout (edge) {
    // Get from and to node
    let from = edge.getIncomingNodes()[0]
    let to = edge.getOutgoingNodes()[0]

    // Return if one is null
    if (!from || !to) return

    let positions = this.getPositions(from, to, edge)
    if (positions.length > 0) {
      this.setDockers(edge, positions[0].a, positions[0].b)
    }
  }

  /**
   * Returns a set on positions which are not containt either
   * in the bounds in from or to.
   * @param {Object} from Shape where the edge is come from
   * @param {Object} to Shape where the edge is leading to
   * @param {Object} edge Edge between from and to
   */
  getPositions (from, to, edge) {
    // Get absolute bounds
    let ab = from.absoluteBounds()
    let bb = to.absoluteBounds()

    // Get center from and to
    let a = ab.center()
    let b = bb.center()

    let am = ab.midPoint()
    let bm = bb.midPoint()

    // Get first and last reference point
    let first = Object.clone(edge.dockers.first().referencePoint)
    let last = Object.clone(edge.dockers.last().referencePoint)
    // Get the absolute one
    let aFirst = edge.dockers.first().getAbsoluteReferencePoint()
    let aLast = edge.dockers.last().getAbsoluteReferencePoint()

    // IF ------>
    // or  |
    //     V
    // Do nothing
    if (Math.abs(aFirst.x - aLast.x) < 1 || Math.abs(aFirst.y - aLast.y) < 1) {
      return []
    }

    // Calc center position, between a and b
    // depending on there weight
    let m = {}
    let abWidth = ab.width()
    let abHeight = ab.height()
    let abUpLX = ab.a.x
    let abUpLY = ab.a.y
    let abDownRX = ab.b.x
    let abDownRY = ab.b.y

    let bbWidth =  bb.width()
    let bbHeight =  bb.height()
    let bbUpLX = bb.a.x
    let bbUpLY = bb.a.y
    let bbDownRX = bb.b.x
    let bbDownRY = bb.b.y

    // m 的坐标为2个节点距离的中间点
    m.x = a.x < b.x ? ((abDownRX + bbUpLX) / 2) : ((bbDownRX + abUpLX) / 2)
    m.y = a.y < b.y ? ((abDownRY + bbUpLY) / 2) : ((bbDownRY + abUpLY) / 2)

    // Enlarge both bounds with 10
    // ab.widen(5) // Wide the from less than
    // bb.widen(20) // the to because of the arrow from the edge

    let positions = []
    let off = this.getOffset.bind(this)

    // Checks ----+
    //            |
    //            V
    if (!ab.isIncluded(b.x, a.y) && !bb.isIncluded(b.x, a.y)) {
      positions.push({
        a: { x: b.x + off(last, bm, 'x'), y: a.y + off(first, am, 'y') },
        z: this.getWeight(from, a.x < b.x ? 'r' : 'l', to, a.y < b.y ? 't' : 'b', edge)
      })
    }

    // Checks |
    //        +--->
    if (!ab.isIncluded(a.x, b.y) && !bb.isIncluded(a.x, b.y)) {
      positions.push({
        a: { x: a.x + off(first, am, 'x'), y: b.y + off(last, bm, 'y') },
        z: this.getWeight(from, a.y < b.y ? 'b' : 't', to, a.x < b.x ? 'l' : 'r', edge)
      })
    }

    // Checks  --+
    //           |
    //           +--->
    if (!ab.isIncluded(m.x, a.y) && !bb.isIncluded(m.x, b.y)) {
      positions.push({
        a: { x: m.x, y: a.y + off(first, am, 'y') },
        b: { x: m.x, y: b.y + off(last, bm, 'y') },
        z: this.getWeight(from, 'r', to, 'l', edge, a.x > b.x)
      })
    }

    // Checks |
    //        +---+
    //            |
    //            V
    if (!ab.isIncluded(a.x, m.y) && !bb.isIncluded(b.x, m.y)) {
      positions.push({
        a: { x: a.x + off(first, am, 'x'), y: m.y },
        b: { x: b.x + off(last, bm, 'x'), y: m.y },
        z: this.getWeight(from, 'b', to, 't', edge, a.y > b.y)
      })
    }

    // Sort DESC of weights
    return positions.sort(function (a, b) {
      return a.z < b.z ? 1 : (a.z === b.z ? -1 : -1)
    })
  }

  /**
   * Returns a offset for the pos to the center of the bounds
   *
   * @param {Object} val
   * @param {Object} pos2
   * @param {String} dir Direction x|y
   */
  getOffset (pos, pos2, dir) {
    return pos[dir] - pos2[dir]
  }

  /**
   * Returns a value which shows the weight for this configuration
   *
   * @param {Object} from Shape which is coming from
   * @param {String} d1 Direction where is goes
   * @param {Object} to Shape which goes to
   * @param {String} d2 Direction where it comes to
   * @param {Object} edge Edge between from and to
   * @param {Boolean} reverse Reverse the direction (e.g. "r" -> "l")
   */
  getWeight (from, d1, to, d2, edge, reverse) {
    d1 = (d1 || '').toLowerCase()
    d2 = (d2 || '').toLowerCase()

    if (!['t', 'r', 'b', 'l'].include(d1)) {
      d1 = 'r'
    }
    if (!['t', 'r', 'b', 'l'].include(d2)) {
      d1 = 'l'
    }

    // If reverse is set
    if (reverse) {
      // Reverse d1 and d2
      d1 = d1 === 't' ? 'b' : (d1 === 'r' ? 'l' : (d1 === 'b' ? 't' : (d1 === 'l' ? 'r' : 'r')))
      d2 = d2 === 't' ? 'b' : (d2 === 'r' ? 'l' : (d2 === 'b' ? 't' : (d2 === 'l' ? 'r' : 'r')))
    }

    // Get rules for from "out" and to "in"
    let dr1 = this.facade.getRules().getLayoutingRules(from, edge)['out']
    let dr2 = this.facade.getRules().getLayoutingRules(to, edge)['in']

    let fromWeight = dr1[d1]
    let toWeight = dr2[d2]

    /**
     * Return a true if the center 1 is in the same direction than center 2
     * @param {Object} direction
     * @param {Object} center1
     * @param {Object} center2
     */
    let sameDirection = function (direction, center1, center2) {
      switch (direction) {
        case 't':
          return Math.abs(center1.x - center2.x) < 2 && center1.y < center2.y
        case 'r':
          return center1.x > center2.x && Math.abs(center1.y - center2.y) < 2
        case 'b':
          return Math.abs(center1.x - center2.x) < 2 && center1.y > center2.y
        case 'l':
          return center1.x < center2.x && Math.abs(center1.y - center2.y) < 2
        default:
          return false
      }
    }

    // Check if there are same incoming edges from 'from'
    let sameIncomingFrom = from
      .getIncomingShapes()
      .findAll(function (a) {
        return a instanceof ORYX_Edge
      })
      .any(function (e) {
        return sameDirection(d1, e.dockers[e.dockers.length - 2].bounds.center(), e.dockers.last().bounds.center())
      })

    // Check if there are same outgoing edges from 'to'
    let sameOutgoingTo = to
      .getOutgoingShapes()
      .findAll(function (a) {
        return a instanceof ORYX_Edge
      })
      .any(function (e) {
        return sameDirection(d2, e.dockers[1].bounds.center(), e.dockers.first().bounds.center())
      })

    // If there are equivalent edges, set 0
    // fromWeight = sameIncomingFrom ? 0 : fromWeight;
    // toWeight = sameOutgoingTo ? 0 : toWeight;

    // Get the sum of "out" and the direction plus "in" and the direction
    return (sameIncomingFrom || sameOutgoingTo ? 0 : fromWeight + toWeight)
  }

  /**
   * Removes all current dockers from the node
   * (except the start and end) and adds two new
   * dockers, on the position a and b.
   * @param {Object} edge
   * @param {Object} a
   * @param {Object} b
   */
  setDockers (edge, a, b) {
    if (!edge) return

    // Remove all dockers (implicit,start and end dockers will not removed)
    edge.dockers.each(function (r) {
      edge.removeDocker(r)
    });

    // For a and b (if exists), create
    // a new docker and set position
    [a, b].compact().each(function (pos) {
      let docker = edge.createDocker(undefined, pos)
      docker.bounds.centerMoveTo(pos)
    })

    // Update all dockers from the edge
    edge.dockers.each(function (docker) {
      docker.update()
    })

    // Update edge
    // edge.refresh();
    edge._update(true)
  }
}

const Layouter = {
  EdgeLayouter: EdgeLayouter
}
export default Layouter

