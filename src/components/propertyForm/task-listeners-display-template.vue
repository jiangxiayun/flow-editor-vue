<template>
  <span v-if="!property.noValue">
    {{$t('PROPERTY.TASKLISTENERS.VALUE',{length:property.value.taskListeners})}}
  </span>
  <span v-else>{{$t('PROPERTY.TASKLISTENERS.EMPTY')}}</span>
</template>

<script>
  export default {
    name: 'task-listeners-display-template',
    props: {
      property: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
  }
</script>

<style scoped>

</style>