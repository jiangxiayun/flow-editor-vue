<template>
  <div>
    <select v-model="property.value" @change="multiInstanceChanged" @click.stop>
      <option>None</option>
      <option>Parallel</option>
      <option>Sequential</option>
    </select>
  </div>
</template>

<script>
  export default {
    name: 'multiinstance-property-write-template',
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
      multiInstanceChanged () {
        this.$emit('updateProperty', {property: this.property})
      }
    }
  }
</script>

<style scoped>

</style>