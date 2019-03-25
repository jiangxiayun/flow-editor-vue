import Control from './Control'
import ORYX_Utils from '../../Utils'

/**
 * @classDescription Represents a magnet that is part of another shape and can
 * be attached to dockers. Magnets are used for linking edge objects
 * to other Shape objects.
 * @extends {Control}
 */
export default class Magnet extends Control {
  constructor() {
    // arguments.callee.$.construct.apply(this, arguments)
    super()
    //this.anchors = [];
    this.anchorLeft = null
    this.anchorRight = null
    this.anchorTop = null
    this.anchorBottom = null

    this.bounds.set(0, 0, 16, 16)

    // graft magnet's root node into owner's control group.
    this.node = ORYX_Utils.graft('http://www.w3.org/2000/svg',
      null,
      ['g', { 'pointer-events': 'all' },
        ['circle', { cx: '8', cy: '8', r: '4', stroke: 'none', fill: 'red', 'fill-opacity': '0.3' }]
      ])

    this.hide()
  }
  update() {
    // arguments.callee.$.update.apply(this, arguments)
    super.update()
    //this.isChanged = true;
  }
  _update() {
    // arguments.callee.$.update.apply(this, arguments)
    super.update()
    //this.isChanged = true;
  }
  refresh () {
    // arguments.callee.$.refresh.apply(this, arguments)
    super.refresh()
    let p = this.bounds.upperLeft()
    /*if(this.parent) {
     var parentPos = this.parent.bounds.upperLeft();
     p.x += parentPos.x;
     p.y += parentPos.y;
     }*/

    this.node.setAttributeNS(null, 'transform', 'translate(' + p.x + ', ' + p.y + ')')
  }
  show () {
    //this.refresh();
    // arguments.callee.$.show.apply(this, arguments)
    super.show()
  }
  toString() {
    return 'Magnet ' + this.id
  }
}