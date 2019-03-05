<template>
  <!--画布区域-->
  <div id="canvasHelpWrapper" class="col-xs-12">
    <div class="canvas-wrapper" id="canvasSection"
         v-droppable="{onDrop:'dropCallback',onOver: 'overCallback', onOut: 'outCallback'}"
         data-model="droppedElement"
         data-drop="true">
      <div class="canvas-message" id="model-modified-date"></div>

      <!--删除按钮-->
      <div class="Oryx_button"
           id="delete-button"
           :title="$t('BUTTON.ACTION.DELETE.TOOLTIP')"
           @click="deleteShape()"
           style="display:none">
        <img src="flowable/editor-app/images/delete.png"/>
      </div>
      <!--设置修改形状-->
      <div class="Oryx_button"
           id="morph-button"
           :title="$t('BUTTON.ACTION.MORPH.TOOLTIP')"
           @click="morphShape()"
           style="display:none">
        <img src="flowable/editor-app/images/wrench.png"/>
      </div>
      <!--编辑-->
      <div class="Oryx_button"
           id="edit-button"
           style="display:none"
           @click="editShape()">
        <img src="flowable/editor-app/images/pencil.png"/>
      </div>
      <!--v-draggable="{onStart:'startDragCallbackQuickMenu', onDrag:'dragCallbackQuickMenu',-->
      <!--revert: 'invalid', helper: 'clone', opacity : 0.5}"-->
      <div class="Oryx_button"
           v-for="item in quickMenuItems"
           :key="item.id"
           :id="item.id"
           :title="item.description"
           @click="quickAddItem(item.id)"
           data-model="draggedElement"
           data-drag="true"
           style="display:none">
        <img :src="`flowable/editor-app/stencilsets/${getStencilSetName()}/icons/${item.icon}`"/>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'

  export default {
    name: "canvasWrapper",
    data () {
      return {}
    },
    props: {
      editorManager: {},
    },
    mounted () {
      console.log(999999)
    },
    computed: {
      ...mapState('Flowable', ['dragCanContain', 'dragCurrentParent', 'quickMenu', 'dropTargetElement', 'modelData', 'quickMenuItems'])
    },
    methods: {
      ...mapMutations('Flowable', [
        'UPDATE_dragModeOver', 'UPDATE_dragCanContain',
        'UPDATE_dragCurrentParent', 'UPDATE_dragCurrentParentId',
        'UPDATE_dragCurrentParentStencil', 'UPDATE_quickMenu', 'UPDATE_dropTargetElement']),
      dropCallback (event, ui) {
        this.editorManager.handleEvents({
          type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
          highlightId: "shapeRepo.attached"
        });
        this.editorManager.handleEvents({
          type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
          highlightId: "shapeRepo.added"
        });
        this.editorManager.handleEvents({
          type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
          highlightId: "shapeMenu"
        });

        FLOWABLE.eventBus.dispatch(FLOWABLE.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS);

        console.log('dragCanContain', this.dragCanContain)
        if (this.dragCanContain) {
          var item = this.getStencilItemById(ui.draggable[0].id);

          var pos = {x: event.pageX, y: event.pageY};

          var additionalIEZoom = 1;
          if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
            var ua = navigator.userAgent;
            if (ua.indexOf('MSIE') >= 0) {
              //IE 10 and below
              var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
              if (zoom !== 100) {
                additionalIEZoom = zoom / 100;
              }
            }
          }

          var screenCTM = this.editorManager.getCanvas().node.getScreenCTM();

          // Correcting the UpperLeft-Offset
          pos.x -= (screenCTM.e / additionalIEZoom);
          pos.y -= (screenCTM.f / additionalIEZoom);
          // Correcting the Zoom-Factor
          pos.x /= screenCTM.a;
          pos.y /= screenCTM.d;

          // Correcting the ScrollOffset
          pos.x -= document.documentElement.scrollLeft;
          pos.y -= document.documentElement.scrollTop;

          var parentAbs = this.dragCurrentParent.absoluteXY();
          pos.x -= parentAbs.x;
          pos.y -= parentAbs.y;

          var containedStencil = undefined;
          var stencilSets = this.editorManager.getStencilSets().values();
          for (var i = 0; i < stencilSets.length; i++) {
            var stencilSet = stencilSets[i];
            var nodes = stencilSet.nodes();
            for (var j = 0; j < nodes.length; j++) {
              if (nodes[j].idWithoutNs() === ui.draggable[0].id) {
                containedStencil = nodes[j];
                break;
              }
            }

            if (!containedStencil) {
              var edges = stencilSet.edges();
              for (var j = 0; j < edges.length; j++) {
                if (edges[j].idWithoutNs() === ui.draggable[0].id) {
                  containedStencil = edges[j];
                  break;
                }
              }
            }
          }

          if (!containedStencil) return;

          if (this.quickMenu) {
            var shapes = this.editorManager.getSelection();
            if (shapes && shapes.length == 1) {
              var currentSelectedShape = shapes.first();

              var option = {};
              option.type = currentSelectedShape.getStencil().namespace() + ui.draggable[0].id;
              option.namespace = currentSelectedShape.getStencil().namespace();
              option.connectedShape = currentSelectedShape;
              option.parent = this.dragCurrentParent;
              option.containedStencil = containedStencil;

              // If the ctrl key is not pressed,
              // snapp the new shape to the center
              // if it is near to the center of the other shape
              if (!event.ctrlKey) {
                // Get the center of the shape
                var cShape = currentSelectedShape.bounds.center();
                // Snapp +-20 Pixel horizontal to the center
                if (20 > Math.abs(cShape.x - pos.x)) {
                  pos.x = cShape.x;
                }
                // Snapp +-20 Pixel vertical to the center
                if (20 > Math.abs(cShape.y - pos.y)) {
                  pos.y = cShape.y;
                }
              }

              option.position = pos;

              if (containedStencil.idWithoutNs() !== 'SequenceFlow' && containedStencil.idWithoutNs() !== 'Association' &&
                containedStencil.idWithoutNs() !== 'MessageFlow' && containedStencil.idWithoutNs() !== 'DataAssociation') {

                var args = { sourceShape: currentSelectedShape, targetStencil: containedStencil };
                var targetStencil = this.editorManager.getRules().connectMorph(args);
                if (!targetStencil) { // Check if there can be a target shape
                  return;
                }
                option.connectingType = targetStencil.id();
              }

              var command = new FLOWABLE.CreateCommand(option, this.dropTargetElement, pos, this.editorManager.getEditor());

              this.editorManager.executeCommands([command]);
            }

          } else {
            var canAttach = false;
            if (containedStencil.idWithoutNs() === 'BoundaryErrorEvent' || containedStencil.idWithoutNs() === 'BoundaryTimerEvent' ||
              containedStencil.idWithoutNs() === 'BoundarySignalEvent' || containedStencil.idWithoutNs() === 'BoundaryMessageEvent' ||
              containedStencil.idWithoutNs() === 'BoundaryCancelEvent' || containedStencil.idWithoutNs() === 'BoundaryCompensationEvent') {

              // Modify position, otherwise boundary event will get position related to left corner of the canvas instead of the container
              pos = this.editorManager.eventCoordinates( event );
              canAttach = true;
            }

            var option = {};
            option['type'] = this.modelData.model.stencilset.namespace + item.id;
            option['namespace'] = this.modelData.model.stencilset.namespace;
            option['position'] = pos;
            option['parent'] = this.dragCurrentParent;

            var commandClass = ORYX.Core.Command.extend({
              construct: function(option, dockedShape, canAttach, position, facade){
                this.option = option;
                this.docker = null;
                this.dockedShape = dockedShape;
                this.dockedShapeParent = dockedShape.parent || facade.getCanvas();
                this.position = position;
                this.facade = facade;
                this.selection = this.facade.getSelection();
                this.shape = null;
                this.parent = null;
                this.canAttach = canAttach;
              },
              execute: function(){
                if (!this.shape) {
                  this.shape = this.facade.createShape(option);
                  this.parent = this.shape.parent;
                } else if (this.parent) {
                  this.parent.add(this.shape);
                }

                if (this.canAttach && this.shape.dockers && this.shape.dockers.length) {
                  this.docker = this.shape.dockers[0];

                  this.dockedShapeParent.add(this.docker.parent);

                  // Set the Docker to the new Shape
                  this.docker.setDockedShape(undefined);
                  this.docker.bounds.centerMoveTo(this.position);
                  if (this.dockedShape !== this.facade.getCanvas()) {
                    this.docker.setDockedShape(this.dockedShape);
                  }
                  this.facade.setSelection( [this.docker.parent] );
                }

                this.facade.getCanvas().update();
                this.facade.updateSelection();

              },
              rollback: function(){
                if (this.shape) {
                  this.facade.setSelection(this.selection.without(this.shape));
                  this.facade.deleteShape(this.shape);
                }
                if (this.canAttach && this.docker) {
                  this.docker.setDockedShape(undefined);
                }
                this.facade.getCanvas().update();
                this.facade.updateSelection();

              }
            });

            // Update canvas
            var command = new commandClass(option, this.dragCurrentParent, canAttach, pos, this.editorManager.getEditor());
            this.editorManager.executeCommands([command]);

            // Fire event to all who want to know about this
            var dropEvent = {
              type: FLOWABLE.eventBus.EVENT_TYPE_ITEM_DROPPED,
              droppedItem: item,
              position: pos
            };
            FLOWABLE.eventBus.dispatch(dropEvent.type, dropEvent);
          }
        }

        this.UPDATE_dragCurrentParent(undefined)
        this.UPDATE_dragCurrentParentId(undefined)
        this.UPDATE_dragCurrentParentStencil(undefined)
        this.UPDATE_dragCanContain(undefined)
        this.UPDATE_quickMenu(undefined)
        this.UPDATE_dropTargetElement(undefined)
      },

      overCallback  (event, ui) {
        this.UPDATE_dragModeOver(true)
      },

      outCallback  (event, ui) {
        this.UPDATE_dragModeOver(false)
        console.log('out==============')
      },
      startDragCallbackQuickMenu  (event, ui) {
        console.log('startDragCallbackQuickMenu==============')
        this.UPDATE_dragModeOver(false)
        this.UPDATE_quickMenu(true)
      },
      dragCallbackQuickMenu (event, ui) {
        console.log('dragCallbackQuickMenu==============')
        if (this.$store.state.dragModeOver != false) {
          var coord = this.editorManager.eventCoordinatesXY(event.pageX, event.pageY);

          var additionalIEZoom = 1;
          if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
            var ua = navigator.userAgent;
            if (ua.indexOf('MSIE') >= 0) {
              //IE 10 and below
              var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
              if (zoom !== 100) {
                additionalIEZoom = zoom / 100
              }
            }
          }

          if (additionalIEZoom !== 1) {
            coord.x = coord.x / additionalIEZoom;
            coord.y = coord.y / additionalIEZoom;
          }

          var aShapes = this.editorManager.getCanvas().getAbstractShapesAtPosition(coord);

          if (aShapes.length <= 0) {
            if (event.helper) {
              this.UPDATE_dragCanContain(false)
              return false;
            }
          }

          if (aShapes[0] instanceof ORYX.Core.Canvas) {
            this.editorManager.getCanvas().setHightlightStateBasedOnX(coord.x);
          }

          var stencil = undefined;
          var stencilSets = this.editorManager.getStencilSets().values();
          for (var i = 0; i < stencilSets.length; i++) {
            var stencilSet = stencilSets[i];
            var nodes = stencilSet.nodes();
            for (var j = 0; j < nodes.length; j++) {
              if (nodes[j].idWithoutNs() === event.target.id) {
                stencil = nodes[j];
                break;
              }
            }

            if (!stencil) {
              var edges = stencilSet.edges();
              for (var j = 0; j < edges.length; j++) {
                if (edges[j].idWithoutNs() === event.target.id) {
                  stencil = edges[j];
                  break;
                }
              }
            }
          }

          var candidate = aShapes.last();

          var isValid = false;
          if (stencil.type() === "node")  {
            //check containment rules
            var canContain = this.editorManager.getRules().canContain({containingShape:candidate, containedStencil:stencil});

            var parentCandidate = aShapes.reverse().find(function (candidate) {
              return (candidate instanceof ORYX.Core.Canvas
                || candidate instanceof ORYX.Core.Node
                || candidate instanceof ORYX.Core.Edge);
            });

            if (!parentCandidate) {
              this.UPDATE_dragCanContain(false)
              return false;
            }

            this.UPDATE_dragCurrentParent(parentCandidate)
            this.UPDATE_dragCurrentParentId(parentCandidate.id)
            this.UPDATE_dragCurrentParentStencil(parentCandidate.getStencil().id())
            this.UPDATE_dragCanContain(canContain)
            this.UPDATE_dropTargetElement(parentCandidate)
            isValid = canContain;

          } else { //Edge

            var shapes = this.editorManager.getSelection();
            if (shapes && shapes.length == 1) {
              var currentSelectedShape = shapes.first();
              var curCan = candidate;
              var canConnect = false;

              var targetStencil = this.getStencilItemById(curCan.getStencil().idWithoutNs());
              if (targetStencil) {
                var associationConnect = false;
                if (stencil.idWithoutNs() === 'Association' && (curCan.getStencil().idWithoutNs() === 'TextAnnotation' || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent')) {
                  associationConnect = true;
                } else if (stencil.idWithoutNs() === 'DataAssociation' && curCan.getStencil().idWithoutNs() === 'DataStore') {
                  associationConnect = true;
                }

                if (targetStencil.canConnectTo || associationConnect) {
                  while (!canConnect && curCan && !(curCan instanceof ORYX.Core.Canvas)) {
                    candidate = curCan;
                    //check connection rules
                    canConnect = this.editorManager.getRules().canConnect({
                      sourceShape: currentSelectedShape,
                      edgeStencil: stencil,
                      targetShape: curCan
                    });
                    curCan = curCan.parent;
                  }
                }
              }
              var parentCandidate = this.editorManager.getCanvas();

              isValid = canConnect;
              this.UPDATE_dragCurrentParent(parentCandidate)
              this.UPDATE_dragCurrentParentId(parentCandidate.id)
              this.UPDATE_dragCurrentParentStencil(parentCandidate.getStencil().id())
              this.UPDATE_dragCanContain(canConnect)
              this.UPDATE_dropTargetElement(candidate)
            }

          }

          this.editorManager.handleEvents({
            type:   ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
            highlightId:'shapeMenu',
            elements: [candidate],
            color: isValid ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
          });
        }
      }
    }
  }
</script>

<style scoped>

</style>