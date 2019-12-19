// *******************************************
// Users Model
// *******************************************

var mongoose = require("mongoose");

var CategorySchema = new mongoose.Schema({
	name: 
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

var Category = mongoose.model("Category",CategorySchema);
module.exports = Category;