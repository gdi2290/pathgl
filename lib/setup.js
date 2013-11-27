//yeah oh yeah oh yeah oooh yeah

window.onload = function () {
  window.history.replaceState('', '', '/pathgl/')
  fetchPage('video_voronoi')
}

d3.selectAll('li').on('click', function () {
  fetchPage(this.textContent.trim().toLowerCase().replace(' ', '_'))
})

function fetchPage(title) {
  d3.text('examples/' + title + '.js', function (err, data) {
    if (err) throw err
    off(d3.select('canvas'))
    eval.call(this, data)
    if (! window.location.href.match('localhost')) window.history.replaceState(0, 0, title)
  })
}

var size = {width: 960, height: 500}

function random_shader () {
  var selection = d3.selectAll('div[id]')[0].map(function (x) { return '#' + x.id })
  return selection[~~ (Math.random() * (selection.length - 1))]
}


function off (el){
  var node = el.node()
    , keys = Object.keys(node)

  keys.forEach(function (key) {

    if (key = key.match(/__on(.+)/)) console.log(key[1]), el.on(key[1], null)
  })
}