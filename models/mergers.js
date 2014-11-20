var Joi = require('joi');

module.exports = {
    id: Joi.string(),
    type: Joi.string(),
    date: Joi.date(),
    survivor_id: Joi.string(),
    survivor_qualified: Joi.boolean(),
    unqualified_name: Joi.string()
}
