pathgl.vertexShader = [
  'precision mediump float;'
, 'uniform float type;'
, 'uniform vec2 mouse;'
, 'uniform vec2 dates;'
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
, '    float size;'
, '    if (dates[0] != 6000.) size = (2. * pos.z - (pos.w < dates[0] ? dates[0] - pos.w: '
, '                    abs(dates[1] - pos.w)));'
, '    else size = 2. * pos.z;'
, '    gl_PointSize =  size > 30. ? 10. : size;'

, '    v_type = (fill > 0. ? 1. : 0.);'
, '    v_fill = vec4(unpack_color(fill), 1.);'
, '    v_stroke = vec4(unpack_color(stroke), .5);'
, '}'
].join('\n')

pathgl.fragmentShader = [
  'precision mediump float;'
, 'uniform float type;'
, 'varying vec4 v_stroke;'
, 'varying vec4 v_fill;'

, 'void main() {'
, '    float dist = distance(gl_PointCoord, vec2(0.5));'
, '    if (type == 1. && dist > 0.5) discard;'
, '    gl_FragColor = v_stroke;'
, '}'
].join('\n')

//type
//1 circle
//2 rect
//3 line
//4 path
