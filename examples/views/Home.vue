<template>
  <div class="full-height">
    <div class="navbar navbar-fixed-top navbar-inverse" role="navigation" id="main-header">
      <router-link to="/list">流程图列表</router-link> =============
      <router-link to="/design/kpm/1">KPM-流程图</router-link>  =============
      <router-link to="/design/bpm/1">BPM-流程图</router-link>
    </div>

    <router-view></router-view>
  </div>

</template>

<script>

  export default {
    name: 'example',
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
