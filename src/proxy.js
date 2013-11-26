function insertBefore(node, next) {}

function appendChild(el) {
  return new svgDomProxy(el, this)
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

function svgDomProxy(el, canvas) {
  canvas.__scene__.push(this)

  this.tagName = el.tagName
  this.id = canvas.__id__++
  this.attr = Object.create(attrDefaults)
  this.parentNode = this.parentElement = this.canvas = canvas
  this.gl = canvas.gl
}

svgDomProxy.prototype =
  {
    x: function () {}
  , y: function () {}

  , querySelectorAll: noop
  , querySelector: noop
  , createElementNS: noop
  , insertBefore: noop
  , ownerDocument: { createElementNS: noop }
  , nextSibling: function () { canvas.scene[canvas.__scene__.indexOf()  + 1] }

  , height: function () {
      addToBuffer(this)
      this.path.coords = rectPoints(this.attr.width, this.attr.height)
      if (this.attr.stroke) [].push.apply(this.path, lineBuffers(this.path.coords))
      this.buffer = buildBuffer(this.path.coords)
      drawPolygon.call(this, this.buffer)
    }
  , width: function () {

    }

  , r: function () {
      addToBuffer(this)
      this.path.coords = circlePoints(this.attr.r)
      this.buffer = buildBuffer(this.path.coords)
      drawPolygon.call(this, this.buffer)
    }

  , cx: function (cx) {
      this.buffer && drawPolygon.call(this, this.buffer)
    }

  , cy: function (cy) {
      this.buffer && drawPolygon.call(this, this.buffer)
    }

  , fill: function (val) {
      isId(val) && initShaders(d3.select(val).text(), val)
    }

  , transform: function (d) {
      var parse = d3.transform(d)
        , radians = parse.rotate * Math.PI / 180

      extend(this.attr, parse, { rotation: [ Math.sin(radians), Math.cos(radians) ] })

      render()
    }

  , d: function (d) {
      this.path && extend(this.path, { coords: [], length: 0 })

      parse.call(this, d)

      if (! this.buffer) this.buffer = toBuffer(this.path.coords)

      drawPolygon.call(this, this.buffer)
    }

  , stroke: function (d) {
      render()
    }

  , 'stroke-width': function (value) {
      gl.lineWidth(value)
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

var circleProto = extend(Object.create(svgDomProxy), {
  r: noop
, cx: noop
, cy: noop
})

var pathProto = extend(Object.create(svgDomProxy), {
  d: noop
})

var rect = extend(Object.create(svgDomProxy), {
  height: noop
, width: noop
, rx: noop
, ry: noop
, x: noop
, y: noop
})

//rect, line, group, text, image
