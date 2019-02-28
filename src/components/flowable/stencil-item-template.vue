<template>
  <div>
    <span @click="expandedToggle">
        <i class="glyphicon"
           :class="{'glyphicon-chevron-right': !group.expanded, 'glyphicon-chevron-down': group.expanded}"></i>
       {{$t(group.name)}}
    </span>

    <!-- Child groups -->
    <ul v-for="group in group.groups"
        :key="group.id"
        class="stencil-group stencil-group-non-root"
        :class="{collapsed: !group.expanded, 'first': $first}">
      <stencil-item-template></stencil-item-template>
    </ul>

    <!-- Group items -->
    <ul>
      <!--ng-model="draggedElement"-->
      <li v-for="item in group.paletteItems" class="stencil-item"
          :key="item.id"
          :id="item.id"
          :title="item.description"
          data-drag="true"
          :jqyoui-draggable="{onStart:'startDragCallback', onDrag:'dragCallback'}"
          :data-jqyoui-options="{revert: 'invalid', helper: 'clone', opacity : 0.5}">
        <img v-if="!item.customIcon" width="16px;" height="16px;"
             :src="`/flowable/editor-app/stencilsets/${getStencilSetName()}/icons/${item.icon}`" />
        <img v-if="item.customIcon" :src="getImageUrl(item.icon)" width="16px;" height="16px;"/>
        {{$t(item.name)}}
      </li>
    </ul>

  </div>
</template>

<script>
  export default {
    name: "stencil-item-template",
    data () {
      return {

      }
    },
    props: {
      editorManager: {},
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
    },
    methods: {
      expandedToggle () {
        this.$emit('expandedToggle')
      }
    }
  }
</script>

<style scoped>

</style>