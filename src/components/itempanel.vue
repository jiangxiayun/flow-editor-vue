<template>
  <div class="itempanel">
    <img draggable="false" src="https://gw.alipayobjects.com/zos/rmsportal/ZnPxbVjKYADMYxkTQXRi.svg"
         data-type="node" data-shape="flow-circle"
         data-size="72*72" data-color="#FA8C16" data-label="起止节点" class="getItem" />
    <img draggable="false" src="https://gw.alipayobjects.com/zos/rmsportal/wHcJakkCXDrUUlNkNzSy.svg"
         data-type="node" data-shape="flow-rect"
         data-size="80*48" data-color="#1890FF" data-label="常规节点" class="getItem" />
    <img draggable="false" src="https://gw.alipayobjects.com/zos/rmsportal/SnWIktArriZRWdGCnGfK.svg"
         data-type="node" data-shape="flow-rhombus"
         data-size="80*72" data-color="#13C2C2" data-label="分叉节点" class="getItem" />
    <img draggable="false" src="https://gw.alipayobjects.com/zos/rmsportal/rQMUhHHSqwYsPwjXxcfP.svg"
         data-type="node" data-shape="flow-capsule"
         data-size="80*48" data-color="#722ED1" data-label="模型节点" class="getItem" />
    <div class="getItem" data-type="node" data-shape="circle">圆形</div>

    <div class="getItem" data-type="node" data-shape="custom">自定义节点</div>
    <div class="getItem" data-type="node" data-shape="node-box">node-box</div>
    <div class="getItem" data-type="node" data-shape="customNode">customNode</div>
  </div>
</template>

<script>
export default {
  name: 'Itempanel'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
