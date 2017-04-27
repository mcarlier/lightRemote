var express = require('express')
var app = express()
var five = require("johnny-five"),
  board, button;
var led;

var LightRemote = function() {
    this.animation = '0';
    this.occupencyRate = '0';
    this.peopleInside = '0';
    this.capacity = '0';
  };
var lightRemote = new LightRemote();
var anim = require("./animation.js");

var TWEEN = require('tween.js');
var oTween = {bright:0};

app.use(express.static('www'));
var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('Express app listening at http://%s%s', host, port)
})

var last = 0;
var animation;
var board = new five.Board();
board.on("ready", function() {
  console.log("READY");
  led = new five.Led(9);
  var io = require('socket.io').listen(server);
  var oTween = {bright:255};
  animation = new anim(new five.Animation(led));
  var myTween = new TWEEN.Tween(oTween)
      .to({bright:255}, 2000)
      .onUpdate(function() {
        var tmp = Math.round(this.bright);
        if (tmp !== last) {
          led.brightness(tmp);
          last = tmp;
        }
      })
      .start();

     function animate() {
     // requestAnimationFrame(animate);
       setImmediate(animate);
       TWEEN.update();
     }
     //animate();

  io.sockets.on('connection', function (socket) {
      updateAnimation();
      socket.on('brightness',  function(percent) {
          console.log('Set brightness to %s%', percent);
          var b = Math.min(Math.round(parseInt(percent)*255/100), 255);
          var diff = Math.abs(last - b);
          var speed = diff*2000/255;
          myTween.stop().to({bright:b}, speed).start();
      });

        socket.on('peopleInside',  function(message) {
          if(message!=lightRemote.peopleInside){
            console.log("peopleinside",message);
            lightRemote.peopleInside = message;
            socket.broadcast.emit('dataMusic',{peopleInside: lightRemote.peopleInside, capacity: lightRemote.capacity });
            updateOccupancyRate();
            if(lightRemote.peopleInside%2 == 0){
              animation.flash();
            }
          }
        });
        socket.on('capacity',  function(message) {
          if(message!=lightRemote.capacity){
            console.log("capacity",message);
            lightRemote.capacity = message;
            socket.broadcast.emit('dataMusic',{peopleInside: lightRemote.peopleInside, capacity: lightRemote.capacity });
            updateOccupancyRate();
          }
        });
        socket.on('occupencyRate', function(message) {
          console.log("occupencyRate",message);
          lightRemote.occupencyRate = message;
          updateAnimation();

        });
        socket.on('animation', function(message) {
          console.log("animation",message);

          lightRemote.animation = message;
          animation.ID = parseInt(lightRemote.animation);
        });

        function updateOccupancyRate(){
          lightRemote.occupencyRate = parseInt(lightRemote.peopleInside*100/lightRemote.capacity);
          lightRemote.occupencyRate  = isNaN(lightRemote.occupencyRate ) ? 0 : lightRemote.occupencyRate ;
          socket.emit('message',{ content: 'occupencyRate', value: lightRemote.occupencyRate  });
          updateAnimation();
        }
        function updateAnimation(){
          if(lightRemote.occupencyRate<=0){
            lightRemote.animation = 0
          }
          else if(lightRemote.occupencyRate<=100){
            lightRemote.animation = parseInt(lightRemote.occupencyRate*6/100)+1;
          }
          else if (lightRemote.peopleInside%3 == 0){
            lightRemote.animation = Math.floor((Math.random()*6)+1);
          }
          animation.ID  = isNaN(lightRemote.animation ) ? 0 : lightRemote.animation ;
          socket.emit('message',{ content: 'animation', value: animation.ID });
          console.log("animation",animation.ID);
        }

    });
    server.listen(8080);
});
