var express = require('express');
var router = express.Router();
var passport = require('passport');
var log = require('log4js').getLogger("server");

var user = require('../controllers/UserController'),
    movie = require('../controllers/MovieController'),
    activity = require('../controllers/ActivityController');

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
        // res.send({loginState: false});
    }
}
/* GET users listing. */
router.get('/:uid', isAuthenticated, user.getUser);
router.post('/',passport.authenticate('local',{failureFlash:true}), user.login);

router.post('/authenticate/logout', user.logout);
router.post('/authenticate/register', user.addUser);

// 用户相关的资料
router.get('/rel/movie', movie.findByUser);
router.get('/rel/activity', activity.findByUser);
router.post('/update/info', user.updateInfo);
router.post('/update/avator', user.updateAvator);

module.exports = router;