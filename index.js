var osc = require('node-osc');
var ip = require('ip');
var express = require('express')
var app = express()
var slider = require('bootstrap-slider');

var RaspIP = "packshot02.local";
var RaspPort = "9001";

var LocalIP = "Macintosh.local";
var LocalPort = "9001";

var myip = ip.address()


var clientLocal = new osc.Client(LocalIP, parseInt(LocalPort));
var clientRaspberry = new osc.Client(RaspIP, parseInt(RaspPort));



app.use(express.static('www'));

var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Express app listening at http://%s%s', host, port)

})

// Chargement de socket.io
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

  getCurrentValue();
  var oscServer = new osc.Server(8080, '0.0.0.0');
  oscServer.on("message", function (msg, rinfo) {
        if(rinfo.address=='127.0.0.1'){
          if(msg[2][0]=="/light"){
            socket.broadcast.emit('message',{ content: 'brightness', val: msg[2][1] });
            clientRaspberry.send('/light', msg[2][1], function () {
            console.log('Send /light %s to %s:%s', msg[2][1], RaspIP,RaspPort);
            });
          }
          else if(msg[2][0]=="/data"){
            console.log('get peopleInside %s, fullness %s',msg[2][1],msg[2][2]);
            socket.broadcast.emit('message',{ content: 'peopleInside', val: msg[2][1] });
            socket.broadcast.emit('message',{ content: 'fullness', val: msg[2][2] });
            socket.broadcast.emit('message',{ content: 'ip', val: myip });

          }
          else if(msg[2][0]=="/peopleInside"){
            console.log('new peopleInside',  msg[2][1]);
            socket.broadcast.emit('message',{ content: 'peopleInside', val: msg[2][1] });
          }

        }
        else{
          if(msg[0]=="/getlight"){
            console.log('get light %s',  msg[1]);
            socket.broadcast.emit('message',{ content: 'brightness', val: msg[1] });
          }
        }
  });

    socket.on('brightness',  function(message) {
        socket.broadcast.emit('message',{ content: 'brightness', val: message });
        clientRaspberry.send('/light', message, function () {
        console.log('Send /light %s to %s:%s', message, RaspIP,RaspPort);
        });

    });

    socket.on('peopleInside',  function(message) {
      socket.broadcast.emit('message',{ content: 'peopleInside', val: message });
      clientLocal.send('/peopleInside', message, function () {
      console.log('Send /peopleInside %s to %s:%s', message, LocalIP,LocalPort);
      });
    });
    socket.on('fullness',  function(message) {
      socket.broadcast.emit('message',{ content: 'peopleInside', val: message });
      clientLocal.send('/fullness', message, function () {
        console.log('Send /fullness %s to %s:%s', message, LocalIP,LocalPort);
      });
    });


});

server.listen(8080);


function getCurrentValue() {
  clientRaspberry.send('/getlight', '', function () {
  console.log('Send /getlight to %s:%s', RaspIP,RaspPort);
  });
  clientLocal.send('/getdata', '', function () {
    console.log('Send /getdata to %s:%s', LocalIP,LocalPort);
  });
}
