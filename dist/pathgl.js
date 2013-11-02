pathgl.supportedAttributes =
  [ 'd'
  , 'stroke'
  , 'strokeWidth'
  , 'fill'
  ]

pathgl.shaderParameters = {
  rgb: [0, 0, 0, 0]
, xy: [0, 0]
, time: [0]
, rotation: [0, 1]
, resolution: [innerWidth, innerHeight]
, scale: [1, 1]
, mouse: pathgl.mouse = [0, 0]
}


pathgl.fragment = [ "precision mediump float;"
                  , "uniform vec4 rgb;"
                  , "uniform float time;"
                  , "uniform vec2 resolution;"
                  , "void main(void) {"
                  , "  gl_FragColor = rgb;"
                  , "}"
                  ].join('\n')

pathgl.vertex = [ "attribute vec3 aVertexPosition;"
                , "uniform mat4 uPMatrix;"
                , "uniform vec2 xy;"
                , "uniform vec2 resolution;"
                , "uniform vec2 rotation;"
                , "uniform vec2 scale;"

                , "void main(void) {"

                , "vec3 scaled_position = aVertexPosition * vec3(scale, 1.0);"

                , "vec2 rotated_position = vec2(scaled_position.x * rotation.y + scaled_position.y * rotation.x, "
                + "scaled_position.y * rotation.y - scaled_position.x * rotation.x);"

                , "vec2 position = vec2(rotated_position.x +xy.x, rotated_position.y + xy.y );"

                , "vec2 zeroToOne = position / resolution;"
                , "vec2 zeroToTwo = zeroToOne * 2.0;"
                , "vec2 clipSpace = zeroToTwo - 1.0;"

                , "gl_Position = vec4(clipSpace, 1, 1);"

                , "}"
                ].join('\n')

function pathgl(canvas) {
  var gl, program

  canvas = 'string' == typeof canvas ? d3.select(canvas).node() :
    canvas instanceof d3.selection ? canvas.node() :
    canvas

  pathgl.initShaders = initShaders

  this.pathgl = pathgl

  var attrDefaults = {
    rotation: [0, 1]
  , translate: [0, 0]
  , scale: [1, 1]
  , cx: 0
  , cy: 0
  }

  svgDomProxy.prototype =
    {
      r: function () {
        addToBuffer(this)
        this.path.coords = circlePoints(this.attr.r)
        this.buffer = buildBuffer(this.path.coords)
        drawPolygon.call(this, this.buffer)
      }

    , cx: function (cx) {
        this.buffer && drawPolygon.call(this, this.buffer)
      }

    , cy: function (cy) {
        this.buffer && drawPolygon.call(this, this.buffer)
      }

    , fill: function (val) {
        function integer(i) { return + i }
        function identity(i) { return i }

        if (this.tagName != 'PATH') return drawPolygon.call(this, this.buffer)

        if (! this.buffer)
          this.buffer = toBuffer(this.path.coords
                                 .map(function (d) { return d.map(integer).filter(identity) })
                                 .map(function (d) { d.push(0); return d })
                                 .filter(function (d) { return d.length == 3 }))

        drawPolygon.call(this, this.buffer)
      }

    , transform: function (d) {
        var parse = d3.transform(d)
          , radians = parse.rotate * Math.PI / 180
          , rotation = { rotation: [ Math.sin(radians), Math.cos(radians) ] }

        extend(this.attr, parse, rotation)

        render()
      }

    , d: function (d) {
        this.path && extend(this.path, { coords: [], length: 0 })

        if (d.match(/NaN/)) return console.warn('path is invalid')

        render()

        parse.call(this, d)
      }

    , stroke: function (d) {
        render()
      }

    , 'stroke-width': function (value) {
        gl.lineWidth(value)
      }

    , getAttribute: function (name) {
        return this.attr[name]
      }

    , setAttribute: function (name, value) {
        this.attr[name] = value
        this[name](value)
      }

    , removeAttribute: function (name) {
        delete this.attr[name]
      }

    , textContent: noop
    , removeEventListener: noop
    , addEventListener: noop
    }

  var methods = { m: moveTo
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

  return init(canvas)
function init(c) {
  canvas = c
  pathgl.shaderParameters.resolution = [canvas.width, canvas.height]
  gl = initContext(canvas)
  initShaders()
  override(canvas)
  d3.select(canvas).on('mousemove.pathgl', mousemoved)
  d3.timer(function (elapsed) {
    if (canvas.__rerender__ || pathgl.forceRerender)
      gl.uniform1f(program.time, pathgl.time = elapsed / 1000),
      gl.uniform2fv(program.mouse, pathgl.mouse),
      canvas.__scene__.forEach(drawPath)
    canvas.__rerender__ = false
  })

  return gl ? canvas : null
}

function mousemoved() {
  //set scene hover here
  var m = d3.mouse(this)
  pathgl.mouse = [m[0] / innerWidth, m[1] / innerHeight]
}

function override(canvas) {
  return extend(canvas, {
    appendChild: svgDomProxy
  , querySelectorAll: querySelectorAll
  , querySelector: querySelector

  , gl: gl
  , __scene__: []
  , __pos__: []
  , __id__: 0
  , __program__: void 0
  })
}

function compileShader (type, src) {
  var shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader))
  return shader
}

function initShaders() {
  var vertexShader = compileShader(gl.VERTEX_SHADER, pathgl.vertex)
  var fragmentShader = compileShader(gl.FRAGMENT_SHADER, pathgl.fragment)
  program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)

  gl.linkProgram(program)
  gl.useProgram(program)

  if (! gl.getProgramParameter(program, gl.LINK_STATUS)) return console.error("Shader is broken")

  each(pathgl.shaderParameters, bindUniform)

  program.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")
  gl.enableVertexAttribArray(program.vertexPosition)

  program.uPMatrix = gl.getUniformLocation(program, "uPMatrix")
  gl.uniformMatrix4fv(program.uPMatrix, 0, projection(0, innerWidth / 2, 0, 500, -1, 1))
}

