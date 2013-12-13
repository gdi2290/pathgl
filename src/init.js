var circleVertex = [
  'precision mediump float;'
, 'attribute vec3 aVertexPosition;'
, "uniform vec2 resolution;"
, 'void main() {'
, "    vec2 normalize = aVertexPosition.xy / resolution;"
, "    vec2 clipSpace = (normalize * 2.0) - 1.0;"
, "    gl_Position = vec4(clipSpace, 1, 1);"
, '    gl_PointSize = 40.0;'
, '}'
].join('\n')

'    if (distance(gl_PointCoord, vec2(0.5)) > 0.4) gl_FragColor = vec4(.5, 1, 0, 1);'
'		 else gl_FragColor = vec4(1, .5 ,1, 1);'

var ccccfff = [
  'precision mediump float;'
, 'void main() {'
, 'if (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;'
, 'gl_FragColor = vec4(noise1(),0,0,1);'
, '}'
].join('\n')

var circleFragment = [
  'precision mediump float;'
,'float adnan(vec2 co){'
, '    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);'
, '}'
, 'void main() {'
, 'float dist = distance(gl_PointCoord, vec2(0.5));'
, 'if (dist > 0.5) discard;'
//, 'float alpha = 1.0 - smoothstep(0.45, 0.5, dist);'
, 'gl_FragColor = vec4(0, adnan(gl_PointCoord), 1.2-dist, 1.1-dist);'
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
  d3.timer(runLoop)
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
  program.vertexPosition = gl.getAttribLocation(program, "aVertexPosition")
  gl.enableVertexAttribArray(program.vertexPosition)

  program.name = name
  return program
}

function bindUniform(val, key) {
  var loc = program[key] || (program[key] = gl.getUniformLocation(program, key))
  gl['uniform' + val.length + 'fv'](loc, val)
}

function initContext(canvas) {
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  return gl && extend(gl, { viewportWidth: canvas.width, viewportHeight: canvas.height })
}
