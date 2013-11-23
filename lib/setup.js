//yeah oh yeah oh yeah oooh yeah

window.onload = function () {
  window.history.replaceState('', '', '/')
}

d3.selectAll('li').on('click', function () {
  var title = this.textContent.trim().toLowerCase().replace(' ', '_')
  d3.text('/examples/' + title + '.js', function (err, data) {
    if (err) throw err
    eval(data)
    if (! window.location.href.match('localhost')) window.history.replaceState(0, 0, title)
  })
})
