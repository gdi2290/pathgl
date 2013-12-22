var rectVertex = [
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

var rectFragment = [
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