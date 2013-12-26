! function() {
pathgl.shaderParameters = {
  rgb: [0, 0, 0, 0]
, translate: [0, 0]
, time: [0]
, rotation: [0, 1]
, opacity: [1]
, resolution: [0, 0]
, scale: [1, 1]
, stroke: [0]
, mouse: pathgl.mouse = [0, 0]
}

pathgl.fragment = [ "precision mediump float;"
                  , "uniform vec4 rgb;"
                  , "uniform float time;"
                  , "uniform float opacity;"
                  , "uniform vec2 resolution;"

                  , "void main(void) {"
                  , "  gl_FragColor = vec4(rgb.xyz, opacity);"
                  , "}"
                  ].join('\n')

pathgl.vertex = [ "precision mediump float;"
                , "attribute vec3 attr;"
                , "attribute vec3 testvert;"
                , "uniform vec2 translate;"
                , "uniform vec2 resolution;"
                , "uniform vec2 rotation;"
                , "uniform vec2 scale;"

                , "void main(void) {"

                , "vec3 pos = attr;"
                , "pos.y = resolution.y - pos.y;"

                , "vec3 scaled_position = pos * vec3(scale, 1.0);"

                , "vec2 rotated_position = vec2(scaled_position.x * rotation.y + scaled_position.y * rotation.x, "
                + "scaled_position.y * rotation.y - scaled_position.x * rotation.x);"

                , "vec2 position = vec2(rotated_position.x + translate.x, rotated_position.y - translate.y);"

                , "vec2 zeroToOne = position / resolution;"
                , "vec2 zeroToTwo = zeroToOne * 2.0;"
                , "vec2 clipSpace = zeroToTwo - 1.0;"

                , "gl_Position = vec4(clipSpace, 1, 1);"

                , "}"
                ].join('\n')
;this.pathgl = pathgl

pathgl.stop = d3.functor()

function pathgl(canvas) {
  var gl, program, programs

  canvas = 'string' == typeof canvas ? document.querySelector(canvas) :
    canvas instanceof d3.selection ? canvas.node() :
    canvas

  if (! canvas.getContext) return console.log(canvas, 'is not a valid canvas')
;var stopRendering = false

pathgl.stop = function () { stopRendering = true }

function init(c) {
  canvas = c
  programs = canvas.programs = (canvas.programs || {})
  pathgl.shaderParameters.resolution = [canvas.width, canvas.height]
  gl = initContext(canvas)
  initShader(pathgl.fragment, '_identity')
  override(canvas)
  d3.select(canvas).on('mousemove.pathgl', mousemoved)
  d3.timer(drawLoop)
  extend(programs.circle = createProgram(circleVertex, circleFragment), {name : 'circle'})
  return gl ? canvas : null
}

function mousemoved() {
  var m = d3.mouse(this)
  pathgl.mouse = [m[0] / innerWidth, m[1] / innerHeight]
}

function override(canvas) {
  var scene = []
  return extend(canvas, {
    appendChild: appendChild
  , querySelectorAll: querySelectorAll
  , querySelector: querySelector
  , removeChild: removeChild
  , insertBefore: insertBefore

  , gl: gl
  , __scene__: scene
  , __pos__: []
  , __id__: 0
  , __program__: void 0
  })
}

function compileShader (type, src) {
  var shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw src + ' ' + gl.getShaderInfoLog(shader)
  return shader
}

function initShader(_, name) {
  return program = (programs[name] ?
                    programs[name] :
                    programs[name] = createProgram(pathgl.vertex, _))
}

function createProgram(vs, fs) {
  program = gl.createProgram()

  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vs))
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fs))

  gl.linkProgram(program)
  gl.useProgram(program)

  if (! gl.getProgramParameter(program, gl.LINK_STATUS)) throw name + ': ' + gl.getProgramInfoLog(program)

  each(pathgl.shaderParameters, bindUniform)

  program.vertexPosition = gl.getAttribLocation(program, "attr")
  gl.enableVertexAttribArray(program.vertexPosition)

  program.testvert = gl.getAttribLocation(program, "testvert")
  //gl.enableVertexAttribArray(program.testvert)

  program.name = name
  return program
}

