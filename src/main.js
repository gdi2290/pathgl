pathgl.supportedAttributes =
  [ 'd'
  , 'stroke'
  , 'strokeWidth'
  , 'fill'
  ]

pathgl.shaderParameters = {
  rgb: [0, 0, 0, 0]
, xy: [0, 0]
, time: [0]
, rotation: [0, 1]
, resolution: [innerWidth, innerHeight]
, scale: [1, 1]
, mouse: pathgl.mouse = [0, 0]
}


pathgl.fragment = [ "precision mediump float;"
                  , "uniform vec4 rgb;"
                  , "uniform float time;"
                  , "uniform vec2 resolution;"
                  , "void main(void) {"
                  , "  gl_FragColor = rgb;"
                  , "}"
                  ].join('\n')

pathgl.vertex = [ "attribute vec3 aVertexPosition;"
                , "uniform mat4 uPMatrix;"
                , "uniform vec2 xy;"
                , "uniform vec2 resolution;"
                , "uniform vec2 rotation;"
                , "uniform vec2 scale;"

                , "void main(void) {"

                , "vec3 scaled_position = aVertexPosition * vec3(scale, 1.0);"

                , "vec2 rotated_position = vec2(scaled_position.x * rotation.y + scaled_position.y * rotation.x, "
                + "scaled_position.y * rotation.y - scaled_position.x * rotation.x);"

                , "vec2 position = vec2(rotated_position.x +xy.x, rotated_position.y + xy.y );"

                , "vec2 zeroToOne = position / resolution;"
                , "vec2 zeroToTwo = zeroToOne * 2.0;"
                , "vec2 clipSpace = zeroToTwo - 1.0;"

                , "gl_Position = vec4(clipSpace, 1, 1);"

                , "}"
                ].join('\n')

function pathgl(canvas) {
  var gl, program

  canvas = 'string' == typeof canvas ? d3.select(canvas).node() :
    canvas instanceof d3.selection ? canvas.node() :
    canvas

  pathgl.initShaders = initShaders

  this.pathgl = pathgl

  var attrDefaults = {
    rotation: [0, 1]
  , translate: [0, 0]
  , scale: [1, 1]
  , cx: 0
  , cy: 0
  }

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

  return init(canvas)
