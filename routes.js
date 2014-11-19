var config = require('./config.json');
var models = require('./models');

var es = require('elasticsearch');
var db = new es.Client(config.elasticSearch);

module.exports = [
    { method: 'GET', path: '/businesses', handler: getBusinesses, config: {validate: {query: models.businesses}}},
    { method: 'GET', path: '/amendments', handler: getAmendments, config: {validate: {query: models.amendments}}},
    { method: 'GET', path: '/mergers', handler: getMergers, config: {validate: {query: models.mergers}}},
    { method: 'GET', path: '/officers', handler: getOfficers, config: {validate: {query: models.officers}}}
];

function getBusinesses(request, reply) {
    var search_terms = buildSearch(request.query);

    db.search({
        index: 'business',
        type: '2,3,6,8,9',
        body: {
            query: {
                bool: {
                    must: search_terms
                }
            }
        }
    }).then(function (resp) {
        var hits = resp.hits.hits;
        var matches = [];
        for(var i = 0; i < hits.length; i++)
        {
            matches[i] = {};
            matches[i].name = hits[i]["_source"]["name"];
            matches[i].city = hits[i]["_source"]["city"];
        }
        reply(matches);
    }, function (err) {
        console.trace(err.message);
    });
}

function getAmendments(request, reply) {

}

function getMergers(request, reply) {

}

function getOfficers(request, reply) {

}

function buildSearch(query) {
    var search_terms = [];

    for (var k in query) {
        var term = {};
        term[k] = query[k];
        search_terms.push({match: term});
    }

    return search_terms;
}