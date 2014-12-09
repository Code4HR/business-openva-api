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
    buildSearch(request.query,'2,3,6,8,9',models.businesses, function(resp) {
        reply(resp);
    });
}

function getAmendments(request, reply) {
    buildSearch(request.query,'4',models.amendments, function(resp) {
        reply(resp);
    });
}

function getMergers(request, reply) {
    buildSearch(request.query,'7',models.mergers, function(resp) {
        reply(resp);
    });
}

function getOfficers(request, reply) {
    buildSearch(request.query,'5',models.officers, function(resp) {
        reply(resp);
    });
}

function buildSearch(query,type,model, callback) {
    var query_params = [];
    var filters = [];
    var search_query = {};
    var matches = [];

    for (var k in query) {
        var term = {};
        term[k] = query[k];
        if (k == "id") {
            filters.push({exists: term});
        } else {
            query_params.push({match: term});
        }
    }

    search_query.index = 'business';
    search_query.type = type;
    search_query.body = {};
    if (query_params.length > 0) {
        search_query.body.query = {bool: {must: query_params}};
    }
    if (filters.length > 0) {
        search_query.body.filters = filters;
    }

    db.search(search_query).then(function(body) {
        var hits = body.hits.hits;
        for (var i = 0; i < hits.length; i++) {
            matches[i] = {};
            for (var k in model) {
                if (hits[i]["_source"].hasOwnProperty(k)) {
                    matches[i][k] = hits[i]["_source"][k];
                }
            }
        }
        callback(matches);
    }, function (err) {
        console.trace(err.message);
    }).then();
}