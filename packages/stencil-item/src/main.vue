<template>
  <div>
    <span @click="expandedToggle">
        <i class="glyphicon"
           :class="{'glyphicon-chevron-right': !group.expanded, 'glyphicon-chevron-down': group.expanded}"></i>
       {{group.name}}
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
      <li v-for="item in group.paletteItems" class="stencil-item"
          :key="item.id">
        <stencil-drag-item :item="item" :editorManager="editorManager"></stencil-drag-item>
      </li>
    </ul>

  </div>
</template>

<script>

  export default {
    name: "stencil-item-template",
    data() {
      return {}
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
    computed: {
      stencilItemGroups () {
        if (!this.editorManager) return []
        return this.editorManager.getShowStencilData();
      }
    },
    methods: {
      expandedToggle() {
        this.$emit('expandedToggle')
      },
    }
  }
</script>

<style scoped>

</style>
