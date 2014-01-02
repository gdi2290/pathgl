! function() {
this.pathgl = pathgl

pathgl.stop = d3.functor()

function pathgl(canvas) {
  var gl, program, programs

  canvas = 'string' == typeof canvas ? document.querySelector(canvas) :
    canvas instanceof d3.selection ? canvas.node() :
    canvas

  if (! canvas.getContext) return console.log(canvas, 'is not a valid canvas')
;var stopRendering = false
var colorBuffer = new Float32Array(4 * 1e4)

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

pathgl.stop = function () { stopRendering = true }
function init(c) {
  canvas = c
  programs = canvas.programs = (canvas.programs || {})
  pathgl.shaderParameters.resolution = [canvas.width, canvas.height]
  gl = initContext(canvas)
  monkeyPatch(canvas)
  bindEvents(canvas)
  flags(canvas)
  d3.timer(drawLoop)
  ;(programs.point = createProgram(pointVertex, pointFragment)).name = 'point'
  ;(programs.line = createProgram(lineVertex, lineFragment)).name = 'line'
  return gl ? canvas : null
}

function flags () {
  gl.disable(gl.SCISSOR_TEST)
  gl.colorMask(true, true, true, true)
  gl.stencilMask(1,1,1,1)
  gl.disable(gl.BLEND)
  gl.enable(gl.CULL_FACE)
}

function bindEvents(canvas) {
  d3.select(canvas).on('mousemove.pathgl', mousemoved)
}

function mousemoved() {
  var m = d3.mouse(this)
  pathgl.mouse = [m[0] / innerWidth, m[1] / innerHeight]
}

function monkeyPatch(canvas) {
  return extend(canvas, {
    appendChild: appendChild
  , querySelectorAll: querySelectorAll
  , querySelector: function (s) { return this.querySelectorAll(s)[0] }
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


  program.vPos = gl.getAttribLocation(program, "pos")
  gl.enableVertexAttribArray(program.vPos)

  program.vfill = gl.getAttribLocation(program, "fill")
  gl.enableVertexAttribArray(program.vFill)

  program.vStroke = gl.getAttribLocation(program, "stroke")
  gl.enableVertexAttribArray(program.vStroke)

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
, 'attribute vec4 pos;'
, 'attribute vec4 fill;'
, 'attribute vec4 stroke;'

, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'

, 'void main() {'
, '    gl_Position.xy = pos.xy;'
, '    gl_PointSize = pos.z * 2.;'

, '    v_fill = fill;'
, '    v_stroke = stroke;'
, '}'
].join('\n')

var pointFragment = [
  'precision mediump float;'
, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'
, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
, '    if (dist > 0.5) discard;'
, '    gl_FragColor = dist > .4 ? v_stroke : v_fill;'
, '}'
].join('\n')

var pointBuffer = new Uint16Array(4 * 1e4)
var pointPosBuffer = new Float32Array(4 * 1e4)
pointBuffer.count = 0

var buff
var points = {
    pos: {
      buffer: 0
    , vLoc: 0
    ,
    }
  , fill: {}
  , stroke: {}
}

function drawPoints(elapsed) {
  if (! pointBuffer.count) return
  if (program.name !== 'point') gl.useProgram(program = programs.point)

  // for(var attr in pointAttr) {
  //   gl.bindBuffer(gl.ARRAY_BUFFER, points[attr].buffer)
  //   gl.enableVertexAttribArray(points[attr].vLoc)
  //   if (points[attr].changed) gl.bufferSubData(gl.ARRAY_BUFFER, points[attr].list, gl.DYNAMIC_DRAW)
  //   gl.vertexAttribPointer(points[attr].vLoc, points[attr].length, gl.FLOAT, false, 0, 0)
  // }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.enableVertexAttribArray(program.vPos)
  gl.bufferData(gl.ARRAY_BUFFER, pointPosBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vPos, 4, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.enableVertexAttribArray(program.vStroke)
  gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vStroke, 4, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.enableVertexAttribArray(program.vFill)
  gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vFill, 4, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pointBuffer, gl.DYNAMIC_DRAW)
  gl.drawElements(gl.POINTS, 4e4, gl.UNSIGNED_SHORT, 0)
}
;var lineVertex = [
  'precision mediump float;'
, 'attribute vec2 pos;'
, 'attribute vec4 stroke;'
, 'varying vec4 v_stroke;'
, 'void main() {'
, '    gl_Position.xy = pos;'
, '    v_stroke = stroke;'
, '}'
].join('\n')

var lineFragment = [
  'precision mediump float;'
, 'varying vec4 v_stroke;'
, 'void main() {'
, '    gl_FragColor = v_stroke;'
, '}'
].join('\n')

var lineBuffer = new Uint16Array(4 * 1e4)
var linePosBuffer = new Float32Array(4 * 1e4)
lineBuffer.size = 0

var lb
function drawLines(){
return
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


};function querySelectorAll(selector, r) {
  return selector.replace(/^\s+|\s*([,\s\+\~>]|$)\s*/g, '$1').split(',')
  .forEach(function (s) { query(s, this).forEach(push.bind(r)) }, this, r = []) || uniq(r)
}

function query(selector, root) {
  var symbols = selector.split(/[\s\>\+\~](?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/)
    , dividedTokens = selector.match(/([\s\>\+\~])(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/)
    , last = chunk(symbols.pop()), right = [], left = [], item

  byTagName.call(root, last[1] || '*').forEach(function (d) { if (item = checkRight.apply(d, last)) right.push(item) })
  return symbols.length ? right.forEach(function (e) { if (leftCheck(e, symbols, dividedTokens)) left.push(e) }) || left : right
}

function leftCheck(doc, symbols, divided, cand) {
  return cand = function recur(e, i, p) {
    while (p = combinators[divided[i]](p, e))
      if (checkRight.apply(p, chunk(symbols[i]))) {
        if (i) if (cand = recur(p, i - 1, p)) return cand
        else return p
      }
  }(doc, symbols.length - 1, doc)
}

function checkRight(_, tag, classId, attribute, attr, attrCmp, attrVal, _, pseudo, _, pseudoVal, m) {
  return pseudo && pseudos[pseudo] && !pseudos[pseudo](this, pseudoVal)
      || tag && tag !== '*' && this.tag && this.tag.toLowerCase() !== tag
      || attribute && !checkAttr(attrCmp, this[attr] || '', attrVal)
      || classId && (m = classId.match(/#([\w\-]+)/)) && m[1] !== this.id
      || classId && (classId.match(/\.[\w\-]+/g) || []).some(matchClass.bind(this)) ? 0 : this
}

function checkAttr(cmp, actual, val) {
  return actual.match(RegExp({ '='  : val
                             , '^=' : '^' + clean(val)
                             , '$=' : clean(val) + '$'
                             , '*=' : clean(val)
                             , '~=' : '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)'
                             , '|=' : '^' + clean(val) + '(-|$)'
                             }[cmp] || 'adnan^'))
}

function push(d) { return this.push(d) }
function chunk(query) { return query.match(chunker) }
function byId(id) { return querySelectorAll('[id="' + id + '"]')[0] }
function isNode(el) { return el && typeof el === 'object' }
function previous(n) { while (n = n.previousSibling()) if (n.top) return n }
function clean(s) { return s.replace(/([.*+?\^=!:${}()|\[\]\/\\])/, '\\$1') }
function uniq(ar) { return ar.filter(function (d, i) { return ar.indexOf(d) == i }) }
function matchClass(d) { return ! RegExp('(^|\\s+)' + d.slice(1) + '(\\s+|$)').test(this.className) }
function flatten(ar) { return ar.reduce(function (a, b) { return a.concat(b.map ? flatten(b) : b) }) }
function byClassName(name) { return traverse(this, function (doc) { return doc.className == name }, []) }
function byTagName(name) { return traverse(this, function (doc) { return name == '*' || doc.name == name }, []) }
function traverse(node, fn, val) { return (node.__scene__ || node.children).forEach(function (node) { traverse(node, fn, val), fn(node) && val.push(node) }) || val }

var pseudos = {} //todo

var combinators = { ' ': function (d) { return d && d !== __scene__ && d.parent() }
                  , '>': function (d, maybe) { return d && d.parent() == maybe.parent() && d.parent() }
                  , '~': function (d) { return d && d.previousSibling() }
                  , '+': function (d, ct, p1, p2) { return ! d || ((p1 = previous(d)) && (p2 = previous(ct)) && p1 == p2 && p1) }
                  }
var chunker = //taken from sizle
  /^(\*|\w+)?(?:([\.\#]+[\w\-\.#]+)?)(\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\])?(:([\w\-]+)(\(['"]?([^()]+)['"]?\))?)?/
;d3.scale.linear()
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

var proto = {
  circle: { r: function (v) {
              pointPosBuffer[this.index + 2] = v
            }
          , cx: function (v) {
              pointPosBuffer[this.index + 0] = x(v)

            }
          , cy: function (v) {
              pointPosBuffer[this.index + 1] = y(v)
            }
          , fill: function (v) {
              var fill = d3.rgb(v)
              colorBuffer[this.index + 0] = fill.r / 256
              colorBuffer[this.index + 1] = fill.g / 256
              colorBuffer[this.index + 2] = fill.b / 256
              colorBuffer[this.index + 3] = this.attr.opacity
            }

          , stroke: function (v) {
              return;
              var fill = d3.rgb(v)
              colorBuffer[this.index + 0] = fill.r / 256
              colorBuffer[this.index + 1] = fill.g / 256
              colorBuffer[this.index + 2] = fill.b / 256
              colorBuffer[this.index + 3] = this.attr.opacity
            },
            opacity: function () {
              colorBuffer[this.index + 3] = this.attr.opacity
            }

          , buffer: pointBuffer
          }
, ellipse: { cx: noop, cy: noop, rx: noop, ry: noop } //points
, rect: { width: noop, height: noop, x: noop, y: noop, rx: roundedCorner, ry:  roundedCorner} //point

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

, g: { appendChild: function (tag) { this.children.push(appendChild(tag)) },  ctr: function () { this.children = [] }
     }

, text: { x: noop, y: noop, dx: noop, dy: noop }
}

var allCircles = new Float32Array(1e6)

var baseProto = extend(Object.create(null), {
  querySelectorAll: querySelectorAll
, children: Object.freeze([])
, ctr: constructProxy
, querySelector: function (s) { return this.querySelectorAll(s)[0] }
, createElementNS: noop
, insertBefore: noop
, ownerDocument: { createElementNS: noop }
, render: function render(node) {
  this.buffer && drawFill(this)
  drawStroke(this)
}
, previousSibling: function () { canvas.scene[canvas.__scene__.indexOf() - 1] }
, nextSibling: function () { canvas.scene[canvas.__scene__.indexOf()  + 1] }
, parent: function () { return __scene__ }

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
              a[type.name] = constructProxy(type)
              type.prototype = extend(Object.create(baseProto), proto[type.name])
              return a
            }, {})


function buildLine () {}
function buildPath () {
  parse.call(this, this.attr.d)
  this.buffer = toBuffer(this.path.coords)
}

function insertBefore(node, next) {
  var scene = canvas.__scene__
    , i = scene.indexOf(next)
  reverseEach(scene.slice(i, scene.push(0)),
              function (d, i) { scene[i] = scene[i - 1] })
  scene[i] = node
}

function appendChild(el) {
  return types[el.tagName.toLowerCase()](el)
}

function removeChild(el) {
  var i = this.__scene__.indexOf(el)

  this.__scene__.splice(i, 1)

  delete el.index

  el.r(0)

  //el.buffer.size -= 1
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
, opacity: .999
}

function constructProxy(type) {
  return function (el) {
    var child = new type()
      , buffer = child.buffer

    canvas.__scene__.push(child)

    var numArrays = 4

    child.attr = Object.create(attrDefaults)
    child.tagName = el.tagName
    child.parentNode = child.parentElement = child
    child.index = (buffer.count * numArrays)

    buffer[child.index] = buffer.count
    buffer[child.index + 1] = buffer.count
    buffer[child.index + 2] = buffer.count
    //buffer[child.index + 3] = buffer.count
    buffer.count += 1

    return child
  }
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
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
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

function flatten(ar) { return ar.reduce(function (a, b) { return a.concat(b.map ? flatten(b) : b) }) }

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