var pointVertex = [
  'precision mediump float;'
, 'attribute vec4 pos;'
, 'attribute int color;'
, 'varying vec4 stroke;'
, 'varying vec4 fill;'

, 'const float c_precision = 128.0;'
, 'const float c_precisionp1 = c_precision + 1.0;'
, 'vec3 unpack_color(float f) {'
, '    return vec3( floor(mod(f / 1e6, 1e3)) / 256.'
, '               , floor(mod(f / 1e9, 1e3)) / 256.'
, '               , floor(mod(f / 1e12, 1e3)) / 256.);'
, '}'
, 'void main() {'
, '    gl_Position.xy = pos.xy;'
, '    gl_PointSize = pos.z;'

, '    fill = unpack_color(color);'
, '    stroke = unpack_color(color);'
, '}'
].join('\n')

var pointFragment = [
  'precision mediump float;'
, 'varying vec4 stroke;'
, 'varying vec4 fill;'
, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
, '    if (dist > 0.5) discard;'
, '    gl_FragColor = dist > .45 ? stroke : vec4(fill.xyz, .5);'
, '}'
].join('\n')

pointBuffer.size = 0
window.pb = pointBuffer
var buff

var colorBuffer = new Uint32Array(1e3)
var pointBuffer = new Uint32Array(1e3)
var pointPosBuffer = new Float32Array(1e3)
//gl.drawElements(gl.POINTS, 60, gl.UNSIGNED_SHORT, 0)

function drawPoints(elapsed) {
  if (! pointBuffer.size) return
  if (program.name !== 'point') gl.useProgram(program = programs.point)

  if(! buff) {

  } else {
    //gl.bufferSubData(gl.ARRAY_BUFFER, 0, pointBuffer)
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, pointPosBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  gl.drawArrays(gl.POINTS, pointBuffer.length / 4 - pointBuffer.size, pointBuffer.size)
}
