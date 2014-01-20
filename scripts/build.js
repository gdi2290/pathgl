var compressor = require('uglify-js')
  , fs = require('fs')
  , http = require('http')
  , source = './src/'
  , main = 'main.js'
  , port = 1234

build()
fs.watch('src', build)
http.createServer(live_reloader).listen(port)
console.log('watching for file save on port ' + port)

;['src', 'examples', 'lib']
.filter(function (name) { return fs.statSync(name).isDirectory() })
.forEach(function (dir) {
  fs.readdirSync(dir).forEach(function (name) {
    var count = 0
    fs.watch(dir + '/' + name, function (type) { (++count % 2) || process.emit('write_file') })
  })
})

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

function live_reloader(req, res) {
  console.log('connection received')
  process.once('write_file', function () { res.end() })
}