examples.map = function (selector) {
  var width = size.width,
      height = size.height,
      rotate = [10, -10],
      velocity = [.03, -.001],
      time = Date.now();

  var proj = d3.geo.albers().scale(158).translate([size.width / 2, size.height / 2]).precision(.1)
    , path = d3.geo.path().projection(proj)

  var graticule = d3.geo.graticule();

  var svg = d3.select(selector)
            .attr("width", width)
            .attr("height", height)
            .call(pathgl)

  svg.append("path")
  .datum(graticule)
  .attr("class", "graticule")
  .attr("d", path)
  .attr('stroke', 'green')

  //   var g = d3.select(selector)
  //           .attr(size)
  //           .call(pathgl)

  // svg.append('path')
  // .attr('class', 'graticule noclick')
  // .datum(d3.geo.graticule())
  // .attr('d', path)
  // .attr('stroke', 'red')
  // .attr('fill', 'none')

  //d3.json('/examples/world-50m.json', draw_world)
  //d3.csv('/examples/hist.csv', draw_history)

  function mouseover(d) {
    d3.select('.title').text(d.title + ' ' + d.year + ', '  + d.event);
  }

  function draw_world(err, world) {


    // g.selectAll("path")
    // .data(topojson.feature(world, world.objects.countries).features)
    // .enter().append("path")
    // .attr({ class: 'world'
    //       , d: path
    //       , fill: 'white'
    //       , stroke: 'blue'
    //       })
  }

  function draw_history(err, hist) {
    var dates, m, to
      , from = -500

    d3.select('body')
    .append('div')
    .attr('class', 'current_year')

    var num = {}

    hist.forEach(function (d) {
      num[d.year] = (num[d.year] || 0) + 1
    })

    var x = d3.scale.linear()
            .domain([-500, 2030])
            .range([0, size.width])

    var y = d3.scale.pow().exponent(.7)
            .domain([0, d3.max(d3.values(num))])
            .range([size.width * .99, size.height * .8])

    // var slider =
    //   d3.select(selector)
    //   .style('height', y.range()[0]  + 'px')
    //   .attr('class', 'slider')

    // var area = d3.svg.area()
    //            .x(function (d) { return x(+d.year) })
    //            .y0(y.range()[0])
    //            .y1(function (d) { return y(num[+d.year]) })

    // slider
    // .append('path').datum(hist)
    // .attr('class', 'slider')
    // .attr('stroke', 'indianred')
    // .attr('d', area)

    // slider
    // .on('click', function () { from = ~~ x.invert(+d3.mouse(this)[0]) })
    // .on('mousemove', function () {
    //   d3.select('line').attr('stroke-width', 2)
    //   .attr('transform','translate('+d3.mouse(this)[0]+',0)')
    // })
    // .on('mouseout', function ( ){ d3.select('line').attr('stroke-width',1) })

    // slider.append('line')
    // .attr('stroke', 'pink')
    // .attr('y1', y.range()[0])
    // .attr('y2', y.range()[1])

    d3.select('body').insert('p', '*')
    .attr('class', 'title')
    .style({ color: 'white'
           , position: 'absolute'
           , top: 475 + 'px'
           , left: 150 + 'px'
           , width: "35%"
           , 'font-size': '10px'
           , 'text-anchor': 'end'
           })

    hist = hist.sort(function(a, b) { return a.year - b.year })

    dates = hist
            .map(function(d) { return d.location = proj(d.location.split(' ').map(parseFloat).reverse()) || d })
            .filter(function(d) { return d < 2010 })

    function forward() {
      return
      document.title = from = from > 2010 ? -500 : from + 1

      //d3.select('line').attr('transform', 'translate(' + x(from) + ',0)')
      d3.select('.current_year').text(from < 0 ? '' + Math.abs(+from) + ' BC' : from)

      d3.select(selector)
      .selectAll('.nil')
      .data(hist.filter(function(d) { return from === +d.year }))
      .enter()
      .append('circle')
      .on('mouseover', mouseover)
      .attr({ class:'point'
            , fill: function(){ return d3.hsl(Math.random()*360, 1, 0.5) }
            , stroke: function(d){ return d.fill }
            , cx: function(d){ return d.location[0] }
            , cy: function(d){ return d.location[1] }
            , r: 0
            , opacity : 0.85
            , 'stroke-opacity': 0.5
            })
      .transition()
      .ease('cubic')
      .duration(2500)
      .attr('opacity', 0)
      .attr('r', 15)
      .remove()
    }

    window.int = setInterval(forward, 50)
  }

  function extend(target, source) { for(var i in source) target[i] = source[i] }
  function rand_num(n) { return ~~ (Math.random() * n) }
  function rand_color() { return 'RGB(' + [255, 255, 255].map(rand_num).toString() + ')' }
}
