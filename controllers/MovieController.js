var log = require('log4js').getLogger("server");
var passport = require('passport');
var xss = require('xss');
var Promise = require('bluebird');
var Movie = require('../models/Movie');


exports.addOne = function (req, res, next) {
    var formdata = {
        title: xss(req.body.title),
        type: xss(req.body.type),
        actor: xss(req.body.actor).split('|'),
        director: xss(req.body.director).split('|'),
        detail: xss(req.body.detail),
        duration: xss(req.body.duration),
        post_src: xss(req.body.post_src),
        play_src: xss(req.body.play_src),
        comments: [],
        like: [],
        dislike: [],
        publisher: req.user.username,
    };
    if (!req.user) {
        res.send({status: false, info: '未登录'});
    } else if (!formdata.title || !formdata.detail || !formdata.play_src) {
        res.send({status: false, info: '数据格式错误'});
    } else {
        // 如果有用户上传文件
        if (req.file) {
            formdata.post_src = '/uploads/'+req.file.filename;
            Movie.addOne(formdata)
            .then(function (data) {
                // 如果新增成功，重定向到新电影主页
                res.send({status: true, movieid: data.movieid});
            })
            .catch(function (err) {
                log.error(err);
                res.status(500).send({status: false, info: '服务器内部错误'});
            });
        } else {//否则
            Movie.addOne(formdata)
            .then(function (data) {
                // 如果新增成功，重定向到新电影主页
                res.send({status: true, movieid: data.movieid});
                
            })
            .catch(function (err) {
                log.error(err);
                res.status(500).send({status: false, info: '服务器内部错误'});
            });;
        }
    }
};

// 渲染新增电影页面
exports.add = function (req, res, next) {
    res.render('addMovie', { csrfToken: req.csrfToken(),user: req.user });
};

exports.findMovieById = function (req, res, next) {
    if (!/^\d+$/.test(req.params.id)) {
        return res.status(404).send();
    }
    Movie.findById(req.params.id)
    .then(function (data){
        if (data){
            res.render('movie', {status: true, data: data, user: req.user});
        } else {
            res.sendStatus(404);
        }
    }).catch(function (err) {
        log.error(err);
        res.sendStatus(500);
    });
};

exports.findByUser = function (req, res, next) {
    if (!req.user) {
        res.send({status: false, info: '未登录'});
    } else {
        Movie.findByUser(req.user.username)
        .then(function (data) {
            res.send({status: true, movie_data: data});
        })
        .catch(function (err) {
             log.error(err);
            return next(err);
        });
    }
};

exports.findAll = function (req, res, next) {
    Movie.findAllDesc()
    .then(function (data){  
            res.render('index', {status: true, data: data, user: req.user});
    })
    .catch (function (err) {
        log.error(err);
        res.send({status: false});
    });  
};

 
// 电影分类
exports.classify = function (req, res, next) {
    res.render('category', {category: req.query.type, user: req.user});
};

exports.findByType = function (req, res, next) {
    Movie.findByType(req.body.type)
    .then(function (data) {
        res.send({status: true, data: data});
        
    })
    .catch(function (err) {
         log.error(err);
        return next(err);
    });
};

exports.search = function (req, res, next) {
    res.render('search', {tag: req.query.tag, user: req.user});
};
// 搜索
exports.doSearch = function (req, res, next) {

    Movie.findByTitle(req.body.search)
    .then(function (data) {
        res.send({status: true, data: data});
        
    })
    .catch(function (err) {
        log.error(err);
        next(err);
    });
};

// 评论
exports.commentAdd = function (req, res, next) {
    res.send({
        status: true, 
        movieid: req.params.movieid, 
        csrfToken: req.csrfToken() 
    });
};

exports.addComment = function (req, res, next) {
    if (!req.user.username || !req.body.detail || !req.body.title) {
        res.send({status: false, info: '数据不完整'});
    } else {
        var formdata = {
            rel_user: req.user.username,
            content: {
                title: xss(req.body.title),
                detail: xss(req.body.detail)
            },
            movieid: xss(req.body.movieid)
        };

        Movie.addComment(formdata)
        .then(function (data) {
            formdata.avator = req.user.avator;
            res.send({status: true, data: formdata});
            
        })
        .catch(function (err) { 
            log.error(err);
            res.status(500).send({status: false, info: '服务器内部错误'});
        });
    }
};

exports.dislike = function (req, res, next) {
    var formdata = {
        uid: req.user.username,
        movieid: req.body.movieid
    };

    if (!formdata.uid || !/^\d+$/.test(formdata.movieid)) {
        res.send({status: false, info: '电影id出错'});
    } else {
        Movie.dislikeMovie(formdata)
        .then(function (data) {
            if (data) {
                var returndata = {};
                if (data.duplicate) {
                    returndata.info = '您已经评论过';
                    returndata.status = false;
                } else {
                    returndata.status = true;
                    returndata.dislknum = data.dislike.length;
                }
                res.send(returndata);
            }
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).end();
        });
    }
};

exports.like = function (req, res, next) {
    var formdata = {
        uid: req.user.username,
        movieid: req.body.movieid
    };

    if (!formdata.uid || !/^\d+$/.test(formdata.movieid)) {
        res.send({status: false, info: '电影id出错'});
    } else {
        Movie.likeMovie(formdata)
        .then(function (data) {
            if (data) {
                var returndata = {};
                if (data.duplicate) {
                    returndata.info = '您已经评论过';
                    returndata.status = false;
                } else {
                    returndata.status = true;
                    returndata.lknum = data.like.length;
                }
                res.send(returndata);
            } else {
                next();
            }
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).end();
        });
    }
};