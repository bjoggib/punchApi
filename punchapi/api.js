
const express = require("express");
const validate = require("express-validation");
const myDb = "localhost/app";
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const amqp = require('amqplib/callback_api');

//create admin token
const adminToken = "batman";
const router = express.Router();

const Company = require("./entities/company.js");
const User = require("./entities/user.js");
const Punches = require("./entities/punches.js");
const Validation = require("./validation");

router.use(bodyParser.json());


router.get("/companies", function (req, res) {
	Company.getCompanies(function (err, companies) {
		if (err) {
			return res.status(404).send({"err": "not found"});
		}
		var companyList = [];
		for (var i = 0; i < companies.length; i++) {
			var comp = {
				name: companies[i].name,
				punches: companies[i].punches
			};
			companyList.push(comp);
		}
		return res.json(companyList);
	})
});

router.get("/companies/:id", function (req, res) {
	Company.getCompanyById(req.params.id, function (err, company) {
		if (err) {
			return res.status(404).send({ "err":"no company with the given id could be found" });
		}
		var returnObject = {
			name: company.name,
			punches: company.punches
		};
		return res.json(returnObject);
	})
});

router.post("/companies", validate(Validation.companyValidation), function (req, res) {
	var userToken = req.headers.authorization;
	if (userToken !== adminToken) {
		return res.status(401).send({ "err": "not authorized" });
	}
	var newCompany = req.body;
	Company.addCompany(newCompany, function (err, users) {
		if (err) {
			return res.status(404).send({ "err": "not found" });
		}
		console.log(users);
		return res.status(201).json(newCompany);
	});
});

router.get("/users", function (req, res) {
	User.getUsers(function (err, users) {
		if (err) {
			return res.status(404).json( {"err": "not found"} );
		}
		var userList = [];
		for (var i = 0; i < users.length; i++) {
			var tempUser = {
				name: users[i].name,
				gender: users[i].gender,

			};
			userList.push(tempUser);
		}
		return res.json(userList);
	})
});


router.post("/users", validate(Validation.userValidation), function (req, res) {

	var userToken = req.headers.authorization;

	if (userToken !== adminToken) {
		return res.status(401).json( {"err": "not authorized"} );
	}
	var newUser = req.body;
	User.addUser(newUser, function (err, users) {
		if (err) {
			return res.status(404).json(err);
		}
		amqp.connect('amqp://localhost', function(err, conn) {
			conn.createChannel(function(err, ch) {

		    	var ex = 'punchcardApi';
		    	var key = 'user.add';
		    	var msg = "Name: " + users.name + " Gender: " + users.gender +
										" ID: " + users._id + " Date: " + Date.now();

		    	ch.assertExchange(ex, 'topic', {durable: false});
		    	ch.publish(ex, key, new Buffer(msg));
		    	console.log(msg);
		    });

		  	setTimeout(function() { conn.close(); }, 500);
		});
		return res.status(201).json(users.token);
	});

});


router.post("/my/punches", validate(Validation.punchValidation), function (req, res) {

	var userToken = req.headers.authorization;
	console.log("usertoken: " + userToken);
	var currentUserId;
	var companyId = req.body.company_id;

	User.getUserByToken(userToken, function (err, user) {
		if (err || user == null || user.length === 0) {
			return res.status(401).json({"err": "no user with the given token found"});
		}
		currentUserId = user._id;
		Company.getCompanyById(companyId, function (err, company) {
			if (err) {
				return res.status(404).json({ "err": "no company with the given id found" });
			}
			var newPunch = {
				company_id: companyId,
				user_id: currentUserId
			};

			Punches.addPunch(newPunch, function (err, punch) {
				if (err) {
					return res.status(404).json({ "err": "not found" });
				}
				Punches.countPunchesForUser({ user_id: currentUserId, company_id: companyId, used: false }, function (err, punches) {
					if (err) {
						console.log(err);
						return;
					}
					if(punches.length === company.punches) {
						Punches.update(punches);
						return res.send({ discount: true });
					}

					amqp.connect('amqp://localhost', function(err, conn) {
							conn.createChannel(function(err, ch) {

						    	var ex = 'punchcardApi';
						    	var key = 'punch.add';
						    	var msg = "Name: " + user.name + " Gender: " + " ID: " + user._id + " Company name: " +
													company.name + " Company ID: " + company._id + " Company punchcount: " + company.punches +
													" Date of punch: " + Date.now() + " Unused punches: " + (company.punches - punches.length);

						    	ch.assertExchange(ex, 'topic', {durable: false});
						    	ch.publish(ex, key, new Buffer(msg));
						    	console.log(msg);
						  });

						  setTimeout(function() { conn.close(); }, 500);
					});
					return res.status(201).json({ "punch_id": punch._id });
				});
			});
		});
	});
});

module.exports = router;
