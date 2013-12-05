pathgl
======
This is a function that lets you control webgl with d3.

#usage
```
var selector = pathgl('canvas') || 'svg'
d3.select(selector).append('circle')
.attr('r', 100)
.attr('cx',50)
.attr('cy',50)
```
If webgl is available then your circles will be WEBGL, if not, fallback to svg.
It just works.

Alternatively:
```
d3.select('canvas').call(pathgl)
.append('circle')
```

### roadmap ###
* Make path parser comply with spec

* stroke
  [x] thickness
  [] dasharray
  [] length
  [x] opacity
  [x] color

* fill
  [] pattern
  [x] gradient + shaders
  [x] color
  [x] opacity

* antialiasing
* event listeners

* add 2d canvas renderer for phones

###Extensions to d3 syntax
.attr('fill', '#shader') //if fill attr starts with a dot or hash, select the
matching element and evaluate it as a fragment shader


