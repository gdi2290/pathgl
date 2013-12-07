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
  return input.reduce(function (a, b) { return (b && b.map ? [].push.apply(a, b) : a.push(b)) && a },
                      [])
}

function isId(str) {
  return str[0] == '#' && isNaN(parseInt(str.slice(1), 16))
}

function each(obj, fn) {
  for (var key in obj) fn(obj[key], key, obj)
}


function List(data) {
  this.head = data || null
  this.next = null
}

List.prototype = {
  cons: function (data) {
    if (! this.data) this.next = new List(data)
    this.head = data
    return this
  }
, remove: function (data, parent) {
    return (this.next != null) &&
      this.head == data ? this.parent.next = this :
      this.next.remove(data, parent)
  }
, each: function (fn) { fn(this.head), this.next && this.next.each(fn) }
, car: function () { return this.head }
, cdr: function () { return this.tail }
}

function reverseEach(arr, fn) {
  var l = arr.length
  while(l--) fn(arr[l], l)
}