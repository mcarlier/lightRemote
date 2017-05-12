$(function() {
    var socket = io.connect('http://'+window.location.host);
    socket.on('message', function(mess) {
          $('#'+mess.content).html(mess.val);
    })
    $('#btn-peopleInside').click(function () {
      if(Number($('#input-peopleInside').val())||$('#input-peopleInside').val()==0){
        if(parseInt($('#input-peopleInside').val())>=0){
          $('#peopleInside').html($('#input-peopleInside').val());
          socket.emit('peopleInside', $('#input-peopleInside').val());
        }
      }
    })
    $('#plus1').click(function () {
      $('#peopleInside').html(parseInt($('#peopleInside').html())+1);
      socket.emit('peopleInside',parseInt($('#peopleInside').html()));
    })
    $('#minus1').click(function () {
      if($('#peopleInside').html()>0){
        $('#peopleInside').html(parseInt($('#peopleInside').html())-1);
        socket.emit('peopleInside', parseInt($('#peopleInside').html()));
      }
    })
});
