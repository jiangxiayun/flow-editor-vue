
const FLOW_eventBus = {
  /** A mapping for storing the listeners*/
  listeners: {},
  // editor: null,
  /**
   * Add an event listener to the event bus, listening to the event with the provided type.
   * Type and callback are mandatory parameters.
   *
   * Provide scope parameter if it is important that the callback is executed
   * within a specific scope.
   */
  addListener: function (type, callback, scope) {
    // Add to the listeners map
    if (typeof this.listeners[type] !== 'undefined') {
      this.listeners[type].push({ scope: scope, callback: callback })
    } else {
      this.listeners[type] = [
        { scope: scope, callback: callback }
      ]
    }
  },
  /**
   * Removes the provided event listener.
   */
  removeListener: function (type, callback, scope) {
    if (typeof this.listeners[type] !== 'undefined') {
      const numOfCallbacks = this.listeners[type].length
      let newArray = []
      for (let i = 0; i < numOfCallbacks; i++) {
        let listener = this.listeners[type][i]
        if (listener.scope === scope && listener.callback === callback) {
          // Do nothing, this is the listener and doesn't need to survive
        } else {
          newArray.push(listener)
        }
      }
      this.listeners[type] = newArray
    }
  },
  hasListener: function (type, callback, scope) {
    if (typeof this.listeners[type] !== 'undefined') {
      const numOfCallbacks = this.listeners[type].length
      if (callback === undefined && scope === undefined) {
        return numOfCallbacks > 0
      }
      for (let i = 0; i < numOfCallbacks; i++) {
        const listener = this.listeners[type][i]
        if (listener.scope === scope && listener.callback === callback) {
          return true
        }
      }
    }
    return false
  },

  /**
   * Dispatch an event to all event listeners registered to that specific type.
   */
  dispatch: function (type, event) {
    if (typeof this.listeners[type] !== 'undefined') {
      const numOfCallbacks = this.listeners[type].length
      for (let i = 0; i < numOfCallbacks; i++) {
        let listener = this.listeners[type][i]
        if (listener && listener.callback) {
          listener.callback.apply(listener.scope, [event])
        }
      }
    }
  },
  // dispatchOryxEvent: function (event, uiObject) {
  //   this.editor.handleEvents(event, uiObject)
  // }
}


export default FLOW_eventBus

