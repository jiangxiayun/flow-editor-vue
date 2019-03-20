<template>
  <!--连线条件-->
  <label>
    <template v-if="property.value">
      <span v-if="!property.value.expression">
      {{property.value|limitLength(20)}}
    </span>
      <span v-else-if="property.value.expression.type != 'variables' && property.value.expression.staticValue">
      {{property.value.expression.staticValue| limitLength(20)}}
    </span>
    </template>

    <span v-else>
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