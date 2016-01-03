var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var UserSchema = new Schema({
    _id: String,
    username: String,
    nickname: String,
    password: String,
    avator: {type: String, default: '/static/images/default_avator.jpg'}
});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', UserSchema);
module.exports = User;