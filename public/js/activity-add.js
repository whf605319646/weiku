/**
 * 发布活动模块
 * 日期选择选用了第三方插件laydate,原插件地址：
 * http://www.jq22.com/jquery-info1059
 * 感谢插件作者：风夏
 */
$(function () {
    var AddActivity = function (mid) {
        this.movieid = mid;
        this.addBtn = $('.add-btn');
    };
    AddActivity.prototype.bindEvent = function () {
        var that = this;
        this.addBtn.on('click', function (e) {
            var data = {
                movieid: that.movieid,
                theme: $('input[name="theme"]').val(),
                date: $('input[name="date"]').val(),
                content: $('input[name="content"]').val(),
                location: $('input[name="location"]').val(),
                contacts: $('input[name="contacts"]').val(),
                ptcp_num: $('input[name="ptcp_num').val(),
                _csrf: $('input[name="_csrf"]').val()
            };
            for (var ele in data) {
                if (!data[ele]) {
                    $('.tip').html('请填写完整数据')
                    return;
                }
            };
            $.post('/doActivityAdd', data, function (res) {
                if (res.status) {
                    $('input').val('');
                    history.go(-1);
                } else {
                    $('.tip').html(res.info);
                }
            });
        });
    };
    // 初始化laydate插件
    laydate({elem: '#pickdate'});
    
    var mid =/\d+$/.exec(location.href)[0];
    new AddActivity(mid).bindEvent();
});