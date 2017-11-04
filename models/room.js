'use strict';
var mongoose = require('mongoose');


module.exports = mongoose.model('Room',{
    username: String,
    message: String
});