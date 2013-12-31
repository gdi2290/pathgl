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
var front, back

function init(c) {
  canvas = c
  programs = canvas.programs = (canvas.programs || {})
  pathgl.shaderParameters.resolution = [canvas.width, canvas.height]
  gl = initContext(canvas)
  initShader(pathgl.fragment, '_identity')
  override(canvas)
  d3.select(canvas).on('mousemove.pathgl', mousemoved)
  d3.timer(drawLoop)
  front = createTarget(canvas.width, canvas.height)
  back = createTarget(canvas.width, canvas.height)
  ;(programs.point = createProgram(pointVertex, pointFragment)).name = 'point'
  ;(programs.line = createProgram(lineVertex, lineFragment)).name = 'line'
  return gl ? canvas : null
}

function mousemoved() {
  var m = d3.mouse(this)
  pathgl.mouse = [m[0] / innerWidth, m[1] / innerHeight]
}

function override(canvas) {
  return extend(canvas, {
    appendChild: appendChild
  , querySelectorAll: querySelectorAll
  , querySelector: querySelector
  , removeChild: removeChild
  , insertBefore: insertBefore

  , gl: gl
  , __scene__: []
  , __pos__: []
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

  vs = compileShader(gl.VERTEX_SHADER, vs)
  fs = compileShader(gl.FRAGMENT_SHADER, fs)

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)

  gl.deleteShader(vs)
  gl.deleteShader(fs)

  gl.linkProgram(program)
  gl.useProgram(program)

  if (! gl.getProgramParameter(program, gl.LINK_STATUS)) throw name + ': ' + gl.getProgramInfoLog(program)

  each(pathgl.shaderParameters, bindUniform)

  program.vertexPosition = gl.getAttribLocation(program, "attr")
  gl.enableVertexAttribArray(program.vertexPosition)

  return program
}

function bindUniform(val, key) {
  var loc = gl.getUniformLocation(program, key)
  ;(program['set' + key] = function (data) {
    gl['uniform' + val.length + 'fv'](loc, Array.isArray(data) ? data : [data])
  })(val)
}

function initContext(canvas) {
  var gl = canvas.getContext('webgl', { antialias: false }) || canvas.getContext('experimental-webgl')
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
;var pointVertex = [
  'precision mediump float;'
, 'attribute vec4 attr;'
, "uniform vec2 resolution;"
, 'varying vec4 stroke;'
, 'varying vec4 fill;'

, 'const float c_precision = 128.0;'
, 'const float c_precisionp1 = c_precision + 1.0;'
, 'vec4 unpack_color(float f) {'
, '    return vec4( mod(f, 1e3) / 255.'
, '               , mod(f / 1e3, 1e3) / 255.'
, '               , mod(f / 1e6, 1e3) / 255.'
, '               , mod(f, 1.));'
, '}'
, 'vec3 unpack_pos(float f) {'
, '    return vec3( mod(f / 1e12, 1e3) / resolution.x * 2. - 1.'
, '               , 1. - (mod(f / 1e8, 1e3) / resolution.y * 2.)'
, '               , mod(f, 10.) * 10.'
, '              );'
, '}'
, 'void main() {'
, '    vec3 pos = unpack_pos(attr.x);'
, '    gl_Position.xy = pos.xy;'
, '    gl_PointSize = pos.z;'

, '    fill = unpack_color(attr.y);'
, '    stroke = unpack_color(attr.z);'
, '}'
].join('\n')

var pointFragment = [
  'precision mediump float;'
, 'varying vec4 stroke;'
, 'varying vec4 fill;'
, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
, '    if (dist > 0.5) discard;'
, '    gl_FragColor = dist > .45 ? stroke : fill;'
, '}'
].join('\n')

var pointBuffer = new Float32Array(4e4)
pointBuffer.size = 0
var buff
function drawPoints(elapsed) {
  if (! pointBuffer.size) return
  if (program.name !== 'point') gl.useProgram(program = programs.point)
  //program.setstroke([1,0,0,1])

  if(! buff) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buff = gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, pointBuffer, gl.DYNAMIC_DRAW)
  } else {
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pointBuffer)
  }
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0)

  gl.drawArrays(gl.POINTS, pointBuffer.length / 4 - pointBuffer.size, pointBuffer.size)
}
;var lineVertex = [
  'precision mediump float;'
, 'attribute vec2 attr;'
, 'varying vec3 rgb;'
, 'vec3 unpack_color(float f) {'
, '    vec3 color;'
, '    color.b = mod(f, 1e3);'
, '    color.g = mod(f / 1e3, 1e3);'
, '    color.r = mod(f / 1e6, 1e3);'
, '    return (color - 100.) / 255.;'
, '}'
, 'vec3 unpack_pos(float f) {'
, '    vec3 color;'
, '    color.b = mod(f, 1e3);'
, '    color.g = mod(f / 1e3, 1e3);'
, '    color.r = mod(f / 1e6, 1e3);'
, '    return (color - 100.) / 255.;'
, '}'
, 'void main() {'
, '    gl_Position = vec4(attr.xy, 1., 1.);'
, '    rgb = vec3(.5, .5, 1.);'
, '}'
].join('\n')

var lineFragment = [
  'precision mediump float;'
, 'varying vec3 rgb;'
, 'uniform float opacity;'
, 'void main() {'
, '    gl_FragColor = vec4(rgb, 1.);'
, '}'
].join('\n')

