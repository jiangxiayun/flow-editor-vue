import ORYX_Config from '../CONFIG'

/**
 * The view plugin offers all of zooming functionality accessible over the
 * tool bar. This are zoom in, zoom out, zoom to standard, zoom fit to model.
 *
 * @class ORYX.Plugins.View
 * @extends Clazz
 * @param {Object} facade The editor facade for plugins.
 */
export default class View {
  I18N = {
    View: {
      group: 'Zoom',
      zoomIn: 'Zoom In',
      zoomInDesc: 'Zoom into the model',
      zoomOut: 'Zoom Out',
      zoomOutDesc: 'Zoom out of the model',
      zoomStandard: 'Zoom Standard',
      zoomStandardDesc: 'Zoom to the standard level',
      zoomFitToModel: 'Zoom fit to model',
      zoomFitToModelDesc: 'Zoom to fit the model size',
    }
  }
  /** @lends ORYX.Plugins.View.prototype */
  constructor (facade, ownPluginData) {
    this.facade = facade
    // Standard Values
    this.zoomLevel = 1.0
    this.maxFitToScreenLevel = 1.5
    this.minZoomLevel = 0.1
    this.maxZoomLevel = 2.5
    this.diff = 5 //difference between canvas and view port, s.th. like toolbar??

    // Read properties
    if (ownPluginData !== undefined && ownPluginData !== null) {
      ownPluginData.get('properties').each(function (property) {
        if (property.zoomLevel) {
          this.zoomLevel = Number(1.0)
        }
        if (property.maxFitToScreenLevel) {
          this.maxFitToScreenLevel = Number(property.maxFitToScreenLevel)
        }
        if (property.minZoomLevel) {
          this.minZoomLevel = Number(property.minZoomLevel)
        }
        if (property.maxZoomLevel) {
          this.maxZoomLevel = Number(property.maxZoomLevel)
        }
      }.bind(this))
    }

    /* Register zoom in */
    this.facade.offer({
      'name': this.I18N.View.zoomIn,
      'functionality': this.zoom.bind(this, [1.0 + ORYX_Config.CustomConfigs.UI_CONFIG.ZOOM_OFFSET]),
      'group': this.I18N.View.group,
      'icon': ORYX_Config.PATH + 'images/magnifier_zoom_in.png',
      'description': this.I18N.View.zoomInDesc,
      'index': 1,
      'minShape': 0,
      'maxShape': 0,
      'isEnabled': function () {
        return this.zoomLevel < this.maxZoomLevel
      }.bind(this)
    })

    /* Register zoom out */
    this.facade.offer({
      'name': this.I18N.View.zoomOut,
      'functionality': this.zoom.bind(this, [1.0 - ORYX_Config.CustomConfigs.UI_CONFIG.ZOOM_OFFSET]),
      'group': this.I18N.View.group,
      'icon': ORYX_Config.PATH + 'images/magnifier_zoom_out.png',
      'description': this.I18N.View.zoomOutDesc,
      'index': 2,
      'minShape': 0,
      'maxShape': 0,
      'isEnabled': function () {
        return this._checkSize()
      }.bind(this)
    })

    /* Register zoom standard */
    this.facade.offer({
      'name': this.I18N.View.zoomStandard,
      'functionality': this.setAFixZoomLevel.bind(this, 1),
      'group': this.I18N.View.group,
      'icon': ORYX_Config.PATH + 'images/zoom_standard.png',
      'cls': 'icon-large',
      'description': this.I18N.View.zoomStandardDesc,
      'index': 3,
      'minShape': 0,
      'maxShape': 0,
      'isEnabled': function () {
        return this.zoomLevel != 1
      }.bind(this)
    })

    /* Register zoom fit to model */
    this.facade.offer({
      'name': this.I18N.View.zoomFitToModel,
      'functionality': this.zoomFitToModel.bind(this),
      'group': this.I18N.View.group,
      'icon': ORYX_Config.PATH + 'images/image.png',
      'description': this.I18N.View.zoomFitToModelDesc,
      'index': 4,
      'minShape': 0,
      'maxShape': 0
    })
  }

  /**
   * It sets the zoom level to a fix value and call the zooming function.
   *
   * @param {Number} zoomLevel
   *      the zoom level
   */
  setAFixZoomLevel (zoomLevel) {
    this.zoomLevel = zoomLevel
    this._checkZoomLevelRange()
    this.zoom(1)
  }

