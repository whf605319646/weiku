var mongoose = require('mongoose');
var config = require('../config/config');


mongoose.connect(config.db.mongodb);
mongoose.connection.on('error', console.error.bind(console, 'connect error!'));
// mongoose.connection.once('open', function () {
//     'use strict';
//     console.log('mongodb connected!');
// });
exports.mongoose = mongoose;