var lineBuffer = new Float32Array(1e4)
lineBuffer.size = 0
window.lb = lineBuffer
var lb
function drawLines(){
  if (! lineBuffer.size) return
  if (program.name !== 'line') gl.useProgram(program = programs.line)

  if (! lb) {
    gl.bindBuffer(gl.ARRAY_BUFFER, lb = gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, lineBuffer, gl.DYNAMIC_DRAW)
  } else {
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineBuffer)
  }

  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.drawArrays(gl.LINES, (lineBuffer.length - (lineBuffer.size * 4)) / 2, lineBuffer.size * 2)
}
;function drawPolygons() {


};obj  = {
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

d3.scale.linear()
.domain([0, canvas.width])
.range([-1, 1])

d3.scale.linear()
.domain([0, canvas.height])
.range([1, -1])

var x  = function (x) {
  return 2 * (x / canvas.width) - 1
}

var y = function (y) {
  return 1 - ((y / canvas.height) * 2)
}

var c_packCache = {}
function packColor(fill, opacity) {
  if (c_packCache[fill])  return c_packCache[fill]
  var c = 0
  fill = d3.rgb(fill)
  c += fill.r * 1e6
  c += fill.g * 1e3
  c += fill.b
  c += opacity
  c_packCache[fill] = c
  return c
}

function packPosition (x, y, z) {
  var p = 0
  p += ~~(x) * 1e12
  p += ~~(y) * 1e8
  p += 100
  window.p  =p
  return p
}

var proto = {
  circle: { r: function (v) {
              var a = this.attr
              this.buffer[this.index - 4] = packPosition(a.cx, a.cy, a.r)
            }
          , cx: function (v) {
              var a = this.attr
              this.buffer[this.index - 4] = packPosition(a.cx, a.cy, a.r)
            }
          , cy: function (v) {
              var a = this.attr
              this.buffer[this.index - 4] = packPosition(a.cx, a.cy, a.r)
            }
          , fill: function (v) {
              this.buffer[this.index - 3] = packColor(v, .1)
            }

          , stroke: function (v) {
              this.buffer[this.index - 2] = packColor(v, .1)
            }
          , buffer: pointBuffer
          }
, ellipse: { cx: noop, cy: noop, rx: noop, ry: noop } //points
, rect: { width: buildRect, height: buildRect, x: noop, y: noop, rx: roundedCorner, ry:  roundedCorner} //point

, image: { 'xlink:href': noop, height: noop, width: noop, x: noop, y: noop } //point

, line: { x1: function (v) { this.buffer[this.index - 4] = x(v) }
        , y1: function (v) { this.buffer[this.index - 3] = y(v) }
        , x2: function (v) { this.buffer[this.index - 2] = x(v) }
        , y2: function (v) { this.buffer[this.index - 1] = y(v) }
        , buffer: lineBuffer
        }
, path: { d: buildPath, pathLength: buildPath } //lines
                                                  , polygon: { points: noop } //lines
                                                                                , polyline: { points: noop } //lines

, g: { appendChild: noop } //fake

, text: { x: noop, y: noop, dx: noop, dy: noop } //umm
}

var allCircles = new Float32Array(1e6)

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

, style: { setProperty: noop }

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

function insertBefore(node, next) {
  var scene = canvas.__scene__
    , i = scene.indexOf(next)
  reverseEach(scene.slice(i, scene.push('shit')),
              function (d, i) { scene[i] = scene[i - 1] })
}

function appendChild(el) {
  var child = Object.create(types[el.tagName.toLowerCase()].prototype)
    , buffer = child.buffer
  canvas.__scene__.push(child)

  child.attr = Object.create(attrDefaults)
  child.tagName = el.tagName
  child.parentNode = child.parentElement = this
  child.index = buffer.length - (buffer.size * 4)
  buffer.size += 1
  return child
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

  delete el.index

  el.r(0)

  //el.buffer.size -= 1
}

//keep stack of items so we can move indices

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
, opacity: .999
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
};function drawLoop(elapsed) {
  beforeRender(elapsed)

  drawPoints(elapsed)
  drawLines(elapsed)
  drawPolygons(elapsed)

  afterRender(elapsed)
  return stopRendering
}

var time1 = Date.now()
  , frames = {}

pathgl.frameCounter = frames

function countFrames(elapsed) {
  var dt = elapsed - time1
  frames[dt] = (frames[dt] || (frames[dt] = 0)) + 1
  time1 = elapsed
}

function beforeRender(elapsed) {
  // countFrames(elapsed)
  gl.colorMask(true, true, true, true)
  gl.clearColor(1,1,1,0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
  gl.disable(gl.BLEND)
  gl.enable(gl.CULL_FACE)
  gl.depthMask(false)
  gl.clearDepth(1)
  gl.enable(gl.DEPTH_TEST)
}

function afterRender() {
  gl.colorMask(false, false, false, true)
  gl.clearColor(1,1,1,1)
  gl.clear(gl.COLOR_BUFFER_BIT)
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

function buildBuffer(points) {
  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW)
  buffer.itemSize = 3
  buffer.numItems = points.length / buffer.itemSize
  return buffer
}

function createTarget( width, height ) {
  var target = {}
  target.framebuffer = gl.createFramebuffer()
  target.renderbuffer = gl.createRenderbuffer()
  target.texture = gl.createTexture()
  // set up framebuffer
  gl.bindTexture(gl.TEXTURE_2D, target.texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0)
  // set up renderbuffer
  gl.bindRenderbuffer(gl.RENDERBUFFER, target.renderbuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, target.renderbuffer)
  // clean up
  gl.bindTexture(gl.TEXTURE_2D, null )
  gl.bindRenderbuffer(gl.RENDERBUFFER, null )
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return target
}
;pathgl.shaderParameters = {
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
  //add in custom scene query selector
  return false
}

function each(obj, fn) {
  for (var key in obj) fn(obj[key], key, obj)
}

function hash(str) {
  return str.split("").reduce(function(a,b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
};  return init(canvas)
} }()