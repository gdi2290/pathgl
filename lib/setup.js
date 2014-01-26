var examples = {}
  , docs = {}
  , selector = 'canvas'
  , isDesktop = innerWidth > 1000
  , size = { width: innerWidth * (isDesktop ? .85 : 1)
           , height: innerHeight * (1)
           }


d3.select(window).on('load', loaded)

function loaded () {
  var code = initCodeMirror()
  if (current_title()) runCode(current_title())

  console.log('hey! select the webgl by c.selectAll("circle").attr("fill", "pink")')

  d3.selectAll('#webgl, #svg').on('change', function () {
    selector = this.id == 'webgl' ? 'canvas' : 'svg'
    cleanup()
    runCode(current_title())
  })

  d3.selectAll('li')
  .on('click', runCode)
  .on('click.scroll', function () { document.body.scrollTop = document.querySelector('.right').offsetTop
})

  var throttledLoadGist = _.debounce(loadGist, 350)

  d3.select('.blockLoader')
  .on('change', throttledLoadGist)
  .on('keyup', throttledLoadGist)

  location.hostname == 'localhost' &&
    d3.json('http://' + location.hostname + ':' + '1234', function ( ){
      window.location.reload()
    })

  function runCode(title) {
    title = title || this.children[0].hash.slice(1)
    d3.select('.blockDisplay').html(null)
    cleanup()
    document.title = 'Pathgl : ' + title
    examples[title] && code.setValue(examples[title].toString())
    docs[title] && docs[title]()

    d3.selectAll('a').classed('running', function () { return title  ==  this.hash.slice(1) })
  }
}

function initCodeMirror () {
  var code =
    CodeMirror(document.querySelector('body'), {
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

  return code
}


function current_title() {
  return window.location.hash.slice(1)
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
  d3.select('svg').selectAll('*').remove()
  off(window.c = d3.select('canvas'))

  d3.select('.blurb').text(null)
}

function injectScript (str) {
  d3.select('head').append('script')
                                    .attr('class', 'temp')
   .text(str)
}

var utils = {}
utils.toDist = function (arr, val) {
                return (val ? _.pluck(arr, val) : arr)
                                .sort().reverse()
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

d3._tsv = d3.tsv
          d3._csv = d3.csv
          d3._json = d3.json
function loadGist() {
  var link = this.value
         , segments = link.split('/')
         , id = + segments.reverse().find(parseFloat)

  if (! id) return

  var files  = {}

  d3.json = function (url, cb) {
              if (url in files) cb(null, JSON.parse(files[url].content))
              else d3._json.apply(0, arguments)
            }

  d3.tsv = function (url, accessor, cb) {
            if (arguments.length == 2) (cb = accessor), (accessor = null)
            if (url in files) cb(null, d3.tsv.parse(files[url].content, accessor))
            else d3._tsv.apply(0, arguments)
          }

  d3.csv = function (url, accessor, cb) {
        if (arguments.length == 2) (cb = accessor), (accessor = null)
        if (url in files) cb(null, d3.csv.parse(files[url].content, accessor))
        else d3._csv.apply(0, arguments)
      }

  _.extend(d3.tsv, d3._tsv)
  _.extend(d3.csv, d3._csv)

      d3.json("https://api.github.com" + "/gists/" + id, function (err, data) {
                   cleanup()
                   files = data.files
                   var injection =
                     files['index.html'].content.replace('append("svg")', 'select("canvas").call(pathgl)')

                   //var frag = utils.domifyHTML(injection)
                   d3.select('.blockDisplay').html(injection)
.selectAll('script')
.filter(function () { return ! this.classList.contains('temp') })
.each(function () { eval(this.textContent) })
                 })
}
