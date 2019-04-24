<template>
  <!--画布区域-->
  <div id="canvasHelpWrapper" class="col-xs-12">
    <div class="canvas-wrapper" id="canvasSection"
         v-droppable="{onDrop:'dropCallback',onOver: 'overCallback', onOut: 'outCallback'}"
         data-model="droppedElement"
         data-drop="true"
         @scroll.passive="fnScroll">
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

        <el-dropdown trigger="click" @command="handleCommand">
      <span class="el-dropdown-link">
        <img src="flowable/editor-app/images/wrench.png"/>
        <!--下拉菜单<i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>-->
      </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="item in morphShapes" :key="item.id" :command="item">
              <img width="16px;" height="16px;"
                   :src="`/flowable/editor-app/stencilsets/${getStencilSetName()}/icons/${item.icon}`"/>
              {{item.name}}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

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
           v-draggable="{onStart:'startDragCallbackQuickMenu', onDrag:'dragCallbackQuickMenu',
           revert: 'invalid', helper: 'clone', opacity : 0.5}"
           style="display:none;position: absolute;">
        <img :src="`flowable/editor-app/stencilsets/${getStencilSetName()}/icons/${item.icon}`"/>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'
  import { FLOWABLE } from '@/assets/flowable/FLOWABLE_Config'
  import FLOWABLE_OPTIONS from '@/assets/flowable/FLOW_OPTIONS'
  import { getAdditionalIEZoom } from '@/assets/Util'
  import ORYX from '@/assets/oryx'
  import { _debounce } from '@/assets/Util'

  export default {
    name: 'canvasWrapper',
    data () {
      return {
        morphShapes: [],
        currentSelectedMorph: null,
        newShape: null
      }
    },
    props: {
      editorManager: {}
    },
    mounted () {},
    computed: {
      ...mapState('Flowable', ['dragCanContain', 'quickMenu']),
      modelData () {
        return this.editorManager ? this.editorManager.getBaseModelData() : []
      },
      quickMenuItems () {
        return this.editorManager ? this.editorManager.quickMenuItems : []
      }
    },
    methods: {
      ...mapMutations('Flowable', [
        'UPDATE_dragModeOver', 'UPDATE_dragCanContain',
        'UPDATE_quickMenu']),
      fnScroll () {
        // Hides the resizer and quick menu items during scrolling
        const selectedElements = this.editorManager.getSelection();
        const subSelectionElements = this.editorManager.getSubSelection();

        this.selectedElements = selectedElements;
        this.subSelectionElements = subSelectionElements;
        if (selectedElements && selectedElements.length > 0)
        {
          this.selectedElementBeforeScrolling = selectedElements[0];
        }

        jQuery('.Oryx_button').each(function(i, obj) {
          this.orginalOryxButtonStyle = obj.style.display;
          obj.style.display = 'none';
        });
        jQuery('.resizer_southeast').each(function(i, obj) {
          this.orginalResizerSEStyle = obj.style.display;
          obj.style.display = 'none';
        });
        jQuery('.resizer_northwest').each(function(i, obj) {
          this.orginalResizerNWStyle = obj.style.display;
          obj.style.display = 'none';
        });
        jQuery('.resizer_south').each(function(i, obj) {
          this.orginalResizerNWStyle = obj.style.display;
          obj.style.display = 'none';
        });
        jQuery('.resizer_north').each(function(i, obj) {
          this.orginalResizerNWStyle = obj.style.display;
          obj.style.display = 'none';
        });
        this.editorManager.handleEvents({type:ORYX.CONFIG.EVENT_CANVAS_SCROLL});
        this.fnHandleScrollDebounce()
      },
      fnHandleScrollDebounce: _debounce(function(_type, index, item) {
        // Puts the quick menu items and resizer back when scroll is stopped.
        this.editorManager.setSelection([]); // needed cause it checks for element changes and does nothing if the elements are the same
        this.editorManager.setSelection(this.selectedElements, this.subSelectionElements);
        this.selectedElements = undefined;
        this.subSelectionElements = undefined;

        function handleDisplayProperty(obj) {
          if (jQuery(obj).position().top > 0) {
            obj.style.display = 'block';
          } else {
            obj.style.display = 'none';
          }
        }

        jQuery('.Oryx_button').each(function(i, obj) {
          handleDisplayProperty(obj);
        });
        jQuery('.resizer_southeast').each(function(i, obj) {
          handleDisplayProperty(obj);
        });
        jQuery('.resizer_northwest').each(function(i, obj) {
          handleDisplayProperty(obj);
        });
        jQuery('.resizer_south').each(function(i, obj) {
          handleDisplayProperty(obj);
        });
        jQuery('.resizer_north').each(function(i, obj) {
          handleDisplayProperty(obj);
        });
      }, 200),
      deleteShape () {
        this.editorManager.flowToolbarEvent({ '$scope': this, 'editorManager': this.editorManager })
      },
      morphShape () {
        var shapes = this.editorManager.getSelection()
        if (shapes && shapes.length == 1) {
          this.currentSelectedShape = shapes.first()
          let currentSelectedShapeId = this.currentSelectedShape.getStencil().idWithoutNs()
          var stencilItem = this.editorManager.getStencilItemById(currentSelectedShapeId)

          var morphShapes = []
          const morphRoles = this.editorManager.morphRoles
          // && morphRoles[i].id !== currentSelectedShapeId
          for (let i = 0; i < morphRoles.length; i++) {
            if (morphRoles[i].role === stencilItem.morphRole) {
              let ary = morphRoles[i].morphOptions.slice()
              for (let y = 0; y < ary.length; y++) {
                if (ary[y].id != currentSelectedShapeId) {
                  morphShapes.push(ary[y])
                }
              }
            }
          }
          this.morphShapes = morphShapes
        }
      },
      // 切换元素类型
      handleCommand (item) {
        class MorphTo extends ORYX.Core.Command{
          constructor (shape, stencil, facade) {
            super()
            this.shape = shape
            this.stencil = stencil
            this.facade = facade
          }
          execute () {
            var shape = this.shape
            var stencil = this.stencil
            var resourceId = shape.resourceId

            // Serialize all attributes
            var serialized = shape.serialize()
            stencil.properties().each((function (prop) {
              if (prop.readonly()) {
                serialized = serialized.reject(function (serProp) {
                  return serProp.name == prop.id()
                })
              }
            }).bind(this))

            // Get shape if already created, otherwise create a new shape
            if (this.newShape) {
              this.facade.getCanvas().add(this.newShape)
            } else {
              this.newShape = this.facade.createShape({
                type: stencil.id(),
                namespace: stencil.namespace(),
                resourceId: resourceId
              })
            }

            // calculate new bounds using old shape's upperLeft and new shape's width/height
            var boundsObj = serialized.find(function (serProp) {
              return (serProp.prefix === 'oryx' && serProp.name === 'bounds')
            })

            var changedBounds = null

            if (!this.facade.getRules().preserveBounds(shape.getStencil())) {
              var bounds = boundsObj.value.split(',')
              if (parseInt(bounds[0], 10) > parseInt(bounds[2], 10)) { // if lowerRight comes first, swap array items
                var tmp = bounds[0]
                bounds[0] = bounds[2]
                bounds[2] = tmp
                tmp = bounds[1]
                bounds[1] = bounds[3]
                bounds[3] = tmp
              }
              bounds[2] = parseInt(bounds[0], 10) + this.newShape.bounds.width()
              bounds[3] = parseInt(bounds[1], 10) + this.newShape.bounds.height()
              boundsObj.value = bounds.join(',')
            } else {
              var height = shape.bounds.height()
              var width = shape.bounds.width()

              // consider the minimum and maximum size of
              // the new shape

              if (this.newShape.minimumSize) {
                if (shape.bounds.height() < this.newShape.minimumSize.height) {
                  height = this.newShape.minimumSize.height
                }

                if (shape.bounds.width() < this.newShape.minimumSize.width) {
                  width = this.newShape.minimumSize.width
                }
              }

              if (this.newShape.maximumSize) {
                if (shape.bounds.height() > this.newShape.maximumSize.height) {
                  height = this.newShape.maximumSize.height
                }

                if (shape.bounds.width() > this.newShape.maximumSize.width) {
                  width = this.newShape.maximumSize.width
                }
              }

              changedBounds = {
                a: {
                  x: shape.bounds.a.x,
                  y: shape.bounds.a.y
                },
                b: {
                  x: shape.bounds.a.x + width,
                  y: shape.bounds.a.y + height
                }
              }
            }

            var oPos = shape.bounds.center()
            if (changedBounds !== null) {
              this.newShape.bounds.set(changedBounds)
            }

            // Set all related dockers
            this.setRelatedDockers(shape, this.newShape)

            // store DOM position of old shape
            var parentNode = shape.node.parentNode
            var nextSibling = shape.node.nextSibling

            // Delete the old shape
            this.facade.deleteShape(shape)

            // Deserialize the new shape - Set all attributes
            this.newShape.deserialize(serialized)
            /*
             * Change color to default if unchanged
             * 23.04.2010
             */
            if (shape.getStencil().property('oryx-bgcolor')
              && shape.properties['oryx-bgcolor']
              && shape.getStencil().property('oryx-bgcolor').value().toUpperCase() == shape.properties['oryx-bgcolor'].toUpperCase()) {
              if (this.newShape.getStencil().property('oryx-bgcolor')) {
                this.newShape.setProperty('oryx-bgcolor', this.newShape.getStencil().property('oryx-bgcolor').value())
              }
            }

            if (changedBounds !== null) {
              this.newShape.bounds.set(changedBounds)
            }

            if (this.newShape.getStencil().type() === 'edge' || (this.newShape.dockers.length == 0 || !this.newShape.dockers[0].getDockedShape())) {
              this.newShape.bounds.centerMoveTo(oPos)
            }

            if (this.newShape.getStencil().type() === 'node' && (this.newShape.dockers.length == 0 || !this.newShape.dockers[0].getDockedShape())) {
              this.setRelatedDockers(this.newShape, this.newShape)
            }

            // place at the DOM position of the old shape
            if (nextSibling) parentNode.insertBefore(this.newShape.node, nextSibling)
            else parentNode.appendChild(this.newShape.node)

            // Set selection
            this.facade.setSelection([this.newShape])
            this.facade.getCanvas().update()
            this.facade.updateSelection()
          }
          rollback () {
            if (!this.shape || !this.newShape || !this.newShape.parent) {
              return
            }
            // Append shape to the parent
            this.newShape.parent.add(this.shape)
            // Set dockers
            this.setRelatedDockers(this.newShape, this.shape)
            // Delete new shape
            this.facade.deleteShape(this.newShape)
            // Set selection
            this.facade.setSelection([this.shape])
            // Update
            this.facade.getCanvas().update()
            this.facade.updateSelection()
          }
          /**
           * Set all incoming and outgoing edges from the shape to the new shape
           * @param {Shape} shape
           * @param {Shape} newShape
           */
          setRelatedDockers (shape, newShape) {
            if (shape.getStencil().type() === 'node') {

              (shape.incoming || []).concat(shape.outgoing || [])
                .each(function (i) {
                  i.dockers.each(function (docker) {
                    if (docker.getDockedShape() == shape) {
                      var rPoint = Object.clone(docker.referencePoint)
                      // Move reference point per percent

                      var rPointNew = {
                        x: rPoint.x * newShape.bounds.width() / shape.bounds.width(),
                        y: rPoint.y * newShape.bounds.height() / shape.bounds.height()
                      }

                      docker.setDockedShape(newShape)
                      // Set reference point and center to new position
                      docker.setReferencePoint(rPointNew)
                      if (i instanceof ORYX.Core.Edge) {
                        docker.bounds.centerMoveTo(rPointNew)
                      } else {
                        var absXY = shape.absoluteXY()
                        docker.bounds.centerMoveTo({ x: rPointNew.x + absXY.x, y: rPointNew.y + absXY.y })
                        //docker.bounds.moveBy({x:rPointNew.x-rPoint.x, y:rPointNew.y-rPoint.y});
                      }
                    }
                  })
                })

              // for attached events
              if (shape.dockers.length > 0 && shape.dockers.first().getDockedShape()) {
                newShape.dockers.first().setDockedShape(shape.dockers.first().getDockedShape())
                newShape.dockers.first().setReferencePoint(Object.clone(shape.dockers.first().referencePoint))
              }

            } else { // is edge
              newShape.dockers.first().setDockedShape(shape.dockers.first().getDockedShape())
              newShape.dockers.first().setReferencePoint(shape.dockers.first().referencePoint)
              newShape.dockers.last().setDockedShape(shape.dockers.last().getDockedShape())
              newShape.dockers.last().setReferencePoint(shape.dockers.last().referencePoint)
            }
          }
        }

        let stencil = undefined
        const stencilSets = this.editorManager.getStencilSets().values()

        const stencilId = item.genericTaskId || item.id

        for (let i = 0; i < stencilSets.length; i++) {
          let stencilSet = stencilSets[i]
          let nodes = stencilSet.nodes()
          for (let j = 0; j < nodes.length; j++) {
            if (nodes[j].idWithoutNs() === stencilId) {
              stencil = nodes[j]
              break
            }
          }
        }

        if (!stencil) return

        // Create and execute command (for undo/redo)
        const command = new MorphTo(this.currentSelectedShape, stencil, this.editorManager.getEditor())
        this.editorManager.executeCommands([command])
      },
      dropCallback (event, ui) {
        this.editorManager.handleEvents({
          type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
          highlightId: 'shapeRepo.attached'
        })
        this.editorManager.handleEvents({
          type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
          highlightId: 'shapeRepo.added'
        })
        this.editorManager.handleEvents({
          type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
          highlightId: 'shapeMenu'
        })

        this.editorManager.dispatchFlowEvent(FLOWABLE.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS)

        // console.log('dragCanContain', this.dragCanContain)
        if (this.dragCanContain) {
          let item = this.editorManager.getStencilItemById(ui.draggable[0].id)
          let pos = { x: event.pageX, y: event.pageY }

          let additionalIEZoom = getAdditionalIEZoom()
          let screenCTM = this.editorManager.getCanvas().node.getScreenCTM()

          // Correcting the UpperLeft-Offset
          pos.x -= (screenCTM.e / additionalIEZoom)
          pos.y -= (screenCTM.f / additionalIEZoom)
          // Correcting the Zoom-Factor
          pos.x /= screenCTM.a
          pos.y /= screenCTM.d
          // Correcting the ScrollOffset
          pos.x -= document.documentElement.scrollLeft
          pos.y -= document.documentElement.scrollTop

          let parentAbs = this.editorManager.dragCurrentParent.absoluteXY()
          pos.x -= parentAbs.x
          pos.y -= parentAbs.y

          let containedStencil = undefined
          let stencilSets = this.editorManager.getStencilSets().values()
          for (let i = 0; i < stencilSets.length; i++) {
            let stencilSet = stencilSets[i]
            let nodes = stencilSet.nodes()
            for (let j = 0; j < nodes.length; j++) {
              if (nodes[j].idWithoutNs() === ui.draggable[0].id) {
                containedStencil = nodes[j]
                break
              }
            }

            if (!containedStencil) {
              let edges = stencilSet.edges()
              for (let j = 0; j < edges.length; j++) {
                if (edges[j].idWithoutNs() === ui.draggable[0].id) {
                  containedStencil = edges[j]
                  break
                }
              }
            }
          }

          if (!containedStencil) return

          if (this.quickMenu) {
            // 当拖拽的是快捷元素
            let shapes = this.editorManager.getSelection()
            if (shapes && shapes.length == 1) {
              let currentSelectedShape = shapes.first()
              let option = {}
              option.type = currentSelectedShape.getStencil().namespace() + ui.draggable[0].id
              option.namespace = currentSelectedShape.getStencil().namespace()
              option.connectedShape = currentSelectedShape
              option.parent = this.editorManager.dragCurrentParent
              option.containedStencil = containedStencil

              // If the ctrl key is not pressed,
              // snapp the new shape to the center
              // if it is near to the center of the other shape
              if (!event.ctrlKey) {
                // Get the center of the shape
                let cShape = currentSelectedShape.bounds.center()
                // Snapp +-20 Pixel horizontal to the center
                if (20 > Math.abs(cShape.x - pos.x)) {
                  pos.x = cShape.x
                }
                // Snapp +-20 Pixel vertical to the center
                if (20 > Math.abs(cShape.y - pos.y)) {
                  pos.y = cShape.y
                }
              }

              option.position = pos

              if (containedStencil.idWithoutNs() !== 'SequenceFlow' && containedStencil.idWithoutNs() !== 'Association' &&
                containedStencil.idWithoutNs() !== 'MessageFlow' && containedStencil.idWithoutNs() !== 'DataAssociation') {

                let args = { sourceShape: currentSelectedShape, targetStencil: containedStencil }
                let targetStencil = this.editorManager.getRules().connectMorph(args)
                if (!targetStencil) { // Check if there can be a target shape
                  return
                }
                option.connectingType = targetStencil.id()
              }

              let command = new FLOWABLE_OPTIONS.CreateCommand(option, this.editorManager.dropTargetElement, pos, this.editorManager.getEditor())

              this.editorManager.executeCommands([command])
            }

          } else {
            let canAttach = false
            if (containedStencil.idWithoutNs() === 'BoundaryErrorEvent' || containedStencil.idWithoutNs() === 'BoundaryTimerEvent' ||
              containedStencil.idWithoutNs() === 'BoundarySignalEvent' || containedStencil.idWithoutNs() === 'BoundaryMessageEvent' ||
              containedStencil.idWithoutNs() === 'BoundaryCancelEvent' || containedStencil.idWithoutNs() === 'BoundaryCompensationEvent') {

              // Modify position, otherwise boundary event will get position related to left corner of the canvas instead of the container
              pos = this.editorManager.eventCoordinates(event)
              canAttach = true
            }

            let option = {}
            option['type'] = this.modelData.model.stencilset.namespace + item.id
            option['namespace'] = this.modelData.model.stencilset.namespace
            option['position'] = pos
            option['parent'] = this.editorManager.dragCurrentParent

            class commandClass extends ORYX.Core.Command {
              constructor (option, dockedShape, canAttach, position, facade) {
                super()
                this.option = option
                this.docker = null
                this.dockedShape = dockedShape
                this.dockedShapeParent = dockedShape.parent || facade.getCanvas()
                this.position = position
                this.facade = facade
                this.selection = this.facade.getSelection()
                this.shape = null
                this.parent = null
                this.canAttach = canAttach
              }
              execute() {
                if (!this.shape) {
                  this.shape = this.facade.createShape(option)
                  this.parent = this.shape.parent
                } else if (this.parent) {
                  this.parent.add(this.shape)
                }

                if (this.canAttach && this.shape.dockers && this.shape.dockers.length) {
                  this.docker = this.shape.dockers[0]

                  this.dockedShapeParent.add(this.docker.parent)

                  // Set the Docker to the new Shape
                  this.docker.setDockedShape(undefined)
                  this.docker.bounds.centerMoveTo(this.position)
                  if (this.dockedShape !== this.facade.getCanvas()) {
                    this.docker.setDockedShape(this.dockedShape)
                  }
                  this.facade.setSelection([this.docker.parent])
                }

                this.facade.getCanvas().update()
                this.facade.updateSelection()

              }
              rollback() {
                if (this.shape) {
                  this.facade.setSelection(this.selection.without(this.shape))
                  this.facade.deleteShape(this.shape)
                }
                if (this.canAttach && this.docker) {
                  this.docker.setDockedShape(undefined)
                }
                this.facade.getCanvas().update()
                this.facade.updateSelection()

              }
            }

            // Update canvas
            let command = new commandClass(option, this.editorManager.dragCurrentParent, canAttach, pos, this.editorManager.getEditor())
            this.editorManager.executeCommands([command])

            // Fire event to all who want to know about this
            let dropEvent = {
              type: FLOWABLE.eventBus.EVENT_TYPE_ITEM_DROPPED,
              droppedItem: item,
              position: pos
            }
            this.editorManager.dispatchFlowEvent(dropEvent.type, dropEvent)
          }
        }
        this.editorManager.dragCurrentParent = undefined
        this.editorManager.dragCurrentParentId = undefined
        this.editorManager.dragCurrentParentStencil = undefined
        this.UPDATE_dragCanContain(undefined)
        this.UPDATE_quickMenu(undefined)
        this.editorManager.dropTargetElement = undefined
      },
      overCallback (event, ui) {
        this.UPDATE_dragModeOver(true)
      },
      outCallback (event, ui) {
        this.UPDATE_dragModeOver(false)
        console.log('out==============')
      },
      startDragCallbackQuickMenu (event, ui) {
        this.UPDATE_dragModeOver(false)
        this.UPDATE_quickMenu(true)
      },
      dragCallbackQuickMenu (event, ui) {
        console.log('dragCallbackQuickMenu==============')
        if (this.$store.state.dragModeOver != false) {
          var coord = this.editorManager.eventCoordinatesXY(event.pageX, event.pageY)

          var additionalIEZoom = 1
          if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
            var ua = navigator.userAgent
            if (ua.indexOf('MSIE') >= 0) {
              //IE 10 and below
              var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100)
              if (zoom !== 100) {
                additionalIEZoom = zoom / 100
              }
            }
          }

          if (additionalIEZoom !== 1) {
            coord.x = coord.x / additionalIEZoom
            coord.y = coord.y / additionalIEZoom
          }

          var aShapes = this.editorManager.getCanvas().getAbstractShapesAtPosition(coord)

          if (aShapes.length <= 0) {
            if (event.helper) {
              this.UPDATE_dragCanContain(false)
              return false
            }
          }

          if (aShapes[0] instanceof ORYX.Core.Canvas) {
            this.editorManager.getCanvas().setHightlightStateBasedOnX(coord.x)
          }

          var stencil = undefined
          var stencilSets = this.editorManager.getStencilSets().values()
          for (var i = 0; i < stencilSets.length; i++) {
            var stencilSet = stencilSets[i]
            var nodes = stencilSet.nodes()
            for (var j = 0; j < nodes.length; j++) {
              if (nodes[j].idWithoutNs() === event.target.id) {
                stencil = nodes[j]
                break
              }
            }

            if (!stencil) {
              var edges = stencilSet.edges()
              for (var j = 0; j < edges.length; j++) {
                if (edges[j].idWithoutNs() === event.target.id) {
                  stencil = edges[j]
                  break
                }
              }
            }
          }

          var candidate = aShapes.last()

          var isValid = false
          if (stencil.type() === 'node') {
            // check containment rules
            var canContain = this.editorManager.getRules().canContain({
              containingShape: candidate,
              containedStencil: stencil
            })

            var parentCandidate = aShapes.reverse().find(function (candidate) {
              return (candidate instanceof ORYX.Core.Canvas
                || candidate instanceof ORYX.Core.Node
                || candidate instanceof ORYX.Core.Edge)
            })

            if (!parentCandidate) {
              this.UPDATE_dragCanContain(false)
              return false
            }

            this.editorManager.dragCurrentParent = parentCandidate
            this.editorManager.dragCurrentParentId = parentCandidate.id
            this.editorManager.dragCurrentParentStencil = parentCandidate.getStencil().id()
            this.UPDATE_dragCanContain(canContain)
            this.editorManager.dropTargetElement = parentCandidate
            isValid = canContain

          } else { //Edge

            var shapes = this.editorManager.getSelection()
            if (shapes && shapes.length == 1) {
              var currentSelectedShape = shapes.first()
              var curCan = candidate
              var canConnect = false

              var targetStencil = this.editorManager.getStencilItemById(curCan.getStencil().idWithoutNs())
              if (targetStencil) {
                var associationConnect = false
                if (stencil.idWithoutNs() === 'Association' && (curCan.getStencil().idWithoutNs() === 'TextAnnotation' || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent')) {
                  associationConnect = true
                } else if (stencil.idWithoutNs() === 'DataAssociation' && curCan.getStencil().idWithoutNs() === 'DataStore') {
                  associationConnect = true
                }

                if (targetStencil.canConnectTo || associationConnect) {
                  while (!canConnect && curCan && !(curCan instanceof ORYX.Core.Canvas)) {
                    candidate = curCan
                    //check connection rules
                    canConnect = this.editorManager.getRules().canConnect({
                      sourceShape: currentSelectedShape,
                      edgeStencil: stencil,
                      targetShape: curCan
                    })
                    curCan = curCan.parent
                  }
                }
              }
              var parentCandidate = this.editorManager.getCanvas()

              isValid = canConnect
              this.editorManager.dragCurrentParent = parentCandidate
              this.editorManager.dragCurrentParentId = parentCandidate.id
              this.editorManager.dragCurrentParentStencil = parentCandidate.getStencil().id()
              this.UPDATE_dragCanContain(canConnect)
              this.editorManager.dropTargetElement = candidate
            }

          }

          this.editorManager.handleEvents({
            type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
            highlightId: 'shapeMenu',
            elements: [candidate],
            color: isValid ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
          })
        }
      },
      quickAddItem (newItemId) {
        console.log('Oryx_button:', newItemId)
        let shapes = this.editorManager.getSelection();
        if (shapes && shapes.length === 1) {
          this.currentSelectedShape = shapes.first();

          var containedStencil = undefined;
          var stencilSets = this.editorManager.getStencilSets().values();
          for (let i = 0; i < stencilSets.length; i++) {
            let stencilSet = stencilSets[i];
            let nodes = stencilSet.nodes();
            for (let j = 0; j < nodes.length; j++) {
              if (nodes[j].idWithoutNs() === newItemId) {
                containedStencil = nodes[j];
                break;
              }
            }
          }

          if (!containedStencil) return;

          var option = {type: this.currentSelectedShape.getStencil().namespace() + newItemId, namespace: this.currentSelectedShape.getStencil().namespace()};
          option['connectedShape'] = this.currentSelectedShape;
          option['parent'] = this.currentSelectedShape.parent;
          option['containedStencil'] = containedStencil;

          var args = { sourceShape: this.currentSelectedShape, targetStencil: containedStencil };
          var targetStencil = this.editorManager.getRules().connectMorph(args);

          // Check if there can be a target shape
          if (!targetStencil) {
            return;
          }

          option['connectingType'] = targetStencil.id();
          var command = new FLOWABLE_OPTIONS.CreateCommand(option, undefined, undefined, this.editorManager.getEditor());

          this.editorManager.executeCommands([command]);
        }
      },
      initScrollHandling() {
        var canvasSection = jQuery('#canvasSection');
        canvasSection.scroll(() => {

        });

        canvasSection.scrollStopped(() => {


        });
      },
    }
  }
</script>

<style scoped>

</style>
