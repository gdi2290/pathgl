this.pathgl = pathgl

pathgl.supportedAttributes =
  [ 'd'
  , 'stroke'
  , 'strokeWidth'
  , 'fill'
  ]

function pathgl(canvas) {
  var gl, program, programs = {}
  this.programs = program
  canvas = 'string' == typeof canvas ? d3.select(canvas).node() :
    canvas instanceof d3.selection ? canvas.node() :
    canvas

  pathgl.initShaders = initShaders
