# Pathgl [![Build Status](https://travis-ci.org/adnan-wahab/pathgl.png?branch=gh-pages)
Pathgl sits between d3 and the dom and lets you draw to webgl instead of svg.

## Usage
Download the [latest version](http://adnanwahab.org/pathgl/dist/pathgl.zip) and include in your html.

```html
<script src="http://adnanwahab.org/pathgl/dist/pathgl.min.js" charset="utf-8"></script>
```

If webgl is available then your circles will be WEBGL, if not, fallback to svg.
```html
<script>
var selector = pathgl('canvas') || 'svg'
d3.select(selector).append('circle')
.attr('r', 100)
.attr('cx', 50)
.attr('cy', 50)
</script>
```

Alternatively:
```
d3.select('canvas').call(pathgl)
.append('circle')
```

## roadmap
 - batch all rendering so only 3 draws per frame if shapes are grouped: points, lines, triangle_fan
 - event listeners
 - Make path parser comply with spec
 - stroke-dasharray
 - antialiasing
 - patterns, post processing effects, inject code/data into shaders
 - datatextures
 - custom shapes (hexagon, 3d??)
