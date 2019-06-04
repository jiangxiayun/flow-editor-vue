<template>
  <div class="subheader editor-toolbar" id="editor-header">
    <div class="btn-group">
      <div class="btn-toolbar pull-left">
        <button v-for="(item, index) in items"
                :key="item.id"
                :id="item.id"
                :title="t(item.title)"
                class="btn btn-inverse"
                :class="{'separator': item.type === 'separator'}"
                :disabled="item.type === 'separator' || item.enabled === false"
                @click="toolbarButtonClicked(index)">
          <i v-if="item.type === 'button'"
             :class="item.cssClass"
             class="toolbar-button" data-toggle="tooltip" :title="t(item.title)"></i>
          <div v-else-if="item.type === 'separator'" :class="item.cssClass"></div>
        </button>
      </div>
    </div>

    <div class="btn-group pull-right" v-show="secondaryItems.length > 0">
      <div class="btn-toolbar pull-right">
        <button v-for="(item, index) in secondaryItems"
                :key="item.id"
                :id="item.id"
                :title="t(item.title)"
                class="btn btn-inverse" :class="{'separator': item.type == 'separator'}"
                :disabled="item.type == 'separator'"
                @click="toolbarSecondaryButtonClicked(index)">
          <i v-if="item.type == 'button'" :class="item.cssClass" class="toolbar-button"
             data-toggle="tooltip" :title="t(item.title)"></i>
          <div v-if="item.type == 'separator'" :class="item.cssClass"></div>
        </button>
      </div>
    </div>

  </div>
</template>

<script>
  import Mousetrap from 'mousetrap'
  import ORYX_CONFIG from 'src/oryx/CONFIG'
  import Locale from 'src/mixins/locale'
  import Emitter from 'src/mixins/emitter'

  export default {
    name: 'toolbar',
    data () {
      return {
        undoStack: [],
        redoStack: [],
        account: {},
      }
    },
    mixins: [Locale, Emitter],
    props: {
      editor: {},
      editorManager: {},
      interceptorsDraw: Function
    },
    computed: {
      items () {
        return this.editorManager ? this.editorManager.getToolbarItems() : []
      },
      secondaryItems () {
        return this.editorManager ? this.editorManager.getSecondaryItems() : []
      }
    },
    mounted () {
      this.MousetrapBind()
    },
    methods: {
      executeFunctionByName (functionName, context) {
        let namespaces = functionName.split('.')
        let func = namespaces.pop()
        return this.editorManager.TOOLBAR_ACTIONS[func](context)

        // const args = Array.prototype.slice.call(arguments).splice(2)
        // let namespaces = functionName.split('.')
        // let func = namespaces.pop()
        // for (let i = 1; i < namespaces.length; i++) {
        //   context = context[namespaces[i]]
        // }
        // return context[func].apply(this, args)
      },
      toolbarButtonClicked (buttonIndex) {
        let buttonClicked = this.items[buttonIndex]
        if (buttonClicked.actionType === 'custom-defined') {
          // 用户自定义按钮事件，以$emit抛出 buttonClicked.action 事件
          this.dispatch('flowEditor', buttonClicked.action, this.editorManager, true)
        } else if (buttonClicked.actionType === 'internal') {
          this.buttonClicked = buttonClicked
          // 判断是否有事件拦截器
          if (buttonClicked.interceptors && typeof this.interceptorsDraw === 'function') {
            this.interceptorsDraw(this.doBtnActionAndBubble, buttonClicked.interceptorsType)
          } else {
            this.doBtnActionAndBubble()
          }
        }
      },
      doBtnAction () {
        console.log(66, this.buttonClicked)
        // 插件预设事件
        // Default behaviour
        let services = {
          '$scope': this,
          '$rootScope': this.$parent,
          'editorManager': this.editorManager
        }
        console.log(55, services, this.buttonClicked.action)

        this.executeFunctionByName(this.buttonClicked.action, services)
      },
      doBtnActionAndBubble () {
        this.doBtnAction()
        // Other events
        let event = {
          type: ORYX_CONFIG.EVENT_TYPE_TOOLBAR_BUTTON_CLICKED,
          toolbarItem: this.buttonClicked
        }
        this.editorManager.dispatchFlowEvent(event.type, event)
      },
      toolbarSecondaryButtonClicked (buttonIndex) {
        let buttonClicked = this.secondaryItems[buttonIndex]
        let services = {
          'this': this,
          'editorManager': this.editorManager
        }
        this.executeFunctionByName(buttonClicked.action, services)
      },
      MousetrapBind () {
        /* Key bindings */
        Mousetrap.bind('mod+z', () => {
          const services = { '$scope': this, 'editorManager': this.editorManager }
          this.editorManager.TOOLBAR_ACTIONS.undo(services)
          return false
        })

        Mousetrap.bind('mod+y', () => {
          const services = { '$scope': this, 'editorManager': this.editorManager }
          this.editorManager.TOOLBAR_ACTIONS.redo(services)
          return false
        })

        Mousetrap.bind('mod+c', () => {
          const services = { '$scope': this, 'editorManager': this.editorManager }
          this.editorManager.TOOLBAR_ACTIONS.copy(services)
          return false
        })

        Mousetrap.bind('mod+v', () => {
          this.buttonClicked = {
            action:  'FLOWABLE.TOOLBAR.ACTIONS.paste'
          }
          if (typeof this.interceptorsDraw === 'function') {
            this.interceptorsDraw(this.doBtnAction, 'paste')
          } else {
            this.doBtnAction()
          }
          return false
        })

        Mousetrap.bind(['del'], () => {
          const services = { '$scope': this, 'editorManager': this.editorManager }
          this.editorManager.TOOLBAR_ACTIONS.deleteItem(services)
          return false
        })
      },
      registerOnEvent () {
        // 捕获所有执行的命令并将它们存储在各自的堆栈上
        this.editorManager.registerOnEvent(ORYX_CONFIG.EVENT_EXECUTE_COMMANDS, (evt) => {
          // If the event has commands
          if (!evt.commands) return

          this.undoStack.push(evt.commands)
          this.redoStack = []

          for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.undo') {
              item.enabled = true
            } else if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.redo') {
              item.enabled = false
            }
          }

          // Update
          this.editorManager.getCanvas().update()
          this.editorManager.updateSelection()
        })
      },
      safeApply: function (fn) {
        if (this.$root) {
          let phase = this.$root.$$phase
          if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
              fn()
            }
          } else {
            // this.$apply(fn);
          }

        } else {
          // this.$apply(fn);
        }
      }
    },
    watch: {
      editorManager (nv, ov) {
        if (!ov) {
          this.registerOnEvent()
        }
      }
    }
  }
</script>

<style scoped>

</style>
