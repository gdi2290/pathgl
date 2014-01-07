var pointBuffer = new Uint16Array(4 * 1e4)
var pointPosBuffer = new Float32Array(4 * 1e4)
pointBuffer.count = 0
cb = colorBuffer
var buff
var points = {
    pos: {
      buffer: 0
    , vLoc: 0
    ,
    }
  , fill: {}
  , stroke: {}
}

function drawPoints(elapsed) {
  if (! pointBuffer.count) return
  // for(var attr in pointAttr) {
  //   gl.bindBuffer(gl.ARRAY_BUFFER, points[attr].buffer)
  //   gl.enableVertexAttribArray(points[attr].vLoc)
  //   if (points[attr].changed) gl.bufferSubData(gl.ARRAY_BUFFER, points[attr].list, gl.DYNAMIC_DRAW)
  //   gl.vertexAttribPointer(points[attr].vLoc, points[attr].length, gl.FLOAT, false, 0, 0)
  // }
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

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pointBuffer, gl.DYNAMIC_DRAW)
  gl.drawElements(gl.POINTS, 4e4, gl.UNSIGNED_SHORT, 0)
  // gl.drawArrays(gl.POINTS, 0, 1e4)
}
