var express = require("express");
var app = express();
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
var Schema = mongoose.Schema;
const expressValidator = require('express-validator');
var bcrypt = require('bcrypt');
const saltRounds = 10;

// Authentication Package
var session = require("express-session");

// Connect to database
mongoose.connect("mongodb://localhost/authentication");
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(session({
  secret: 'i am feeling horny',
  resave: false,
  saveUninitialized: true,
	name: 'hello'
  // cookie: { secure: true }
}))

app.set("view engine", "ejs");

// Define schema of user
var userSchema = new Schema ({
	name: {type:String, required: true},
	email: {type:String, required: true, unique: true},
	password: {type:String, required: true}
});

// Compile model
var User = mongoose.model('User', userSchema);

app.get("/", function (req, res) {
	res.render("home", {title: "Home"});
})
app.get("/register", function(req, res, next) {
	res.render("index", {title: 'Registeration', errors: ""});
});

app.post("/register", function (req, res, next) {

	// Data Validation
		req.checkBody('username', 'Username field cannot be empty.').notEmpty();
		req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
		req.checkBody('useremail', 'The email you entered is invalid, please try again.').isEmail();
		req.checkBody('useremail', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
		req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
		req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
		req.checkBody('userpasswordconfirm', 'Password must be between 8-100 characters long.').len(8, 100);
		req.checkBody('userpasswordconfirm', 'Passwords do not match, please try again.').equals(req.body.password);

		const error = req.validationErrors();

		if(error) {
			console.log(error);
			res.render("index", {title: 'Registeration Error', errors: error});
		} else {
			var name = req.body.username,
					email = req.body.useremail,
					password = req.body.password;


			bcrypt.hash(password, saltRounds, function(err, hash) {
		  // Store hash in your password DB.
			var newUser = {name: name, email: email, password: hash};

				User.create(newUser, function(err, newlyCreated) {
					if(err){
						console.log(err);
					} else {
						res.render("index", {title: 'Registeration Complete', errors: ""});
					}
				});
			});
		}
});

app.listen(3000, function() {
	console.log("Server has started")
});
