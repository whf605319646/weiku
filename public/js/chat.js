$(function () {
    var testuser = {
        username: '小胡',
        avator: 'http://avator.jpg'
    };
    var content = $('.message');
    var input = $('.inputMessage');
    // 默认链接到渲染页面的服务器
    var socket = io();
    socket.on('connect', function () {
        socket.emit('join');
    })
    socket.on('sys', function (msg) {
        $('ul.messages').append('<li>'+msg+'</li>');
    })
    socket.on('online', function (num) {
        $('ul.messages').append('<li>当前在线人数'+num+'</li>')
    })
    socket.on('new message', function (user, msg) {
        $('ul.messages').append('<li>'+user.username+' 说: '+msg+'</li>');
    });

    input.keydown(function (e) {
        var msg;
        if (e.which === 13) {
            e.preventDefault();
            msg = $(this).val();
            if (!msg) return;
            socket.send(msg);
            $(this).val('');
        }
    })
});