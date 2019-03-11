<template>
  <div>
    <span @click="expandedToggle">
        <i class="glyphicon"
           :class="{'glyphicon-chevron-right': !group.expanded, 'glyphicon-chevron-down': group.expanded}"></i>
       {{group.name}}
    </span>

    <!-- Child groups -->
    <ul v-for="group in group.groups"
        :key="group.id"
        class="stencil-group stencil-group-non-root"
        :class="{collapsed: !group.expanded, 'first': $first}">
      <stencil-item-template></stencil-item-template>
    </ul>

    <!-- Group items -->
    <ul>
      <li v-for="item in group.paletteItems" class="stencil-item"
          :key="item.id"
          :id="item.id"
          :title="item.description"
          v-draggable="{onStart:'startDragCallback', onDrag:'dragCallback', revert: 'invalid', helper: 'clone', opacity : 0.5}"
          data-drag="true"
          data-model="draggedElement">
        <img v-if="!item.customIcon" width="16px;" height="16px;"
             :src="`/flowable/editor-app/stencilsets/${getStencilSetName()}/icons/${item.icon}`"/>
        <img v-if="item.customIcon" :src="getImageUrl(item.icon)" width="16px;" height="16px;"/>
        {{item.name}}
      </li>
    </ul>

  </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'

  export default {
    name: "stencil-item-template",
    data() {
      return {}
    },
    props: {
      editorManager: {},
      group: {
        type: Object,
        default: function () {
          return {
            name: '',
            items: [],
            groups: []
          }
        }
      }
    },
    computed: {
      stencilItemGroups () {
        if (!this.editorManager) return []
        return this.editorManager.getShowStencilData();
      }
    },
    methods: {
      ...mapMutations('Flowable', ['UPDATE_dragModeOver', 'UPDATE_dragCanContain'
        , 'UPDATE_quickMenu']),
      expandedToggle() {
        this.$emit('expandedToggle')
      },
      startDragCallback  (event, ui) {
        console.log('startDragCallback')
        this.UPDATE_dragModeOver(false)
        this.UPDATE_quickMenu(false)
        if (!ui.helper.hasClass('stencil-item-dragged')) {
          ui.helper.addClass('stencil-item-dragged');
        }
      },
      dragCallback (event, ui) {
        console.log('dragCallback')
        if (this.$store.state.dragModeOver != false) {
          const coord = this.editorManager.eventCoordinatesXY(event.pageX, event.pageY);

          let additionalIEZoom = 1;
          if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
            let ua = navigator.userAgent;
            if (ua.indexOf('MSIE') >= 0) {
              // IE 10 and below
              let zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
              if (zoom !== 100) {
                additionalIEZoom = zoom / 100
              }
            }
          }

          if (additionalIEZoom !== 1) {
            coord.x = coord.x / additionalIEZoom;
            coord.y = coord.y / additionalIEZoom;
          }

          let aShapes = this.editorManager.getCanvas().getAbstractShapesAtPosition(coord);

          if (aShapes.length <= 0) {
            if (event.helper) {
              this.UPDATE_dragCanContain(false)
              return false;
            }
          }

          if (aShapes[0] instanceof ORYX.Core.Canvas) {
            this.editorManager.getCanvas().setHightlightStateBasedOnX(coord.x);
          }

          if (aShapes.length == 1 && aShapes[0] instanceof ORYX.Core.Canvas) {
            let item = this.editorManager.getStencilItemById(event.target.id);
            let parentCandidate = aShapes[0];

            if (item.id === 'Lane' || item.id === 'BoundaryErrorEvent' || item.id === 'BoundaryMessageEvent' ||
              item.id === 'BoundarySignalEvent' || item.id === 'BoundaryTimerEvent' ||
              item.id === 'BoundaryCancelEvent' || item.id === 'BoundaryCompensationEvent' ||
              item.id === 'EntryCriterion') {
              this.UPDATE_dragCanContain(false)

              // Show Highlight
              this.editorManager.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                highlightId: 'shapeRepo.added',
                elements: [parentCandidate],
                style: ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
                color: ORYX.CONFIG.SELECTION_INVALID_COLOR
              });
            } else {
              this.UPDATE_dragCanContain(true)
              this.editorManager.dragCurrentParent = parentCandidate
              this.editorManager.dragCurrentParentId = parentCandidate.id

              this.editorManager.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: "shapeRepo.added"
              });
            }

            this.editorManager.handleEvents({
              type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
              highlightId: "shapeRepo.attached"
            });

            return false;

          } else  {
            let item = this.editorManager.getStencilItemById(event.target.id);
            let parentCandidate = aShapes.reverse().find(function (candidate) {
              return (candidate instanceof ORYX.Core.Canvas
                || candidate instanceof ORYX.Core.Node
                || candidate instanceof ORYX.Core.Edge);
            });

            if (!parentCandidate) {
              this.UPDATE_dragCanContain(false)
              return false;
            }

            if (item.type === "node") {
              // check if the draggable is a boundary event and the parent an Activity
              let _canContain = false;
              let parentStencilId = parentCandidate.getStencil().id();
              if (this.editorManager.dragCurrentParentId && this.editorManager.dragCurrentParentId === parentCandidate.id) {
                return false;
              }

              let parentItem = this.editorManager.getStencilItemById(parentCandidate.getStencil().idWithoutNs());
              if (parentItem.roles.indexOf('Activity') > -1) {
                if (item.roles.indexOf('IntermediateEventOnActivityBoundary') > -1
                  || item.roles.indexOf('EntryCriterionOnItemBoundary') > -1
                  || item.roles.indexOf('ExitCriterionOnItemBoundary') > -1) {
                  _canContain = true;
                }
              } else if(parentItem.roles.indexOf('StageActivity') > -1) {
                if (item.roles.indexOf('EntryCriterionOnItemBoundary') > -1
                  || item.roles.indexOf('ExitCriterionOnItemBoundary') > -1) {
                  _canContain = true;
                }
              } else if(parentItem.roles.indexOf('StageModelActivity') > -1) {
                if (item.roles.indexOf('ExitCriterionOnItemBoundary') > -1) {
                  _canContain = true;
                }
              } else if (parentCandidate.getStencil().idWithoutNs() === 'Pool') {
                if (item.id === 'Lane') {
                  _canContain = true;
                }
              }

              if (_canContain) {
                this.editorManager.handleEvents({
                  type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                  highlightId: "shapeRepo.attached",
                  elements: [parentCandidate],
                  style: ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
                  color: ORYX.CONFIG.SELECTION_VALID_COLOR
                });

                this.editorManager.handleEvents({
                  type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                  highlightId: "shapeRepo.added"
                });
              } else {
                let containmentRules = this.editorManager.containmentRules

                for (let i = 0; i < this.containmentRules.length; i++) {
                  let rule = this.containmentRules[i];
                  if (rule.role === parentItem.id) {
                    for (let j = 0; j < rule.contains.length; j++) {
                      if (item.roles.indexOf(rule.contains[j]) > -1) {
                        _canContain = true;
                        break;
                      }
                    }

                    if (_canContain) {
                      break;
                    }
                  }
                }

                // Show Highlight
                this.editorManager.handleEvents({
                  type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                  highlightId: 'shapeRepo.added',
                  elements: [parentCandidate],
                  color: _canContain ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
                });

                this.editorManager.handleEvents({
                  type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                  highlightId: "shapeRepo.attached"
                });
              }

              this.editorManager.dragCurrentParent = parentCandidate
              this.editorManager.dragCurrentParentId = parentCandidate.id
              this.editorManager.dragCurrentParentStencil = parentStencilId
              this.UPDATE_dragCanContain(_canContain)

            } else  {
              let canvasCandidate = this.editorManager.getCanvas();
              let canConnect = false;

              let targetStencil = this.editorManager.getStencilItemById(parentCandidate.getStencil().idWithoutNs());
              if (targetStencil) {
                let associationConnect = false;
                if (stencil.idWithoutNs() === 'Association' && (curCan.getStencil().idWithoutNs() === 'TextAnnotation' || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent')) {
                  associationConnect = true;
                } else if (stencil.idWithoutNs() === 'DataAssociation' && curCan.getStencil().idWithoutNs() === 'DataStore') {
                  associationConnect = true;
                }

                if (targetStencil.canConnectTo || associationConnect) {
                  canConnect = true;
                }
              }

              // Edge
              this.editorManager.dragCurrentParent = canvasCandidate
              this.editorManager.dragCurrentParentId = canvasCandidate.id
              this.editorManager.dragCurrentParentStencil = canvasCandidate.getStencil().id()
              this.UPDATE_dragCanContain(canConnect)

              // Show Highlight
              this.editorManager.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                highlightId: 'shapeRepo.added',
                elements: [canvasCandidate],
                color: ORYX.CONFIG.SELECTION_VALID_COLOR
              });

              this.editorManager.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: "shapeRepo.attached"
              });
            }
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>