var mongoose = require('mongoose');


module.exports = mongoose.model('game',{
    game: {
    	type:String,
    	unique: true
    },
    players:{
    	socket_id:{
    		type: String,
    		unique: true
    	},
    	player_name: String
    } 
});