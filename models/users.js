// *******************************************
// Users Model
// *******************************************

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({

	name: 
	{
		type: String,
		required: true
	},
	email: 
	{
		type: String,
		required: true
	},
	password: 
	{
		type: String,
		required: true
	},
	v_code: 
	{
		type: String,
		required: false
	},
	account_status: 
	{
		type: String,
		default: "unverified"
	},
	gender: 
	{
		type: String,
		required: false
	},
	role: 
	{
		type: String,
		required: true
	},
	image:{
		type: String,
		required: false
	},
	phone:{
		type: String,
		required: false
	},
	tagline:{
		type: String,
		required: false
	},
	description:{
		type: String,
		required: false
	},
	account_type: 
	{
		type: String,
		required: false
	},
	deviceToken: 
	{
		type: String,
		default: "none",
		required: false
	},
	date: 
	{
		type: Date,
		default: Date.now
	}

});

var Users = mongoose.model("Users",userSchema);
module.exports = Users;