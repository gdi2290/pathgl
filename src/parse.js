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
  var buffer = []
  pos = [0, 0]
  str.match(/[a-z][^a-z]*/ig).forEach(function (segment, i, match) {
    var instruction = methods[segment[0].toLowerCase()]
      , coords = segment.slice(1).trim().split(/,| /g)

    if (! instruction) return
    if (instruction.name == 'closePath' && match[i+1]) return instruction.call(buffer, match[i+1])

    if ('function' == typeof instruction)
      coords.length == 1 ? instruction.call(buffer, coords) : twoEach(coords, instruction, buffer)
    else
      console.error(instruction + ' ' + segment[0] + ' is not yet implemented')
  })

  return buffer
}

var pos

function moveTo(x, y) {
  pos = [x, y]
}

function lineTo(x, y) {
  this.push(pos[0], pos[1], x, y)
  pos = [x, y]
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
