var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var session = require("express-session");
var mongoStore = require("connect-mongo")(session);
var passport = require("passport");
var expressValidator = require("express-validator");
// var paypal = require("paypal-rest-sdk");
var passportFile = require("./config/passport")(app);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(express.static("public"));
app.set('view engine', 'ejs');

// Establishing Database Connection
try{
	var db = mongoose.connect("mongodb://localhost/fyp", {useNewUrlParser: true}).then(() => console.log("DB connected!"));
}catch(error){
	handleError(error);
}

// Express Session
app.use(session({
  secret: 'Secret',
  resave: false,
  saveUninitialized: false,
  store: new mongoStore({
  	 mongooseConnection: mongoose.connection,
     collection: 'session'
  }),
  cookie: {maxAge: 180 * 60 * 1000}
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global Variable
app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

// Requiring Roter
require('./routes/index.js');

// Routes
app.use('/', require('./routes/index'));






app.listen(3000, function(){
	console.log("Server Activated");
});