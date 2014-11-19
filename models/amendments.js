var Joi = require('joi');

module.exports = {
    corp_id: Joi.string(),
    corp_name: Joi.string(),
    amendment_type: Joi.string(),
    shares_auth: Joi.string(),
    stock_class: Joi.string(),
    stock_info: Joi.string()
}