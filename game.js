var game_id = 0;

module.exports = {

	get_game_id: function(){
		return game_id;
	},
	inc_game_id: function(){
		game_id++;
	},
	dec_game_id: function(){
		game_id--;
	}
}