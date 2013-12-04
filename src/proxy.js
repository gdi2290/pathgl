function svgDomProxy(el, canvas) {}

var types = {
  circle: noop
, ellipse: noop
, line: noop
, path: noop
, polygon: noop
, polyline: noop
, rect: noop

, image: noop
, text: noop
, g: noop
, use: noop
}

var roundedCorner = noop
var proto = {
  circle: { r: circlePoints, cx: noop, cy: noop }
, ellipse: {cx: ellipsePoints, cy: ellipsePoints, rx: ellipsePoints, ry: ellipsePoints}
, line: { x1: buildLine, y1: buildLine, x2: buildLine, y2: buildLine }
, path: { d: buildPath, pathLength: buildPath}
, polygon: { points: points }
, polyline: { points: points }
, rect: { width: rectPoints, height: rectPoints, x: noop, y: noop, rx: roundedCorner }
, image: { 'xlink:href': noop, height: noop, width: noop, x: noop, y: noop }
, text: { x: noop, y: noop, dx: noop, dy: noop }
, g: {}
, image: { 'xlink:href': noop, height: noop, width: noop, x: noop, y: noop }
}

svgDomProxy.prototype = {
  querySelectorAll: noop
, querySelector: noop
, createElementNS: noop
, insertBefore: noop
, ownerDocument: { createElementNS: noop }
, nextSibling: function () { canvas.scene[canvas.__scene__.indexOf()  + 1] }

, height: function () {
    addToBuffer(this)
    this.path.coords = rectPoints(this.attr.width, this.attr.height)
    extend(this.path, [buildBuffer(this.path.coords)])
    this.buffer = buildBuffer(this.path.coords)
  }

,width: function () {
   addToBuffer(this)
   this.path.coords = rectPoints(this.attr.width, this.attr.height)
   extend(this.path, [buildBuffer(this.path.coords)])
   this.buffer = buildBuffer(this.path.coords)
 }

, r: function () {
    this.path = [this.buffer = toBuffer(circlePoints(this.attr.r))]
  }

, fill: function (val) {
    isId(val) && initShaders(d3.select(val).text(), val)
  }

, transform: function (d) {
    var parse = d3.transform(d)
      , radians = parse.rotate * Math.PI / 180

    extend(this.attr, parse, { rotation: [ Math.sin(radians), Math.cos(radians) ] })
  }

, d: function (d) {
    parse.call(this, d)
    this.buffer = toBuffer(this.path.coords)
  }

, stroke: function (val) {
    isId(val) && initShaders(d3.select(val).text(), val)
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
  , addEventListener: noop
  }

var types = [
  function circle () {  }
, function rect() {}
, function path() {}
].reduce(function (a, b) {
              a[b.name] = b
              b.prototype = Object.create(svgDomProxy.prototype)
              return a
            }, {})


function insertBefore(node, next) {}

function appendChild(el) {
  var self = new types[el.tagName.toLowerCase()]
  canvas.__scene__.push(self)

  self.attr = Object.create(attrDefaults)
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

function lineBuffers(polygon) {
  var shit = [], p = polygon
  for(var i = 0; i < polygon.length + 4; i+= 3)
    addLine.call(shit, polygon[i], polygon[i+1], polygon[i+3], polygon[i+4])

  i = polygon.length - 3;
  addLine.call(shit, polygon[i], polygon[i+1], polygon[0], polygon[1])

  return shit
}


//rect, line, group, text, image
