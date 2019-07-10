import ORYX_Config from '../CONFIG'
import ORYX_Utils from '../Utils'
import ORYX_Controls from '../core/Controls/index'
import ORYX_Edge from '../core/Edge'
import ORYX_Node from '../core/Node'
import ORYX_Shape from '../core/Shape'
import ORYX_Canvas from '../core/Canvas'
import ORYX_Math from '../core/Math'

import UIDragFunction from '../core/UIEnableDrag'
import DragVisualCommand from '../../flowable/Command/DragVisualCommand'
import layoutEdgesCommand from '../../flowable/Command/layoutEdgesCommand'

export default class DragVisual {
  /**
   *  Constructor
   *  @param {Object} Facade: The Facade of the Editor
   */
  constructor (facade) {
    this.facade = facade
    // Set the valid and invalid color
    this.VALIDCOLOR = ORYX_Config.SELECTION_VALID_COLOR
    this.INVALIDCOLOR = ORYX_Config.SELECTION_INVALID_COLOR

    // Define Variables
    this.shapeSelection = undefined
    this.visual = undefined
    this.docker = undefined
    this.dockerParent = undefined
    this.dockerSource = undefined
    this.dockerTarget = undefined
    this.lastUIObj = undefined
    this.isStartDocker = undefined
    this.isEndDocker = undefined
    this.undockTreshold = 10
    this.initialVisualosition = undefined
    this.initialDockerPosition = undefined
    this.visualMoveOffset = 0
    this.outerDockerNotMoved = undefined
    this.isValid = false

    // For the Drag and Drop
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_DOCKERDRAG, this.handleDockerDrag.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEOVER, this.handleMouseOver.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEOUT, this.handleMouseOut.bind(this))
  }

  handleMouseOut (event, uiObj) {
    // If there is a visual, hide this
    if (!this.visual && uiObj instanceof ORYX_Controls.Segment) {
      uiObj.hide()
    } else if (!this.visual && uiObj instanceof ORYX_Edge) {
      uiObj.visuals.each(function (visual) {
        visual.hide()
      })
    }
  }

  handleMouseOver (event, uiObj) {
    // If there is a visual, show this
    if (!this.visual && uiObj instanceof ORYX_Controls.Segment) {
      uiObj.show()
    } else if (!this.visual && uiObj instanceof ORYX_Edge) {
      uiObj.visuals.each(function (visual) {
        visual.show()
      })
    }
  }

  /**
   * DockerDrag Handler
   * delegates the uiEvent of the drag event to the mouseDown function
   */
  handleDockerDrag (event, uiObj) {
    this.handleMouseDown(event.uiEvent, uiObj)
  }

  /**
   * MouseDown Handler
   *
   */
  handleMouseDown (event, uiObj) {
    // If there is a visual
    if (uiObj instanceof ORYX_Controls.Segment && uiObj.isMovable) {

      /* Buffering shape selection and clear selection*/
      this.shapeSelection = this.facade.getSelection()
      this.facade.setSelection()

      this.visual = uiObj
      this.isStraightLine = this.visual.isStraightLine
      this.initialVisualPosition = this.isStraightLine === 'ver'?
        this.visual.segmentStartDocker.x : this.visual.segmentStartDocker.y
      this.visualParent = uiObj.parent
      this.isStartDocker = this.visual.segmentStartDocker
      this.isEndDocker = this.visual.segmentEndDocker

      // Define command arguments
      this._commandArg = {
        visual: uiObj,
        isStraightLine: this.isStraightLine,
        refPoint: this.initialVisualPosition
      }

      // Show the Docker
      this.visual.show()
      let eventCoordinates = this.facade.eventCoordinates(event)
      eventCoordinates = ORYX_Utils.pointHandleBelow10ToSvg(eventCoordinates)
      let option = {
        movedCallback: this.visualMoved.bind(this),
        upCallback: this.visualMovedFinished.bind(this)
      }
      this.startEventPos = eventCoordinates
      // Enable the Docker for Drag'n'Drop, give the mouseMove and mouseUp-Callback with
      UIDragFunction.UIEnableDrag(event, uiObj, option)
    }
  }

  /**
   * visual MouseMove Handler
   */
  visualMoved (event) {
    let evPos = this.facade.eventCoordinates(event)
    evPos = ORYX_Utils.pointHandleBelow10ToSvg(evPos)

    let parentDockers = this.visualParent.dockers
    // Snap to on the nearest Docker of the same parent
    let minOffset = ORYX_Config.DOCKER_SNAP_OFFSET
    let nearestX = minOffset + 1
    let nearestY = minOffset + 1
    let dockerCenter = this.visual.bounds.center()

    if (this.visualParent) {
      parentDockers.each((function (docker) {
        if (this.isStartDocker  == docker || this.isEndDocker   == docker) {
          return
        }

        let center = docker.referencePoint ? docker.getAbsoluteReferencePoint() : docker.bounds.center()

        nearestX = Math.abs(nearestX) > Math.abs(center.x - dockerCenter.x) ?
          center.x - dockerCenter.x : nearestX
        nearestY = Math.abs(nearestY) > Math.abs(center.y - dockerCenter.y) ?
          center.y - dockerCenter.y : nearestY

      }).bind(this))

      if (Math.abs(nearestX) < minOffset || Math.abs(nearestY) < minOffset) {
        nearestX = Math.abs(nearestX) < minOffset ? nearestX : 0
        nearestY = Math.abs(nearestY) < minOffset ? nearestY : 0

        this.moveVisualDockers(dockerCenter.x + nearestX, dockerCenter.y + nearestY)
      } else {
        this.moveVisualDockers(evPos.x, evPos.y)
      }
    }
    this.visualParent._update()
  }

  moveVisualDockers (x, y) {
    let a1 = this.isStartDocker.bounds.center()
    let a2 = this.isEndDocker.bounds.center()
    if (this.isStraightLine === 'ver') {
      this.isStartDocker.bounds.centerMoveTo(x, a1.y)
      this.isEndDocker.bounds.centerMoveTo(x, a2.y)
    } else if (this.isStraightLine === 'hor') {
      this.isStartDocker.bounds.centerMoveTo(a1.x, y)
      this.isEndDocker.bounds.centerMoveTo(a2.x, y)
    }
  }
  /**
   * visual MouseUp Handler
   */
  visualMovedFinished (event) {
    /* Reset to buffered shape selection */
    this.facade.setSelection(this.shapeSelection)
    // Hide the visual
    this.visual.hide()
    let edge = this.visual.parent
    if (edge) {
      // Instanziate the dockCommand
      this.newRefPoint = this.isStraightLine === 'ver'?
        this.visual.segmentStartDocker.x : this.visual.segmentStartDocker.y
      const command = new DragVisualCommand(
        this.visual,
        this.newRefPoint,
        this.initialVisualPosition,
        this.facade)

      let doCommands = [command]
      this.facade.executeCommands(doCommands)
    }
    this.visual = undefined
    this.visualParent = undefined
  }

  doLayout (shapes) {
    // Raises a do layout event
    if (this.facade.raiseEvent) {
      this.facade.raiseEvent({
        type: ORYX_Config.EVENT_LAYOUT,
        shapes: shapes
      })
    } else {
      this.facade.handleEvents({
        type: ORYX_Config.EVENT_LAYOUT,
        shapes: shapes
      })
    }
  }
}
