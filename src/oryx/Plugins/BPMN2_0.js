import AbstractPlugin from './AbstractPlugin'
import ORYX_Config from '../CONFIG'
import Command from '../core/Command'
import ORYX_MoveDockersCommand from '../core/MoveDockersCommand'
import ORYX_Edge from '../core/Edge'
import ORYX_Node from '../core/Node'
import ORYX_Canvas from '../core/Canvas'
import ORYX_Controls from '../core/Controls'
import ORYX_Command_Move from '../core/Move'

class ResizeLanesCommand extends Command {
  constructor (shape, parent, pool, plugin) {
    super()
    this.facade = plugin.facade
    this.plugin = plugin
    this.shape = shape
    this.changes
    this.pool = pool
    this.parent = parent
    this.shapeChildren = []
    this.Lane_type = shape.getStencil().idWithoutNs()

    /*
     * The Bounds have to be stored
     * separate because they would
     * otherwise also be influenced
     */
    this.shape.getChildShapes().each((childShape) => {
      this.shapeChildren.push({
        shape: childShape,
        bounds: {
          a: {
            x: childShape.bounds.a.x,
            y: childShape.bounds.a.y
          },
          b: {
            x: childShape.bounds.b.x,
            y: childShape.bounds.b.y
          }
        }
      })
    })

    this.shapeUpperLeft = this.shape.bounds.upperLeft()
    this.parentHeight = this.parent.bounds.height()
  }

  getLeafLanes (lane) {
    let childLanes = this.plugin.getLanes(lane)
    let { horLanes, verLanes } = childLanes
    if (this.Lane_type === 'Lane') {
      childLanes = horLanes.map((child) => this.getLeafLanes(child)).flatten()
    } else {
      childLanes = verLanes.map((child) => this.getLeafLanes(child)).flatten()
    }
    return childLanes.length > 0 ? childLanes : [lane]
  }

  findNewLane () {
    let leafLanes = this.getLeafLanes(this.parent)
    if (this.Lane_type === 'Lane') {
      this.lane = leafLanes.find((l) => l.bounds.upperLeft().y >= this.shapeUpperLeft.y) || leafLanes.last()
    } else {
      this.lane = leafLanes.find((l) => l.bounds.upperLeft().x >= this.shapeUpperLeft.x) || leafLanes.last()
    }
    this.laneUpperLeft = this.lane.bounds.upperLeft()
  }

  execute () {
    if (this.changes) {
      this.executeAgain()
      return
    }

    /*
     * Rescue all ChildShapes of the deleted
     * Shape into the lane that takes its
     * place
     */

    if (!this.lane) {
      this.findNewLane()
    }

    if (this.lane) {
      let laUpL = this.laneUpperLeft
      let shUpL = this.shapeUpperLeft
      let depthChange = this.plugin.getDepth(this.lane, this.parent) - 1
      this.changes = $H({})

      let lane_title_width = ORYX_Config.CustomConfigs.UI_CONFIG.HOR_LANE_TITLE_WIDTH
      if (this.Lane_type === 'Lane') {
        // Selected lane is BELOW the removed lane
        if (laUpL.y >= shUpL.y) {
          this.lane.getChildShapes().each((childShape) => {
            // Cache the changes for rollback
            let childShapeId = childShape.getId()
            if (!this.changes[childShapeId]) {
              this.changes[childShapeId] = this.computeChanges(
                childShape, this.lane, this.lane, this.shape.bounds.height()
              )
            }

            childShape.bounds.moveBy(0, this.shape.bounds.height())
          })

          this.plugin.hashChildShapes(this.lane)
          let lane_title_width = ORYX_Config.CustomConfigs.UI_CONFIG.HOR_LANE_TITLE_WIDTH
          this.shapeChildren.each((shapeChild) => {
            shapeChild.shape.bounds.set(shapeChild.bounds)
            shapeChild.shape.bounds.moveBy((shUpL.x - lane_title_width) - (depthChange * lane_title_width), 0)

            // Cache the changes for rollback
            if (!this.changes[shapeChild.shape.getId()]) {
              this.changes[shapeChild.shape.getId()] = this.computeChanges(shapeChild.shape, this.shape, this.lane, 0)
            }

            this.lane.add(shapeChild.shape)
          })

          this.lane.bounds.moveBy(0, shUpL.y - laUpL.y)

          // Selected lane is ABOVE the removed lane
        } else if (shUpL.y > laUpL.y) {
          this.shapeChildren.each((shapeChild) => {
            shapeChild.shape.bounds.set(shapeChild.bounds)
            shapeChild.shape.bounds.moveBy((shUpL.x - lane_title_width) - (depthChange * lane_title_width),
              this.lane.bounds.height())

            // Cache the changes for rollback
            if (!this.changes[shapeChild.shape.getId()]) {
              this.changes[shapeChild.shape.getId()] = this.computeChanges(shapeChild.shape, this.shape, this.lane, 0)
            }

            this.lane.add(shapeChild.shape)
          })
        }
      } else {
        // Selected lane is BELOW Or RIGHT the removed lane
      }

    }

    if (this.Lane_type === 'Lane') {
      /*
       * Adjust the height of the lanes
       */
      // Get the height values
      let oldHeight = this.lane.bounds.height()
      let newHeight = this.lane.length === 1 ? this.parentHeight : this.lane.bounds.height() + this.shape.bounds.height()

      // Set height
      this.setHeight(newHeight, oldHeight, this.parent, this.parentHeight, true)

      // Cache all sibling lanes
      // this.changes[this.shape.getId()] = this.computeChanges(this.shape, this.parent, this.parent, 0);
      this.plugin.getLanes(this.parent).horLanes.each(function (childLane) {
        if (!this.changes[childLane.getId()] && childLane !== this.lane && childLane !== this.shape) {
          this.changes[childLane.getId()] = this.computeChanges(childLane, this.parent, this.parent, 0)
        }
      }.bind(this))
    }

    // Update
    this.update()
  }

  setHeight (newHeight, oldHeight, parent, parentHeight, store) {
    console.log('setHeight!!!!')
    // Set heigh of the lane
    this.plugin.setDimensions(this.lane, this.lane.bounds.width(), newHeight)
    this.plugin.hashedBounds[this.pool.id][this.lane.id] = this.lane.absoluteBounds()

    // Adjust child lanes
    this.plugin.adjustHeight(this.plugin.getLanes(parent).horLanes, this.lane)

    if (store === true) {
      // Store changes
      this.changes[this.shape.getId()] = this.computeChanges(this.shape, parent, parent, 0, oldHeight, newHeight)
    }

    // Set parents height
    this.plugin.setDimensions(parent, parent.bounds.width(), parentHeight)

    if (parent !== this.pool) {
      this.plugin.setDimensions(this.pool, this.pool.bounds.width(), this.pool.bounds.height() + (newHeight - oldHeight))
    }
  }

  update () {

    // Hack to prevent the updating of the dockers
    this.plugin.hashedBounds[this.pool.id]['REMOVED'] = true
    // Update
    //this.facade.getCanvas().update();
  }

