var express = require('express');
var path = require('path');
var morgan = require('morgan');
var config = require('./config')
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
var routes = require('./routes/index')(passport);
var flash = require('connect-flash');
var session = require('express-session');
var mongoose = require('mongoose');
var config = require('./config');
var mongoosePromise = global.Promise;

var Type = require('type-of-is');


process.env.MONGODB_URI = config.MONGODB_URI;
mongoose.connect(process.env.MONGODB_URI);


var question = require('./models/quest');

var http = require('http');
var app = express();
var server = http.createServer(app);

var io = require('socket.io').listen(server);



app.set("view engine", "ejs");
app.set("views", path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));
app.use(flash());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(expressSession({ secret: 'SECRET' }));

// Passport:
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

var initPassport = require('./passport/init');
initPassport(passport);


/*io.on('connection', function(socket){
	socket.on('start_game', function(data){
		socket.emit('quest', )
		console.log(data);
	});
});
*/
io.on('connection', function(socket){
	socket.on('start_game', function(data){
		console.log(data);
		var game = require('./routes/index');
		var data_to;
		console.log(game.id + "    game_idgame_idgame_idgame_idgame_idgame_idgame_idgame_idgame_id");

		var game_id = game.id;
		game_id.toString();

		var data_str = JSON.stringify(data);
		var quest_num = data.quest_num;
		quest_num.toString();

		console.log("game_id " + game_id + " quest_num " + quest_num);
		console.log("game_id " + game.id + " quest_num " + data.quest_num);



			question.find({})
            .where('game_id', game_id)
            .sort({'_id':-1})
            .limit(10)
            .exec()
            .then((data_get) =>{    
            	console.log('********************************data_get   ' + data_get[0] + '    ***********');

            	
                data_to = JSON.stringify(data_get[0]);
                console.log(data_get[1]);
                JSON.parse(data_to);
                //data_to.quest_num = quest_num;
               // data_to.toJSON;
                //data_to.w = '2';
               // data_to += "'w': 2";

                console.log(Type(data_to));
                console.log('successfully ' + data_to + "  successfully  ");
                
                socket.join(game_id);
                io.to(game_id).emit('quest', data_to, quest_num);
                console.log(Type(data_to));
            })
            .catch((err) => {
                console.log("adsfadsfasdfadsfdsfadsfasdfasfhklbasdjkvasdkfjvaskfvaskjfvaskdjf");
                console.log(err);
            });


            
        

		

	});
});

io.on('connection', function(socket){
	socket.on('next_quest', function(data){
		console.log(data);		

			var room = data.room;
			room.toString;

			var quest_num = parseInt(data.quest_num);
			//quest_num.toInt;

			question.find({})
            .where('game_id', room)
            .sort({'_id':-1})
            .limit(quest_num + 1)
            .skip(quest_num)
            .exec()
            .then((data_get) =>{    
            	console.log('********************************data_get   ' + data_get + '    ***********');
            	console.log('********************************data_get   ' + data_get[0] + '    ***********');

            	
                data_to = JSON.stringify(data_get[0]);
                JSON.parse(data_to);
                data_to.quest_num = quest_num;
               // data_to.toJSON;
                //data_to.w = '2';
               // data_to += "'w': 2";

                console.log(Type(data_to));
                console.log('successfully ' + data_to + "  successfully  ");
                
                quest_num++;
                socket.join(room);
                io.to(room).emit('quest', data_to, quest_num);
                
            })
            .catch((err) => {
                console.log("adsfadsfasdfadsfdsfadsfasdfasfhklbasdjkvasdkfjvaskfvaskjfvaskdjf");
                console.log(err);
            });


            
        

		

	});
});

	io.on('connection', function(socket){
		socket.on('join_room', function(data){
			var room = data.room;
			socket.join(room);
		});
	});

/*var Schema = mongoose.Schema;
var questSchema = new Schema({
					'game_id':String,
					'question':String,
					'corans':String,
					'ans1':String,
					'ans2':String,
					'ans3':String
});

var question = mongoose.model('question', questSchema);


var game = require('./game.js');
var get_game_id = game.get_game_id;
var game_id = get_game_id();

io.on('connection', function (socket) {  
 	socket.on('subquest', function (data) { 
 	console.log(game_id);
 	data.game_id = game_id;
    console.log(data);
    var quest = new question(data);
    quest.save(function(err){
    	if(err) return console.log(err);
    	console.log("saved--->>>>" + quest);
    });
  });
});
*/




server.listen(config.port, function(){
	console.log("listening on port --->" + config.port);
})