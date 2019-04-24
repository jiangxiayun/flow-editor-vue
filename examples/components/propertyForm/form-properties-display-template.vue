<template>
  <span v-if="!property.noValue">
    {{$t('PROPERTY.FORMPROPERTIES.VALUE', {length: property.value.formProperties})}}
  </span>
  <span v-else>{{$t('PROPERTY.FORMPROPERTIES.EMPTY')}}</span>
</template>

<script>
  export default {
    name: 'form-properties-display-template',
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