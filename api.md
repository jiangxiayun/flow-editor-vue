注册流程图节点

Flow.registerNode(name, {
// 参考：https://lark.alipay.com/antv/rslism/anchor
anchor,
// 绘制
draw(item) {
return keyShape;
},
}, extandShape);

cursor  crosshair


#addShape
##直线——line
stroke: 'black' 线条颜色
stroke: 'l (0) 0:#ff0000 1:#0000ff'    // 线性渐变
 stroke: 'r (0.5, 0.5, 0) 0:rgb(0, 0, 255) 1:#ff0000'    // 迳向渐变
lineDash: [20, 20] 虚线
fill: 'rgba(129,9,39,0.5)' 填充色
arrow: true,         // 显示箭头

##扇形——fan：
startAngle: 1/6*Math.PI,
endAngle: 3/2*Math.PI,

##path
path:
lineWidth: 10,
lineJoin: 'round',