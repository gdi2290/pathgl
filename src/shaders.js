pathgl.vertexShader = [
  'precision mediump float;'
, 'attribute vec4 pos;'
, 'attribute vec4 fill;'
, 'attribute vec4 stroke;'

, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'

, 'void main() {'
, '    gl_Position.xy = pos.xy;'
, '    gl_PointSize = pos.z * 2.;'

, '    v_fill = fill;'
, '    v_stroke = stroke;'
, '}'
].join('\n')

pathgl.fragmentShader = [
  'precision mediump float;'
, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'
, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
, '    if (dist > 0.5) discard;'
, '    gl_FragColor = dist > .4 ? v_stroke : v_fill;'
, '}'
].join('\n')
