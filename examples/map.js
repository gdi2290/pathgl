var size = {width: 960, height: 500}
  , projection = d3.geo.albersUsa().scale(1070)
  , path = d3.geo.path().projection(projection)
  , svg = d3.select("canvas").attr(size).call(pathgl)
  , centered

d3.json("examples/us.json", renderMap)

function renderMap(err, data) {
  svg.selectAll("path")
  .data(topojson.feature(data, data.objects.states).features)
  .enter().append("path")
  .on("click", clicked)
  .attr('d', path)
  .attr('stroke', 'red')
  .attr('fill', '#rgb') //TODO
  .transition().duration(0).delay(function (d, i) { return i * 300 })
  .attrTween('fill', function () { return random_shader } )
}

function clicked(d) {
  var x, y, k

  if (d && centered !== d) {
    var centroid = path.centroid(d)
    x = centroid[0]
    y = centroid[1]
    k = 4
    centered = d
  } else {
    x = size.width / 2
    y = size.height / 2
    k = 1
    centered = null
  }

  svg.selectAll("path")
  .classed("active", centered && function(d) { return d === centered; })

  svg.transition().duration(750)
  .style("stroke-width", 1.5 / k + "px")
  .attr("transform",
        "translate(" + size.width / 2 + "," + size.height / 2 +
        ")scale(" + k + ")translate(" + -x + "," + -y + ")")
}

function random_shader () {
  var selection = d3.selectAll('div[id]')[0].map(function (x) { return '#' + x.id })
  return selection[~~ (Math.random() * (selection.length - 1))]
}