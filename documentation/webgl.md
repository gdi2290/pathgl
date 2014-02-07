This page serves as an introduction to webgl for those who have never used it.

What does WebGL do?

1. cpu sends list of points to gpu
2. vertex shader places points on screen
3. fragment shader colors pixels

The second two stages run completely on your graphics card. This means we want to
offload as much work as we can to them. This is especially important in a
browser environment where cpu is needed for decoding network traffic and handling the
event loop. Using too much cpu starts to add latency to user input and will make your
app feel like shit.




