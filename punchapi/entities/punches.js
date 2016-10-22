var mongoose = require('mongoose');

const PunchesSchema = new mongoose.Schema({
	created: {
		type: Date,
		default: Date.now
	},
	company_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "companies"
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "users",
	},
	used: {
		type: Boolean,
		default: false
	}
});

const punches = mongoose.model("punch", PunchesSchema);
module.exports.Punches = punches;


module.exports.addPunch = function(newPunch, callback) {
	punches.create(newPunch, callback);
}

module.exports.countPunchesForUser = function(ob, callback) {
    punches.find({ user_id: ob.user_id, company_id: ob.company_id, used: ob.used }, callback);
}

module.exports.update = function(data, callback) {
	punches.update({"_id": {'$in': data.map(p => p._id) }}, { used: true }, { multi: true }, function(err, doc) {
		if (err) {
			console.log(err);
		}
	});
}

