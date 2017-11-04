var express = require('express');
var path = require('path');
var morgan = require('morgan');
var config = require('./config')
var bodyParser = require('body-Parser');
var cookieParser = require('cookie-Parser');
var expressSession = require('express-Session');
var passport = require('passport');
var routes = require('./routes/index')(passport);
var flash = require('connect-flash');
var session = require('express-session');
var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.db_url);

var app = express();



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


/*app.get("/", function(req, res){
	res.render("index");
})
app.get("/register", function(req, res){
	res.render("register");
})
*/
app.listen(config.port, function(){
	console.log("listening on port --->" + config.port);
})