  rollback () {
    let laUpL = this.laneUpperLeft
    let shUpL = this.shapeUpperLeft

    this.changes.each(function (pair) {
      let parent = pair.value.oldParent
      let shape = pair.value.shape
      let parentHeight = pair.value.parentHeight
      let oldHeight = pair.value.oldHeight
      let newHeight = pair.value.newHeight

      // Move siblings
      if (shape.getStencil().id().endsWith('Lane')) {
        shape.bounds.moveTo(pair.value.oldPosition)
      }

      // If lane
      if (oldHeight) {
        this.setHeight(oldHeight, newHeight, parent, parent.bounds.height() + (oldHeight - newHeight))
        if (laUpL.y >= shUpL.y) {
          this.lane.bounds.moveBy(0, this.shape.bounds.height() - 1)
        }
      } else {
        parent.add(shape)
        shape.bounds.moveTo(pair.value.oldPosition)

      }


    }.bind(this))

    // Update
    //this.update();

  }

  executeAgain () {
    this.changes.each(function (pair) {
      let parent = pair.value.newParent
      let shape = pair.value.shape
      let newHeight = pair.value.newHeight
      let oldHeight = pair.value.oldHeight

      // If lane
      if (newHeight) {
        let laUpL = this.laneUpperLeft.y
        let shUpL = this.shapeUpperLeft.y

        if (laUpL >= shUpL) {
          this.lane.bounds.moveBy(0, shUpL - laUpL)
        }
        this.setHeight(newHeight, oldHeight, parent, parent.bounds.height() + (newHeight - oldHeight))
      } else {
        parent.add(shape)
        shape.bounds.moveTo(pair.value.newPosition)
      }

    }.bind(this))

    // Update
    this.update()
  }

  computeChanges (shape, oldParent, parent, yOffset, oldHeight, newHeight) {
    let id = shape.getId()
    oldParent = this.changes[id] ? this.changes[id].oldParent : oldParent
    let oldPosition = this.changes[id] ? this.changes[id].oldPosition : shape.bounds.upperLeft()

    let sUl = shape.bounds.upperLeft()
    let pos = { x: sUl.x, y: sUl.y + yOffset }

    let changes = {
      shape: shape,
      parentHeight: oldParent.bounds.height(),
      oldParent: oldParent,
      oldPosition: oldPosition,
      oldHeight: oldHeight,
      newParent: parent,
      newPosition: pos,
      newHeight: newHeight
    }

    return changes
  }

}

export default class BPMN2_0 extends AbstractPlugin {
  hashedPoolPositions = {}
  hashedLaneDepth = {}
  hashedBounds = {}
  hashedPositions = {}
  hashedSubProcesses = {}

  UI_CONFIG = ORYX_Config.CustomConfigs.UI_CONFIG
  HOR_POOL_TITLE_HEIGHT = this.UI_CONFIG.HOR_POOL_TITLE_HEIGHT
  HOR_LANE_TITLE_WIDTH = this.UI_CONFIG.HOR_LANE_TITLE_WIDTH
  HOR_LANE_INIT_HEIGHT = this.UI_CONFIG.HOR_LANE_INIT_HEIGHT
  HOR_LANE_MINSIZE = this.UI_CONFIG.HOR_LANE_MINSIZE
  VER_LANE_MINSIZE = this.UI_CONFIG.VER_LANE_MINSIZE

  /**
   *  @param {Object} Facade: The Facade of the Editor
   */
  constructor (facade) {
    super(facade)
    this.facade = facade
    this.namespace = undefined
    this.facade.registerOnEvent(ORYX_Config.EVENT_DRAGDOCKER_DOCKED, this.handleDockerDocked.bind(this))
    this.facade.registerOnEvent('layout.bpmn2_0.pool', this.handleLayoutPool.bind(this))
    this.facade.registerOnEvent('layout.bpmn2_0.subprocess', this.handleSubProcess.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_SHAPEREMOVED, this.handleShapeRemove.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_LOADED, this.afterLoad.bind(this))
  }

  /**
   * 强制更新每个 Pool
   */
  afterLoad () {
    this.facade.getCanvas().getChildNodes().each(function (shape) {
      if (shape.getStencil().id().endsWith('Pool')) {
        this.handleLayoutPool({
          shape: shape
        })
      }
    }.bind(this))
  }

  /**
   * 如果选中了一个泳池并且泳池内没有泳道，自动创建一个泳道
   */
  onSelectionChanged (event) {
    let selection = event.elements
    this.currentSelection = selection
    if (selection && selection.length === 1) {
      let namespace = this.getNamespace()
      let shape = selection[0]
      let id = shape.getStencil().idWithoutNs()
      // shape.getStencil().idWithoutNs() === 'Pool'
      if (id.endsWith('Pool')) {
        if (shape.getChildNodes().length === 0) {
          // create a lane inside the selected pool
          let laneName = 'Lane'
          if (id === 'V-Pool') {
            laneName = 'V-Lane'
          }
          let option = {
            type: namespace + laneName,
            position: { x: 0, y: (this.HOR_LANE_INIT_HEIGHT / 2) + this.HOR_POOL_TITLE_HEIGHT },
            namespace: shape.getStencil().namespace(),
            parent: shape
          }
          this.facade.createShape(option)
          this.facade.getCanvas().update()
          this.facade.setSelection([shape])
        }
      }
    }

    // 防止选中了某个泳池内所有的横泳道，但没有选中该泳池
    // 注意：泳池内必须有一个横泳道
    if (selection.any((s) => s instanceof ORYX_Node && s.getStencil().idWithoutNs() === 'Lane')) {
      // 当前所有选中的lanes
      let lanes = selection.findAll((s) => s instanceof ORYX_Node && s.getStencil().idWithoutNs() === 'Lane')

      let pools = []
      lanes.each((lane) => pools.push(this.getParentPool(lane)))

      pools = [...new Set(pools)]
      pools = pools.filter((pool) => {
        // pool的所有子lane
        let childLanes = this.getLanes(pool, true)
        let horLanes = childLanes.horLanes
        // 如果所有的子lane都被选中
        if (horLanes.all((lane) => lanes.includes(lane)) && !selection.includes(pool)) {
          return true
        } else {
          return false
        }
      })

      if (pools.length > 0) {
        selection = selection.concat(pools)
        this.facade.setSelection(selection)
      }
    }
  }
  // 判断是否是末级lane
  isLeafFn (leaf) {
    return !leaf.getChildNodes().any((r) => r.getStencil().id().endsWith('Lane'))
  }
  handleShapeRemove (option) {
    let sh = option.shape
    let parent = option.parent

    if (sh instanceof ORYX_Node && sh.getStencil().id().endsWith('Lane') && this.facade.isExecutingCommands()) {
      let pool = this.getParentPool(parent)
      if (pool && pool.parent) {
        let isLeaf = this.isLeafFn(sh)
        let parentHasMoreLanes = parent.getChildNodes().any((r) => r.getStencil().id().endsWith('Lane'))

        if (isLeaf && parentHasMoreLanes) {
          let command = new ResizeLanesCommand(sh, parent, pool, this)
          this.facade.executeCommands([command])
        } else if (!isLeaf) {
          // Find one of the selection, which is a lane and child of "sh" and is a leaf lane
          let a = this.facade.getSelection().any((select) => {
            return select instanceof ORYX_Node && select.getStencil().id().endsWith('Lane') &&
              select.isParent(sh) && this.isLeafFn(select)
          })
          if (!a) {
            class CommandB extends Command {
              constructor (shape, facade) {
                super()
                this.children = shape.getChildNodes(true)
                this.facade = facade
              }

              execute () {
                this.children.each(function (child) {
                  child.bounds.moveBy(30, 0)
                })
                //this.facade.getCanvas().update();
              }

              rollback () {
                this.children.each(function (child) {
                  child.bounds.moveBy(-30, 0)
                })
                //this.facade.getCanvas().update();
              }
            }
            this.facade.executeCommands([new CommandB(sh, this.facade)])
          }
        } else if (isLeaf && !parentHasMoreLanes && parent == pool) {
          parent.add(sh)
        }
      }
    }

  }

