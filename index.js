var osc = require('node-osc');
var express = require('express')
var app = express()
var rn = require('random-number');

var five = require("johnny-five"),
  board, button;

var ready = false;
var led;
var peopleInside;
var fullness;

var TWEEN = require('tween.js');
var oTween = {bright:0};
var changeButtonAnimation = false;

var oscServer = new osc.Server(8080, '0.0.0.0');
var client = new osc.Client('Macintosh.local', 9001);


app.use(express.static('www'));
var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Express app listening at http://%s%s', host, port)

})

var last = 0;
var lightPercent = 0;
var animation,animationID = 0;
var board = new five.Board();
board.on("ready", function() {
  console.log("READY");
  led = new five.Led(9);
  var io = require('socket.io').listen(server);
  var oTween = {bright:255};
  //led.brightness(last);
   animation= new five.Animation(led);


  //led.brightness(last);
  // led.pulse({
  //   duration:3000,
  //   keyFrames: [220, 240]
  // });


  //
  // led.pulse({
  //   easing: "inOutSine",
  //   duration: 1000,

  //   onstop: function() {
  //     console.log("Animation stopped");
  //   }
  // });
  //
  var myTween = new TWEEN.Tween(oTween)
      // .easing(TWEEN.Easing.Cubic.In)
      .to({bright:255}, 2000)
      .onUpdate(function() {
        //console.log(this.bright);
        var tmp = Math.round(this.bright);
        if (tmp !== last) {
          led.brightness(tmp);
          last = tmp;
        }
      })
      .start();

  //
     function animate() {
     // requestAnimationFrame(animate);
       setImmediate(animate);
       TWEEN.update();
     }
     //animate();

    io.sockets.on('connection', function (socket) {

      getCurrentValue();
      oscServer.on("message", function (msg, rinfo) {
              if(msg[2][0]=="/light"){
              socket.broadcast.emit('message',{ content: 'brightness', val: msg[2][1] });
              lightPercent = msg[2][1];
              console.log('new /light %s', lightPercent);
              changeAnimation(undefined,function(){
                socket.broadcast.emit('message',{ content: 'animation', val: animationID });
              });
              }
              else if(msg[2][0]=="/data"){
                console.log('get peopleInside %s, fullness %s',msg[2][1],msg[2][2]);
                socket.broadcast.emit('message',{ content: 'peopleInside', val: msg[2][1] });
                socket.broadcast.emit('message',{ content: 'fullness', val: msg[2][2] });
                peopleInside = msg[2][1];
                fullness = msg[2][2];
                socket.broadcast.emit('dataMusic',{peopleInside: peopleInside, capacity: fullness});
              }
              else if(msg[2][0]=="/peopleInside"){
                console.log('new peopleInside',  msg[2][1]);
                socket.broadcast.emit('message',{ content: 'peopleInside', val: msg[2][1] });
                if((peopleInside<msg[2][1])&&peopleInside%3==0){
                  console.log("FLASH");
                  animationNewPeople();
                }
                peopleInside = msg[2][1];
                socket.broadcast.emit('dataMusic',{peopleInside: peopleInside, capacity: fullness});
              }
              if(msg[0]=="/getlight"){
                console.log('get light %s',  msg[1]);
                socket.broadcast.emit('message',{ content: 'brightness', val: msg[1] });
              }
      });

      socket.on('brightness',  function(percent) {
          console.log('Set brightness to %s%', percent);
          var b = Math.min(Math.round(parseInt(percent)*255/100), 255);
          var diff = Math.abs(last - b);
          var speed = diff*2000/255;
          myTween.stop().to({bright:b}, speed).start();
      });
        socket.on('peopleInside',  function(message) { //Pas de send music car openframework me renvoie peopleInside l.112
          socket.broadcast.emit('message',{ content: 'peopleInside', val: message });
          client.send('/peopleInside', message, function () {
          console.log('Send /peopleInside %s', message);
          });
        });
        socket.on('fullness',  function(message) {
          socket.broadcast.emit('message',{ content: 'fullness', val: message });
          fullness = message;
          socket.broadcast.emit('dataMusic',{peopleInside: peopleInside, capacity: fullness});
          client.send('/fullness', message, function () {
            console.log('Send /fullness %s', message);
          });
        });
        socket.on('animation', function(message) {
          console.log(message);
          changeAnimation(message)
        });

    });
    server.listen(8080);
});

  function changeAnimation(newval,callback){
    // console.log("change animation",lightPercent,animationID,newval);
    if(lightPercent<=0||newval==0){
      animation0(1);//vitesse moyenne, fades random sur tout spectre
      console.log("animation step : 0");
      animationID=0;
    }
    //1-17%
    else if(newval==1||(lightPercent>0&&lightPercent<=parseInt(100/6)&&animationID!=1)){
      animation2(1,1); //Rapide, luminosité basse, effet,néon
      console.log("animation step : 1");
      animationID=1;
    }
    //17-33%
    else if(newval==2||(lightPercent>parseInt(100/6)&&lightPercent<=parseInt(2*100/6)&&animationID!=2)){
      animation6();//vitesse rapide, bas du spectre
      console.log("animation step : 2");
      animationID=2;
    }
    //33-50%
    else if(newval==3||(lightPercent>parseInt(2*100/6)&&lightPercent<=parseInt(3*100/6)&&animationID!=3)){
      animation4();//Rapide, luminosité haute, grésillement
      console.log("animation step : 3");
      animationID=3;
    }
    //50-67%
    else if(newval==4||(lightPercent>parseInt(3*100/6)&&lightPercent<=parseInt(4*100/6)&&animationID!=4)){
      animation3();//cycle sur tout le spectre oscillant à faible luminosité
      console.log("animation step : 4");
      animationID=4;
    }
    //67-83%
    else if(newval==5||(lightPercent>parseInt(4*100/6)&&lightPercent<=parseInt(5*100/6)&&animationID!=5)){
      animation5(245,-1);//Lent, cycle avec un palier.
      console.log("animation step : 5");
      animationID=5;
    }
    //83%-...
    else if(newval==6||(lightPercent>parseInt(5*100/6)&&lightPercent<=parseInt(100)&&animationID!=6)){
      animation1(1.2);  // vitesse moyenne, fades random sur tout spectre
      console.log("animation step : 6");
      animationID=6;
    }
    else if (lightPercent>parseInt(100)){
      if(peopleInside%5==0){
        console.log("change",peopleInside,peopleInside%4);
        var newID = animationID;
        while(newID==animationID){
           newID = rn({min:1,max:6, integer: true});
           console.log(newID);
        }
        animationID = newID;
        changeAnimation(newID,callback)
      }
    }

    if(callback) callback();

  }

