<template>
  <label>
    <span v-if="!property.noValue">
      {{ $t('PROPERTY.EVENTLISTENERS.DISPLAY', { length: property.value.eventListeners.length }) }}
    </span>
    <span v-if="property.noValue">
      {{ $t('PROPERTY.EVENTLISTENERS.EMPTY') }}
    </span>
  </label>
</template>

<script>
  export default {
    name: 'event-listeners-display-template',
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