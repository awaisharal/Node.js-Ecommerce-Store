// ---- Routes -----
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
var paypal = require("paypal-rest-sdk");
const { ensureAuthenticated } = require('../config/auth');

	// Models
var Users = require("../models/users.js");
var Products = require("../models/products.js");
var Category = require("../models/Category.js");
var Cart = require("../models/Cart.js");
var Order = require("../models/Order.js");
var Hire = require("../models/Hire.js");


// Paypal Configuration
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AU46g3pgvq6d0vpWhwIo6e7qjYDGbBRKUIYaVnE9WuupXIolpGLUFyTvl5Np2UVMcDmZ1P6o6y1w4460',
  'client_secret': 'EPjn2yPItrCEW0a_sUGdvWDr8qiyU_vGUrffAMtoxfvvap3y59MYzz9x4pofTqUvxZanM8kBQaF6cCNH'
});

// Set Storage Engine for Products
var storage = multer.diskStorage({
	destination: './public/uploadedFiles',
	filename: function(req, file, cb){
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});
var upload = multer({
	storage: storage,
	limits: {fileSize: 15000000},
	fileFilter: function(req, file, cb){
		checkFileType(file, cb);
	} 
}).single('image');

// Set Storage Engine for Users
var storage2 = multer.diskStorage({
	destination: './public/images/users/',
	filename: function(req, file, cb){
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});
var uploadUser = multer({
	storage: storage2,
	limits: {fileSize: 15000000},
	fileFilter: function(req, file, cb){
		checkFileType(file, cb);
	} 
}).single('image');


function checkFileType(file, cb)
{
	var filetypes = /jpeg|jpg|png|gif/;
	var extName = filetypes.test(path.extname(file.originalname).toLowerCase());
	var mimetype = filetypes.test(file.mimetype);
	if(mimetype && extName)
	{
		return cb(null, true);
	}else{
		cb("Error: Images only!");
	}

}


	// Home Page 
	router.get("/",function(req, res){
		var UserCheck = req.user;
		session = req.session;
		var categories;
		Category.find({}, function(err, cats){
			categories = cats;
		});
		Products.find({}, function(err, products){
			res.render("index",{active: "Home", session, products, UserCheck, categories});	
		});
	});
	// Register Routes
	router.get("/register",function(req, res){
		// var session = [];
		var UserCheck = req.user;
		session = req.session;
		// session.push(sess._id,sess.name,sess.role);
		res.render("register",{active: "Register", errors: '',session, UserCheck});
	});
	router.post("/register", function(req, res){

		var session = [];
		sess=req.session;
		session.push(sess._id,sess.name,sess.role);


		var {name, email, role, pass1, pass2} = req.body;
		let errors = [];

		// Check required fields
		if(!name || !email || !pass1 || !pass2 || !role)
		{
			errors.push({msg : "Please fill in all fields."});
		}

		// Check password Match
		if(pass1 != pass2)
		{
			errors.push({msg : "Passwords do not match."});
		}
		// Check Password Length
		if(pass1.length < 6)
		{
			errors.push({msg : "Password is too short."})
		}
		if(errors.length > 0)
		{
			res.render("register",{active:"Register", errors, name, email, pass1, pass2, role, session});
		}else{
			// Validation Passed
			Users.findOne({email: email}, function(err, user){
				if(user){
					errors.push({msg: "Email is already registered"});
					res.render("register",{active:"Register", errors, name, email, pass1, pass2, role,session});
				}else{
					var newUser = new Users({
						name: name,
						email: email,
						password: pass1,
						role: role
					});
					// Encrypting Password
					bcrypt.genSalt(10, function(err, salt){
						bcrypt.hash(newUsers.password, salt, function(err, hash){
							 if(err) throw err;
							 // New Hashed Password
							 newUser.password = hash;
							newUser.save(function(err, user){
								if(err){
									console.log(err);
								}else{
									req.flash('success_msg','You are now registered!');
									res.redirect("/login");
								}
							});
						});
					});
				}
			});
		}

	});
	// Login
	router.get("/login",function(req, res){
		// var session = [];
		var UserCheck = req.user;
		var session = req.session;
		var categories;
		Category.find({}, function(err, cats){
			 categories = cats;
			res.render("login",{active: "Login",session, UserCheck,categories});
		});
	});
	// Login Handler
	router.post('/login', function(req, res, next){
		passport.authenticate('local', {
			successRedirect: '/session-checker',
			failureRedirect: '/login',
			failureFlash: true
		})(req, res, next);
	});
	// Session Checker
	router.get('/session-checker', function(req, res){
		var role = req.user.role;
		if(role == 0)
		{
			res.redirect("/user/profile");
		}else if(role == 1)
		{
			res.redirect("/employee/profile");
		}else if(role == 2)
		{
			res.redirect("/admin/dashboard");
		}
	});

	// Dashboard
	router.get("/user/profile", ensureAuthenticated, function(req, res){
		var UserCheck = req.user;
		var session = req.user;
		Category.find({}, function(err, categories){
			res.render("user-profile",{UserCheck,session,active: "Profile", categories});
		});
	});
	router.get("/user/profile/edit", ensureAuthenticated, function(req, res){
		var UserCheck = req.user;
		var session = req.user;
		Category.find({}, function(err, categories){
			res.render("edit-user-profile",{UserCheck,session,active: "Profile", categories});
		});
	});
	router.post("/user/profile/edit", function(req, res){
		var UserCheck = req.user;
		var session = req.user;
		var userID = req.user._id;
		uploadUser(req, res, (err) => {
			if(err)
			{
				res.redirect('/user/profile/edit');
			}else{
				var {name, phone} = req.body;
				var image = req.file.filename;
				
				let errors = [];

				// Check required fields
				if(!name || !phone)
				{
					errors.push({msg : "Please fill in all fields."});
				}

				if(errors.length > 0)
				{
					res.render("/user/profile/edit",{active:"Edit you profile", errors, session, UserCheck});
				}else{
					
					Users.update({_id: userID},{name:name,phone:phone,role:req.user.role, password:req.user.password,image: image, tagline: "", description: ""}, function(err, user){
						if(err)
						{
							console.log(err);
						}else{
							console.log(user);
							res.redirect('/user/profile');
						}
					});
				}
			}
		}); //closing uploader function
	});
	router.post('/user/profile/edit-password', function(req, res){
		var pass1 = req.body.pass1;
		var pass2 = req.body.pass2;
		var old = req.body.old;

		var session = req.user;
		var UserCheck = req.user;
		var id = req.user._id;
		var oldPassHash = req.user.password;

		
		
		if(pass1 != pass2)
		{
			res.render("edit-user-profile",{active: "Edit your profile",errors:"Passwords does not match", UserCheck,session});
		}else{

			bcrypt.compare(old, oldPassHash, function(err, isMatch){
				if(err)
				{
					console.log(err);
				}
				if(isMatch){
					
					bcrypt.genSalt(10, function(err, salt){
					bcrypt.hash(pass1, salt, function(err, hash){
						 if(err) throw err;
						 // New Hashed Password
						 	var password = hash;
							Users.update({_id:id},{ $set: {password: password}}, function(err, chnage){
								res.render("edit-user-profile",{active: "Edit your profile",success:"Password Changed", UserCheck,session});
							});
						});
					});

				}else{
					res.render("edit-user-profile",{active: "Edit your profile",errors:"Incorrect Old Password", UserCheck,session});
				}
			});
		}
	});
	router.get("/employee/profile", ensureAuthenticated, function(req, res){
		var UserCheck = req.user;
		var session = req.user;
		var categories;
		Hire.find({employeeEmail: session.email}, function(err, hires){
			if(err)
			{
				console.log(err);
			}else{
				Category.find({}, function(err, categories){
					res.render("employee-profile",{UserCheck,session,active: "Profile", categories, hires});
				});		
			}
		});
		
	});
	router.get("/employee/profile/edit", ensureAuthenticated, function(req, res){
		var UserCheck = req.user;
		var session = req.user;
		Category.find({}, function(err, categories){
			res.render("edit-employee-profile",{UserCheck,session,active: "Profile", categories});
		});
	});
	router.post("/employee/profile/edit", function(req, res){
		var UserCheck = req.user;
		var session = req.user;
		var userID = req.user._id;
		uploadUser(req, res, (err) => {
			if(err)
			{
				res.redirect('/employee/profile/edit');
			}else{
				var {name, phone, tagline, description} = req.body;
				var image = req.file.filename;
				
				let errors = [];

				// Check required fields
				if(!name || !phone || !tagline || !description)
				{
					res.render("/employee/profile/edit",{active:"Edit you profile", errors, session, UserCheck});
				}else{
					
					Users.update({_id: userID},{name:name,phone:phone,role:req.user.role, password:req.user.password,image: image, tagline: tagline, description:description}, function(err, user){
						if(err)
						{

							console.log(err);
						}else{
							console.log(user);
							res.redirect('/employee/profile');
						}
					});
				}
			}
		}); //closing uploader function
	});
	router.post('/employee/profile/edit-password', function(req, res){
		var pass1 = req.body.pass1;
		var pass2 = req.body.pass2;
		var old = req.body.old;

		var session = req.user;
		var UserCheck = req.user;
		var id = req.user._id;
		var oldPassHash = req.user.password;

		
		
		if(pass1 != pass2)
		{
			res.render("edit-user-profile",{active: "Edit your profile",errors:"Passwords does not match", UserCheck,session});
		}else{

			bcrypt.compare(old, oldPassHash, function(err, isMatch){
				if(err)
				{
					console.log(err);
				}
				if(isMatch){
					
					bcrypt.genSalt(10, function(err, salt){
					bcrypt.hash(pass1, salt, function(err, hash){
						 if(err) throw err;
						 // New Hashed Password
						 	var password = hash;
							Users.update({_id:id},{ $set: {password: password}}, function(err, chnage){
								res.render("edit-user-profile",{active: "Edit your profile",success:"Password Changed", UserCheck,session});
							});
						});
					});

				}else{
					res.render("edit-user-profile",{active: "Edit your profile",errors:"Incorrect Old Password", UserCheck,session});
				}
			});
		}
	});


	router.get("/admin/dashboard", function(req, res){
		var session = req.user;
		Users.count({}, function(err, userCount){
			Products.count({}, function(err, productCount){
				res.render("dashboard/index",{session,active: "Dashboard", userCount, productCount});
			});
		});
	});
	// Logout
	router.get("/logout", function(req, res){
		req.logout();
		req.flash('success_msg','You are logged out!');
		res.redirect('/login');
	});

	// Admin Area
	// ++++++++++++++++++++++++++++++

	// Manage all users
	router.get('/admin/dashboard/users', function(req, res){
		var session = req.user;
		Users.find({}, function(err, users){
			if(err)
			{
				console.log(err);
			}else{
				res.render("dashboard/user/user-manager",{session, active: "Users Manager",users});
			}
		});
	});

	// Delete Users
	router.post('/admin/dashboard/delete-user', function(req, res){
		var userID = req.body.del_id;
		Users.remove({_id:userID}, function(err, del){
			if(err)
			{
				console.log(err);
			}else{
				res.redirect('/admin/dashboard/users')
			}
		});
	});
	// Create New User
	router.get('/admin/dashboard/user/create', function(req, res){
		var session = req.user;
		res.render("dashboard/user/create",{session, active:"Create New User"});
	});
	router.post('/admin/dashboard/user/create',function(req, res){

		session = req.user;

		var {name, email, role, pass1, pass2} = req.body;
		let errors = [];

		// Check required fields
		if(!name || !email || !pass1 || !pass2 || !role)
		{
			errors.push({msg : "Please fill in all fields."});
		}

		// Check password Match
		if(pass1 != pass2)
		{
			errors.push({msg : "Passwords do not match."});
		}
		// Check Password Length
		if(pass1.length < 6)
		{
			errors.push({msg : "Password is too short."})
		}
		if(errors.length > 0)
		{
			res.render("dashboard/user/create",{active:"Create New User", errors, name, email, pass1, pass2, role, session});
		}else{
			// Validation Passed
			Users.findOne({email: email}, function(err, user){
				if(user){
					errors.push({msg: "Email is already registered"});
					res.render("dashboard/user/create",{active:"Create New User", errors, name, email, pass1, pass2, role,session});
				}else{
					var newUser = new Users({
						name: name,
						email: email,
						password: pass1,
						role: role
					});
					// Encrypting Password
					bcrypt.genSalt(10, function(err, salt){
						bcrypt.hash(newUser.password, salt, function(err, hash){
							 if(err) throw err;
							 // New Hashed Password
							 newUser.password = hash;
							newUser.save(function(err, user){
								if(err){
									console.log(err);
								}else{
									req.flash('success_msg','You are now registered!');
									res.redirect("/admin/dashboard/users");
								}
							});
						});
					});
				}
			});
		}
	});

	// Display all Products
	router.get('/admin/dashboard/product-manager', function(req, res){
		var session = req.user;
		Products.find({}, function(err, products){
			if(err)
			{
				console.log(err);
			}else{
				res.render("dashboard/product/product-manager",{session, active: "Product Manager",products});
			}
		});
	});
	// Add new Products

	router.get('/admin/dashboard/product/create', function(req, res){
		var session = req.user;
		Category.find({},function(err, categories){
			if(err)
			{
				console.log(err);
			}else{
				res.render("dashboard/product/create",{categories, session, active: "Create New Product"});
			}
		});
	});
	router.post('/admin/dashboard/product/create', function(req, res){

		var session = req.user;

		upload(req, res, (err) => {
			if(err)
			{
				res.render("dashboard/product/create",{active:"Create New Product", msg: err, name, price, size, category_id, stock, description, session});
			}else{
				var {name, price, size, category_id, stock, description} = req.body;
				var image = req.file.filename;
				
				let errors = [];

				// Check required fields
				if(!name || !price || !size || !category_id || !stock || !image || !description)
				{
					errors.push({msg : "Please fill in all fields."});
				}

				if(errors.length > 0)
				{
					Category.find({},function(err, categories){
						if(err)
						{
							console.log(err);
						}else{
							res.render("dashboard/product/create",{active:"Create New Product", errors, name, price, size, categories, stock, image, description, session});
						}
					});
				}else{
					
					var newProduct = new Products({
						name: name,
						price: price,
						size: size,
						category_id: category_id,
						stock: stock,
						image_name: image,
						description: description
					});
				
					newProduct.save(function(err, data){
						if(err)
						{
							console.log(err);
						}else{
							console.log(data);
							Category.find({}, function(err, categories){
								if(err){
									console.log(err);
								}else{
									res.render("dashboard/product/create",{active:"Create New Product", success_msg: "Product Added Successfully!",session, categories});
								}
							});
						}
					});
				}
			}
		}); //closing uploader function
		
	});
	// Delete Product
	router.post('/admin/dashboard/product/delete', function(req, res){
		var id = req.body.id;
		Products.remove({_id:id}, function(err, del){
			if(err){
				console.log(err);
			}else{
				res.redirect("/admin/dashboard/product-manager");
			}
		});
	});


	// Categories Routes
	// =======================================

	// Display all categories
	router.get('/admin/dashboard/category-manager',function(req, res){
		var session = req.user;
		Category.find({}, function(err, categories){
			if(err)
			{
				console.log(err);
			}else{
				res.render('dashboard/category/manager',{active: "Category Manager", session, categories});
			}
		});
	});

	// Add new category
	router.get('/admin/dashboard/category/create', function(req, res){
		var session = req.user;
		res.render("dashboard/category/create",{session, active: "Add New Category"});
	});

	router.get('/user/login', function(req, res){
		var session = [];
		sess=req.body;
		session.push(sess._id,sess.name,sess.role);
		res.render("dashboard/login",{active: "Login",session});
	});

	router.post('/admin/dashboard/category/create', function(req, res){
		var session = req.user;
		var name = req.body.name;
		var newCategory = new Category({
			name: name
		});
	
		newCategory.save(function(err, data){
			if(err)
			{
				console.log(err);
			}else{
				console.log(data);
				res.render("dashboard/category/create",{active:"Add New Category", success_msg: "Category Added Successfully!",session});
			}
		});		
	});
	router.post('/admin/dashboard/category/delete', function(req, res){
		var id = req.body.id;
		Category.remove({_id:id}, function(err, del){
			if(err)
			{
				console.log(err);
			}else{
				res.redirect("/admin/dashboard/category-manager");
			}
		});
	});

	router.get("/admin/dashboard/orders", function(req, res){
		var session = req.session;
		var cartItemsArray;
		Order.find({}, function(err, orders){
			orders.forEach(function(order){
				cart = new Cart(order.cart);
				cartItemsArray = cart.generateArray();
				
					cartItemsArray.forEach(function(c){
						console.log(c.item._id);
					});

			});

			// cartItemsObj.forEach(function(carts){
				res.render("dashboard/orders/order-manager",{active: "Manage All Orders", session, orders, cartItemsArray});			
			// });
		});
	});


	// View Single Product Page
	// ********************************

	router.get('/product/:id', function(req, res){
		var id = req.params.id;
		var UserCheck = req.user;
		var session = req.session;
		var categories;
		Category.find({}, function(err, cats){
			categories = cats
		});
		Products.findById(id, function(err, product){
			if(err)
			{
				console.log(err);
			}else{
				res.render("product", {active: product.title,product,session, UserCheck, categories})
			}
		});
	});

	// CART ROTES
	// ********************************
	//  Add to cart
	router.get('/add-to-cart/:id', function(req, res, next){
		var productID = req.params.id;
		var cart = new Cart(req.session.cart ? req.session.cart: {});
		Products.findById(productID, function(err, product){
			if(err)
			{
				console.log(err);
			}else{
				cart.cartAdd(product, Products._id);
				req.session.cart = cart;
				console.log(req.session.cart);
				res.redirect("/");
			}
		});
	});

	// View cart
	router.get('/cart', function(req, res){
		var UserCheck = req.user;
		var session = req.session;
		// var categories;
		Category.find({}, function(err, categories){
			if(!req.session.cart){
				res.render('cart',{active: "Cart", session, UserCheck, products: null, categories});
			}

			var cart = new Cart(req.session.cart);
				res.render('cart',{active: "Cart", UserCheck,categories, session, products: cart.generateArray(), totalPrice: cart.totalPrice });
			});
		
	});
	// clear cart
	router.get("/cart/clear", function(req, res){
		delete req.session.cart;
		res.redirect("/");
	});
	// Checkout
	router.get("/checkout", function(req, res){
		if(!req.user){
			res.redirect('/login');
		}
		if(!req.session.cart){
			res.redirect('/');
		}
		var UserCheck = req.user;
		var session = req.session;
		cart = new Cart(req.session.cart);
		Category.find({}, function(err, categories){
			res.render("checkout",{active:"Checkout Page", categories, UserCheck, session, total: cart.totalPrice});
		});
	});
	router.post('/checkout', function(req, res){

		var name = req.body.name;
		var email = req.body.email;
		var address = req.body.address;
		var city = req.body.city;
		var phone = req.body.phone;
		var checkoutDetails = [name, email, address, city, phone];
		req.session.checkout = checkoutDetails;
		var cart = req.session.cart;

		var create_payment_json = {
		    "intent": "sale",
		    "payer": {
		        "payment_method": "paypal"
		    },
		    "redirect_urls": {
		        "return_url": "http://localhost:3000/success",
		        "cancel_url": "http://localhost:3000/checkout"
		    },
		    "transactions": [{
		        "item_list": {
		            "items": [{
		                "name": "Iphone",
		                "sku": "0001",
		                "price": "300",
		                "currency": "USD",
		                "quantity": 1
		            }]
		        },
		        "amount": {
		            "currency": "USD",
		            "total": "300"
		        },
		        "description": "This is the payment description."
		    }]
		};

		       
       paypal.payment.create(create_payment_json, function (error, payment) {
		    if (error) {
		        console.log(error); 
		    } else {
		       for(let i = 0; i < payment.links.length; i++)
		       {
		       	if(payment.links[i].rel === "approval_url")
		       	{
		       		res.redirect(payment.links[i].href);
		       	}
		       }

		    }
		});

	});


	router.get("/success", function(req, res){
		
		var payerID = req.query.PayerID;
		var paymentID = req.query.paymentId;

		var execute_payment_json = {
			"payer_id": payerID,
			"transactions": [{
				"amount": {
					"currency": "USD",
					"total": "25.00"
				},
			}]
		};

		paypal.payment.execute(paymentID, execute_payment_json, function(error, payment){
			if(error){
				console.log(error.response);
			}else{
				var name = req.session.checkout[0];
				var email = req.session.checkout[1];
				var address = req.session.checkout[2];
				var city = req.session.checkout[3];
				var phone = req.session.checkout[4];
				
				var cart = new Cart(req.session.cart);

				newOrder = new Order({
					user: req.user,
					cart: cart,
					name: name,
					address: address,
					city: city,
					phone: phone,
					paymentId: paymentID
				});

				newOrder.save(function(err, order){
					if(err){
						console.log(err);
						res.redirect("/checkout");
					}else{

						cart = cart.generateArray();
						cart.forEach(function(c){
							var newStock = parseInt(c.stock, 10) - parseInt(c.qty, 10);
							var id = c.item._id;
							console.log(id);
							// Products.update({_id: id}, {title:c.item.title,price:c.item.price,size:c.item.size,category_id: c.item.category_id, stock: newStock, image: c.item.image, description: c.item.description, data: c.item.date}, function(err, p){
							Products.update({_id: id}, {$inc: {stock: c.stock}, $push: {stock: newStock}}, function(err, p){
								if(err)
								{
									console.log(err);
								}else{
									console.log(p);
								}
							});
						});
						// Delete Cart Session | Empty Cart
						delete req.session.cart;

						res.redirect("/thank-you");
					}
				});
			}
		});


	});

	router.get("/cancel", (req, res) => {
		res.redirect("/checkout");
	});


	router.get("/product/category/:id", function(req, res){
		var id = req.params.id;
		var session = req.session;
		var UserCheck = req.user;
		var categories, categoryName;
		Category.find({}, function(err, cat){
			categories = cat;
		});
		Category.find({_id:id}, function(err, cats){
			categoryName = cats;
			;
		});
		Products.find({category_id:id}, function(err, products){
			if(err)
			{
				console.log(err);
			}else{
				res.render("category",{active: "Category Page", session, UserCheck,products, categories, categoryName})
			}
		});
	});

	// search
	router.post("/search", function(req, res){
		var key = req.body.search;
		var categories;
		var session = req.session;
		var UserCheck = req.user;
		Category.find({}, function(err, cat){
			categories = cat;
		});
		Products.find({name: {'$regex': key, '$options': 'i'}}, function(err, results){
			if(err)
			{
				console.log(err);
			}else{
				res.render("search-result",{active:"Search", session, UserCheck, categories, results})
			}
		});
	});

	// Shop Page
	router.get("/shop", function(req, res){
		var key = req.body.search;
		var categories;
		var session = req.session;
		var UserCheck = req.user;
		Category.find({}, function(err, cat){
			categories = cat;
		});
		Products.find({}, function(err, results){
			if(err)
			{
				console.log(err);
			}else{
				res.render("shop",{active:"Shop", session, UserCheck, categories, results})
			}
		});
	});

	// Contact Us Page
	router.get("/contact", function(req, res){
		var key = req.body.search;
		var categories;
		var session = req.session;
		var UserCheck = req.user;
		Category.find({}, function(err, cat){
			categories = cat;
			if(err)
			{
				console.log(err);
			}else{
				res.render("contact",{active:"Contact Us", session, UserCheck, categories})
			}
		});
	});


	// Search Employees
	router.get("/employees", function(req, res){
		var categories;
		var session = req.session;
		var UserCheck = req.user;
		Category.find({}, function(err, cat){
			categories = cat;
			if(err)
			{
				console.log(err);
			}else{
				Users.find({role: "1"}, function(err, employees){
					res.render("employees-search",{active:"Search Employees",employees, session, UserCheck, categories})
				});
			}
		});
	});

	// search
	router.post("/search/employee", function(req, res){
		var key = req.body.search;
		var categories;
		var session = req.session;
		var UserCheck = req.user;
		Category.find({}, function(err, cat){
			categories = cat;
		});
		Users.find({tagline: {'$regex': key, '$options': 'i'}}, function(err, results){
			if(err)
			{
				console.log(err);
			}else{
				res.render("employees-search",{active:"Search", session, UserCheck, categories, results})
			}
		});
	});

	// Employee Data
	router.get("/employee/:id", function(req, res){
		var id = req.params.id;
		var categories;
		var session = req.session;
		var UserCheck = req.user;

		Category.find({}, function(err, categories){
			Users.find({_id: id}, function(err, user){
				if(err)
				{
					console.log(err);
				}else{
					res.render("employeeProfile",{active:"Search", session, UserCheck, categories, user})
				}
			});
		});
		
	});


	// Hire Employee
	router.post("/employee/hire/:id", function(req, res){
		var employeeID = req.params.id;
		var userID = req.body.userID;
		var categories, userEmail, employeeEmail;
		var session = req.session;
		var UserCheck = req.user;
		Category.find({}, function(err, cat){
			categories = cat;
		});
		
		Users.find({_id: userID}, function(err, user){
			userEmail = user[0].email;
			userName = user[0].name;
			Users.find({_id: employeeID}, function(err, use){
				employeeEmail = use[0].email;

				var newHire = new Hire({
					userName: userName,
					userEmail: userEmail,
					employeeEmail: employeeEmail
				});

				newHire.save(function(err, data){
					if(err)
					{
						console.log(err);
					}else{
						res.render("employeeProfile",{active:"Employee Profile", session, UserCheck, categories,user, success:1})
					}
				});

			});
		});
		

	});

	router.post("/user/:email", function(req, res){
		var UserCheck = req.user;
		var session = req.user;
		var userEmail = req.params.email;
		var categories;
		Users.find({email: userEmail}, function(err, user){
			if(err)
			{
				console.log(err);
			}else{
				console.log(user);
				Category.find({}, function(err, categories){
					res.render("userProfile",{UserCheck,session,active: "Profile", categories, user});
				});		
			}
		});

	});

	router.get("/thank-you", (req, res) => {
		var UserCheck = req.user;
		session = req.session;
		Category.find({}, function(err, categories){
			res.render("thank-you",{active: "Thank You", session, UserCheck, categories});	
		});
	});


module.exports = router;