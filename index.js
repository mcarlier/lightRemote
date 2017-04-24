// var osc = require('node-osc');
var express = require('express')
var app = express()
var five = require("johnny-five"),
  board, button;

var ready = false;
var led;

var TWEEN = require('tween.js');
var oTween = {bright:0};




app.use(express.static('www'));
var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Express app listening at http://%s%s', host, port)

})
var last = 0;
var board = new five.Board();
board.on("ready", function() {
  console.log("READY");
  led = new five.Led(9);
  var io = require('socket.io').listen(server);
  var oTween = {bright:0};

  led.brightness(last);
  led.pulse({
    duration:3000,
    keyFrames: [220, 240]
  });

  //
  // led.pulse({
  //   easing: "inOutSine",
  //   duration: 1000,
  //   cuePoints: [0, 0.2, 0.4, 0.6, 0.8, 1],
  //   keyFrames: [0, 10, 0, 50, 0, 240],
  //   onstop: function() {
  //     console.log("Animation stopped");
  //   }
  // });
  //
  // var myTween = new TWEEN.Tween(oTween)
  //     // .easing(TWEEN.Easing.Cubic.In)
  //     .to({bright:255}, 2000)
  //     .onUpdate(function() {
  //       console.log(this.bright);
  //       var tmp = Math.round(this.bright);
  //       if (tmp !== last) {
  //         led.brightness(tmp);
  //         last = tmp;
  //       }
  //     })
  //     .start();
  //
  //
  //   function animate() {
  //   // requestAnimationFrame(animate);
  //     setImmediate(animate);
  //     TWEEN.update();
  //   }
  //   animate();

  io.sockets.on('connection', function (socket) {
      socket.on('brightness',  function(percent) {
          console.log('Set brightness to %s%', percent);
          var b = Math.min(Math.round(parseInt(percent)*255/100), 255);
          var diff = Math.abs(last - b);
          var speed = diff*2000/255;
          myTween.stop().to({bright:b}, speed).start();
      });
  });
  server.listen(8080);
});
