var pointVertex = [
  'precision mediump float;'
, 'attribute vec4 attr;'
, "uniform vec2 resolution;"
, 'varying vec4 stroke;'
, 'varying vec4 fill;'

, 'const float c_precision = 128.0;'
, 'const float c_precisionp1 = c_precision + 1.0;'
, 'vec4 unpack_color(float f) {'
, '    return vec4(mod(f, 1e3) / 255.'
, '               ,mod(f / 1e3, 1e3) / 255.'
, '               ,mod(f / 1e6, 1e3) / 255.'
, '               ,mod(f, 1.));'
, '}'
, 'vec3 unpack_pos(float f) {'
, '    return vec3( 2. * ((mod(f / 1e12, 1e4) - 1000.) / 1e4 / resolution.x - 1.)'
, '               , 1. - (2. * (mod(f / 1e8 , 1e4) - 1000.) / 1e4 / resolution.y)'
, '               , (mod(f       , 1e4) - 1000.) / resolution.y'
, '              );'
, '}'
, 'void main() {'
, '    vec3 pos = unpack_pos(attr.x);'
, '    gl_Position.xy = vec2(0., 0.);'
, '    gl_PointSize = 50. * 2.;'

, '    fill = vec4(1., 1., abs(pos.y), 1.0);'
, '    stroke = unpack_color(attr.w);'
, '}'
].join('\n')

var pointFragment = [
  'precision mediump float;'
, 'varying vec4 stroke;'
, 'varying vec4 fill;'
, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
, '    if (dist > 0.5) discard;'
, '    gl_FragColor = dist > .40 ? stroke : fill;'
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
