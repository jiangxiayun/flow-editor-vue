<template>
  <!--画布区域-->
  <div id="canvasHelpWrapper" class="canvasHelpWrapper" @click="clickSvgDown">
    <!--<contextmenu v-show="contextmenu_visibile"-->
    <!--:top="contextmenu_top"-->
    <!--:left="contextmenu_left"-->
    <!--&gt;</contextmenu>-->
    <ul class="contextmenu"
        v-show="contextmenu_visibile"
        :style="{top: contextmenu_top, left: contextmenu_left}">
      <li v-for="item in contextmenuList" :key="item.action"
          @click="clickCommand(item)"
          class="command" >{{item.name}}</li>
    </ul>
    <div class="canvas-wrapper canvasSection" id="canvasSection"
         v-droppable="{onDrop:'dropCallback',onOver: 'overCallback', onOut: 'outCallback'}"
         data-model="droppedElement"
         data-drop="true"
         @scroll.passive="fnScroll">
      <div class="canvas-message" id="model-modified-date"></div>

      <template v-if="UI_CONFIG.Oryx_button_left_bottom">
        <div id="flow_op_btns" v-show="!btn_visibile.hide_shape_buttons">
          <!--删除按钮-->
          <div class="Oryx_button" id="delete-button"
               :title="t('BUTTON.ACTION.DELETE.TOOLTIP')"
               @click="deleteShape">
            <img src="@/assets/images/delete.png"/>
          </div>
          <!--设置修改形状-->
          <div v-if="!btn_visibile.hide_morph_buttons"
               class="Oryx_button" id="morph-button"
               :title="t('BUTTON.ACTION.MORPH.TOOLTIP')"
               @click="morphShape">

            <el-dropdown trigger="click" @command="handleCommand">
      <span class="el-dropdown-link">
        <img src="@/assets/images/wrench.png"/>
        <!--下拉菜单<i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>-->
      </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="item in morphShapes" :key="item.id" :command="item">
                  <img v-if="UI_CONFIG.NODE_ICON_TYPE === 'images'"
                       :src="require(`@/assets/images/bpmn2.0/icons/${item.icon}`)" width="16px;" height="16px;"/>
                  <i v-else-if="UI_CONFIG.NODE_ICON_TYPE === 'iconfont'" class="iconfont" :class="item.icon"></i>
                  {{item.name}}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

          </div>
          <!--编辑-->
          <div v-if="!btn_visibile.hide_edit_buttons"
               class="Oryx_button" id="edit-button" @click="editShape">
            <img src="@/assets/images/pencil.png"/>
          </div>
        </div>
      </template>

      <!--v-draggable="{onStart:'startDragCallbackQuickMenu', onDrag:'dragCallbackQuickMenu',-->
      <!--revert: 'invalid', helper: 'clone', opacity : 0.5}"-->
      <div id="flow_add_btns" v-show="!(btn_visibile.hide_shape_buttons || btn_visibile.hide_flow_add_btns
      || contextmenu_visibile)">
        <div v-for="item in quickMenuItems"
             class="Oryx_button"
             :key="item.id"
             :id="item.id"
             :title="item.description"
             @click="quickAddItem(item.id)"
             data-model="draggedElement"
             data-drag="true"
             v-draggable="{onStart:'startDragCallbackQuickMenu', onDrag:'dragCallbackQuickMenu',
           revert: 'invalid', helper: 'clone', opacity : 0.5}">
          <img v-if="UI_CONFIG.NODE_ICON_TYPE === 'images'"
               :src="require(`@/assets/images/bpmn2.0/icons/${item.icon}`)"/>
          <i v-else-if="UI_CONFIG.NODE_ICON_TYPE === 'iconfont'" class="iconfont" :class="item.icon"></i>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import ORYX_CONFIG from 'src/oryx/CONFIG'
  import FLOW_eventBus from 'src/flowable/FLOW_eventBus'
  import { EventBus } from 'src/EventBus'
  import { _debounce, getAdditionalIEZoom } from 'src/Util'
  import Locale from 'src/mixins/locale'
  import { draggable, droppable } from 'src/directives/drag-drop'
  // import contextmenu from '@/components/contextmenu'
  import Emitter from 'src/mixins/emitter'

  export default {
    name: 'canvasWrapper',
    data () {
      return {
        morphShapes: [],
        currentSelectedMorph: null,
        newShape: null,
        contextmenu_visibile: false,
        contextmenu_top: '0',
        contextmenu_left: '0',
        btn_visibile: {
          hide_shape_buttons: true,
          hide_flow_add_btns: true,
          hide_morph_buttons: true,
          hide_edit_buttons: true
        },
        dragCanContain: false,
        dragModeOver: false,
        quickMenu: undefined,
        UI_CONFIG: ORYX_CONFIG.CustomConfigs.UI_CONFIG
      }
    },
    mixins: [Locale, Emitter],
    // components: { contextmenu },
    directives: {
      draggable,
      droppable
    },
    props: {
      editorManager: {},
      contextmenuList: {
        type: Array,
        default: () => []
      }
    },
    mounted () {
      // 隐藏画布节点的快捷按钮
      FLOW_eventBus.addListener(ORYX_CONFIG.EVENT_TYPE_HIDE_SHAPE_BUTTONS, this.oryxBtnStatus)

      EventBus.$on('UPDATE_dragModeOver', (status) => {
        this.dragModeOver = status
        EventBus.$emit('UPDATE_dragModeOver_forDragItem', status)
      })
      EventBus.$on('UPDATE_dragCanContain', (status) => {
        this.dragCanContain = status
      })
      EventBus.$on('UPDATE_quickMenu', (data) => {
        this.quickMenu = data
      })
      if (this.UI_CONFIG.CUSTOM_CONTEXTMENU) {
        this.handleContextmenu()
      }
    },
    computed: {
      modelData () {
        return this.editorManager ? this.editorManager.getBaseModelData() : []
      },
      quickMenuItems () {
        return this.editorManager ? this.editorManager.quickMenuItems : []
      }
    },
    methods: {
      oryxBtnStatus (btns) {
        // console.log('oryxBtnStatus', btns)
        btns.map(btn => {
          this.btn_visibile[btn.type] = btn.status
        })
      },
      clickCommand (item) {
        this.dispatch('flowEditor', 'clickContextmenuCommand', {action: item, shape: this.currentShape})
      },
      clickSvgDown () {
        this.hideContextmenu()
      },
      handleContextmenu () {
        // disable context menu
        document.getElementById('canvasHelpWrapper').oncontextmenu = (event) => {
          const selectedElements = this.editorManager.getSelection()
          this.selectedElements = selectedElements
          // 用户自定义按钮事件，以$emit抛出 buttonClicked.action 事件
          this.dispatch('flowEditor', 'oncontextmenu', { selectedElements })
          return false
        }
      },
      showContextmenu () {
        if (this.selectedElements.length === 1) {
          this.currentShape = this.selectedElements[0]
          let offset = this.editorManager.getNodeOffset(this.currentShape)
          this.contextmenu_top = `${offset.a.y}px`
          this.contextmenu_left = `${offset.b.x + 5}px`
          this.contextmenu_visibile = true
        }
      },
      hideContextmenu () {
        this.contextmenu_visibile = false
      },
      editShape () {
        this.editorManager.edit(this.selectedShape.resourceId)
      },
      fnScroll () {
        // Hides the resizer and quick menu items during scrolling
        const selectedElements = this.editorManager.getSelection()
        const subSelectionElements = this.editorManager.getSubSelection()

        this.selectedElements = selectedElements
        this.subSelectionElements = subSelectionElements
        if (selectedElements && selectedElements.length > 0) {
          this.selectedElementBeforeScrolling = selectedElements[0]
        }

        if (this.contextmenu_visibile) {
          this.contextmenu_visibile = false
        }
        this.btn_visibile.hide_shape_buttons = true

        jQuery('.resizer_southeast').each(function (i, obj) {
          obj.style.display = 'none'
        })
        jQuery('.resizer_northwest').each(function (i, obj) {
          obj.style.display = 'none'
        })
        this.editorManager.handleEvents({ type: ORYX_CONFIG.EVENT_CANVAS_SCROLL })
        this.fnHandleScrollDebounce()
      },
      fnHandleScrollDebounce: _debounce(function (_type, index, item) {
        this.editorManager.handleEvents({ type: 'canvas.scrollEnd' })
        if (ORYX_CONFIG.CustomConfigs.UI_CONFIG.Oryx_button_right_top) {
          this.editorManager.updateOryxButtonPosition(this.selectedElements)
        }
        this.selectedElements = undefined
        this.subSelectionElements = undefined
      }, 200),
      deleteShape () {
        this.editorManager.TOOLBAR_ACTIONS.deleteItem({ '$scope': this, 'editorManager': this.editorManager })
      },
      morphShape () {
        const shapes = this.editorManager.getSelection()
        if (shapes && shapes.length === 1) {
          this.currentSelectedShape = shapes.first()
          let currentSelectedShapeId = this.currentSelectedShape.getStencil().idWithoutNs()
          const stencilItem = this.editorManager.getStencilItemById(currentSelectedShapeId)

          let morphShapes = []
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
        // const command = new MorphTo(this.currentSelectedShape, stencil, this.editorManager.getEditor())
        // this.editorManager.executeCommands([command])
        this.editorManager.assignCommand('MorphTo', this.currentSelectedShape, stencil, this.editorManager.getEditor())
      },
      dropCallback (event, ui) {
        this.editorManager.handleEvents({
          type: ORYX_CONFIG.EVENT_HIGHLIGHT_HIDE,
          highlightId: 'shapeRepo.attached'
        })
        this.editorManager.handleEvents({
          type: ORYX_CONFIG.EVENT_HIGHLIGHT_HIDE,
          highlightId: 'shapeRepo.added'
        })
        this.editorManager.handleEvents({
          type: ORYX_CONFIG.EVENT_HIGHLIGHT_HIDE,
          highlightId: 'shapeMenu'
        })

        this.editorManager.dispatchFlowEvent(ORYX_CONFIG.EVENT_TYPE_HIDE_SHAPE_BUTTONS, [
          { type: 'hide_shape_buttons', status: true },
          { type: 'hide_flow_add_btns', status: true },
          { type: 'hide_morph_buttons', status: true },
          { type: 'hide_edit_buttons', status: true }
        ])

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
            if (shapes && shapes.length === 1) {
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

              if (containedStencil.idWithoutNs() !== 'SequenceFlow'
                && containedStencil.idWithoutNs() !== 'Association'
                && containedStencil.idWithoutNs() !== 'MessageFlow'
                && containedStencil.idWithoutNs() !== 'DataAssociation') {

                let args = { sourceShape: currentSelectedShape, targetStencil: containedStencil }
                let targetStencil = this.editorManager.getRules().connectMorph(args)
                if (!targetStencil) { // Check if there can be a target shape
                  return
                }
                option.connectingType = targetStencil.id()
              }

              // let command = new FLOWABLE_OPTIONS.CreateCommand(option, this.editorManager.dropTargetElement, pos, this.editorManager.getEditor())
              // this.editorManager.executeCommands([command])
              this.editorManager.assignCommand(
                'CreateCommand',
                option,
                this.editorManager.dropTargetElement,
                pos,
                this.editorManager.getEditor()
              )
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


            // Update canvas
            // let command = new commandClass(option, this.editorManager.dragCurrentParent, canAttach, pos, this.editorManager.getEditor())
            // this.editorManager.executeCommands([command])
            this.editorManager.assignCommand('CommandClass', option, this.editorManager.dragCurrentParent, canAttach, pos, this.editorManager.getEditor())

            // Fire event to all who want to know about this
            let dropEvent = {
              type: ORYX_CONFIG.EVENT_TYPE_ITEM_DROPPED,
              droppedItem: item,
              position: pos
            }
            this.editorManager.dispatchFlowEvent(dropEvent.type, dropEvent)
          }
        }
        this.editorManager.dragCurrentParent = undefined
        this.editorManager.dragCurrentParentId = undefined
        this.editorManager.dragCurrentParentStencil = undefined
        EventBus.$emit('UPDATE_dragCanContain', undefined)
        EventBus.$emit('UPDATE_quickMenu', undefined)
        this.editorManager.dropTargetElement = undefined
      },
      overCallback () {
        EventBus.$emit('UPDATE_dragModeOver', true)
      },
      outCallback () {
        EventBus.$emit('UPDATE_dragModeOver', false)
        console.log('out==============')
      },
      startDragCallbackQuickMenu () {
        EventBus.$emit('UPDATE_dragModeOver', false)
        EventBus.$emit('UPDATE_quickMenu', true)
      },
      dragCallbackQuickMenu (event, ui) {
        if (this.dragModeOver) {
          let coord = this.editorManager.eventCoordinatesXY(event.pageX, event.pageY)

          const aShapes = this.editorManager.getCanvas().getAbstractShapesAtPosition(coord)
          if (aShapes.length <= 0) {
            if (event.helper) {
              this.dragCanContain = false
              return false
            }
          }

          if (this.editorManager.instanceofCanvas(aShapes[0])) {
            this.editorManager.getCanvas().setHightlightStateBasedOnX(coord.x)
          }

          let stencil
          let stencilSets = this.editorManager.getStencilSets().values()
          for (let i = 0; i < stencilSets.length; i++) {
            let stencilSet = stencilSets[i]
            let nodes = stencilSet.nodes()
            for (let j = 0; j < nodes.length; j++) {
              if (nodes[j].idWithoutNs() === event.target.id) {
                stencil = nodes[j]
                break
              }
            }

            if (!stencil) {
              const edges = stencilSet.edges()
              for (let j = 0; j < edges.length; j++) {
                if (edges[j].idWithoutNs() === event.target.id) {
                  stencil = edges[j]
                  break
                }
              }
            }
          }

          let candidate = aShapes.last()

          let isValid = false

          if (stencil.type() === 'node') {
            // check containment rules
            let canContain = this.editorManager.getRules().canContain({
              containingShape: candidate,
              containedStencil: stencil
            })

            let parentCandidate = aShapes.reverse().find((candidate) => {
              return (this.editorManager.instanceofCanvas(candidate)
                || (stencil.id().endsWith('Lane')
                  ? this.editorManager.instanceofNode(candidate)
                  : (this.editorManager.instanceofNode(candidate)
                    && !(candidate.getStencil().id().endsWith('Lane') || candidate.getStencil().id().endsWith('Pool'))
                ))
                || this.editorManager.instanceofEdge(candidate))
            })

            if (!parentCandidate) {
              this.dragCanContain = false
              return false
            }

            this.editorManager.dragCurrentParent = parentCandidate
            this.editorManager.dragCurrentParentId = parentCandidate.id
            this.editorManager.dragCurrentParentStencil = parentCandidate.getStencil().id()
            this.editorManager.dropTargetElement = parentCandidate
            this.dragCanContain = canContain
            isValid = canContain

          } else {
            // Edge
            let shapes = this.editorManager.getSelection()
            if (shapes && shapes.length === 1) {
              let currentSelectedShape = shapes.first()
              let curCan = candidate
              let canConnect = false

              let targetStencil = this.editorManager.getStencilItemById(curCan.getStencil().idWithoutNs())
              if (targetStencil) {
                let associationConnect = false
                if (stencil.idWithoutNs() === 'Association' &&
                  (curCan.getStencil().idWithoutNs() === 'TextAnnotation'
                    || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent'
                    || curCan.getStencil().idWithoutNs() === 'FlowBox')) {
                  associationConnect = true
                } else if (stencil.idWithoutNs() === 'DataAssociation'
                  && curCan.getStencil().idWithoutNs() === 'DataStore') {
                  associationConnect = true
                }

                if (targetStencil.canConnectTo || associationConnect) {
                  while (!canConnect && curCan && !this.editorManager.instanceofCanvas(curCan)) {
                    candidate = curCan
                    // check connection rules
                    canConnect = this.editorManager.getRules().canConnect({
                      sourceShape: currentSelectedShape,
                      edgeStencil: stencil,
                      targetShape: curCan
                    })
                    curCan = curCan.parent
                  }
                }
              }
              let parentCandidate = this.editorManager.getCanvas()

              isValid = canConnect
              this.editorManager.dragCurrentParent = parentCandidate
              this.editorManager.dragCurrentParentId = parentCandidate.id
              this.editorManager.dragCurrentParentStencil = parentCandidate.getStencil().id()
              this.editorManager.dropTargetElement = candidate
              this.dragCanContain = canConnect
            }

          }

          this.editorManager.handleEvents({
            type: ORYX_CONFIG.EVENT_HIGHLIGHT_SHOW,
            highlightId: 'shapeMenu',
            elements: [candidate],
            color: isValid ? ORYX_CONFIG.SELECTION_VALID_COLOR : ORYX_CONFIG.SELECTION_INVALID_COLOR
          })
        }
      },
      quickAddItem (newItemId) {
        // console.log('Oryx_button:', newItemId)
        let shapes = this.editorManager.getSelection()
        if (shapes && shapes.length === 1) {
          this.currentSelectedShape = shapes.first()

          let containedStencil = undefined
          let stencilSets = this.editorManager.getStencilSets().values()
          for (let i = 0; i < stencilSets.length; i++) {
            let stencilSet = stencilSets[i]
            let nodes = stencilSet.nodes()
            for (let j = 0; j < nodes.length; j++) {
              if (nodes[j].idWithoutNs() === newItemId) {
                containedStencil = nodes[j]
                break
              }
            }
          }

          if (!containedStencil) return

          let option = {
            type: this.currentSelectedShape.getStencil().namespace() + newItemId,
            namespace: this.currentSelectedShape.getStencil().namespace()
          }
          option['connectedShape'] = this.currentSelectedShape
          option['parent'] = this.currentSelectedShape.parent
          option['containedStencil'] = containedStencil

          let args = { sourceShape: this.currentSelectedShape, targetStencil: containedStencil }
          let targetStencil = this.editorManager.getRules().connectMorph(args)

          // Check if there can be a target shape
          if (!targetStencil) {
            return
          }

          option['connectingType'] = targetStencil.id()
          this.editorManager.assignCommand('CreateCommand', option, undefined, undefined, this.editorManager.getEditor())
        }
      }
    },
    beforeDestroy () {
      FLOW_eventBus.removeListener(ORYX_CONFIG.EVENT_TYPE_HIDE_SHAPE_BUTTONS, this.oryxBtnStatus)
    }
  }
</script>

<style scoped>

</style>
