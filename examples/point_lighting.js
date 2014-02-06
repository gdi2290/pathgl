examples.swarm = function (selector) {
  var inlining = selector == 'canvas'
  var data = d3.range(selector == 'canvas' ? 1e5 : 2000)

  var width = size.width
    , height = size.height

  var x = d3.scale.linear()
          .domain([-5, 5])
          .range([0, width])

  var y = d3.scale.linear()
          .domain([-5, 5])
          .range([0, height])

  var svg = d3.select(selector)
            .attr('height', height).attr('width', width).attr('class', null)
            .call(pathgl)

  var circle = svg.selectAll("circle")
           .data(data)
           .enter().append("circle")
           .attr('fill', random_hue)
           .pAttr({
             "cx":function (d, i) { return d / 1e8 }
           , "cy": function (d, i) { return (data.length  -  d) / 20000 }
           , 'cz': function (d, i) { return d }
           , "r": function (d, i) { return d % 1000 } })
            .shader({
              cx: 'resolution.x / 2. + cos(pos.w + clock * pos.x) * pos.z * 10.;'
            , cy: 'resolution.y / 2. + sin(pos.w + clock * pos.x) * pos.z * 10.;'
            , stroke: 'vec4(unpack_color(stroke) * .5 + vec3(mouse.x / resolution.x, mouse.y / resolution.y, fract(sin(dot(pos.yx ,vec2(12.9898,78.233))) * 43758.5453)), '
                      + '1.);'
            , radius: 'pos.y;'
            })
}

function random_hue () { return "hsl(" + Math.random() * 360 + ",100%, 50%)" }
