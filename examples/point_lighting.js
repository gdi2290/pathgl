var c = d3.select('canvas')
        .attr(size)
        .call(pathgl)



c.selectAll('circle').data(d3.range(100))
.enter().append('circle')

.attr({
  cx: function (d) { return d * 10 }
, cy: function (d) { return d * 10 }
})
.attr('r', 10)
.transition()
.attr('stroke', 'blue')
.attr('fill', 'pink')
