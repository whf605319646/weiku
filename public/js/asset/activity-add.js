$(function(){var t=function(t){this.movieid=t,this.addBtn=$(".add-btn")};t.prototype.bindEvent=function(){var t=this;this.addBtn.on("click",function(n){var i={movieid:t.movieid,theme:$('input[name="theme"]').val(),date:$('input[name="date"]').val(),content:$('input[name="content"]').val(),location:$('input[name="location"]').val(),contacts:$('input[name="contacts"]').val(),ptcp_num:$('input[name="ptcp_num').val(),_csrf:$('input[name="_csrf"]').val()};for(var a in i)if("ptcp_num"!==a&&!i[a])return void $(".tip").html("请填写完整数据");i.ptcp_num=i.ptcp_num||100,$.post("/doActivityAdd",i,function(t){t.status?($("input").val(""),location.href="/activity/"+t.data.acid):$(".tip").html(t.info)})})},laydate({elem:"#pickdate"});var n=/\d+$/.exec(location.href)[0];new t(n).bindEvent()});