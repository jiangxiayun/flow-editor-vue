
export default class SelectedRect {

  constructor(parentId) {

    this.parentId = parentId;

    this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", $(parentId),
      ['g']);

    this.dashedArea = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node,
      ['rect', {
        x: 0, y: 0,
        'stroke-width': 1, stroke: '#777777', fill: 'none',
        'stroke-dasharray': '2,2',
        'pointer-events': 'none'
      }]);

    this.hide();

  }

  hide () {
    this.node.setAttributeNS(null, 'display', 'none');
  }

  show () {
    this.node.setAttributeNS(null, 'display', '');
  }

  resize(bounds) {
    var upL = bounds.upperLeft();
    var padding = ORYX.CONFIG.SELECTED_AREA_PADDING;

    this.dashedArea.setAttributeNS(null, 'width', bounds.width() + 2 * padding);
    this.dashedArea.setAttributeNS(null, 'height', bounds.height() + 2 * padding);
    this.node.setAttributeNS(null, 'transform', "translate(" + (upL.x - padding) + ", " + (upL.y - padding) + ")");
  }

}