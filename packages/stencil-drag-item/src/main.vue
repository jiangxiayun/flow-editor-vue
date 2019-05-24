<template>
  <div :id="item.id"
       :title="item.description"
       v-draggable="{
       onStart: 'startDragCallback',
       onDrag: 'dragCallback', revert: 'invalid', helper: 'clone', opacity: 0.5}"
       data-drag="true"
       data-model="draggedElement">
    <slot>
      <img v-if="UI_CONFIG.NODE_ICON_TYPE === 'images'"
           :src="require(`@/assets/images/bpmn2.0/icons/${item.icon}`)" width="16px;" height="16px;"/>
      <i v-else-if="UI_CONFIG.NODE_ICON_TYPE === 'iconfont'" class="iconfont" :class="item.icon"></i>
      <span>{{item.name}}</span>
    </slot>
  </div>
</template>

<script>
  import ORYX_CONFIG from 'src/oryx/CONFIG'
  import { draggable } from 'src/directives/drag-drop'
  import { EventBus } from 'src/EventBus'

  export default {
    name: 'stencilDragItem',
    data () {
      return {
        dragModeOver_drag: false,
        dragModeOver: false,
        myArray: [],
        drag: false,
        UI_CONFIG: ORYX_CONFIG.CustomConfigs.UI_CONFIG
      }
    },
    directives: { draggable },
    props: {
      editorManager: {},
      item: {
        type: Object
      }
    },
    mounted () {
      EventBus.$on('UPDATE_dragModeOver_forDragItem', (status) => {
        // console.log(9999, status)
        this.dragModeOver_drag = status
      })
    },
    methods: {
      dragStart (evt) {
        console.log(1, evt.item)
      },
      dragMove (evt) {
        console.log(2, evt)
      },
      dragEnd (evt) {
        console.log(3, evt)
      },
      startDragCallback (event, ui) {
        console.log('startDragCallback', ui)
        this.dragModeOver = false
        EventBus.$emit('UPDATE_dragModeOver', false)
        EventBus.$emit('UPDATE_quickMenu', false)
        if (!ui.helper.hasClass('stencil-item-dragged')) {
          ui.helper.addClass('stencil-item-dragged')
        }
      },
      dragCallback (event, ui) {
        // console.log('dragCallback')
        if (this.dragModeOver_drag !== false) {
          const coord = this.editorManager.eventCoordinatesXY(event.pageX, event.pageY)

          let additionalIEZoom = 1
          if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
            let ua = navigator.userAgent
            if (ua.indexOf('MSIE') >= 0) {
              // IE 10 and below
              let zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100)
              if (zoom !== 100) {
                additionalIEZoom = zoom / 100
              }
            }
          }

          if (additionalIEZoom !== 1) {
            coord.x = coord.x / additionalIEZoom
            coord.y = coord.y / additionalIEZoom
          }

          let aShapes = this.editorManager.getCanvas().getAbstractShapesAtPosition(coord)

          if (aShapes.length <= 0) {
            if (event.helper) {
              EventBus.$emit('UPDATE_dragCanContain', false)
              return false
            }
          }

          if (this.editorManager.instanceofCanvas(aShapes[0])) {
            this.editorManager.getCanvas().setHightlightStateBasedOnX(coord.x)
          }

          // console.log('aShapes', aShapes)
          const item = this.editorManager.getStencilItemById(event.target.id)
          if (aShapes.length == 1 && this.editorManager.instanceofCanvas(aShapes[0])) {
            let parentCandidate = aShapes[0]

            if (item.id === 'Lane' || item.id === 'V-Lane' || item.id === 'BoundaryErrorEvent' || item.id === 'BoundaryMessageEvent' ||
              item.id === 'BoundarySignalEvent' || item.id === 'BoundaryTimerEvent' ||
              item.id === 'BoundaryCancelEvent' || item.id === 'BoundaryCompensationEvent' ||
              item.id === 'EntryCriterion') {
              EventBus.$emit('UPDATE_dragCanContain', false)

              // Show Highlight
              this.editorManager.handleEvents({
                type: ORYX_CONFIG.EVENT_HIGHLIGHT_SHOW,
                highlightId: 'shapeRepo.added',
                elements: [parentCandidate],
                style: ORYX_CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
                color: ORYX_CONFIG.SELECTION_INVALID_COLOR
              })
            } else {
              EventBus.$emit('UPDATE_dragCanContain', true)
              this.editorManager.dragCurrentParent = parentCandidate
              this.editorManager.dragCurrentParentId = parentCandidate.id

              this.editorManager.handleEvents({
                type: ORYX_CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: 'shapeRepo.added'
              })
            }

            this.editorManager.handleEvents({
              type: ORYX_CONFIG.EVENT_HIGHLIGHT_HIDE,
              highlightId: 'shapeRepo.attached'
            })

            return false

          } else {
            // console.log(22, item)
            let parentCandidate = aShapes.reverse().find((candidate) => {
              // return (candidate instanceof ORYX.Core.Canvas
              //   || candidate instanceof ORYX.Core.Node
              //   || candidate instanceof ORYX.Core.Edge);

              return (this.editorManager.instanceofCanvas(candidate)
                || (item.id.endsWith('Lane') ? this.editorManager.instanceofNode(candidate) :
                  (this.editorManager.instanceofNode(candidate) && !(candidate.getStencil().id().endsWith('Lane') ||
                    candidate.getStencil().id().endsWith('Pool'))))
                || this.editorManager.instanceofEdge(candidate))
            })
            // console.log('parentCandidate', parentCandidate)
            if (this.editorManager.instanceofCanvas(parentCandidate)) {
              if (item.id === 'Lane' || item.id === 'V-Lane' || item.id === 'BoundaryErrorEvent' || item.id === 'BoundaryMessageEvent' ||
                item.id === 'BoundarySignalEvent' || item.id === 'BoundaryTimerEvent' ||
                item.id === 'BoundaryCancelEvent' || item.id === 'BoundaryCompensationEvent' ||
                item.id === 'EntryCriterion') {
                EventBus.$emit('UPDATE_dragCanContain', false)
                // Show Highlight
                this.editorManager.handleEvents({
                  type: ORYX_CONFIG.EVENT_HIGHLIGHT_SHOW,
                  highlightId: 'shapeRepo.added',
                  elements: [parentCandidate],
                  style: ORYX_CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
                  color: ORYX_CONFIG.SELECTION_INVALID_COLOR
                })
              } else {
                EventBus.$emit('UPDATE_dragCanContain', true)
                this.editorManager.dragCurrentParent = parentCandidate
                this.editorManager.dragCurrentParentId = parentCandidate.id

                this.editorManager.handleEvents({
                  type: ORYX_CONFIG.EVENT_HIGHLIGHT_HIDE,
                  highlightId: 'shapeRepo.added'
                })
              }

              this.editorManager.handleEvents({
                type: ORYX_CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: 'shapeRepo.attached'
              })

              return false
            }

            if (!parentCandidate) {
              EventBus.$emit('UPDATE_dragCanContain', false)
              return false
            }

            if (item.type === 'node') {
              // check if the draggable is a boundary event and the parent an Activity
              let _canContain = false
              let parentStencilId = parentCandidate.getStencil().id()
              if (this.editorManager.dragCurrentParentId && this.editorManager.dragCurrentParentId === parentCandidate.id) {
                return false
              }

              let parentItem = this.editorManager.getStencilItemById(parentCandidate.getStencil().idWithoutNs())
              if (parentItem.roles.indexOf('Activity') > -1) {
                if (item.roles.indexOf('IntermediateEventOnActivityBoundary') > -1
                  || item.roles.indexOf('EntryCriterionOnItemBoundary') > -1
                  || item.roles.indexOf('ExitCriterionOnItemBoundary') > -1) {
                  _canContain = true
                }
              } else if (parentItem.roles.indexOf('StageActivity') > -1) {
                if (item.roles.indexOf('EntryCriterionOnItemBoundary') > -1
                  || item.roles.indexOf('ExitCriterionOnItemBoundary') > -1) {
                  _canContain = true
                }
              } else if (parentItem.roles.indexOf('StageModelActivity') > -1) {
                if (item.roles.indexOf('ExitCriterionOnItemBoundary') > -1) {
                  _canContain = true
                }
              } else if (parentCandidate.getStencil().idWithoutNs() === 'Pool') {
                if (item.id === 'Lane') {
                  _canContain = true
                }
              } else if (parentCandidate.getStencil().idWithoutNs() === 'V-Pool') {
                if (item.id === 'V-Lane') {
                  _canContain = true
                }
              }

              if (_canContain) {
                this.editorManager.handleEvents({
                  type: ORYX_CONFIG.EVENT_HIGHLIGHT_SHOW,
                  highlightId: 'shapeRepo.attached',
                  elements: [parentCandidate],
                  style: ORYX_CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
                  color: ORYX_CONFIG.SELECTION_VALID_COLOR
                })

                this.editorManager.handleEvents({
                  type: ORYX_CONFIG.EVENT_HIGHLIGHT_HIDE,
                  highlightId: 'shapeRepo.added'
                })
              } else {
                let containmentRules = this.editorManager.containmentRules

                for (let i = 0; i < containmentRules.length; i++) {
                  let rule = containmentRules[i]
                  if (rule.role === parentItem.id) {
                    for (let j = 0; j < rule.contains.length; j++) {
                      if (item.roles.indexOf(rule.contains[j]) > -1) {
                        _canContain = true
                        break
                      }
                    }

                    if (_canContain) {
                      break
                    }
                  }
                }

                // Show Highlight
                this.editorManager.handleEvents({
                  type: ORYX_CONFIG.EVENT_HIGHLIGHT_SHOW,
                  highlightId: 'shapeRepo.added',
                  elements: [parentCandidate],
                  color: _canContain ? ORYX_CONFIG.SELECTION_VALID_COLOR : ORYX_CONFIG.SELECTION_INVALID_COLOR
                })

                this.editorManager.handleEvents({
                  type: ORYX_CONFIG.EVENT_HIGHLIGHT_HIDE,
                  highlightId: 'shapeRepo.attached'
                })
              }

              this.editorManager.dragCurrentParent = parentCandidate
              this.editorManager.dragCurrentParentId = parentCandidate.id
              this.editorManager.dragCurrentParentStencil = parentStencilId
              EventBus.$emit('UPDATE_dragCanContain', _canContain)

            } else {
              let canvasCandidate = this.editorManager.getCanvas()
              let canConnect = false

              let targetStencil = this.editorManager.getStencilItemById(parentCandidate.getStencil().idWithoutNs())
              if (targetStencil) {
                let associationConnect = false
                if (stencil.idWithoutNs() === 'Association' && (curCan.getStencil().idWithoutNs() === 'TextAnnotation' || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent')) {
                  associationConnect = true
                } else if (stencil.idWithoutNs() === 'DataAssociation' && curCan.getStencil().idWithoutNs() === 'DataStore') {
                  associationConnect = true
                }

                if (targetStencil.canConnectTo || associationConnect) {
                  canConnect = true
                }
              }

              // Edge
              this.editorManager.dragCurrentParent = canvasCandidate
              this.editorManager.dragCurrentParentId = canvasCandidate.id
              this.editorManager.dragCurrentParentStencil = canvasCandidate.getStencil().id()
              EventBus.$emit('UPDATE_dragCanContain', canConnect)
              // Show Highlight
              this.editorManager.handleEvents({
                type: ORYX_CONFIG.EVENT_HIGHLIGHT_SHOW,
                highlightId: 'shapeRepo.added',
                elements: [canvasCandidate],
                color: ORYX_CONFIG.SELECTION_VALID_COLOR
              })

              this.editorManager.handleEvents({
                type: ORYX_CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: 'shapeRepo.attached'
              })
            }
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
