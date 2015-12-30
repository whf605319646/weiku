$(function () {
    var search_tag = decodeURIComponent(location.search.split('tag=')[1]);
    $.post('/dosearch',{ search: search_tag }, function (res) {
        if (res.status && res.data.length >0) {
            for (var i = 0;i<res.data.length;i++) {
                $('<div class="column" data-equalizer-watch>'+
                    '<a href="/movie/'+res.data[i].movieid +'">'+
                        '<img src="'+ res.data[i].post_src +'" class="thumbnail" alt="电影海报">'+
                        '<h6 class="text-center subheader">'+ res.data[i].title +'</h6>'+ 
                        '<div class="row">'+
                            '<h5 class="small-8 small-offset-2 columns">'+
                                    '<small class="subheader float-left"><i class="fi-heart">'+res.data[i].like.length+'</i></small>'+
                                    '<small class="subheader float-right"><i class="fi-comments">'+res.data[i].comments.length+'</i></small>'+
                            '</h5>'+
                        '</div>'+
                        '<hr/>'+
                    '</a>'+
                '</div>').appendTo('.type-list');
            }
        }
    });
});