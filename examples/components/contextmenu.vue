<template>
  <ul class="contextmenu" :style="{top: top, left: left}">
    <li class="command">{{top}}|||{{left}}</li>
    <li class="command">aaa</li>
    <li class="command">aaa</li>
    <li class="command">aaa</li>
    <li class="command">aaa</li>
    <li class="command">aaa</li>
  </ul>
</template>

<script>
  export default {
    name: 'contextmenu',
    data () {
      return {

      }
    },
    props: {
      commands: Array,
      top: String,
      left: String,
    },
    methods: {

    }
  }
</script>

<style lang="scss" scoped>

  .contextmenu{
    margin: 0;
    padding: 0;
    min-width: 80px;
    background: white;
    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
    color: #000;
    font-size: 12px;
    z-index: 999;
    list-style: none;
    position: absolute;
    /*display: none;*/
  }
  .contextmenu .disable{
    color: rgba(0,0,0,0.25);
  }
  .contextmenu .command{
    white-space: nowrap;
    width: 100%;
    height: 24px;
    line-height: 20px;
    padding: 2px 8px;
    cursor: pointer;
    &:not(:last-child){
      border-bottom: 1px #f3f3f3 solid;
    }
  }
  .contextmenu .command:hover{
    cursor: pointer;
    background: #E6F7FF;
  }
  .contextmenu .command.disable:hover{
    cursor: default;
    background: none;
  }
  .contextmenu span:nth-of-type(1){
    float: left;
  }
  .contextmenu span:nth-of-type(2){
    float: right;
  }

</style>
