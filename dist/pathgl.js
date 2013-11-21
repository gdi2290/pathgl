! function() {
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
, opacity: [1]
, resolution: [innerWidth, innerHeight]
, scale: [1, 1]
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
                , "attribute vec3 aVertexPosition;"
                , "uniform vec2 xy;"
                , "uniform vec2 resolution;"
                , "uniform vec2 rotation;"
                , "uniform vec2 scale;"

                , "void main(void) {"

                , "vec3 pos = aVertexPosition;"
                , "pos.y = resolution.y - pos.y;"

                , "vec3 scaled_position = pos * vec3(scale, 1.0);"

                , "vec2 rotated_position = vec2(scaled_position.x * rotation.y + scaled_position.y * rotation.x, "
                + "scaled_position.y * rotation.y - scaled_position.x * rotation.x);"

                , "vec2 position = vec2(rotated_position.x + xy.x, rotated_position.y - xy.y );"

                , "vec2 zeroToOne = position / resolution;"
                , "vec2 zeroToTwo = zeroToOne * 2.0;"
                , "vec2 clipSpace = zeroToTwo - 1.0;"

                , "gl_Position = vec4(clipSpace, 1, 1);"

                , "}"
                ].join('\n')

this.pathgl = pathgl
this.programs = {}

function pathgl(canvas) {
  var gl, program

  canvas = 'string' == typeof canvas ? d3.select(canvas).node() :
    canvas instanceof d3.selection ? canvas.node() :
    canvas

  pathgl.initShaders = initShaders
function init(c) {
  canvas = c
  pathgl.shaderParameters.resolution = [canvas.width, canvas.height]
  gl = initContext(canvas)
  initShaders(pathgl.fragment)
  override(canvas)
  d3.select(canvas).on('mousemove.pathgl', mousemoved)
  d3.timer(function (elapsed) {
    //if (canvas.__rerender__ || pathgl.forceRerender)
    $.each(programs, function (k, program) {
      gl.useProgram(program)
      program.time && gl.uniform1f(program.time, pathgl.time = elapsed / 1000)
      program.mouse && gl.uniform2fv(program.mouse, pathgl.mouse)
    })
    canvas.__scene__.forEach(drawPath)
    canvas.__rerender__ = false
  })

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
  if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw (gl.getShaderInfoLog(shader))
  return shader
}

function initShaders(fragment, name) {
  if (programs[name]) return programs[name]
  var vertexShader = compileShader(gl.VERTEX_SHADER, pathgl.vertex)
  var fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragment)

  program = gl.createProgram()

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)

  gl.linkProgram(program)

  if (! gl.getProgramParameter(program, gl.LINK_STATUS)) throw name + ': ' + gl.getProgramInfoLog(program)

  gl.useProgram(program)

  each(pathgl.shaderParameters, bindUniform)

  program.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")
  gl.enableVertexAttribArray(program.vertexPosition)

  program.name = name
  return programs[name] = program
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
  for (var key in obj) fn(obj[key], key, obj)
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
    if (instruction.name == 'closePath' && match[i+1]) return instruction.call(path, match[i+1])

    if ('function' == typeof instruction)
      coords.length == 1 ? instruction.call(path) : twoEach(coords, instruction, path)
    else
      console.error(instruction + ' ' + segment[0] + ' is not yet implemented')
  })
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
  addLine.apply(this, pos.concat(pos = [x, y]))
}
function appendChild(el) {
  return new svgDomProxy(el, this)
}

function querySelector(query) {
  return this.querySelectorAll(query)[0]
}

function querySelectorAll(query) {
  return this.__scene__
}

function removeChild(el) {
  var i = this.__scene__.indexOf(el)
  this.__scene__.splice(i, 1)
}

var attrDefaults = {
  rotation: [0, 1]
, translate: [0, 0]
, scale: [1, 1]
, cx: 0
, cy: 0
, x: 0
, y: 0
, opacity: 1
}

