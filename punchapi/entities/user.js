const mongoose = require('mongoose');
const uuid = require('uuid-js');

const UserSchema = new mongoose.Schema({

	name: { 
		type: String,
		required: true
	},
	gender: {
		type: String,
		required: true
	},
	token: { 
		type: String,
		default: uuid.create(1) 
	}
});

const user = mongoose.model("user", UserSchema);
module.exports.User = user;


module.exports.getUsers = function(callback) {
	user.find(callback);
}

module.exports.addUser = function(newUser, callback) {
	user.create(newUser, callback);
}

module.exports.getUserByToken = function(userToken, callback) {
	user.findOne({ token: userToken }, callback);
}

