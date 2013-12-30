var fxaa = [
  'vec3 fxaa() { '
, '    vec2 texcoords = gl_fragCoord.xy;'
, '    vec2 buf0 = XXX;'
, '    vec2 framebufSize = vec2(XXX, XXX);'
, '    float FXAA_SPAN_MAX = 8.0;'
, '    float FXAA_REDUCE_MUL = 1.0/8.0;'
, '    float FXAA_REDUCE_MIN = 1.0/128.0;'

, '    vec3 rgbNW=texture2D(buf0,texCoords+(vec2(-1.0,-1.0)/frameBufSize)).xyz;'
, '    vec3 rgbNE=texture2D(buf0,texCoords+(vec2(1.0,-1.0)/frameBufSize)).xyz;'
, '    vec3 rgbSW=texture2D(buf0,texCoords+(vec2(-1.0,1.0)/frameBufSize)).xyz;'
, '    vec3 rgbSE=texture2D(buf0,texCoords+(vec2(1.0,1.0)/frameBufSize)).xyz;'
, '    vec3 rgbM=texture2D(buf0,texCoords).xyz;'

, '    vec3 rgbA = (1.0/2.0) * ('
, '        texture2D(buf0, texCoords.xy + (1.0/3.0 - 0.5)).xyz +'
, '        texture2D(buf0, texCoords.xy + (2.0/3.0 - 0.5)).xyz);'

, '    return rgbA'
, '    }'
, ' }'
]
