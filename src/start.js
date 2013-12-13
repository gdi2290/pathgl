this.pathgl = pathgl

pathgl.stop = d3.functor()

function pathgl(canvas) {
  var gl, program, programs
  if (! canvas.getContext) return console.log(canvas, 'is not a valid canvas')
  canvas = 'string' == typeof canvas ? document.querySelector(canvas) :
    canvas instanceof d3.selection ? canvas.node() :
    canvas
