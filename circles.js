var w = innerWidth
  , h = innerHeight
  , current_shader

pathgl.forceRerender = true
//pathgl.fragment = d3.select('#hello').text()

d3.selectAll('[id]').each(function () {
  var name = this.id
  d3.select('body').append('div').attr('class', 'select').text(name).on('click', function () {
    d3.select('canvas').selectAll('circle').attr('fill', '#' + name)
  })
})

d3.select('canvas').attr('height', innerHeight).attr('width', innerWidth)

var data = d3.range(1e3)
           .map(function (d) { return [ Math.random() * w / 2
                                      , Math.random() * h  / 2] })

var c = d3.select(pathgl('canvas') || 'svg')
        .attr('height', h)
        .attr('width', w)
        .selectAll('circle').data(data).enter().append('circle')
        .attr('cx', function (d) { return d[0] })
        .attr('cy', function (d) { return d[1] })
        .attr('r', function () { return Math.random() * 10 + 10 })
        .attr('fill', 'red')

function random_color() { return '#' + Math.floor(Math.random() * 0xffffff).toString(16) }

d3.select('canvas').on('click', function () {
  c.attr('fill', random_shader)

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

function choice () { return a[~~ (Math.random() * a.length)]}

c.attr('fill', random_shader())