import ORYX_Config from '../CONFIG'
import ORYX_Utils from '../Utils'
import ORYX_Controls from '../core/Controls/index'
import ORYX_Edge from '../core/Edge'
import ORYX_Node from '../core/Node'
import ORYX_Shape from '../core/Shape'
import ORYX_Canvas from '../core/Canvas'
import ORYX_Math from '../core/Math'

import UIDragFunction from '../core/UIEnableDrag'
import DragDockerCommand from '../../flowable/Command/DragDockerCommand'
import layoutEdgesCommand from '../../flowable/Command/layoutEdgesCommand'

export default class DragDocker {
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
    this.docker = undefined
    this.dockerParent = undefined
    this.dockerSource = undefined
    this.dockerTarget = undefined
    this.lastUIObj = undefined
    this.isStartDocker = undefined
    this.isEndDocker = undefined
    this.undockTreshold = 10
    this.initialDockerPosition = undefined
    this.outerDockerNotMoved = undefined
    this.isValid = false

    // For the Drag and Drop
    // Register on MouseDown-Event on a Docker
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_DOCKERDRAG, this.handleDockerDrag.bind(this))


    // Register on over/out to show / hide a docker
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEOVER, this.handleMouseOver.bind(this))
    this.facade.registerOnEvent(ORYX_Config.EVENT_MOUSEOUT, this.handleMouseOut.bind(this))
  }

  /**
   * MouseOut Handler
   *
   */
  handleMouseOut (event, uiObj) {
    // If there is a Docker, hide this
    if (!this.docker && uiObj instanceof ORYX_Controls.Docker) {
      uiObj.hide()
    } else if (!this.docker && uiObj instanceof ORYX_Edge) {
      uiObj.dockers.each(function (docker) {
        docker.hide()
      })
    }
  }

  /**
   * MouseOver Handler
   *
   */
  handleMouseOver (event, uiObj) {
    // If there is a Docker, show this
    if (!this.docker && uiObj instanceof ORYX_Controls.Docker) {
      uiObj.show()
    } else if (!this.docker && uiObj instanceof ORYX_Edge) {
      uiObj.dockers.each(function (docker) {
        docker.show()
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
    // If there is a Docker
    if (uiObj instanceof ORYX_Controls.Docker && uiObj.isMovable) {

      /* Buffering shape selection and clear selection*/
      this.shapeSelection = this.facade.getSelection()
      this.facade.setSelection()

      this.docker = uiObj
      this.initialDockerPosition = this.docker.bounds.center()
      this.outerDockerNotMoved = false
      this.dockerParent = uiObj.parent

      // Define command arguments
      this._commandArg = {
        docker: uiObj,
        dockedShape: uiObj.getDockedShape(),
        refPoint: uiObj.referencePoint || uiObj.bounds.center()
      }

      // Show the Docker
      this.docker.show()

      // If the Dockers Parent is an Edge,
      // and the Docker is either the first or last Docker of the Edge
      let parentDockers = uiObj.parent.dockers
      if (uiObj.parent instanceof ORYX_Edge
        && (parentDockers.first() == uiObj || parentDockers.last() == uiObj)) {

        // Get the Edge Source or Target
        if (parentDockers.first() == uiObj && parentDockers.last().getDockedShape()) {
          this.dockerTarget = parentDockers.last().getDockedShape()
        } else if (parentDockers.last() == uiObj && parentDockers.first().getDockedShape()) {
          this.dockerSource = parentDockers.first().getDockedShape()
        }

      } else {
        // If there parent is not an Edge, undefined the Source and Target
        this.dockerSource = undefined
        this.dockerTarget = undefined
      }

      let dockerParent = this.docker.parent
      this.isStartDocker = dockerParent.dockers.first() === this.docker
      this.isEndDocker = dockerParent.dockers.last() === this.docker

      // add to canvas while dragging
      this.facade.getCanvas().add(dockerParent)

      // Hide all Labels from Docker
      dockerParent.getLabels().each(function (label) {
        label.hide()
      })

      let eventCoordinates = this.facade.eventCoordinates(event)
      eventCoordinates = ORYX_Utils.pointHandleBelow10ToSvg(eventCoordinates)

      // Undocked the Docker from current Shape
      if ((!this.isStartDocker && !this.isEndDocker) || !this.docker.isDocked()) {
        this.docker.setDockedShape(undefined)
        // Set the Docker to the center of the mouse pointer
        this.docker.bounds.centerMoveTo(eventCoordinates)
        this.dockerParent._update()
      } else {
        this.outerDockerNotMoved = true
      }

      let option = {
        movedCallback: this.dockerMoved.bind(this),
        upCallback: this.dockerMovedFinished.bind(this)
      }
      this.startEventPos = eventCoordinates

      // Enable the Docker for Drag'n'Drop, give the mouseMove and mouseUp-Callback with
      UIDragFunction.UIEnableDrag(event, uiObj, option)
    }
  }

  /**
   * Docker MouseMove Handler
   *
   */
  dockerMoved (event) {
    this.outerDockerNotMoved = false
    let snapToMagnet = undefined
    let middleMagnet = undefined
    this.snapToMagnet = null
    this.middleMagnet = null

    if (this.docker.parent) {
      if (this.isStartDocker || this.isEndDocker) {
        // Get the EventPosition and all Shapes on these point
        let evPos = this.facade.eventCoordinates(event)
        evPos = ORYX_Utils.pointHandleBelow10ToSvg(evPos)

        if (this.docker.isDocked()) {
          /* Only consider start/end dockers if they are moved over a treshold */
          let distanceDockerPointer =
            ORYX_Math.getDistancePointToPoint(evPos, this.initialDockerPosition)
          if (distanceDockerPointer < this.undockTreshold) {
            this.outerDockerNotMoved = true
            return
          }

          /* Undock the docker */
          this.docker.setDockedShape(undefined)
          // Set the Docker to the center of the mouse pointer
          // this.docker.bounds.centerMoveTo(evPos);
          this.dockerParent._update()
        }

        let shapes = this.facade.getCanvas().getAbstractShapesAtPosition(evPos)

        // Get the top level Shape on these, but not the same as Dockers parent
        let uiObj = shapes.pop()
        if (this.docker.parent === uiObj) {
          uiObj = shapes.pop()
        }

        // If the top level Shape the same as the last Shape, then return
        if (this.lastUIObj == uiObj) {
          // return;

          // If the top level uiObj instance of Shape and this isn't the parent of the docker
        } else if (uiObj instanceof ORYX_Shape) {

          // Ask by the StencilSet if the source, the edge and the target valid connections.
          if (this.docker.parent instanceof ORYX_Edge) {
            let highestParent = this.getHighestParentBeforeCanvas(uiObj)
            /* Ensure that the shape to dock is not a child shape
             * of the same edge.
             */
            if (highestParent instanceof ORYX_Edge && this.docker.parent === highestParent) {
              this.isValid = false
              this.dockerParent._update()
              return
            }
            this.isValid = false
            let curObj = uiObj, orgObj = uiObj
            while (!this.isValid && curObj && !(curObj instanceof ORYX_Canvas)) {
              uiObj = curObj
              this.isValid = this.facade.getRules().canConnect({
                sourceShape: this.dockerSource ? // Is there a docked source
                  this.dockerSource : // than set this
                  (this.isStartDocker ? // if not and if the Docker is the start docker
                    uiObj : // take the last uiObj
                    undefined), // if not set it to undefined;
                edgeShape: this.docker.parent,
                targetShape: this.dockerTarget ? // Is there a docked target
                  this.dockerTarget : // than set this
                  (this.isEndDocker ? // if not and if the Docker is not the start docker
                    uiObj : // take the last uiObj
                    undefined) // if not set it to undefined;
              })
              curObj = curObj.parent
            }

            // Reset uiObj if no
            // valid parent is found
            if (!this.isValid) {
              uiObj = orgObj
            }

          } else {
            this.isValid = this.facade.getRules().canConnect({
              sourceShape: uiObj,
              edgeShape: this.docker.parent,
              targetShape: this.docker.parent
            })
          }

          // If there is a lastUIObj, hide the magnets
          if (this.lastUIObj) {
            this.hideMagnets(this.lastUIObj)
          }

          // If there is a valid connection, show the magnets
          if (this.isValid) {
            this.showMagnets(uiObj)
          }

          // Set the Highlight Rectangle by these value
          this.showHighlight(uiObj, this.isValid ? this.VALIDCOLOR : this.INVALIDCOLOR)

          // Buffer the current Shape
          this.lastUIObj = uiObj
        } else {
          // If there is no top level Shape, then hide the highligting of the last Shape
          this.hideHighlight()
          this.lastUIObj ? this.hideMagnets(this.lastUIObj) : null
          this.lastUIObj = undefined
          this.isValid = false
        }

        // Snap to the nearest Magnet
        if (this.lastUIObj && this.isValid && !(event.shiftKey || event.ctrlKey)) {
          snapToMagnet = this.lastUIObj.magnets.find((magnet) => {
            if (!magnet.anchorBottom && !magnet.anchorLeft &&
              !magnet.anchorRight && !magnet.anchorTop) {
              this.middleMagnet = magnet
            }
            return magnet.absoluteBounds().isIncluded(evPos)
          })

          if (snapToMagnet) {
            this.docker.bounds.centerMoveTo(snapToMagnet.absoluteCenterXY())
            // this.docker.update()
          }
        }
      }
    }
    // Snap to on the nearest Docker of the same parent
    if (!(event.shiftKey || event.ctrlKey) && !snapToMagnet) {
      let minOffset = ORYX_Config.DOCKER_SNAP_OFFSET
      let nearestX = minOffset + 1
      let nearestY = minOffset + 1
      let dockerCenter = this.docker.bounds.center()

      if (this.docker.parent) {
        let parentDockers = this.docker.parent.dockers
        parentDockers.each((function (docker) {
          if (this.docker == docker) {
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

          this.docker.bounds.centerMoveTo(dockerCenter.x + nearestX, dockerCenter.y + nearestY)
          // this.docker.update()
        } else {
          let previous = parentDockers[Math.max(parentDockers.indexOf(this.docker) - 1, 0)]
          let next = parentDockers[Math.min(parentDockers.indexOf(this.docker) + 1, parentDockers.length - 1)]

          if (previous && next && previous !== this.docker && next !== this.docker) {
            let cp = previous.bounds.center()
            let cn = next.bounds.center()
            let cd = this.docker.bounds.center()

            // Checks if the point is on the line between previous and next
            if (ORYX_Math.isPointInLine(cd.x, cd.y, cp.x, cp.y, cn.x, cn.y, 10)) {
              // Get the rise
              let raise = (Number(cn.y) - Number(cp.y)) / (Number(cn.x) - Number(cp.x))
              // Calculate the intersection point
              let intersecX = ((cp.y - (cp.x * raise)) - (cd.y - (cd.x * (-Math.pow(raise, -1))))) / ((-Math.pow(raise, -1)) - raise)
              let intersecY = (cp.y - (cp.x * raise)) + (raise * intersecX)

              if (isNaN(intersecX) || isNaN(intersecY)) {
                return
              }

              this.docker.bounds.centerMoveTo(intersecX, intersecY)
            }
          }

        }
      }
    }
    this.snapToMagnet = this.middleMagnet || snapToMagnet
    this.dockerParent._update()
  }

  /**
   * Docker MouseUp Handler
   *
   */
  dockerMovedFinished (event) {
    /* Reset to buffered shape selection */
    this.facade.setSelection(this.shapeSelection)

    // Hide the border
    this.hideHighlight()

    // Show all Labels from Docker
    this.dockerParent.getLabels().each(function (label) {
      label.show()
      // label.update();
    })

    if (this.snapToMagnet) {
      this.docker.bounds.centerMoveTo(this.snapToMagnet.absoluteCenterXY())
    }

    // If there is a last top level Shape
    if (this.lastUIObj && (this.isStartDocker || this.isEndDocker)) {
      // If there is a valid connection, the set as a docked Shape to them
      if (this.isValid) {
        this.docker.setDockedShape(this.lastUIObj)
        this.facade.raiseEvent({
          type: ORYX_Config.EVENT_DRAGDOCKER_DOCKED,
          docker: this.docker,
          parent: this.docker.parent,
          target: this.lastUIObj
        })
      }

      this.hideMagnets(this.lastUIObj)
    }

    // Hide the Docker
    this.docker.hide()

    if (this.outerDockerNotMoved) {
      // Get the EventPosition and all Shapes on these point
      let evPos = this.facade.eventCoordinates(event)
      let shapes = this.facade.getCanvas().getAbstractShapesAtPosition(evPos)

      /* Remove edges from selection */
      let shapeWithoutEdges = shapes.findAll(function (node) {
        return node instanceof ORYX_Node
      })
      shapes = shapeWithoutEdges.length ? shapeWithoutEdges : shapes
      this.facade.setSelection(shapes)
    } else {
      let edge = this.docker.parent
      if (edge) {
        // Instanziate the dockCommand
        let dockedShape = this.docker.getDockedShape()
        let newRefPoint = dockedShape ? this.docker.referencePoint : this.docker.bounds.center()
        let oldRefPoint = this._commandArg.refPoint
        const command = new DragDockerCommand(
          this.docker,
          newRefPoint,
          oldRefPoint,
          dockedShape,
          this._commandArg.dockedShape, this.facade)

        let doCommands = [command]
        // 如果端点有连接元素，则更新连接线，保证折线直角
        if (dockedShape) {
          let offset = {
            x: newRefPoint.x - oldRefPoint.x,
            y: newRefPoint.y - oldRefPoint.y
          }
          // console.log(3333, edge, dockedShape, offset)
          this.edgeLayoutByDragDocker = true // 标记行为，若移动dockers,重新计算连线
          const edgeLayout = new layoutEdgesCommand([edge], dockedShape, offset, this)
          doCommands.push(edgeLayout)
        }

        this.facade.executeCommands(doCommands)
      }
    }

    // Update all Shapes
    // this.facade.updateSelection();

    // Undefined all variables
    this.docker = undefined
    this.dockerParent = undefined
    this.dockerSource = undefined
    this.dockerTarget = undefined
    this.lastUIObj = undefined
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

  /**
   * Hide the highlighting
   */
  hideHighlight () {
    this.facade.raiseEvent({ type: ORYX_Config.EVENT_HIGHLIGHT_HIDE, highlightId: 'validDockedShape' })
  }

  /**
   * Show the highlighting
   *
   */
  showHighlight (uiObj, color) {
    this.facade.raiseEvent({
      type: ORYX_Config.EVENT_HIGHLIGHT_SHOW,
      highlightId: 'validDockedShape',
      elements: [uiObj],
      color: color
    })
  }

  showMagnets (uiObj) {
    uiObj.magnets.each(function (magnet) {
      magnet.show()
    })
  }

  hideMagnets (uiObj) {
    uiObj.magnets.each(function (magnet) {
      magnet.hide()
    })
  }

  getHighestParentBeforeCanvas (shape) {
    if (!(shape instanceof ORYX_Shape)) {
      return undefined
    }

    let parent = shape.parent
    while (parent && !(parent.parent instanceof ORYX_Canvas)) {
      parent = parent.parent
    }

    return parent
  }

}
