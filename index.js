var init = function()
{
	// startup Restify server
	var server = Restify.createServer({'name': 'madsonic-lastfmservice'});
	server.use(Restify.fullResponse());
	server.use(Restify.bodyParser());
	server.use(Restify.queryParser());

	server.on("uncaughtException", onUncaughtException);
	server.use(mainHandler);

	server.get("/artist/toptracks", getArtistTopTracks);

	server.listen(config.port, serverUpHandler);
}

var mainHandler = function(request, result, next)
{
	// recreate url
	Winston.verbose(request.method + ": " + request.url);
	next();
};

var onUncaughtException = function(request, response, route, err)
{
	Winston.error("Uncaught Exception:\n", err);
	response.send(err); // Resume default behaviour.
}

var serverUpHandler = function()
{
	Winston.log('info', 'Restify server up and running on port ' + config.port);
};


// ================== //
// HANDLER FUNCTIONS: //
// ================== //

var getArtistTopTracks = function(request, response, next)
{
	var options = JSON.parse(JSON.stringify(_httpOptions));
	options.url = config.api.lastfm.location;
	var client = Restify.createJSONClient(options);

	var period = "7day";

	var endpoint = '/2.0/?method=artist.gettoptracks&artist=' + encodeURIComponent(request.params.artist)
					+ '&api_key=' + config.api.lastfm.key
					+ '&format=json&limit=' + request.params.limit
					+ "&period=" + period;

	Winston.info("Calling API with url: " + endpoint);
	client.get(endpoint, function(err, req, resp, object)
	{
		response.send(object.toptracks.track);
	});

	next();
};

// init requirements:
var Winston = require("./node_logging/logger.js")("madsonic-lastfmservice");
var Restify = require('restify');

// config
var config = require('./config.json');
Winston.info("Started with the followng config:\n", JSON.stringify(config));

// init vars
var _httpOptions = {
	headers: {
		"Content-Type": "application/json"
	},
	retry: {
	'retries': 0
	},
	agent: false
};

init();