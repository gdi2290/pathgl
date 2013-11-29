//yeah oh yeah oh yeah oooh yeah

window.onload = function () {
  fetchPage(window.location.hash.slice(1) || 'video_voronoi')
}

d3.selectAll('li').on('click', function () {
  fetchPage(this.textContent.trim().toLowerCase().replace(' ', '_'))
})

function fetchPage(title) {
  window.location.hash = title
  d3.text('examples/' + title + '.js')
  .on('load', runCode)
  .on('error', function (err) { throw err }).get()

}

function runCode(code) {
  off(d3.select('canvas'))
  pathgl.stop()
  eval.call(this, code)
}

var size = { width: 960, height: 500 }

function random_shader () {
  var selection = d3.selectAll('div[id]')[0].map(function (x) { return '#' + x.id })
  return selection[~~ (Math.random() * (selection.length - 1))]
}

function off (el){
  var node = el.node()
    , keys = Object.keys(node)

  keys.forEach(function (key) {
    if (key = key.match(/__on(.+)/)) el.on(key[1], null)
  })
}