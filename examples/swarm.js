d3.select('canvas')
.attr(size).call(pathgl)
.selectAll("circle")
.data(d3.range(2e5))
.enter().append("circle")
.attr('fill', random_hue)
.attr('cx', function (d, i) { return d / 1e8 })
.attr('cy', function (d, i) { return (2e5  -  d) / 20000 })
.attr('cz', function (d) { return d })
.attr('r', function (d, i) { return d % 1000 })
.shader({
  cx: 'resolution.x / 2. + cos(pos.w + clock * pos.x) * pos.z * 10.;'
, cy: 'resolution.y / 2. + sin(pos.w + clock * pos.x) * pos.z * 10.;'
, stroke: 'vec4(unpack_color(stroke) * .5 + vec3(mouse.x / resolution.x, mouse.y / resolution.y, fract(sin(dot(pos.yx ,vec2(12.9898,78.233))) * 43758.5453)), 1.);'
, radius: 'pos.y + (pos.x) * max(distance(x, mouse.x)/ resolution.x, distance(y, mouse.y) / resolution.y)'
})

function random_hue () { return "hsl(" + Math.random() * 360 + ",100%, 50%)" }
