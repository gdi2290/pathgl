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
  return gl && extend(gl, { viewportWidth: canvas.width || innerWidth
                          , viewportHeight: canvas.height || innerHeight
                          })
}

function each(obj, fn) {
  for (var key in obj) fn(obj[key], key, obj)
}
