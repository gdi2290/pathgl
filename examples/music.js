var analyzer
examples.music = function (selection) {
  var numLines = 2000
  var s = d3.select(selection)
          .attr(size)
          .call(pathgl)

  var scale = Math.PI * 2 / numLines

  var midX = size.width / 2
  var midY = size.height / 2

  var lines = s.selectAll('line').data(d3.range(numLines).map(function () { return {a: 0}}))
  .enter()
  .append('line')
  .attr({
    x1: size.width >> 1
  , y1: size.height >> 1
  , stroke: function () { return "hsl(" + Math.random() * 360 + ",100%, 50%)" }
  , x2: function (d, i) { return Math.cos(i * 2) * innerWidth }
  , y2: function (d, i) { return Math.sin(i * 2) * innerHeight }
  })

  d3.timer(function () {
    if (! analyzer) return
    var byteFreq = new Uint8Array(analyzer.frequencyBinCount)
    analyzer.getByteFrequencyData(byteFreq)
    lines.each(function (d, i) {
      var freq  = byteFreq[i % 1024]
      d.diff = d.a - freq
      d.a = freq
    })
    .attr('stroke', function (d) { return "hsl(" + d.diff * 5 + ",100%, 50%)" })
    .attr('x2', function (d, i) { return midX + (Math.cos(i) * d.a) })
    .attr('y2', function (d, i) { return midY + (Math.sin(i) * d.a)})
  })
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
    analyzer = analyser
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
