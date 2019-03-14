<template>
  <!--执行监听器-->
  <label>
    <span v-if="!property.noValue">
       {{ $t('PROPERTY.EXECUTIONLISTENERS.DISPLAY', { length: property.value.executionListeners.length }) }}
    </span>
    <span v-if="property.noValue">
       {{ $t('PROPERTY.EXECUTIONLISTENERS.EMPTY') }}
    </span>
  </label>
</template>

<script>
  export default {
    name: 'execution-listeners-display-template',
    props: {
      property: {
        type: Object,
        default: function () {
          return {}
        }
      }
    }
  }
</script>

<style scoped>

</style>