  /**
   * It does the actual zooming. It changes the viewable size of the canvas
   * and all to its child elements.
   *
   * @param {Number} factor
   *    the factor to adjust the zoom level
   */
  zoom (factor) {
    // TODO: Zoomen auf allen Objekten im SVG-DOM

    this.zoomLevel *= factor
    let scrollNode = this.facade.getCanvas().getHTMLContainer().parentNode.parentNode
    let canvas = this.facade.getCanvas()
    let newWidth = canvas.bounds.width() * this.zoomLevel
    let newHeight = canvas.bounds.height() * this.zoomLevel

    /* Set new top offset */
    let offsetTop = (canvas.node.parentNode.parentNode.parentNode.offsetHeight - newHeight) / 2.0
    offsetTop = offsetTop > 20 ? offsetTop - 20 : 0
    canvas.node.parentNode.parentNode.style.marginTop = offsetTop + 'px'
    offsetTop += 5
    canvas.getHTMLContainer().style.top = offsetTop + 'px'

    /*readjust scrollbar*/
    let newScrollTop = scrollNode.scrollTop - Math.round((canvas.getHTMLContainer().parentNode.getHeight() - newHeight) / 2) + this.diff
    let newScrollLeft = scrollNode.scrollLeft - Math.round((canvas.getHTMLContainer().parentNode.getWidth() - newWidth) / 2) + this.diff

    /* Set new Zoom-Level */
    canvas.setSize({ width: newWidth, height: newHeight }, true)

    /* Set Scale-Factor */
    canvas.node.setAttributeNS(null, 'transform', 'scale(' + this.zoomLevel + ')')

    /* Refresh the Selection */
    this.facade.updateSelection()
    scrollNode.scrollTop = newScrollTop
    scrollNode.scrollLeft = newScrollLeft

    /* Update the zoom-level*/
    canvas.zoomLevel = this.zoomLevel
  }

  /**
   * It calculates the zoom level to fit whole model into the visible area
   * of the canvas. Than the model gets zoomed and the position of the
   * scroll bars are adjusted.
   *
   */
  zoomFitToModel () {
    /* Get the size of the visible area of the canvas */
    let scrollNode = this.facade.getCanvas().getHTMLContainer().parentNode.parentNode
    let visibleHeight = scrollNode.getHeight() - 30
    let visibleWidth = scrollNode.getWidth() - 30
    let nodes = this.facade.getCanvas().getChildShapes()

    if (!nodes || nodes.length < 1) {
      return false
    }

    /* Calculate size of canvas to fit the model */
    let bounds = nodes[0].absoluteBounds().clone()
    nodes.each(function (node) {
      bounds.include(node.absoluteBounds().clone())
    })

    /* Set new Zoom Level */
    let scaleFactorWidth = visibleWidth / bounds.width()
    let scaleFactorHeight = visibleHeight / bounds.height()

    /* Choose the smaller zoom level to fit the whole model */
    let zoomFactor = scaleFactorHeight < scaleFactorWidth ? scaleFactorHeight : scaleFactorWidth

    /*Test if maximum zoom is reached*/
    if (zoomFactor > this.maxFitToScreenLevel) {
      zoomFactor = this.maxFitToScreenLevel
    }
    /* Do zooming */
    this.setAFixZoomLevel(zoomFactor)

    /* Set scroll bar position */
    scrollNode.scrollTop = Math.round(bounds.upperLeft().y * this.zoomLevel) - 5
    scrollNode.scrollLeft = Math.round(bounds.upperLeft().x * this.zoomLevel) - 5
  }

  /**
   * It checks if the zoom level is less or equal to the level, which is required
   * to schow the whole canvas.
   *
   * @private
   */
  _checkSize () {
    let canvasParent = this.facade.getCanvas().getHTMLContainer().parentNode
    let minForCanvas = Math.min((canvasParent.parentNode.getWidth() / canvasParent.getWidth()), (canvasParent.parentNode.getHeight() / canvasParent.getHeight()))
    return 1.05 > minForCanvas
  }

  /**
   * It checks if the zoom level is included in the definined zoom
   * level range.
   *
   * @private
   */
  _checkZoomLevelRange () {
    /*var canvasParent=this.facade.getCanvas().getHTMLContainer().parentNode;
     var maxForCanvas= Math.max((canvasParent.parentNode.getWidth()/canvasParent.getWidth()),(canvasParent.parentNode.getHeight()/canvasParent.getHeight()));
     if(this.zoomLevel > maxForCanvas) {
     this.zoomLevel = maxForCanvas;
     }*/
    if (this.zoomLevel < this.minZoomLevel) {
      this.zoomLevel = this.minZoomLevel
    }

    if (this.zoomLevel > this.maxZoomLevel) {
      this.zoomLevel = this.maxZoomLevel
    }
  }
}

