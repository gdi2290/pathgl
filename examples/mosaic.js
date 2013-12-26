examples.mosaic = function (selector){
  var c = d3.select(selector)
          .attr(size)
          .call(pathgl)

  c.append('circle')
  .attr({
    r: 100
  , cx: 90
  , cy: 100
  , fill: 'pink'
  })
}