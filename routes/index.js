var express = require('express');
var router = express.Router();
var passport = require('passport');
var movie = require('../controllers/MovieController'),
    activity = require('../controllers/ActivityController');

// CSRF攻击预防模块的使用
var csurf = require('csurf');
var csrfProtection = csurf({ cookie: true});

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
var upload = multer({storage: storage});

var judgeStateRedirect = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
};

var judgeStateNoRedirect = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.send({loginState: false});
    }
};

var judgeState = function (req, res) {
  return res.send({loginState: req.isAuthenticated()});
};

/* GET home page. */
router.get('/', movie.findAll);

/*About Movies page*/
router.get('/movie/:id', movie.findMovieById);
router.get('/category', movie.classify);
router.get('/addmovie', judgeStateRedirect, csrfProtection, movie.add);
router.get('/comment/:movieid', csrfProtection, movie.commentAdd);
router.get('/judgeState',judgeState);
router.get('/search', movie.search);

router.post('/category', movie.findByType);
router.post('/dosearch', movie.doSearch);
router.post('/doMovieAdd', judgeStateNoRedirect, upload.single('movie_post'), csrfProtection, movie.addOne);
router.post('/likemovie', judgeStateNoRedirect, movie.like);
router.post('/dislikemovie', judgeStateNoRedirect, movie.dislike);
router.post('/addcomment', judgeStateNoRedirect, csrfProtection, movie.addComment);

/*About Activity page*/
router.get('/activity/:id', activity.findById);
router.get('/addactivity/:movieid', judgeStateRedirect, csrfProtection, activity.add);
router.post('/getrelactivity', activity.findByMovieId);
router.post('/participate', judgeStateNoRedirect, activity.addParticipator);
router.post('/deleteActivity', judgeStateNoRedirect, activity.deleteActivity);
router.post('/doActivityAdd', judgeStateNoRedirect, csrfProtection, activity.addOne);

module.exports = router;
