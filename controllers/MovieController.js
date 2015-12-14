var Movie = require('../models/Movie');
var log = require('log4js').getLogger("server");
var passport = require('passport');
var xss = require('xss');


exports.addOne = function (req, res, next) {
    var formdata = {
        title: xss(req.body.title),
        type: xss(req.body.type),
        actor: xss(req.body.actor),
        director: xss(req.body.director),
        detail: xss(req.body.detail),
        duration: xss(req.body.duration),
        post_src: xss(req.body.post_src),
        play_src: xss(req.body.play_src),
        comments: [],
        like: [],
        dislike: [],
        publisher: {
            uid: req.user.username,
            name: req.user.nickname
        }
    };
    if (!req.user) {
        res.send({status: false, info: '未登录'});
    } else if (!formdata.title || !formdata.detail || !formdata.play_src) {
        res.send({status: false, info: '数据格式错误'});
    } else {
        // 如果有用户上传文件
        if (req.file) {
            formdata.post_src = req.file.filename;
            Movie.addOne(formdata, function (err, data) {
                if (err){
                    log.error(err);
                    res.status(500).send({status: false, info: '服务器内部错误'});
                } else {
                    // 如果新增成功，重定向到新电影主页
                    res.redirect('/movie/'+ data.movieid);
                }
            });
        } else {//否则
            Movie.addOne(formdata, function (err,data) {
                if (err){
                    log.error(err);
                    res.status(500).send({status: false, info: '服务器内部错误'});
                } else {
                    // 如果新增成功，重定向到新电影主页
                    res.redirect('/movie/'+ data.movieid);
                }
            });
        }
    }
};

// 渲染新增电影页面
exports.add = function (req, res, next) {
    res.render('addMovie', { csrfToken: req.csrfToken() });
};

exports.findMovieById = function (req, res, next) {
    Movie.findById(req.params.id, function (err, data){
        if (err) {
            log.error(err);
            res.sendStatus(500);
        } else if (data){
            res.render('movie', {status: true, data: data});
        } else {
            res.sendStatus(404);
        }
    });
};

exports.findByUser = function (req, res, next) {
    if (!req.user) {
        res.send({status: false, info: '未登录'});
    } else {
        Movie.findByUser(req.user.username, function (err, data) {
            if (err) {
                log.error(err);
                return next(err);
            } else {
                res.send({status: true, movie_data: data});
            }
        });
    }
};

exports.findAll = function (req, res) {
    Movie.findAllDesc(function (err, data){
        if (err) {
            log.error(err);
            res.send({status: false});
        }
        else {    
            res.render('index', {status: true, data: data});
        }
    });  
};
 
exports.commentAdd = function (req, res, next) {
    res.render('comment', { 
        movieid: req.params.movieid, 
        csrfToken: req.csrfToken() 
    });
};

exports.addComment = function (req, res, next) {
    if (!req.user.username || !req.body.detail || !req.body.title) {
        res.send({status: false, info: '数据不完整'});
    } else {
        var formdata = {
            rel_user: {
                uid: req.user.username,
                name: req.user.nickname
            },
            content: {
                title: xss(req.body.title),
                detail: xss(req.body.detail)
            },
            movieid: xss(req.body.movieid)
        };

        Movie.addComment(formdata, function (err, data) {
            if (err) {
                log.error(err);
                res.status(500).send({status: false, info: '服务器内部错误'});
            } else {
                res.redirect('/movie/'+req.body.movieid);
            }
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
        Movie.dislikeMovie(formdata, function (err,data) {
            if (err) {
                log.error(err);
                res.status(500).end();
                return ;
            } else if (data) {
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
        Movie.likeMovie(formdata, function (err,data) {
            if (err) {
                log.error(err);
                res.status(500).end();
                return ;
            } else if (data) {
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
        });
    }
};