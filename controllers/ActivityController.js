var Activity = require('../models/Activity');
var log = require('log4js').getLogger("server");
var passport = require('passport');
var xss = require('xss');
var csurf = require('csurf');


exports.add = function (req, res, next) {
    res.render('addActivity', {user: req.user, csrfToken: req.csrfToken()});
};

exports.addOne = function (req, res, next) {
    if (!req.user) {
        res.send({status: false, info: '未登录'});
    } else {
        var formdata = {
            theme: xss(req.body.theme),
            date: xss(req.body.date),
            content: xss(req.body.content),
            location: xss(req.body.location),
            contacts: xss(req.body.contacts),
            rel_movie: xss(req.body.movieid),
            ptcp_num: xss(parseInt(req.body.ptcp_num,10)),
            organizer: req.user.username    
        };
        if (formdata.theme.length>0 && /^\d+$/.test(formdata.rel_movie) && /\d{4}\-\d{1,2}\-\d{1,2}/.test(formdata.date)) {
            Activity.addOne(formdata)
            .then(function (data){
                res.send({status: true, data: data});
            })
            .catch(function (err) {
                log.error(err);
                res.status(500).send({status: false, info: '服务器内部错误'});
            }); 
        } else {
            res.status(200).send({status: false, info: '数据格式错误'});
        }
    }
};

exports.addParticipator = function (req, res, next) {
    if (!req.user) {
        res.send({status: false, info: '未登录'});
    } else { 
        var formdata = {
            acid: req.body.acid,
            uid: req.user.username,
        };

        Activity.addParticipator(formdata)
        .then(function (data) {
            if(data.status) {
                res.send({status: true, data: {uid: req.user.username, nickname:req.user.nickname,avator: req.user.avator, num: data.rel_user.length}});
            } else {
                res.send({status: false, info: data.info});
            }
        })
        .catch(function (err) {
            log.error(err);
            res.sendStatus(500);
        });
    }
};

exports.deleteActivity = function (req, res, next) {
    if (!req.user) {
        res.send({status: false, info: '未登录'});
    } else {
        var formdata = {
            uid: req.user.username,
            acid: req.body.acid
        };
        Activity.deleteActivity(formdata)
        .then(function (data) {
            if(data.status) {
                res.send({status: true, info: '删除成功'});
            } else {
                res.send(data);
            }
        })
        .catch(function (err) {
            log.error(err);
            res.status(500).send({status: false, info: '服务器内部错误'});
        });
    }
};


exports.findByUser = function (req, res, next) {
    if (!req.user) {
        res.send({status: false, info: '未登录'});
    } else {
        Activity.findByUser(req.user.username)
        .then(function (data) {
            res.send({status: true, activity_data: data});
        })
        .catch(function (err) {
            log.error(err);
            res.send({status: false, info: '服务器内部错误'});
        });
    }
};

exports.findById = function (req, res, next) {
    Activity.findById(parseInt(req.params.id,10))
    .then(function (data) {
        res.render('activity', {status: true, activity_data: data, user: req.user});
    })
    .catch(function (err) {
        log.error(err);
        res.sendStatus(404);
    });
};

exports.findByMovieId = function (req, res, next) {
    Activity.findByMovieId(req.body.movieid)
    .then(function (data) {
        res.send({status: true,rel_actv: data});
    })
    .catch(function (err) {
        log.error(err);
        res.status(500).send();
    });
};