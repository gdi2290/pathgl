var attrDefaults = {
  rotation: [0, 1]
, translate: [0, 0]
, scale: [1, 1]
, cx: 0
, cy: 0
}

function svgDomProxy(el, canvas) {
  if (! (this instanceof svgDomProxy)) return new svgDomProxy(el, this);

  canvas.__scene__.push(this)

  this.tagName = el.tagName
  this.id = canvas.__id__++
  this.attr = Object.create(attrDefaults)
  this.parentElement = canvas
}

function querySelector(query) {
  return this.querySelectorAll(query)[0]
}

function querySelectorAll(query) {
  return this.__scene__
}

var types = []

svgDomProxy.prototype =
    {
      r: function () {
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
        function integer(i) { return + i }
        function identity(i) { return i }

        if (this.tagName != 'PATH') return drawPolygon.call(this, this.buffer)

        if (! this.buffer)
          this.buffer = toBuffer(this.path.coords
                                 .map(function (d) { return d.map(integer).filter(identity) })
                                 .map(function (d) { d.push(0); return d })
                                 .filter(function (d) { return d.length == 3 }))

        drawPolygon.call(this, this.buffer)
      }

    , transform: function (d) {
        var parse = d3.transform(d)
          , radians = parse.rotate * Math.PI / 180
          , rotation = { rotation: [ Math.sin(radians), Math.cos(radians) ] }

        extend(this.attr, parse, rotation)

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
        ctx.lineWidth(value)
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

function buildBuffer(points){
  var buffer = ctx.createBuffer()
  ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
  ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(points), ctx.STATIC_DRAW)
  buffer.numItems = points.length / 3
  return buffer
}

var flatten = function(input) {
  return input.reduce(flat, [])
}

function flat(acc, value) {
  return (Array.isArray(value) ? [].push.apply(acc, value) : acc.push(value)) && acc
}

var memo = {}
function circlePoints(r) {
  if (memo[r]) return memo[r]

  var a = []
  for (var i = 0; i < 360; i+=18)
    a.push(50 + r * Math.cos(i * Math.PI / 180),
           50 + r * Math.sin(i * Math.PI / 180),
           0
          )

  return memo[r] = a
}

function toBuffer (array) {
  return buildBuffer(flatten(array))
}
