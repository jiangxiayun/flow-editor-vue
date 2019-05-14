// 跨级组件事件交互

function broadcast (componentName, eventName, params) {
  this.$children.forEach(child => {
    var name = child.$options.componentName

    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params))
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]))
    }
  })
}

export default {
  methods: {
    dispatch (componentName, eventName, params) {
      console.log(11122)
      let parent = this.$parent || this.$root
      let name = parent.$options.componentName || parent.$options._componentTag
      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent

        if (parent) {
          name = parent.$options.componentName || parent.$options._componentTag
        }
      }
      if (parent) {
        parent.$emit.apply(parent, ['Propagation', eventName].concat(params))
      }
    },
    broadcast (componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params)
    }
  }
}
