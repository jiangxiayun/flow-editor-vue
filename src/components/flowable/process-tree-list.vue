<template>
  <div>
    <div @click="showSubProcess(child)"
         class="process-treeview-list-item" :class="{'current-process': child.current}">
      <img :src="`/flowable/editor-app/stencilsets/${getStencilSetName()}/icons/activity/${child.icon}`"
           width="16px;" height="16px;"/>
      {{child.name}}
      <img v-show="!child.current && child.type === 'CollapsedSubProcess'"
           src="/flowable/editor-app/images/pencil.png" class="pull-right" @click="$emit('edit', child.id)" />
    </div>
    <ul v-if="child.children" class="process-treeview-list">
      <li v-for="child in child.children" :key="child.id">
        <process-tree-list></process-tree-list>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: "process-tree-list",
    data () {
      return {}
    },
    props: {
      editorManager: {}
      },
    methods: {
      showSubProcess (child) {
        var flowableShapes = this.editorManager.getChildShapeByResourceId(child.resourceId);
        this.editorManager.setSelection([flowableShapes],[],true);
      }
    }
  }
</script>

<style scoped>

</style>