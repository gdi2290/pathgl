examples.swarm = function (selector) {
  var inlining = selector == 'canvas'
  var data = d3.range(selector == 'canvas' ? 1e4 : 2000).map(function() {
               return { xloc: 0, yloc: 0, xvel: 0, yvel: 0 }
             })

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
           .attr("cx", 10)
           .attr("cy", function (d, i) { return data.negth  -  i})
           .attr('cz', function (d, i) { return i })
           .attr("r", function (d, i) { return i % 100 })
            .shader({
              cx: 'resolution.x / 2. + cos(pos.w + clock * .0001) * pos.z * 3.;'
            , cy: 'resolution.y / 2. + sin(pos.w + clock * .0001) * pos.z * 3.;'
            , stroke: 'vec4(unpack_color(stroke), .6);'
            , radius: '5.;'
                    })
}

function random_hue () { return "hsl(" + Math.random() * 360 + ",100%, 50%)" }
