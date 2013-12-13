var c = d3.select('canvas')
        .attr(size)
        .call(pathgl)

c.selectAll('circle').data(d3.range(10000))
.enter().append('circle')
.attr('r', 0)
.attr('stroke', 'blue')
.attr('fill', 'pink')
.attr('stroke', 'red')
.attr({
  cx: function (d) { return d * 10 }
, cy: function (d) { return d * 10 }
})
