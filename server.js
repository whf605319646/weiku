var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var domain = require('domain');
var log4js = require('log4js');
var flash = require('connect-flash');

var index = require('./routes/index');
var users = require('./routes/users');
// open mongodb
var db = require('./models/db'); 

log4js.configure('./config/log4js.json');
var log = log4js.getLogger("server"); 
var PORT = 80;

var app = express();
app.locals.title = '微.酷';
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var sessionConfig = session({secret: 'weiku_cookie', name:'user',resave: false, saveUninitialized: false});
app.use(log4js.connectLogger(log4js.getLogger("server"), { level: 'auto' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// uncomment after placing your favicon in /public
app.use('/static',express.static(path.join(__dirname, 'public')));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
app.use(favicon(__dirname + '/public/images/icon.jpg'));

app.use('/', index);
app.use('/user', users);

// passport认证配置，采用localStrategy
var User = require('./models/User');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -- socket.io  start
var server = http.Server(app);
var io = require('socket.io').listen(server);
var ios = require('socket.io-express-session');
io.use(ios(sessionConfig)); // 使用对session模块的支持
var roomUser = {};
io.on('connection', function (socket) {
    var myIndexOf = function (obj, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].username === obj.username) {
                return i;
            }
        }
       return -1;
    };

    // 获取用户当前的url，从而截取出房间id
    var url = socket.request.headers.referer;
    var split_arr = url.split('/');
    var roomid = split_arr[split_arr.length-1] || 'index';
    var user = {};

    /**
     * connect连接
     * @param  {[type]} user) { user.username [用户名]
     * @param( {[type]} user) {user.avator [头像]}
     * @return {[type]} 
     */
    socket.on('join', function () {
        // 使用socket.io-session插件去判断当前用户是否登录
        if (socket.handshake.session.passport) {    
            user.username = socket.handshake.session.passport.user;
        } else {
            user.username = '';
        }
        // user.avator = usr.avator;
        // console.log(socket.handshake.session.passport); 

        // 将用户归类到房间
        if (!roomUser[roomid]) {
            roomUser[roomid] = [];
        }
        if(myIndexOf(user,roomUser[roomid]) === -1) {
            user.tab = 1; 
            roomUser[roomid].push(user);
            socket.join(roomid);
            socket.to(roomid).emit('sys', roomUser[roomid].length);
            socket.emit('sys', roomUser[roomid].length);
        } else {
            var index = myIndexOf(user,roomUser[roomid]);
            roomUser[roomid][index].tab++;
            socket.join(roomid);
        }
        // console.log(roomUser);
    });

    // 监听来自客户端的消息
    socket.on('message', function (msg) {
        // 验证如果用户不在房间内则不给发送
        if (myIndexOf(user,roomUser[roomid])< 0) {  
          return false;
        }
        socket.emit('my message', msg);
        socket.to(roomid).emit('new message', msg);
    });

    // 关闭
    socket.on('disconnect', function () {
        // 从房间名单中移除
        socket.leave(roomid, function (err) {
            if (err) {
                log.error(err);
            } else {
                var index = myIndexOf(user,roomUser[roomid]);
                if (index !== -1 && roomUser[roomid][index].tab === 1) {
                    roomUser[roomid].splice(index, 1);
                    socket.to(roomid).emit('sys',roomUser[roomid].length);
                } else if (index !== -1 && roomUser[roomid][index].tab > 1){
                    roomUser[roomid][index].tab--;
                }
                // console.log(roomUser);
            }
        });
    });
});
// -- socket.io end

/**
 *define error handle middleware
 *引入一个domain的中间件，将每一个请求都包裹在一个独立的domain中
 *domain来处理异常
 */
app.use(function (req, res, next) {
    var d = domain.create();
    d.on('error', function (err) {
        res.send(500, err.stack);
    });
    d.add(req);
    d.add(res);
    d.run(next);

    // 为了以防万一，在这里用process监测domain可能捕捉不到的异常
    process.on('uncaughtException', function (err) {
        log.error('uncaughtException occur');
        if (typeof err === 'object') {
            if (err.message) {
                log.error('ERROR:' + err.message);
            } else if (err.stack) {
                log.error(err.stack);
            } else {
                log.error('error not an object');
            }
        }
    });
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    'use strict';
    var err = new Error('Not Found');
    err.status = 404;
    log.error(err);
    next(err);
});

/**
 * error handlers
 * development error handler
 * will print stacktrace
 */
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        'use strict';
        log.error(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    'use strict';
    if (err.code == 'EBADCSRFTOKEN') {
        log.error(err);
        res.status(403);
        res.render('error', {
            message: '存在CSRF令牌错误',
            error: {}
        });
    } else {
        log.error(err);
        res.status(err.status).render('error', {
            message: err.message,
            error: {}
        });
    }
});

if (!module.parent) {
    // This server is socket server
    server.listen(PORT);
    log.info('Weiku started up');
}
module.exports = server;
