export const AA = {
  'title': 'Process editor',
  'namespace': 'http://b3mn.org/stencilset/bpmn2.0#',
  'description': 'BPMN process editor',
  'propertyPackages': [
    {
      'name': 'rolemappackage',
      'properties': [
        {
          'id': 'roleMap',
          'type': 'Object',
          'title': '业务角色',
          'value': '',
          'description': '业务角色',
          'popular': true,
          'directlyEditable': false
        }
      ]
    },
    {
      'name': 'refTaskpackage',
      'properties': [{
        'id': 'refId',
        'type': 'String',
        'title': '引用',
        'value': '',
        'description': '引用活动的id',
        'popular': true
      }]
    },
    {
      'name': 'numberepackage',
      'properties': [
        {
          'id': 'nmb',
          'type': 'String',
          'title': '序号',
          'value': '',
          'description': '活动序号',
          'popular': true,
          'refToView': 'text_number'
        }
      ]
    },
    {
      'name': 'codepackage',
      'properties': [
        {
          'id': 'code',
          'type': 'String',
          'title': '活动编码',
          'value': '',
          'description': '活动编码',
          'popular': true
        }
      ]
    },
    {
      'name': 'namepackage',
      'properties': [
        {
          'id': 'name',
          'type': 'String',
          'title': 'Name',
          'value': '',
          'description': '活动名称',
          'popular': true,
          'refToView': 'text_name'
        }
      ]
    },
    {
      'name': 'typepackage',
      'properties': [
        {
          'id': 'type',
          'type': 'Select',
          'title': '活动类型',
          'value': '',
          'description': '活动类型',
          'popular': true
        }
      ]
    },
    {
      'name': 'organizationpackage',
      'properties': [
        {
          'id': 'organization',
          'type': 'Complex',
          'title': '所属组织',
          'value': '',
          'description': '所属组织',
          'popular': true
        }
      ]
    },
    {
      'name': 'roleIdpackage',
      'properties': [
        {
          'id': 'roleId',
          'type': 'Complex',
          'title': '业务角色',
          'value': '',
          'description': '业务角色',
          'popular': true
        }
      ]
    },
    {
      'name': 'datespackage',
      'properties': [
        {
          'id': 'dates',
          'type': 'StringComplex',
          'title': '时间',
          'value': '',
          'description': '时间(天)',
          'popular': true,
          'refToView': 'text_dates'
        }
      ]
    },
    {
      'name': 'authorpackage',
      'properties': [
        {
          'id': 'author',
          'type': 'Complex',
          'title': '作者',
          'value': '',
          'description': '作者',
          'popular': true
        }
      ]
    },
    {
      'name': 'canSystempackage',
      'properties': [
        {
          'id': 'canSystem',
          'type': 'Boolean',
          'title': '能否系统化',
          'value': '',
          'description': '能否系统化',
          'popular': true
        }
      ]
    },
    {
      'name': 'providerSystempackage',
      'properties': [
        {
          'id': 'providerSystem',
          'type': 'Complex',
          'title': '落地系统',
          'value': '',
          'description': '落地系统',
          'popular': true
        }
      ]
    },
    {
      'name': 'kcpFlagpackage',
      'properties': [
        {
          'id': 'kcpFlag',
          'type': 'Boolean',
          'title': '是否KCP',
          'value': '',
          'description': '是否KCP',
          'popular': true
        }
      ]
    },
    {
      'name': 'descriptionpackage',
      'properties': [
        {
          'id': 'description',
          'type': 'Text',
          'title': '描述',
          'value': '',
          'description': '描述',
          'popular': true
        }
      ]
    },
    {
      'name': 'inputpackage',
      'properties': [{
        'id': 'input',
        'type': 'Text',
        'title': '输入',
        'value': '',
        'description': '活动输入内容',
        'popular': true
      }]
    },
    {
    'name': 'outputpackage',
    'properties': [{
      'id': 'output',
      'type': 'Text',
      'title': '输出',
      'value': '',
      'description': '活动输出内容',
      'popular': true
    }]
  },
    {
    'name': 'standardpackage',
    'properties': [{
      'id': 'standard',
      'type': 'List',
      'title': '制度规范',
      'value': '',
      'description': '制度规范',
      'popular': true
    }]
  },
    {
    'name': 'attachmentpackage',
    'properties': [{
      'id': 'attachment',
      'type': 'List',
      'title': '附件',
      'value': '',
      'description': '附件',
      'popular': true
    }]
  },
    {
    'name': 'kpipackage',
    'properties': [{
      'id': 'kpi',
      'type': 'List',
      'title': '流程指标',
      'value': '',
      'description': '流程指标',
      'popular': true
    }
    ]
  },
    {
      'name': 'kcppackage',
      'properties': [
        {
          'id': 'kcp',
          'type': 'Text',
          'title': '风控点',
          'value': '',
          'description': '风控点',
          'popular': true
        }
      ]
    },
    {
      'name': 'importancepackage',
      'properties': [
        {
          'id': 'importance',
          'type': 'Select',
          'title': '重要度',
          'value': '',
          'description': '重要度',
          'popular': true
        }
      ]
    },
    {
      'name': 'maturitypackage',
      'properties': [
        {
          'id': 'maturity',
          'type': 'Select',
          'title': '成熟度',
          'value': '',
          'description': '成熟度',
          'popular': true
        }
      ]
    },
    {
      'name': 'riskpackage',
      'properties': [
        {
          'id': 'risk',
          'type': 'Select',
          'title': '风险度',
          'value': '',
          'description': '风险度',
          'popular': true
        }
      ]
    },
    {
      'name': 'performancepackage',
      'properties': [
        {
          'id': 'performance',
          'type': 'Select',
          'title': '绩效水平',
          'value': 'true',
          'description': '绩效水平',
          'popular': true
        }
      ]
    },
    {
      'name': 'recommendpackage',
      'properties': [
        {
          'id': 'recommend',
          'type': 'Text',
          'title': '改进计划',
          'value': '',
          'description': '改进计划',
          'popular': true
        }
      ]
    },
    {
      "name": "defaultflowpackage",
      "properties": [
        {
          "id": "defaultflow",
          "type": "Boolean",
          "title": "Default flow",
          "value": "false",
          "description": "Define the sequence flow as default",
          "popular": true,
          "refToView": "default"
        }
      ]
    }
  ],
  'stencils': [
    {
      'type': 'node',
      'id': 'StartNoneEvent',
      'title': '开始',
      'description': 'A start event without a specific trigger',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<svg\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:oryx="http://www.b3mn.org/oryx"\n   width="40"\n   height="40"\n   version="1.0">\n  <defs></defs>\n  <oryx:magnets>\n  \t<oryx:magnet oryx:cx="16" oryx:cy="16" oryx:default="yes" />\n  </oryx:magnets>\n  <g pointer-events="fill">\n    <circle id="bg_frame" cx="16" cy="16" r="15" stroke="#585858" fill="#ffffff" stroke-width="1"/>\n\t<text font-size="11" \n\t\tid="text_name" \n\t\tx="16" y="33" \n\t\toryx:align="top center" \n\t\tstroke="#373e48"\n\t></text>\n  </g>\n</svg>',
      'icon': 'startevent/none.png',
      'groups': [
        '基础元素'
      ],
      'propertyPackages': [
        'numberepackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'sequence_start',
        'Startevents_all',
        'StartEventsMorph',
        'all'
      ]
    },
    {
      'type': 'node',
      'id': 'UserTask',
      'title': '活动节点',
      'description': '扩展活动节点',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:oryx="http://www.b3mn.org/oryx" xmlns:xlink="http://www.w3.org/1999/xlink" width="114" height="74" version="1.0"><defs></defs><oryx:magnets><oryx:magnet oryx:cx="56" oryx:cy="1" oryx:anchors="top"/><oryx:magnet oryx:cx="111" oryx:cy="36" oryx:anchors="right"/><oryx:magnet oryx:cx="56" oryx:cy="71" oryx:anchors="bottom"/><oryx:magnet oryx:cx="1" oryx:cy="36" oryx:anchors="left"/><oryx:magnet oryx:cx="56" oryx:cy="36" oryx:default="yes"/></oryx:magnets><g pointer-events="fill" oryx:minimumSize="50 40"><rect id="text_frame" oryx:anchors="bottom top right left" x="1" y="1" width="111" height="71" rx="10" ry="10" stroke="none" stroke-width="0" fill="none"/><rect id="bg_frame" oryx:resize="vertical horizontal" x="0" y="0" width="112" height="72" rx="10" ry="10" stroke="#666666" stroke-width="1" fill="#ffffff"/><line id="number_path" oryx:resize="vertical horizontal" fill="none" stroke="#666666" x1="0" y1="23" x2="112" y2="23" stroke-width="1"/><text font-size="12" id="text_number" x="56" y="6" oryx:align="top center" stroke="#333333" oryx:fittoelem="text_frame">22</text><text font-size="12" id="text_name" x="56" y="36" oryx:align="middle center" oryx:fittoelem="text_frame" stroke="#333333">dd</text><line oryx:resize="vertical horizontal" fill="none" stroke="#666666" x1="0" y1="47" x2="112" y2="47" stroke-width="1"/><text font-size="12" id="text_dates" x="10" y="63" oryx:align="bottom left" oryx:fittoelem="text_frame" fill="#999999"></text><text font-size="12" id="text_system" x="102" y="63" oryx:align="bottom right" oryx:fittoelem="text_frame" fill="#999999"></text><g id="shenpi_sign" display="none"><circle id="shen_frame" cx="96" cy="11" r="10" stroke="#E70012" fill="#FFE9E9" fill-opacity="0.5" stroke-width="1"/><text font-size="12" x="96" y="15" oryx:align="center center" oryx:fittoelem="shen_frame" fill="#E70012">审</text></g></g></svg>\n',
      'icon': 'activity/list/type.user.png',
      'groups': [
        '基础元素'
      ],
      'propertyPackages': [
        'refTaskpackage',
        'numberepackage',
        'codepackage',
        'namepackage',
        'typepackage',
        'organizationpackage',
        'roleIdpackage',
        'datespackage',
        'authorpackage',
        'canSystempackage',
        'providerSystempackage',
        // 'systemNamepackage',
        'kcpFlagpackage',
        'descriptionpackage',
        'inputpackage',
        'outputpackage',
        'standardpackage',
        'attachmentpackage',
        'kpipackage',
        'kcppackage',
        'importancepackage',
        'maturitypackage',
        'riskpackage',
        'performancepackage',
        'recommendpackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'Activity',
        'sequence_start',
        'sequence_end',
        'ActivitiesMorph',
        'all'
      ]
    },
    {
      'type': 'node',
      'id': 'UserTask2',
      'title': '活动节点',
      'description': '活动节点',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:oryx="http://www.b3mn.org/oryx" xmlns:xlink="http://www.w3.org/1999/xlink" width="114" height="74" version="1.0"><defs></defs><oryx:magnets><oryx:magnet oryx:cx="56" oryx:cy="1" oryx:anchors="top"/><oryx:magnet oryx:cx="111" oryx:cy="36" oryx:anchors="right"/><oryx:magnet oryx:cx="56" oryx:cy="71" oryx:anchors="bottom"/><oryx:magnet oryx:cx="1" oryx:cy="36" oryx:anchors="left"/><oryx:magnet oryx:cx="56" oryx:cy="36" oryx:default="yes"/></oryx:magnets><g pointer-events="fill" oryx:minimumSize="50 40"><rect id="text_frame" oryx:anchors="bottom top right left" x="1" y="1" width="111" height="71" rx="10" ry="10" stroke="none" stroke-width="0" fill="none"/><rect id="bg_frame" oryx:resize="vertical horizontal" x="0" y="0" width="112" height="72" rx="10" ry="10" stroke="#E70012" stroke-width="1" stroke-dasharray=\'5\' stroke-opacity="0.2" fill="#FFF8F8"/><line id="number_path" oryx:resize="vertical horizontal" fill="none" stroke="#E70012" stroke-dasharray=\'5\' stroke-opacity="0.2" x1="0" y1="23" x2="112" y2="23" stroke-width="1"/><text font-size="12" id="text_number" x="56" y="6" oryx:align="top center" stroke="#333333" oryx:fittoelem="text_frame">22</text><text font-size="12" id="text_name" x="56" y="36" oryx:align="middle center" oryx:fittoelem="text_frame" stroke="#333333">dd</text><line oryx:resize="vertical horizontal" fill="none" stroke="#E70012" stroke-dasharray=\'5\' stroke-opacity="0.2" x1="0" y1="47" x2="112" y2="47" stroke-width="1"/></g></svg>\n',
      'icon': 'activity/list/type.user.png',
      'groups': [
        '基础元素'
      ],
      'layout': [
        {
          'type': 'layout.task'
        }
      ],
      'propertyPackages': [
        'numberepackage',
        'namepackage',
        'refTaskpackage',
      ],
      'hiddenPropertyPackages': [

      ],
      'roles': [
        'Activity',
        'sequence_start',
        'sequence_end',
        'ActivitiesMorph',
        'all'
      ]
    },

    {
      'type': 'node',
      'id': 'FlowBox',
      'title': '盒子',
      'description': '流程盒子',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:oryx="http://www.b3mn.org/oryx" xmlns:xlink="http://www.w3.org/1999/xlink" width="170" height="132" version="1.0"><defs></defs><oryx:magnets><oryx:magnet oryx:cx="1" oryx:cy="37" oryx:anchors="left"/><oryx:magnet oryx:cx="1" oryx:cy="74" oryx:anchors="left"/><oryx:magnet oryx:cx="1" oryx:cy="111" oryx:anchors="left"/><oryx:magnet oryx:cx="25" oryx:cy="109" oryx:anchors="bottom"/><oryx:magnet oryx:cx="50" oryx:cy="109" oryx:anchors="bottom"/><oryx:magnet oryx:cx="75" oryx:cy="109" oryx:anchors="bottom"/><oryx:magnet oryx:cx="147" oryx:cy="37" oryx:anchors="right"/><oryx:magnet oryx:cx="147" oryx:cy="74" oryx:anchors="right"/><oryx:magnet oryx:cx="147" oryx:cy="111" oryx:anchors="right"/><oryx:magnet oryx:cx="25" oryx:cy="1" oryx:anchors="top"/><oryx:magnet oryx:cx="50" oryx:cy="1" oryx:anchors="top"/><oryx:magnet oryx:cx="75" oryx:cy="1" oryx:anchors="top"/><oryx:magnet oryx:cx="74" oryx:cy="55" oryx:default="yes"/></oryx:magnets><g pointer-events="fill" oryx:minimumSize="50 40"><defs><radialGradient id="background" cx="0%" cy="10%" r="100%" fx="20%" fy="10%"><stop offset="0%" stop-color="red" stop-opacity="1"/><stop id="fill_el" offset="100%" stop-color="#ffffff" stop-opacity="1"/></radialGradient></defs><defs><filter id="f1" x="0" y="0" width="200%" height="200%"><feOffset result="offOut" in="SourceGraphic" dx="20" dy="20"/><feGaussianBlur result="blurOut" in="offOut" stdDeviation="10"/><feBlend in="SourceGraphic" in2="blurOut" mode="normal"/></filter></defs><rect id="bg_frame" oryx:resize="vertical horizontal" x="0" y="0" width="170" height="140" rx="0" ry="0" stroke="none" stroke-width="1" fill="none"/><rect oryx:anchors="vertical horizontal" x="0" y="0" width="140" height="100" stroke="none" stroke-width="0" fill="#C6CFD9" filter="url(#f1)"/><rect id="text_frame" oryx:anchors="bottom top right left" x="1" y="1" width="147" height="109" stroke="none" stroke-width="0" fill="#ffffff"/><line id="status-bar" oryx:resize="vertical horizontal" fill="#90BFF6" stroke="#90BFF6" x1="0" y1="1" x2="148" y2="1" stroke-width="8"/><text font-size="12" id="text_number" x="10" y="26" oryx:align="top left" stroke="#333333" oryx:fittoelem="text_frame">22</text><text font-size="12" id="text_name" x="10" y="58" oryx:align="middle left" oryx:fittoelem="text_frame" stroke="#333333">dd</text><text font-size="12" id="text_people" x="10" y="92" oryx:align="bottom left" oryx:fittoelem="text_frame" fill="#999999">people</text><text font-size="12" id="text_system" x="138" y="92" oryx:align="bottom right" oryx:fittoelem="text_frame" fill="#6E97CE">已生效</text></g></svg>\n',
      'icon': 'activity/list/type.user.png',
      'groups': [
        '盒子'
      ],
      'propertyPackages': [
        'numberepackage',
        'overrideidpackage',
        'namepackage',
        'documentationpackage',
        'usertaskassignmentpackage',
        'outputpackage',
        'inputpackage',
        'important_levelpackage',
        'attachmentpackage',
        'departmentpackage',
        'activerolepackage',
        'activesystempackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'all'
      ]
    },
    {
      'type': 'node',
      'id': 'ExclusiveGateway',
      'title': '排他网关',
      'description': 'A choice gateway',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns:oryx="http://www.b3mn.org/oryx" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.0" width="80" height="80"><defs id="defs4"/><oryx:magnets><oryx:magnet oryx:cx="40" oryx:cy="1" oryx:anchors="top"/><oryx:magnet oryx:cx="79" oryx:cy="40" oryx:anchors="right"/><oryx:magnet oryx:cx="40" oryx:cy="79" oryx:anchors="bottom"/><oryx:magnet oryx:cx="1" oryx:cy="40" oryx:anchors="left"/><oryx:magnet oryx:default="yes" oryx:cy="40" oryx:cx="40" /></oryx:magnets><g><path d="M 0,40 L 40,0 L 80,40 L 40,80z" id="bg_frame" fill="#ffffff" stroke="#585858" style="stroke-width:1"/><g id="cross"><path id="crosspath" stroke="#585858" fill="#585858" d="M 30,30 L 34,30 L 50,50 L 46,50 z" style="stroke-width:1"/><path id="crosspath2" stroke="#585858" fill="#585858" d="M 30,50 L 34,50 L 50,30 L 46,30 z" style="stroke-width:1"/></g><text id="text_name" x="66" y="66" oryx:align="left top"/></g></svg>\n',
      'icon': 'gateway/exclusive.databased.png',
      'groups': [
        '基础元素'
      ],
      'propertyPackages': [
        'overrideidpackage',
        'namepackage',
        'documentationpackage',
        'asynchronousdefinitionpackage',
        'exclusivedefinitionpackage',
        'sequencefloworderpackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'sequence_start',
        'GatewaysMorph',
        'sequence_end',
        'all'
      ]
    },
    {
      'type': 'node',
      'id': 'EndNoneEvent',
      'title': '结束',
      'description': 'An end event without a specific trigger',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<svg\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:oryx="http://www.b3mn.org/oryx"\n   width="40"\n   height="40"\n   version="1.0">\n  <defs></defs>\n  <oryx:magnets>\n  \t<oryx:magnet oryx:cx="16" oryx:cy="16" oryx:default="yes" />\n  </oryx:magnets>\n  <g pointer-events="fill">\n    <circle id="bg_frame" cx="16" cy="16" r="14" stroke="#585858" fill="#ffffff" stroke-width="3"/>\n\t<text font-size="11" \n\t\tid="text_name" \n\t\tx="16" y="32" \n\t\toryx:align="top center" \n\t\tstroke="#373e48"\n\t></text>\n  </g>\n</svg>',
      'icon': 'endevent/none.png',
      'groups': [
        '基础元素'
      ],
      'propertyPackages': [
        'overrideidpackage',
        'namepackage',
        'documentationpackage',
        'executionlistenerspackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'EndEventsMorph',
        'sequence_end',
        'all'
      ]
    },
    {
      'type': 'node',
      'id': 'BPMNDiagram',
      'title': 'BPMN-Diagram',
      'description': 'A BPMN 2.0 diagram.',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<svg\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns:oryx="http://www.b3mn.org/oryx"\n   xmlns:xlink="http://www.w3.org/1999/xlink"\n   width="800"\n   height="600"\n   version="1.0">\n  <defs></defs>\n  <g pointer-events="fill" >\n    <polygon stroke="black" fill="black" stroke-width="1" points="0,0 0,590 9,599 799,599 799,9 790,0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" />\n    <rect id="diagramcanvas" oryx:resize="vertical horizontal" x="0" y="0" width="790" height="590" stroke="black" stroke-width="2" fill="white" />\n    \t<text font-size="22" id="diagramtext" x="400" y="25" oryx:align="top center" stroke="#373e48"></text>\n  </g>\n</svg>',
      'icon': 'diagram.png',
      'groups': [
        'Diagram'
      ],
      'mayBeRoot': true,
      'hide': true,
      'propertyPackages': [
        'process_idpackage',
        'namepackage',
        'documentationpackage',
        'process_authorpackage',
        'process_versionpackage',
        'process_namespacepackage',
        'process_historylevelpackage',
        'isexecutablepackage',
        'datapropertiespackage',
        'executionlistenerspackage',
        'eventlistenerspackage',
        'signaldefinitionspackage',
        'messagedefinitionspackage',
        'process_potentialstarteruserpackage',
        'process_potentialstartergrouppackage',
        'process_iseagerexecutionfetchpackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': []
    },
    {
      'type': 'node',
      'id': 'CollapsedSubProcess',
      'title': 'Collapsed Sub process',
      'description': 'A sub process scope',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<svg\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns:oryx="http://www.b3mn.org/oryx"\n   xmlns:xlink="http://www.w3.org/1999/xlink"\n   width="102"\n   height="82"\n   version="1.0">\n  <defs></defs>\n  <oryx:magnets>\n  \t<oryx:magnet oryx:cx="1" oryx:cy="20" oryx:anchors="left" />\n  \t<oryx:magnet oryx:cx="1" oryx:cy="40" oryx:anchors="left" />\n  \t<oryx:magnet oryx:cx="1" oryx:cy="60" oryx:anchors="left" />\n  \t\n  \t<oryx:magnet oryx:cx="25" oryx:cy="79" oryx:anchors="bottom" />\n  \t<oryx:magnet oryx:cx="50" oryx:cy="79" oryx:anchors="bottom" />\n  \t<oryx:magnet oryx:cx="75" oryx:cy="79" oryx:anchors="bottom" />\n  \t\n  \t<oryx:magnet oryx:cx="99" oryx:cy="20" oryx:anchors="right" />\n  \t<oryx:magnet oryx:cx="99" oryx:cy="40" oryx:anchors="right" />\n  \t<oryx:magnet oryx:cx="99" oryx:cy="60" oryx:anchors="right" />\n  \t\n  \t<oryx:magnet oryx:cx="25" oryx:cy="1" oryx:anchors="top" />\n  \t<oryx:magnet oryx:cx="50" oryx:cy="1" oryx:anchors="top" />\n  \t<oryx:magnet oryx:cx="75" oryx:cy="1" oryx:anchors="top" />\n  \t\n  \t<oryx:magnet oryx:cx="50" oryx:cy="40" oryx:default="yes" />\n  </oryx:magnets>\n  <g pointer-events="fill" oryx:minimumSize="50 40">\n\t<rect id="text_frame" oryx:anchors="bottom top right left" x="1" y="1" width="94" height="79" rx="10" ry="10" stroke="none" stroke-width="0" fill="none" />\n\t<rect id="bg_frame" oryx:resize="vertical horizontal" x="0" y="0" width="100" height="80" rx="10" ry="10" stroke="#bbbbbb" stroke-width="1" fill="#f9f9f9" />\n\t\t<text \n\t\t\tfont-size="12" \n\t\t\tid="text_name" \n\t\t\tx="50" \n\t\t\ty="40" \n\t\t\toryx:align="middle center"\n\t\t\toryx:fittoelem="text_frame"\n\t\t\tstroke="#373e48">\n\t\t</text>\n\t<g id="subprocess">\n\t\t<rect height="10" width="10" x="45" y="65" stroke="#bbbbbb" fill="none" />\n\t\t<path d="M50 65 L50 75" stroke="black" />\n\t\t<path d="M45 70 L55 70" stroke="black" />\n\t</g>\n  </g>\n</svg>',
      'icon': 'activity/subprocess.png',
      'groups': [
        '子流程'
      ],
      'propertyPackages': [
        'overrideidpackage',
        'namepackage',
        'documentationpackage',
        'asynchronousdefinitionpackage',
        'exclusivedefinitionpackage',
        'datapropertiespackage',
        'executionlistenerspackage',
        'multiinstance_typepackage',
        'multiinstance_cardinalitypackage',
        'multiinstance_collectionpackage',
        'multiinstance_variablepackage',
        'multiinstance_conditionpackage',
        'istransactionpackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'Activity',
        'sequence_start',
        'sequence_end',
        'all'
      ]
    },
    {
      'type': 'node',
      'id': 'Pool',
      'title': '泳池',
      'description': 'A pool to stucture the process definition',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:oryx="http://www.b3mn.org/oryx" xmlns:xlink="http://www.w3.org/1999/xlink" width="600" height="250" version="1.0"><defs></defs><oryx:magnets><oryx:magnet oryx:cx="0" oryx:cy="124" oryx:anchors="left"/><oryx:magnet oryx:cx="299" oryx:cy="249" oryx:anchors="bottom"/><oryx:magnet oryx:cx="599" oryx:cy="124" oryx:anchors="right"/><oryx:magnet oryx:cx="299" oryx:cy="0" oryx:anchors="top"/><oryx:magnet oryx:cx="299" oryx:cy="124" oryx:default="yes"/></oryx:magnets><g pointer-events="none"><rect id="border" class="stripable-element-force" oryx:resize="vertical horizontal" x="0" y="0" width="600" height="250" fill="none" stroke-width="1" stroke="#A4BDD7" pointer-events="stroke"/><rect id="caption" oryx:resize="horizontal" oryx:anchors="left top" x="0" y="0" width="600" height="40" stroke="#A4BDD7" stroke-width="1" fill="#F7F7F7" pointer-events="all"/><rect id="caption_title" oryx:anchors="left top" x="0" y="0" width="110" height="40" stroke="#A4BDD7" stroke-width="1" fill="#eff5f9" pointer-events="all" style="cursor: move" /><text x="55" y="20" font-size="12" oryx:fittoelem="caption_title" oryx:anchors="left top" oryx:align="middle center" stroke="#333333">角色</text></g></svg>\n',
      'icon': 'swimlane/pool.png',
      'groups': [
        '水平泳道'
      ],
      'layout': [
        {
          'type': 'layout.bpmn2_0.pool'
        }
      ],
      'propertyPackages': [
        'overrideidpackage',
        'namepackage',
        'documentationpackage',
        'process_idpackage'
      ],
      'hiddenPropertyPackages': [
        'isexecutablepackage'
      ],
      'roles': [
        'canContainArtifacts',
        'all'
      ]
    },
    {
      'type': 'node',
      'id': 'Lane',
      'title': '泳道',
      'description': 'A lane to stucture the process definition',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:oryx="http://www.b3mn.org/oryx" xmlns:xlink="http://www.w3.org/1999/xlink" width="600" height="250" version="1.0"><defs></defs><g pointer-events="none"><defs></defs><rect id="border" class="stripable-element-force" oryx:resize="vertical horizontal" x="0" y="0" width="600" height="250" fill="none" stroke-width="10" stroke="white" stroke-opacity="0.3" pointer-events="stroke"/><rect id="caption" oryx:anchors="left top bottom" x="0" y="0" width="110" height="250" stroke="#A4BDD7" stroke-width="1" fill="#eff5f9" class="stripable-element-force" pointer-events="all"/><line id="bottom_line" oryx:resize="vertical horizontal" oryx:align="bottom left" visibility="visible" fill="none" stroke="#4694AE" x1="1" y1="250" x2="600" y2="250" stroke-width="1"/><text x="55" y="125" font-size="12" id="text_name" oryx:align="middle center" oryx:anchors="left" oryx:fittoelem="caption" fill="black" stroke="black"></text></g></svg>\n',
      'icon': 'swimlane/lane.png',
      'groups': [
        '水平泳道'
      ],
      'propertyPackages': [
        'namepackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'PoolChild',
        'canContainArtifacts',
        'all'
      ]
    },
    {
      'type': 'node',
      'id': 'V-Pool',
      'title': 'V-泳池',
      'description': 'A pool to stucture the process definition',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:oryx="http://www.b3mn.org/oryx" xmlns:xlink="http://www.w3.org/1999/xlink" width="250" height="600" version="1.0"><defs></defs><oryx:magnets><oryx:magnet oryx:cx="0" oryx:cy="299" oryx:anchors="left"/><oryx:magnet oryx:cx="124" oryx:cy="599" oryx:anchors="bottom"/><oryx:magnet oryx:cx="249" oryx:cy="299" oryx:anchors="right"/><oryx:magnet oryx:cx="124" oryx:cy="0" oryx:anchors="top"/><oryx:magnet oryx:cx="124" oryx:cy="299" oryx:default="yes"/></oryx:magnets><g pointer-events="none"><defs></defs><rect id="border" class="stripable-element-force" oryx:resize="vertical horizontal" x="0" y="0" width="250" height="600" fill="none" stroke-width="9" stroke="none" visibility="visible" pointer-events="stroke"/><rect id="c" oryx:resize="vertical horizontal" x="0" y="0" width="250" height="600" stroke="black" fill="none" fill-opacity="0.3"/><rect id="caption" oryx:anchors="top left right" x="0" y="0" width="250" height="30" stroke="black" stroke-width="1" fill="white" pointer-events="all"/><rect id="captionDisableAntialiasing" oryx:anchors="top left right" x="0" y="0" width="250" height="30" stroke="black" stroke-width="1" fill="white" pointer-events="all"/><text x="125" y="13" font-size="12" oryx:fittoelem="caption" oryx:align="middle center" oryx:anchors="top" fill="black" stroke="black">阶段</text></g></svg>',
      'icon': 'swimlane/pool.png',
      'groups': [
        '垂直泳道'
      ],
      'layout': [
        {
          'type': 'layout.bpmn2_0.pool'
        }
      ],
      'propertyPackages': [
        'overrideidpackage',
        'namepackage',
        'documentationpackage',
        'process_idpackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'canContainArtifacts',
        'all'
      ]
    },
    {
      'type': 'node',
      'id': 'V-Lane',
      'title': 'V-泳道',
      'description': 'A lane to stucture the process definition',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:oryx="http://www.b3mn.org/oryx" xmlns:xlink="http://www.w3.org/1999/xlink" width="250" height="600" version="1.0"><defs></defs><g pointer-events="none"><rect id="border_invisible" class="stripable-element-force" oryx:resize="vertical horizontal" x="0" y="0" width="250" height="600" fill="none" stroke-width="10" stroke="white" stroke-opacity="0.3" visibility="hidden" pointer-events="stroke"/><line class="left_dasharray_line" oryx:align="top left" oryx:resize="vertical horizontal" stroke-dasharray=\'10\' fill="none" stroke="#4694AE" x1="1" y1="40" x2="1" y2="600" stroke-width="1"/><rect id="caption" oryx:anchors="top left right" x="0" y="1" width="248" height="38" stroke="#A4BDD7" stroke-width="0" fill="#eff5f9" pointer-events="all"/><line class="right_boder" oryx:align="top right" oryx:anchors="top" oryx:resize="vertical horizontal" oryx:fittoelem="caption" visibility="hidden" fill="none" stroke="#4694AE" x1="250" y1="0" x2="248" y2="600" stroke-width="1"/><path class="left_jian" stroke="#4694AE" stroke-width="1" fill="none" d="M 1,0 L 6,20 L 1,40" oryx:anchors="top left" oryx:fittoelem="caption" /><text x="125" y="20" font-size="12" id="text_name" oryx:align="middle center" oryx:anchors="top" oryx:fittoelem="caption" fill="#333333"></text></g></svg>\n',
      'icon': 'swimlane/lane.png',
      'groups': [
        '垂直泳道'
      ],
      'propertyPackages': [
        'overrideidpackage',
        'namepackage',
        'documentationpackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'V-PoolChild',
        'canContainArtifacts',
        'all'
      ]
    },
    {
      'type': 'edge',
      'id': 'SequenceFlow',
      'title': 'Sequence flow',
      'description': 'Sequence flow defines the execution order of activities.',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n<svg\r\n\txmlns="http://www.w3.org/2000/svg"\r\n\txmlns:oryx="http://www.b3mn.org/oryx"\r\n\tversion="1.0"\r\n\toryx:edge="edge" >\r\n\t<defs>\r\n\t  \t<marker id="start" refX="1" refY="5" markerUnits="userSpaceOnUse" markerWidth="17" markerHeight="11" orient="auto">\r\n\t  \t\t<!-- <path id="conditional"   d="M 0 6 L 8 1 L 15 5 L 8 9 L 1 5" fill="white" stroke="black" stroke-width="1" /> -->\r\n\t\t\t<path id="default" d="M 5 0 L 11 10" fill="white" stroke="#585858" stroke-width="1" />\r\n\t  \t</marker>\r\n\t  \t<marker id="end" refX="15" refY="6" markerUnits="userSpaceOnUse" markerWidth="15" markerHeight="12" orient="auto">\r\n\t  \t\t<path id="arrowhead" d="M 0 1 L 15 6 L 0 11z" fill="#585858" stroke="#585858" stroke-linejoin="round" stroke-width="2" />\r\n\t  \t</marker>\r\n\t</defs>\r\n\t<g id="edge">\r\n\t\t<path id="bg_frame" d="M10 50 L210 50" stroke="#585858" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" marker-start="url(#start)" marker-end="url(#end)" />\r\n\t\t<text id="text_name" x="0" y="0" oryx:edgePosition="startTop"/>\r\n\t</g>\r\n</svg>',
      'icon': 'connector/sequenceflow.png',
      'groups': [
        'Connecting Objects'
      ],
      'layout': [
        {
          'type': 'layout.bpmn2_0.sequenceflow'
        }
      ],
      'propertyPackages': [
        'overrideidpackage',
        'namepackage',
        'documentationpackage',
        'conditionsequenceflowpackage',
        'executionlistenerspackage',
        'defaultflowpackage',
        'skipexpressionpackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'ConnectingObjectsMorph',
        'all'
      ]
    },
    {
      'type': 'edge',
      'id': 'MessageFlow',
      'title': 'Message flow',
      'description': 'Message flow to connect elements in different pools.',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n<svg\r\n\txmlns="http://www.w3.org/2000/svg"\r\n\txmlns:oryx="http://www.b3mn.org/oryx"\r\n\tversion="1.0"\r\n\toryx:edge="edge" >\r\n\t<defs>\r\n\t\t<marker id="start" oryx:optional="yes" oryx:enabled="yes" refX="5" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">\r\n\t  \t\t<!-- <path d="M 10 10 L 0 5 L 10 0" fill="none" stroke="#585858" /> -->\r\n\t  \t\t<circle id="arrowhead" cx="5" cy="5" r="5" fill="white" stroke="black" />\r\n\t  \t</marker>\r\n\r\n\t  \t<marker id="end" refX="10" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">\r\n\t  \t\t<path id="arrowhead2" d="M 0 0 L 10 5 L 0 10 L 0 0" fill="white" stroke="#585858" />\r\n\t  \t</marker>\r\n\t</defs>\r\n\t<g id="edge">\r\n\t    <path id="bg_frame" d="M10 50 L210 50" stroke="#585858" fill="none" stroke-width="2" stroke-dasharray="3, 4" marker-start="url(#start)" marker-end="url(#end)" />\r\n\t\t<text id="text_name" x="0" y="0" oryx:edgePosition="midTop"/>\r\n\t</g>\r\n</svg>',
      'icon': 'connector/messageflow.png',
      'groups': [
        'Connecting Objects'
      ],
      'layout': [
        {
          'type': 'layout.bpmn2_0.sequenceflow'
        }
      ],
      'propertyPackages': [
        'overrideidpackage',
        'namepackage',
        'documentationpackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'ConnectingObjectsMorph',
        'all'
      ]
    },
    {
      'type': 'edge',
      'id': 'Association',
      'title': 'Association',
      'description': 'Associates a text annotation with an element.',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n<svg\r\n\txmlns="http://www.w3.org/2000/svg"\r\n\txmlns:oryx="http://www.b3mn.org/oryx"\r\n\tversion="1.0"\r\n\toryx:edge="edge" >\r\n\t<g id="edge">\r\n\t    <path id="bg_frame" d="M10 50 L210 50" stroke="#585858" fill="none" stroke-width="2" stroke-dasharray="3, 4" />\r\n\t\t<text id="name" x="0" y="0" oryx:edgePosition="midTop" oryx:offsetTop="6" style="font-size:9px;"/>\r\n\t</g>\r\n</svg>',
      'icon': 'connector/association.undirected.png',
      'groups': [
        'Connecting Objects'
      ],
      'layout': [
        {
          'type': 'layout.bpmn2_0.sequenceflow'
        }
      ],
      'propertyPackages': [
        'overrideidpackage',
        'namepackage',
        'documentationpackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'ConnectingObjectsMorph',
        'all'
      ]
    },
    {
      'type': 'edge',
      'id': 'DataAssociation',
      'title': 'DataAssociation',
      'description': 'Associates a data element with an activity.',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\r\n<svg\r\n\txmlns="http://www.w3.org/2000/svg"\r\n\txmlns:oryx="http://www.b3mn.org/oryx"\r\n\tversion="1.0"\r\n\toryx:edge="edge" >\r\n\t<defs>\r\n\t  \t<marker id="end" refX="10" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto">\r\n\t  \t\t<path id="arrowhead" d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#585858" />\r\n\t  \t</marker>\r\n\t</defs>\r\n\t<g id="edge">\r\n\t    <path id="bg_frame" d="M10 50 L210 50" stroke="#585858" fill="none" stroke-width="2" stroke-dasharray="3, 4" marker-end="url(#end)" />\r\n\t\t<text id="name" x="0" y="0" oryx:edgePosition="midTop" oryx:offsetTop="6" style="font-size:9px;"/>\r\n\t</g>\r\n</svg>',
      'icon': 'connector/association.unidirectional.png',
      'groups': [
        'Connecting Objects'
      ],
      'layout': [
        {
          'type': 'layout.bpmn2_0.sequenceflow'
        }
      ],
      'propertyPackages': [
        'overrideidpackage',
        'namepackage',
        'documentationpackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'ConnectingObjectsMorph',
        'all'
      ]
    },
    {
      'type': 'node',
      'id': 'TextAnnotation',
      'title': '注释',
      'description': 'Annotates elements with description text.',
      'view': '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<svg\n   xmlns="http://www.w3.org/2000/svg"\n   xmlns:svg="http://www.w3.org/2000/svg"\n   xmlns:oryx="http://www.b3mn.org/oryx"\n   xmlns:xlink="http://www.w3.org/1999/xlink"\n   width="102"\n   height="51"\n   version="1.0">\n  <defs></defs>\n  <oryx:magnets>\n  \t<oryx:magnet oryx:cx="2" oryx:cy="25" oryx:anchors="left" oryx:default="yes"/>\n  </oryx:magnets>\n  <g pointer-events="all" oryx:minimumSize="10 20" oryx:maximumSize="" >\n  <rect \n\tid="textannotationrect"\n\toryx:resize="vertical horizontal"\n\tx="1" \n\ty="1"\n\twidth="100"\n\theight="50"\n\tstroke="none"\n\tfill="none" />\n  <path \n  \tid = "frame"\n\td="M20,1 L1,1 L1,50 L20,50" \n\toryx:anchors="top bottom left" \n\tstroke="#585858" \n\tfill="none" \n\tstroke-width="1" />\n    \n    <text \n\t\tfont-size="12" \n\t\tid="text" \n\t\tx="5" \n\t\ty="25" \n\t\toryx:align="middle left"\n\t\toryx:fittoelem="textannotationrect"\n\t\toryx:anchors="left"\n\t\tstroke="#373e48">\n\t</text>\n  </g>\n</svg>',
      'icon': 'artifact/text.annotation.png',
      'groups': [
        '其他'
      ],
      'propertyPackages': [
        'overrideidpackage',
        'namepackage',
        'documentationpackage',
        'textpackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'all'
      ]
    },
    {
      'type': 'node',
      'id': 'DataStore',
      'title': 'Data store',
      'description': 'Reference to a data store.',
      'view': '<?xml version="1.0" encoding="utf-8" standalone="no" ?>\r\n<svg \r\n\txmlns="http://www.w3.org/2000/svg"\r\n\txmlns:svg="http://www.w3.org/2000/svg"\r\n   \txmlns:oryx="http://www.b3mn.org/oryx"\r\n   \txmlns:xlink="http://www.w3.org/1999/xlink"\r\n\t\r\n\twidth="63.001px" \r\n\theight="61.173px"\r\n\tversion="1.0">\r\n\t<defs></defs>\r\n\t<oryx:magnets>\r\n\t\t<oryx:magnet oryx:cx="0" oryx:cy="30.5865" oryx:anchors="left" />\r\n\t\t<oryx:magnet oryx:cx="31.5005" oryx:cy="61.173" oryx:anchors="bottom" />\r\n\t\t<oryx:magnet oryx:cx="63.001" oryx:cy="30.5865" oryx:anchors="right" />\r\n\t\t<oryx:magnet oryx:cx="31.5005" oryx:cy="0" oryx:anchors="top" />\r\n\t\t<oryx:magnet oryx:cx="31.5005" oryx:cy="30.5865" oryx:default="yes" />\r\n\t</oryx:magnets>\r\n\t\r\n\t<g>\r\n\t\t<defs>\r\n\t\t\t<radialGradient id="background" cx="30%" cy="30%" r="50%" fx="0%" fy="0%">\r\n\t\t\t\t<stop offset="0%" stop-color="#ffffff" stop-opacity="1"></stop>\r\n\t\t\t\t<stop offset="100%" stop-color="#ffffff" stop-opacity="1" id="fill_el"></stop>\r\n\t\t\t</radialGradient>\r\n\t\t</defs>\r\n\t\t\r\n\t\t<path id="bg_frame" fill="url(#background) #ffffff" stroke="#000000" d="M31.634,0.662c20.013,0,31.292,3.05,31.292,5.729c0,2.678,0,45.096,0,48.244\r\n\t\t\tc0,3.148-16.42,6.2-31.388,6.2c-14.968,0-30.613-2.955-30.613-6.298c0-3.342,0-45.728,0-48.05\r\n\t\t\tC0.925,4.165,11.622,0.662,31.634,0.662z"/>\r\n\t\t<path id="bg_frame2" fill="none" stroke="#000000" d="\r\n\t\t\tM62.926,15.69c0,1.986-3.62,6.551-31.267,6.551c-27.646,0-30.734-4.686-30.734-6.454 M0.925,11.137\r\n\t\t\tc0,1.769,3.088,6.455,30.734,6.455c27.647,0,31.267-4.565,31.267-6.551 M0.925,6.487c0,2.35,3.088,6.455,30.734,6.455\r\n\t\t\tc27.647,0,31.267-3.912,31.267-6.552 M62.926,6.391v4.844 M0.949,6.391v4.844 M62.926,11.041v4.844 M0.949,11.041v4.844"/>\r\n\t\t\t \t\r\n\t\t<text font-size="12" id="text_name" x="31" y="66" oryx:align="center top" stroke="black" />\r\n\t\t\t \r\n\t</g>\r\n</svg>\r\n',
      'icon': 'dataobject/data.store.png',
      'groups': [
        'Artifacts'
      ],
      'propertyPackages': [
        'overrideidpackage',
        'namepackage',
        'documentationpackage'
      ],
      'hiddenPropertyPackages': [],
      'roles': [
        'all'
      ]
    }
  ],
  'rules': {
    'cardinalityRules': [
      {
        'role': 'Startevents_all',
        'incomingEdges': [
          {
            'role': 'SequenceFlow',
            'maximum': 0
          }
        ]
      },
      {
        'role': 'Endevents_all',
        'outgoingEdges': [
          {
            'role': 'SequenceFlow',
            'maximum': 0
          }
        ]
      }
    ],
    'connectionRules': [
      {
        'role': 'SequenceFlow',
        'connects': [
          {
            'from': 'sequence_start',
            'to': [
              'sequence_end'
            ]
          }
        ]
      },
      {
        'role': 'Association',
        'connects': [
          {
            'from': 'sequence_start',
            'to': [
              'TextAnnotation'
            ]
          },
          {
            'from': 'sequence_end',
            'to': [
              'TextAnnotation'
            ]
          },
          {
            'from': 'TextAnnotation',
            'to': [
              'sequence_end'
            ]
          },
          {
            'from': 'TextAnnotation',
            'to': [
              'sequence_start'
            ]
          },
          {
            'from': 'BoundaryCompensationEvent',
            'to': [
              'sequence_end'
            ]
          },
          {
            'from': 'BoundaryCompensationEvent',
            'to': [
              'sequence_start'
            ]
          },
          {
            'from': 'sequence_start',
            'to': [
              'FlowBox'
            ]
          },
          {
            'from': 'sequence_end',
            'to': [
              'FlowBox'
            ]
          },
        ]
      },
      {
        'role': 'DataAssociation',
        'connects': [
          {
            'from': 'sequence_start',
            'to': [
              'DataStore'
            ]
          },
          {
            'from': 'sequence_end',
            'to': [
              'DataStore'
            ]
          },
          {
            'from': 'DataStore',
            'to': [
              'sequence_end'
            ]
          },
          {
            'from': 'DataStore',
            'to': [
              'sequence_start'
            ]
          }
        ]
      },
      {
        'role': 'IntermediateEventOnActivityBoundary',
        'connects': [
          {
            'from': 'Activity',
            'to': [
              'IntermediateEventOnActivityBoundary'
            ]
          }
        ]
      }
    ],
    'containmentRules': [
      {
        'role': 'BPMNDiagram',
        'contains': [
          'all'
        ]
      },
      {
        'role': 'SubProcess',
        'contains': [
          'sequence_start',
          'sequence_end',
          'from_task_event',
          'to_task_event',
          'EventSubProcess',
          'TextAnnotation',
          'DataStore'
        ]
      },
      {
        'role': 'AdhocSubProcess',
        'contains': [
          'sequence_start',
          'sequence_end',
          'from_task_event',
          'to_task_event',
          'TextAnnotation',
          'DataStore'
        ]
      },
      {
        'role': 'EventSubProcess',
        'contains': [
          'sequence_start',
          'sequence_end',
          'from_task_event',
          'to_task_event',
          'TextAnnotation',
          'DataStore'
        ]
      },
      {
        'role': 'Pool',
        'contains': [
          'Lane',
          'V-Lane'
        ]
      },
      {
        'role': 'V-Pool',
        'contains': [
          'V-Lane'
        ]
      },
      {
        'role': 'Lane',
        'contains': [
          'sequence_start',
          'sequence_end',
          'EventSubProcess',
          'TextAnnotation',
          'DataStore'
        ]
      },
      {
        'role': 'V-Lane',
        'contains': [
          'sequence_start',
          'sequence_end',
          'EventSubProcess',
          'TextAnnotation',
          'DataStore'
        ]
      }
    ],
    'morphingRules': [
      {
        'role': 'ActivitiesMorph',
        'baseMorphs': [
          'UserTask'
        ],
        'preserveBounds': true
      },
      {
        'role': 'GatewaysMorph',
        'baseMorphs': [
          'ExclusiveGateway'
        ]
      },
      {
        'role': 'StartEventsMorph',
        'baseMorphs': [
          'StartNoneEvent'
        ]
      },
      {
        'role': 'EndEventsMorph',
        'baseMorphs': [
          'StartNoneEvent'
        ]
      },
      {
        'role': 'CatchEventsMorph',
        'baseMorphs': [
          'CatchTimerEvent'
        ]
      },
      {
        'role': 'ThrowEventsMorph',
        'baseMorphs': [
          'ThrowNoneEvent'
        ]
      },
      {
        'role': 'BoundaryEventsMorph',
        'baseMorphs': [
          'ThrowNoneEvent'
        ]
      },
      {
        'role': 'BoundaryCompensationEvent',
        'baseMorphs': [
          'BoundaryCompensationEvent'
        ]
      },
      {
        'role': 'TextAnnotation',
        'baseMorphs': [
          'TextAnnotation'
        ]
      },
      {
        'role': 'DataStore',
        'baseMorphs': [
          'DataStore'
        ]
      }
    ]
  }
}
