var compressor = require('uglify-js')
  , fs = require('fs')
  , http = require('http')
  , source = './src/'
  , main = 'main.js'
  , port = 1234

fs.watch('src', build)
build()

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

  process.emit('save_file')

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

http.createServer(function (req, res) {
  console.log('connection received')
  process.on('save_file', res.end.bind(res))
}).listen(port)
console.log('watching for file save on port ' + port)