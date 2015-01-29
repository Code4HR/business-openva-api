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
    var data = {};
    buildSearch(request.query,'2,3,6,8,9',models.businesses)
        .then(function(res) {
            data = res;
            var addtlData = [];
            for (var i = 0; i < res.length; i++) {
                var query = {id: res[i].id.toString()};
                addtlData.push(
                    buildSearch(query, '4', models.amendments),
                    buildSearch(query, '7', models.mergers),
                    buildSearch(query, '5', models.officers)
                );
            }
            return Q.all(addtlData);
        })
        .then(function(res) {
                for (var i = 0; i < data.length; i++) {
                    data[i].amendments = res[i * 3];
                    data[i].mergers = res[i * 3 + 1];
                    data[i].officers = res[i * 3 + 2];
                }
                return data;
        })
        .done(function(data) {reply(data);})
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

function buildSearch(query, type, model) {
    var query_params = [];
    var search_query = {};
    var matches = [];
    var deferred = Q.defer();

    for (var k in query) {
        if (!(k === 'coordinates'|| k === 'dist')) {
            var term = {};
            term[k] = query[k];
            query_params.push({match: term});
        }
    }

    search_query.index = 'business';
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
        deferred.resolve(matches);
    }, function (err) {
        deferred.reject(err);
        console.trace(err.message);
    });
    return deferred.promise;
}