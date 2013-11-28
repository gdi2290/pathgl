this.pathgl = pathgl

pathgl.supportedAttributes =
  [ 'd'
  , 'stroke'
  , 'strokeWidth'
  , 'fill'
  ]

function pathgl(canvas) {
  var gl, program, programs
  canvas = 'string' == typeof canvas ? document.querySelector(canvas) :
    canvas instanceof d3.selection ? canvas.node() :
    canvas
