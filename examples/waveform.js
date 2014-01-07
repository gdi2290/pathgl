examples.waveform = function (selection) {
  var s = d3.select(selection)
          .attr(size)
          .call(pathgl)
  var scale = Math.PI * 2 / 30

  s.selectAll('line').data(d3.range(30))
  .enter()
  .append('line')
  .attr({
    x1: 300
  , y1: 300
  , stroke: '#333'
  , x2: function (d) { return Math.cos(d * scale) * 1000 }
  , y2: function (d) { return Math.sin(d * scale) * 1000 }
  })
}
