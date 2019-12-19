// *******************************************
// Users Model
// *******************************************

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var OrdersSchema = new mongoose.Schema({

	user: 
	{
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	cart:
	{
		type: Object,
		required: true
	},
	name: 
	{
		type: String,
		required: true
	},
	address: 
	{
		type: String,
		required: true
	},
	city: 
	{
		type: String,
		required: true
	},
	phone: 
	{
		type: String,
		required: true
	},
	paymentId: 
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

var Order = mongoose.model("Order",OrdersSchema);
module.exports = Order;