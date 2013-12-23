examples.mosaic = function (selector){
  var c = d3.select(selector)
          .attr(size)
          .call(pathgl)

  c.selectAll('rect').data(d3.range(100))
  .enter().append('rect')
  .attr('stroke', 'blue')
  .attr('fill', 'pink')
  //.attr('stroke', '#water')
  //.attr('fill', '#rgb')
  .attr('width', 30)
  .attr('height', 30)
  .attr({
    x: function (d) { return d * 10 }
  , y: function (d) { return d * 10 }
  })
}