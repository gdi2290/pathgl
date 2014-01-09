pathgl.vertexShader = [
  'precision mediump float;'
, 'attribute vec4 pos;'
, 'attribute float fill;'
, 'attribute float stroke;'

, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'
, 'varying float v_type;'

, 'vec3 unpack_color(float col) {'
, '    if (col == 0.) return vec3(0);'
, '    return vec3(mod(col / 256. / 256., 256.),'
, '                mod(col / 256. , 256.),'
, '                mod(col, 256.)) / 256.; }'

, 'void main() {'
, '    gl_Position = vec4(pos.xy, 1., 1.);'
, '    gl_PointSize =  2. * pos.z;'

, '    v_type = (fill > 0. ? 1. : 0.);'
, '    v_fill = vec4(unpack_color(fill), 1.0);'
, '    v_stroke = vec4(unpack_color(stroke), 1.0);'
, '}'
].join('\n')

pathgl.fragmentShader = [
  'precision mediump float;'
, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'
, 'varying float v_type;'

, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
//, '    if (dist > 0.5 && v_type == 1.) discard;'
, '    gl_FragColor = v_stroke;'//v_stroke
, '}'
].join('\n')

//type
//1 circle
//2 rect
//3 line
//4 path
