var compressor = require('uglify-js')
  , fs = require('fs')
  , source = './src/'
  , main = 'main.js'

Array.prototype.tap = function (fn) {
  fn.call(this)
  return this
}

build()
fs.watch('src', build)

function build(_, file) {
  var blob = [ 'start.js'
             , 'init.js'
             , 'shaders.js'
             , 'parse.js'
             , 'points.js'
             , 'lines.js'
             , 'polygons.js'
             , 'queryselector.js'
             , 'proxy.js'
             , 'render.js'
             , 'util.js'
             , 'end.js'
             ].map(concat).join(';')
    , closed = '! function() {\n' + blob + ' }()'

  console.log('rebuilding ' + (file ? file : ''))

  try {
    if (! fs.existsSync('dist/')) fs.mkdirSync('dist/')
    fs.writeFileSync('dist/pathgl.js', closed)
    fs.writeFileSync('dist/pathgl.min.js',
                     compressor.minify(closed, { fromString: true }).code
                    )
  } catch (e) { console.log(e) }

}

function concat (file) {
  return '' + fs.readFileSync(source + file)
}


function emacs(file) {
  return ! /#/.test(file)
}

function head () {
  var i = this.indexOf(main)
  var js = this[i]
  this[i] = this[0]
  this[0] = js
}