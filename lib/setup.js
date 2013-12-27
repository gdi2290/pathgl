d3.selectAll('#webgl, #svg').on('change', function () {
  selector = this.id == 'webgl' ? 'canvas' : 'svg'
  cleanup()
  runCode(current_title())
})
var throttledLoadGist = _.debounce(loadGist, 350)

d3.select('.blockLoader')
.on('change', throttledLoadGist)
.on('keyup', throttledLoadGist)

var code = CodeMirror(document.querySelector('.right'), {
  matchBrackets: true
, mode:  "javascript"
, value: 'hello...'
, showCursorWhenSelecting: true
, tabSize: 8
, indentUnit: 8

, onChange: _.debounce(function (a, b) {

   try { new Function('+' + a.getValue() + '("canvas")') }
   catch (e) { console.log(e.stack)  }

   cleanup()

   injectScript('+' + a.getValue() + '("' + selector +'")')

  }, 250)
})

code.getWrapperElement().style.display = 'none'
console.log('hey! select the webgl by c.select("circle").attr("r, 1000")')

d3.select('.edit').datum({}).on('click', function (d) {
  if (d.show = ! d.show) {
    code.getWrapperElement().style.display = 'block'
    this.textContent = 'Hide Code'
    code.focus()
    code.refresh()
  } else {
    code.getWrapperElement().style.display = 'none'
    this.textContent = 'Edit Code'
  }
})

var examples = {}
  , selector = 'canvas'
  , size = { width: 960, height: 500 }

function current_title() {
  return window.location.hash.slice(1) || 'point_lighting'
}

this.onload = function () {
  runCode(current_title())

  d3.select('.examples').selectAll('li')
  .data(d3.keys(examples))
  .enter().append('li').append('a')
  .text(function (d) { return d })
  .attr('href', function (d) { return '#' + d })
  .on('click', runCode)
}

function runCode(title) {
  cleanup()
  document.title = 'Pathgl : ' + title
  code.setValue(examples[title].toString())
}

function random_shader () {
  var selection = d3.selectAll('div[id]')[0].map(function (x) { return '#' + x.id })
  return selection[~~ (Math.random() * (selection.length - 1))]
}

function off (el){
  var node = el.node()
    , keys = d3.keys(node)

  keys.forEach(function (key) {
    if (key = key.match(/__on(.+)/)) el.on(key[1], null)
  })
}

function cleanup() {
  pathgl.stop()
  d3.select('.examples').selectAll('li')
  .classed('running', function () { return current_title()  == this.textContent })
  d3.select('svg').selectAll('*').remove()
  off(window.c = d3.select('canvas'))
}

function injectScript (str) {
  d3.select('head').append('script')
  .attr('class', 'temp')
  .text(str)
}

var utils = {}
utils.toDist = function (arr, val) {
  return _.pluck(arr, val)
         .sort().reverse()
         .slice(0, 10)
         .reduce(function (a, b){ a[b] = 1 + (a[b] || (a[b] = 0)); return a }, {})
}

utils.domifyHTML = function (string) {
  var div = document.createElement('div')
  div.innerHTML = string

  if (div.childNodes.length == 1)
    return div.removeChild(div.childNodes[0])

  var fragment = document.createDocumentFragment()

  while (div.firstChild)
    fragment.appendChild(div.firstChild)

  return fragment
}

function loadGist() {
  var link = this.value
    , segments = link.split('/')
    , id = + segments.reverse().find(parseFloat)

  if (! id) return

  d3.json("https://api.github.com" + "/gists/" + id, function (err, data) {
    cleanup()
    var injection = data.files['index.html'].content
    d3.keys(data.files).forEach(function (val) {
      console.log(val)
      injection = injection.replace(val, function () {
        return data.files[val].raw_url
      })
    })

    //var frag = utils.domifyHTML(injection)
    document.body.innerHTML = injection
    d3.selectAll('script')
    .filter(function () { return ! this.classList.contains('temp') })
    .each(function () { eval(this.textContent) })
  })
}
