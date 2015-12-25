$(function (){
    var Activity = function (id) {
        this.acid = id;
        this.memberList = $('.ptcp-list');
        this.joinBtn = $('.join-btn');
    };
    Activity.prototype.bindEvent = function (){
        var that = this;
        this.joinBtn.on('click', function () {
            $.post('/participate', {acid: that.acid}, function (res) {
                if (res.loginState === false) {
                    $('#login-modal').foundation('open');
                } else if (res.status) {
                    var name = res.data.nickname || res.data.uid;
                    var avator = res.data.avator || '/static/images/default_avator.jpg';
                    var num = res.data.num;

                    $('.stat').html(num);
                    that.memberList.append('<div class="column">'+
                    '<img class="avator-small" src="'+avator+'" alt="参与者"/>'+
                    '<h6>'+name+'</h6>'+
                '</div>');
                } else {
                    $('.ptcp-tip').html(res.info).removeClass('hide');
                    // 两秒钟之后提示消失
                    setTimeout(function(){
                        $('.ptcp-tip').addClass('hide');
                    }, 2000)
                }
            });
        });
    };
    Activity.prototype.init = function () {
        this.bindEvent();
    };
    var acid = /\d+/.exec(location.href.split('activity/')[1])[0];
    new Activity(acid).init();
})