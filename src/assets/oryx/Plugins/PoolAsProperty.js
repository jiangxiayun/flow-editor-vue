import AbstractPlugin from './AbstractPlugin'
import SelectedRect from './SelectedRect'
import GridLine from './GridLine'
import Resizer from './Resizer'
import ORYX_Edge from '../core/Edge'
import ORYX_Node from '../core/Node'
import ORYX_Shape from '../core/Shape'
import ORYX_Canvas from '../core/Canvas'
import ORYX_Command from '../core/Command'
import ORYX_Command_Move from '../core/Move'
import ORYX_Controls from '../core/Controls/index'
import ORYX_Config from '../CONFIG'
import ORYX_Utils from '../Utils'

export default class PoolAsProperty extends AbstractPlugin {
  constructor (facade) {
    super(facade)
    this.facade = facade
    this.facade.registerOnEvent('layout.bpmn2_0.pool', this.handleLayoutPool.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_PROPWINDOW_PROP_CHANGED, this.handlePropertyChanged.bind(this))
    this.namespace = undefined
  }

  handleLayoutPool (event) {
    let pool = event.shape
    let ifAsPro = pool.properties.get('oryx-ispropertyfortask')
    console.log('ifAsPro', ifAsPro)
    if (!ifAsPro) {
      return false
    }
    // Get all the child lanes
    let lanes = pool.getChildNodes(false).findAll(function (node) {
      return node.getStencil().id().endsWith('Lane')
    })
    if (lanes.length <= 0) {
      return
    }
    // 将泳道的属性设置到节点上
    for (let i in lanes) {
      let lane = lanes[i]
      let propertiesfortask = pool.properties.get('oryx-propertiesfortask')
      if (!propertiesfortask) {
        return false
      }
      console.log('propertiesfortask', propertiesfortask)
      let bound = lane.bounds
      // let properties = lane.getStencil().properties()
      let inBoundNodes = this.findChindsInBound(bound)
      propertiesfortask.map((pro) => {
        let lane_pro_value = lane.properties.get(pro)
        if (lane_pro_value) {
          inBoundNodes.map((ele) => {
            ele.setProperty(pro, lane_pro_value)
          })
        }
      })
    }
  }

  findChindsInBound (bound) {
    // Calculate the elements from the childs of the canvas
    let elements = this.facade.getCanvas().getChildShapes(true).findAll(function (value) {
      if (value instanceof ORYX_Node) {
        let absBounds = value.absoluteBounds()
        let bA = absBounds.upperLeft()
        let bB = absBounds.lowerRight()
        if (bA.x > bound.a.x && bA.y > bound.a.y && bB.x < bound.b.x && bB.y < bound.b.y) {
          return true
        }
      }

      return false
    })

    return elements
  }
  /**
   * PropertyWindow.PropertyChanged Handler
   */
  handlePropertyChanged (option) {
    let namespace = this.getNamespace()

    let shapes = option.elements
    let propertyKey = option.key
    let propertyValue = option.value

    console.log('propertyKey', propertyKey)
    let changed = false
    shapes.each(function (shape) {
      if ((shape.getStencil().id() === namespace + 'SequenceFlow') &&
        (propertyKey === 'oryx-conditiontype')) {

        if (propertyValue != 'Expression')
        // Do not show the Diamond
          shape.setProperty('oryx-showdiamondmarker', false)
        else {
          let incomingShapes = shape.getIncomingShapes()

          if (!incomingShapes) {
            shape.setProperty('oryx-showdiamondmarker', true)
          }

          let incomingGateway = incomingShapes.find(function (aShape) {
            let foundGateway = aShape.getStencil().groups().find(function (group) {
              if (group == 'Gateways')
                return group
            })
            if (foundGateway)
              return foundGateway
          })

          if (!incomingGateway)
          // show diamond on edge source
            shape.setProperty('oryx-showdiamondmarker', true)
          else
          // do not show diamond
            shape.setProperty('oryx-showdiamondmarker', false)
        }

        changed = true
      }
    }.bind(this))

    if (changed) {
      this.facade.getCanvas().update()
    }

  }

}