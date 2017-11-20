var mongoose = require('mongoose');

module.exports = mongoose.model('question',{
	 				'game_id':String,
                    'question':String,
                    'corans':String,
                    'ans1':String,
                    'ans2':String,
                    'ans3':String,
                    'hint':String                   
});