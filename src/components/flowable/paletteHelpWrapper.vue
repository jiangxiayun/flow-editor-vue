<template>
  <!--组件元素-->
  <div id="paletteHelpWrapper" class="col-xs-3">
    <div class="stencils" id="paletteSection">
      <div v-if="stencilItemGroups.length > 1">
        <div v-for="group in stencilItemGroups" :key="group.items">
          <ul v-if="group.visible && group.items" class="stencil-group"
              :class="{collapsed: !group.expanded, 'first': $first}">
            <!--<li ng-include="'editor-app/partials/stencil-item-template.html?version=4'"></li>-->
          </ul>

          <!--<div v-if="!group.items" ng-include="'editor-app/partials/root-stencil-item-template.html?version=4'"></div>-->

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

            <img :src="`editor-app/stencilsets/bpmn2.0/icons/${item.icon}`" width="16px;" height="16px;"/>
            {{item.name}}
          </li>
          <!--ng-model="draggedElement"-->
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "paletteHelpWrapper"
  }
</script>

<style scoped>

</style>