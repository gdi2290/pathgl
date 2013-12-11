function addNode(node, order) {
  //find last node in order
}

function removeNode(node, order) {
  order.each(function (item, prev, next) {
    if (node == item) prev.next = next
    return true
  })
}

//builds scene without any notion of z
function agressive (arr, attr) {
  return arr.reduce(function (a, b) {
           var val = b[attr]
           (a[val] || (a[val] = [])).push(b)
           return a
         }, {})
}


//builds order-by-model scene graph from table
function scene(arr, attr) {
  var order = {}, next, last
  reverseEach(attr, function (node, index) {
    next = (order[node[attr]] || (order[node[attr]] = new List())).cons(node)
    if (last !== node[attr]) order[last].cons(next)
    last = node.attr.fill
  })
  order.last = order.find(arr[arr.length - 1])
  return order
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
, find: function (data) { return this.each(function (node) { return node.head == data }) }
, each: function (fn, prev) { return fn(this.head, this.next, prev) || this.next && this.next.each(fn) }
, car: function () { return this.head }
, cdr: function () { return this.tail }
}

function reverseEach(arr, fn) {
  var l = arr.length
  while(l--) fn(arr[l], l)
}