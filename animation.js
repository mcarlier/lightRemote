var rn = require('random-number');

module.exports = class Animation {
    constructor(anim){
        this.animation = anim;
        this.ID = 0;
    }
    flash(){
      console.log("Flash");
      this.animation.enqueue({
        easing: "inOutSine",
        currentSpeed : 1,
        duration: 1000,
        cuePoints: [0,0.25,0.5,0.75,1],
        keyFrames: [null,246,null,90,200],
        oncomplete: ()=> {
          console.log("animation",this.ID);
          this.animate();
        },
      });
    }
    animate(val1,val2){
      switch(this.ID) {
          case 1:
              // console.log("animation 1");
              var key = rn({min:50,max:247, integer: true});
              var speed = rn({min:0.5,max:1})
              this.animation.enqueue({
                easing: "inOutQuint",
                currentSpeed : speed,
                duration: 500,
                cuePoints: [0,1],
                keyFrames: [null,key],
                oncomplete: ()=> {
                    this.animate();
                },
              });
              break;
          case 2:
              // console.log("animation 2");
              if(val1==null){
                val1=1; val2=1;
              }
               var key = rn({min:200,max:255, integer: true});
               var key2 = rn({min:200,max:255, integer: true});
               this.animation.enqueue({
                 easing: "in-out-expo",
                 currentSpeed : val1,
                 duration: 3000,
                 cuePoints: [0, 0.4, 0.8, 1],
                 keyFrames: [null, key,240, key2],
                 oncomplete: ()=> {
                     val1+= val2*0.05;
                     if (val1>=1) {
                       val2=-1;
                     }
                     else if(val1<=0.5){
                       val2=1;
                     }
                     this.animate(val1,val2);
                 },
               });
              break;
          case 3:
              // console.log("animation 3");
                var key = rn({min:200,max:247, integer: true});
                var key2 = rn({min:200,max:247, integer: true});
                var key3 = rn({min:235,max:247, integer: true});
                var speed = rn({min:0.5,max:1});
                this.animation.enqueue({
                  currentSpeed : speed,
                  duration: 7000,
                  cuePoints: [0,0.3,0.35,0.65,0.75,0.8,0.9,1],
                  keyFrames: [null,parseInt(key/4),key,0,key2,parseInt(key2/2),key3,key3],
                  oncomplete: ()=> {
                    this.animate()
                  },
                });
              break;
          case 4:
              // console.log("animation 4");
                var speed = rn({min:0.5,max:1.5});
                 var key = rn({min:90,max:190, integer: true});
                 var key2 = rn({min:100,max:140, integer: true});
                 var key3= rn({min:100,max:150, integer: true});
                 this.animation.enqueue({
                   currentSpeed : speed,
                   easing: "in-out-expo",
                   duration: 4000,
                     cuePoints: [0,0.2,0.3,0.6,0.7, 1],
                     keyFrames: [null,key,key2,key3,key,key],
                   oncomplete: ()=> {
                       this.animate()
                   },
                 });
              break;
          case 5:
              // console.log("animation 5");
              var step;
                if(val1==null){
                  val1=245; val2= -1;
                }
               if (val1>200) {
                  step=rn({min:5,max:15, integer: true})
               }
               else{
                 step=rn({min:20,max:50, integer: true})
               }
               this.animation.enqueue({
                   currentSpeed: val1/100,
                   duration: 2000,
                   cuePoints: [0,0.2,0.4,0.6, 0.8, 1],
                   keyFrames: [null,val1,val1+step,val1,val1-step,val1],
                   oncomplete: ()=> {
                     val1+= val2*step;
                     if (val1>240) {
                       val2=-1;
                     }
                     else if(val1<=60){
                       val2=1;
                     }
                     this.animate(val1,val2)
                   },
               });
              break;
          case 6:
              // console.log("animation 6");
                 var key = rn({min:150,max:246, integer: true});
                 this.animation.enqueue({
                   easing: "inOutBounce",
                   duration: 1000,
                   cuePoints: [0,1],
                   keyFrames: [null,key],
                   oncomplete: ()=> {
                       this.animate()
                   },
                 });
              break;
          default:
          // console.log("animation 0");
          this.animation.enqueue({
            easing: "inOutSine",
            duration: 3000,
            cuePoints: [0,0.5,1],
            keyFrames: [220,240,220],
            oncomplete: ()=> {
                this.animate();
            },
          });
      }
    }
};
