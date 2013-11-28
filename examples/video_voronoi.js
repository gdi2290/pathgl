var vertices = d3.range(100).map(function(d) {
                 return [Math.random() * size.width, Math.random() * size.height]
               })

  , svg = d3.select('canvas')
          .attr(size)
          .call(pathgl)
          .on("mousemove", function() { redraw(vertices[0] = d3.mouse(this)) })

  , path = svg.selectAll("path")
  , voronoi = d3.geom.voronoi()
              .clipExtent([[0, 0], [size.width, size.height]])


svg.selectAll("circle")
.data(vertices.slice(1))
.enter().append("circle")
.attr("transform", function(d) { return "translate(" + d + ")" })
.attr("r", 1.5)

redraw()

function redraw() {
  path = path.data(voronoi(vertices), function (d, i) { return i });

  path.enter().append("path")
  .attr("class", function(d, i) { return "q" + (i % 9) + "-9"; })
  .attr("d", polygon)
  .attr('stroke', '#stone')
  .attr('stroke-width', 10)
  .attr('fill', '#water')

  path
  .filter(function (d) { return this.attr.d !=  polygon(d) })
  .attr("d", polygon)
}

function polygon(d) {
  return "M" + d.join("L") + "Z"
}