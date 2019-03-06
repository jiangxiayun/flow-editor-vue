<template>
  <div class="subheader editor-toolbar" id="editor-header">
    <div class="btn-group">
      <div class="btn-toolbar pull-left">
        <button v-for="(item, index) in items"
                :key="item.id"
                :id="item.id"
                class="btn btn-inverse"
                :class="{'separator': item.type == 'separator'}"
                :disabled="item.type == 'separator' || item.enabled == false"
                @click="toolbarButtonClicked(index)">
          <i v-if="item.type == 'button'"
             :class="item.cssClass"
             class="toolbar-button" data-toggle="tooltip" :title="$t(item.title)"></i>
          <div v-if="item.type == 'separator'" :class="item.cssClass"></div>
        </button>
      </div>
    </div>

    <div class="btn-group pull-right" v-show="secondaryItems.length > 0">
      <div class="btn-toolbar pull-right">
        <button v-for="(item, index) in secondaryItems"
                :key="item.id"
                :id="item.id"
                :title="item.title | translate"
                class="btn btn-inverse" :class="{'separator': item.type == 'separator'}"
                :disabled="item.type == 'separator'"
                @click="toolbarSecondaryButtonClicked(index)">
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
        undoStack: [],
        redoStack: []
      }
    },
    props: {
      editor: {},
      editorManager: {}
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

    },
    methods: {
      executeFunctionByName (functionName, context /*, args */) {
        var args = Array.prototype.slice.call(arguments).splice(2);
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for(let i = 0; i < namespaces.length; i++) {
          context = context[namespaces[i]];
        }
        console.log('func', func)
        return context[func].apply(this, args);
      },
      toolbarButtonClicked (buttonIndex) {
        // Default behaviour
        let buttonClicked = this.items[buttonIndex];
        let services = {
          '$scope' : this,
          '$rootScope' : this.$parent,
          // '$http' : $http,
          // '$modal' : $modal,
          // '$q' : $q,
          // '$translate' : $translate,
          'editorManager' : this.editorManager
        };
        this.executeFunctionByName(buttonClicked.action, window, services);

        // Other events
        let event = {
          type : FLOWABLE.eventBus.EVENT_TYPE_TOOLBAR_BUTTON_CLICKED,
          toolbarItem : buttonClicked
        };
        FLOWABLE.eventBus.dispatch(event.type, event);
      },
      toolbarSecondaryButtonClicked (buttonIndex) {
        let buttonClicked = this.secondaryItems[buttonIndex];
        let services = {
          '$scope' : this,
          // '$http' : $http,
          // '$modal' : $modal,
          // '$q' : $q,
          // '$translate' : $translate,
          // '$location': $location,
          'editorManager' : this.editorManager
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
    },
    watch: {
      editorManager () {

      }
    }
  }
</script>

<style scoped>

</style>