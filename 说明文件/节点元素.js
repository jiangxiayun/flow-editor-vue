// flowable数据库中对画图的配置数据  stencil-sets
let stencilSets = {
  "title": "Process editor",
  "namespace": "http://b3mn.org/stencilset/bpmn2.0#",
  "description": "BPMN process editor",
  // 属性
  propertyPackages: [
    {
      "name": "process_idpackage",
      "properties": [
        {
          "id": "process_id",
          "type": "String",
          "title": "Process identifier",
          "value": "process",
          "description": "Unique identifier of the process definition.",
          "popular": true
        },
      ]
    },
    {
      "name": "datapropertiespackage",
      "properties": [
        {
          "id": "dataproperties",
          "type": "Complex",
          "title": "Data Objects",
          "value": "",
          "description": "Definition of the data object properties",
          "popular": true
        }
      ]
    }
  ],
  // 节点
  stencils: [
    {
      "type": "node",
      "id": "UserTask",
      "title": "User task",
      "description": "A manual task assigned to a specific person",
      "view": svg xml图形,
      "icon": "activity/list/type.user.png",
      "groups": [
        "Activities"
      ],
      "propertyPackages": [
        "overrideidpackage",
        "namepackage",
        "documentationpackage",
        "asynchronousdefinitionpackage",
        "exclusivedefinitionpackage",
        "executionlistenerspackage",
        "multiinstance_typepackage",
        "multiinstance_cardinalitypackage",
        "multiinstance_collectionpackage",
        "multiinstance_variablepackage",
        "multiinstance_conditionpackage",
        "isforcompensationpackage",
        "usertaskassignmentpackage",
        "formkeydefinitionpackage",
        "formreferencepackage",
        "duedatedefinitionpackage",
        "prioritydefinitionpackage",
        "formpropertiespackage",
        "tasklistenerspackage",
        "skipexpressionpackage",
        "categorypackage"
      ],
      "hiddenPropertyPackages": [],
      "roles": [
        "Activity",
        "sequence_start",
        "sequence_end",
        "ActivitiesMorph",
        "all"
      ]
    }
  ],
  // 规则
  rules: {
    "cardinalityRules": [
      {
        "role": "Startevents_all",
        "incomingEdges": [
          {
            "role": "SequenceFlow",
            "maximum": 0
          }
        ]
      },
      {
        "role": "Endevents_all",
        "outgoingEdges": [
          {
            "role": "SequenceFlow",
            "maximum": 0
          }
        ]
      }
    ],
    "connectionRules": [
      {
        "role": "SequenceFlow",
        "connects": [
          {
            "from": "sequence_start",
            "to": [
              "sequence_end"
            ]
          }
        ]
      },
      {
        "role": "Association",
        "connects": [
          {
            "from": "sequence_start",
            "to": [
              "TextAnnotation"
            ]
          },
          {
            "from": "sequence_end",
            "to": [
              "TextAnnotation"
            ]
          },
          {
            "from": "TextAnnotation",
            "to": [
              "sequence_end"
            ]
          },
          {
            "from": "BoundaryCompensationEvent",
            "to": [
              "sequence_end"
            ]
          },
          {
            "from": "TextAnnotation",
            "to": [
              "sequence_start"
            ]
          },
          {
            "from": "BoundaryCompensationEvent",
            "to": [
              "sequence_start"
            ]
          }
        ]
      },
      {
        "role": "DataAssociation",
        "connects": [
          {
            "from": "sequence_start",
            "to": [
              "DataStore"
            ]
          },
          {
            "from": "sequence_end",
            "to": [
              "DataStore"
            ]
          },
          {
            "from": "DataStore",
            "to": [
              "sequence_end"
            ]
          },
          {
            "from": "DataStore",
            "to": [
              "sequence_start"
            ]
          }
        ]
      },
      {
        "role": "IntermediateEventOnActivityBoundary",
        "connects": [
          {
            "from": "Activity",
            "to": [
              "IntermediateEventOnActivityBoundary"
            ]
          }
        ]
      }
    ],
    // 包含
    "containmentRules": [
      {
        "role": "BPMNDiagram",
        "contains": [
          "all"
        ]
      },
      {
        "role": "SubProcess",
        "contains": [
          "sequence_start",
          "sequence_end",
          "from_task_event",
          "to_task_event",
          "EventSubProcess",
          "TextAnnotation",
          "DataStore"
        ]
      },
      {
        "role": "AdhocSubProcess",
        "contains": [
          "sequence_start",
          "sequence_end",
          "from_task_event",
          "to_task_event",
          "TextAnnotation",
          "DataStore"
        ]
      },
      {
        "role": "EventSubProcess",
        "contains": [
          "sequence_start",
          "sequence_end",
          "from_task_event",
          "to_task_event",
          "TextAnnotation",
          "DataStore"
        ]
      },
      {
        "role": "Pool",
        "contains": [
          "Lane"
        ]
      },
      {
        "role": "Lane",
        "contains": [
          "sequence_start",
          "sequence_end",
          "EventSubProcess",
          "TextAnnotation",
          "DataStore"
        ]
      }
    ],
    "morphingRules": [
      {
        "role": "ActivitiesMorph",
        "baseMorphs": [
          "UserTask"
        ],
        "preserveBounds": true
      },
      {
        "role": "GatewaysMorph",
        "baseMorphs": [
          "ExclusiveGateway"
        ]
      },
      {
        "role": "StartEventsMorph",
        "baseMorphs": [
          "StartNoneEvent"
        ]
      },
      {
        "role": "EndEventsMorph",
        "baseMorphs": [
          "StartNoneEvent"
        ]
      },
      {
        "role": "CatchEventsMorph",
        "baseMorphs": [
          "CatchTimerEvent"
        ]
      },
      {
        "role": "ThrowEventsMorph",
        "baseMorphs": [
          "ThrowNoneEvent"
        ]
      },
      {
        "role": "BoundaryEventsMorph",
        "baseMorphs": [
          "ThrowNoneEvent"
        ]
      },
      {
        "role": "BoundaryCompensationEvent",
        "baseMorphs": [
          "BoundaryCompensationEvent"
        ]
      },
      {
        "role": "TextAnnotation",
        "baseMorphs": [
          "TextAnnotation"
        ]
      },
      {
        "role": "DataStore",
        "baseMorphs": [
          "DataStore"
        ]
      }
    ]
  }

}


// 页面渲染数据：
let stencilItemGroups = [
  {
    groups: [],
    items: [
      {
        canConnect: true,
        canConnectAssociation: false,
        canConnectTo: false, // 能否被连接
        customIcon: false,
        description: "A start event without a specific trigger",
        icon: "startevent/none.png",
        id: "StartNoneEvent",
        morphRole: "StartEventsMorph",
        name: "Start event",
        removed: false,
        roles: ["sequence_start", "Startevents_all", "StartEventsMorph", "all"],
        type: "node"
      }
    ],
    paletteItems: [], // 同items，2者数据相同
    name: 'Start Events',
    visible: true,
  }
]