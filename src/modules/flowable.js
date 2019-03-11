
const Flowable = {
  namespaced: true,
  state: {
    paletteWrapperOpen: true,
    // modelData: {},
    stencilItemGroups: [],
    quickMenuItems: [],
    dragModeOver: false,
    dragCanContain: false,
    quickMenu: undefined
  },
  mutations: {
    UPDATE_paletteWrapperOpen (state, data) {
      state.paletteWrapperOpen = data
    },
    UPDATE_dragModeOver (state, data) {
      state.dragModeOver = data
    },
    UPDATE_dragCanContain (state, data) {
      state.dragCanContain = data
    },
    UPDATE_quickMenu (state, data) {
      state.quickMenu = data
    },
    UPDATE_stencilItemGroups (state, data) {
      state.stencilItemGroups = data
    },
    UPDATE_modelData (state, data) {
      state.modelData = data
    },
    UPDATE_quickMenuItems (state, data) {
      state.quickMenuItems = data
    }
  },
  actions: {

  }
}
export default Flowable
