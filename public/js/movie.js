$(function () {
    var Movie = function () {
        this.commentList = $('.comment-list');
        this.addCommentBtn = $('.comment-btn');
        this.activityList = $('.activity-list');
        this.movieid = $('#c-mid').val();
        this.triggerComment = $('#trigger-comment');
        this.chatField = $('.inputMessage');
        this.publishActv = $('.publish-actv');
        this.likeBtn = $('#like-movie');
        this.disLikeBtn = $('#dislike-movie');
        this.addCommentForm = $('#add-comment-form');
    }
    // 给评论表单注入csrfToken
    Movie.prototype.initCommentForm = function () {
        $.get('/comment/'+this.movieid, function (res, status) {
            if (res.status) {
                $('#add-comment-form input[name="_csrf"]').val(res.csrfToken);
            }
        });
    };

    Movie.prototype.initScrollBar = function () {
        // 使用第三方插件slimscroll
        $('.chat-bg aside').slimscroll({
            height: '85%'
        });
        this.activityList.slimscroll({
            height: '280px'
        });
    };
    // 事件绑定
    Movie.prototype.bindEvent = function () {
        var that = this;
         this.triggerComment.on('click', function () {
            $.get('/judgeState', function (res) {
                if (!res.loginState) {
                    $('#login-modal').foundation('open');
                    that.triggerComment.attr("data-toggle","comment-modal");
                } else {
                    that.triggerComment.attr("data-toggle","comment-modal");
                }
            });
         });
         
         // 发布活动监听是否登陆状态
         this.publishActv.on('click', function (e) {
            $.get('/judgeState', function (res) {
                if (!res.loginState) {
                    $('#login-modal').foundation('open');
                } else {
                     location.href = '/addactivity/'+that.movieid;
                }
            });
         });

         // 点赞和差评
         this.likeBtn.on('click', function () {
            $.post('/likemovie',{movieid: that.movieid},function (res){
                if (res.status) {
                    $('#like-movie span').html(res.lknum)
                } else {
                    $('.add-like-tip').html(res.info);
                }
            });
         });
         this.disLikeBtn.on('click', function () {
            $.post('/dislikemovie',{movieid: that.movieid},function (res){
                if (res.status) {
                    $('#dislike-movie span').html(res.dislknum)
                } else {
                    $('.add-like-tip').html(res.info);
                }
            });
         });

         // 发布评论
        this.addCommentBtn.on('click', function () {
            var data = {
                title: $('#add-comment-form input[name="title"]').val(),
                movieid: that.movieid,
                detail: $('#add-comment-form textarea').val(),
                _csrf: $('#add-comment-form input[name="_csrf"]').val()
            };

            if (data.title == ""||data.detail=="") {
                $('#add-comment-form .comment-tip').html('数据不完整');
                return ;
            }
            $.post('/addcomment', data, function (res) {
                if (res.status) {
                    $('#comment-modal').foundation('close');
                    that.initCommentForm();
                    that.addCommentForm.children('input').val('');

                    that.commentList.children('h5').after(
                        '<li class="comment-item has-submenu is-accordion-submenu-parent" aria-haspopup="true">'+ 
                            '<a href="javascript:void(0);" class="default-blue success callout"><img class="avator-small" src="'+
                            res.data.avator+'" alt=""/>'+
                            res.data.content.title+'</a>'+
                            '<h6>'+
                            '<a href="javascript:void(0)">'+res.data.rel_user+'</a>'+
                                '<small class="subheader">&nbsp;发表于: 刚刚</small>'+
                            '</h6>'+
                            '<p class="gener hide">'+res.data.content.detail.substr(0,80) +'<span>......</span></p>'+
                            '<ul class="menu vertical nested submenu is-accordion-submenu" data-submenu aria-hidden="true">'+
                                '<li>'+res.data.content.detail +'</li>'+
                            '</ul>'+
                        '</li>');
                    var commentNum = parseInt($('.badge').html(),10)+1;
                    $('.badge').html(commentNum);

                } else {
                    $('#add-comment-form .comment-tip').html(res.info);
                }
            });
        });

        // 监听评论折叠板
        this.commentList.on('click', '.comment-item', function () {
            $(this).children('.gener').toggleClass('hide');
        });
    };

    // 获取相关活动
    Movie.prototype.getActivity = function () {
        var that = this;
        $.post('/getrelactivity', { movieid: that.movieid }, function (res) {
            if (res && res.status) {
                for(var i=0;i<res.rel_actv.length;i++) {
                    that.activityList.append('<div class="callout success small"><a href="/activity/'+
                        res.rel_actv[i].acid+'"><h6>'+res.rel_actv[i].theme+
                        '</h6></a><small class="subheader">时间:&nbsp;'+res.rel_actv[i].date+'</small></div>');
                }
            }
        });
    };

    Movie.prototype.setLocalStorage = function () {
        // 加载页面时判断是否登录状态
        var name = $('#storage-nickname').val()||$('#storage-name').val();
        var avator = $('#storage-avator').val();
        if (name && avator && window.sessionStorage) {
            sessionStorage.setItem('name', name);
            sessionStorage.setItem('avator', avator);
        }
    };
    Movie.prototype.init = function () {
        this.bindEvent();
        this.getActivity();
        this.setLocalStorage();
        this.initCommentForm();
        this.initScrollBar();
    };

    var moviePage = new Movie();
    moviePage.init();
});