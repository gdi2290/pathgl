var lineBuffer = new Uint16Array(4 * 1e4)
var linePosBuffer = new Float32Array(4 * 1e4)
lineBuffer.count = 0
lb = lineBuffer
lpb = linePosBuffer

function drawLines(){
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.enableVertexAttribArray(program.vPos)
  gl.bufferData(gl.ARRAY_BUFFER, linePosBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vPos, 2, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.enableVertexAttribArray(program.vStroke)
  gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(program.vStroke, 1, gl.FLOAT, false, 0, 0)

  // gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  // gl.enableVertexAttribArray(program.vFill)
  // gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.DYNAMIC_DRAW)
  // gl.vertexAttribPointer(program.vFill, 4, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lineBuffer, gl.DYNAMIC_DRAW)
  //gl.drawElements(gl.LINES, lineBuffer.count * 4, gl.UNSIGNED_SHORT, 2)
  gl.drawArrays(gl.LINES, 0, lineBuffer.count * 4)
}
