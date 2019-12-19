module.exports = function(app){

	var localStrategy = require("passport-local").Strategy;
	var mongoose = require("mongoose");
	var bcrypt = require("bcryptjs");
	var passport = require("passport");

	// Models
	var Users = require('../models/users.js');

	passport.use(
		new localStrategy({usernameField: 'email'},function(email, password, done){
			// Match User
			Users.findOne({email: email}, function(err, user){
				if(err)
				{
					console.log(err);
				}else{
					if(!user)
					{
						return done(null, false, {message: 'Email Not Registered!'});
					}
					// Decrypting Password
					bcrypt.compare(password,user.password, function(err, isMatch){
						if(err)
						{
							console.log(err);
						}
						if(isMatch){
							return done(null, user);
						}else{
							return done(null, false, {message: 'Incorrect Password!'});
						}
					});
				}
			});
		})
	);

	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  Users.findById(id, function(err, user) {
	    done(err, user);
	  });
	});

}