var passport = require('passport');
var log = require('log4js').getLogger("server");
var User = require('../models/User');


// file upload modules
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname+ Date.now()+'.'+file.originalname.split('.')[1]);
  }
});

var upload = multer({storage: storage}).single('avator');

// 用户首页
exports.getUser = function (req, res) {
    if (!req.user) {
        res.send({status: false, info: '未登录'});
    } else {
        res.render('user', {status: true, userdata: req.user});
    }
};

exports.login =  function (req, res, next) {
    req.session.save(function (err) {
        if (err) {
            log.error(err);
            return next(err);
        }
        res.send({status: true, sessiondata: {
                username: req.user.username,
                nickname: req.user.nickname,
                avator: req.user.avator
            }
        });
        // res.redirect('/user/' + req.user.username);
    });
};

exports.logout = function (req, res, next) {
    req.logout();
    req.session.save(function (err) {
        if (err) {
            log.error(err);
            return next (err);
        }
        res.redirect('/user');
        res.end();
    });
};

// 用户注册
exports.addUser = function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.send({status: false, info: '用户名或密码不能为空'});
    } else if (req.body.password.length < 6) {
        return res.send({status: false, info: '密码长度太短'});
    } 

    User.register(new User({username: req.body.username}), req.body.password, function (err, user) {
        if (err) {
            log.error(err);
            return res.render('register', {info: '用户名已被使用'});
        } 
        passport.authenticate('local')(req, res, function () {
            req.session.save(function (err) {
                if (err) {
                    log.error(err);
                    return next(err);
                }
                res.redirect('/user/' + req.body.username);
            });
        });

    });
};

// 更新用户信息文字资料
exports.updateInfo = function (req, res, next) {
    User.findOne({username: req.user.username}, function (err, doc) {
        if (doc) {
            doc.update(req.body, function (err, data) {
                if (err) {
                    log.error(err);
                    return next(err);
                }
                res.send({status: true});
            });
        } else {
            next();
        }
    });
};

// 更换头像
exports.updateAvator = function (req, res,next) {
    upload(req, res, function (err) {
        if (err) {
            log.error(err);
            return next(err);
        }
        User.findOne({username: req.user.username}, function (err, doc) {
            if (err) {
                log.error(err);
                return next(err);
            } else if (doc) {
                doc.update({avator: req.file.filename}, function (err, data) {
                    if (err) {
                        log.error(err);
                        return next(err);
                    }
                    res.type('html');
                    res.send({status: true, avator: req.file.filename});
                });
            } else {
                return next();
            }
        });
    });
};