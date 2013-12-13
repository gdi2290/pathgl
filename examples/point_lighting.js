var c = d3.select('canvas')
        .attr(size)
        .call(pathgl)

c.selectAll('circle').data(d3.range(2e3))
.enter().append('circle')
.attr('r', 0)
.attr('stroke', 'blue')
.attr('fill', 'pink')
.attr('stroke', 'red')
.attr({
  cx: function (d) { return d * 10 }
, cy: function (d) { return d * 10 }
})

function k() {
  c.selectAll('circle').transition().duration(1000)
  .attr('cy', function (d, i ) { return Math.random() * 500})
  .attr('cx', function () { return Math.random() * 900 })
  .each('end', function (d, i) { if (!i) k() })
}

k()