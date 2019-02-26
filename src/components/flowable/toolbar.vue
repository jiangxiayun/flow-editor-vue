<template>
  <div class="subheader editor-toolbar" id="editor-header">
    <div class="btn-group">
      <div class="btn-toolbar pull-left" ng-controller="ToolbarController" ng-cloak>
        <button v-for="item in items"
                :key="item.id"
                :id="item.id"
                :title="item.title | translate"
                class="btn btn-inverse"
                :class="{'separator': item.type == 'separator'}"
                :disabled="item.type == 'separator' || item.enabled == false"
                @click="toolbarButtonClicked($index)">
          <i v-if="item.type == 'button'"
             :class="item.cssClass"
             class="toolbar-button" data-toggle="tooltip" :title="item.title | translate"></i>
          <div v-if="item.type == 'separator'" :class="item.cssClass"></div>
        </button>
      </div>
    </div>
    <div class="btn-group pull-right" v-show="!secondaryItems.length">
      <div class="btn-toolbar pull-right" ng-controller="ToolbarController">
        <button :title="item.title | translate"
                v-for="item in secondaryItems"
                :key="item.id"
                :id="item.id"
                class="btn btn-inverse" :class="{'separator': item.type == 'separator'}"
                :disabled="item.type == 'separator'"
                @click="toolbarSecondaryButtonClicked($index)">
          <i v-if="item.type == 'button'"  :class="item.cssClass" class="toolbar-button"
             data-toggle="tooltip" :title="item.title | translate"></i>
          <div v-if="item.type == 'separator'" :class="item.cssClass"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// import { ACTIVITI, KISBPM } from '@/assets/flowable/_config.js'

  export default {
    name: "toolbar",
    data() {
      return {
        items: [],
        secondaryItems: FLOWABLE.TOOLBAR_CONFIG.secondaryItems,
        undoStack: [],
        redoStack: []
      }
    },
    props: {
      editor: {},
      editorManager: {}
    },
    mounted () {
      console.log(1, this.modelData)
      var toolbarItems = FLOWABLE.TOOLBAR_CONFIG.items;
      for (var i = 0; i < toolbarItems.length; i++) {
        if (this.mockData.model.modelType === 'form') {
          if (!toolbarItems[i].disableInForm) {
            this.items.push(toolbarItems[i]);
          }
        } else {
          this.items.push(toolbarItems[i]);
        }
      }

      FLOWABLE.eventBus.addListener(FLOWABLE.eventBus.EVENT_TYPE_UNDO_REDO_RESET,function(){
        this.undoStack = [];
        this.redoStack = [];
        if (this.items) {
          for(var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.undo' || item.action === "FLOWABLE.TOOLBAR.ACTIONS.redo"){
              item.enabled = false;
            }
          }
        }

      },this);

      // Catch all command that are executed and store them on the respective stacks
      this.editorManager.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS, ( evt ) => {

        // If the event has commands
        if( !evt.commands ){ return; }

        this.undoStack.push( evt.commands );
        this.redoStack = [];

        for(var i = 0; i < this.items.length; i++)
        {
          var item = this.items[i];
          if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.undo')
          {
            item.enabled = true;
          }
          else if (item.action === 'FLOWABLE.TOOLBAR.ACTIONS.redo')
          {
            item.enabled = false;
          }
        }

        // Update
        editorManager.getCanvas().update();
        editorManager.updateSelection();

      });
      // Handle enable/disable toolbar buttons
      this.editorManager.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, ( evt ) => {
        var elements = evt.elements;

        for(var i = 0; i < this.items.length; i++)  {
          var item = this.items[i];
          if (item.enabledAction && item.enabledAction === 'element') {
            var minLength = 1;
            if (item.minSelectionCount) {
              minLength = item.minSelectionCount;
            }

            if (elements.length >= minLength && !item.enabled) {
              this.safeApply(function () {
                item.enabled = true;
              });
            } else if (elements.length == 0 && item.enabled) {
              this.safeApply(function () {
                item.enabled = false;
              });
            }
          }
        }
      });
    },
    methods: {
      executeFunctionByName (functionName, context /*, args */) {
        var args = Array.prototype.slice.call(arguments).splice(2);
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for(var i = 0; i < namespaces.length; i++) {
          context = context[namespaces[i]];
        }
        return context[func].apply(this, args);
      },
      toolbarButtonClicked (buttonIndex) {
        // Default behaviour
        var buttonClicked = this.items[buttonIndex];
        var services = {
          'this' : this,
          // '$rootScope' : $rootScope,
          // '$http' : $http,
          // '$modal' : $modal,
          // '$q' : $q,
          // '$translate' : $translate
        };
        this.executeFunctionByName(buttonClicked.action, window, services);

        // Other events
        var event = {
          type : FLOWABLE.eventBus.EVENT_TYPE_TOOLBAR_BUTTON_CLICKED,
          toolbarItem : buttonClicked
        };
        FLOWABLE.eventBus.dispatch(event.type, event);
      },
      toolbarSecondaryButtonClicked (buttonIndex) {
        var buttonClicked = this.secondaryItems[buttonIndex];
        var services = {
          // 'this' : this,
          // '$http' : $http,
          // '$modal' : $modal,
          // '$q' : $q,
          // '$translate' : $translate,
          // '$location': $location
        };
        this.executeFunctionByName(buttonClicked.action, window, services);
      },
      MousetrapBind () {
        /* Key bindings */
        // Mousetrap.bind('mod+z', function(e) {
        //   var services = { '$scope' : $scope, '$rootScope' : $rootScope, '$http' : $http, '$modal' : $modal, '$q' : $q, '$translate' : $translate, 'editorManager' : editorManager};
        //   FLOWABLE.TOOLBAR.ACTIONS.undo(services);
        //   return false;
        // });
        //
        // Mousetrap.bind('mod+y', function(e) {
        //   var services = { '$scope' : $scope, '$rootScope' : $rootScope, '$http' : $http, '$modal' : $modal, '$q' : $q, '$translate' : $translate, 'editorManager' : editorManager};
        //   FLOWABLE.TOOLBAR.ACTIONS.redo(services);
        //   return false;
        // });
        //
        // Mousetrap.bind('mod+c', function(e) {
        //   var services = { '$scope' : $scope, '$rootScope' : $rootScope, '$http' : $http, '$modal' : $modal, '$q' : $q, '$translate' : $translate, 'editorManager' : editorManager};
        //   FLOWABLE.TOOLBAR.ACTIONS.copy(services);
        //   return false;
        // });
        //
        // Mousetrap.bind('mod+v', function(e) {
        //   var services = { '$scope' : $scope, '$rootScope' : $rootScope, '$http' : $http, '$modal' : $modal, '$q' : $q, '$translate' : $translate, 'editorManager' : editorManager};
        //   FLOWABLE.TOOLBAR.ACTIONS.paste(services);
        //   return false;
        // });
        //
        // Mousetrap.bind(['del'], function(e) {
        //   var services = { '$scope' : $scope, '$rootScope' : $rootScope, '$http' : $http, '$modal' : $modal, '$q' : $q, '$translate' : $translate, 'editorManager' : editorManager};
        //   FLOWABLE.TOOLBAR.ACTIONS.deleteItem(services);
        //   return false;
        // });
      }
    }
  }
</script>

<style scoped>

</style>