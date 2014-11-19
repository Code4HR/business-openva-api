var Joi = require('joi');

function CorporateModel() {
    this.schema = {
        type: 2,
        address_date: Joi.date(),
        agent_city: Joi.string(),
        agent_court_locality: Joi.string(),
        agent_date: Joi.date(),
        agent_name: Joi.string(),
        agent_state: Joi.string(),
        agent_status: Joi.string(),
        agent_street_1: Joi.string(),
        agent_street_2: Joi.string(),
        agent_zip: Joi.string(),
        assessment: Joi.string(),
        city: Joi.string(),
        coordinates: Joi.array().includes(Joi.number()).min(2).max(2),
        expiration_date: Joi.date(),
        foreign: Joi.string(),
        id: Joi.string(),
        incorporation_date: Joi.date(),
        industry: Joi.string(),
        location: Joi.string(),
        merged: Joi.string(),
        name: Joi.string(),
        number_shares: Joi.number().precision(0),
        state: Joi.string(),
        state_formed: Joi.string(),
        status: Joi.string(),
        status_date: Joi.date(),
        stock_class: Joi.string(),
        stock_ind: Joi.string(),
        street_1: Joi.string(),
        street_2: Joi.string(),
        total_shares: Joi.number().precision(0),
        zip: Joi.string()
    };
};

module.exports = CorporateModel;