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
var _port = "1003";
var _LastFmAPILocation = 'http://ws.audioscrobbler.com';

// init requirements:
var Async   = require('async');
var Winston = require("./node_logging/logger.js")("madsonic-lastfmservice");

// INIT Restify
var Restify = require('restify');

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

	server.listen(_port, serverUpHandler);

	Winston.info("Server listening through port " + _port + ".");
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
	Winston.log('info', 'Restify server up and running on port ' + _port);
};


// ================== //
// HANDLER FUNCTIONS: //
// ================== //

var getArtistTopTracks = function(request, response, next)
{
	var options = JSON.parse(JSON.stringify(_httpOptions));
	options.url = _LastFmAPILocation;
	var client = Restify.createJSONClient(options);

	var period = "7day";

	var endpoint = '/2.0/?method=artist.gettoptracks&artist=' + encodeURIComponent(request.params.artist) + '&api_key=166f46e12c8bc6a6763777ceb39f8d5e&format=json&limit=' + request.params.limit + "&period=" + period;

	Winston.info("Calling API with url: " + endpoint);
	client.get(endpoint, function(err, req, resp, object)
	{
		response.send(object.toptracks.track);
	});

	next();
};

init();