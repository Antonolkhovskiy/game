var express = require('express');
var router = express.Router();
var lastID = null;
var game = require('../game.js');
var Type = require('type-of-is');
var inc_game_id = game.inc_game_id;
var get_game_id = game.get_game_id;



var mongoose = require('mongoose');
var mongoosePromise = global.Promise;
var question = require('../models/quest');











var isAuthenticated = function (req, res, next) {
    console.log('index.js is authenticated');
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/');
}

module.exports = function (passport) {

    /* GET login page. */
    router.get('/', function (req, res) {
        // Display the Login page with any flash message, if any
       // console.log('index get /');
       res.render('index', {message: req.flash('message')});


    });

    /* Handle Login POST */
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/home',
        failureRedirect: '/',
        failureFlash: true
    }));

    /* GET Registration Page */
    router.get('/signup', function (req, res) {
        res.render('register', {message: req.flash('message')});

    });

    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/home',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    /* GET Home Page */
    router.get('/home', isAuthenticated, function (req, res) {
        res.render('home', {username: req.user.username});
     
    });

    /* Handle Logout */
    router.get('/signout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

   router.get('/creategame', isAuthenticated, function(req, res){
        inc_game_id();
        var game_id = get_game_id();
      //  console.log(req.user.username + "    usernameradfadsfasdfadsfs")
       // console.log(game_id + "  asdfasdfasfaseffsaefas");

        res.render('questgame');
    });

   router.get('/join_game', isAuthenticated, function(req, res){
        res.render('gamepage');
   })


    router.post('/subquest', isAuthenticated, function(req, res){
        if(req.body.data){
           // console.log("question is submited by " + req.user.username);
            var id = req.user.username;
            id.toString();
          //  console.log(id + "asdasfadsfadsfadsfadsfaewfasfaewfaefadsfadsf");
            var data = req.body.data;
           // console.log(data);
            data.game_id = id;

            var quest = new question(data);
           // console.log(data);
            quest.save(function(err){
            if(err) return console.log(err);
            console.log("saved--->>>>" + quest);
        });
        }else{
            console.log('Did not worked');
        
        }
            
    });

    router.get('/start_game', isAuthenticated, function(req, res){
        var game_id_got;

        if(req.user.username){

            game_id_got = req.user.username;
            game_id_got.toString();

            module.exports.id = game_id_got;
            console.log(game_id_got + '   game_id_got')
            res.render('start_game_page', {username: game_id_got});
        }else{
            console.log("didnt work");
        }
    });

    router.get('/leave', isAuthenticated, function(req, res){
        res.render('home');
    });
 /*  
    router.get('/start_game', isAuthenticated, function(req, res){
        
       
        var game_id_got;
        var size;

        if(req.user.username){

            game_id_got = req.user.username;
            game_id_got.toString();


            question.find({})
            .where('game_id', game_id_got)
            .sort({'_id':-1})
            .limit(1)
            .exec()
            .then((data_get) =>{
               
                console.log("--------------------------worked---------------------");
                console.log(data_get);
            res.render('gamepage', {
            question: '1: ' + data_get[0].question,
            corans: data_get[0].corans,
            ans1: data_get[0].ans1,
            ans2: data_get[0].ans2,
            ans3: data_get[0].ans3,
          hint: data_get[0].hint
            });  

            })
            .catch((err) => {
                console.log("adsfadsfasdfadsfdsfadsfasdfasfhklbasdjkvasdkfjvaskfvaskjfvaskdjf");
                console.log(err);
            });


            
        }else{
            console.log('start game error');
        }

   });


   router.post('/next_quest', function(req, res){

        if(req.body.data){
            var data = (req.body.data);
            console.log("data " + data);
            var game_id = data.game_id;
            var quest_num = data.quest_num;
            console.log("quest_num---->>> " + quest_num + " game_id---->>>> " + game_id);

            question.find({})
            .where('game_id', game_id)
            .sort({'_id':-1})
            .skip(quest_num)
            .limit(1)
            .exec()
            .then((data_get) =>{
               
                console.log("--------------------------asdfasdfasdf---------------------");
                console.log(data_get);
                quest_num++;
            res.render('gamepage', {
            question: quest_num + ': ' + data_get[0].question,
            corans: data_get[0].corans,
            ans1: data_get[0].ans1,
            ans2: data_get[0].ans2,
            ans3: data_get[0].ans3,
            hint: data_get[0].hint
            });  

            })
            .catch((err) => {
                console.log("adsfadsfasdfadsfdsfadsfasdfasfhklbasdjkvasdkfjvaskfvaskjfvaskdjf");
                console.log(err);
            });
 

        }else{
            console.log("did not worked");
        }







    });
*/

    return router;
}
