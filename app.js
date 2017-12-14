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



mongoose.connect(config.db_url);


var question = require('./models/quest');
var game = require('./models/game');
var team = require('./models/team');

var http = require('http');
var app = express();
var server = http.createServer(app);

var io = require('socket.io').listen(server);



app.set("view engine", "ejs");
app.set("views", path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname, 'static')));

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
        var komnaty = Object.keys(socket.rooms);
        console.log(komnaty + "komnaty huli");

		var game = require('./routes/index');
		var data_to;


		var game_id = game.id;
		//game_id.toString();

		//var data_str = JSON.stringify(data);
		var quest_num = data.quest_num;

        quest_num = parseInt(quest_num);

			question.find({})
            .where('game_id', game_id)
            .sort({'_id':-1})
            .limit(10)
            .exec()
            .then((data_get) =>{    
     	
                data_to = JSON.stringify(data_get[0]);

                JSON.parse(data_to);
 
                socket.join(game_id);
                io.to(game_id).emit('quest', data_to, quest_num);
                console.log(JSON.stringify(socket.rooms));

            })
            .catch((err) => {
                console.log(err);
            });


            
        

		

	});
});

io.on('connection', function(socket){
	socket.on('next_quest', function(data){
		

			var room = data.room;
			//room.toString;

			var quest_num = parseInt(data.quest_num);


			question.find({})
            .where('game_id', room)
            .sort({'_id':-1})
            .limit(quest_num + 1)
            .skip(quest_num)
            .exec()
            .then((data_get) =>{    

                data_to = JSON.stringify(data_get[0]);
                JSON.parse(data_to);
                data_to.quest_num = quest_num;

                quest_num++;
                socket.join(room);
                io.to(room).emit('quest', data_to, quest_num);                
                socket.emit('leave_miv', {'data':data});
                console.log(JSON.stringify(socket.rooms));
                
            })
            .catch((err) => {
                console.log(err);
            });


            
        

		

	});
});

    io.on('connection', function(socket){
        socket.on('start_game', function(data){


        });

    });


	io.on('connection', function(socket){
		socket.on('join_room', function(data){
			var room = data.room;
            var username = data.username;
			socket.join(room);
		});
	});


    io.on('connection', function(socket){
        socket.on('join_user', function(data){          
            var room = data.room;
            var username =data.username;
            var socket_id = socket.id;
            socket.join(room);
            io.to(room).emit('player_conn', {'username': username});

            console.log(socket_id + " socket_id");

            room.toString;
            username.toString;
            socket_id.toString;
            var query = {'game':room};
            var update = {'$addToSet': {'players':{
                'socket_id': socket_id,
                'player_name':username
                }}};

            var query_id = {'players.player_name': username};
            var update_id = {'$set': {'players.$.socket_id': socket_id}};
            var options = {upsert: true};

            var flag = false;

            game.findOneAndUpdate(query_id, update_id, {upsert: false}, function(err, res){
                if(err){
                    console.log(err);
                    return;
                }else{
                   console.log('id was updated ->> '  + res);
                   flag = false;
                }

                if(res == null) flag = true;
                
            });

            if(flag){
                game.findOneAndUpdate(query, update, options, function(err, res){
                    if (err){
                        console.log(err);
                        return;
                    }else{
                        console.log("saved ----->>> "  + res);
                        flag = false;

                    }
                });                    
            }
       
        });
    });

    io.on('connection', function(socket){
        socket.on('show_players', function(data){
                var game_id = data.game;
                game_id.toString;
                game.find({})
                    .where({'game': game_id})
                    .then((data_get) =>{                            
                            var players = data_get.players[0].player_name;
                            console.log(players + '   players');
                            socket.join(game_id);
                            io.to(game_id).emit('get_players', players);
                    })
                    .catch((err) =>{
                        console.log(err);
                    });
        });

    });

    io.on('connection', function(socket){
        socket.on('teams', function(data){
            var game_id = data.game;
            game_id.toString;
             game.find({})
                    .where({'game': game_id})
                    .then((data_get) =>{                            
                            var players = data_get.players[0].player_name;
                            players.length;
                      
                            var team1 = [];
                            var team2 = [];
                            var team3 = [];

                            for(var i = players.length; i > 0; i--){
                                console.log(players[i]);
                                if(players.length > 0){
                                team1.push(players[i - 1]);
                                players.pop();
                                i--;
                                }
                                if(players.length > 0){
                                    team2.push(players[players.length - 1]);
                                    players.pop();
                                    i--;
                                }
                                if(players.length > 0){
                                    team3.push(players[players.length - 1]);
                                    players.pop();
                                    i--;
                                }
                                
                            };

                            var data_to = {'team1':team1,
                                            'team2':team2,
                                            'team3':team3}
                          
                            
                            socket.join(game_id);
                            io.to(game_id).emit('get_teams', data_to);
                    })
                    .catch((err) =>{
                        console.log(err);
                    });
        });
    });





    io.on('connection', function(socket){
        socket.on('leave', function(data){
            var room = data.room;
            console.log('leaving room  ' + room);
            var room = room = JSON.stringify(data.room);
            room.toString;

            socket.leave(room);
             var rooms = Object.keys(socket.rooms);
             console.log(rooms + "   leave");

        });
    });

    io.on('connection', function(socket){

        socket.on('show_room', function(data){
        var komnata = JSON.stringify(socket.rooms);

        console.log(komnata + "    komnata"); 
    });

});



/*    io.on('connection', function(socket){
        socket.on('')

    });*/

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
});