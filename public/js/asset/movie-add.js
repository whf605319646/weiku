$(function(){var t=function(t){this.addBtn=$(".add-btn")};t.prototype.bindEvent=function(){this.addBtn.on("click",function(t){var i={title:$('#add-movie input[name="title"]').val(),type:$('#add-movie input[name="type"]:checked').val(),actor:$('#add-movie input[name="actor"]').val(),director:$('#add-movie input[name="director"]').val(),duration:$('#add-movie input[name="duration"]').val(),play_src:$('#add-movie input[name="play_src"]').val(),post_src:$('#add-movie input[name="post_src"]').val(),detail:$('#add-movie textarea[name="detail"]').val(),_csrf:$('#add-movie input[name="_csrf"]').val()};i.actor&&(i.actor=i.actor.split("|")),i.director&&(i.director=i.director.split("|")),$("#add-movie").fileUpload("/doMovieAdd",i,function(t){t&&!t.status?$(".tip").html(t.info):t.status&&(location.href="/movie/"+t.movieid)})})},t.prototype.init=function(){this.bindEvent()},(new t).init()});