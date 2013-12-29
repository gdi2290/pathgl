var circleVertex = [
  'precision mediump float;'
, 'attribute vec4 attr;'
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
, '    gl_PointSize = attr.z * 2.;'
, '    rgb = unpack_color(attr.w);'
, '}'
].join('\n')

var circleFragment = [
  'precision mediump float;'
, 'varying vec3 rgb;'
, 'uniform vec4 vstroke;'
, 'uniform float opacity;'
, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
, '    if (dist > 0.5) discard;'
, '    gl_FragColor = dist > .40 ? vstroke : vec4(rgb, opacity);'
, '}'
].join('\n')

var packCache = {}
function packColor(fill) {
  return (packCache[fill] ||
          (packCache[fill] = + d3.values(d3.rgb(fill)).slice(0, 3).map(function (d){ return d + 100 }).join('')))
}

var circleBuffer = new Float32Array(20e4)
circleBuffer.size = 0
var buff
function drawPoints(elapsed) {
  if (program.name !== 'circle') gl.useProgram(prog = programs.circle)
  program.setstroke([1,0,0,1])

  if(! buff) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buff = gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, circleBuffer, gl.DYNAMIC_DRAW)
  } else {
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, circleBuffer)
  }

  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0)
  gl.drawArrays(gl.POINTS, 0, circleBuffer.size)
}