function lineBuffers(polygon) {
  var shit = [], p = polygon
  for(var i = 0; i < polygon.length + 4; i+= 3)
    addLine.call(shit, polygon[i], polygon[i+1], polygon[i+3], polygon[i+4])

  i = polygon.length - 3;
  addLine.call(shit, polygon[i], polygon[i+1], polygon[0], polygon[1])

  return shit
}

function svgDomProxy(el, canvas) {
  canvas.__scene__.push(this)

  this.tagName = el.tagName
  this.id = canvas.__id__++
  this.attr = Object.create(attrDefaults)
  this.parentNode = this.parentElement = this.canvas = canvas
  this.gl = canvas.gl
}

svgDomProxy.prototype =
  {
    x: function () {}
  , y: function () {}

  , querySelectorAll: noop
  , querySelector: noop
  , createElementNS: noop
  , insertBefore: noop
  , ownerDocument: {createElementNS: noop}

  , height: function () {
      addToBuffer(this)
      this.path.coords = rectPoints(this.attr.width, this.attr.height)
      if (this.attr.stroke) [].push.apply(this.path, lineBuffers(this.path.coords))
      this.buffer = buildBuffer(this.path.coords)
      drawPolygon.call(this, this.buffer)
    }
  , width: function () {

    }

  , r: function () {
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
      if (val[0] === '#') initShaders(d3.select(val).text(), val)

      if (this.tagName != 'PATH') return drawPolygon.call(this, this.buffer)

      if (! this.buffer) this.buffer = toBuffer(this.path.coords)

      drawPolygon.call(this, this.buffer)
    }

  , transform: function (d) {
      var parse = d3.transform(d)
        , radians = parse.rotate * Math.PI / 180

      extend(this.attr, parse, { rotation: [ Math.sin(radians), Math.cos(radians) ] })

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
      this[name] && this[name](value)
    }

  , removeAttribute: function (name) {
      delete this.attr[name]
    }

  , textContent: noop
  , removeEventListener: noop
  , addEventListener: noop
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
function addToBuffer(datum) {
  return extend(datum.path = [], { coords: [], id: datum.id })
}

function addLine(x1, y1, x2, y2) {
  this.push(toBuffer([x1, y1, 0, x2, y2, 0]))
}

function applyTransforms(node) {
  gl.uniform2f(program.xy, node.attr.translate[0] + node.attr.cx + node.attr.x,
               node.attr.translate[0] + node.attr.cy + node.attr.y)
  gl.uniform2fv(program.scale, node.attr.scale)
  gl.uniform2fv(program.rotation, node.attr.rotation)
  gl.uniform1f(program.opacity, node.attr.opacity)
}

function drawPolygon(buffer) {
  setDrawColor(d3.rgb(this.attr.fill))
  drawBuffer(buffer, gl.TRIANGLE_FAN)
}

function drawBuffer(buffer, type) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(program.vertexPosition, buffer.itemSize, gl.FLOAT, false, 0, 0)
  gl.drawArrays(type, 0, buffer.numItems)
}

function drawPath(node) {
  if (node.attr.fill[0] === '#' && program.name !== node.attr.fill) {
    gl.useProgram(program = programs[node.attr.fill])
    program.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")
    gl.enableVertexAttribArray(program.vertexPosition)
  }

  applyTransforms(node)

  node.buffer && drawPolygon.call(node, node.buffer)

  setDrawColor(d3.rgb(node.attr.stroke))

  for (var i = 0; i < node.path.length; i++)
    drawBuffer(node.path[i], gl.LINE_STRIP)
}

function render() {
  canvas.__rerender__ = true
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

function toBuffer (array) {
  return buildBuffer(flatten(array))
}

function circlePoints(r) {
  var a = []
  for (var i = 0; i < 360; i+=18)
    a.push(50 + r * Math.cos(i * Math.PI / 180),
           50 + r * Math.sin(i * Math.PI / 180),
           0)
  return a
}


function rectPoints(h, w) {
  return [0,0,0,
          0,h,0,
          w,h,0,
          w,0,0,
         ]
}
function noop () {}

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
  return input.reduce(flat, [])
}

function flat(acc, value) {
  return (Array.isArray(value) ? [].push.apply(acc, value) : acc.push(value)) && acc
}
return init(canvas)
} }()