<template>
  <div class="full-height">
    <div class="navbar navbar-fixed-top navbar-inverse" role="navigation" id="main-header">
      <router-link to="/list">流程图列表</router-link>
    </div>

    <router-view></router-view>
  </div>

</template>

<script>

  export default {
    name: 'App',
    data () {
      return {}
    },
    created () {},
    computed: {},
    mounted () {

    },
    methods: {

    }
  }
</script>
<style lang="scss">

</style>
