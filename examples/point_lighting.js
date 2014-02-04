examples.swarm = function (selector) {
  var inlining = selector == 'canvas'
  var data = d3.range(selector == 'canvas' ? 2e5 : 2000).map(function() {
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
           .attr("cy", 10)
           .attr('cz', function (d, i) { return i })
           .attr("r", 2)
               .shader({ cx: 'mod(pos.w + clock, 1000.) * 2.;'
                   , cy: 'floor(pos.w / 100.);'
                   })
}

function random_hue () { return "hsl(" + Math.random() * 360 + ",100%, 50%)" }