function bindUniform(val, key) {
  var loc = gl.getUniformLocation(program, key)
  ;(program['set' + key] = function (data) {
    gl['uniform' + val.length + 'fv'](loc, Array.isArray(data) ? data : [data])
  })(val)
}

function initContext(canvas) {
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  return gl && extend(gl, { viewportWidth: canvas.width, viewportHeight: canvas.height })
}
;  var methods = { m: moveTo
                , z: closePath
                , l: lineTo

                , h: horizontalLine
                , v: verticalLine
                , c: curveTo
                , s: shortCurveTo
                , q: quadraticBezier
                , t: smoothQuadraticBezier
                , a: elipticalArc
                }

function horizontalLine() {}
function verticalLine() {}
function curveTo() {}
function shortCurveTo() {}
function quadraticBezier() {}
function smoothQuadraticBezier () {}
function elipticalArc(){}

function group(coords) {
  var s = []
  twoEach(coords, function (a, b) { s.push([a, b, 0]) })
  return s
}

function parse (str) {
  var path = addToBuffer(this)

  if (path.length) return render()

  str.match(/[a-z][^a-z]*/ig).forEach(function (segment, i, match) {
    var instruction = methods[segment[0].toLowerCase()]
      , coords = segment.slice(1).trim().split(/,| /g)

    ;[].push.apply(path.coords, group(coords))
    if (! instruction) return
    if (instruction.name == 'closePath' && match[i+1]) return instruction.call(path, match[i+1])

    if ('function' == typeof instruction)
      coords.length == 1 ? instruction.call(path) : twoEach(coords, instruction, path)
    else
      console.error(instruction + ' ' + segment[0] + ' is not yet implemented')
  })
  var buff = toBuffer(this.path.coords)
  this.path.length = 0
  this.path.push(buff)
}

function moveTo(x, y) {
  pos = [x, y]
}

var subpathStart
function closePath(next) {
  subpathStart = pos
  lineTo.apply(this, /m/i.test(next) ? next.slice(1).trim().split(/,| /g) : this.coords[0])
}

function lineTo(x, y) {
  this.push(x, y, 0)
}
;var k = {
  points:[]
, lineStrokes: []
, lineFills: []
}

obj  = {
  schema: ['cx', 'cy', 'r', 'rgba']
, index: 1

, buffer: []
, getIndex: function (n) {
    var i = this.schema.indexOf(n)
    return ~i && this.index + i
  }
, setAttribute: function (n, v) {
    this.getIndex(n)
    this.buffer[n] = v
  }

, getAttribute: function (n) {
    return this.buffer[this.index + this.schema.indexOf(n)]
  }
}

//2
//flat scene
//tree
//-> buffers

//12 fill
//12 stroke

//9999.99, 9999.99
//9999.99, 9999.99
//12 w, h
//12 x, y
//12 rx ,ry
var proto = {
  circle: { r: noop, cx: noop, cy: noop, render: renderCircles } //points
, ellipse: { cx: buildEllipse, cy: buildEllipse, rx: buildEllipse, ry: buildEllipse } //points
, rect: { width: buildRect, height: buildRect, x: noop, y: noop, rx: roundedCorner, ry:  roundedCorner} //point

, image: { 'xlink:href': noop, height: rectPoints, width: rectPoints, x: noop, y: noop } //point

, line: { x1: buildLine, y1: buildLine, x2: buildLine, y2: buildLine } //line
, path: { d: buildPath, pathLength: buildPath } //lines
, polygon: { points: points } //lines
, polyline: { points: points } //lines

, g: { appendChild: noop } //fake

, text: { x: noop, y: noop, dx: noop, dy: noop } //umm
}

var allCircles = new Float32Array(1e6)

function renderCircles() {
  gl.circlesToRender = true
}

