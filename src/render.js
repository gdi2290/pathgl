function addToBuffer(datum) {
  return extend(datum.path = [], { coords: [], id: datum.id })
}

function addLine(x1, y1, x2, y2) {
  var index = this.push(gl.createBuffer()) - 1
  var vertices = [x1, y1, 0, x2, y2, 0]

  gl.bindBuffer(gl.ARRAY_BUFFER, this[index])
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

  this[index].itemSize = 3
  this[index].numItems = vertices.length / 3
}

function applyTransforms(node) {
  gl.uniform2f(program.xy, node.attr.translate[0] + node.attr.cx, node.attr.translate[0] + node.attr.cy)
  gl.uniform2fv(program.scale, node.attr.scale)
  gl.uniform2fv(program.rotation, node.attr.rotation)
}

function drawPolygon(buffer) {
  if (! this.attr) return console.log('lol')

  setStroke(d3.rgb(this.attr.fill))
  drawBuffer(buffer, gl.TRIANGLE_FAN)
}

function drawBuffer(buffer, type) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(program.vertexPosition, buffer.itemSize, gl.FLOAT, false, 0, 0)
  gl.drawArrays(type, 0, buffer.numItems)
}

function drawPath(node) {
  applyTransforms(node)

  if (node.buffer) drawPolygon.call(node, node.buffer)

  setStroke(d3.rgb(node.attr.stroke))

  for (var i = 0; i < node.path.length; i++) drawBuffer(node.path[i], gl.LINE_STRIP)
}

function render() {
  canvas.__rerender__ = true
}

function setStroke (c) {
  gl.uniform4f(program.rgb,
                c.r / 256,
                c.g / 256,
                c.b / 256,
                1.0)
}

function buildBuffer(points){
  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW)
  buffer.itemSize = 3
  buffer.numItems = points.length / buffer.itemSize
  return buffer
}

function toBuffer (array) {
  return buildBuffer(flatten(array))
}
