<template>
  <label>
    <span v-if="property.value.items && property.value.items.length > 0">
      {{ $t('PROPERTY.DATAPROPERTIES.VALUES', { length: property.value.items.length }) }}
    </span>
    <span v-if="!property.value.items || property.value.items.length == 0">
      {{ $t('PROPERTY.DATAPROPERTIES.EMPTY') }}
    </span>

  </label>
</template>

<script>
  export default {
    name: 'data-properties-display-template',
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