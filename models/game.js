var mongoose = require('mongoose');

var schema = mongoose.Schema;

var player = new schema({
    player_name: String,
    socket: Object
    
});

var game_schema = new schema({
    game: String,
    players:[player]
});

var game = mongoose.model('game', game_schema);

module.exports = game;



/*mongoose.model('game',{
    game: String,
    players: [{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'player',
    	player:{
    	socket_id: String,
    	player_name: String
    	}
    }]
});*/