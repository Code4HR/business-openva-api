var Joi = require('joi');

module.exports = Joi.object().keys({
    id: Joi.string(),
    amendment_type: Joi.string(),
    date: Joi.date(),
    shares_auth: Joi.string(),
    stock_class: Joi.string(),
    stock_info: Joi.string()
});