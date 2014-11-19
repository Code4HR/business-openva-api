var config = require('./config.json');

var es = require('elasticsearch');
var db = new es.Client(config.elasticSearch);

module.exports = [
    { method: 'GET', path: '/businesses', handler: getBusinesses},
    { method: 'GET', path: '/amendments', handler: getAmendments},
    { method: 'GET', path: '/mergers', handler: getMergers}
];

function getBusinesses(request, reply) {
    var search_terms = [];

    for (var k in request.query) {
        var term = {};
        term[k] = request.query[k];
        search_terms.push({match: term});
    }

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

function getAmendments(request) {

}

function getMergers(request) {

}

