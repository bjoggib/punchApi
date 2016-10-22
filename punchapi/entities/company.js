var mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
	
	name: { 
		type: String,
		required: true
	},
	punches: { 
		type: Number,
		default: 10
	}
});

const company = mongoose.model("company", CompanySchema);
module.exports.Company = company;

module.exports.getCompanies = function(callback) {
	company.find(callback);
}

module.exports.getCompanyById = function(companyId, callback) {
	company.findById(companyId, callback);
}

module.exports.addCompany = function(newCompany, callback) {
	company.create(newCompany, callback);
}

