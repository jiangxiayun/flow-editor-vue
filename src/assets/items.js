/**
 * 注册节点
 */
import G6Editor from '@antv/g6-editor'

const { Flow } = G6Editor;

export default function setRegisterItem () {
  // const graph = flow.getGraph();
  Flow.registerNode('node-box', {
    anchor: [],
    draw(item){
      const group = item.getGraphicGroup();
      const model = item.getModel();
      group.addShape('text', {
        attrs: {
          x: 0,
          y: 0,
          fill: '#333',
          text: '我是一个自定义节点，\n有下面那个方形和我自己组成'
        }
      });
      group.addShape('text', {
        attrs: {
          x: 0,
          y: 0,
          fill: '#333',
          text: ' ('+model.x+', '+model.y+') \n 原点是组的图坐标',
          textBaseline: 'top'
        }
      });
      group.addShape('circle', {
        attrs: {
          x: 0,
          y: 0,
          r: 4,
          fill: 'blue'
        }
      });
      // group.attr({
      //   style: 'cursor: ne-resize',
      // })
      return group.addShape('rect', {
        attrs: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          stroke: 'red',
          style: {
            cursor: 'ne-resize'
          }
        }
      });
    }
  });

  Flow.registerNode('customNode', {
    intersectBox: 'circle', // 'circle', 'rect'
  });
}

