/*
 * Created with Sublime Text 2.
 * User: song.chen
 * Date: 2015-08-19
 * Time: 16:22:59
 */
// 基于FormData的文件上传插件
// 支持的浏览器版本：Firefox,UC，搜狗,360浏览器,Safari4+,Chrome,IOS版Safari和安卓版Webkit,IE9+
// 作者：Juice Who
(function($){
  // 定义用于文件上传的对象
  function fileUploadObj(fileSelector,url,dragFile) {
    var obj = document.querySelector?document.querySelector(fileSelector):null;

    if (obj && window.FormData){
        this.obj = dragFile?dragFile:obj.files[0];
        this.formData = new FormData();
        this.url = url;
        this.xhr = createXHR();
    }
    else {
        alert('no form add')
    }
  }

  fileUploadObj.prototype = {
      constructor:fileUploadObj,
      setData: function (){
          this.formData.append('file',this.obj);
      },
      send: function (callback){  
          // 上传完成之后的回调函数
          this.xhr.onload = function(event) {
              // 上传成功]
              var callbackData = {};
              if (this.status >= 200 && this.status <300 || this.status === 304) {
                  // 上传成功之后回调函数，返回服务器数据
                 callbackData.data = this.responseText;
                 callbackData.status = true;
                 callback(callbackData);
              }
              // 失败
              else {
                  alert('上传失败'+this.responseText);
                  callbackData.data = this.responseText;
                  callbackData.status = false;
                  callback(callbackData);
              }
          };

          if (this.obj) {
            this.setData();
            this.xhr.open('POST',this.url);
            this.xhr.send(this.formData);
          }
          else {
            alert('未选中文件');
          }
          
      }
  }
})(jQuery);
