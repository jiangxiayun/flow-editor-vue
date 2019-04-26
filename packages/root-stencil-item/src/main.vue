<template>
  <!--ng-model="draggedElement"-->
  <span class="stencil-item root-stencil-item"
        :id="group.id"
        :title="group.description"

        data-drag="true"
        jqyoui-draggable="{onStart:'startDragCallback', onDrag:'dragCallback'}"
        data-jqyoui-options="{revert: 'invalid', helper: 'clone', opacity : 0.5}">
        <img v-if="!group.customIcon" width="16px;" height="16px;"
             :src="`/flowable/editor-app/stencilsets/${getStencilSetName()}/icons/${group.icon}`"/>
        <img v-if="group.customIcon" :src="getImageUrl(group.icon)" width="16px;" height="16px;"/>
        {{group.name}}
</span>

</template>

<script>
  export default {
    name: "root-stencil-item-template",
    props: {
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
    }
  }
</script>

<style scoped>

</style>
