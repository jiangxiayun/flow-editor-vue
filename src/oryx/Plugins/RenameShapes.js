import ORYX_Config from '../CONFIG'
import ORYX_Command from '../core/Command'
import ORYX_Shape from '../core/Shape'
import autogrow from 'src/libs/jquery.autogrow-textarea'

// 双击修改名称
export default class RenameShapes {
  constructor (facade) {
    this.facade = facade
    this.facade.registerOnEvent(ORYX_Config.EVENT_CANVAS_SCROLL, this.hideField.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_DBLCLICK, this.actOnDBLClick.bind(this))
    this.facade.offer({
      keyCodes: [{
        keyCode: 113, // F2-Key
        keyAction: ORYX_Config.KEY_ACTION_DOWN
      }],
      functionality: this.renamePerF2.bind(this)
    })
    document.documentElement.addEventListener(ORYX_Config.EVENT_MOUSEDOWN, this.hide.bind(this), true)
  }
  /**
   * This method handles the "F2" key down event. The selected shape are looked
   * up and the editing of title/name of it gets started.
   */
  renamePerF2 () {
    let selectedShapes = this.facade.getSelection()
    this.actOnDBLClick(undefined, selectedShapes.first())
  }

  actOnDBLClick (evt, shape) {
    if (!(shape instanceof ORYX_Shape)) {
      return
    }

    // Destroys the old input, if there is one
    this.destroy()

    // Get all properties which where at least one ref to view is set
    let props = shape.getStencil().properties().findAll(function (item) {
      return (item.refToView() && item.refToView().length > 0 && item.directlyEditable())
    })
    // from these, get all properties where write access are and the type is String or Expression
    props = props.findAll(function (item) {
      return !item.readonly() &&
        (item.type() == ORYX_Config.TYPE_STRING ||
          item.type() == ORYX_Config.TYPE_EXPRESSION || item.type() == ORYX_Config.TYPE_DATASOURCE)
    })

    // Get all ref ids
    let allRefToViews = props.collect(function (prop) {
      return prop.refToView()
    }).flatten().compact()
    // Get all labels from the shape with the ref ids

    let labels = shape.getLabels().findAll(function (label) {
      return allRefToViews.any(function (toView) {
        return label.id.endsWith(toView)
      })
    })
    // If there are no referenced labels --> return
    if (labels.length == 0) {
      return
    }

    // Define the nearest label
    let nearestLabel = labels.length <= 1 ? labels[0] : null
    if (!nearestLabel) {
      nearestLabel = labels.find(function (label) {
        let el = label.id.split('_')
        return el[el.length - 1] === 'name'
      })
    }
    if (!nearestLabel) {
      nearestLabel = labels.find(function (label) {
        return label.node == evt.target || label.node == evt.target.parentNode
      })
      if (!nearestLabel) {
        let evtCoord = this.facade.eventCoordinates(evt)
        console.log('evtCoord', evtCoord)

        let additionalIEZoom = 1
        if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
          let ua = navigator.userAgent
          if (ua.indexOf('MSIE') >= 0) {
            //IE 10 and below
            let zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100)
            if (zoom !== 100) {
              additionalIEZoom = zoom / 100
            }
          }
        }

        if (additionalIEZoom !== 1) {
          evtCoord.x = evtCoord.x / additionalIEZoom
          evtCoord.y = evtCoord.y / additionalIEZoom
        }

        evtCoord.y += $('editor-header').clientHeight - $('canvasSection').scrollTop - 5

        evtCoord.x -= $('canvasSection').scrollLeft

        let trans = this.facade.getCanvas().rootNode.lastChild.getScreenCTM()
        evtCoord.x *= trans.a
        evtCoord.y *= trans.d

        let diff = labels.collect(function (label) {
          let center = this.getCenterPosition(label.node)
          let len = Math.sqrt(Math.pow(center.x - evtCoord.x, 2) + Math.pow(center.y - evtCoord.y, 2))
          return { diff: len, label: label }
        }.bind(this))

        diff.sort(function (a, b) {
          return a.diff > b.diff
        })

        nearestLabel = diff[0].label
      }
    }

    // Get the particular property for the label
    let prop = props.find(function (item) {
      return item.refToView().any(function (toView) {
        return nearestLabel.id == shape.id + toView
      })
    })

    // Get the center position from the nearest label
    let width = Math.min(Math.max(100, shape.bounds.width()), 200)
    let center = this.getCenterPosition(nearestLabel.node, shape)
    center.x -= (width / 2)
    let propId = prop.prefix() + '-' + prop.id()
    let textInput = document.createElement('textarea')
    textInput.id = 'shapeTextInput'
    textInput.style.position = 'absolute'
    textInput.style.width = width + 'px'
    textInput.style.left = (center.x < 10) ? 10 : center.x + 'px'
    textInput.style.top = (center.y - 15) + 'px'
    textInput.className = 'x-form-textarea x-form-field x_form_text_set_absolute'
    textInput.value = shape.properties.get(propId)
    this.oldValueText = shape.properties.get(propId)
    document.getElementById('canvasSection').appendChild(textInput)
    this.shownTextField = textInput


    // Value change listener needs to be defined now since we reference it in the text field
    this.updateValueFunction = function (newValue, oldValue) {
      let currentEl = shape
      let facade = this.facade

      if (oldValue != newValue) {
        // Implement the specific command for property change
        class commandClass extends ORYX_Command{
          constructor () {
            super()
            this.el = currentEl
            this.propId = propId
            this.oldValue = oldValue
            this.newValue = newValue
            this.facade = facade
          }
          execute () {
            this.el.setProperty(this.propId, this.newValue)
            //this.el.update();
            this.facade.setSelection([this.el])
            this.facade.getCanvas().update()
            this.facade.updateSelection()
          }
          rollback () {
            this.el.setProperty(this.propId, this.oldValue)
            //this.el.update();
            this.facade.setSelection([this.el])
            this.facade.getCanvas().update()
            this.facade.updateSelection()
          }
        }
        // Instantiated the class
        const command = new commandClass()

        // Execute the command
        this.facade.executeCommands([command])
      }
    }.bind(this)

    jQuery('#shapeTextInput').focus()
    jQuery('#shapeTextInput').autogrow()

    // Disable the keydown in the editor (that when hitting the delete button, the shapes not get deleted)
    this.facade.disableEvent(ORYX_Config.EVENT_KEYDOWN)
  }

  getCenterPosition (svgNode, shape) {
    if (!svgNode) {
      return { x: 0, y: 0 }
    }

    let scale = this.facade.getCanvas().node.getScreenCTM()
    let absoluteXY = shape.bounds.upperLeft()

    let hasParent = true
    let searchShape = shape
    while (hasParent) {
      if (searchShape.getParentShape().getStencil().idWithoutNs() === 'BPMNDiagram' || searchShape.getParentShape().getStencil().idWithoutNs() === 'CMMNDiagram') {
        hasParent = false
      } else {
        let parentXY = searchShape.getParentShape().bounds.upperLeft()
        absoluteXY.x += parentXY.x
        absoluteXY.y += parentXY.y
        searchShape = searchShape.getParentShape()
      }
    }

    let center = shape.bounds.midPoint()
    center.x += absoluteXY.x + scale.e
    center.y += absoluteXY.y + scale.f

    center.x *= scale.a
    center.y *= scale.d

    let additionalIEZoom = 1
    if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
      let ua = navigator.userAgent
      if (ua.indexOf('MSIE') >= 0) {
        //IE 10 and below
        let zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100)
        if (zoom !== 100) {
          additionalIEZoom = zoom / 100
        }
      }
    }

    if (additionalIEZoom === 1) {
      center.y = center.y - jQuery('#canvasSection').offset().top + 5
      center.x -= jQuery('#canvasSection').offset().left
    } else {
      let canvasOffsetLeft = jQuery('#canvasSection').offset().left
      let canvasScrollLeft = jQuery('#canvasSection').scrollLeft()
      let canvasScrollTop = jQuery('#canvasSection').scrollTop()

      let offset = scale.e - (canvasOffsetLeft * additionalIEZoom)
      let additionaloffset = 0
      if (offset > 10) {
        additionaloffset = (offset / additionalIEZoom) - offset
      }
      center.y = center.y - (jQuery('#canvasSection').offset().top * additionalIEZoom) + 5 + ((canvasScrollTop * additionalIEZoom) - canvasScrollTop)
      center.x = center.x - (canvasOffsetLeft * additionalIEZoom) + additionaloffset + ((canvasScrollLeft * additionalIEZoom) - canvasScrollLeft)
    }

    return center
  }

  hide (e) {
    console.log('EVENT_MOUSEDOWN')
    if (this.shownTextField && (!e || e.target !== this.shownTextField)) {
      let newValue = this.shownTextField.value
      if (newValue !== this.oldValueText) {
        this.updateValueFunction(newValue, this.oldValueText)
      }
      this.destroy()
    }
  }

  hideField (e) {
    if (this.shownTextField) {
      this.destroy()
    }
  }

  destroy (e) {
    let textInputComp = jQuery('#shapeTextInput')
    if (textInputComp) {
      textInputComp.remove()
      delete this.shownTextField

      this.facade.enableEvent(ORYX_Config.EVENT_KEYDOWN)
    }
  }
}
