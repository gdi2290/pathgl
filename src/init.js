var circleVertex = [
  'attribute vec2 vertexCoords;'
, 'uniform mat3 coordinateTransform;'
, 'uniform float pointSize;'
, 'void main() {'
, '    vec3 transformedCoords = coordinateTransform * vec3(vertexCoords, 1.0);'
, '    gl_Position = vec4(transformedCoords.xy, 0.0, 1.0);'
, '    gl_PointSize = pointSize;'
, '}'
].join('\n')

var circleFragment = [
  'precision mediump float;'
, 'uniform bool antialiased;'
, 'void main() {'
, '    if (distance( gl_PointCoord, vec2(0.5)) > 0.5) discard;'
, '		 gl_FragColor = vec4(0, .5 ,1, 1);'
, '}'
].join('\n')

var stopRendering = false

pathgl.stop = function () { stopRendering = true }

function init(c) {
  canvas = c
  programs = canvas.programs = (canvas.programs || {})
  pathgl.shaderParameters.resolution = [canvas.width, canvas.height]
  gl = initContext(canvas)
  initShader(pathgl.fragment, '_identity')
  override(canvas)
  d3.select(canvas).on('mousemove.pathgl', mousemoved)
  d3.timer(function (elapsed) {
    //if (canvas.__rerender__ || pathgl.forceRerender)
    each(programs, function (program, key) {
      gl.useProgram(program)
      program.time && gl.uniform1f(program.time, pathgl.time = elapsed / 1000)
      program.mouse && gl.uniform2fv(program.mouse, pathgl.mouse)
    })
    canvas.__scene__.forEach(render)
    return stopRendering && ! gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
  })
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
  program.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")
  gl.enableVertexAttribArray(program.vertexPosition)

  program.name = name
  return program
}

function bindUniform(val, key) {
  program[key] = gl.getUniformLocation(program, key)
  if (val) gl['uniform' + val.length + 'fv'](program[key], val)
}

function initContext(canvas) {
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  return gl && extend(gl, { viewportWidth: canvas.width, viewportHeight: canvas.height })
}
