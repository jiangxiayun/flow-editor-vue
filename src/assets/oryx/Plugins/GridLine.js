import ORYX_Utils from '../Utils'

export default class GridLine {
  DIR_HORIZONTAL = 'hor'
  DIR_VERTICAL = 'ver'

  constructor (parentId, direction) {
    if (this.DIR_HORIZONTAL !== direction && this.DIR_VERTICAL !== direction) {
      direction = this.DIR_HORIZONTAL
    }

    this.parent = $(parentId)
    this.direction = direction
    this.node = ORYX_Utils.graft('http://www.w3.org/2000/svg', this.parent,
      ['g'])

    this.line = ORYX_Utils.graft('http://www.w3.org/2000/svg', this.node,
      ['path', {
        'stroke-width': 1, stroke: 'silver', fill: 'none',
        'stroke-dasharray': '5,5',
        'pointer-events': 'none'
      }])

    this.hide()
  }

  hide () {
    this.node.setAttributeNS(null, 'display', 'none')
  }

  show () {
    this.node.setAttributeNS(null, 'display', '')
  }

  getScale () {
    try {
      return this.parent.parentNode.transform.baseVal.getItem(0).matrix.a
    } catch (e) {
      return 1
    }
  }

  update (pos) {
    if (this.direction === this.DIR_HORIZONTAL) {
      let y = pos instanceof Object ? pos.y : pos
      let cWidth = this.parent.parentNode.parentNode.width.baseVal.value / this.getScale()
      this.line.setAttributeNS(null, 'd', 'M 0 ' + y + ' L ' + cWidth + ' ' + y)
    } else {
      let x = pos instanceof Object ? pos.x : pos
      let cHeight = this.parent.parentNode.parentNode.height.baseVal.value / this.getScale()
      this.line.setAttributeNS(null, 'd', 'M' + x + ' 0 L ' + x + ' ' + cHeight)
    }
    this.show()
  }


}
