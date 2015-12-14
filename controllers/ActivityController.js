var Activity = require('../models/Activity');
var log = require('log4js').getLogger("server");
var passport = require('passport');
var xss = require('xss');
var csurf = require('csurf');


exports.add = function (req, res, next) {
    res.render('addActivity', {csrfToken: req.csrfToken()});
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
            rel_movie: xss(req.body.rel_movie),
            ptcp_num: xss(req.body.ptcp_num),
            organizer: {
                uid: req.user.username,
                nickname: req.user.nickname,
                avator: req.user.avator
            }
        };
        if (formdata.theme.length>0 && /^\d+$/.test(formdata.rel_movie) && /\d{4}\/\d{1,2}\/\d{1,2}/.test(formdata.date)) {
            Activity.addOne(formdata, function (err, data){
                if (err){
                    log.error(err);
                    res.status(500).send({status: false, info: '服务器内部错误'});
                } else {
                    res.send({status: true, info: '发布成功'});
                }
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
            nickname: req.user.nickname,
            avator: req.user.avator
        };

        Activity.addParticipator(formdata, function (err, data) {
            if (err) {
                log.error(err);
                res.sendStatus(500);
            } else if(data.status) {
                res.send({status: true, info: '成功参加'});
            } else {
                res.send({status: false, info: data.info});
            }
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
        Activity.deleteActivity(formdata, function (err, data) {
            if (err) {
                log.error(err);
                res.status(500).send({status: false, info: '服务器内部错误'});
            } else if(data.status) {
                res.send({status: true, info: '删除成功'});
            } else {
                res.send(data);
            }
        });
    }
};


exports.findByUser = function (req, res, next) {
    if (!req.user) {
        res.send({status: false, info: '未登录'});
    } else {
        Activity.findByUser(req.user.username, function (err, data) {
            if (err) {
                log.error(err);
                res.send({status: false, info: '服务器内部错误'});
            } else {
                res.send({status: true, activity_data: data});
            }
        });
    }
};

exports.findById = function (req, res, next) {
    Activity.findById(req.params.id, function (err, data) {
        if (err) {
            log.error(err);
            res.sendStatus(404);
        } else {
            res.render('activity', {status: true, activity_data: data});
        }
    });
};