<template>
  <!--画布区域-->
  <div id="canvasHelpWrapper" class="col-xs-9">
    <!--ng-model="droppedElement"-->
    <div class="canvas-wrapper" id="canvasSection"

         data-drop="true"
         data-jqyoui-options
         jqyoui-droppable="{onDrop:'dropCallback',onOver: 'overCallback', onOut: 'outCallback'}">
      <div class="canvas-message" id="model-modified-date"></div>
      <div class="Oryx_button"
           id="delete-button"
           :title="'BUTTON.ACTION.DELETE.TOOLTIP' | translate"
           @click="deleteShape()"
           style="display:none">
        <img src="editor-app/images/delete.png"/>
      </div>
      <div class="Oryx_button"
           id="morph-button"
           title="{{'BUTTON.ACTION.MORPH.TOOLTIP' | translate}}"
           @click="morphShape()"
           style="display:none">
        <img src="editor-app/images/wrench.png"/>
      </div>
      <div class="Oryx_button"
           v-for="item in quickMenuItems"
           :key="item.id"
           :id="item.id"
           :title="item.description"
           @click="quickAddItem(item.id)"

           data-drag="true"
           jqyoui-draggable="{onStart:'startDragCallbackQuickMenu', onDrag:'dragCallbackQuickMenu'}"
           data-jqyoui-options="{revert: 'invalid', helper: 'clone', opacity : 0.5}"
           style="display:none">
        <!--ng-model="draggedElement"-->
        <img :src="`editor-app/stencilsets/bpmn2.0/icons/${item.icon}`"/>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "canvasWrapper"
  }
</script>

<style scoped>

</style>