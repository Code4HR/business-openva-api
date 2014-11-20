var Joi = require('joi');

module.exports = {
    id: Joi.string(),
    title: Joi.string(),
    first_name: Joi.string(),
    middle_name: Joi.string(),
    last_name: Joi.string()
}
