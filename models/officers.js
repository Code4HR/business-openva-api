var Joi = require('joi');

module.exports = Joi.object().keys({
    id: Joi.string(),
    title: Joi.string(),
    first_name: Joi.string(),
    middle_name: Joi.string(),
    last_name: Joi.string()
});
