function svgDomProxy(el, canvas) {
  if (! (this instanceof svgDomProxy)) return new svgDomProxy(el, this);

  canvas.__scene__.push(this)

  this.tagName = el.tagName
  this.id = canvas.__id__++
  this.attr = Object.create(attrDefaults)
  this.parentElement = this.canvas = canvas
  this.gl = canvas.gl
}

function querySelector(query) {
  return this.querySelectorAll(query)[0]
}

function querySelectorAll(query) {
  return this.__scene__
}

var circleProto = extend(Object.create(svgDomProxy), {
  r: noop
, cx: noop
, cy: noop
})

var pathProto = extend(Object.create(svgDomProxy), {
  d: noop
})

var rect = extend(Object.create(svgDomProxy), {
  height: noop
, width: noop
, rx: noop
, ry: noop
, x: noop
, y: noop
})

//rect, line, group, text, image



var memo = {}
function circlePoints(r) {
  if (memo[r]) return memo[r]

  var a = []
  for (var i = 0; i < 360; i+=18)
    a.push(50 + r * Math.cos(i * Math.PI / 180),
           50 + r * Math.sin(i * Math.PI / 180),
           0
          )

  return memo[r] = a
}
