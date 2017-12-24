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
var active_games = require('./models/active_games');

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
           var team_status = team.substring(team.length - 5);


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
                io.to(room).emit('team_status', {'team': team_status});              
                socket.emit('leave_miv', {'data':data});
                console.log(JSON.stringify(socket.rooms));
                
            })
            .catch((err) => {
                console.log(err);
            });


            
        

		

	});
});
    

    io.on('connection', function(socket){
    socket.on('get_quest', function(data){
        

            var room = data.room;
            var team = data.team;
                team.toString;
            var team_status = team.substring(team.length - 5);
            var beacon = data.beacon;

            question.find({'$and':[{'game_id': room}, {'beacon': beacon}]})
            .then((data_get) =>{    
                data_to = JSON.stringify(data_get);
                JSON.parse(data_to);
                console.log("++++++++++++++++++room " + room + "  team  " + team + "  beacon  "  + beacon + "++++++++++++++++++quest_get++++++++++++++++++++++++");
                

             
                socket.join(room);
                socket.join(team);
                io.to(team).emit('quests_get', data_to);  
               //io.to(room).emit('team_status', {'team': team_status});              
                //socket.emit('leave_miv', {'data':data});
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

            question.find({'game_id': game_id}).then(function(res){
                var length1 = res.filter(value => value.beacon === "1").length;
                var length2 = res.filter(value => value.beacon === "2").length;
                var length3 = res.filter(value => value.beacon === "3").length;

                console.log(length1 + "   " +  length2 + "  " + length3)

                var quest_count = length1 + length2 + length3;

                var can_start = false;

                if(length1 >= 1 && length2 >= 1 && length3 >= 1){
                    can_start = true;
                }else{
                    can_start = false;
                }
                socket.join(game_id);
                io.to(game_id).emit('quest_comlete', {'quest_count': quest_count}, {'can_start': can_start});
                //console.log('____________quest comlete ' + res + '  _________________');
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
        socket.on('beacon_check', function(data){
            var team = data.team;
            var game = data.game;
            var beacon = 'beacon' + data.beacon;
            team.toString;
            beacon.toString;

            active_games.findOne({'game_id': game}).then(function(res){
                console.log(res);
                if(res == null){
                    console.log('there is no such game');
                    socket.emit('beacon_status', {'status': 'There is no such game!'});
                }else{


                    var check = res[team][0][beacon];

                    check.toString;



                    if(check == 'true'){
                        console.log("beacon has been already found!\nFind Another Beacon");
                        socket.emit('beacon_status', {'status': 'Beacon has been already found!\nFind Another Beacon!'});
                    }else{

                        var room = game + team;

                        console.log(room + "    room go adfasdfadsfads");

                        

                        res[team][0][beacon] = "true";

                        console.log(res[team][0][beacon]);

                        res.save(function(err){ if(err){ console.log(err);}}).then(function(result, err){
                            if (err){ console.log(err);}
                            console.log("beacon updated  ---------->>>> ");
                            socket.emit('beacon_status', {'status': 'Ok!'});

                            socket.join(room);
                            io.to(room).emit('beacon_found', {'beacon': data.beacon});
                        });




                    }
                }
            } );


        });

    });

    io.on('connection', function(socket){
        socket.on('beacon_ins', function(data){

            active_games.findOneAndRemove({'game_id': data.game}).then(function(result){
                
                        var game = {
                            'game_id': data.game
                        }
                        var active_game = new active_games(game);
                        active_game.save(function(err){
                            if(err){
                                console.log(err);
                                return
                            }else{
                                console.log('active game saved------>>>>' + active_game);
                            }
                        });
                
            });
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