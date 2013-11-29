var c = d3.select('canvas')
        .attr(size)
        .call(pathgl)

c.selectAll('circle').data(d3.range(100))
.enter().append('circle')
.attr({
  cx: function (d) { return d * 10 }
, cy: function (d) { return d * 10 }
})
.attr('r', function () { return 10 + arguments[1]})
//.attr('stroke', '#water')
.attr('fill', '#stone')
