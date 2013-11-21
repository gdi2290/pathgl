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
, opacity: [1]
, resolution: [innerWidth, innerHeight]
, scale: [1, 1]
, mouse: pathgl.mouse = [0, 0]
}

pathgl.fragment = [ "precision mediump float;"
                  , "uniform vec4 rgb;"
                  , "uniform float time;"
                  , "uniform float opacity;"
                  , "uniform vec2 resolution;"

                  , "void main(void) {"
                  , "  gl_FragColor = vec4(rgb.xyz, opacity);"
                  , "}"
                  ].join('\n')

pathgl.vertex = [ "precision mediump float;"
                , "attribute vec3 aVertexPosition;"
                , "uniform vec2 xy;"
                , "uniform vec2 resolution;"
                , "uniform vec2 rotation;"
                , "uniform vec2 scale;"

                , "void main(void) {"

                , "vec3 pos = aVertexPosition;"
                , "pos.y = resolution.y - pos.y;"

                , "vec3 scaled_position = pos * vec3(scale, 1.0);"

                , "vec2 rotated_position = vec2(scaled_position.x * rotation.y + scaled_position.y * rotation.x, "
                + "scaled_position.y * rotation.y - scaled_position.x * rotation.x);"

                , "vec2 position = vec2(rotated_position.x + xy.x, rotated_position.y - xy.y );"

                , "vec2 zeroToOne = position / resolution;"
                , "vec2 zeroToTwo = zeroToOne * 2.0;"
                , "vec2 clipSpace = zeroToTwo - 1.0;"

                , "gl_Position = vec4(clipSpace, 1, 1);"

                , "}"
                ].join('\n')

this.pathgl = pathgl
this.programs = {}

function pathgl(canvas) {
  var gl, program

  canvas = 'string' == typeof canvas ? d3.select(canvas).node() :
    canvas instanceof d3.selection ? canvas.node() :
    canvas

  pathgl.initShaders = initShaders
