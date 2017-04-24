// var osc = require('node-osc');
var express = require('express')
var app = express()
var rn = require('random-number');

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
var animation;
var board = new five.Board();
board.on("ready", function() {
  console.log("READY");
  led = new five.Led(9);
  var io = require('socket.io').listen(server);
  var oTween = {bright:0};
  //led.brightness(last);
   animation= new five.Animation(led);

  animation1(1);// vitesse moyenne, fades random sur tout spectre
  //animation2(1,1); //Rapide, luminosité basse, effet,néon
  //animation3() //Lent, cycle avec un palier.
  //animation4(); //Rapide, luminosité haute, grésillement
  //animation5(245,-1);//cycle sur tout le spectre oscillant à faible luminosité
  //animation6();//vitesse rapide, bas du spectre

/*  led.brightness(last);
  led.pulse({
    duration:3000,
    keyFrames: [220, 240]
  });
*/


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

function animation1(speed){
 var key = rn({min:50,max:247, integer: true});
 console.log("animation1",key, speed);
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
   console.log("animation2",speed,key,key2);
   animation.enqueue({
     easing: "in-out-expo",
     currentSpeed : speed,
     duration: 1000,
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
    console.log("animation3",key,lastkey,speed);
    animation.enqueue({
      currentSpeed : speed,
      duration: 7000,
      cuePoints: [0,0.3,0.35,0.65,0.75,0.8,0.9,1],
      keyFrames: [null,parseInt(key/4),key,0,key2,parseInt(key2/2),key3,key3],
      oncomplete: function() {
        console.log("done");
        animation3()
      },
    });
  }
  function animation4(){
  var speed = rn({min:0.5,max:1.5});
   var key = rn({min:0,max:190, integer: true});
   var key2 = rn({min:100,max:200, integer: true});
   var key3= rn({min:200,max:240, integer: true});
   console.log("animation4",key,key2,key3,speed);
   animation.enqueue({
     currentSpeed : speed,
     easing: "in-out-expo",
     duration: 2000,
       cuePoints: [0,0.2,0.3,0.4, 0.6,0.7, 1],
       keyFrames: [null,key,key2,key,key3,key,key],
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
   console.log("animation5",step,key, sign);
   animation.enqueue({
       currentSpeed: key/100,
       duration: 1000,
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
   console.log("animation6",key);
   animation.enqueue({
     easing: "inOutBounce",
     duration: 300,
     cuePoints: [0,1],
     keyFrames: [null,key],
     oncomplete: function() {
         animation6()
     },
   });
  }
