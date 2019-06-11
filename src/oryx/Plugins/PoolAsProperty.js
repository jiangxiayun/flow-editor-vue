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
    this.facade.registerOnEvent(ORYX_Config.EVENT_DRAGDROP_END, this.handleDragdropEnd.bind(this))
    this.facade.registerOnEvent('newshape_addin_canvas', this.handleAddShape.bind(this))
    this.facade.registerOnEvent('shape_refreshed', this.handleShapeRefreshed.bind(this))

    // Register on over/out to show / hide a docker
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEOVER, this.handleMouseOver.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEOUT, this.handleMouseOut.bind(this))
  }


  onSelectionChanged (event) {
    this.currentShapes = event.elements
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

  handleLayoutPool (event) {
    let pool = event.shape
    let shape_id = pool.id
    let type = pool.getStencil().idWithoutNs()
    if (type === 'Pool') {
      this.poolH[shape_id] = pool
    } else if (type === 'V-Pool') {
      this.poolV[shape_id] = pool
    }

    this.allUserTasks = this.findUserTaskInBound()
    this.setNodesWhenLayoutPool(this.poolH)
    this.setNodesWhenLayoutPool(this.poolV)
  }

  handleShapeRemove (option) {
    console.log('handleShapeRemove', option)
    let sh = option.shape
    if (sh instanceof ORYX_Node) {
      let type = sh.getStencil().idWithoutNs()
      if (type === 'Pool') {
        delete this.poolH[sh.id]
      } else if (type === 'V-Pool') {
        delete this.poolV[sh.id]
      }
    }
  }

  findUserTaskInBound () {
    // Calculate the elements from the childs of the canvas
    let elements = this.facade.getCanvas().getChildShapes(true).findAll(function (value) {
      if (value instanceof ORYX_Node && value.getStencil().id().endsWith('UserTask')) {
        return true
      }

      return false
    })

    return elements
  }

  setNodesWhenLayoutPool (pool, elements) {
    let lanes = this.getAllLanes(pool)
    let i = -1
    let tasks = elements || jQuery.extend(true, [], this.allUserTasks)
    while (++i < lanes.length) {
      tasks = this.setPropertiesWinthinLane(lanes[i], tasks)
    }
  }

  setPropertiesWinthinLane (lane, elements) {
    let bound = lane.absoluteBounds()
    let other = elements.findAll(function (shape) {
      let absBounds = shape.absoluteBounds()
      let bA = absBounds.upperLeft()
      let bB = absBounds.lowerRight()
      if (bA.x > bound.a.x && bA.y > bound.a.y && bB.x < bound.b.x && bB.y < bound.b.y) {
        LaneLinkProperties.map((pro) => {
          let value = lane.properties.get(pro)
          value ?  shape.setProperty(pro, value) : null
        })
        return false
      }

      return true
    })

    // 返回不在当前泳道内的节点，进入下一次遍历
    return other
  }

  /**
   * PropertyWindow.PropertyChanged Handler
   */
  handlePropertyChanged (option) {
    let shapes = option.elements
    let propertyKey = option.key
    let propertyValue = option.value

    console.log('propertyKey', option)
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
      //   if (LaneLinkProperties.includes(propertyKey)) {
      //     if (propertyValue) {
      //       shape.getStencil().property(propertyKey).enableHiddenPro()
      //     } else {
      //       shape.getStencil().property(propertyKey).disableHiddenPro()
      //     }
      //   }
      //   shape.update()
      // }
    }.bind(this))
    // this.shape.setProperty(this.key, this.oldValue)
    // this.facade.getCanvas().update()
    // this.facade.updateSelection()
    if (changed) {
      this.facade.getCanvas().update()
    }

  }

  handleDragdropEnd () {
    this.setNodesWhenLayoutPool(this.poolH, this.currentShapes)
    this.setNodesWhenLayoutPool(this.poolV, this.currentShapes)
    this.facade.getCanvas().update()
    this.facade.updateSelection()
  }

  findInWhichLane (pool, shape) {
    let lanes = this.getAllLanes(pool)
    let i = -1
    let found = false

    let absoluteBounds = shape.absoluteBounds()
    let bA = absoluteBounds.upperLeft()
    let bB = absoluteBounds.lowerRight()

    while (++i < lanes.length && !found) {
      // let bound = lanes[i].bounds
      let bound = lanes[i].absoluteBounds()
      if (bA.x > bound.a.x && bA.y > bound.a.y && bB.x < bound.b.x && bB.y < bound.b.y) {
        LaneLinkProperties.map((pro) => {
          let value = lanes[i].properties.get(pro)
          value ?  shape.setProperty(pro, value) : null
        })
      }
    }
  }

  handleAddShape (option) {
    let shape = option.shape
    console.log(444)
    if (shape.getStencil().idWithoutNs() === 'UserTask') {
      this.findInWhichLane(this.poolH, shape)
      this.findInWhichLane(this.poolV, shape)
    }
    // if (shape.getStencil().idWithoutNs() === 'Pool') {
    //   this.findInWhichLane(this.poolH, shape)
    //   this.findInWhichLane(this.poolV, shape)
    //   let parent = shape.node.childNodes[1]
    //   this.nodes.push(uiObject)
    // }
  }

  handleShapeRefreshed (event) {
    // let shape = event.option
    // if (shape instanceof ORYX_Node) {
    //   console.log(889, shape)
    // }
  }

  handleMouseOver (event, uiObj) {
    // console.log(33, uiObj)

  }
  // handleMouseOver (event, uiObj) {
  //   // If there is a Docker, show this
  //   if (!this.docker && uiObj instanceof ORYX_Controls.Docker) {
  //     uiObj.show()
  //   } else if (!this.docker && uiObj instanceof ORYX_Edge) {
  //     uiObj.dockers.each(function (docker) {
  //       docker.show()
  //     })
  //   }
  // }
  handleMouseOut (event, uiObj) {

  }
}
