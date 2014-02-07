var rgb = function (v) {
  return d3.rgb(v)
}

function parseColor (v) {
  return + parseInt((rgb(v).toString()).slice(1), 16)
}
