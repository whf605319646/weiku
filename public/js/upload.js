/*
 * Created with Sublime Text 2.
 * User: 胡国治
 * Date: 2015-08-19
 * Time: 16:22:59
 */
// 基于FormData的文件上传插件
// 支持的浏览器版本：Firefox,UC，搜狗,360浏览器,Safari4+,Chrome,IOS版Safari和安卓版Webkit,IE9+
// 作者：Juice Who
(function($){
    // 定义用于含文件的表单对象
    function FileForm(url, formSelector, textFields) {
        var formData = new FormData();

        var obj = $('#'+formSelector);
        if (obj && window.FormData){
            var children = Array.prototype.slice.call(obj.find('input[type="file"]'), 0);
            children.forEach(function (ele, index) {
                this.file = ele.files[0];
                formData.append(ele.name, this.file)
            });
        }
        // 如果存在文本域，添加到formdata
        if (textFields instanceof Object) {
            for(var ele in textFields) {
                formData.append(ele, textFields[ele]);
            };
        }
        this.url = url;
        this.formData = formData;
    }

    FileForm.prototype.send = function (callback) {  
        var that = this;
        // ajax发送
        $.ajax({
            url: that.url, 
            type: 'POST', 
            /*设定两个false来实现表单类型的传送*/
            processData: false,
            contentType : false,
            data: that.formData,
            success: function (res, status) {
                callback(res);
            },
            error: function (res) {
                callback(res);
            }
        });
    };
    // 定义jQuery 插件fileUpload
    $.fn.extend({          
        fileUpload: function(url, text, callback) {           
            var oo;
            if(text) {
                oo = new FileForm(url, $(this).attr('id'), text);
            } else {
                oo = new FileForm(url, $(this).attr('id'));
            }
            oo.send(function(responseText){
              callback.call(this, responseText);
            });
       } 
    });  
})(jQuery);
