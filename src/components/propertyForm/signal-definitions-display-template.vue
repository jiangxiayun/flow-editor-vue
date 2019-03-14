<template>
  <!--信号定义-->
  <label>
    <span v-if="!property.noValue">
      {{ $t('PROPERTY.SIGNALDEFINITIONS.DISPLAY', { length: property.value.length }) }}
    </span>
    <span v-if="property.noValue">
      {{ $t('PROPERTY.SIGNALDEFINITIONS.EMPTY') }}
    </span>
  </label>
</template>

<script>
  export default {
    name: 'signal-definitions-display-template',
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