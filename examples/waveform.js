examples.waveform = function (selection) {
  var numLines = 4
  var s = d3.select(selection)
          .attr(size)
          .call(pathgl)

  var scale = Math.PI * 2 / numLines

  s.selectAll('line').data(d3.range(numLines))
  .enter()
  .append('line')
  .attr({
    x1: size.width >> 1
  , y1: size.height >> 1
  , stroke: function (d, i) { return 'red green blue yellow'.split(' ')[i] }
  , x2: function (d) { return Math.cos(d * scale) * 1000 }
  , y2: function (d) { return Math.sin(d * scale) * 1000 }
  })
}
