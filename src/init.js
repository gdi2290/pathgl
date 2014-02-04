var stopRendering = false

pathgl.stop = function () { stopRendering = true }

function init(c) {
  canvas = c
  gl = initContext(canvas)
  program = initProgram()
  monkeyPatch(canvas)
  bindEvents(canvas)
  flags(canvas)
  d3.timer(drawLoop)
  return gl ? canvas : null
}

function flags () {
  gl.disable(gl.SCISSOR_TEST)
  gl.colorMask(true, true, true, true)
  gl.stencilMask(1, 1, 1, 1)
  gl.disable(gl.BLEND)
  gl.enable(gl.CULL_FACE)
}

function bindEvents(canvas) {
  setInterval(function () {
    pathgl.uniform('resolution', [canvas.width, canvas.height])
  }, 50)
  d3.select(canvas).on('mousemove.pathgl', mousemoved)
}

function mousemoved() {
  var m = d3.mouse(this)
  pathgl.uniform('mouse', [m[0], m[1]])
}

function monkeyPatch(canvas) {
  return extend(canvas, {
    appendChild: appendChild
  , querySelectorAll: querySelectorAll
  , querySelector: function (s) { return this.querySelectorAll(s)[0] }
  , removeChild: removeChild
  , insertBefore: insertBefore

  , gl: gl
  , __scene__: []
  , __pos__: []
  , __program__: void 0
  })
}

function initContext(canvas) {
  var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  return gl && extend(gl, { viewportWidth: canvas.width, viewportHeight: canvas.height })
}
