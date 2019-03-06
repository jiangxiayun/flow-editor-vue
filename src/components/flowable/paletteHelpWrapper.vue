<template>
  <!--组件元素-->
  <div id="paletteHelpWrapper" class="col-xs-3" :class="{close: !paletteWrapperOpen}">
    <div class="stencils" id="paletteSection">
      <div v-if="stencilItemGroups.length > 1">
        <div v-for="(group, index) in stencilItemGroups" :key="group.name">
          <ul v-if="group.visible && group.items" class="stencil-group"
              :class="{collapsed: !group.expanded, 'first': index == 0}">
            <li>
              <stencil-item-template :group="group" :editorManager="editorManager"
                                     @expandedToggle="expandedToggle(group)">
              </stencil-item-template>
            </li>
          </ul>

          <div v-if="!group.items">
            <root-stencil-item-template :group="group"></root-stencil-item-template>
          </div>

        </div>
      </div>
      <div v-if="stencilItemGroups.length == 1">
        <ul class="stencil-group">
          <li v-for="item in stencilItemGroups[0].paletteItems" class="stencil-item"
              :key="item.id"
              :id="item.id"
              :title="item.description"

              data-drag="true"
              jqyoui-draggable="{onStart:'startDragCallback', onDrag:'dragCallback'}"
              data-jqyoui-options="{revert: 'invalid', helper: 'clone', opacity : 0.5}">

            <img :src="`../../assets/images/stencilsets/bpmn2.0/icons/${item.icon}`" width="16px;" height="16px;"/>
            <img v-if="!item.customIcon" width="16px;" height="16px;"
                 :src="`../../assets/images/stencilsets/${getStencilSetName()}/icons/${item.icon}`"/>
            <img v-if="item.customIcon" width="16px;" height="16px;"
                 :src="getImageUrl(item.icon)" />
            {{item.name | translate}}
          </li>
          <!--ng-model="draggedElement"-->
        </ul>
      </div>
    </div>
    <!--ng-controller="ProcessNavigatorController"-->
    <div id="process-treeview-wrapper">
      <div class="process-treeview-header">
        Process Navigator
      </div>
      <div class="process-treeview-body" v-show="isEditorReady">
        <div class="process-treeview-process-title" :title="treeview.id"
             :class="{'current-process': treeview.current}" >
          Process: {{treeview.name}}
          <img v-show="!treeview.current"
               src="/flowable/editor-app/images/pencil.png" class="pull-right"
               @click="edit(treeview.id)" />
        </div>
        <ul class="process-treeview-list" v-if="treeview.children">
          <li v-for="child in treeview.children" :key="child.id">
            <process-tree-list :editorManager="editorManager" @edit="edit"></process-tree-list>
          </li>

        </ul>
        <div v-if="!treeview.children || treeview.children.length == 0" style="padding-left: 5px;">
          No structural elements used.
        </div>
      </div>
    </div>
    <div id="paletteSectionFooter" @click="updatePaletteWrapperOpen">
      <i class="glyphicon glyphicon-chevron-left"></i>
    </div>
  </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'
  import stencilItemTemplate from '@/components/flowable/stencil-item-template'
  import processTreeList from '@/components/flowable/process-tree-list'
  import rootStencilItemTemplate from '@/components/flowable/root-stencil-item-template'

  export default {
    name: "paletteHelpWrapper",
    data () {
      return {
        treeview: {},
        isEditorReady: false
      }
    },
    components: {stencilItemTemplate, processTreeList, rootStencilItemTemplate},
    props: {
      editorManager: {}
    },
    mounted () {

    },
    computed: {
      ...mapState('Flowable', ['paletteWrapperOpen', 'stencilItemGroups'])
    },
    methods: {
      ...mapMutations('Flowable', ['UPDATE_stencilItemGroups', 'UPDATE_quickMenuItems', 'UPDATE_paletteWrapperOpen']),
      init () {
        var data = this.editorManager.getStencilData();

        var quickMenuDefinition = undefined;
        var ignoreForPaletteDefinition = undefined;
        if (data.namespace == 'http://b3mn.org/stencilset/cmmn1.1#') {
          quickMenuDefinition = ['HumanTask', 'Association'];
          ignoreForPaletteDefinition = ['CasePlanModel'];
        } else {
          quickMenuDefinition = ['UserTask', 'EndNoneEvent', 'ExclusiveGateway',
            'CatchTimerEvent', 'ThrowNoneEvent', 'TextAnnotation',
            'SequenceFlow', 'Association'];
          ignoreForPaletteDefinition = ['SequenceFlow', 'MessageFlow', 'Association', 'DataAssociation', 'DataStore', 'SendTask'];
        }

        var quickMenuItems = [];
        var morphRoles = [];
        for (let i = 0; i < data.rules.morphingRules.length; i++) {
          var role = data.rules.morphingRules[i].role;
          var roleItem = {'role': role, 'morphOptions': []};
          morphRoles.push(roleItem);
        }

        let stencilItemGroups_ary = []

        // Check all received items
        for (let stencilIndex = 0; stencilIndex < data.stencils.length; stencilIndex++) {
          // Check if the root group is the 'diagram' group. If so, this item should not be shown.
          var currentGroupName = data.stencils[stencilIndex].groups[0];
          if (currentGroupName === 'Diagram' || currentGroupName === 'Form') {
            continue;  // go to next item
          }

          var removed = false;
          if (data.stencils[stencilIndex].removed) {
            removed = true;
          }

          var currentGroup = undefined;
          if (!removed) {
            // Check if this group already exists. If not, we create a new one
            if (currentGroupName !== null && currentGroupName !== undefined && currentGroupName.length > 0) {

              currentGroup = this.findGroup(currentGroupName, stencilItemGroups_ary); // Find group in root groups array
              if (currentGroup === null) {
                currentGroup = this.addGroup(currentGroupName, stencilItemGroups_ary);
              }

              // Add all child groups (if any)
              for (var groupIndex = 1; groupIndex < data.stencils[stencilIndex].groups.length; groupIndex++) {
                var childGroupName = data.stencils[stencilIndex].groups[groupIndex];
                var childGroup = this.findGroup(childGroupName, currentGroup.groups);
                if (childGroup === null) {
                  childGroup = this.addGroup(childGroupName, currentGroup.groups);
                }

                // The current group variable holds the parent of the next group (if any),
                // and is basically the last element in the array of groups defined in the stencil item
                currentGroup = childGroup;
              }
            }
          }

          // Construct the stencil item
          var stencilItem = {
            'id': data.stencils[stencilIndex].id,
            'name': data.stencils[stencilIndex].title,
            'description': data.stencils[stencilIndex].description,
            'icon': data.stencils[stencilIndex].icon,
            'type': data.stencils[stencilIndex].type,
            'roles': data.stencils[stencilIndex].roles,
            'removed': removed,
            'customIcon': false,
            'canConnect': false,
            'canConnectTo': false,
            'canConnectAssociation': false
          };

          if (data.stencils[stencilIndex].customIconId && data.stencils[stencilIndex].customIconId > 0) {
            stencilItem.customIcon = true;
            stencilItem.icon = data.stencils[stencilIndex].customIconId;
          }

          if (!removed) {
            if (quickMenuDefinition.indexOf(stencilItem.id) >= 0) {
              quickMenuItems[quickMenuDefinition.indexOf(stencilItem.id)] = stencilItem;
            }
          }

          if (stencilItem.id === 'TextAnnotation' || stencilItem.id === 'BoundaryCompensationEvent') {
            stencilItem.canConnectAssociation = true;
          }

          for (let i = 0; i < data.stencils[stencilIndex].roles.length; i++) {
            var stencilRole = data.stencils[stencilIndex].roles[i];
            if (data.namespace == 'http://b3mn.org/stencilset/cmmn1.1#') {
              if (stencilRole === 'association_start') {
                stencilItem.canConnect = true;
              } else if (stencilRole === 'association_end') {
                stencilItem.canConnectTo = true;
              }
            } else {
              if (stencilRole === 'sequence_start') {
                stencilItem.canConnect = true;
              } else if (stencilRole === 'sequence_end') {
                stencilItem.canConnectTo = true;
              }
            }

            for (let j = 0; j < morphRoles.length; j++) {
              if (stencilRole === morphRoles[j].role) {
                if (!removed) {
                  morphRoles[j].morphOptions.push(stencilItem);
                }
                stencilItem.morphRole = morphRoles[j].role;
                break;
              }
            }
          }


          if (currentGroup) {
            // Add the stencil item to the correct group
            currentGroup.items.push(stencilItem);
            if (ignoreForPaletteDefinition.indexOf(stencilItem.id) < 0) {
              currentGroup.paletteItems.push(stencilItem);
            }
          } else {
            // It's a root stencil element
            if (!removed) {
              stencilItemGroups_ary.push(stencilItem);
            }
          }

        }

        for (let i = 0; i < stencilItemGroups_ary.length; i++)  {
          if (stencilItemGroups_ary[i].paletteItems && stencilItemGroups_ary[i].paletteItems.length == 0) {
            stencilItemGroups_ary[i].visible = false;
          }
        }

        console.log('stencilItemGroups_ary', stencilItemGroups_ary)
        this.UPDATE_stencilItemGroups(stencilItemGroups_ary)
        console.log('stencilItemGroups', this.stencilItemGroups)

        var containmentRules = [];
        for (let i = 0; i < data.rules.containmentRules.length; i++) {
          var rule = data.rules.containmentRules[i];
          containmentRules.push(rule);
        }
        this.containmentRules = containmentRules;
        // remove quick menu items which are not available anymore due to custom pallette
        var availableQuickMenuItems = [];
        for (var i = 0; i < quickMenuItems.length; i++) {
          if (quickMenuItems[i]) {
            availableQuickMenuItems[availableQuickMenuItems.length] = quickMenuItems[i];
          }
        }

        this.UPDATE_quickMenuItems(availableQuickMenuItems)
        this.morphRoles = morphRoles;



      },
      updatePaletteWrapperOpen () {
        this.UPDATE_paletteWrapperOpen(false)
      },
      showSubProcess (child) {
        var flowableShapes = this.editorManager.getChildShapeByResourceId(child.resourceId);
        this.editorManager.setSelection([flowableShapes],[],true);
      },
      edit (resourceId) {
        this.editorManager.edit(resourceId);
      },
      filterEvent(event){
        //this event is fired when the user changes a property by the property editor.
        if(event.type === "event-type-property-value-changed"){
          if(event.property.key === "oryx-overrideid" || event.property.key === "oryx-name"){
            this.renderProcessHierarchy()
          }
          //this event is fired when the stencil / shape's text is changed / updated.
        }else if(event.type === "propertyChanged"){
          if(event.name === "oryx-overrideid" || event.name === "oryx-name"){
            this.renderProcessHierarchy();
          }
        }else if(event.type === ORYX.CONFIG.ACTION_DELETE_COMPLETED){
          this.renderProcessHierarchy();
          //for some reason the new tree does not trigger an ui update.
          //$scope.$apply();
        }else if(event.type === "event-type-item-dropped"){
          this.renderProcessHierarchy();
        }
      },
      renderProcessHierarchy(){
        //only start calculating when the editor has done all his constructor work.
        if(!this.isEditorReady){
          return false;
        }

        if (!this.editorManager.isLoading()){
          //the current implementation of has a lot of eventlisteners. when calling getTree() it could manipulate
          //the canvastracker while the canvas is stille loading stuff.
          //TODO: check if its possible to trigger the re-rendering by a single event instead of registering on 10 events...
          this.treeview = this.editorManager.getTree();
        }

      },
      expandedToggle (group) {
        let expanded = !group.expanded
        this.$set(group, 'expanded',  expanded)
      }
    },
    watch: {
      editorManager () {
        this.init()
      }
    }
  }
</script>

<style scoped>

</style>