  hashChildShapes (shape) {
    let children = shape.getChildNodes()
    children.each((child) => {
      let id = child.id
      if (this.hashedSubProcesses[id]) {
        this.hashedSubProcesses[id] = child.absoluteXY()
        this.hashedSubProcesses[id].width = child.bounds.width()
        this.hashedSubProcesses[id].height = child.bounds.height()
        this.hashChildShapes(child)
      }
    })
  }

  /**
   * Handle the layouting of a sub process.
   * Mainly to adjust the child dockers of a sub process.
   *
   */
  handleSubProcess (option) {
    let sh = option.shape
    if (!this.hashedSubProcesses[sh.id]) {
      this.hashedSubProcesses[sh.id] = sh.absoluteXY()
      this.hashedSubProcesses[sh.id].width = sh.bounds.width()
      this.hashedSubProcesses[sh.id].height = sh.bounds.height()
      return
    }

    let offset = sh.absoluteXY()
    offset.x -= this.hashedSubProcesses[sh.id].x
    offset.y -= this.hashedSubProcesses[sh.id].y

    let resized = this.hashedSubProcesses[sh.id].width !== sh.bounds.width() || this.hashedSubProcesses[sh.id].height !== sh.bounds.height()

    this.hashedSubProcesses[sh.id] = sh.absoluteXY()
    this.hashedSubProcesses[sh.id].width = sh.bounds.width()
    this.hashedSubProcesses[sh.id].height = sh.bounds.height()
    this.hashChildShapes(sh)


    // Move dockers only if currently is not resizing
    if (this.facade.isExecutingCommands() && !resized) {
      this.moveChildDockers(sh, offset)
    }
  }

  moveChildDockers (shape, offset) {
    if (!offset.x && !offset.y) {
      return
    }

    let children = shape.getChildNodes(true)

    // Get all nodes
    let dockers = children
    // Get all incoming and outgoing edges
      .map(function (node) {
        return [].concat(node.getIncomingShapes())
          .concat(node.getOutgoingShapes())
      })
      // Flatten all including arrays into one
      .flatten()
      // Get every edge only once
      .uniq()
      // Get all dockers
      .map(function (edge) {
        return edge.dockers.length > 2 ?
          edge.dockers.slice(1, edge.dockers.length - 1) :
          []
      })
      // Flatten the dockers lists
      .flatten()

    let abs = shape.absoluteBounds()
    abs.moveBy(-offset.x, -offset.y)
    let obj = {}
    dockers.each(function (docker) {

      if (docker.isChanged) {
        return
      }

      let off = Object.clone(offset)

      if (!abs.isIncluded(docker.bounds.center())) {
        let index = docker.parent.dockers.indexOf(docker)
        let size = docker.parent.dockers.length
        let from = docker.parent.getSource()
        let to = docker.parent.getTarget()

        let bothAreIncluded = children.include(from) && children.include(to)

        if (!bothAreIncluded) {
          let previousIsOver = index !== 0 ? abs.isIncluded(docker.parent.dockers[index - 1].bounds.center()) : false
          let nextIsOver = index !== size - 1 ? abs.isIncluded(docker.parent.dockers[index + 1].bounds.center()) : false

          if (!previousIsOver && !nextIsOver) {
            return
          }

          let ref = docker.parent.dockers[previousIsOver ? index - 1 : index + 1]
          if (Math.abs(-Math.abs(ref.bounds.center().x - docker.bounds.center().x)) < 2) {
            off.y = 0
          } else if (Math.abs(-Math.abs(ref.bounds.center().y - docker.bounds.center().y)) < 2) {
            off.x = 0
          } else {
            return
          }
        }

      }

      obj[docker.getId()] = {
        docker: docker,
        offset: off
      }
    })

    // Set dockers
    this.facade.executeCommands([new ORYX_MoveDockersCommand(obj)])
  }

  /**
   * DragDocker.Docked Handler
   */
  handleDockerDocked (options) {
    let namespace = this.getNamespace()
    let edge = options.parent
    let edgeSource = options.target

    if (edge.getStencil().id() === namespace + 'SequenceFlow') {
      let isGateway = edgeSource.getStencil().groups().find(function (group) {
        if (group == 'Gateways')
          return group
      })
      if (!isGateway && (edge.properties['oryx-conditiontype'] == 'Expression'))
      // show diamond on edge source
        edge.setProperty('oryx-showdiamondmarker', true)
      else
      // do not show diamond on edge source
        edge.setProperty('oryx-showdiamondmarker', false)

      // update edge rendering
      //edge.update();

      this.facade.getCanvas().update()
    }
  }

