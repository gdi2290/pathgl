examples.mosaic = function (selector){
  var c = d3.select(selector)
          .attr(size)
          .call(pathgl)

  c.append('circle')
  .attr({
    r: 10
  , cx: 0
  , cy: 50
  , fill: 'pink'
  })

  c.append('circle')
  .attr({
    r: 10
  , cx: 200
  , cy: 300
  , fill: 'blue'
  })

  c.append('circle')
  .attr({
    r: 10
  , cx: 900
  , cy: 300
  , fill: 'red'
  })

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia

  var video = document.createElement('video')
  video.height = video.width = 300
  video.autoplay = true
  video.loop = true

  navigator.getUserMedia({ video: true }, function(stream) {
    video.src = window.URL.createObjectURL(stream);
  }, function(error) {})

  //videoTexture = pathgl.Texture(video)
}
