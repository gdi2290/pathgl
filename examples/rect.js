
var w = innerWidth
  , h = innerHeight
  , current_shader

pathgl.forceRerender = true
  d3.select('canvas#rect').attr('height', innerHeight).attr('width', innerWidth)

var data = d3.range(2)
           .map(function (d) { return [ Math.random() * w / 2
                                      , Math.random() * h  / 2] })

var rect = d3.select(pathgl('canvas#rect'))
        .attr('height', h)
        .attr('width', w)
        .selectAll('rect').data(data).enter().append('circle')
        .attr('x', function (d) { return 0 })
        .attr('y', function (d) { return 0 })
        .attr('width', function () { return 10  })
        .attr('height', function () { return 20 })
        .attr('fill', 'blue')

function random_color() { return '#' + Math.floor(Math.random() * 0xffffff).toString(16) }

d3.select('canvas#rect').on('click', function () {
  rect.transition().duration(1000).ease('linear')
  .attr('x', function (){ return Math.random() * innerWidth})
  .attr('y', function (){ return Math.random() * innerHeight})
})
