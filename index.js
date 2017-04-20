var osc = require('node-osc');
var express = require('express')
var app = express()

var RaspIP = "10.0.0.44";
var RaspPort = "9001";

var LocalIP = "0.0.0.0";
var LocalPort = "9001";

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
            var client = new osc.Client(RaspIP, parseInt(RaspPort));
            client.send('/light', msg[2][1], function () {
            client.kill();
            console.log('Send /light %s to %s:%s', msg[2][1], RaspIP,RaspPort);
            });
          }
          else if(msg[2][0]=="/data"){
            console.log('get peopleInside %s, fullness %s',msg[2][1],msg[2][2]);
            socket.broadcast.emit('message',{ content: 'peopleInside', val: msg[2][1] });
            socket.broadcast.emit('message',{ content: 'fullness', val: msg[2][2] });

          }
          else if(msg[2][0]=="/peopleInside"){
            console.log('new peopleInside',  msg[2][1]);
            socket.broadcast.emit('message',{ content: 'peopleInside', val: msg[2][1] });
          }

        }
        if(rinfo.address==RaspIP){
          if(msg[0]=="/getlight"){
            socket.broadcast.emit('message',{ content: 'brightness', val: msg[1] });
          }
        }
  });

    socket.on('brightness',  function(message) {
        socket.broadcast.emit('message',{ content: 'brightness', val: message });
        var client = new osc.Client(RaspIP, parseInt(RaspPort));
        client.send('/light', message, function () {
        client.kill();
        console.log('Send /light %s to %s:%s', message, RaspIP,RaspPort);
        });

    });

    socket.on('peopleInside',  function(message) {
      socket.broadcast.emit('message',{ content: 'peopleInside', val: message });
      var client = new osc.Client(LocalIP, parseInt(LocalPort));
      client.send('/peopleInside', message, function () {
      client.kill();
      console.log('Send /peopleInside %s to %s:%s', message, LocalIP,LocalPort);
      });
    });
    socket.on('fullness',  function(message) {
      socket.broadcast.emit('message',{ content: 'peopleInside', val: message });
      var client = new osc.Client(LocalIP, parseInt(LocalPort));
      client.send('/fullness', message, function () {
      client.kill();
      console.log('Send /fullness %s to %s:%s', message, LocalIP,LocalPort);
      });
    });


});

server.listen(8080);

var client = new osc.Client('127.0.0.1', 3333);
client.send('/oscAddress', 200, function () {
  client.kill();
});

function getCurrentValue() {
  var client = new osc.Client(RaspIP, parseInt(RaspPort));
  client.send('/getlight', '', function () {
  client.kill();
  console.log('Send /getlight to %s:%s', RaspIP,RaspPort);
  });

  var client2 = new osc.Client(LocalIP, parseInt(LocalPort));
  client2.send('/getdata', '', function () {
  client2.kill();
  console.log('Send /getdata to %s:%s', LocalIP,LocalPort);
  });
}
