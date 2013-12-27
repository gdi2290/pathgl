examples.mosaic = function (selector){
  var c = d3.select(selector)
          .attr(size)
          .call(pathgl)

  c.append('circle')
  .attr({
    r: 10
  , cx: 0
  , cy: 50
  , fill: 'pink'
  })

  c.append('circle')
  .attr({
    r: 10
  , cx: 200
  , cy: 300
  , fill: 'blue'
  })

c.append('circle')
  .attr({
    r: 10
  , cx: 900
  , cy: 300
  , fill: 'red'
  })
}