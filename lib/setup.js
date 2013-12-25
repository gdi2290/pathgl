var examples = {}
  , selector = 'canvas'
  , size = { width: 960, height: 500 }

this.onload = function () {
  runCode(window.location.hash.slice(1) || 'video_voronoi')

  d3.select('ul').selectAll('li')
  .data(d3.keys(examples))
  .enter().append('li').append('a')
  .text(function (d) { return d })
  .attr('href', function (d) { return '#' + d })
  .on('click', runCode)
}

function runCode(title) {
  cleanup()
  pathgl.stop()
  document.title = 'Pathgl : ' + title
  examples[title](selector)
}

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
var code = CodeMirror(document.body, {
  lineNumbers: true,
  matchBrackets: true,
  value: "(function (x) { var y = x * x; return x + y })(Math.random())",
  mode:  "javascript",

  indentWithTabs: true,
  tabSize: 8,
  indentUnit: 8,

  onChange: function (e) {
    console.log(1)
    //recompile
  }
})

code.getWrapperElement().style.display = 'none'

d3.select('.edit').datum({}).on('click', function (d) {
  if (d.show = ! d.show) {
    code.getWrapperElement().style.display = ''
    this.textContent = 'Hide Code'
  } else {
    code.getWrapperElement().style.display = 'none'
    this.textContent = 'Edit Code'
  }
})

function cleanup () {
  d3.select('svg').selectAll('*').remove()
  off(window.c = d3.select('canvas'))
}

d3.select('select').on('change', function () {
  (selector = this.value == 'webgl' ? 'canvas' : 'svg')
  cleanup()
  window.onload()
})

console.log('hey! select the webgl by c.select("circle").attr("r, 1000")')