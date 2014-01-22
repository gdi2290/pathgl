d3.scale.linear()
.domain([0, canvas.width])
.range([-1, 1])

d3.scale.linear()
.domain([0, canvas.height])
.range([1, -1])

var proto = {
  circle: { r: function (v) {
              this.posBuffer[this.indices[0] + 2] = v
            }
          , cx: function (v) {
              this.posBuffer[this.indices[0] + 0] = xScale(v)

            }
          , cy: function (v) {
              this.posBuffer[this.indices[0] + 1] = yScale(v)
            }
          , cz: function (v) {
              this.posBuffer[this.indices[0] + 3] = v
            }
          , fill: function (v) {
              var fill = d3.rgb(v)
              colorBuffer[this.indices[0] / 4] = parseInt(fill.toString().slice(1), 16)
            }

          , stroke: function (v) {
              return;
              var fill = d3.rgb(v)
              colorBuffer[this.indices[0] / 4] = + fill.toString().slice(1)
            },
            opacity: function () {
            }

          , buffer: pointBuffer
          , posBuffer: pointPosBuffer
          , schema: ['cx', 'cy', 'r', 'cz']
          }
, ellipse: { cx: noop, cy: noop, rx: noop, ry: noop } //points
, rect: { width: noop, height: noop, x: noop, y: noop, rx: roundedCorner, ry:  roundedCorner}

, image: { 'xlink:href': noop, height: noop, width: noop, x: noop, y: noop }

, line: { x1: function (v) { this.posBuffer[this.indices[0] * 2] = xScale(v) }
        , y1: function (v) { this.posBuffer[this.indices[0] * 2 + 1] = yScale(v) }
        , x2: function (v) { this.posBuffer[this.indices[1] * 2] = xScale(v) }
        , y2: function (v) { this.posBuffer[this.indices[1] * 2  + 1] = yScale(v) }
        , buffer: lineBuffer
        , posBuffer: linePosBuffer
        , stroke: function (v) {
            var fill = d3.rgb(v)
            this.indices.forEach(function (i) {
              colorBuffer[i] = parseInt(fill.toString().slice(1), 16)
            })
           }
        }
, path: { d: buildPath
        , pathLength: noop
        , buffer: lineBuffer
        , posBuffer: linePosBuffer
        , stroke: function (v) {
            var fill = d3.rgb(v)
            this.indices.forEach(function (i) {
              colorBuffer[i / 2] = + parseInt(fill.toString().slice(1), 16)
            })
          }
        }

, polygon: { points: noop }
, polyline: { points: noop }
, g: { appendChild: function (tag) { this.children.push(appendChild(tag)) },  ctr: function () { this.children = [] } }
, text: { x: noop, y: noop, dx: noop, dy: noop }
}
var baseProto = extend(Object.create(null), {
  querySelectorAll: querySelectorAll
, children: Object.freeze([])
, ctr: constructProxy
, querySelector: function (s) { return this.querySelectorAll(s)[0] }
, createElementNS: noop
, insertBefore: noop
, ownerDocument: { createElementNS: noop }
, render: function render(node) {
  this.buffer && drawFill(this)
  drawStroke(this)
}
, previousSibling: function () { canvas.scene[canvas.__scene__.indexOf(this) - 1] }
, nextSibling: function () { canvas.scene[canvas.__scene__.indexOf()  + 1] }
, parent: function () { return __scene__ }

, fill: function (val) {
    isId(val) && initShader(d3.select(val).text(), val)
  }

, transform: function (d) {
    var parse = d3.transform(d)
      , radians = parse.rotate * Math.PI / 180

    if (parse.rotate) delete parse.translate//fixme

    extend(this.attr, parse, { rotation: [ Math.sin(radians), Math.cos(radians) ] })
  }

, stroke: function (val) {
    isId(val) && initShader(d3.select(val).text(), val)
  }

, getAttribute: function (name) {
    return this.attr[name]
  }

, setAttribute: function (name, value) {
    this.buffer.changed = true
    this.attr[name] = value
    this[name] && this[name](value)
  }

, style: { setProperty: noop }

, removeAttribute: function (name) {
    delete this.attr[name]
  }

, textContent: noop
, removeEventListener: noop
, addEventListener: event
})

var roundedCorner = noop

var types = [
  function circle () {}
, function rect() {}
, function path() {}
, function ellipse() {}
, function line() {}
, function path() {}
, function polygon() {}
, function polyline() {}
, function rect() {}

, function image() {}
, function text() {}
, function g() {}
, function use() {}
].reduce(function (a, type) {
              a[type.name] = constructProxy(type)
              type.prototype = extend(Object.create(baseProto), proto[type.name])
              return a
            }, {})

function buildPath (d) {
  parse.call(this, d, this.stroke(this.attr.stroke))
  this.stroke(this.attr.stroke)
}

function insertBefore(node, next) {
  var scene = canvas.__scene__
    , i = scene.indexOf(next)
  reverseEach(scene.slice(i, scene.push(0)),
              function (d, i) { scene[i] = scene[i - 1] })
  scene[i] = node
}

function appendChild(el) {
  return types[el.tagName.toLowerCase()](el)
}

function removeChild(el) {
  var i = this.__scene__.indexOf(el)

  this.__scene__.splice(i, 1)

  for(var k = 0; k < 4; k++)
    el.buffer[el.index + k] = 0

  el.buffer.changed = true
  el.buffer.count -= 1
}

var attrDefaults = {
  rotation: [0, 1]
, translate: [0, 0]
, scale: [1, 1]
, fill: 0
, stroke: 0
, 'stroke-width': 2
, cx: 0
, cy: 0
, x: 0
, y: 0
, opacity: .999
}

for (var i  = 0; i < lineBuffer.length; i+=3) {
  lineBuffer[i] = i / 3
  lineBuffer[i + 1] = i / 3
  lineBuffer[i + 2] = i / 3
}

function constructProxy(type) {
  return function (el) {
    var child = new type()
      , buffer = child.buffer

    canvas.__scene__.push(child)

    var numArrays = 4

    child.attr = Object.create(attrDefaults)
    child.tag = el.tagName.toLowerCase()
    child.parentNode = child.parentElement = canvas

    var i = child.indices =
      type.name == 'line' ? [buffer.count, buffer.count + 1] :
      type.name == 'circle' ? [buffer.count * 4] :
      []

    i.forEach(function (i) {
      buffer[i] = buffer.count + i % 2
    })

    if (type.name !== 'path') {
      buffer.count += type.name == 'line' ? 2 : 1
    }

    return child
  }
}

var e = {}
//keep track of what element is being hovered over
function event (type, listener) {
  if (! e[type]) {
    d3.select('canvas').on(type, function () {
      this.__scene__.filter(function () {
        //check what shape cursor is on top of
        //if the id is in e[type], dispatch listener
      })
    })
    e[type] = []
  }
  e[type].push(this.id)
}