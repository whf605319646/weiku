var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.connection;
// 初始化插件
autoIncrement.initialize(connection);

var MovieSchema = new Schema({
    // movieid: {type: Number, unique: true},
    title: {type: String, required: true},
    type: Array,
    actor: Array,
    director: Array,
    detail: {type: String, required: true},
    duration: {type: Number, default: 0},
    post_src: {type: String, default: '/static/images/default-poster.png'},
    play_src: String,
    publisher: {
        uid: String,
        name: String
    },
    date: {type: Date, default: Date.now},
    like: Array,
    dislike: Array,
    comments: [
        {
            rel_user: {
                uid: String,
                name: String
            },
            content: {
                title: String,
                detail: String
            },
            date: {type: Date, default: Date.now}
        }
    ]
});

// 自增插件的使用
MovieSchema.plugin(autoIncrement.plugin, {
    model: 'Movie',
    field: 'movieid',
    startAt: 100
});

var Movie = mongoose.model('Movie', MovieSchema);
var MovieDAO = function (){};

// 增加电影
MovieDAO.prototype.addOne = function (data, callback) {
    'use strict';
    var instance = new Movie(data);
    instance.save(function (err, data) {
        callback(err, data);
    });
};

// 通过id查找
MovieDAO.prototype.findById = function (movieid, callback) {
    'use strict';
    Movie.findOne({movieid: movieid}, function (err, obj) {
        callback(err, obj);
    });
};

// 查找用户相关发布过的电影
MovieDAO.prototype.findByUser = function (uid, callback) {
    'use strict';
    Movie.find({'publisher.uid': uid}).sort({movieid: -1}).exec(callback);
};

// 查找该分类的电影，按movieid倒序排列
MovieDAO.prototype.findByType = function (type, callback) {
    'use strict';
    Movie.find({type: [type]}).sort({movieid: -1}).exec(callback);
};

// 按照标题模糊搜索
MovieDAO.prototype.findByTitle = function (search, callback) {
    'use strict';
    Movie.find().where({title: new RegExp(search)}).sort({movieid: -1}).exec(callback);
};

// 查找所有电影，按movieid倒序排列
MovieDAO.prototype.findAllDesc = function (callback) {
    'use strict';
    Movie.find().sort({movieid: -1}).exec(callback);
};

// 增加评论
MovieDAO.prototype.addComment = function (data, callback) {
    'use strict';
    Movie.findOne({movieid: data.movieid}, function (err, movie) {
        if (err) {
            callback(err, movie);
        } else {
            delete data.movieid;
            movie.comments.unshift(data);
            movie.save(function (err, newobj) {
                callback(err, newobj);
            });
        }
    });

};

// 点赞
MovieDAO.prototype.likeMovie = function (data, callback) {
    'use strict';
    Movie.findOne({movieid: data.movieid}, function (err, movie) {
        if (err) {
            callback(err, movie);
        } else if (movie) {
            // 去重，防止重复点赞
            var noDuplicate = true;
            movie.like.forEach(function (ele) {
                if (data.uid === ele) {
                    noDuplicate = false;
                }
            });

            if (noDuplicate) {
                movie.like.push(data.uid);
                movie.save(function (err, newobj) {
                    callback(err, newobj);
                });
            } else {
                callback(null, {duplicate: true});
            }
        } else {
            callback(new Error('no movie'), null);
        }
    });
};

// 差评
MovieDAO.prototype.dislikeMovie = function (data, callback) {
    'use strict';
    Movie.findOne({movieid: data.movieid}, function (err, movie) {
        if (err) {
            callback(err, movie);
        } else {
            // 去重，防止重复点
            var noDuplicate = true;
            movie.dislike.forEach(function (ele) {
                if (data.uid === ele) {
                    noDuplicate = false;
                }
            });

            if (noDuplicate) {
                movie.dislike.push(data.uid);
                movie.save(function (err, newobj) {
                    callback(err, newobj);
                });
            } else {
                callback(null, {duplicate: true});
            }
        }
    });
};

module.exports = new MovieDAO();