function parse (str, stroke) {
  var buffer = [], lb = this.buffer, pb = this.posBuffer, indices = this.indices, count = lb.count
    , pos = [0, 0], i
  str.match(/[a-z][^a-z]*/ig).forEach(function (segment, i, match) {
    var points = segment.slice(1).trim().split(/,| /g), c = segment[0].toLowerCase(), j = 0

    while(j < points.length) {
      var x = points[j++], y = points[j++]
      c == 'm' ? pos = [x, y]:
        c == 'l' ? buffer.push(pos[0], pos[1], x, y) :
        c == 'z' ? '' :
        console.log('malformed path:' + c)
    }
  })

  if (this.indices.length < buffer.length)
    for (i = lb.count + 1; i < buffer.length + lb.count;) this.indices.push(i++)

  if (this.indices.length > buffer.length)
     console.log('omg'), this.indices.length = buffer.length

  lb.count += this.indices.length - buffer.length

  this.indices.forEach(function (d, i) {
    pb[2 * lb[d] + d % 2] = (i % 2 ? yScale : xScale)(buffer[i])
  })
}
