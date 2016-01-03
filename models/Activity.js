var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.connection;
// 初始化插件
autoIncrement.initialize(connection);

var ActivitySchema = new Schema({
    theme: {type: String, required: true},
    date: String,
    content: String,
    location: String,
    // 这里必须设置User的_id值和username统一，因为populate只关联_id
    organizer: {type: String, required: true, ref: 'User'},
    contacts: String,
    rel_user: [{type: String, ref: 'User'}],
    rel_movie: Number,
    ptcp_num: {type: Number, default: 100}
});

// 自增插件的使用
ActivitySchema.plugin(autoIncrement.plugin, {
    model: 'Activity',
    field: 'acid',
    startAt: 100
});

var Activity = mongoose.model('Activity', ActivitySchema);
var ActivityDAO = function (){};

// 增加活动记录
ActivityDAO.prototype.addOne = function (data, callback) {
    'use strict';
    var instance = new Activity(data);
    instance.save(function (err, data) {
        callback(err, data);
    });
};

// 通过查询用户发布过的所有活动
ActivityDAO.prototype.findByUser = function (uid, callback) {
    'use strict';
    Activity.find({'organizer': uid}).sort({acid: -1}).exec(callback);
};

ActivityDAO.prototype.findById = function (id, callback) {
    'use strict';
    var opt = [
        {path: 'organizer',select:{username:1,nickname:1,avator: 1, _id:0}},
        {path: 'rel_user', select:{username:1,nickname:1,avator: 1, _id:0}}
    ];
    Activity.findOne({'acid': id})
    .populate(opt)
    .exec(callback);
};

ActivityDAO.prototype.findByMovieId = function (id, callback) {
    'use strict';
    Activity.find({'rel_movie': id}).sort({acid: -1}).exec(callback);
};

// 参加活动
ActivityDAO.prototype.addParticipator = function (data, callback) {
    'use strict';
    Activity.findOne({acid: data.acid}, function (err, activity) {
        if (err) {
            callback(err, activity);
        } else if (activity) {
            // 判断是否超员
            if (activity.pctp_num < activity.rel_user.length) {
                callback(null, {status: false, info: '人数已满'});
            } else {
                delete data.acid;
                var noDuplicate = true;

                // 遍历一遍参与者看是否重复
                activity.rel_user.forEach(function (ele) {
                    if (data.uid === ele) {
                        noDuplicate = false;
                    }
                });
                if (noDuplicate) {
                    activity.rel_user.push(data.uid);
                    activity.save(function (err, newobj) {
                        newobj.status = true;
                        callback(err, newobj);
                    });
                } else {
                    callback(null, {status: false, info: '您已经参与了该活动'});
                }
            }
        } else {
            callback(null, {status: false, info: '活动不存在'});
        }
    });
};


// 删除活动
ActivityDAO.prototype.deleteActivity = function (data, callback) {
    'use strict';
    Activity.findOne({acid: data.acid}, function (err, activity) {
        if (err) {
            callback(err, activity);
        } else if(activity) {
            if (data.uid === activity.organizer) {
                activity.remove(function (err) {
                    callback(err, {status: true});
                });
            } else {
                callback(null, {status: false, info: '不是组织者,没有权限'});
            }
        } else {
            callback(null, {status: false, info: '活动不存在'});
        }
    });
};

module.exports = new ActivityDAO();