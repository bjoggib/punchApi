const joi = require("joi");

module.exports = {
	body: {
		name: joi.string().required(),
		punches: joi.number().integer().min(1).max(50).required()
	}
};