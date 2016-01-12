var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.connection;
var Promise = require('bluebird');
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
    publisher: {type: String, ref: 'User'},
    date: {type: Date, default: Date.now},
    like: Array,
    dislike: Array,
    comments: [
        {
            rel_user: {type: String, ref: 'User'},
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
MovieDAO.prototype.addOne = function (data) {
    'use strict';
    return new Promise(function (resolve, reject) {
        var instance = new Movie(data);
        instance.save(function (err, data) {
            if (err) {
               return reject(err);
            } 
            resolve(data);
        });
    });
};

// 通过id查找
MovieDAO.prototype.findById = function (movieid) {
    'use strict';
    var opt = [
        {path: 'publisher', select:{username:1,nickname:1,avator: 1, _id:0}},
        {path: 'comments.rel_user', select:{username:1,nickname:1,avator: 1, _id:0}}
    ];
    return new Promise(function (resolve, reject) {
        Movie.findOne({movieid: movieid})
        .populate(opt)
        .exec(function (err, obj) {
            if (err) {
                return reject(err)
            }
            // callback(err, obj);
            resolve(obj);
        });
    });
};

// 查找用户相关发布过的电影
MovieDAO.prototype.findByUser = function (uid) {
    'use strict';
    return new Promise(function (resolve, reject) {
        Movie.find({'publisher': uid}).sort({movieid: -1}).exec(function (err,data) {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};

// 查找该分类的电影，按movieid倒序排列
MovieDAO.prototype.findByType = function (type) {
    'use strict';
    return new Promise(function (resolve, reject) {
        Movie.find({type: [type]}).sort({movieid: -1}).exec(function (err, data) {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};

// 按照标题模糊搜索
MovieDAO.prototype.findByTitle = function (search) {
    'use strict';
    return new Promise(function (resolve, reject) {
        Movie.find().where({title: new RegExp(search)}).sort({movieid: -1}).exec(function (err, data) {
            if(err) {
                return reject(err);
            }
            resolve(data);
        });
    })
};

// 查找所有电影，按movieid倒序排列
MovieDAO.prototype.findAllDesc = function () {
    'use strict';
    return new Promise(function (resolve, reject) {
        Movie.find().sort({movieid: -1}).exec(function (err, data) {
             if(err) {
                return reject(err);
            }
            resolve(data);
        });
    })
};

// 增加评论
MovieDAO.prototype.addComment = function (data) {
    'use strict';
    return new Promise(function (resolve, reject) {
        Movie.findOne({movieid: data.movieid}, function (err, movie) {
            if (err) {
                return reject(err);
            } else {
                delete data.movieid;
                movie.comments.unshift(data);
                movie.save(function (err, newobj) {
                    if (err) {
                        return reject(err);
                    } 
                    resolve(newobj);
                });
            }
        });
    });
};

// 点赞
MovieDAO.prototype.likeMovie = function (data) {
    'use strict';
    return new Promise(function (resolve, reject) {
        Movie.findOne({movieid: data.movieid}, function (err, movie) {
            if (err) {
                return reject(err);
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
                        if (err) {
                            return reject(err)
                        }
                        resolve(newobj);
                    });
                } else {
                    resolve({duplicate: true});
                }
            } else {
               return reject(new Error('no movie'));
            }
        });
    });
};

// 差评
MovieDAO.prototype.dislikeMovie = function (data) {
    'use strict';
    return new Promise(function (resolve, reject) {
        Movie.findOne({movieid: data.movieid}, function (err, movie) {
            if (err) {
                return reject(err);
            } else if (movie) {
                // 去重，防止重复点赞
                var noDuplicate = true;
                movie.dislike.forEach(function (ele) {
                    if (data.uid === ele) {
                        noDuplicate = false;
                    }
                });

                if (noDuplicate) {
                    movie.dislike.push(data.uid);
                    movie.save(function (err, newobj) {
                        if (err) {
                            return reject(err)
                        }
                        resolve(newobj);
                    });
                } else {
                    resolve({duplicate: true});
                }
            } else {
               return reject(new Error('no movie'));
            }
        });
    });
};

module.exports = new MovieDAO();