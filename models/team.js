var mongoose = require('mongoose');


module.exports = mongoose.model('team',{
    game: String,
    team: String,
    members: [String]
});