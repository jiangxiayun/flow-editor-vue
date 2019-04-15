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
  'oryx-department',
  'oryx-activerole',
  'oryx-activesystem'
]


export default class PoolAsProperty extends AbstractPlugin {
  constructor (facade) {
    super(facade)
    this.facade = facade
    this.poolH = {}
    this.poolV = {}
    this.facade.registerOnEvent('layout.bpmn2_0.pool', this.handleLayoutPool.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_PROPWINDOW_PROP_CHANGED, this.handlePropertyChanged.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_SHAPEREMOVED, this.handleShapeRemove.bind(this))
  }

  onSelectionChanged (event) {
    let elements = event.elements
    console.log('onSelectionChanged', elements)
    if (!elements || elements.length == 0) {
      return
    }

    let lanes_H = this.getAllLanes(this.poolH)
    if (lanes_H.length <= 0) {
      return
    }
    lanes_H.map((lane) => {
      this.setPropertiesWinthinLane(lane, elements)
    })
    let lanes_V = this.getAllLanes(this.poolV)
    if (lanes_V.length <= 0) {
      return
    }
    lanes_V.map((lane) => {
      this.setPropertiesWinthinLane(lane, elements)
    })
  }

  getAllLanes (pools, recursive) {
    let lanes = []
    for (let i in pools) {
      let pool = pools[i]
      let ls = pool.getChildNodes(recursive || false).findAll(function (node) {
        return (node.getStencil().id().endsWith('Lane'))
      })
      lanes = lanes.concat(ls)
    }

    return lanes
  }

  setass (lanes, elements) {
    this.setass(lanes, elements)
  }
  setPropertiesWinthinLane (lane, elements) {
    let bound = lane.bounds
    elements.map(function (shape) {
      if (shape instanceof ORYX_Node) {
        let absBounds = shape.absoluteBounds()
        let bA = absBounds.upperLeft()
        let bB = absBounds.lowerRight()
        if (bA.x > bound.a.x && bA.y > bound.a.y && bB.x < bound.b.x && bB.y < bound.b.y) {
          LaneLinkProperties.map((pro) => {
            let value = lane.properties.get(pro)
            value ?  shape.setProperty(pro, value) : null
          })
          return true
        }
      }

      return false
    })
  }

  handleLayoutPool (event) {
    let pool = event.shape
    let shape_id = pool.id
    let type = pool.getStencil().idWithoutNs()
    if (type === 'Pool') {
      this.poolH[shape_id] = pool
    } else if (type === 'V-Pool') {
      this.poolV[shape_id] = pool
    }
  }

  handleShapeRemove (option) {
    let sh = option.shape
    let type = sh.getStencil().idWithoutNs()
    if (type === 'Pool') {
      delete this.poolH[sh.id]
    } else if (type === 'V-Pool') {
      delete this.poolV[sh.id]
    }
  }

  findCanvasChindsInBound (bound) {
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

      // if (shape.getStencil().id().endsWith('Lane')) {
      //   // 泳道维度变化
      //   if (propertyKey === 'oryx-propertiesfortask') {
      //     LaneLinkProperties.map((pro) => {
      //       if (pro != propertyValue) {
      //         // shape.getStencil().property(pro).disableHiddenPro()
      //       }
      //     })
      //   }
      //
      // }
    }.bind(this))

    if (changed) {
      this.facade.getCanvas().update()
    }

  }

}