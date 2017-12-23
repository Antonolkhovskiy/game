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



mongoose.connect(config.MONGODB_URI);


var question = require('./models/quest');
var game = require('./models/game');
var team = require('./models/team');

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


io.on('connection', function(socket){

	socket.on('start_game', function(data){
        var komnaty = Object.keys(socket.rooms);
        console.log(komnaty + "komnaty huli");

		var game = require('./routes/index');
		var data_to;


		var game_id = game.id;
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
            var team = data.team;
                team.toString;
                team = team.substring(team.length - 5);


			var quest_num = parseInt(data.quest_num);


			question.find({})
            .where('game_id', room)
            .sort({'_id':-1})
            .limit(quest_num + 1)
            .skip(quest_num)
            .exec()
            .then((data_get) =>{    
                console.log("--------------------------------" + data_get + "---------------data_get----------------");
                data_to = JSON.stringify(data_get[0]);
                JSON.parse(data_to);
                data_to.quest_num = quest_num;

                quest_num++;
                socket.join(room);
                socket.join(team);
                io.to(team).emit('quest', data_to, quest_num);  
                io.to(room).emit('team_status', {'team': team});              
                socket.emit('leave_miv', {'data':data});
                console.log(JSON.stringify(socket.rooms));
                
            })
            .catch((err) => {
                console.log(err);
            });


            
        

		

	});
});
    
    io.on('connection', function(socket){
        socket.on('quest_count', function(data){
            game_id = data.game;
            game_id.toString;
            console.log('_________________quest count   -'+ game_id + '-   _____________');

            question.find({'game_id': game_id}).count().then(function(res){
                socket.join(game_id);
                io.to(game_id).emit('quest_comlete', {'quest_count': res});
                console.log('____________quest comlete ' + res + '  _________________');
            });

        });
    });
    

    io.on('connection', function(socket){
        socket.on('starting_game', function(data){
            var room = data.room;
            socket.join(room);
            io.to(room).emit('game_started', {});
        })
    })


    io.on('connection', function(socket){
        socket.on('end_game', function(data){
            var winner_team = data.winner_team;
            var game_id = data.game_id;
            winner_team.toString;
            game_id.toString;

            switch(winner_team){
                case'team1':{
                    var room_team1 = game_id + 'team3';
                    var room_team2 = game_id + 'team2';
                    var room_won_game = game_id + 'team1';

                    socket.join(room_won_game);
                    socket.join(room_team1);
                    socket.join(room_team2);
                    io.to(room_team1).emit('game_over', {'winner_team': 'team1'});
                    io.to(room_team2).emit('game_over', {'winner_team': 'team1'});
                    io.to(room_won_game).emit('game_won', {});
                    break;
                }
                case'team2':{
                    var room_team1 = game_id + 'team1';
                    var room_team2 = game_id + 'team3';
                    var room_won_game = game_id + 'team2';

                    socket.join(room_won_game);
                    socket.join(room_team1);
                    socket.join(room_team2);
                    io.to(room_team1).emit('game_over', {'winner_team': 'team2'});
                    io.to(room_team2).emit('game_over', {'winner_team': 'team2'});
                    io.to(room_won_game).emit('game_won', {});
                    break;
                }
                case'team3':{
                    var room_team1 = game_id + 'team1';
                    var room_team2 = game_id + 'team2';
                    var room_won_game = game_id + 'team3';

                    socket.join(room_won_game);
                    socket.join(room_team1);
                    socket.join(room_team2);
                    io.to(room_team1).emit('game_over', {'winner_team': 'team3'});
                    io.to(room_team2).emit('game_over', {'winner_team': 'team3'});
                    io.to(room_won_game).emit('game_won', {});
                    break;
                }
            }
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
           
        });


    });

    io.on('connection', function(socket){
        socket.on('get_team', function(data){
            console.log("________________joing and getting team " + data +" __________");
            var room = data.room;
            console.log(room);
            var data_to_join_team = {};
            data_to_join_team.player_name = data.player_name;
            socket.join(room);
            io.to(room).emit('get_team_number', data_to_join_team);
            socket.join(data.player_name);
        });
    });

    io.on('connection', function(socket){
        socket.on('join_team', function(data){
            var team = data.team;
            socket.join(team);
            var rooms = Object.keys(socket.rooms);
            console.log(rooms + " player now___________");
        });
    });

    io.on('connection', function(socket){
        socket.on('get_join_team', function(data){
            console.log('________________get_join_team__________________________');
            var team = data.team;
            var player_name = data.player_name;
            var main_room = data.room;
            socket.join(player_name);
            io.to(player_name).emit('go_to_team', {'team': team, 'room': main_room});
            socket.join(main_room);
            io.to(main_room).emit('new_player', {'player_name': player_name, 'team': team});
        });
    });



    io.on('connection', function(socket){
        socket.on('show_players', function(data){
                var game_id = data.game;
                game_id.toString;
                game.find({})
                    .where({'game': game_id})
                    .populate('player')
                    .then((data_get) =>{    
                        console.log(data_get + "'''''''''''''''''''''''''''''''''");
                       

                        var players_data = data_get[0].players;
                        var massive = [];
                        var temp;
                        var players = [];

                        for(var i = 0; i < players_data.length; i++){
                            players.push(players_data[i].player_name);
                        }


                      
                    console.log("----------------" + players + "----------------");
                            //var players = data_get[0].players.player_name;
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