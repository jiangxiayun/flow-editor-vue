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

const LaneLinkProperties = [
  "oryx-department",
  "oryx-activerole",
  "oryx-activesystem",
]

export default class PoolAsProperty extends AbstractPlugin {
  constructor (facade) {
    super(facade)
    this.facade = facade
    this.facade.registerOnEvent('layout.bpmn2_0.pool', this.handleLayoutPool.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_PROPWINDOW_PROP_CHANGED, this.handlePropertyChanged.bind(this))
  }

  handleLayoutPool (event) {
    let pool = event.shape
    let ifAsPro = pool.properties.get('oryx-ispropertyfortask')
    // Get all the child lanes
    let lanes = pool.getChildNodes(false).findAll(function (node) {
      return node.getStencil().id().endsWith('Lane')
    })
    if (lanes.length <= 0) {
      return
    }
    lanes.each ((lane) => {
      if (!ifAsPro) {
        // 泳道不关联节点属性
        lane.getStencil().property('oryx-propertiesfortask').disableHiddenPro()
      } else {
        // 泳道关联节点属性,单一维度
        lane.getStencil().property('oryx-propertiesfortask').enableHiddenPro()
        let propertyfortask = lane.properties.get('oryx-propertiesfortask')
        // 若没有设置维度，结束
        if (!propertyfortask || propertyfortask === 'None') {
          return false
        }
        console.log('泳道维度:', propertyfortask, propertyfortask_Value)
        lane.getStencil().property(propertyfortask).enableHiddenPro()
        console.log(2333, lane.getStencil().property(propertyfortask))
        let propertyfortask_Value = lane.properties.get(propertyfortask)
        // 将泳道的属性设置到节点上
        let bound = lane.bounds
        // let properties = lane.getStencil().properties()
        let inBoundNodes = this.findChindsInBound(bound)
        inBoundNodes.map((ele) => {
          ele.setProperty(propertyfortask, propertyfortask_Value)
        })
      }
    })
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
    let shapes = option.elements
    let propertyKey = option.key
    let propertyValue = option.value

    console.log('propertyKey', propertyKey)
    let changed = false
    shapes.each(function (shape) {
      if ((shape.getStencil().id().endsWith('SequenceFlow')) &&
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

      if (shape.getStencil().id().endsWith('Lane')) {
        // 泳道维度变化
        if (propertyKey === 'oryx-propertiesfortask') {
          LaneLinkProperties.map((pro) => {
            if (pro != propertyValue) {
              // shape.getStencil().property(pro).disableHiddenPro()
            }
          })
        }

      }
    }.bind(this))

    if (changed) {
      this.facade.getCanvas().update()
    }

  }

}