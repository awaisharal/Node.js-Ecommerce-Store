// *******************************************
// Cart Model
// *******************************************

module.exports = function Cart(oldCart){
	this.items = oldCart.items || {};
	this.totalQty = oldCart.totalQty || 0;
	this.totalPrice = oldCart.totalPrice || 0;

	this.cartAdd = function(item, id){
		var storedItem = this.items[id];
		if(!storedItem){
			storedItem = this.items[id] = {item: item, qty:0, price:0};	
		}
		storedItem.qty++;
		storedItem.price = parseInt(storedItem.item.price, 10) * parseInt(storedItem.qty, 10);
		this.totalQty++;
		this.totalPrice += parseInt(storedItem.item.price, 10);
	}

	this.generateArray = function (){
		var arr = [];
		for(var id in this.items){
			arr.push(this.items[id]);
		}
		return arr;
	}
}

