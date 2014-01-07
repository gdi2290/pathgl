pathgl.vertexShader = [
  'precision mediump float;'
, 'attribute vec4 pos;'
//, 'attribute vec4 fill;'
, 'attribute float stroke;'

, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'

, 'vec3 unpack_color(float col) {'
, '    return vec3(mod(col/ 256. / 256., 256.),'
, '                mod(col/ 256. , 256.),'
, '                mod(col, 256.)); }'

, 'void main() {'
, '    gl_Position = vec4(pos.xy, 1., 1.);'
, '    gl_PointSize =  12.;'

//, '    v_fill = fill;'
, '    v_stroke = vec4(unpack_color(stroke), 1.0);'
, '}'
].join('\n')

pathgl.fragmentShader = [
  'precision mediump float;'
, 'varying vec4 v_stroke;'
//, 'varying vec4 v_fill;'
, 'void main() {'
//, '    float dist = distance(gl_PointCoord, vec2(0.5));'
//, '    if (dist > 0.5) discard;'
, '    gl_FragColor = v_stroke + vec4(.0, .0, .0, .9);'
, '}'
].join('\n')
