$(function () {
    var User = function () {
        this.movieList = $('.movie-list');
        this.activityList = $('.actv-list');
        this.updateInfo = $('.update-info');
        this.updateAvator = $('.avator-replace');
    };

    User.prototype.getMovie = function () {
        var that = this;
        $.get('/user/rel/movie', function (res, status) {
            if (res.status) {
                for (var i=0;i<res.movie_data.length;i++) {
                    that.movieList.append(
                    '<div class="columns">'+
                        '<div class="small-4 columns">'+
                            '<img src="'+ res.movie_data[i].post_src+'" alt="电影海报" class="thumbnail">'+
                        '</div>'+
                        '<div class="small-8 columns">'+
                            '<span><a href="/movie/'+ res.movie_data[i].movieid +'">'+res.movie_data[i].title+
                            '</a></span>'+
                        '</div>'+
                    '</div>');
                }
            }
        });
    };

    User.prototype.getActivity = function () {
        var that = this;
        $.get('/user/rel/activity', function (res, status) {
            if (res.status) {
                for (var i=0;i<res.activity_data.length;i++) {
                    that.activityList.append(
                    '<div class="callout success small">'+
                        '<a href="/activity/'+res.activity_data[i].acid+'"><h6>'+res.activity_data[i].theme+'</h6></a>'+
                        '<small class="subheader">时间:&nbsp;'+res.activity_data[i].date+'</small>'+
                        '<span class="alert label float-right del-activity"><i class="fi-x"></i><input type="hidden" value="'+
                        res.activity_data[i].acid +'"/></span>'+
                    '</div>');
                }
            }
        });
    };

    // 事件注册
    User.prototype.bindEvent = function () {
        var that = this;
        this.updateInfo.on('click', function () {
            var nickname = $('#nickname-input').val();
            if (nickname.length < 1) {
                return ;
            }
            $.post('/user/update/info', {nickname: nickname} ,function (res) {
                if (res.status) {
                    $('#nickname-input').val(nickname);
                } else {
                    $('.update-info-tip').html('修改信息失败');
                }
            });
        });

        this.activityList.on('click','.del-activity', function () {
            var flag = confirm('删除此活动?')
            if (flag) {
                var del_id = $(this).children('input').val();
                $.post('/deleteActivity', {acid: del_id}, function (res) {
                    if (res.status) {
                        that.activityList.find('.callout').remove();
                        that.getActivity();
                    } else {
                        alert(res.info);
                    }
                });
            }
        });

        this.updateAvator.on('click', function () {

        });
    };
    // 初始化
    User.prototype.init = function () {
        this.bindEvent();
        this.getMovie();
        this.getActivity();
    };
    new User().init()
})