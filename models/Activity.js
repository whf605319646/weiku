var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.connection;
var Promise = require('bluebird');
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
ActivityDAO.prototype.addOne = function (data) {
    'use strict';
    return new Promise(function (resolve, reject) {
        var instance = new Activity(data);
        instance.save(function (err, data) {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};

// 通过查询用户发布过的所有活动
ActivityDAO.prototype.findByUser = function (uid) {
    'use strict';
    return new Promise(function (resolve, reject) {
        Activity.find({'organizer': uid}).sort({acid: -1}).exec(function (err, data) {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};

ActivityDAO.prototype.findById = function (id) {
    'use strict';
    var opt = [
        {path: 'organizer',select:{username:1,nickname:1,avator: 1, _id:0}},
        {path: 'rel_user', select:{username:1,nickname:1,avator: 1, _id:0}}
    ];
    return new Promise(function (resolve, reject) {
        Activity.findOne({'acid': id})
        .populate(opt)
        .exec(function (err, data) {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};

ActivityDAO.prototype.findByMovieId = function (id) {
    'use strict';
    return new Promise(function (resolve, reject) {
        Activity.find({'rel_movie': id}).sort({acid: -1})
        .exec(function (err, data) {
            if (err) {
                return reject(err);
            } 
            resolve(data);
        });
    });
};

// 参加活动
ActivityDAO.prototype.addParticipator = function (data) {
    'use strict';
    return new Promise(function (resolve, reject) {
        Activity.findOne({acid: data.acid}, function (err, activity) {
            if (err) {
                return reject(err);
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
                            if (err) {
                                return reject(err);
                            }
                            newobj.status = true;
                            return resolve(newobj);
                        });
                    } else {
                       return resolve({status: false, info: '您已经参与了该活动'});
                    }
                }
            } else {
               return resolve({status: false, info: '活动不存在'});
            }
        });
    });
};


// 删除活动
ActivityDAO.prototype.deleteActivity = function (data, callback) {
    'use strict';
    return new Promise(function (resolve, reject) {
        Activity.findOne({acid: data.acid}, function (err, activity) {
            if (err) {
                return reject(err);
            } else if(activity) {
                if (data.uid === activity.organizer) {
                    activity.remove(function (err) {
                        if (err) {
                            return reject(err);
                        }
                        resolve({status: true});
                    });
                } else {
                    resolve({status: false, info: '不是组织者,没有权限'});
                }
            } else {
                resolve({status: false, info: '活动不存在'});
            }
        });
    });
};

module.exports = new ActivityDAO();