var Joi = require('joi');

module.exports = {
    corp_id: Joi.string(),
    corp_name: Joi.string(),
    title: Joi.string(),
    first_name: Joi.string(),
    middle_name: Joi.string(),
    last_name: Joi.string()
}
