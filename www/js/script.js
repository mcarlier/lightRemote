
$(function() {

    var socket = io.connect('http://'+window.location.host);
    socket.on('message', function(mess) {
        if(mess.content=="animation"){
          $('.animation').removeClass('btn-primary');
          $('#animation'+mess.val).addClass('btn-primary');

        }

        else{
          $('#'+mess.content).html(mess.val);
        }

    })

    $('#btn-brightness').click(function () {

      if(Number($('#input-brightness').val())||$('#input-brightness').val()==0){
        $('#brightness').html($('#input-brightness').val());
        socket.emit('brightness', $('#input-brightness').val());
      }
    })
    $('#btn-peopleInside').click(function () {
      if(Number($('#input-peopleInside').val())||$('#input-peopleInside').val()==0){
        $('#peopleInside').html($('#input-peopleInside').val());
        socket.emit('peopleInside', $('#input-peopleInside').val());
      }
    })
    $('#plus1').click(function () {
      $('#peopleInside').html(parseInt($('#peopleInside').html())+1);
      socket.emit('peopleInside',parseInt($('#peopleInside').html()));
    })
    $('#minus1').click(function () {
      $('#peopleInside').html(parseInt($('#peopleInside').html())-1);
      socket.emit('peopleInside', parseInt($('#peopleInside').html()));

    })

    $('#btn-fullness').click(function () {
      if(Number($('#input-fullness').val())){
        $('#fullness').html($('#input-fullness').val());
        socket.emit('fullness', $('#input-fullness').val());
      }
    })

    $(".dial").knob({
      'release' : function (v) {
        socket.emit('brightness', v);
        $('#brightness').html(v);
        console.log(v);
      }
    });
    $('.animation').click(function () {
      $('.animation').removeClass('btn-primary');
      $(this).addClass('btn-primary')
      socket.emit('animation', $(this).text());

    })
});
