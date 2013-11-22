//yeah oh yeah oh yeah oooh yeah


d3.select('li').on('click', function () {
  d3.text('/examples/' + this.textContent.toLowerCase() + '.js', function (err, data) { err || eval(data) })
})