var width = 960,
    height = 500,
    centered;

var projection = d3.geo.albersUsa()
    .scale(1070)
    .translate([width / 2, height / 2]);
var ppp =  d3.geo.path()
  .projection(projection);

var path = function (d) {
  //console.log(ppp(d))
  return ppp(d)
}

var svg = d3.select("#map")
    .attr("width", width)
    .attr("height", height).call(pathgl)

// svg.append("rect")
//     .attr("class", "background")
//     .attr("width", width)
//     .attr("height", height)
//     .on("click", clicked);

d3.json("examples/us.json", function(error, us) {
  // g.append("g")
  //     .attr("id", "states")
  svg.selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
  .attr('d', path)
    .attr('stroke', 'red')
    .attr('fill', 'pink')

  d3.select('#map').selectAll('path')
  .attr('fill', '#rgb')
  .transition().duration(0).delay(function (d, i) { return i * 300 })
  .attrTween('fill', function () {
    return random_shader
  })
//      .on("click", clicked);

  // svg.append("path")
  // .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
  // .attr("d", path)
  // .attr('stroke', 'red')
  // .attr('stroke-width', 2.5)
  // .attr('fill', 'blue')
  // .attr('opacity', .5)
});

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}
