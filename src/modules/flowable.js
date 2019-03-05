
const Flowable = {
  namespaced: true,
  state: {
    editorManager: null,
    editor: null,
    modelData: {
      description: '1',
      key: '1',
      lastUpdated: '2019-02-26T01:40:30.975+0000',
      lastUpdatedBy: 'admin',
      model: {
        childShapes: [
          {
            bounds: {
              lowerRight: {x: 130, y: 193},
              upperLeft: {x: 100, y: 163}
            },
            childShapes: [],
            dockers: [],
            outgoing: [],
            resourceId: 'startEvent1',
            stencil: {id: 'StartNoneEvent'}
          }
        ],
        id: 'canvas',
        modelType: 'model',
        properties: {
          documentation: '1',
          name: '1',
          process_id: '1'
        },
        resourceId: 'canvas',
        stencilset: {
          namespace: 'http://b3mn.org/stencilset/bpmn2.0#'
        }
      },
      modelId: "80646b68-3967-11e9-bbaa-82ad27eff10d",
      name: '1'
    },
    stencilItemGroups: [],
    quickMenuItems: [],
    dragModeOver: false,
    dragCanContain: false,
    dragCurrentParent: undefined,
    dragCurrentParentId: undefined,
    dragCurrentParentStencil: undefined,
    quickMenu: undefined,
    dropTargetElement: undefined,
  },
  mutations: {
    UPDATE_dragModeOver (state, data) {
      state.dragModeOver = data
    },
    UPDATE_dragCanContain (state, data) {
      state.dragCanContain = data
    },
    UPDATE_dragCurrentParent (state, data) {
      state.dragCurrentParent = data
    },
    UPDATE_dragCurrentParentId (state, data) {
      state.dragCurrentParentId = data
    },
    UPDATE_dragCurrentParentStencil (state, data) {
      state.dragCurrentParentStencil = data
    },
    UPDATE_quickMenu (state, data) {
      state.quickMenu = data
    },
    UPDATE_dropTargetElement (state, data) {
      state.dropTargetElement = data
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
