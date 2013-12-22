var circleVertex = [
  'precision mediump float;'
, 'attribute vec4 attr;'
, 'attribute vec4 testvert;'
, 'uniform vec2 resolution;'
, 'varying vec3 rgb;'
, 'vec3 parse_color(float f) {'
, '    vec3 color;'
, '    color.b = mod(f, 1e3);'
, '    color.g = mod(f / 1e3, 1e3);'
, '    color.r = mod(f / 1e6, 1e3);'
, '    return(color - 100.) / 255.;'
, '}'

, 'void main() {'
, '    vec2 normalize = attr.xy / resolution;'
, '    vec2 clipSpace = (normalize * 2.0) - 1.0;'
, '    gl_Position = vec4(clipSpace, 1, 1);'
, '    gl_PointSize = attr.z * 2.;'
, '    rgb = parse_color(attr.w);'
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
, '    gl_FragColor = dist > 0.5 ? vstroke : vec4(rgb, opacity);'
, '}'
].join('\n')

var vbo = canvas.vbo
var packCache = {}
function packRgb(fill) {
  return + (packCache[fill] ||
            (packCache[fill] = d3.values(d3.rgb(fill)).slice(0, 3).map(function (d){ return d + 100 }).join('')))
}

function drawCircles(elapsed) {


  if (! gl.circlesToRender) return
  gl.circlesToRender = false
  var models = canvas.__scene__
                   .filter(function (d) { return d instanceof types['circle'] })
                   .map(function (d) { return d.attr  })

  if (program.name !== 'circle') gl.useProgram(prog = programs.circle)

  var c, buffer = (vbo = new Float32Array(models.length * 4))

  program.setstroke([0,0,0,0])

  for(var i = 0; i < models.length;) {
    var j = i * 4
    c = models[i++]
    buffer[j++] = c.cx
    buffer[j++] = c.cy
    buffer[j++] = c.r
    buffer[j++] = packRgb(c.fill)
  }

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, vbo, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0)
  //gl.enableVertexAttribArray(0);
  gl.drawArrays(gl.POINTS, 0, models.length)

  // var buffer2 = new Float32Array(models.length * 4)
  // for(var i = 0; i < models.length;) {
  //   var j = i * 4
  //   c = models[i++]
  //   buffer2[j++] = c.cy
  //   buffer2[j++] = c.cx
  //   buffer2[j++] = Math.random() * 51
  //   buffer2[j++] = packRgb(c.fill)
  // }

	// gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  // gl.bufferData(gl.ARRAY_BUFFER, buffer2, gl.DYNAMIC_DRAW)
  // gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0)
  // gl.drawArrays(gl.POINTS, 0, models.length)
}

//vbo && vbo.length != models.length ? vbo :
