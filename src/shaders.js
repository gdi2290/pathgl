pathgl.vertexShader = [
  'precision mediump float;'
, 'attribute vec4 pos;'
, 'attribute vec4 fill;'
, 'attribute vec4 stroke;'

, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'

, 'void main() {'
, '    gl_Position = vec4(pos.xy, 1., 1.);'
, '    gl_PointSize = pos.z * 2.;'

, '    v_fill = fill  + stroke;'
, '    v_stroke = vec4(1,1,1,1);'
, '}'
].join('\n')

pathgl.fragmentShader = [
  'precision mediump float;'
, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'
, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
//, '    if (dist > 0.5) discard;'
, '    gl_FragColor = v_stroke;'
, '}'
].join('\n')
