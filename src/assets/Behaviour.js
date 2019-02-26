import G6 from '@antv/g6'

export default function setBehaviour () {
  G6.registerBehaviour("hoverAnchorActived", function (t) {
    console.log(888, t)
    var e = t.getGraph();
    e.behaviourOn("anchor:mouseenter", function (n) {
      if (!t.getSignal("panningItem") && !t.getSignal("dragEdge")) {
        var i = n.shape, a = i.getItem(), u = a.getModel(), s = function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var n = null != arguments[e] ? arguments[e] : {}, i = Object.keys(n);
            "function" == typeof Object.getOwnPropertySymbols && (i = i.concat(Object.getOwnPropertySymbols(n).filter(function (t) {
              return Object.getOwnPropertyDescriptor(n, t).enumerable
            }))), i.forEach(function (e) {
              r(t, e, n[e])
            })
          }
          return t
        }({}, t.get("addEdgeModel"), {source: u.id}), c = {anchor: i.getPoint(), item: a};
        t.emit("hoveranchor:beforeaddedge", c), c.cancel ? t.css({cursor: o.cursor.hoverUnEffectiveAnchor}) : (t.css({cursor: o.cursor.hoverEffectiveAnchor}), !i.get("destroyed") && i.setActived(), t.beginAdd("edge", s), e.draw())
      }
    }), e.behaviourOn("anchor:mouseleave", function (n) {
      if (!t.getSignal("dragEdge") && !t.getSignal("panningItem")) {
        var r = n.shape, i = r.getItem();
        t.css({cursor: o.cursor.beforePanCanvas}), i.isSelected || (t.clearAnchor(i), t.setActived(i, !1)), !r.get("destroyed") && r.clearActived(), t.cancelAdd(), e.draw()
      }
    })
  })
}
