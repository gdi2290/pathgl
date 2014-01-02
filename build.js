var compressor = require('uglify-js')
  , fs = require('fs')
  , source = './src/'
  , main = 'main.js'

build()
fs.watch('src', build)

function build(_, file) {
  var blob = [ 'start.js'
             , 'shaders.js'
             , 'init.js'
             , 'parse.js'
             , 'points.js'
             , 'lines.js'
             , 'polygons.js'
             , 'queryselector.js'
             , 'proxy.js'
             , 'render.js'
             , 'util.js'
             , 'end.js'
             ].map(read).join(';')
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

function read (file) {
  return '' + fs.readFileSync(source + file)
}
