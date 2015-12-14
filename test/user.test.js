var should = require('should');
var supertest = require('supertest');
var app = require('../server');
var mongoose = require('mongoose');
var User = require('../models/User');

// 通过supertest.agent()方法来持久化cookie
var request = supertest.agent(app);

describe('test UserController', function (){

    describe('test user.addUser()', function () {
        before(function (done) {
            User.remove({}, function (err) {
                done();
            });
        });

        it('register sucessfully', function (done) {
            request.post('/user/authenticate/register')
            .send({
                username: 'username',
                password: '123456'
            })
            .expect(302, function (err, res) {
                should.not.exists(err);
                done();
            });
        });

        it('username already exist', function (done) {
            request.post('/user/authenticate/register')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('用户名已被使用');
                done();
            });
        });

        it('username is empty', function (done) {
            request.post('/user/authenticate/register')
            .send({
                username: '',
                password: '123456'
            })
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('用户名或密码不能为空');
                done();
            });
        });

        it('password is empty', function (done) {
            request.post('/user/authenticate/register')
            .send({
                username: 'username',
                password: ''
            })
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('用户名或密码不能为空');
                done();
            });
        });

        it('password too short', function (done) {
            request.post('/user/authenticate/register')
            .send({
                username: 'username',
                password: '123'
            })
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('密码长度太短');
                done();
            });
        });
    });

    describe('test user.login()', function () {

        it('username should not be empty', function (done) {
            request.post('/user')
            .send({
                username: '',
                password: '123456'
            })
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('Bad Request');
                done();
            });
        });

        it('password should not be empty', function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: ''
            })
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('Bad Request');
                done();
            });
        });

        it('wrong password', function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: 'wrongpassword'
            })
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('Unauthorized');
                done();
            });
        });

        it('login sucessfully', function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(function (err, res) {
                should.not.exists(err);
                done();
            });
        });
    });
    
    describe('test user.updateInfo()', function () {
        before(function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(function (err, res) {
                done();
            });
        });

        it('update info sucessfully', function (done) {
            request.post('/user/update/info')
            .send({
                nickname: 'newnickname'
            })
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('{"status":true}');
                done();
            });
        }); 

        after(function (done) {
            request.get('/user/username')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                should.not.exists(err);
                done();
            })
        });
    });

    // 测试头像上传
    describe('test user.updateAvator()', function () {
        before(function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(function (err, res) {
                done();
            });
        });

        it('update avator upload sucessfully', function (done) {
            request.post('/user/update/avator')
            .attach('avator','test/image/test.jpg')
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('"status":true');
                done();
            });
        }); 
    });

    // 测试获取用户相关信息
    describe('test user relative movie and activity', function () {
        before(function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(function (err, res) {
                done();
            });
        });

        after(function (done) {
            request.post('/user/authenticate/logout')
            .expect(302)
            .end(done);
        });

        it('test get movie about user sucessfully', function (done) {
            request.get('/user/rel/movie')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('"status":true');
                done();
            });
        });

        it('test get activity about user sucessfully', function (done) {
            request.get('/user/rel/activity')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('"status":true');
                done();
            });
        });
    });

    describe('test get user relative without login', function () {
        it('test get movie about user failed', function (done) {
            request.get('/user/rel/movie')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('"status":false,"info":"未登录"');
                done();
            });
        });
    });

    describe('test user.getUser()', function () {
        before(function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(done);
        });

        it.skip('test get user information failed', function (done) {
            request.get('/user/username')
            .set('Accept', 'application/json')
            .expect(302,done);
        });

        it('test get user information successfully', function (done) {
            request.get('/user/username')
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
                should.not.exists(err);
                done();
            });
        });
    });
});
