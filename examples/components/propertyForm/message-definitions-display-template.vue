<template>
  <!--消息定义-->
  <label>
    <span v-if="!property.noValue">
      {{ $t('PROPERTY.MESSAGEDEFINITIONS.DISPLAY', { length: property.value.length }) }}
    </span>
    <span v-if="property.noValue" translate>
       {{ $t('PROPERTY.MESSAGEDEFINITIONS.EMPTY') }}
      </span>
  </label>
</template>

<script>
  export default {
    name: 'message-definitions-display-template',
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