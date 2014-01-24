examples.point_lighting = function (selector) {
  var inlining = selector == 'canvas'
  var data = d3.range(selector == 'canvas' ? 4e4 : 2000).map(function() {
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
            .attr('height', height).attr('width', width)
            .call(pathgl)

  var circle = svg.selectAll("circle")
           .data(data)
           .enter().append("circle")
           .attr('fill', random_hue)
           .attr("cx", 10)
           .attr("cy", 10)
           .attr("r", 50)

  d3.timer(function() {
    circle.each(function(d) {
      d.xvel += 0.04 * (Math.random() - .5) - 0.05 * d.xvel - 0.0004 * d.xloc
      d.yvel += 0.04 * (Math.random() - .5) - 0.05 * d.yvel - 0.0004 * d.yloc

      if (! inlining) return
      this.posBuffer[this.indices[0] + 0] = pathgl.xScale(x(d.xloc += d.xvel))
      this.posBuffer[this.indices[0] + 1] = pathgl.yScale(y(d.yloc += d.yvel))
      this.posBuffer[this.indices[0] + 2] = 1000 * Math.abs(d.xvel * d.yvel)
    })
      if (! inlining)
        circle
        .attr("cx", function(d) { return x(d.xloc += d.xvel) })
        .attr("cy", function(d) { return y(d.yloc += d.yvel) })
        .attr("r", function(d) { return Math.min(2 + 1000 * Math.abs(d.xvel * d.yvel), 10) })
        .attr("fill", function (d) { return d.xvel > -0 ? 'red' : 'steelblue' })
  })

  d3.select('.blurb').text("Compare with http://bl.ocks.org/mbostock/raw/2647924/")
  c.selectAll('circle')
}

function random_hue () { return "hsl(" + Math.random() * 360 + ",100%, 50%)" }
