examples.music = function (selection) {
  // var numLines = 1e2
  // var s = d3.select(selection)
  //         .attr(size)
  //         .call(pathgl)

  // var scale = Math.PI * 2 / numLines

  // var lines = s.selectAll('line').data(d3.range(numLines))
  // .enter()
  // .append('line')
  // .attr({
  //   x1: size.width >> 1
  // , y1: size.height >> 1
  // , stroke: function () { return "hsl(" + Math.random() * 360 + ",100%, 50%)" }
  // , x2: function (d) { return Math.cos(d * scale) * 1000 }
  // , y2: function (d) { return Math.sin(d * scale) * 1000 }
  // })

  // d3.timer(function () {
  //   lines.attr('stroke', function () { return "hsl(" + Math.random() * 360 + ",100%, 50%)" })
  //   .attr('x2', function (d) { return Math.cos(d * scale) * Math.random() * 1000 })
  //   .attr('y2', function (d) { return Math.sin(d * scale) * Math.random() * 1000 })
  // })
  dropAndLoad(document.querySelector('.right'), init, "ArrayBuffer")
}


function init (arrayBuffer) {
window.audioCtx = new webkitAudioContext()
  window.analyser = audioCtx.createAnalyser()
  // If a sound is still playing, stop it.
  if (window.source)
    source.noteOff(0)
  // Decode the data in our array into an audio buffer
  audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
    // Use the audio buffer with as our audio source
    window.source = audioCtx.createBufferSource()
    source.buffer = buffer
    // Connect to the analyser ...
    source.connect(analyser)
    // and back to the destination, to play the sound after the analysis.
    analyser.connect(audioCtx.destination)
    // Start playing the buffer.
    source.start(0)
    // Initialize a visualizer object
    // Finally, initialize the visualizer.
    new visualizer(analyser)
  })
}

function dropAndLoad(dropElement, callback, readFormat) {
  var readFormat = readFormat || "DataUrl"

  dropElement.addEventListener('dragover', function(e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, false)

  dropElement.addEventListener('drop', function(e) {
    e.stopPropagation()
    e.preventDefault()
    loadFile(e.dataTransfer.files[0])
  }, false)

  function loadFile(files) {
    var file = files
    var reader = new FileReader()
    reader.onload = function(e) {
      callback(e.target.result)
    }
    reader['readAs'+readFormat](file)
  }
}


function visualizer(analyser) {
  var last = Date.now()
  var loop = function() {
    var dt = Date.now() - last
    // we get the current byteFreq data from our analyser
    var byteFreq = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(byteFreq)
    last = Date.now()
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}