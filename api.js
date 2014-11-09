var config = require('./config.json');

var Hapi = require('hapi');
var server = new Hapi.Server(config.port);

server.pack.register([{
	plugin: require('elasticsearch-hapi-plugin'),
	options: {
		host: "http://" + config.elasticSearch.host + ":" + config.elasticSearch.port
	}}, {
	plugin: require('hapi-route-directory'),
	options: {path: '/'}
	}
],
function (err) {
	if (err) {
		console.error('Failed to load plugin: ', err);
	}
});

var es = server.plugins['elasticsearch-hapi-plugin'].es;

server.route({
	method: 'GET',
	path: '/corporate/{name}',
	handler: function (request, reply) {

		es.search({
			index: 'business',
			type: "2",
			body: {
				query: {
					match: {
						name: request.params.name
					}
				}
			}
		}).then (function (resp) {
			var response = [];
			for (i = 0; i < resp.hits.hits.length; i++) {
				response.push({name: resp.hits.hits[i]._source.name,
					address: resp.hits.hits[i]._source.street_1,
					city: resp.hits.hits[i]._source.city,
					zip: resp.hits.hits[i]._source.zip,
					industry: resp.hits.hits[i]._source.industry,
					incorporation_date: resp.hits.hits[i]._source.incorporation_date
				});
			}
			reply(response);
		}, function (err) {
			console.trace(err.message);
		});
	}
});

server.route({
	method: 'GET',
	path: '/lp/',
	handler: function (request, reply) {
		reply('LP!');
	}
});

server.route({
	method: 'GET',
	path: '/amendments/',
	handler: function (request, reply) {
		reply('Amendments/!');
	}
});

server.route({
	method: 'GET',
	path: '/officers/',
	handler: function (request, reply) {
		reply('Officers!');
	}
});

server.route({
	method: 'GET',
	path: '/name/',
	handler: function (request, reply) {
		reply('Name!');
	}
});

server.route({
	method: 'GET',
	path: '/merger/',
	handler: function (request, reply) {
		reply('Merger!');
	}
});

server.route({
	method: 'GET',
	path: '/registered_names/',
	handler: function (request, reply) {
		reply('Registered Names!');
	}
});

server.route({
	method: 'GET',
	path: '/llc/',
	handler: function (request, reply) {
		reply('LLC!');
	}
});

server.start(function () {
	console.log('Server running at: ', server.info.uri);
});