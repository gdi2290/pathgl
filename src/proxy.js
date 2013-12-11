function svgDomProxy(el, canvas) {}

//expose this to allow custom shapes??
var types = {

}

var roundedCorner = noop

var proto = {
  circle: { r: buildCircle, cx: noop, cy: noop }
, ellipse: {cx: buildEllipse, cy: buildEllipse, rx: buildEllipse, ry: buildEllipse }
, line: { x1: buildLine, y1: buildLine, x2: buildLine, y2: buildLine }
, path: { d: buildPath, pathLength: buildPath}
, polygon: { points: points }
, polyline: { points: points }
, rect: { width: rectPoints, height: rectPoints, x: noop, y: noop, rx: roundedCorner }
, image: { 'xlink:href': noop, height: noop, width: noop, x: noop, y: noop }
, text: { x: noop, y: noop, dx: noop, dy: noop }
, g: { appendChild: noop }
, image: { 'xlink:href': noop, height: noop, width: noop, x: noop, y: noop }
}

function buildCircle () {
  var a = [], r = this.attr.r
  for (var i = 0; i < 361; i+=18)
    a.push(50 + r * Math.cos(i * Math.PI / 180),
           50 + r * Math.sin(i * Math.PI / 180),
           0)
  this.path = [this.buffer = toBuffer(circlePoints(this.attr.r))]
}

function buildRect() {
  if (! this.attr.width && this.attr.height) return
  addToBuffer(this)
  this.path.coords = rectPoints(this.attr.width, this.attr.height)
  extend(this.path, [buildBuffer(this.path.coords)])
  this.buffer = buildBuffer(this.path.coords)
}

function buildLine () {}
function buildPath () {}
function points () {}
function buildEllipse() {
  return;
  var a = []
  for (var i = 0; i < 361; i+=18)
    a.push(50 + r * Math.cos(i * Math.PI / 180),
           50 + r * Math.sin(i * Math.PI / 180),
           0)
  return a
}

function rectPoints(w, h) {
  return [0,0,0,
          0,h,0,
          w,h,0,
          w,0,0,
         ]
}

svgDomProxy.prototype = {
  querySelectorAll: noop
, querySelector: noop
, createElementNS: noop
, insertBefore: noop
, ownerDocument: { createElementNS: noop }
, nextSibling: function () { canvas.scene[canvas.__scene__.indexOf()  + 1] }

, r: function () {

  }

, fill: function (val) {
    isId(val) && initShader(d3.select(val).text(), val)
  }

, transform: function (d) {
    var parse = d3.transform(d)
      , radians = parse.rotate * Math.PI / 180
    if (parse.rotate) {

      delete parse.translate
      // parse.translate[0] *= -68
      // parse.translate[1] *= 68
    }
    extend(this.attr, parse, { rotation: [ Math.sin(radians), Math.cos(radians) ] })
  }

, d: function (d) {
    parse.call(this, d)
    this.buffer = toBuffer(this.path.coords)
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

  , removeAttribute: function (name) {
      delete this.attr[name]
    }

  , textContent: noop
  , removeEventListener: noop
  , addEventListener: event
  }

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
              a[type.name] = type
              type.prototype = Object.create(svgDomProxy.prototype)
              return a
            }, {})

function insertBefore(node, next) {
  var scene = canvas.__scene__
    , i = scene.indexOf(next)
  reverseEach(scene.slice(i, scene.push('shit')),
                          function (d, i) { scene[i] = scene[i - 1] })

}

function appendChild(el) {
  var self = new types[el.tagName.toLowerCase()]
  canvas.__scene__.push(self)

  self.attr = Object.create(attrDefaults)
  self.tagName = el.tagName
  self.parentNode = self.parentElement = this
  return self
}

function querySelector(query) {
  return this.querySelectorAll(query)[0]
}

function querySelectorAll(query) {
  return this.__scene__.filter(function (node) { return node.tagName.toLowerCase() === query })
}

function removeChild(el) {
  var i = this.__scene__.indexOf(el)
  this.__scene__.splice(i, 1)
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
, opacity: 1
}
var e = {}

//keep track of what element is being hovered over
function event (type, listener) {
  //console.log(this.id)
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