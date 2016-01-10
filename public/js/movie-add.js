$(function () {
    var AddMovie = function (mid) {
        this.addBtn = $('.add-btn');
    };
    AddMovie.prototype.bindEvent = function () {
        var that = this;
        this.addBtn.on('click', function (e) {
            var data = {
                title: $('#add-movie input[name="title"]').val(),
                type: $('#add-movie input[name="type"]:checked').val(),
                actor: $('#add-movie input[name="actor"]').val(),
                director: $('#add-movie input[name="director"]').val(),
                duration: $('#add-movie input[name="duration"]').val(),
                play_src: $('#add-movie input[name="play_src"]').val(),
                post_src: $('#add-movie input[name="post_src"]').val(),
                detail: $('#add-movie textarea[name="detail"]').val(),
                _csrf: $('#add-movie input[name="_csrf"]').val()
            };

            if (data.actor) {
                data.actor = data.actor.split('|');
            } 
            if (data.director) {
                data.director = data.director.split('|');
            }
            $('#add-movie').fileUpload('/doMovieAdd', data, function (res) {
                if (res && !res.status) {
                    $('.tip').html(res.info);
                } else if (res.status) {
                    location.href = '/movie/'+res.movieid;
                }
            })
        });
    };

    AddMovie.prototype.init = function () {
        this.bindEvent();
    };
    new AddMovie().init();
});