var baseProto = extend(Object.create(null), {
  querySelectorAll: noop
, querySelector: noop
, createElementNS: noop
, insertBefore: noop
, ownerDocument: { createElementNS: noop }
, render: function render(node) {
  this.buffer && drawFill(this)
  drawStroke(this)
}
, nextSibling: function () { canvas.scene[canvas.__scene__.indexOf()  + 1] }

, fill: function (val) {
    isId(val) && initShader(d3.select(val).text(), val)
  }

, transform: function (d) {
    var parse = d3.transform(d)
      , radians = parse.rotate * Math.PI / 180

    if (parse.rotate) delete parse.translate//fixme

    extend(this.attr, parse, { rotation: [ Math.sin(radians), Math.cos(radians) ] })
  }

, stroke: function (val) {
    isId(val) && initShader(d3.select(val).text(), val)
  }

, getAttribute: function (name) {
    return this.attr[name]
  }

, setAttribute: function (name, value) {
    this.attr[name] = value
    this[name] && this[name](value)
  }

, removeAttribute: function (name) {
    delete this.attr[name]
  }

, textContent: noop
, removeEventListener: noop
, addEventListener: event
})

var roundedCorner = noop

var types = [
  function circle () {}
, function rect() {}
, function path() {}
, function ellipse() {}
, function line() {}
, function path() {}
, function polygon() {}
, function polyline() {}
, function rect() {}

, function image() {}
, function text() {}
, function g() {}
, function use() {}
].reduce(function (a, type) {
              a[type.name] = type
              type.prototype = extend(Object.create(baseProto), proto[type.name])
              return a
            }, {})

function buildCircle () {
  var a = [], r = this.attr.r
  for (var i = 0; i < 361; i+=18)
    a.push(50 + r * Math.cos(i * Math.PI / 180),
           50 + r * Math.sin(i * Math.PI / 180),
           0)
  this.path = [this.buffer = toBuffer(a)]
}

function buildRect() {
  if (! this.attr.width && this.attr.height) return
  addToBuffer(this)
  this.path.coords = rectPoints(this.attr.width, this.attr.height)
  extend(this.path, [buildBuffer(this.path.coords)])
  this.buffer = buildBuffer(this.path.coords)
}

function buildLine () {}
function buildPath () {
  parse.call(this, this.attr.d)
  this.buffer = toBuffer(this.path.coords)
}
function points () {}
function buildEllipse() {
  return;
  var a = []
  for (var i = 0; i < 361; i+=18)
    a.push(50 + r * Math.cos(i * Math.PI / 180),
           50 + r * Math.sin(i * Math.PI / 180),
           0)
  return a
}

function rectPoints(w, h) {
  return [0,0,0,
          0,h,0,
          w,h,0,
          w,0,0,
         ]
}

function insertBefore(node, next) {
  var scene = canvas.__scene__
    , i = scene.indexOf(next)
  reverseEach(scene.slice(i, scene.push('shit')),
              function (d, i) { scene[i] = scene[i - 1] })
}

function appendChild(el) {
  var self = Object.create(types[el.tagName.toLowerCase()].prototype)
  canvas.__scene__.push(self)

  self.attr = Object.create(attrDefaults)
  self.tagName = el.tagName
  self.parentNode = self.parentElement = this
  return self
}

function querySelector(query) {
  return this.querySelectorAll(query)[0]
}

function querySelectorAll(query) {
  return this.__scene__.filter(function (node) { return node.tagName.toLowerCase() === query })
}

function removeChild(el) {
  var i = this.__scene__.indexOf(el)
  this.__scene__.splice(i, 1)
}

var attrDefaults = {
  rotation: [0, 1]
, translate: [0, 0]
, scale: [1, 1]
, fill: 0
, stroke: 0
, 'stroke-width': 2
, cx: 0
, cy: 0
, x: 0
, y: 0
, opacity: 1
}

var e = {}
//keep track of what element is being hovered over
function event (type, listener) {
  if (! e[type]) {
    d3.select('canvas').on(type, function () {
      this.__scene__.filter(function () {
        //check what shape cursor is on top of
        //if the id is in e[type], dispatch listener
      })
    })
    e[type] = []
  }
  e[type].push(this.id)
};//render points
//render lines
//render linefills
var time1 = Date.now()
var frames = {}
pathgl.frameCounter = frames
function drawLoop(elapsed) {
  var dt = elapsed - time1
  frames[dt] = (frames[dt] || (frames[dt] = 0)) + 1
  time1 = elapsed

  each(programs, function (program, key) {
    gl.useProgram(program)
    program.settime(pathgl.time = elapsed / 1000)
    program.setmouse(pathgl.mouse)
  })

  beforeRender()
  canvas.__scene__.forEach(function (node) { })
  drawPoints(elapsed)
  drawStrokes(elapsed)
  drawPolygons(elapsed)
  afterRender()

  return stopRendering && ! gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}

