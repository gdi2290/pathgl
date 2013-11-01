function addToBuffer(datum) {
  return extend(datum.path = [], { coords: [], id: datum.id })
}

function addLine(x1, y1, x2, y2) {
  var index = this.push(ctx.createBuffer()) - 1
  var vertices = [x1, y1, 0, x2, y2, 0]

  ctx.bindBuffer(ctx.ARRAY_BUFFER, this[index])
  ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(vertices), ctx.STATIC_DRAW)

  this[index].itemSize = 3
  this[index].numItems = vertices.length / 3
}

function applyTransforms(node) {
  ctx.uniform2f(program.xy, node.attr.translate[0] + node.attr.cx, node.attr.translate[0] + node.attr.cy)
  ctx.uniform2fv(program.scale, node.attr.scale)
  ctx.uniform2fv(program.rotation, node.attr.rotation)
}

function drawPolygon(buffer) {
  if (! this.attr) return console.log('lol')

  setStroke(d3.rgb(this.attr.fill))
  drawBuffer(buffer, ctx.TRIANGLE_FAN)
}

function drawBuffer(buffer, type) {
  ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
  ctx.vertexAttribPointer(program.vertexPosition, buffer.itemSize, ctx.FLOAT, false, 0, 0)
  ctx.drawArrays(type, 0, buffer.numItems)
}

function drawPath(node) {
  applyTransforms(node)

  if (node.buffer) drawPolygon.call(node, node.buffer)

  setStroke(d3.rgb(node.attr.stroke))

  for (var i = 0; i < node.path.length; i++) drawBuffer(node.path[i], ctx.LINE_STRIP)
}

function render() {
  canvas.__rerender__ = true
}

function setStroke (c) {
  ctx.uniform4f(program.rgb,
                c.r / 256,
                c.g / 256,
                c.b / 256,
                1.0)
}


function buildBuffer(points){
  var buffer = ctx.createBuffer()
  ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
  ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(points), ctx.STATIC_DRAW)
  buffer.itemSize = 3
  buffer.numItems = points.length / buffer.itemSize
  return buffer
}

function toBuffer (array) {
  return buildBuffer(flatten(array))
}
