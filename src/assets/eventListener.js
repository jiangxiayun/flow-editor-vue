/**
 * 注册事件
 */
import G6Editor from '@antv/g6-editor'
const Util = G6Editor.Util
// console.log('Util:', Util)
let Flow = null

const input = Util.createDOM('<input class="g6-label-input" />', {
  position: 'absolute',
  zIndex: 10,
  display: 'none'
});
input.hide = function () {
  input.css({
    display: 'none'
  });
  input.visibility = false;
};
input.show = function () {
  input.css({
    display: 'block'
  });
  input.visibility = true;
};
input.on('keydown', ev => {
  if (ev.keyCode === 13) {
    updateLabel();
  }
});
input.on('blur', () => {
  updateLabel();
});

function hasClass(item, className) {
  if (item) {
    const model = item.getModel()
    if (model && model[className]) {
      return model[className];
    }
  }
  return false;
}

function showInputLabel(node) {
  if (!node) {
    return;
  }

  const label = hasClass(node, 'label');
  const bbox = node.getBBox();
  const borderWidth = 1;
  clearAllActived();
  const domPoint = Flow.getDomPoint({
    x: bbox.minX, y:bbox.minY
  })

  input.value = label;
  input.show();
  input.css({
    top: domPoint.y - borderWidth + 10 + 'px',
    left: domPoint.x - borderWidth + 10 + 'px',
    width: bbox.width - 20 + 'px',
    height: bbox.height - 20 + 'px',
    padding: '0px',
    margin: '0px',
    border: borderWidth + 'px solid #999'
  });
  input.focus();
  input.node = node;
}

function updateLabel() {
  if (input.visibility) {
    const node = input.node;
    clearAllActived();
    if (input.value !== node.getModel().label) {
      if (input.value) {
        Flow.update(node, {
          label: input.value
        });
      }
    }
    input.hide();
  }
}

function clearAllActived() {
  // Flow.clearAllActived();
  // Flow.refresh(false);
}


export default function setEventListener (flow) {
  Flow = flow

  // 获取 G6.Graph 实例
  const graph = flow.getGraph()
  const graphContainer  = graph.getGraphContainer();
  graphContainer.appendChild(input); // 追加input输入框

  // 节点双击事件
  graph.on('node:dblclick', ev =>{
    // console.log('dblclick:', ev)
    const item = ev.item;
    const shape = ev.shape;

    if (item && hasClass(item, 'label') && shape.eventPreFix === 'node') {// 节点的情况下
      showInputLabel(item);
    }
  });

  // 节点单击事件
//   graph.on('node:hover', ev =>{
//     // console.log('click:', ev)
//     const item = ev.item;
//     const shape = ev.shape;
//     const bbox = item.getBBox();
// console.log('bbox', bbox)
//     const group = item.getGraphicGroup();
//     group.addShape('rect', {
//       attrs: {
//         x: - bbox.width / 2 - 2,
//         y: - bbox.height / 2 - 2,
//         width: bbox.width,
//         height: bbox.height,
//         stroke: '#f58f62'
//       }
//     })
//     group.addShape('circle', {
//       attrs: {
//         x: - bbox.width / 2,
//         y: - bbox.height / 2,
//         r: 4,
//         fill: '#f58f62'
//       }
//     })
//
//   });

  // 鼠标悬浮节点后显示锚点前，可用作控制，锚点是否显示
  Flow.on('afteritemselected', ev=>{
    // ev.item    子项
    // console.log('css', ev.item.getGraph().css.cursor)
    // (t.css({cursor:o.cursor.hoverEffectiveAnchor})
    const item = ev.item;
    const model = item.getModel();
    console.log('hovernode', item, model)
    if (model.shape === 'node-box') {
      Flow.css({cursor: 'crosshair'})
      console.log(66666)
    } else if (item.type === 'node') {
      const bbox = item.getBBox();
      console.log('bbox', bbox)
      const group = item.getGraphicGroup();
      group.addShape('rect', {
        attrs: {
          x: - bbox.width / 2 - 4,
          y: - bbox.height / 2 - 4,
          width: 8,
          height: 8,
          lineWidth: 1.4,
          stroke: '#38a1ff',
          fill: '#ffffff'
        }
      })
    }


    const customNode = item.getKeyShape();
    console.log('item', customNode)
    // customNode.attr({
    //   style: 'cursor: nwse-resize',
    // })

    // graph.add('node', {
    //   x: bbox.minX -6,
    //   y: bbox.minY - 6,
    //   width: bbox.width + 12,
    //   height: bbox.height + 12,
    //   shape:'node-box'
    // })


    // group.addShape('rect', {
    //   attrs: {
    //     x: bbox.width / 2 - 4,
    //     y: bbox.height / 2 - 4,
    //     width: 8,
    //     height: 8,
    //     lineWidth: 1.4,
    //     stroke: '#38a1ff',
    //     fill: '#ffffff'
    //   }
    // })
    // group.addShape('circle', {
    //   attrs: {
    //     x: - bbox.width / 2,
    //     y: - bbox.height / 2,
    //     r: 40,
    //     fill: '#f58f62',
    //     cursor:"pointer"
    //   }
    // })

  });

}

