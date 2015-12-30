$(function () {
    var input = $('.inputMessage');
    var chatBtn = $('.chat-btn');
    // 默认链接到渲染页面的服务器
    var socket = io();
    function scrollToBottom () {
        $('.chat-bg aside').scrollTop($('.chat-bg aside')[0].scrollHeight);
    };

    function sendMsg (m) {
        var msg = {};
        var user = {
            name: sessionStorage.getItem('name'),
            avator: sessionStorage.getItem('avator')
        };
        msg.user = user;
        msg.text = m;
        if (msg.text && msg.user.name) {
            socket.send(msg);
        }
    };

    socket.on('connect', function () {
        socket.emit('join');
    })
    socket.on('sys', function (num) {
        $('.online-num').html(num);
    });
    socket.on('new message', function (msg) {
        $('.messages').append('<div class="row">'+
                                    '<div class="columns small-1">'+
                                        '<img src="'+msg.user.avator+'"  class="avator-small img-radius">'+
                                    '</div>'+
                                    '<div class="columns small-11 medium-10">'+
                                        '<small class="subheader">'+msg.user.name+'</small><p><span class="msg-item">'+msg.text+'</span></p>'+
                                    '</div>'+
                                '</div>');
        // 滚动条滚动到底部
        scrollToBottom();
    });
    // 自己的消息显示在右边
    socket.on('my message', function (msg) {
        $('.messages').append('<div class="row">'+
                                    '<div class="small-9 columns clearfix">'+
                                        '<p class="float-right"><span class="msg-item">'+msg.text+'</span></p>'+
                                    '</div>'+
                                    '<div class="small-1 columns end">'+
                                        '<img src="'+msg.user.avator+'"  class="avator-small img-radius">'+
                                    '</div>'+
                                '</div>');
        // 滚动条滚动到底部
        scrollToBottom();
    });
    // 焦点时验证是否登录
    input.on('focus',function (e) {
        if (!sessionStorage.getItem('name')) {
           $('#login-modal').foundation('open');
           return ;
        }
    });
    input.on('keydown',function (e) {
        if (e.which === 13) {
            var message = $(this).val();
            sendMsg(message);
            $(this).val('');
        }
    });
    chatBtn.on('click',function () {
        var message = input.val();
        sendMsg(message);
        input.val('');
    });
});