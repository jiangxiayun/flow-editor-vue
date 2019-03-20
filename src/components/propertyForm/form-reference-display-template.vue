<template>
  <div>
    <span v-if="property.value && property.value.id">{{property.value.name}}</span>
    <span v-if="!property.value || !property.value.id">{{$t('PROPERTY.FORMREFERENCE.EMPTY')}}</span>
  </div>
</template>

<script>
  export default {
    name: 'form-reference-display-template',
    data () {
      return {
        form: {}
      }
    },
    props: {
      property: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    mounted () {
      if (this.property && this.property.value && this.property.value.id) {
        // console.log('$http===========')
        // $http.get(FLOWABLE.APP_URL.getModelUrl(this.property.value.id))
        //   .success(
        //     function(response) {
        //       this.form = {
        //         id: response.id,
        //         name: response.name
        //       };
        //     });
      }
    }
  }
</script>

<style scoped>

</style>