function getCurrentValue() {
  client.send('/getdata', '', function () {
    console.log('Send /getdata');
  });
}


function animation0(speed){
 animation.enqueue({
   easing: "inOutSine",
   currentSpeed : speed,
   duration: 3000,
   cuePoints: [0,0.5,1],
   keyFrames: [220,240,220],
   oncomplete: function() {
       animation0(speed)
   },
 });
}

function animationNewPeople(){
 animation.enqueue({
   easing: "inOutSine",
   currentSpeed : 1,
   duration: 1000,
   cuePoints: [0,0.25,0.5,0.75,1],
   keyFrames: [null,246,null,90,200],
   oncomplete: function() {
     changeAnimation(animationID)
   },
 });
}

function animation1(speed){
 var key = rn({min:50,max:247, integer: true});
 // console.log("animation1",key, speed);
 animation.enqueue({
   easing: "inOutQuint",
   currentSpeed : speed,
   duration: 500,
   cuePoints: [0,1],
   keyFrames: [null,key],
   oncomplete: function() {
       var speedrd = rn({min:0.5,max:1});
       animation1(speedrd)
   },
 });
}

  function animation2(speed,sign){
   var key = rn({min:200,max:255, integer: true});
   var key2 = rn({min:200,max:255, integer: true});
  //  console.log("animation2",speed,key,key2);
   animation.enqueue({
     easing: "in-out-expo",
     currentSpeed : speed,
     duration: 3000,
     cuePoints: [0, 0.4, 0.8, 1],
     keyFrames: [null, key,240, key2],
     oncomplete: function() {
         speed+= sign*0.05;
         if (speed>=1) {
           sign=-1;
         }
         else if(speed<=0.5){
           sign=1;
         }
         animation2(speed,sign)
     },
   });
  }
  function animation3(key,lastkey){
    var key = rn({min:200,max:247, integer: true});
    var key2 = rn({min:200,max:247, integer: true});
    var key3 = rn({min:235,max:247, integer: true});

    var speed = rn({min:0.5,max:1});
    // console.log("animation3",key,lastkey,speed);
    animation.enqueue({
      currentSpeed : speed,
      duration: 7000,
      cuePoints: [0,0.3,0.35,0.65,0.75,0.8,0.9,1],
      keyFrames: [null,parseInt(key/4),key,0,key2,parseInt(key2/2),key3,key3],
      oncomplete: function() {
        // console.log("done");
        animation3()
      },
    });
  }
  function animation4(){
  var speed = rn({min:0.5,max:1.5});
   var key = rn({min:90,max:190, integer: true});
   var key2 = rn({min:100,max:140, integer: true});
   var key3= rn({min:100,max:150, integer: true});
  //  console.log("animation4",key,key2,key3,speed);
   animation.enqueue({
     currentSpeed : speed,
     easing: "in-out-expo",
     duration: 4000,
       cuePoints: [0,0.2,0.3,0.6,0.7, 1],
       keyFrames: [null,key,key2,key3,key,key],
     oncomplete: function() {
         animation4()
     },
   });
  }
  function animation5(key,sign){
   var step;
   if (key>200) {
      step=rn({min:5,max:15, integer: true})
   }
   else{
     step=rn({min:20,max:50, integer: true})
   }
  //  console.log("animation5",step,key, sign);
   animation.enqueue({
       currentSpeed: key/100,
       duration: 2000,
       cuePoints: [0,0.2,0.4,0.6, 0.8, 1],
       keyFrames: [null,key,key+step,key,key-step,key],
       oncomplete: function() {
         key+= sign*step;
         if (key>240) {
           sign=-1;
         }
         else if(key<=60){
           sign=1;
         }
         animation5(key,sign)
       },
   });
  }
  function animation6(){
   var key = rn({min:150,max:246, integer: true});
  //  console.log("animation6",key);
   animation.enqueue({
     easing: "inOutBounce",
     duration: 1000,
     cuePoints: [0,1],
     keyFrames: [null,key],
     oncomplete: function() {
         animation6()
     },
   });
  }
