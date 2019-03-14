<template>
  <!--组件元素-->
  <div id="paletteHelpWrapper" class="col-xs-3 full-height" :class="{close: !paletteWrapperOpen}">
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
      ...mapState('Flowable', ['paletteWrapperOpen']),
      stencilItemGroups () {
        if (!this.editorManager) return []
        const data = this.editorManager.getShowStencilData();
        return data
      },
    },
    methods: {
      ...mapMutations('Flowable', ['UPDATE_paletteWrapperOpen']),
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
      expandedToggle (group) {
        let expanded = !group.expanded
        this.$set(group, 'expanded',  expanded)
      }
    }
  }
</script>

<style scoped>
#paletteSection {
  height: calc(100% - 200px - 50px);
}
</style>