<template>
  <!--连线条件-->
  <label>
    <span v-if="property.value.expression.type != 'variables' && property.value.expression.staticValue">
      {{property.value.expression.staticValue| limitLength(20)}}
    </span>
    <span v-if="property.value && !property.value.expression">
      {{property.value|limitLength(20)}}
    </span>
    <span v-if="!property.value">
      {{$t('PROPERTY.SEQUENCEFLOW.CONDITION.NO-CONDITION-DISPLAY')}}
    </span>
  </label>
</template>

<script>
  export default {
    name: 'condition-expression-display-template',
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