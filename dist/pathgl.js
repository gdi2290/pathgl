! function() {
this.pathgl = pathgl

pathgl.stop = d3.functor()

function pathgl(canvas) {
  var gl, program, programs

  if (canvas == null)
    canvas = document.body.appendChild(extend(document.createElement('canvas'), { height: 500, width: 960 }))

  canvas = 'string' == typeof canvas ? document.querySelector(canvas) :
    canvas instanceof d3.selection ? canvas.node() :
    canvas

  if (! canvas) return console.log('invalid selector')
  if (! canvas.getContext) return console.log(canvas, 'is not a valid canvas');pathgl.vertexShader = [
  'precision mediump float;'
, 'attribute vec4 pos;'
, 'attribute float fill;'
, 'attribute float stroke;'

, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'
, 'varying float v_type;'

, 'vec3 unpack_color(float col) {'
, '    if (col == 0.) return vec3(0);'
, '    return vec3(mod(col / 256. / 256., 256.),'
, '                mod(col / 256. , 256.),'
, '                mod(col, 256.)) / 256.; }'

, 'void main() {'
, '    gl_Position = vec4(pos.xy, 1., 1.);'
, '    gl_PointSize =  2. * 10.;'//pos.z

, '    v_type = (fill > 0. ? 1. : 0.);'
, '    v_fill = vec4(unpack_color(fill), 1.0);'
, '    v_stroke = vec4(unpack_color(stroke), 1.0);'
, '}'
].join('\n')

pathgl.fragmentShader = [
  'precision mediump float;'
, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'
, 'varying float v_type;'

, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
//, '    if (dist > 0.5 && v_type == 1.) discard;'
, '    gl_FragColor = v_stroke;'//v_stroke
, '}'
].join('\n')


//type
//1 circle
//2 rect
//3 line
//4 path
;var stopRendering = false
var colorBuffer = new Float32Array(4 * 1e4)

pathgl.uniforms = { mouse: [0, 0] }

pathgl.stop = function () { stopRendering = true }
function init(c) {
  canvas = c
  gl = initContext(canvas)
  program = createProgram(pathgl.vertexShader, pathgl.fragmentShader)
  monkeyPatch(canvas)
  bindEvents(canvas)
  flags(canvas)
  d3.timer(drawLoop)
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
  pathgl.uniforms.mouse = [m[0] / innerWidth, m[1] / innerHeight]
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

  each({}, bindUniform)

  program.vPos = gl.getAttribLocation(program, "pos")
  gl.enableVertexAttribArray(program.vPos)

  program.vFill = gl.getAttribLocation(program, "fill")
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
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  return gl && extend(gl, { viewportWidth: canvas.width, viewportHeight: canvas.height })
};  var methods = { m: moveTo
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

function kludge(coords) {
  var s = []
  twoEach(coords, function (a, b) { s.push(+ a, + b) })
  return s
}

function parse (str) {
  var buffer = []

  str.match(/[a-z][^a-z]*/ig).forEach(function (segment, i, match) {
    var instruction = methods[segment[0].toLowerCase()]
      , coords = segment.slice(1).trim().split(/,| /g)

    kludge(coords).forEach(push, buffer)
    // if (! instruction) return
    // //if (instruction.name == 'closePath' && match[i+1]) return instruction.call(buffer, match[i+1])

    // if ('function' == typeof instruction)
    //   coords.length == 1 ? instruction.call(buffer) : twoEach(coords, instruction, buffer)
    // else
    //   console.error(instruction + ' ' + segment[0] + ' is not yet implemented')
  })

  return buffer
}

window.pse = parse

var pos = [0, 0]
function moveTo(x, y) {
  pos = [x, y]
}

var subpathStart
function closePath(next) {
  subpathStart = pos
  lineTo.apply(this, /m/i.test(next) ? next.slice(1).trim().split(/,| /g) : this.coords[0])
}

function lineTo(x, y) {
  this.push(pos[0], pos[1], y, 0)
  pos = [x,y]
}
;var pointBuffer = new Uint16Array(4 * 4e4)
var pointPosBuffer = new Float32Array(4 * 4e4)
pointBuffer.count = 0
pb = pointBuffer
ppb = pointPosBuffer
cb = colorBuffer
var buff
var points = {
    pos: {
      buffer: 0
    , vLoc: 0
    }
  , fill: {}
  , stroke: {}
}

function drawPoints(elapsed) {
  if (! pointBuffer.count) return
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
  gl.vertexAttribPointer(program.vStroke, 1, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.enableVertexAttribArray(program.vFill)
  gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vFill, 1, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pointBuffer, gl.DYNAMIC_DRAW)
  gl.drawElements(gl.POINTS, pointBuffer.count * 4, gl.UNSIGNED_SHORT, 0)

}
;var lineBuffer = new Uint16Array(4 * 1e4)
var linePosBuffer = new Float32Array(4 * 1e4)
lineBuffer.count = 0
lb = lineBuffer
lpb = linePosBuffer

function initBuffers () {
  b1 = gl.createBuffer(), b2 = gl.createBuffer(), b3 = gl.createBuffer(), b4 = gl.createBuffer()
}

var once = _.once(initBuffers)
function drawLines(){
  once()
  gl.bindBuffer(gl.ARRAY_BUFFER, b1)
  gl.enableVertexAttribArray(program.vPos)
  gl.bufferData(gl.ARRAY_BUFFER, linePosBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vPos, 2, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, b2)
  gl.enableVertexAttribArray(program.vStroke)
  b4._ || gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vStroke, 1, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, b3)
  gl.enableVertexAttribArray(program.vFill)
  b4._ || gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vFill, 1, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b4)
  b4._ || gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lineBuffer, gl.DYNAMIC_DRAW)
  gl.drawElements(gl.LINE_LOOP, 1e4 * 2, gl.UNSIGNED_SHORT, 0)



  b4._  = true
}
;function drawPolygons() {


};function querySelectorAll(selector, r) {
  return selector.replace(/^\s+|\s*([,\s\+\~>]|$)\s*/g, '$1').split(',')
  .forEach(function (s) { query(s, this).forEach(push.bind(r = [])) }, this) || r
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

function chunk(query) { return query.match(chunker) }
function byId(id) { return querySelectorAll('[id="' + id + '"]')[0] }
function isNode(el) { return el && typeof el === 'object' }
function previous(n) { while (n = n.previousSibling()) if (n.top) return n }
function clean(s) { return s.replace(/([.*+?\^=!:${}()|\[\]\/\\])/, '\\$1') }
function matchClass(d) { return ! RegExp('(^|\\s+)' + d.slice(1) + '(\\s+|$)').test(this.class) }
function byClassName(name) { return traverse(this, function (doc) { return doc.class == name }, []) }
function byTagName(name) { return traverse(this, function (doc) { return name == '*' || doc.tag == name }, []) }
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

var proto = {
  circle: { r: function (v) {
              this.posBuffer[this.indices[0] + 2] = v
            }
          , cx: function (v) {
              this.posBuffer[this.indices[0] + 0] = xScale(v)

            }
          , cy: function (v) {
              this.posBuffer[this.indices[0] + 1] = yScale(v)
            }
          , fill: function (v) {
              var fill = d3.rgb(v)
              colorBuffer[this.indices[0] / 4] = parseInt(fill.toString().slice(1), 16)
            }

          , stroke: function (v) {
              return;
              var fill = d3.rgb(v)
              colorBuffer[this.indices[0] / 4] = + fill.toString().slice(1)
            },
            opacity: function () {
            }

          , buffer: pointBuffer
          , posBuffer: pointPosBuffer
          }
, ellipse: { cx: noop, cy: noop, rx: noop, ry: noop } //points
, rect: { width: noop, height: noop, x: noop, y: noop, rx: roundedCorner, ry:  roundedCorner} //point

, image: { 'xlink:href': noop, height: noop, width: noop, x: noop, y: noop } //point

, line: { x1: function (v) { this.posBuffer[this.indices[0] * 2] = xScale(v) }
        , y1: function (v) { this.posBuffer[this.indices[0] * 2 + 1] = yScale(v) }
        , x2: function (v) { this.posBuffer[this.indices[1] * 2] = xScale(v) }
        , y2: function (v) { this.posBuffer[this.indices[1] * 2  + 1] = yScale(v) }
        , buffer: lineBuffer
        , posBuffer: linePosBuffer
        , stroke: function (v) {
            var fill = d3.rgb(v)
            this.indices.forEach(function (i) {
              colorBuffer[i] = parseInt(fill.toString().slice(1), 16)
            })
           }
        }
, path: { d: buildPath
        , pathLength: noop
        , buffer: lineBuffer
        , posBuffer: linePosBuffer
        , stroke: function (v) {
            var fill = d3.rgb(v)
            this.indices.forEach(function (i) {
              colorBuffer[i] = + parseInt(fill.toString().slice(1), 16)
            })
            colorBuffer[this.indices[this.indices.length - 2]] =
              colorBuffer[this.indices[this.indices.length - 1]] = 16777215
          }
        }

, polygon: { points: noop } //lines
, polyline: { points: noop } //lines
, g: { appendChild: function (tag) { this.children.push(appendChild(tag)) },  ctr: function () { this.children = [] } }
, text: { x: noop, y: noop, dx: noop, dy: noop }
}

_.each(colorBuffer, function (d, i, o) {
  o[i] = 16761035
})

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
, previousSibling: function () { canvas.scene[canvas.__scene__.indexOf(this) - 1] }
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

function buildPath (d) {
  var buffer = parse(d), lb = this.buffer, i, pb = this.posBuffer

  if (this.indices.length < buffer.length)
    for (i = lb.count + 1; i < buffer.length + lb.count;) this.indices.push(i++)
  else
    this.indices.length = buffer.length

  lb.count += this.indices.length - buffer.length

  this.indices.forEach(function (d, i) {
    pb[2 * lb[d] + d % 2] = (i % 2 ? yScale : xScale)(buffer[i])
  })

  this.stroke(this.attr.stroke)
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

  for(var k = 0; k < 4; k++)
    el.buffer[el.index + k] = 0

  el.buffer.changed = true
  el.buffer.count -= 1
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

for (var i  = 0; i < lineBuffer.length; i+=2) {
  lineBuffer[i] = i / 2
  lineBuffer[i + 1] = i / 2
}

function constructProxy(type) {
  return function (el) {
    var child = new type()
      , buffer = child.buffer

    canvas.__scene__.push(child)

    var numArrays = 4

    child.attr = Object.create(attrDefaults)
    child.tag = el.tagName.toLowerCase()
    child.parentNode = child.parentElement = canvas
    var i = child.indices =
      type.name == 'line' ? [buffer.count, buffer.count + 1] : [buffer.count * 4]

    i.forEach(function (i) {
      buffer[i] = buffer.count + i % 2
    })

    buffer.count += type.name == 'line' ? 2 : 1

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
};function xScale(x) {
  return 2 * (x / canvas.width) - 1
}

function yScale(y) {
  return 1 - ((y / canvas.height) * 2)
}

function drawLoop(elapsed) {
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
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
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

function isId(str) {
  return false
}

function each(obj, fn) {
  for (var key in obj) fn(obj[key], key, obj)
}

function hash(str) {
  return str.split("").reduce(function(a,b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
}

function uniq(ar) { return ar.filter(function (d, i) { return ar.indexOf(d) == i }) }

function push(d) { return this.push(d) }

function flatten(ar) { return ar.reduce(function (a, b) { return a.concat(b.map ? flatten(b) : b) }) }

function clamp (a, x) {
  a = Math.abs(a)
  return x < -a ? -a : x > a ? a : x
}

function range(a, b) {
  return Array(Math.abs(b - a)).join().split(',').map(function (d, i) { return i + a })
}
;  pathgl.xScale  = xScale
  pathgl.yScale = yScale

  return init(canvas)
} }()