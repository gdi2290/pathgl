Pathgl extends d3 to run directly on your graphics card for improved perfomance and
expression.

Download the latest version and include in your html.

Or link directly to the latest release, copy this snippet:

<script src="http://adnanwahab.com/pathgl/dist/pathgl.min.js"
charset="utf-8"></script>
or Using npm and running npm install pathgl --save

<script src="http://adnanwahab.com/pathgl/dist/pathgl.min.js"
charset="utf-8"></script>
<script>
d3.select('canvas').call(pathgl)
.append('circle')
.attr('r', 100)
.attr('cx', 50)
.attr('cy', 50)
</script>
