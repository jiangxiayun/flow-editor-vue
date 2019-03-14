<template>
  <div>
    <select v-model="property.value" @change="historyLevelChanged" @click.stop>
      <option></option>
      <option>none</option>
      <option>activity</option>
      <option>audit</option>
      <option>full</option>
    </select>
  </div>
</template>

<script>
  export default {
    name: 'process-historylevel-property-write-template',
    props: {
      property: {
        type: Object
      }
    },
    mounted () {
      if (this.property.value === undefined && this.property.value === null) {
        this.property.value = 'None';
      }
    },
    methods: {
      historyLevelChanged () {
        this.$emit('updateProperty', {property: this.property})
      }
    }
  }
</script>

<style scoped>

</style>