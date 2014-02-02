pathgl.vertexShader = [
  'precision mediump float;'
, 'uniform float type;'
, 'uniform float clock;'

, 'uniform vec2 mouse;'
, 'uniform vec2 resolution;'
, 'uniform vec2 dates;'
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
, '    gl_Position = vec4(2. * (pos.x / resolution.x) - 1., 1. - ((pos.y / resolution.y) * 2.),  1., 1.);'

, '    gl_PointSize =  replace_radius;'
, '    v_type = (fill > 0. ? 1. : 0.);'
, '    v_fill = vec4(unpack_color(fill), 1.);'
, '    v_stroke = replace_stroke;'
, '}'
].join('\n')

pathgl.fragmentShader = [
  'precision mediump float;'
, 'uniform float type;'
, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'

, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
, '    if (type == 1. && dist > 0.5) discard;'
, '    gl_FragColor = v_stroke;'
, '}'
].join('\n')

//type
//1 circle
//2 rect
//3 line
//4 path

d3.selection.prototype.shader = function (hello) {
  initProgram(hello)
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

  each({ type: [0]
       , mouse: [0, 0]
       , dates: [0, 0]
       , resolution: [0, 0]
       , clock: [0]
       }, bindUniform)

  program.vPos = gl.getAttribLocation(program, "pos")
  gl.enableVertexAttribArray(program.vPos)

  program.vFill = gl.getAttribLocation(program, "fill")
  gl.enableVertexAttribArray(program.vFill)

  program.vStroke = gl.getAttribLocation(program, "stroke")
  gl.enableVertexAttribArray(program.vStroke)

  return program
}

function initProgram (subst) {
  var defaults = _.extend({
    stroke: 'vec4(unpack_color(stroke), 1.);'
  , radius: '2. * pos.z;'
  }, subst), vertex = pathgl.vertexShader

  for(var attr in defaults)
    vertex = vertex.replace('replace_'+attr, defaults[attr])

  return createProgram(vertex, pathgl.fragmentShader)
}

function compileShader (type, src) {
  var shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw src + ' ' + gl.getShaderInfoLog(shader)
  return shader
}

function bindUniform(val, key) {
  var loc = gl.getUniformLocation(program, key), keep
  ;(program[key] = function (data) {
      if (keep == data) return
      if (data == null) return keep
      gl['uniform' + val.length + 'fv'](loc, Array.isArray(data) ? data : [data])
      keep = data
  })(val)
}