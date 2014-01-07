d3.scale.linear()
.domain([0, canvas.width])
.range([-1, 1])

d3.scale.linear()
.domain([0, canvas.height])
.range([1, -1])

var x  = function (x) {
  return 2 * (x / canvas.width) - 1
}

var y = function (y) {
  return 1 - ((y / canvas.height) * 2)
}

var proto = {
  circle: { r: function (v) {
              pointPosBuffer[this.index + 2] = v
            }
          , cx: function (v) {
              pointPosBuffer[this.index + 0] = x(v)

            }
          , cy: function (v) {
              pointPosBuffer[this.index + 1] = y(v)
            }
          , fill: function (v) {
              var fill = d3.rgb(v)
              colorBuffer[this.index + 0] = fill.r / 256
              colorBuffer[this.index + 1] = fill.g / 256
              colorBuffer[this.index + 2] = fill.b / 256
              colorBuffer[this.index + 3] = this.attr.opacity
            }

          , stroke: function (v) {
              return;
              var fill = d3.rgb(v)
              colorBuffer[this.index + 0] = + fill.toString().slice(1)
            },
            opacity: function () {
              colorBuffer[this.index + 3] = this.attr.opacity
            }

          , buffer: pointBuffer
          }
, ellipse: { cx: noop, cy: noop, rx: noop, ry: noop } //points
, rect: { width: noop, height: noop, x: noop, y: noop, rx: roundedCorner, ry:  roundedCorner} //point

, image: { 'xlink:href': noop, height: noop, width: noop, x: noop, y: noop } //point

, line: { x1: function (v) { linePosBuffer[this.index + 0] = x(v) }
        , y1: function (v) { linePosBuffer[this.index + 1] = y(v) }
        , x2: function (v) { linePosBuffer[this.index + 2] = x(v) }
        , y2: function (v) { linePosBuffer[this.index + 3] = y(v) }
        , buffer: lineBuffer
        , stroke: function (v) {
            var fill = d3.rgb(v)
            colorBuffer[this.index + 0] = parseInt(fill.toString().slice(1), 16)
          }
        }
, path: { d: buildPath, pathLength: buildPath } //lines
, polygon: { points: noop } //lines
, polyline: { points: noop } //lines
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


function buildLine () {}
function buildPath () {
  parse.call(this, this.attr.d)
  this.buffer = toBuffer(this.path.coords)
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

function constructProxy(type) {
  return function (el) {
    var child = new type()
      , buffer = child.buffer

    canvas.__scene__.push(child)

    var numArrays = 4

    child.attr = Object.create(attrDefaults)
    child.tag = el.tagName.toLowerCase()
    child.parentNode = child.parentElement = canvas
    child.index = (buffer.count * numArrays)

    buffer[child.index] = buffer.count
    buffer[child.index + 1] = buffer.count
    buffer[child.index + 2] = buffer.count
    buffer[child.index + 3] = buffer.count
    buffer.count += 1

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