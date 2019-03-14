<template>
  <input type="checkbox" v-model="property.value" @change="changeValue" @click.stop />
</template>

<script>
  export default {
    name: 'boolean-property-template',
    props: {
      property: {
        type: Object,
        default: function () {
          return {}
        }
      },
      selectedShape: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    methods: {
      changeValue () {
        if (this.property.key === 'oryx-defaultflow' && this.property.value) {
          const selectedShape = this.selectedShape
          if (selectedShape) {
            const incomingNodes = selectedShape.getIncomingShapes()
            if (incomingNodes && incomingNodes.length > 0) {
              // get first node, since there can be only one for a sequence flow
              let rootNode = incomingNodes[0]
              let flows = rootNode.getOutgoingShapes()
              if (flows && flows.length > 1) {
                // in case there are more flows, check if another flow is already defined as default
                for (let i = 0; i < flows.length; i++) {
                  if (flows[i].resourceId != selectedShape.resourceId) {
                    let defaultFlowProp = flows[i].properties.get('oryx-defaultflow')
                    if (defaultFlowProp) {
                      flows[i].setProperty('oryx-defaultflow', false, true)
                    }
                  }
                }
              }
            }
          }
        }
        this.$emit('updateProperty', {property: this.property})
      }
    }
  }
</script>

<style scoped>

</style>