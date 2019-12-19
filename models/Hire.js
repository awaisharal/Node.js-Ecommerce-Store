// *******************************************
// Users Model
// *******************************************

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var HireSchema = new mongoose.Schema({
	userName: 
	{
		type: String,
		required: true
	},
	userEmail: 
	{
		type: String,
		required: true
	},
	employeeEmail: 
	{
		type: String,
		required: true
	},
	date: 
	{
		type: Date,
		default: Date.now
	}

});

var Hire = mongoose.model("Hire",HireSchema);
module.exports = Hire;