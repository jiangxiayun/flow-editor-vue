<template>
  <label>
    <span v-if="!property.noValue">{{ property.value | limitLength(20) }}</span>
    <span v-if="!property.noValue && property.value != null && property.value.length > 20">...</span>
    <span v-if="property.noValue">{{$t('PROPERTY.EMPTY')}}</span>
  </label>
</template>

<script>
  export default {
    name: 'default-value-display-template',
    props: {
      property: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    mounted () {}
  }
</script>

<style scoped>

</style>