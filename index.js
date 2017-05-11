var osc = require('node-osc');
var express = require('express')
var app = express()
var five = require("johnny-five"), board, button;
var led;
var peopleInside = 0;
var capacity = 10;
var TWEEN = require('tween.js');
var oscServer = new osc.Server(8080, '0.0.0.0');
//var client = new osc.Client('Macintosh.local', 9001);

app.use(express.static('www'));
var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('Express app listening at http://%s%s', host, port)
})

var last = 255;
var board = new five.Board();
board.on("ready", function() {
  console.log("READY");
  led = new five.Led(9);
  var io = require('socket.io').listen(server);
  led.brightness(255);
  var oTween = {bright:255};

  var myTween = new TWEEN.Tween(oTween)
      .easing(TWEEN.Easing.Cubic.In)
      //.to({bright:255}, 2000)
      .onUpdate(function() {
        var tmp = Math.round(this.bright);
        if (tmp !== last) {
          led.brightness(tmp);
          last = tmp;
        }
      });
     function animate() {
     // requestAnimationFrame(animate);
       setImmediate(animate);
       TWEEN.update();
     }
     animate();
     //client.send('/getPeopleInside', '');

    io.sockets.on('connection', function (socket) {
      console.log("connection socket");
      socket.emit('message',{ content: 'peopleInside', val: peopleInside });

      //client.send('/getPeopleInside', '');

      socket.on('peopleInside',  function(message) {
        peopleInside = Math.max(message,0);
        //client.send('/peopleInside', peopleInside);
        socket.broadcast.emit('message',{ content: 'peopleInside', val: peopleInside });
        socket.broadcast.emit('dataMusic',{peopleInside: peopleInside, capacity: capacity});
        console.log('update peopleInside from Remote : ',peopleInside);
        updatePeopleInside();
      });
    });
    server.listen(8080);

   oscServer.on("message", function (msg, rinfo) {
        if(msg[2][0]=="/updatePeopleInside"){
          peopleInside += msg[2][1];
          updatePeopleInside();
          console.log('update peopleInside from Footfall : ', peopleInside);
        }
    });

    function updatePeopleInside(){
        var b = 255 - Math.min(Math.round(peopleInside*255/10), 255);
        myTween.stop().to({bright:b},1000).start();
    }
});
