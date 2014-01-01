var lineVertex = [
  'precision mediump float;'
, 'attribute vec2 pos;'
, 'attribute vec4 stroke;'
, 'varying vec4 v_stroke;'
, 'void main() {'
, '    gl_Position.xy = pos;'
, '    v_stroke = stroke;'
, '}'
].join('\n')

var lineFragment = [
  'precision mediump float;'
, 'varying vec4 v_stroke;'
, 'void main() {'
, '    gl_FragColor = v_stroke;'
, '}'
].join('\n')

var lineBuffer = new Uint16Array(4 * 1e4)
var linePosBuffer = new Float32Array(4 * 1e4)
lineBuffer.size = 0

var lb
function drawLines(){
return
  if (! lineBuffer.size) return
  if (program.name !== 'line') gl.useProgram(program = programs.line)

  if (! lb) {
    gl.bindBuffer(gl.ARRAY_BUFFER, lb = gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, lineBuffer, gl.DYNAMIC_DRAW)
  } else {
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineBuffer)
  }

  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.drawArrays(gl.LINES, (lineBuffer.length - (lineBuffer.size * 4)) / 2, lineBuffer.size * 2)
}