  /**
   * Handler for layouting event 'layout.bpmn2_0.pool'
   * @param {Object} event
   */
  handleLayoutPool (event) {
    console.log(123)
    let pool = event.shape
    let selection = this.facade.getSelection()
    let currentShape = (selection.include(pool) ? pool : selection.first()) || pool
    this.currentPool = pool

    // Check if it is a pool or a lane
    if (!(currentShape.getStencil().id().endsWith('Pool') || currentShape.getStencil().id().endsWith('Lane'))) {
      return
    }

    // Check if the lane is within the pool and is not removed lately
    if (currentShape !== pool && !currentShape.isParent(pool) && !this.hashedBounds[pool.id][currentShape.id]) {
      return
    }

    if (!this.hashedBounds[pool.id]) {
      this.hashedBounds[pool.id] = {}
    }

    // Find all child lanes
    let lanes = this.getLanes(pool)
    if (lanes.horLanes.length <= 0) {
      return
    }
    let { horLanes, verLanes } = lanes

    let allLanes = this.getLanes(pool, true)
    let allLanesArry = [...allLanes.horLanes, ...allLanes.verLanes]
    let allHorLanes = allLanes.horLanes
    let considerForDockers = allLanes.horLanes.clone()
    let hashedPositions = new Map()
    allHorLanes.each(function (lane) {
      hashedPositions.set(lane.id, lane.bounds.upperLeft())
    })

    this.setLaneLineView(horLanes, verLanes)

    let deletedLanes = []
    let addedLanes = []
    // Get all new lanes
    let i = -1
    while (++i < allLanesArry.length) {
      if (!this.hashedBounds[pool.id][allLanesArry[i].id]) {
        addedLanes.push(allLanesArry[i])
      }
    }
    if (addedLanes.length > 0) {
      currentShape = addedLanes.first()
    }

    // Get all deleted lanes
    let resourceIds = $H(this.hashedBounds[pool.id]).keys()
    i = -1
    while (++i < resourceIds.length) {
      if (!allLanesArry.any((lane) => lane.id === resourceIds[i])) {
        deletedLanes.push(this.hashedBounds[pool.id][resourceIds[i]])
        selection = selection.without((r) => r.id === resourceIds[i])
      }
    }

    let height, width, x, y
    let effectBound
    let moveOffset = { x: 0, y: 0 }
    let poolTypeId = pool.getStencil().idWithoutNs()
    // 有新增或者删除 lane
    if (deletedLanes.length > 0 || addedLanes.length > 0) {
      height = this.updateHeight(pool)
      width = this.adjustWidth(lanes, pool)
      // pool.update()
    } else if (pool == currentShape) {
      /**
       * Set width/height depending on the pool
       * 当新增一个pool的时候，会马上触发第二次handleLayoutPool事件，此时pool == currentShape
       */
      let oldXY = this.hashedPoolPositions[pool.id]
      let xy = pool.bounds
      this.adjustPoolBothendsLanes(pool, horLanes, oldXY, xy)

      // Set height from the pool
      height = pool.bounds.height()
      // Set width from the pool
      width = this.adjustWidth(lanes, pool)
    } else {
      /**‚
       * Set width/height depending on containing lanes
       */
      console.log('lanes change !!!!!!')
      // Reposition the pool if one shape is selected and the upperleft has changed
      if (selection.length === 1 && this.isResized(currentShape, this.hashedBounds[pool.id][currentShape.id])) {
        let oldXY = this.hashedBounds[pool.id][currentShape.id].upperLeft()
        let xy = currentShape.absoluteXY()
        x = oldXY.x - xy.x
        y = oldXY.y - xy.y

        let currentShapeType = currentShape.getStencil().idWithoutNs()
        let changedLaneOldxy = this.hashedBounds[pool.id][currentShape.id]
        let changedLanexy = currentShape.absoluteBounds()
        let modifyLane
        let index = currentShape.orderSort
        // this.facade.getCanvas().update()
        // this.facade.setSelection([shape])

        if (currentShapeType === 'V-Lane') {
          if (changedLaneOldxy.a.x !== changedLanexy.a.x) {
            if (index > 0) {
              modifyLane = verLanes [index - 1]
              modifyLane.bounds.extend({ x: changedLanexy.a.x - changedLaneOldxy.a.x, y: 0 })
              currentShape.bounds.extend({ x: changedLanexy.a.x - changedLaneOldxy.a.x, y: 0 })
              currentShape.bounds.moveBy({ x: changedLaneOldxy.a.x - changedLanexy.a.x, y: 0 })
              currentShape = modifyLane
              x = 0
            }
            effectBound = {
              a: { x: changedLaneOldxy.a.x, y: 0 },
              b: { x: pool.bounds.b.x, y: pool.bounds.b.y }
            }
            moveOffset = { x: changedLanexy.a.x - changedLaneOldxy.a.x, y: 0 }
          } else if (changedLaneOldxy.b.x !== changedLanexy.b.x){
            effectBound = {
              a: { x: changedLaneOldxy.b.x, y: 0 },
              b: { x: pool.bounds.b.x, y: pool.bounds.b.y }
            }
            moveOffset = { x: changedLanexy.b.x - changedLaneOldxy.b.x, y: 0 }
          }

        } else {
          // 拖拽lane顶
          if (changedLaneOldxy.a.y !== changedLanexy.a.y) {
            if (index > 0) {
              // 除了第一个，默认是对其上一个Lane的尺寸缩放
              modifyLane = horLanes[index - 1]
              modifyLane.bounds.extend({ x: 0, y: changedLanexy.a.y - changedLaneOldxy.a.y })
              // currentShape.bounds = this.hashedBounds[pool.id][currentShape.id]
              currentShape.bounds.extend({ x: 0, y: changedLanexy.a.y - changedLaneOldxy.a.y })
              currentShape.bounds.moveBy({ x: 0, y: changedLaneOldxy.a.y - changedLanexy.a.y })
              currentShape = modifyLane
              y = 0
              // this.facade.setSelection([modifyLane])
            }

            // 确定影响范围，联动范围内的节点
            effectBound = {
              a: { x: 0, y: changedLaneOldxy.a.y },
              b: { x: pool.bounds.b.x, y: pool.bounds.b.y }
            }
            moveOffset = { x: 0, y: changedLanexy.a.y - changedLaneOldxy.a.y }
          } else if (changedLaneOldxy.b.y !== changedLanexy.b.y) {
            effectBound = {
              a: { x: 0, y: changedLaneOldxy.b.y },
              b: { x: pool.bounds.b.x, y: pool.bounds.b.y }
            }
            moveOffset = { x: 0, y: changedLanexy.b.y - changedLaneOldxy.b.y }
          }
        }

        // Adjust all other lanes beneath this lane
        if (x || y) {
          considerForDockers = considerForDockers.without(currentShape)
          this.adjustLanes(pool, this.getAllExcludedLanes(pool, currentShape), x, 0)
        }

        // Adjust all child lanes
        // let childLanes = this.getLanes(currentShape, true)
        // if (childLanes.length > 0) {
        //   if (this.shouldScale(currentShape)) {
        //     let old = this.hashedBounds[pool.id][currentShape.id]
        //     let scale = old.height() / currentShape.bounds.height()
        //     this.adjustLanes(pool, childLanes, x, y, scale)
        //   } else {
        //     this.adjustLanes(pool, childLanes, x, y, 0)
        //   }
        // }

      }

      // Cache all bounds
      let changes = allLanesArry.map((lane) => {
        return {
          shape: lane,
          bounds: lane.bounds.clone()
        }
      })
      // Get height and adjust child heights
      height = this.updateHeight(pool)
      // height = this.adjustHeight(horLanes, currentShape)
      // Check if something has changed and maybe create a command
      this.checkForChanges(allHorLanes, changes)
      // Set width from the current shape
      width = this.adjustWidth(lanes, pool)
    }

    this.setDimensions(pool, width, height, x, y)

    if (this.facade.isExecutingCommands() && (deletedLanes.length === 0 || addedLanes.length !== 0)) {
      // Update all dockers
      this.updateDockers(considerForDockers, pool)

      // Check if the order has changed
      let poolHashedPositions = this.hashedPositions[pool.id]
      if (poolHashedPositions) {
        let a = Array.from(poolHashedPositions.keys())
        if (a.some((key, i) => (allLanesArry[i] || {}).id !== key)) {
          class LanesHasBeenReordered extends Command {
            constructor (originPosition, newPosition, lanes, plugin, poolId) {
              super()
              this.originPosition = Object.clone(originPosition)
              this.newPosition = Object.clone(newPosition)
              this.lanes = lanes
              this.plugin = plugin
              this.pool = poolId
            }

            execute () {
              if (!this.executed) {
                this.executed = true
                this.lanes.each(function (lane) {
                  if (this.newPosition[lane.id])
                    lane.bounds.moveTo(this.newPosition[lane.id])
                }.bind(this))
                this.plugin.hashedPositions[this.pool] = Object.clone(this.newPosition)
              }
            }

            rollback () {
              this.lanes.each(function (lane) {
                if (this.originPosition[lane.id])
                  lane.bounds.moveTo(this.originPosition[lane.id])
              }.bind(this))
              this.plugin.hashedPositions[this.pool] = Object.clone(this.originPosition)
            }
          }

          let hp2 = new Hash()
          allLanesArry.each(function (lane) {
            hp2.set(lane.id, lane.bounds.upperLeft())
          })

          let command = new LanesHasBeenReordered(hashedPositions, hp2, allLanesArry, this, pool.id)
          this.facade.executeCommands([command])
        }
      }
    }

    this.hashedBounds[pool.id] = {}
    this.hashedPositions[pool.id] = hashedPositions

    i = -1
    while (++i < allLanesArry.length) {
      // Cache positions
      let lane = allLanesArry[i]
      this.hashedBounds[pool.id][lane.id] = lane.absoluteBounds()

      // Cache also the bounds of child shapes, mainly for child subprocesses
      this.hashChildShapes(lane)
      this.hashedLaneDepth[lane.id] = this.getDepth(lane, pool)
      this.forceToUpdateLane(lane)
    }

    if (moveOffset.x !== 0 || moveOffset.y !== 0) {
      this.nodesInLaneMoveby(effectBound, moveOffset)
    }

    this.hashedPoolPositions[pool.id] = pool.bounds.clone()

    // Update selection
    // this.facade.setSelection(selection);
  }

