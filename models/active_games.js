var mongoose = require('mongoose');

var beacons = new mongoose.Schema({
	'beacon1':{
		type: String,
		default: 'false'
	},
		'beacon2':{
		type: String,
		default: 'false'
	},
		'beacon3':{
		type: String,
		default: 'false'
	},
})

module.exports = mongoose.model('active_game',{
	 				'game_id':String,
	 				'team1':{
	 					type: [beacons],
	 					default: [beacons]
	 				},
	 				'team2':{
	 					type: [beacons],
	 					default: [beacons]
	 				},
	 				'team3':{
	 					type: [beacons],
	 					default: [beacons]
	 				},

});