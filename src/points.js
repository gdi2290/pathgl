var pointVertex = [
  'precision mediump float;'

, 'attribute vec4 pos;'
, 'attribute vec4 color;'

, 'varying vec4 stroke;'
, 'varying vec4 fill;'

, 'void main() {'
, '    gl_Position.xy = pos.xy;'
, '    gl_PointSize = pos.z;'

, '    fill = color;'
, '    stroke = color;'
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

var pointBuffer = new Uint32Array(1e3)
var colorBuffer = new Float32Array(1e3)
var pointPosBuffer = new Float32Array(1e3)
pointBuffer.count = 0
window.pb = pointBuffer
var buff


//gl.drawElements(gl.POINTS, 60, gl.UNSIGNED_SHORT, 0)

function drawPoints(elapsed) {
  if (! pointBuffer.count) return
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

  gl.drawArrays(gl.POINTS, pointBuffer.length / 4 - pointBuffer.count, pointBuffer.count)
}
