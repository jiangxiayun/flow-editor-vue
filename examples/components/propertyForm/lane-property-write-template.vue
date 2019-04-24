<template>
  <div>
    <select v-model="property.value" @change="multiInstanceChanged" @click.stop>
      <option value="None">None</option>
      <option value="oryx-department">部门</option>
      <option value="oryx-activerole">角色</option>
      <option value="oryx-activesystem">系统</option>
    </select>
  </div>
</template>

<script>
  export default {
    name: 'lane-property-write-template',
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