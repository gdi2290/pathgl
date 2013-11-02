var attrDefaults = {
  rotation: [0, 1]
, translate: [0, 0]
, scale: [1, 1]
, cx: 0
, cy: 0

, x: 0
, y: 0
}

function lineBuffers(polygon) {
  var shit = [], p = polygon
  for(var i = 0; i < polygon.length + 4; i+= 3)
    addLine.call(shit, polygon[i], polygon[i+1], polygon[i+3], polygon[i+4])

  i = polygon.length - 3;
  addLine.call(shit, polygon[i], polygon[i+1], polygon[0], polygon[1])

  return shit
}

svgDomProxy.prototype =
  {
    x: function () {}
  , y: function () {}
  ,
    height: function () {
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
      if (this.tagName != 'PATH') return drawPolygon.call(this, this.buffer)

      if (! this.buffer) this.buffer = toBuffer(this.path.coords)

      drawPolygon.call(this, this.buffer)
    }

  , transform: function (d) {
      var parse = d3.transform(d)
        , radians = parse.rotate * Math.PI / 180

      extend(this.attr, parse, { rotation: [ Math.sin(radians), Math.cos(radians) ] })

      render()
    }

  , d: function (d) {
      this.path && extend(this.path, { coords: [], length: 0 })

      if (d.match(/NaN/)) return console.warn('path is invalid')

      render()

      parse.call(this, d)
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
      this[name](value)
    }

  , removeAttribute: function (name) {
      delete this.attr[name]
    }

  , textContent: noop
  , removeEventListener: noop
  , addEventListener: noop
  }

function svgDomProxy(el, canvas) {
  if (! (this instanceof svgDomProxy)) return new svgDomProxy(el, this);

  canvas.__scene__.push(this)

  this.tagName = el.tagName
  this.id = canvas.__id__++
  this.attr = Object.create(attrDefaults)
  this.parentElement = this.canvas = canvas
  this.gl = canvas.gl
}

function querySelector(query) {
  return this.querySelectorAll(query)[0]
}

function querySelectorAll(query) {
  return this.__scene__
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
