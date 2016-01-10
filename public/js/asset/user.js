$(function(){var t=function(){this.movieList=$(".movie-list"),this.activityList=$(".actv-list"),this.updateInfo=$(".update-info"),this.updateAvator=$(".avator-replace")};t.prototype.getMovie=function(){var t=this;$.get("/user/rel/movie",function(i,a){if(i.status)for(var e=0;e<i.movie_data.length;e++)t.movieList.append('<div class="columns"><div class="small-4 columns"><img src="'+i.movie_data[e].post_src+'" alt="电影海报" class="thumbnail"></div><div class="small-8 columns"><span><a href="/movie/'+i.movie_data[e].movieid+'">'+i.movie_data[e].title+"</a></span></div></div>")})},t.prototype.getActivity=function(){var t=this;$.get("/user/rel/activity",function(i,a){if(i.status)for(var e=0;e<i.activity_data.length;e++)t.activityList.append('<div class="callout success small"><a href="/activity/'+i.activity_data[e].acid+'"><h6>'+i.activity_data[e].theme+'</h6></a><small class="subheader">时间:&nbsp;'+i.activity_data[e].date+'</small><span class="alert label float-right del-activity"><i class="fi-x"></i><input type="hidden" value="'+i.activity_data[e].acid+'"/></span></div>')})},t.prototype.bindEvent=function(){var t=this;this.updateInfo.on("click",function(){var t=$("#nickname-input").val(),i=$('#basic-info input[name="gender"]:checked').val();t.length<1||$.post("/user/update/info",{nickname:t,gender:i},function(t){t.status?alert("更新成功"):$(".update-info-tip").html("修改信息失败")})}),this.activityList.on("click",".del-activity",function(){var i=confirm("删除此活动?");if(i){var a=$(this).children("input").val();$.post("/deleteActivity",{acid:a},function(i){i.status?(t.activityList.find(".callout").remove(),t.getActivity()):alert(i.info)})}}),this.updateAvator.on("click",function(){$("#up-avator").fileUpload("/user/update/avator",{},function(t){t.status&&($(".avator-large").replaceWith('<img src="'+t.avator+'" class="avator-large" alt="加载头像失败" />'),$("#up-avator").find("input").val(""),$("#avator-modal").foundation("close"))})})},t.prototype.init=function(){this.bindEvent(),this.getMovie(),this.getActivity()},(new t).init()});