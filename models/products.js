// *******************************************
// Users Model
// *******************************************

var mongoose = require("mongoose");

var ProductSchema = new mongoose.Schema({
	name: 
	{
		type: String,
		required: true
	},
	price: 
	{
		type: Number,
		required: true
	},
	size: 
	{
		type: String,
		required: false
	},
	category_id: 
	{
		type: String,
		required: false
	},
	stock: 
	{
		type: Number,
		required: false
	},
	image_name: 
	{
		type: String,
		required: true
	},
	description: 
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

var Products = mongoose.model("Products",ProductSchema);
module.exports = Products;