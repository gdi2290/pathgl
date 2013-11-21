var w = innerWidth
  , h = innerHeight
  , current_shader

pathgl.forceRerender = true
//pathgl.fragment = d3.select('#hello').text()

d3.selectAll('[id]').each(function () {
  var name = this.id
  d3.select('body').append('div').attr('class', 'select').text(name).on('click', function () {
    d3.select('#circles').selectAll('circle').attr('fill', '#' + name)
  })
})

d3.select('#circles').attr('height', innerHeight).attr('width', innerWidth)

var data = d3.range(1e3)
           .map(function (d) { return [ Math.random() * w / 2
                                      , Math.random() * h  / 2] })

var c = d3.select(pathgl('#circles') || 'svg')
        .attr('height', h)
        .attr('width', w)
        .selectAll('circle').data(data).enter().append('circle')
        .attr('cx', function (d) { return d[0] })
        .attr('cy', function (d) { return d[1] })
        .attr('r', function () { return Math.random() * 10 + 10 })
        .attr('fill', 'red')

function random_color() { return '#' + Math.floor(Math.random() * 0xffffff).toString(16) }

d3.select('#circles').on('click', function () {
  var   a = random_shader()
  , b = random_shader()
  c.filter(function (d, i) { return i < 500}).attr('fill', a)
  c.filter(function (d, i) { return i > 500}).attr('fill', b)

  c.transition().duration(1000).ease('linear')
  .attr('cx', function (){ return Math.random() * innerWidth})
  .attr('cy', function (){ return Math.random() * innerHeight})
})

function random_shader () {
  var selection = d3.selectAll('.select')
    , index = ~~ (Math.random() * (selection.size()))
    , handler = selection[0][index]

  return '#' + handler.textContent
}

a=d3.selectAll('[id]')[0].map(function (d) { return d.id })
.map(function (d) { return '#' + d})


c.attr('fill', random_shader())