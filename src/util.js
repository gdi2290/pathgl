function extend (a, b) {
  if (arguments.length > 2) [].forEach.call(arguments, function (b) { extend(a, b) })
  else for (var k in b) a[k] = b[k]
  return a
}

function twoEach(list, fn, gl) {
  var l = list.length - 1, i = 0
  while(i < l) fn.call(gl, list[i++], list[i++])
}

function noop () {}

function projection(l, r, b, t, n, f) {
  var rl = r - l
    , tb = t - b
    , fn = f - n

  return [
    2 / rl, 0, 0, 0
  , 0, 2 / tb, 0, 0
  , 0, 0, -2 / fn, 0

  , (l + r) / -rl
  , (t + b) / -tb
  , (f + n) / -fn
  , 1
  ]
}



var flatten = function(input) {
  return input.reduce(flat, [])
}

function flat(acc, value) {
  return (Array.isArray(value) ? [].push.apply(acc, value) : acc.push(value)) && acc
}
