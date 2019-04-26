import ORYX_Config from '../CONFIG'

export default class HighlightingSelectedShapes {
  constructor(facade) {
    this.facade = facade;
    this.opacityFull = 0.9;
    this.opacityLow = 0.4;

    // Register on Dragging-Events for show/hide of ShapeMenu
    //this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_START, this.hide.bind(this));
    //this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_END,  this.show.bind(this));
  }

  /**
   * On the Selection-Changed
   *
   */
  onSelectionChanged (event) {
    if (event.elements && event.elements.length > 1) {
      this.facade.raiseEvent({
        type: ORYX_Config.EVENT_HIGHLIGHT_SHOW,
        highlightId: 'selection',
        elements: event.elements.without(event.subSelection),
        color: ORYX_Config.SELECTION_HIGHLIGHT_COLOR,
        opacity: !event.subSelection ? this.opacityFull : this.opacityLow
      });

      if (event.subSelection) {
        this.facade.raiseEvent({
          type: ORYX_Config.EVENT_HIGHLIGHT_SHOW,
          highlightId: 'subselection',
          elements: [event.subSelection],
          color: ORYX_Config.SELECTION_HIGHLIGHT_COLOR,
          opacity: this.opacityFull
        });
      } else {
        this.facade.raiseEvent({type: ORYX_Config.EVENT_HIGHLIGHT_HIDE, highlightId: 'subselection'});
      }
    } else {
      this.facade.raiseEvent({type: ORYX_Config.EVENT_HIGHLIGHT_HIDE, highlightId: 'selection'});
      this.facade.raiseEvent({type: ORYX_Config.EVENT_HIGHLIGHT_HIDE, highlightId: 'subselection'});
    }
  }
}