function bindUniform(val, key) {
  program[key] = gl.getUniformLocation(program, key)
  if (val) gl['uniform' + val.length + 'fv'](program[key], val)
}

function initContext(canvas) {
  var gl = canvas.getContext('webgl')
  if (! gl) return
  gl.viewportWidth = canvas.width || innerWidth
  gl.viewportHeight = canvas.height || innerHeight
  return gl
}


function each(obj, fn) {
  for(var key in obj) fn(obj[key], key, obj)
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
  twoEach(coords, function (a, b) { s.push([a, b]) })
  return s

}
function parse (str) {
  var path = addToBuffer(this)

  if (path.length) return render()

  str.match(/[a-z][^a-z]*/ig).forEach(function (segment, i, match) {
    var instruction = methods[segment[0].toLowerCase()]
      , coords = segment.slice(1).trim().split(/,| /g)

    ;[].push.apply(path.coords, group(coords))
    if (instruction.name == 'closePath' && match[i+1]) return instruction.call(path, match[i+1])

    if ('function' == typeof instruction)
      coords.length == 1 ? instruction.call(path) : twoEach(coords, instruction, path)
    else
      console.error(instruction + ' ' + segment[0] + ' is not yet implemented')
  })
}

function moveTo(x, y) {
  pos = [x, canvas.height - y]
}

var subpathStart
function closePath(next) {
  subpathStart = pos
  lineTo.apply(this, /m/i.test(next) ? next.slice(1).trim().split(/,| /g) : this.coords[0])
}


function lineTo(x, y) {
  addLine.apply(this, pos.concat(pos = [x, canvas.height - y]))
}
function svgDomProxy(el, canvas) {
  if (! (this instanceof svgDomProxy)) return new svgDomProxy(el, this);

  canvas.__scene__.push(this)

  this.tagName = el.tagName
  this.id = canvas.__id__++
  this.attr = Object.create(attrDefaults)
  this.parentElement = this.canvas = canvas
  this.gl = canvas.gl
}

function querySelector(query) {
  return this.querySelectorAll(query)[0]
}

function querySelectorAll(query) {
  return this.__scene__
}

var circleProto = extend(Object.create(svgDomProxy), {
  r: noop
, cx: noop
, cy: noop
})

var pathProto = extend(Object.create(svgDomProxy), {
  d: noop
})

var rect = extend(Object.create(svgDomProxy), {
  height: noop
, width: noop
, rx: noop
, ry: noop
, x: noop
, y: noop
})

//rect, line, group, text, image



var memo = {}
function circlePoints(r) {
  if (memo[r]) return memo[r]

  var a = []
  for (var i = 0; i < 360; i+=18)
    a.push(50 + r * Math.cos(i * Math.PI / 180),
           50 + r * Math.sin(i * Math.PI / 180),
           0
          )

  return memo[r] = a
}
function addToBuffer(datum) {
  return extend(datum.path = [], { coords: [], id: datum.id })
}

function addLine(x1, y1, x2, y2) {
  var index = this.push(gl.createBuffer()) - 1
  var vertices = [x1, y1, 0, x2, y2, 0]

  gl.bindBuffer(gl.ARRAY_BUFFER, this[index])
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  this[index].itemSize = 3
  this[index].numItems = vertices.length / 3
}

function applyTransforms(node) {
  gl.uniform2f(program.xy, node.attr.translate[0] + node.attr.cx, node.attr.translate[0] + node.attr.cy)
  gl.uniform2fv(program.scale, node.attr.scale)
  gl.uniform2fv(program.rotation, node.attr.rotation)
}

function drawPolygon(buffer) {
  if (! this.attr) return console.log('lol')

  setStroke(d3.rgb(this.attr.fill))
  drawBuffer(buffer, gl.TRIANGLE_FAN)
}

function drawBuffer(buffer, type) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(program.vertexPosition, buffer.itemSize, gl.FLOAT, false, 0, 0)
  gl.drawArrays(type, 0, buffer.numItems)
}

function drawPath(node) {
  applyTransforms(node)

  if (node.buffer) drawPolygon.call(node, node.buffer)

  setStroke(d3.rgb(node.attr.stroke))

  for (var i = 0; i < node.path.length; i++) drawBuffer(node.path[i], gl.LINE_STRIP)
}

function render() {
  canvas.__rerender__ = true
}

function setStroke (c) {
  gl.uniform4f(program.rgb,
                c.r / 256,
                c.g / 256,
                c.b / 256,
                1.0)
}

function buildBuffer(points){
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
function extend (a, b) {
  if (arguments.length > 2) [].forEach.call(arguments, function (b) { extend(a, b) })
  else for (var k in b) a[k] = b[k]
  return a
}

function twoEach(list, fn, gl) {
  var l = list.length - 1, i = 0
  while(i < l) fn.call(gl, list[i++], list[i++])
}

function noop () {}

function projection(l, r, b, t, n, f) {
  var rl = r - l
    , tb = t - b
    , fn = f - n

  return [
    2 / rl, 0, 0, 0
  , 0, 2 / tb, 0, 0
  , 0, 0, -2 / fn, 0

  , (l + r) / -rl
  , (t + b) / -tb
  , (f + n) / -fn
  , 1
  ]
}

function flatten(input) {
  return input.reduce(flat, [])
}

function flat(acc, value) {
  return (Array.isArray(value) ? [].push.apply(acc, value) : acc.push(value)) && acc
}
}