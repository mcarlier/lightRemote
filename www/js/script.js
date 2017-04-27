$(function() {
  var socket = io.connect('http://'+window.location.host);
  var LightRemote = function() {
      this.animation = '0';
      this.occupencyRate = 0;
      this.peopleInside = 0;
      this.capacity = 0;
    };

    var lightRemote = new LightRemote();
    var gui = new dat.GUI({ autoPlace: false });
    gui.add(lightRemote, 'animation', [ '0','1', '2', '3','4','5','6' ])
        .onFinishChange(function(value) { socket.emit('animation', value );});
    gui.add(lightRemote, 'occupencyRate', 0, 100)
       .onFinishChange(function(value) { socket.emit('occupencyRate', Math.round(value));});
    gui.add(lightRemote, 'peopleInside').min(0).step(1)
       .onFinishChange(function(value) { socket.emit('peopleInside', value );});
    gui.add(lightRemote, 'capacity').min(0).step(1)
       .onFinishChange(function(value) { socket.emit('capacity', value );});
    $('#my-gui-container').append(gui.domElement);

    socket.on('message', function(mess) {
      lightRemote[mess.content] = mess.value;
      for (var i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
      }
    })
});
