var methods = { m: moveTo
              , z: closePath
              , l: lineTo

              , h: horizontalLine
              , v: verticalLine
              , c: curveTo
              , s: shortCurveTo
              , q: quadraticBezier
              , t: smoothQuadraticBezier
              , a: elipticalArc
              }

function parse (str) {
  var buffer = [], lb = this.buffer, i, pb = this.posBuffer

  pos = [0, 0]
  str.match(/[a-z][^a-z]*/ig).forEach(function (segment, i, match) {
    var instruction = methods[segment[0].toLowerCase()]
      , coords = segment.slice(1).trim().split(/,| /g)

    if (! instruction) return console.log('malformed path:D')
    if (instruction.name == 'closePath' && match[i+1]) return instruction.call(buffer, match[i+1])

    if ('function' == typeof instruction)
      coords.length == 1 ? instruction.call(buffer, coords) : twoEach(coords, instruction, buffer)
    else
      console.error(instruction + ' ' + segment[0] + ' is not yet implemented')
  })

  if (this.indices.length < buffer.length)
    for (i = lb.count + 1; i < buffer.length + lb.count;) this.indices.push(i++)
  else
    this.indices.length = buffer.length

  lb.count += this.indices.length - buffer.length

  this.indices.forEach(function (d, i) {
    pb[2 * lb[d] + d % 2] = (i % 2 ? yScale : xScale)(buffer[i])
  })
}

var pos

function moveTo(x, y) {
  this.push(x, y)
}

function lineTo(x, y) {
  this.push(x, y)
}

var subPathStart
function closePath(next) {
  subPathStart = pos
  lineTo.apply(this, /m/i.test(next) ? next.slice(1).trim().split(/,| /g) : this.slice(0, 2))
}


function horizontalLine() {}
function verticalLine() {}
function curveTo() {}
function shortCurveTo() {}
function quadraticBezier() {}
function smoothQuadraticBezier () {}
function elipticalArc(){}
