pathgl([element])
Takes a canvas element, css3 selector, or d3 selection as an argument
if webgl is not available, returns null
otherwise the canvas element is returned
If called without arguments, appends a 960x500 webgl canvas to the sceern.

pathgl.texture(image)
Takes a string, image tag or typed array
The string needs to be either a url, css3 selector, or fragment shader.
returns an object which represents the texture's location in video memory.
you can pass this object as the fill of any element

pathgl.context()
returns the WebGL context, or null if webgl is not available.
Useful for svg compatible code, or directly acessing the webgl context

pathgl.uniform(name, [value])
Set a variable that is global to all shader contexts.
If called without a value, will return previously set value.

pathgl.registerShader('name', 'function text')

d3.selection.prototype.shader(name, expression)
Inline's an abitrary string into the shader that renders the current mark.
The expression language is untyped GLSl.
Any svg attribute from that mark can be used in the expression.
For more information, please see shaders.

d3.transition.prototype.shaderTween(name, expression)
...

Currently, the scene graphi API is private and subject to rapid change.
Instead of manipulating pathgl marks directly, use a library like d3 to manipulate
the screen from a sane layer of abstraction.