function beforeRender() {
  gl.colorMask(true, true, true, true);
  gl.depthMask(true);
  gl.clearColor(1,1,1,0);
  gl.clearDepth(1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  // gl.enable(gl.CULL_FACE);
  //gl.enable(gl.DEPTH_TEST);
}
function afterRender() {
  gl.colorMask(false, false, false, true);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}


function addToBuffer(datum) {
  return extend(datum.path = [], { coords: [], id: datum.id })
}

function applyTransforms(node) {
  gl.uniform2f(program.translate, node.attr.translate[0] + node.attr.cx + node.attr.x,
               node.attr.translate[1] + node.attr.cy + node.attr.y)
  gl.uniform2f(program.scale, node.attr.scale[0], node.attr.scale[1])
  gl.uniform2f(program.rotation, node.attr.rotation[0], node.attr.rotation[1])
  gl.uniform1f(program.opacity, node.attr.opacity)
}

function drawBuffer(buffer, type) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(program.vertexPosition, buffer.itemSize, gl.FLOAT, false, 0, 0)
  gl.drawArrays(type, 0, buffer.numItems)
}

function swapProgram(name) {
  gl.useProgram(program = programs[name])
  program.vertexPosition = gl.getAttribLocation(program, "attr")
  gl.enableVertexAttribArray(program.vertexPosition)
}

function drawFill(node) {
  swapProgram(isId(node.attr.fill) ? node.attr.fill : '_identity')
  applyTransforms(node)
  setDrawColor(d3.rgb(node.attr.fill))
  drawBuffer(node.buffer, gl.TRIANGLE_FAN)
}

function drawStroke(node) {
  gl.lineWidth(node.attr['stroke-width'])
  swapProgram(isId(node.attr.stroke) ? node.attr.stroke : '_identity')
  applyTransforms(node)
  setDrawColor(d3.rgb(node.attr.stroke))
  if (node.path)
    for (var i = 0; i < node.path.length; i++)
      drawBuffer(node.path[i], gl.LINE_LOOP)
}

function setDrawColor (c) {
  gl.uniform4f(program.rgb,
               c.r / 256,
               c.g / 256,
               c.b / 256,
               1.0)
}

//subData
function buildBuffer(points) {
  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW)
  buffer.itemSize = 3
  buffer.numItems = points.length / buffer.itemSize
  return buffer
}

function toBuffer (array) {
  return buildBuffer(flatten(array))
}
;var circleVertex = [
  'precision mediump float;'
, 'attribute vec4 attr;'
, 'attribute vec4 testvert;'
, 'uniform vec2 resolution;'
, 'varying vec3 rgb;'
, 'vec3 parse_color(float f) {'
, '    vec3 color;'
, '    color.b = mod(f, 1e3);'
, '    color.g = mod(f / 1e3, 1e3);'
, '    color.r = mod(f / 1e6, 1e3);'
, '    return(color - 100.) / 255.;'
, '}'

, 'void main() {'
, '    vec2 normalize = attr.xy / resolution;'
, '    vec2 clipSpace = (normalize * 2.0) - 1.0;'
, '    gl_Position = vec4(clipSpace, 1, 1);'
, '    gl_PointSize = attr.z * 2.;'
, '    rgb = parse_color(attr.w);'
, '}'
].join('\n')

var circleFragment = [
  'precision mediump float;'
, 'varying vec3 rgb;'
, 'uniform vec4 vstroke;'
, 'uniform float opacity;'
, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
, '    if (dist > 0.5) discard;'
, '    gl_FragColor = dist > 0.5 ? vstroke : vec4(rgb, opacity);'
, '}'
].join('\n')

var vbo = canvas.vbo
var packCache = {}
function packRgb(fill) {
  return + (packCache[fill] ||
            (packCache[fill] = d3.values(d3.rgb(fill)).slice(0, 3).map(function (d){ return d + 100 }).join('')))
}

