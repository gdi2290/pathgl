var examples = {}
  , docs = {}
  , selector = 'canvas'
  , isDesktop = innerWidth > 1000
  , size = { width: innerWidth * (isDesktop ? .85 : 1)
           , height: innerHeight * (1)
           }

d3.select(window).on('load', loaded)

function loaded () {
  if (current_title()) runCode(current_title())

  console.log('hey! select the webgl by c.selectAll("circle").attr("fill", "pink")')

  d3.selectAll('#webgl, #svg').on('change', function () {
    selector = this.id == 'webgl' ? 'canvas' : 'svg'
    cleanup()
    runCode(current_title())
  })

  d3.selectAll('li')
  .on('click', runCode)
  .on('click.scroll', function () { document.querySelector('body').scrollTop = document.querySelector('.right').offsetTop
})

  location.hostname == 'localhost' &&
    d3.json('http://' + location.hostname + ':' + '1234', function ( ){
      window.location.reload()
    })

  function runCode(title) {
    title = title || this.children[0].hash.slice(1)
    d3.select('.blockDisplay').html(null)
    cleanup()
    document.title = 'Pathgl : ' + title
    //examples[title] && code.setValue(examples[title].toString())
    examples[title] && injectScript('+' + examples[title].toString() + '("' + selector +'")')
    docs[title] && docs[title]()

    d3.selectAll('a').classed('running', function () { return title  ==  this.hash.slice(1) })
  }
}

function current_title() {
  return window.location.hash.slice(1)
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

var utils = {}
utils.toDist = function (arr, val) {
  return (val ? _.pluck(arr, val) : arr)
         .sort().reverse()
         .reduce(function (a, b){ a[b] = 1 + (a[b] || (a[b] = 0)); return a }, {})
}