  shouldScale (element) {
    let childLanes = element.getChildNodes().findAll(function (shape) {
      return shape.getStencil().id().endsWith('Lane')
    })
    return childLanes.length > 1 || childLanes.any(function (lane) {
      return this.shouldScale(lane)
    }.bind(this))
  }


  setLaneLineView (horLanes, verLanes) {
    if (horLanes.length <= 0) return
    let l = horLanes.length
    let lasterLane = horLanes[l - 1]
    let bottomLine = lasterLane.node.getElementsByTagName('line')
    let lasterLaneVisible = bottomLine[0].getAttributeNS(null, 'visibility')
    // 当目前最后一个 H-lane 的 bottomLine 不是隐藏的
    if (lasterLaneVisible && lasterLaneVisible !== 'hidden') {
      horLanes.each((lane) => {
        let line = lane.node.getElementsByTagName('line')
        line[0].removeAttributeNS(null, 'visibility')
      })
      bottomLine[0].setAttributeNS(null, 'visibility', 'hidden')
    }

    let v = verLanes.length
    if (verLanes.length <= 0) return
    let firstVL = verLanes[0]
    let lasterVL = verLanes[v - 1]
    verLanes.each((lane) => {
      let dasharray = lane.node.getElementsByClassName('left_dasharray_line')
      let right = lane.node.getElementsByClassName('right_boder')
      let left = lane.node.getElementsByClassName('left_jian')
      dasharray[0].removeAttributeNS(null, 'visibility')
      right[0].setAttributeNS(null, 'visibility', 'hidden')
      left[0].removeAttributeNS(null, 'visibility')
    })
    let dasharrayLine = firstVL.node.getElementsByClassName('left_dasharray_line')
    let left = firstVL.node.getElementsByClassName('left_jian')
    dasharrayLine[0].setAttributeNS(null, 'visibility', 'hidden')
    left[0].setAttributeNS(null, 'visibility', 'hidden')
    let right = lasterVL.node.getElementsByClassName('right_boder')
    right[0].setAttributeNS(null, 'visibility', 'visible')
  }
  /**
   * Lookup if some bounds has changed
   * @param {Object} lanes
   * @param {Object} changes
   */
  checkForChanges (lanes, changes) {
    // Check if something has changed
    if (this.facade.isExecutingCommands() &&
      changes.any((change) => change.shape.bounds.toString() !== change.bounds.toString())) {

      class CommandB extends Command {
        constructor (changes) {
          super()
          this.oldState = changes
          this.newState = changes.map((s) => {
            return { shape: s.shape, bounds: s.bounds.clone() }
          })
        }

        execute () {
          if (this.executed) {
            this.applyState(this.newState)
          }
          this.executed = true
        }

        rollback () {
          this.applyState(this.oldState)
        }

        applyState (state) {
          state.each((s) => {
            s.shape.bounds.set(s.bounds.upperLeft(), s.bounds.lowerRight())
          })
        }
      }

      this.facade.executeCommands([new CommandB(changes)])
    }
  }

  isResized (shape, bounds) {
    if (!bounds || !shape) {
      return false
    }
    let oldB = bounds
    //var oldXY = oldB.upperLeft();
    //var xy = shape.absoluteXY();
    return Math.round(oldB.width() - shape.bounds.width()) !== 0 || Math.round(oldB.height() - shape.bounds.height()) !== 0
  }

  adjustPoolBothendsLanes (pool, lanes, oldXY, xy) {
    let length = lanes.length
    let child
    if (pool.getStencil().idWithoutNs() === 'Pool') {
      // 平移
      if (oldXY.a.y !== xy.a.y && oldXY.b.y !== xy.b.y) {
        return
      } else if (oldXY.a.y !== xy.a.y) {
        // pool 顶部线条进行了拖拽，则改变第一个Lane的高度，同时更新其他Lane的定位
        child = lanes[0]
        child.bounds.extend({ x: 0, y: oldXY.a.y - xy.a.y })
        this.adjustHeight(lanes, child)
      } else if (oldXY.b.y !== xy.b.y) {
        // pool 底部线条进行了拖拽，则改变最后一个Lane的高度
        child = lanes[length - 1]
        child.bounds.extend({ x: 0, y: xy.b.y - oldXY.b.y })
        this.hashedBounds[pool.id][child.id].extend({ x: 0, y: xy.b.y - oldXY.b.y })
      }
    } else {
      if (oldXY.a.x !== xy.a.x && oldXY.b.x !== xy.b.x) {
        return
      } else if (oldXY.a.x !== xy.a.x) {
        child = lanes[0]
        child.bounds.extend({ x: oldXY.a.x - xy.a.x, y: 0 })
        this.adjustVLaneWidth(lanes, child)
      } else if (oldXY.b.x !== xy.b.x) {
        child = lanes[length - 1]
        child.bounds.extend({ x: xy.b.x - oldXY.b.x, y: 0 })
        this.hashedBounds[pool.id][child.id].extend({ x: xy.b.x - oldXY.b.x, y: 0 })
      }
    }
  }

