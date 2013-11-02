function pathgl(canvas) {
  canvas = 'string' == typeof canvas ? d3.select(canvas).node() :
    canvas instanceof d3.selection ? canvas.node() :
    canvas


  return init(canvas)
}
pathgl.shaderParameters = {

  rgb: [0, 0, 0, 0]
, xy: [0, 0]
, time: [0]
, rotation: [0, 1]
, resolution: [innerWidth, innerHeight]
, scale: [1, 1]
, mouse: pathgl.mouse = [0, 0]
}

pathgl.initShaders = initShaders

pathgl.supportedAttributes =
  [ 'd'
  , 'stroke'
  , 'strokeWidth'
  ]


var gl

this.pathgl = pathgl
