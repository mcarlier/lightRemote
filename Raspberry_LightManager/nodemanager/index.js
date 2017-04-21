var osc = require('node-osc');
var sleep = require('sleep');
var Gpio = require('pigpio').Gpio,
  led = new Gpio(18, {mode: Gpio.OUTPUT}),
   dutyCycle = 0;
   signe=1;
led.pwmWrite(0);
var computerAIP = "10.0.0.45";
var computerAPort = "8080";
var bright = 0;
var brightTarget = 0;

var oscServer = new osc.Server(9001, '0.0.0.0');
console.log('Listening on port 9001');

oscServer.on("message", function (msg, rinfo) {
    if(msg[0]=='/light'){
      console.log("set Light %s %",msg[1]);
      if(msg[1]>=0){
        brightTarget =parseInt(msg[1])+1;
        updateBright();
      }
    }
    else if(msg[0]=='/getlight'){
      var client = new osc.Client(computerAIP, parseInt(computerAPort));
      client.send('/getlight', bright, function () {
      client.kill();
      console.log('Send /getlight %s to %s:%s', bright,computerAIP,computerAPort);
      });
    }
});

function updateBright(){
  while(bright!=brightTarget){
    bright +=sign(bright,brightTarget)*1;
    led.pwmWrite(bright);
    sleep.msleep(50)
  }
}

function sign(a,b){
  if(a<b){
    return 1;
  }
  else{
    return -1;
  }
}
