var config = require('./config.json');
var models = require('./models');

var es = require('elasticsearch');
var db = new es.Client(config.elasticSearch);
var Q = require('q');

module.exports = [
    { method: 'GET', path: '/businesses', handler: getBusinesses, config: {validate: {query: models.businesses}}},
    { method: 'GET', path: '/amendments', handler: getAmendments, config: {validate: {query: models.amendments}}},
    { method: 'GET', path: '/mergers', handler: getMergers, config: {validate: {query: models.mergers}}},
    { method: 'GET', path: '/officers', handler: getOfficers, config: {validate: {query: models.officers}}}
];

function getBusinesses(request, reply) {
    var data = {results: 0, businesses: []};
    buildSearch(request.query,'2,3,6,8,9',models.businesses)
        .then(function(res) {
            data.businesses = res.matches;
            data.results = res.hits;
            var addtlData = [];
            for (var i = 0; i < res.matches.length; i++) {
                var query = {id: res.matches[i].id.toString()};
                addtlData.push(
                    buildSearch(query, '4', models.amendments),
                    buildSearch(query, '7', models.mergers),
                    buildSearch(query, '5', models.officers)
                );
            }
            return Q.all(addtlData);
        })
        .then(function(res) {
            console.log(res);
                for (var i = 0; i < data.length; i++) {
                    data.businesses[i].amendments = res[i * 3].matches;
                    data.businesses[i].mergers = res[i * 3 + 1].matches;
                    data.businesses[i].officers = res[i * 3 + 2].matches;
                }
                return data;
        })
        .done(function(data) {
            reply(data);
        })
}

function getAmendments(request, reply) {
    var data = {results: 0, amendments: []};
    buildSearch(request.query,'4',models.amendments)
        .then(function(res) {
            data.amendments = res.matches;
            data.results = res.hits;
            var addtlData = [];
            for (var i = 0; i < res.matches.length; i++) {
                var query = {id: res.matches[i].id.toString()};
                addtlData.push(buildSearch(query, '2,3,6,8,9', models.businesses));
            }
            return Q.all(addtlData);
        })
        .then(function(res) {
            for (var i = 0; i < data.amendments.length; i++) {
                if(res[i].matches.length > 0) {
                    data.amendments[i].name = res[i].matches[0].name;
                }
            }
            return data;
        })
        .done(function(data) {reply(data);});
}


function getMergers(request, reply) {
        var data = {};
        buildSearch(request.query,'7',models.mergers)
            .then(function(res) {
                data = res;
                var addtlData = [];
                for (var i = 0; i < res.length; i++) {
                    var query = {id: res[i].id.toString()};
                    var surv_query = {id: res[i].survivor_id.toString()};
                    addtlData.push(buildSearch(query, '2,3,6,8,9', models.businesses));
                    addtlData.push(buildSearch(surv_query, '2,3,6,8,9', models.businesses));
                }
                return Q.all(addtlData);
            })
            .then(function(res) {
                for (var i = 0; i < data.length; i++) {
                    if(res[i * 2].length > 0) {
                        data[i].name = res[i * 2][0].name;
                    }
                    if(res[i * 2 + 1].length > 0) {
                        data[i].survivor_name = res[i * 2 + 1][0].name;
                    }
                }
                return data;
            })
            .done(function(data) {reply(data);});
}

//@todo this is still broken
function getOfficers(request, reply) {
        var data = {};
        buildSearch(request.query,'5',models.officers)
            .then(function(res) {
                data = res;
                var addtlData = [];
                for (var i = 0; i < res.length; i++) {
                    var query = {id: res[i].id.toString()};
                    addtlData.push(buildSearch(query, '2,3,6,8,9', models.businesses));
                }
                return Q.all(addtlData);
            })
            .then(function(res) {
                for (var i = 0; i < data.length; i++) {
                    if(res[i].length > 0) {
                        data[i].business_name = res[i][0].name;
                    }
                }
                return data;
            })
            .done(function(data) {reply(data);});
}

//@todo move build search to own class and test
function buildSearch(query, type, model) {
    var notAddedToQuery = ['coordinates', 'dist', 'start', 'limit'];
    var query_params = [];
    var search_query = {};
    var matches = [];
    var deferred = Q.defer();

    for (var k in query) {
        if (notAddedToQuery.indexOf(k) === -1) {
            var term = {};
            term[k] = query[k];
            query_params.push({match: term});
        }
    }

    search_query.index = 'business';
    search_query.from = query.start || 0;
    search_query.size = query.limit || 10;
    search_query.type = type;
    search_query.body = {};

    if ('coordinates' in query) {
        search_query.body.query = {};
        search_query.body.query.filtered = {};
        search_query.body.query.filtered.filter = {};
        search_query.body.query.filtered.filter.geo_distance = {
            distance: query['dist'].toString() + 'm',
            coordinates: [query['coordinates'][0], query['coordinates'][1]]
        };
        if (query_params.length > 0) {
            search_query.body.query.filtered.query = {bool: {must: query_params}};
        }
    } else {
        search_query.body.query = {bool: {must: query_params}};
    }

    db.search(search_query).then(function(body) {
        var hits = body.hits.hits;
        for (var i = 0; i < hits.length; i++) {
            matches[i] = {};
            for (var k in model["_inner"]["children"]) {
                var key = model["_inner"].children[k].key;
                if (hits[i]["_source"].hasOwnProperty(key)) {
                    matches[i][key] = hits[i]["_source"][key];
                }
            }
        }
        var response = {hits: body.hits.total, matches: matches};
        deferred.resolve(response);
    }, function (err) {
        deferred.reject(err);
        console.trace(err.message);
    });
    return deferred.promise;
}