  findCanvasNodes () {
    let elements = this.facade.getCanvas().getChildShapes(true).findAll(function (value) {
      if (value instanceof ORYX_Node) {
        return true
      }
      return false
    })
    return elements
  }

  nodesInLaneMoveby (bound, offset) {
    const allShapes = this.facade.getCanvas().getChildShapes(true)
    // Calculate the elements from the childs of the canvas
    let elements = allShapes.findAll(function (value) {
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

    console.log(888888)
    const commands = [new ORYX_Command_Move(
      elements, offset, null, this.currentSelection, this
    )]
    this.facade.executeCommands(commands)

    // elements.each(function (s) {
    //   s.bounds.moveBy(offset)
    // })
  }

  updatePositionNodesInBound (lane, elements, x, y, scale) {
    let bound = lane.absoluteBounds()
    console.log(bound.a.y, bound.b.y)
    let nodes = elements.findAll(function (value) {
      let absBounds = value.absoluteBounds()
      let bA = absBounds.upperLeft()
      let bB = absBounds.lowerRight()
      console.log(bA.y, bB.y, value.node)
      if (bA.x > bound.a.x && bA.y > bound.a.y && bB.x < bound.b.x && bB.y < bound.b.y) {
        let cy = scale ? value.bounds.center().y - (value.bounds.center().y / scale) : -y
        console.log(233, x, -cy)
        value.bounds.moveBy((x || 0), cy)

        return false
      }
      return true
    })

    return nodes
  }

  adjustLanes (pool, lanes, x, y, scale) {
    scale = scale || 0
    // For every lane, adjust the child nodes with the offset
    lanes.each((l) => {
      l.getChildNodes().each((child) => {
        if (!child.getStencil().id().endsWith('Lane')) {
          let cy = scale ? child.bounds.center().y - (child.bounds.center().y / scale) : -y
          child.bounds.moveBy((x || 0), -cy)

          if (scale && child.getStencil().id().endsWith('Subprocess')) {
            this.moveChildDockers(child, { x: (0), y: -cy })
          }
        }
      })

      this.hashedBounds[pool.id][l.id].moveBy(-(x || 0), !scale ? -y : 0)
      if (scale) {
        l.isScaled = true
      }
    })
  }

  getAllExcludedLanes (parent, lane) {
    let lanes = []
    parent.getChildNodes().each((shape) => {
      if ((!lane || shape !== lane) && shape.getStencil().id().endsWith('Lane')) {
        lanes.push(shape)
        lanes = lanes.concat(this.getAllExcludedLanes(shape, lane))
      }
    })
    console.log('getAllExcludedLanes', lanes)
    return lanes
  }

  forceToUpdateLane (lane) {
    if (lane.bounds.height() !== lane._svgShapes[0].height) {
      lane.isChanged = true
      lane.isResized = true
      lane._update()
    }
  }

  getDepth (child, parent) {
    let i = 0
    while (child && child.parent && child !== parent) {
      child = child.parent
      ++i
    }
    return i
  }

  updateDepth (lane, fromDepth, toDepth) {
    let xOffset = (fromDepth - toDepth) * 30
    lane.getChildNodes().each(function (shape) {
      shape.bounds.moveBy(xOffset, 0);

      [].concat(children[j].getIncomingShapes())
        .concat(children[j].getOutgoingShapes())
    })

  }

  // 设置外形尺寸
  setDimensions (shape, width, height, x, y) {
    // let isLane = shape.getStencil().id().endsWith('Lane')
    let laneType = shape.getStencil().idWithoutNs()
    // Set the bounds
    if (laneType === 'Lane') {
      shape.bounds.set(
        0,
        shape.bounds.a.y,
        width ? 0 + width : shape.bounds.b.x,
        height ? shape.bounds.a.y + height : shape.bounds.b.y
      )
    } else if (laneType === 'V-Lane') {
      shape.bounds.set(
        shape.bounds.a.x,
        0,
        width ? shape.bounds.a.x + width : shape.bounds.b.x,
        height ? 0 + height : shape.bounds.b.y
      )
    } else {
      // Pool
      shape.bounds.set(
        (shape.bounds.a.x - (x || 0)),
        (shape.bounds.a.y - (y || 0)),
        width ? shape.bounds.a.x + width - (x || 0) : shape.bounds.b.x,
        height ? shape.bounds.a.y + height - (y || 0) : shape.bounds.b.y
      )
    }
    // shape.bounds.set(
    //   isLane ? 30 : (shape.bounds.a.x - (x || 0)),
    //   isLane ? shape.bounds.a.y : (shape.bounds.a.y - (y || 0)),
    //   width ? shape.bounds.a.x + width - (isLane ? 30 : (x || 0)) : shape.bounds.b.x,
    //   height ? shape.bounds.a.y + height - (isLane ? 0 : (y || 0)) : shape.bounds.b.y
    // )
  }

  setLanePosition (shape, x, y) {
    if (shape.getStencil().idWithoutNs() === 'Lane') {
      shape.bounds.moveTo(0, y)
    } else {
      shape.bounds.moveTo(x, 0)
    }
  }

  updateVPoolWidth (lanes, root) {
    if (lanes.length === 0) {
      return root.bounds.width()
    }
    let width = 0
    let i = -1
    while (++i < lanes.length) {
      lanes[i].bounds.set({ x: width, y: 30 }, {
        x: lanes[i].bounds.width() + width,
        y: lanes[i].bounds.height() + 30
      })
      width += lanes[i].bounds.width()
    }
    this.setDimensions(root, width)
    return width
  }

  adjustVLaneWidth (lanes, changedLane, propagateWidth) {
    let oldWidth = 0
    if (!changedLane && propagateWidth) {
      let i = -1
      while (++i < lanes.length) {
        oldWidth += lanes[i].bounds.width()
      }
    }
    let i = -1
    let width = 0
    while (++i < lanes.length) {
      if (lanes[i] === changedLane) {
        // Propagate new height down to the children
        this.adjustVLaneWidth(this.getLanes(lanes[i]), undefined, lanes[i].bounds.width())

        lanes[i].bounds.set({ x: width, y: 30 }, {
          x: lanes[i].bounds.width() + width,
          y: lanes[i].bounds.height() + 30
        })

      } else if (!changedLane && propagateWidth) {
        let tempWidth = (lanes[i].bounds.width() * propagateWidth) / oldWidth
        this.adjustVLaneWidth(this.getLanes(lanes[i]), undefined, tempWidth)
        this.setDimensions(lanes[i], tempWidth, null)
        this.setLanePosition(lanes[i], width, null)
      } else {
        // Get height from children
        let tempWidth = this.adjustVLaneWidth(this.getLanes(lanes[i]), changedLane, propagateWidth)
        if (!tempWidth) {
          tempWidth = lanes[i].bounds.width()
        }
        this.setDimensions(lanes[i], tempWidth, null)
        this.setLanePosition(lanes[i], width, null)
      }

      width += lanes[i].bounds.width()
    }

    return width
  }

  adjustWidth (lanes = {}, pool) {
    let { horLanes, verLanes } = lanes
    let pool_height = pool.bounds.height()
    let pool_width = pool.bounds.width()
    let width = this.HOR_LANE_TITLE_WIDTH

    verLanes.map((lane) => {
      this.setLanePosition(lane, width)
      this.setDimensions(lane, null, pool_height)
      width += lane.bounds.width()
    })

    width = width > pool_width ? width : pool_width

    // Set width to each lane
    horLanes.map((lane) => {
      this.setDimensions(lane, width)
      // this.adjustWidth(this.getLanes(lane), width - 30)
    })
    return width
  }

  // 所有横泳道更新bounds 并更新泳池的bounds，返回泳池的总高度
  adjustHeight (lanes, changedLane, propagateHeight) {
    let oldHeight = 0
    if (!changedLane && propagateHeight) {
      let i = -1
      while (++i < lanes.length) {
        oldHeight += lanes[i].bounds.height()
      }
    }

    let i = -1
    let height = this.HOR_POOL_TITLE_HEIGHT
    // Iterate trough every lane
    while (++i < lanes.length) {
      if (lanes[i] === changedLane) {
        console.log('!!!!!!!!!!!!!!!')
        // Propagate new height down to the children

        lanes[i].bounds.set({ x: 0, y: height }, {
          x: lanes[i].bounds.width(),
          y: lanes[i].bounds.height() + height
        })

      } else if (!changedLane && propagateHeight) {
        let tempHeight = (lanes[i].bounds.height() * propagateHeight) / oldHeight
        // Propagate height
        this.adjustHeight(this.getLanes(lanes[i]), undefined, tempHeight)
        // Set height propotional to the propagated and old height
        this.setDimensions(lanes[i], null, tempHeight)
        this.setLanePosition(lanes[i], null, height)
      } else {
        this.setLanePosition(lanes[i], null, height)
      }

      height += lanes[i].bounds.height()
    }

    return height
  }

  // 所有横泳道更新bounds 并更新泳池的bounds，返回泳池的总高度
  updateHeight (root) {
    let lanes = this.getLanes(root)
    let { horLanes, verLanes } = lanes
    if (horLanes.length === 0) {
      return root.bounds.height()
    }
    let height = this.HOR_POOL_TITLE_HEIGHT
    let i = -1
    while (++i < horLanes.length) {
      this.setLanePosition(horLanes[i], null, height)
      height += this.updateHeight(horLanes[i])
    }

    this.setDimensions(root, null, height)
    return height
  }

  getOffset (lane, includePool, pool) {
    let offset = { x: 0, y: 0 }

    /*var parent = lane;
     while(parent) {


     var offParent = this.hashedBounds[pool.id][parent.id] ||(includePool === true ? this.hashedPoolPositions[parent.id] : undefined);
     if (offParent){
     var ul = parent.bounds.upperLeft();
     var ulo = offParent.upperLeft();
     offset.x += ul.x-ulo.x;
     offset.y += ul.y-ulo.y;
     }

     if (parent.getStencil().id().endsWith("Pool")) {
     break;
     }

     parent = parent.parent;
     }       */

    offset = lane.absoluteXY()
    let hashed = this.hashedBounds[pool.id][lane.id] || (includePool === true ? this.hashedPoolPositions[lane.id] : undefined)
    if (hashed) {
      offset.x -= hashed.upperLeft().x
      offset.y -= hashed.upperLeft().y
    } else {
      return { x: 0, y: 0 }
    }
    return offset
  }

  getNextLane (shape) {
    while (shape && !shape.getStencil().id().endsWith('Lane')) {
      if (shape instanceof ORYX_Canvas) {
        return null
      }
      shape = shape.parent
    }
    return shape
  }

  getParentPool (shape) {
    while (shape && !shape.getStencil().id().endsWith('Pool')) {
      if (shape instanceof ORYX_Canvas) {
        return null
      }
      shape = shape.parent
    }
    return shape
  }

  updateDockers (lanes, pool) {
    let absPool = pool.absoluteBounds(), movedShapes = []
    let oldPool = (this.hashedPoolPositions[pool.id] || absPool).clone()

    let i = -1, j = -1, k = -1, l = -1, docker
    let dockers = {}

    while (++i < lanes.length) {
      if (!this.hashedBounds[pool.id][lanes[i].id]) {
        continue
      }

      let isScaled = lanes[i].isScaled
      delete lanes[i].isScaled
      let children = lanes[i].getChildNodes()
      let absBounds = lanes[i].absoluteBounds()
      let oldBounds = (this.hashedBounds[pool.id][lanes[i].id] || absBounds)
      //oldBounds.moveBy((absBounds.upperLeft().x-lanes[i].bounds.upperLeft().x),
      // (absBounds.upperLeft().y-lanes[i].bounds.upperLeft().y));
      let offset = this.getOffset(lanes[i], true, pool)
      let xOffsetDepth = 0

      let depth = this.getDepth(lanes[i], pool)
      if (this.hashedLaneDepth[lanes[i].id] !== undefined && this.hashedLaneDepth[lanes[i].id] !== depth) {
        xOffsetDepth = (this.hashedLaneDepth[lanes[i].id] - depth) * 30
        offset.x += xOffsetDepth
      }

      j = -1

      while (++j < children.length) {
        if (xOffsetDepth && !children[j].getStencil().id().endsWith('Lane')) {
          movedShapes.push({ xOffset: xOffsetDepth, shape: children[j] })
          children[j].bounds.moveBy(xOffsetDepth, 0)
        }

        if (children[j].getStencil().id().endsWith('Subprocess')) {
          this.moveChildDockers(children[j], offset)
        }

        let edges = [].concat(children[j].getIncomingShapes())
          .concat(children[j].getOutgoingShapes())
          // Remove all edges which are included in the selection from the list
          .findAll(function (r) {
            return r instanceof ORYX_Edge
          })

        k = -1
        while (++k < edges.length) {
          if (edges[k].getStencil().id().endsWith('MessageFlow')) {
            this.layoutEdges(children[j], [edges[k]], offset)
            continue
          }

          l = -1
          while (++l < edges[k].dockers.length) {
            docker = edges[k].dockers[l]
            if (docker.getDockedShape() || docker.isChanged) {
              continue
            }

            let pos = docker.bounds.center()

            // Check if the modified center included the new position
            let isOverLane = oldBounds.isIncluded(pos)
            // Check if the original center is over the pool
            let isOutSidePool = !oldPool.isIncluded(pos)
            let previousIsOverLane = l == 0 ? isOverLane : oldBounds.isIncluded(edges[k].dockers[l - 1].bounds.center())
            let nextIsOverLane = l == edges[k].dockers.length - 1 ? isOverLane : oldBounds.isIncluded(edges[k].dockers[l + 1].bounds.center())
            let off = Object.clone(offset)

            // If the
            if (isScaled && isOverLane && this.isResized(lanes[i], this.hashedBounds[pool.id][lanes[i].id])) {
              let relY = (pos.y - absBounds.upperLeft().y + off.y)
              off.y -= (relY - (relY * (absBounds.height() / oldBounds.height())))
            }

            // Check if the previous dockers docked shape is from this lane
            // Otherwise, check if the docker is over the lane OR is outside the lane
            // but the previous/next was over this lane
            if (isOverLane) {
              dockers[docker.id] = { docker: docker, offset: off }
            }
            /*else if (l == 1 && edges[k].dockers.length>2 && edges[k].dockers[l-1].isDocked()){
             var dockedLane = this.getNextLane(edges[k].dockers[l-1].getDockedShape());
             if (dockedLane != lanes[i])
             continue;
             dockers[docker.id] = {docker: docker, offset:offset};
             }
             // Check if the next dockers docked shape is from this lane
             else if (l == edges[k].dockers.length-2 && edges[k].dockers.length>2 && edges[k].dockers[l+1].isDocked()){
             var dockedLane = this.getNextLane(edges[k].dockers[l+1].getDockedShape());
             if (dockedLane != lanes[i])
             continue;
             dockers[docker.id] = {docker: docker, offset:offset};
             }

             else if (isOutSidePool) {
             dockers[docker.id] = {docker: docker, offset:this.getOffset(lanes[i], true, pool)};
             }*/


          }
        }

      }
    }

    // Move the moved children
    class MoveChildCommand extends Command {
      constructor (state) {
        super()
        this.state = state
      }

      execute () {
        if (this.executed) {
          this.state.each(function (s) {
            s.shape.bounds.moveBy(s.xOffset, 0)
          })
        }
        this.executed = true
      }

      rollback () {
        this.state.each(function (s) {
          s.shape.bounds.moveBy(-s.xOffset, 0)
        })
      }
    }

    // Set dockers
    this.facade.executeCommands([new ORYX_MoveDockersCommand(dockers), new MoveChildCommand(movedShapes)])
  }

  moveBy (pos, offset) {
    pos.x += offset.x
    pos.y += offset.y
    return pos
  }

  getHashedBounds (shape) {
    return this.currentPool && this.hashedBounds[this.currentPool.id][shape.id] ? this.hashedBounds[this.currentPool.id][shape.id] : shape.absoluteBounds()
  }

  /**
   * Returns a set on all child lanes for the given Shape. If recursive is TRUE, also indirect children will be
   * returned (default is FALSE) The set is sorted with first child the lowest y-coordinate and the last one the
   * highest.
   * @param {ORYX.Core.Shape} shape
   * @param {boolean} recursive
   */
  getLanes (shape, recursive) {
    let namespace = this.getNamespace()
    let verLanes = []
    let horLanes = []
    // Get all the child lanes
    shape.getChildNodes(recursive || false).map(node => {
      if (node.getStencil().id() === namespace + 'Lane') {
        horLanes.push(node)
      } else if (node.getStencil().id() === namespace + 'V-Lane') {
        verLanes.push(node)
      }
    })

    // Sort all lanes by there y coordinate
    horLanes = horLanes.sort((a, b) => {
      // Get y coordinates for upper left and lower right
      let auy = Math.round(a.bounds.upperLeft().y)
      let buy = Math.round(b.bounds.upperLeft().y)
      let aly = Math.round(a.bounds.lowerRight().y)
      let bly = Math.round(b.bounds.lowerRight().y)

      let ha = this.getHashedBounds(a)
      let hb = this.getHashedBounds(b)

      // Get the old y coordinates
      let oauy = Math.round(ha.upperLeft().y)
      let obuy = Math.round(hb.upperLeft().y)
      let oaly = Math.round(ha.lowerRight().y)
      let obly = Math.round(hb.lowerRight().y)

      // If equal, than use the old one
      if (auy == buy && aly == bly) {
        auy = oauy
        buy = obuy
        aly = oaly
        bly = obly
      }

      if (Math.round(a.bounds.height() - ha.height()) === 0 && Math.round(b.bounds.height() - hb.height()) === 0) {
        return auy < buy ? -1 : (auy > buy ? 1 : 0)
      }

      // Check if upper left and lower right is completely above/below
      let above = auy < buy && aly < bly
      let below = auy > buy && aly > bly
      // Check if a is above b including the old values
      let slightlyAboveBottom = auy < buy && aly >= bly && oaly < obly
      let slightlyAboveTop = auy >= buy && aly < bly && oauy < obuy
      // Check if a is below b including the old values
      let slightlyBelowBottom = auy > buy && aly <= bly && oaly > obly
      let slightlyBelowTop = auy <= buy && aly > bly && oauy > obuy

      // Return -1 if a is above b, 1 if b is above a, or 0 otherwise
      return (above || slightlyAboveBottom || slightlyAboveTop ? -1 : (below || slightlyBelowBottom || slightlyBelowTop ? 1 : 0))
    })
    // Sort all lanes by there x coordinate
    verLanes = verLanes.sort((a, b) => {
      // Get y coordinates for upper left and lower right
      let aux = Math.round(a.bounds.upperLeft().x)
      let bux = Math.round(b.bounds.upperLeft().x)
      let alx = Math.round(a.bounds.lowerRight().x)
      let blx = Math.round(b.bounds.lowerRight().x)

      let ha = this.getHashedBounds(a)
      let hb = this.getHashedBounds(b)

      // Get the old y coordinates
      let oaux = Math.round(ha.upperLeft().x)
      let obux = Math.round(hb.upperLeft().x)
      let oalx = Math.round(ha.lowerRight().x)
      let oblx = Math.round(hb.lowerRight().x)

      // If equal, than use the old one
      if (aux == bux && alx == blx) {
        aux = oaux
        bux = obux
        alx = oalx
        blx = oblx
      }

      if (Math.round(a.bounds.width() - ha.width()) === 0 && Math.round(b.bounds.width() - hb.width()) === 0) {
        return aux < bux ? -1 : (aux > bux ? 1 : 0)
      }

      // Check if upper left and lower right is completely above/below
      let above = aux < bux && alx < blx
      let below = aux > bux && alx > blx
      // Check if a is above b including the old values
      let slightlyAboveBottom = aux < bux && alx >= blx && oalx < oblx
      let slightlyAboveTop = aux >= bux && alx < blx && oaux < obux
      // Check if a is below b including the old values
      let slightlyBelowBottom = aux > bux && alx <= blx && oalx > oblx
      let slightlyBelowTop = aux <= bux && alx > blx && oaux > obux

      // Return -1 if a is above b, 1 if b is above a, or 0 otherwise
      return (above || slightlyAboveBottom || slightlyAboveTop ? -1 : (below || slightlyBelowBottom || slightlyBelowTop ? 1 : 0))
    })


    horLanes.each((l, index) => {
      l.orderSort = index
    })
    verLanes.each((l, index) => {
      l.orderSort = index
    })
    // console.log('lanes', lanes)
    return {
      horLanes,
      verLanes
    }
  }

  getNamespace () {
    if (!this.namespace) {
      let stencilsets = this.facade.getStencilSets()
      if (stencilsets.keys()) {
        this.namespace = stencilsets.keys()[0]
      } else {
        return undefined
      }
    }
    return this.namespace
  }
}
