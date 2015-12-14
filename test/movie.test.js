var should = require('should');
var supertest = require('supertest');
var app = require('../server');
var mongoose = require('mongoose');

// 通过supertest.agent()方法来持久化cookie
var request = supertest.agent(app);

describe('test MovieController', function() {
    describe('test movie.add()', function () {
        it.skip('not login, get page failed', function (done) {
            request.get('/addMovie')
            .expect(302)
            .end(done);
        });

        before(function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(done);
        });

         it('get movie add page successfully', function (done) {
            request.get('/addMovie')
            .expect(200)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(done);
        });
    });

    describe('test movie.addOne()', function () {
        beforeEach(function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(done);
        });

        // 由于这里有csrf保护，所以开发环境下测试这个用例的时候
        // 需要把router里面的csrf保护功能暂时去掉
        // 生产环境中要把csrfProtection,添加到router里面做限制 
        it.skip('add movie not upload post, successfully', function (done) {

            request.post('/doMovieAdd')
            .send({
                title: '测试新增电影',
                type: ['爱情','搞笑'],
                actor: ['李冰冰','范冰冰'],
                director: ['李安'],
                detail: '这是电影剧情简介这是电影剧情简介这是电影剧情简介',
                duration: 80,
                post_src: 'test/image/test',
                play_src: 'www.play_src.com/example',
                comments: [],
                like: [],
                dislike: [],
                publisher: {
                    uid: 'username',
                    name: 'newnickname'
                }
            })
            .expect(302)
            .end(function (err, res) {
                should.not.exists(err);
                done();
            });
        });

        it.skip('add movie, fileds title can not be empty', function (done) {

            request.post('/doMovieAdd')
            .send({
                title: '',
                type: ['爱情','搞笑'],
                actor: ['李冰冰','范冰冰'],
                director: ['李安'],
                detail: '这是电影剧情简介这是电影剧情简介这是电影剧情简介',
                duration: 80,
                post_src: 'test/image/test',
                play_src: 'www.play_src.com/example',
                comments: [],
                like: [],
                dislike: [],
                publisher: {
                    uid: 'username',
                    name: 'newnickname'
                }
            })
            .expect(200)
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('"status":false,"info":"数据格式错误"');
                done();
            });
        });

        it.skip('add movie, fileds detail can not be empty', function (done) {

            request.post('/doMovieAdd')
            .send({
                title: '测试部分必需字段缺失',
                type: ['爱情','搞笑'],
                actor: ['李冰冰','范冰冰'],
                director: ['李安'],
                detail: '',
                duration: 80,
                post_src: 'test/image/test',
                play_src: 'www.play_src.com/example',
                comments: [],
                like: [],
                dislike: [],
                publisher: {
                    uid: 'username',
                    name: 'newnickname'
                }
            })
            .expect(200)
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('"status":false,"info":"数据格式错误"');
                done();
            });
        });
    });

    describe('test movie.like()', function () {
        before(function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(done);
        });

        it('add like failed, movieid is not an integer', function (done) {
            request.post('/likeMovie')
            .send({
                movieid: '140c'
            })
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('电影id出错');
                done();
            });
        });

        it.skip('add like successfully', function (done) {
            request.post('/likeMovie')
            .send({
                movieid: 140
            })
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('"status":true');
                done();
            });
        });

        it('add like failed, has added like before', function (done) {
            request.post('/likeMovie')
            .send({
                movieid: 140
            })
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('您已经评论过');
                done();
            });
        });
    });

    describe('test movie.addComment()', function() {
        before(function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(done);
        });

        // 由于这里有csrf保护，所以开发环境下测试这个用例的时候
        // 需要把router里面的csrf保护功能暂时去掉
        // 生产环境中要把csrfProtection,添加到router里面做限制 
        it.skip('addComment failed, title can not be empty', function (done) {
            request.post('/addComment')
            .send({
                title: '',
                detail: '这是测试title为空的不合法评论',
                movieid: 140
            })
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('数据不完整');
                done();
            });
        });

        it.skip('addComment successfully', function (done) {
            request.post('/addComment')
            .send({
                title: '测试评论成功',
                detail: '非常好非常好',
                movieid: 140
            })
            .expect(302)
            .end(done);
        });
    });
});