<template>
  <div>
    <select v-model="property.value" @change="orderingChanged" @click.stop>
      <option>Parallel</option>
      <option>Sequential</option>
    </select>
  </div>
</template>

<script>
  export default {
    name: 'ordering-property-write-template',
    props: {
      property: {
        type: Object
      }
    },
    mounted () {
      if (this.property.value === undefined && this.property.value === null) {
        this.property.value = 'Parallel';
      }
    },
    methods: {
      orderingChanged () {
        this.$emit('updateProperty', {property: this.property})
      }
    }
  }
</script>

<style scoped>

</style>