$(document).foundation();
$(function(){
    var Header = function () {
        this.search = $('#search-input');
        this.toTop = $('.back-to-top');
        this.loginBtn = $('#login');
        this.registerBtn = $('#register');
        this.search = $('#search-input');
    }

    Header.prototype.bindEvent = function () {
        var that = this;
        this.search.on('keydown', function (e) {
            var e = e || window.event;
            var data_in = $('#search-input').val();
            if (e.which === 13) {
                location.href = '/search?tag='+encodeURIComponent(data_in) ;
            }
        });

        // 登录
        this.loginBtn.on('click', function (e) {
            var name = $('.login-name').val(),
                password = $('.login-psw').val();
            if (name.length == 0 ||password.length == 0) {
                $('.login-tip').html('用户名和密码不能为空!');
                return false;
            } else if(password.length <6) {
                $('.login-tip').html('密码长度不得小于6!');
            } else {
                $.post('/user', {username: name, password: password}, function (res, status) {
                    if (status == 'error' || status == 'timeout') {
                        $('.login-tip').html('用户名或密码错误!')
                    }
                    else if(res.status) {
                        $('#login-modal').foundation('close');
                        $('#login').off('click');
                        that.registerBtn.off('click');
                        
                        $('#bar-login').replaceWith('<li><a href="/user/'+res.sessiondata.username
                            +'">'+res.sessiondata.username+'</a></li>');
                        $('#bar-register').replaceWith('<li><a href="" id="bar-logout">退出</a></li>');

                        // sessionStorage存储用户名和头像
                        if (window.sessionStorage) {
                            var name = res.sessiondata.nickname || res.sessiondata.username,
                                avator = res.sessiondata.avator;
                            sessionStorage.setItem('name', name);
                            sessionStorage.setItem('avator', avator);
                        }
                    } 
                });
            }
        })

        // 退出
        $('.top-bar-right').on('click','#bar-logout', function (e) {
            
            if (window.sessionStorage) {
                window.sessionStorage.clear();
                location.reload();
            } else {
                console.log('浏览器不支持，请使用Chrome浏览器')
            }
            // 先清除session再执行登录，为了兼容火狐和IE
            $.post('/user/authenticate/logout');
        });

        // 注册
        this.registerBtn.on('click', function () {
            var reg_name = $('.reg-name').val();
            var reg_psw = $('.reg-psw').val();
            var reg_psw_again = $('.reg-psw-again').val();
            var gender = $('#register-form input[name="gender"]:checked').val();

            if (reg_name == '' || reg_psw.length == 0) {
                $('.register-tip').html('用户名和密码不能为空');
                return false;
            } 
            else if (reg_psw.length <6) {
                $('.register-tip').html('密码长度不得小于6');
                return false;
            } 
            else if(reg_psw !== reg_psw_again) {
                $('.register-tip').html('密码前后不一致');
                return false;
            }
            $.post('/user/authenticate/register',{username: reg_name, password: reg_psw, gender: gender}, function (res) {
                if (res.status) {
                    // location.href='/user/'+ reg_name;
                     $('#login-modal').foundation('open');
                } else {
                    $('.register-tip').html(res.info);
                }
            });
        });

        $('.reg-psw-again').on('blur', function () {
            if ($(this).val() !== $('.reg-psw').val()){
                $('.register-tip').html('密码前后不一致');
            }
        });

        // 返回顶部
        this.toTop.on('click', function () {
            // 这是一个坑，必须采用window滚动的方式才能兼容所有的浏览器
            $(window).scrollTop(0);
        });
    };

    Header.prototype.loaded = function () {
        $(document).ready(function () {
            document.getElementById('loading').style.display="none";
        });
    };
    Header.prototype.init = function () {
        this.bindEvent();
        this.loaded();
    };
    new Header().init();
});