var lineVertex = [
  'precision mediump float;'
, 'attribute vec2 attr;'
, 'varying vec3 rgb;'
, 'vec3 unpack_color(float f) {'
, '    vec3 color;'
, '    color.b = mod(f, 1e3);'
, '    color.g = mod(f / 1e3, 1e3);'
, '    color.r = mod(f / 1e6, 1e3);'
, '    return (color - 100.) / 255.;'
, '}'
, 'vec3 unpack_pos(float f) {'
, '    vec3 color;'
, '    color.b = mod(f, 1e3);'
, '    color.g = mod(f / 1e3, 1e3);'
, '    color.r = mod(f / 1e6, 1e3);'
, '    return (color - 100.) / 255.;'
, '}'
, 'void main() {'
, '    gl_Position = vec4(attr.xy, 1., 1.);'
, '    rgb = vec3(.5, .5, 1.);'
, '}'
].join('\n')

var lineFragment = [
  'precision mediump float;'
, 'varying vec3 rgb;'
, 'uniform float opacity;'
, 'void main() {'
, '    gl_FragColor = vec4(rgb, 1.);'
, '}'
].join('\n')

var lineBuffer = new Float32Array(1e4)
lineBuffer.size = 0
window.lb = lineBuffer
var lb
function drawLines(){return
  if (program.name !== 'line') gl.useProgram(program = programs.line)

  if (! lb) {
    gl.bindBuffer(gl.ARRAY_BUFFER, lb = gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, lineBuffer, gl.DYNAMIC_DRAW)
  } else {
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineBuffer)
  }

  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.drawArrays(gl.LINES, (lineBuffer.length - (lineBuffer.size * 4)) / 2, lineBuffer.size * 2)
}