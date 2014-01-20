# PathGL [![Build Status](https://travis-ci.org/adnan-wahab/pathgl.png?branch=master)](https://travis-ci.org/adnan-wahab/pathgl)
Pathgl sits between d3 and the dom and lets you draw to webgl instead of svg.


## How do I add this to my project?

You can download pathgl by:

* (prefered) Using bower and running `bower install pathgl --save`
* Using npm and running `npm install pathgl --save`
* Downloading it manually by clicking [here to download zip version](https://github.com/adnan-wahab/pathgl/archive/gh-pages.zip)

## Usage

If webgl is available then your circles will be WEBGL, if not, fallback to svg.
```html
<script src="http://adnanwahab.com/pathgl/dist/pathgl.min.js" charset="utf-8"></script>
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
