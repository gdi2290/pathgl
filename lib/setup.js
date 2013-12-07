//yeah oh yeah oh yeah oooh yeah

window.onload = function () {
  fetchPage(window.location.hash.slice(1) || 'video_voronoi')
}

d3.selectAll('li').each(function () {
  this.children[0].href = '#' + this.textContent
})

d3.selectAll('li').on('click', function () {
  d3.event.preventDefault()
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
var code = CodeMirror(document.body, {
  lineNumbers: true,
  matchBrackets: true,
  value: "hello my name is adnan\n",
  mode:  "text/x-glsl",

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