
const Flowable = {
  namespaced: true,
  state: {
    editorManager: null,
    editor: null,
    paletteWrapperOpen: true,
    modelData: {
      "modelId": "6609363a-3be5-11e9-afe0-82ad27eff10d",
      "name": "请假模型",
      "key": "leave-model",
      "description": "请假模型",
      "lastUpdated": "2019-03-04T02:15:00.384+0000",
      "lastUpdatedBy": "admin",
      "model": {
        "modelId": "6609363a-3be5-11e9-afe0-82ad27eff10d",
        "bounds": {
          "lowerRight": {
            "x": 1200,
            "y": 1050
          },
          "upperLeft": {
            "x": 0,
            "y": 0
          }
        },
        "properties": {
          "process_id": "leave-model",
          "name": "请假模型",
          "documentation": "请假模型",
          "process_author": "",
          "process_version": "",
          "process_namespace": "http://www.flowable.org/processdef",
          "process_historylevel": "",
          "isexecutable": true,
          "dataproperties": "",
          "executionlisteners": "",
          "eventlisteners": "",
          "signaldefinitions": "",
          "messagedefinitions": "",
          "process_potentialstarteruser": "",
          "process_potentialstartergroup": "",
          "iseagerexecutionfetch": "false"
        },
        "childShapes": [
          {
            "resourceId": "startEvent1",
            "properties": {
              "overrideid": "",
              "name": "开始",
              "documentation": "",
              "executionlisteners": "",
              "initiator": "",
              "formkeydefinition": "",
              "formreference": "",
              "formproperties": ""
            },
            "stencil": {
              "id": "StartNoneEvent"
            },
            "childShapes": [

            ],
            "outgoing": [
              {
                "resourceId": "sid-2DA089CE-2D36-4C1F-9889-0DBA4A1D4C34"
              }
            ],
            "bounds": {
              "lowerRight": {
                "x": 130,
                "y": 193
              },
              "upperLeft": {
                "x": 100,
                "y": 163
              }
            },
            "dockers": [

            ]
          },
          {
            "resourceId": "sid-F2289A33-D579-452D-86F8-AE5F37D39C5C",
            "properties": {
              "overrideid": "",
              "name": "用户填写请假单",
              "documentation": "",
              "asynchronousdefinition": "false",
              "exclusivedefinition": "false",
              "executionlisteners": "",
              "multiinstance_type": "None",
              "multiinstance_cardinality": "",
              "multiinstance_collection": "",
              "multiinstance_variable": "",
              "multiinstance_condition": "",
              "isforcompensation": "false",
              "usertaskassignment": {
                "assignment": {
                  "type": "idm",
                  "idm": {
                    "type": "initiator"
                  }
                }
              },
              "formkeydefinition": "",
              "formreference": {
                "id": "638e122b-3be7-11e9-afe0-82ad27eff10d",
                "name": "填写请假单",
                "key": "leave-input-from"
              },
              "duedatedefinition": "",
              "prioritydefinition": "",
              "formproperties": "",
              "tasklisteners": "",
              "skipexpression": "",
              "categorydefinition": ""
            },
            "stencil": {
              "id": "UserTask"
            },
            "childShapes": [

            ],
            "outgoing": [
              {
                "resourceId": "sid-FF15BFB7-7C71-4C9D-9CBC-15E28C3EC563"
              }
            ],
            "bounds": {
              "lowerRight": {
                "x": 275,
                "y": 218
              },
              "upperLeft": {
                "x": 175,
                "y": 138
              }
            },
            "dockers": [

            ]
          },
          {
            "resourceId": "sid-2DA089CE-2D36-4C1F-9889-0DBA4A1D4C34",
            "properties": {
              "overrideid": "",
              "name": "",
              "documentation": "",
              "conditionsequenceflow": "",
              "executionlisteners": "",
              "defaultflow": "false",
              "skipexpression": ""
            },
            "stencil": {
              "id": "SequenceFlow"
            },
            "childShapes": [

            ],
            "outgoing": [
              {
                "resourceId": "sid-F2289A33-D579-452D-86F8-AE5F37D39C5C"
              }
            ],
            "bounds": {
              "lowerRight": {
                "x": 174.15625,
                "y": 178
              },
              "upperLeft": {
                "x": 130.609375,
                "y": 178
              }
            },
            "dockers": [
              {
                "x": 15,
                "y": 15
              },
              {
                "x": 50,
                "y": 40
              }
            ],
            "target": {
              "resourceId": "sid-F2289A33-D579-452D-86F8-AE5F37D39C5C"
            }
          },
          {
            "resourceId": "sid-3B2BA28A-F373-4DAD-B916-FBD2C1ED714E",
            "properties": {
              "overrideid": "",
              "name": "部门领导审批",
              "documentation": "",
              "asynchronousdefinition": "false",
              "exclusivedefinition": "false",
              "executionlisteners": "",
              "multiinstance_type": "None",
              "multiinstance_cardinality": "",
              "multiinstance_collection": "",
              "multiinstance_variable": "",
              "multiinstance_condition": "",
              "isforcompensation": "false",
              "usertaskassignment": "",
              "formkeydefinition": "",
              "formreference": "",
              "duedatedefinition": "",
              "prioritydefinition": "",
              "formproperties": "",
              "tasklisteners": "",
              "skipexpression": "",
              "categorydefinition": ""
            },
            "stencil": {
              "id": "UserTask"
            },
            "childShapes": [

            ],
            "outgoing": [
              {
                "resourceId": "sid-0D4A7B4D-3C1D-4D1A-B7FC-A42B84C60CBE"
              }
            ],
            "bounds": {
              "lowerRight": {
                "x": 445,
                "y": 218
              },
              "upperLeft": {
                "x": 345,
                "y": 138
              }
            },
            "dockers": [

            ]
          },
          {
            "resourceId": "sid-FF15BFB7-7C71-4C9D-9CBC-15E28C3EC563",
            "properties": {
              "overrideid": "",
              "name": "",
              "documentation": "",
              "conditionsequenceflow": "",
              "executionlisteners": "",
              "defaultflow": "false",
              "skipexpression": ""
            },
            "stencil": {
              "id": "SequenceFlow"
            },
            "childShapes": [

            ],
            "outgoing": [
              {
                "resourceId": "sid-3B2BA28A-F373-4DAD-B916-FBD2C1ED714E"
              }
            ],
            "bounds": {
              "lowerRight": {
                "x": 344.859375,
                "y": 178
              },
              "upperLeft": {
                "x": 275.140625,
                "y": 178
              }
            },
            "dockers": [
              {
                "x": 50,
                "y": 40
              },
              {
                "x": 50,
                "y": 40
              }
            ],
            "target": {
              "resourceId": "sid-3B2BA28A-F373-4DAD-B916-FBD2C1ED714E"
            }
          },
          {
            "resourceId": "sid-6716D349-84DB-4CE5-90E9-B9FABE573BE7",
            "properties": {
              "overrideid": "",
              "name": "结束",
              "documentation": "",
              "executionlisteners": ""
            },
            "stencil": {
              "id": "EndNoneEvent"
            },
            "childShapes": [

            ],
            "outgoing": [

            ],
            "bounds": {
              "lowerRight": {
                "x": 518,
                "y": 192
              },
              "upperLeft": {
                "x": 490,
                "y": 164
              }
            },
            "dockers": [

            ]
          },
          {
            "resourceId": "sid-0D4A7B4D-3C1D-4D1A-B7FC-A42B84C60CBE",
            "properties": {
              "overrideid": "",
              "name": "",
              "documentation": "",
              "conditionsequenceflow": "",
              "executionlisteners": "",
              "defaultflow": "false",
              "skipexpression": ""
            },
            "stencil": {
              "id": "SequenceFlow"
            },
            "childShapes": [

            ],
            "outgoing": [
              {
                "resourceId": "sid-6716D349-84DB-4CE5-90E9-B9FABE573BE7"
              }
            ],
            "bounds": {
              "lowerRight": {
                "x": 489.375,
                "y": 178
              },
              "upperLeft": {
                "x": 445.390625,
                "y": 178
              }
            },
            "dockers": [
              {
                "x": 50,
                "y": 40
              },
              {
                "x": 14,
                "y": 14
              }
            ],
            "target": {
              "resourceId": "sid-6716D349-84DB-4CE5-90E9-B9FABE573BE7"
            }
          }
        ],
        "stencil": {
          "id": "BPMNDiagram"
        },
        "stencilset": {
          "namespace": "http://b3mn.org/stencilset/bpmn2.0#",
          "url": "../editor/stencilsets/bpmn2.0/bpmn2.0.json"
        },
        "modelType": "model"
      }
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
    UPDATE_paletteWrapperOpen (state, data) {
      state.paletteWrapperOpen = data
    },
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
