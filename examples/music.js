examples.music = function (selection) {
  var numLines = 1e2
  var s = d3.select(selection)
          .attr(size)
          .call(pathgl)

  var scale = Math.PI * 2 / numLines

  var lines = s.selectAll('line').data(d3.range(numLines))
  .enter()
  .append('line')
  .attr({
    x1: size.width >> 1
  , y1: size.height >> 1
  , stroke: function () { return "hsl(" + Math.random() * 360 + ",100%, 50%)" }
  , x2: function (d) { return Math.cos(d * scale) * 1000 }
  , y2: function (d) { return Math.sin(d * scale) * 1000 }
  })

  d3.timer(function () {
    lines.attr('stroke', function () { return "hsl(" + Math.random() * 360 + ",100%, 50%)" })
    .attr('x2', function (d) { return Math.cos(d * scale) * Math.random() * 1000 })
    .attr('y2', function (d) { return Math.sin(d * scale) * Math.random() * 1000 })
  })
}