function drawPoints(elapsed) {
  var models = canvas.__scene__
                   .filter(function (d) { return d instanceof types['circle'] })
                   .map(function (d) { return d.attr  })

  if (program.name !== 'circle') gl.useProgram(prog = programs.circle)

  var c, buffer = (vbo = new Float32Array(models.length * 4))

  program.setstroke([0,0,0,0])

  for(var i = 0; i < models.length;) {
    var j = i * 4
    c = models[i++]
    buffer[j++] = c.cx
    buffer[j++] = c.cy
    buffer[j++] = c.r
    buffer[j++] = packRgb(c.fill)
  }

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, vbo, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0)
  //gl.enableVertexAttribArray(0);
  gl.drawArrays(gl.POINTS, 0, models.length)
  // var buffer2 = new Float32Array(models.length * 4)
  // for(var i = 0; i < models.length;) {
  //   var j = i * 4
  //   c = models[i++]
  //   buffer2[j++] = c.cy
  //   buffer2[j++] = c.cx
  //   buffer2[j++] = Math.random() * 51
  //   buffer2[j++] = packRgb(c.fill)
  // }

	// gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  // gl.bufferData(gl.ARRAY_BUFFER, buffer2, gl.DYNAMIC_DRAW)
  // gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0)
  // gl.drawArrays(gl.POINTS, 0, models.length)
}

//vbo && vbo.length != models.length ? vbo :
;function drawStrokes(){};function drawPolygons() {


};pathgl.shaderParameters = {
  rgb: [0, 0, 0, 0]
, translate: [0, 0]
, time: [0]
, rotation: [0, 1]
, opacity: [1]
, resolution: [0, 0]
, scale: [1, 1]
, stroke: [0]
, mouse: pathgl.mouse = [0, 0]
}

pathgl.fragment = [ "precision mediump float;"
                  , "uniform vec4 rgb;"
                  , "uniform float time;"
                  , "uniform float opacity;"
                  , "uniform vec2 resolution;"

                  , "void main(void) {"
                  , "  gl_FragColor = vec4(rgb.xyz, opacity);"
                  , "}"
                  ].join('\n')

pathgl.vertex = [ "precision mediump float;"
                , "attribute vec3 attr;"
                , "attribute vec3 testvert;"
                , "uniform vec2 translate;"
                , "uniform vec2 resolution;"
                , "uniform vec2 rotation;"
                , "uniform vec2 scale;"

                , "void main(void) {"

                , "vec3 pos = attr;"
                , "pos.y = resolution.y - pos.y;"

                , "vec3 scaled_position = pos * vec3(scale, 1.0);"

                , "vec2 rotated_position = vec2(scaled_position.x * rotation.y + scaled_position.y * rotation.x, "
                + "scaled_position.y * rotation.y - scaled_position.x * rotation.x);"

                , "vec2 position = vec2(rotated_position.x + translate.x, rotated_position.y - translate.y);"

                , "vec2 zeroToOne = position / resolution;"
                , "vec2 zeroToTwo = zeroToOne * 2.0;"
                , "vec2 clipSpace = zeroToTwo - 1.0;"

                , "gl_Position = vec4(clipSpace, 1, 1);"

                , "}"
                ].join('\n')
;function noop () {}

function extend (a, b) {
  if (arguments.length > 2) [].forEach.call(arguments, function (b) { extend(a, b) })
  else for (var k in b) a[k] = b[k]
  return a
}

function twoEach(list, fn, gl) {
  var l = list.length - 1, i = 0
  while(i < l) fn.call(gl, list[i++], list[i++])
}

function flatten(input) {
  return input.reduce(function (a, b) { return (b && b.map ? [].push.apply(a, b) : a.push(b)) && a },
                      [])
}

function isId(str) {
  return str[0] == '#' && isNaN(parseInt(str.slice(1), 16))
}

function each(obj, fn) {
  for (var key in obj) fn(obj[key], key, obj)
}

function hash(str) {
  return str.split("").reduce(function(a,b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
};  return init(canvas)
} }()