//yeah oh yeah oh yeah oooh yeah

window.onload = function () {
  window.history.replaceState('', '', '/')
  fetchPage('video_voronoi')
}

d3.selectAll('li').on('click', function () {
  fetchPage(this.textContent.trim().toLowerCase().replace(' ', '_'))
})

function fetchPage(title) {
  d3.text('/examples/' + title + '.js', function (err, data) {
    if (err) throw err
    eval(data)
    if (! window.location.href.match('localhost')) window.history.replaceState(0, 0, title)
  })
}


var size = {width: 960, height: 500}


function random_shader () {
  var selection = d3.selectAll('div[id]')[0].map(function (x) { return '#' + x.id })
  return selection[~~ (Math.random() * (selection.length - 1))]
}