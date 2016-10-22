const joi = require("joi");

module.exports = {
	body: {
		name: joi.string().required(),
		gender: joi.string().regex(/[mfoMFO]/)
	}
};