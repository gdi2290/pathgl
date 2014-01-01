var pointVertex = [
  'precision mediump float;'

, 'attribute vec4 pos;'
, 'attribute vec4 fill;'
, 'attribute vec4 stroke;'

, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'

, 'void main() {'
, '    gl_Position.xy = pos.xy;'
, '    gl_PointSize = pos.z * 2.;'

, '    v_fill = fill;'
, '    v_stroke = stroke;'
, '}'
].join('\n')

var pointFragment = [
  'precision mediump float;'
, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'
, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
, '    if (dist > 0.5) discard;'
, '    gl_FragColor = dist > .45 ? v_stroke : v_fill;'
, '}'
].join('\n')

var pointBuffer = new Uint32Array(4 * 1e4)
var colorBuffer = new Float32Array(4 * 1e4)
var pointPosBuffer = new Float32Array(4 * 1e4)
pointBuffer.count = 0
window.pb = pointBuffer
window.pos = pointPosBuffer
window.color = colorBuffer
var buff




function drawPoints(elapsed) {
  if (! pointBuffer.count) return
  if (program.name !== 'point') gl.useProgram(program = programs.point)

  if(! buff) {
  } else {
    //gl.bufferSubData(gl.ARRAY_BUFFER, 0, pointBuffer)
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.enableVertexAttribArray(program.vPos)
  gl.bufferData(gl.ARRAY_BUFFER, pointPosBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vPos, 4, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.enableVertexAttribArray(program.vStroke)
  gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vStroke, 4, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.enableVertexAttribArray(program.vFill)
  gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vFill, 4, gl.FLOAT, false, 0, 0)

  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
  // gl.bufferData(gl.ARRAY_BUFFER, pointBuffer, gl.DYNAMIC_DRAW)

  // gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, 0)
  gl.drawArrays(gl.POINTS, 0, pointBuffer.count)
}
