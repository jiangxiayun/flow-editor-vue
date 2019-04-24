<template>
  <!--普通文本编辑-->
  <div>
    <input type="text" v-model="property.value"
           class="form-control"
           v-focus
           select-text="property.value"
           @blur="inputBlurred"
           @keyup.enter.native="enterPressed"/>
  </div>
</template>

<script>
  export default {
    name: 'string-property-write-mode-template',
    data () {
      return {
        valueFlushed: false
      }
    },
    props: {
      selectedShape: {
        type: Object,
        default: function () {
          return {}
        }
      },
      property: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    mounted () {
      this.shapeId = this.selectedShape.id;
    },
    methods: {
      enterPressed (keyEvent) {
        keyEvent.preventDefault();
        this.inputBlurred();
        // we want to do the same as if the user would blur the input field
      },
      /** Handler called when input field is blurred */
      inputBlurred () {
        this.valueFlushed = true;
        if (this.property.value) {
          this.property.value = this.property.value.replace(/(<([^>]+)>)/ig,"");
        }
        this.$emit('updateProperty', {property: this.property})
      }
    },
    beforeDestroy () {
      if(!this.valueFlushed) {
        if (this.property.value) {
          this.property.value = this.property.value.replace(/(<([^>]+)>)/ig,"");
        }
        // this.updatePropertyInModel(this.property, this.shapeId);
        this.$emit('updateProperty', {property: this.property, shapeId: this.shapeId})
      }
    }
  }
</script>

<style scoped>

</style>