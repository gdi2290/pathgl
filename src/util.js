function noop () {}

function extend (a, b) {
  if (arguments.length > 2) [].forEach.call(arguments, function (b) { extend(a, b) })
  else for (var k in b) a[k] = b[k]
  return a
}

function twoEach(list, fn, gl) {
  var l = list.length - 1, i = 0
  while(i < l) fn.call(gl, list[i++], list[i++])
}

function flatten(input) {
  return input.reduce(flat, [])
}

function flat(acc, value) {
  return (Array.isArray(value) ? [].push.apply(acc, value) : acc.push(value)) && acc
}


function isId(str) {
  return str[0] == '#' && isNaN(parseInt(str.slice(1), 16))
}