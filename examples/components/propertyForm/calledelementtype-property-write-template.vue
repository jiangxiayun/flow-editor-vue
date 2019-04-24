<template>
  <div>
    <select v-model="property.value" @change="calledElementTypeChanged" @click.stop>
      <option>key</option>
      <option>id</option>
    </select>
  </div>
</template>

<script>
  export default {
    name: 'calledelementtype-property-write-template',
    props: {
      property: {
        type: Object
      }
    },
    mounted () {
      if (this.property.value === undefined && this.property.value === null) {
        this.property.value = 'key';
      }
    },
    methods: {
      calledElementTypeChanged () {
        this.$emit('updateProperty', {property: this.property})
      }
    }
  }
</script>

<style scoped>

</style>