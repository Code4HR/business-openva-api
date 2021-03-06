var config = require('./config.json');

var Hapi = require('hapi');
var server = new Hapi.Server(config.host, config.port);

var routes = require('./routes');

server.pack.register([
	{plugin: require('lout'),
	 options: {
		 basePath: './templates',
         cssPath: './templates/css'
	 }},
	{plugin: require('hapi-route-directory')}
],
function (err) {
	if (err) {
		console.error('Failed to load plugin: ', err);
	}
});

server.route(routes);

server.start(function () {
	console.log('Server running at: ', server.info.uri);
    server.log
});