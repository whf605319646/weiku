var should = require('should');
var supertest = require('supertest');
var app = require('../server');
var mongoose = require('mongoose');

// 通过supertest.agent()方法来持久化cookie
var request = supertest.agent(app);

describe('test ActivityController', function () {
    describe('test activity.addOne()', function () {
        before(function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(done);
        });

        it('test get activity.add page', function (done) {
            request.get('/addActivity')
            .expect(200)
            .expect('Content-Type', 'text/html; charset=utf-8')
            .end(function (err, res) {
                should.not.exists(err);
                done();
            })
        });

        // 由于这里有csrf保护，所以开发环境下测试这个用例的时候
        // 需要把router里面的csrf保护功能暂时去掉
        // 生产环境中要把csrfProtection,添加到router里面做限制 
        it('add activity successfully', function (done) {
            request.post('/doActivityAdd')
            .send({
                theme: '测试正常添加活动',
                date: '2015/12/12',
                content: '这是一段含有js脚本的内容<SCript>alert("xss")</script >',
                location: '大广州嘞',
                contacts: '1178505135@qq.com',
                rel_movie: 140,
                ptcp_num: 20,
            })
            .expect(200)
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('发布成功');
                done();
            })
        });

        it('data formation not correct', function (done) {
            request.post('/doActivityAdd')
            .send({
                theme: '数据格式错误',
                date: '2015.12.12',
                content: '这是一段含有js脚本的内容<SCript>alert("xss")</script >',
                location: '大广州嘞',
                contacts: '1178505135@qq.com',
                rel_movie: 140,
                ptcp_num: 20,
            })
            .expect(200)
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('数据格式错误');
                done();
            })
        });

        it('activity theme con not be empty', function (done) {
            request.post('/doActivityAdd')
            .send({
                theme: '',
                date: '2015/12/12',
                content: '这是一段含有js脚本的内容<SCript>alert("xss")</script >',
                location: '大广州嘞',
                contacts: '1178505135@qq.com',
                rel_movie: 140,
                ptcp_num: 20,
            })
            .expect(200)
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('数据格式错误');
                done();
            })
        });
    });

    describe('test activity.addParticipator()', function () {
        before(function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(done);
        });

        it('addParticipator successfully', function (done) {
            request.post('/participate')
            .send({
                acid: 130
            })
            .expect(200)
            .end(function (err, res) {
                should.not.exists(err);
                res.text.should.containEql('成功参加');
                done();
            });
        });

        it('addParticipator failed, has participated before', function (done) {
            request.post('/participate')
            .send({
                acid: 130
            })
            .expect(200)
            .end(function (err, res) {
                (err === null).should.be.true;
                res.text.should.containEql('您已经参与了该活动');
                done();
            });
        });

        it('activity not exist', function (done) {
            request.post('/participate')
            .send({
                acid: 1300
            })
            .expect(200)
            .end(function (err, res) {
                (err === null).should.be.true;
                res.text.should.containEql('活动不存在');
                done();
            });
        });
    });

    describe('test activity.deleteActivity()', function () {
        before(function (done) {
            request.post('/user')
            .send({
                username: 'username',
                password: '123456'
            })
            .end(done);
        });

        it('have no wright to delete', function (done) {
            request.post('/deleteActivity')
            .send({
                acid: 130
            })
            .expect(200)
            .end(function (err, res) {
                (err === null).should.be.true;
                res.text.should.containEql('不是组织者,没有权限');
                done();
            })
        });

         it('ctivity not exist', function (done) {
            request.post('/deleteActivity')
            .send({
                acid: 1300
            })
            .expect(200)
            .end(function (err, res) {
                (err === null).should.be.true;
                res.text.should.containEql('活动不存在');
                done();
            })
        });
    });
});