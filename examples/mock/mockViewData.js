export const mockViewData = {
  'elements': [
    {
      'id': 'startEvent1',
      'name': '',
      'x': 100.0,
      'y': 163.0,
      'width': 30.0,
      'height': 30.0,
      'type': 'StartEvent',
      'interrupting': true,
      'properties': []
    },
    {
      'id': 'sid-FCEDEBA5-BEA8-4A30-88B1-38C569B74F9A',
      'name': '',
      'x': 175.0,
      'y': 138.0,
      'width': 100.0,
      'height': 80.0,
      'type': 'UserTask',
      'properties': []
    },
    {
      'id': 'sid-007CDC58-1A3B-4922-AC2A-AA4A6ACBAD05',
      'name': '',
      'x': 315.0,
      'y': 138.0,
      'width': 100.0,
      'height': 80.0,
      'type': 'UserTask',
      'properties': []
    },
    {
      'id': 'sid-A187AABD-B833-4994-AD67-A5FE25E403B1',
      'name': '',
      'x': 460.0,
      'y': 164.0,
      'width': 28.0,
      'height': 28.0,
      'type': 'EndEvent',
      'properties': []
    }
  ],
  'flows': [
    {
      'id': 'sid-C7058E69-8E6A-4270-811B-A9AE8771004B',
      'type': 'sequenceFlow',
      'sourceRef': 'startEvent1',
      'targetRef': 'sid-FCEDEBA5-BEA8-4A30-88B1-38C569B74F9A',
      'name': '',
      'waypoints': [{
        'x': 129.9499984899576,
        'y': 178.0
      }, {
        'x': 174.9999999999917,
        'y': 178.0
      }],
      'properties': []
    },
    {
      'id': 'sid-8E0282ED-19CB-4056-9FB3-4F433651B19C',
      'type': 'sequenceFlow',
      'sourceRef': 'sid-FCEDEBA5-BEA8-4A30-88B1-38C569B74F9A',
      'targetRef': 'sid-007CDC58-1A3B-4922-AC2A-AA4A6ACBAD05',
      'name': '',
      'waypoints': [{
        'x': 274.95000000000005,
        'y': 178.0
      }, {
        'x': 314.9999999999682,
        'y': 178.0
      }],
      'properties': []
    },
    {
      'id': 'sid-40A6D0B9-E810-4828-B506-403DFFDFE83D',
      'type': 'sequenceFlow',
      'sourceRef': 'sid-007CDC58-1A3B-4922-AC2A-AA4A6ACBAD05',
      'targetRef': 'sid-A187AABD-B833-4994-AD67-A5FE25E403B1',
      'name': '',
      'waypoints': [{
        'x': 414.95000000000005,
        'y': 178.0
      }, {
        'x': 460.0,
        'y': 178.0
      }],
      'properties': []
    }
  ],
  'diagramBeginX': 115.0,
  'diagramBeginY': 138.0,
  'diagramWidth': 488.0,
  'diagramHeight': 218.0
}
