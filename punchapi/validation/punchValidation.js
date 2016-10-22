const joi = require("joi");

module.exports = {
	body: {
		company_id: joi.string().required()
	}
};